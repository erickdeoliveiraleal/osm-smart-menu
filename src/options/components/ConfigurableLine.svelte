<script lang="ts">
  import {
    addNewUrlPattern,
    updateStoredConfig,
    getSiteConfiguration,
    deleteUrlPattern,
  } from "../../storage/config-handler";
  import type { SiteConfiguration } from "../../storage/config-handler";
  import { untrack } from "svelte";
  import browser from "webextension-polyfill";
  import { dragHandleClass, getSiteTitle, getSiteDetails, matchesQuery, isValidUrlTemplate } from "../utils";
  import { isLocalAddress } from "../../popup/sites-manipulation-helper";
  interface Props {
    siteConfig: SiteConfiguration;
    currentEditableLinkById: string | undefined;
    query?: string;
  }

  let { siteConfig, currentEditableLinkById = $bindable(), query = "" }: Props = $props();

  // non-matching lines are hidden instead of removed, because the drag-and-drop order is saved from all lines on the page
  const visible = $derived(matchesQuery(siteConfig, query));

  let deleted = $state(false);
  let siteTitle = $state(untrack(() => getSiteTitle(siteConfig))); // initial value of an editable field

  // only links created with a URL template can be edited
  const urlEditable = $derived(siteConfig.customPattern?.tag === "user-v1");
  let siteUrl = $state(untrack(() => siteConfig.customPattern?.url ?? ""));
  let errorMessage = $state("");

  const dragHandleSrc = "/icons/drag_indicator-black.svg"; // from https://fonts.gstatic.com/s/i/materialicons/drag_indicator/v5/24px.svg?download=true
  async function updateTitle() {
    const changes: Partial<SiteConfiguration> = { customName: siteTitle };
    if (urlEditable && siteConfig.customPattern) {
      if (!isValidUrlTemplate(siteUrl)) {
        errorMessage = browser.i18n.getMessage("config_pattern_invalidTemplate");
        return;
      }
      if (siteConfig.remoteControl && !isLocalAddress(siteUrl)) {
        errorMessage = browser.i18n.getMessage("config_pattern_remoteControlLocalOnly");
        return;
      }
      changes.customPattern = { ...siteConfig.customPattern, url: siteUrl };
    }
    errorMessage = "";
    await updateStoredConfig(siteConfig.id, changes);
    const newConfig: SiteConfiguration = await getSiteConfiguration(
      siteConfig.id
    );
    siteConfig = newConfig;
    currentEditableLinkById = undefined;
  }
  async function toggleIsEnabled() {
    await updateStoredConfig(siteConfig.id, {
      isEnabled: !siteConfig.isEnabled,
    });
    const newConfig: SiteConfiguration = await getSiteConfiguration(
      siteConfig.id
    );
    siteConfig = newConfig;
  }
  async function deleteConfig() {
    await deleteUrlPattern(siteConfig.id);
    deleted = true;
  }
  async function restoreDeletedConfig() {
    await addNewUrlPattern(
      getSiteTitle(siteConfig),
      siteConfig.customPattern!,
      siteConfig.isEnabled,
      siteConfig.remoteControl
    );
    // deleted = false; the restored website is added at the top of the list and the site ID changes...
    window.location.reload();
  }
</script>

<style>
  [hidden] {
    display: none !important;
  }
  label {
    display: flex;
    padding: 1px 0 1px;
    align-items: center;
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 2px 0;
  }
  .description {
    font-size: 0.85em;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  img {
    height: 100%;
    touch-action: none;
  }
  input[type="checkbox"] {
    margin-left: 0;
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  input[type="text"],
  input[type="url"] {
    width: 100%;
    box-sizing: border-box;
    margin-right: 2px;
  }
  .error {
    color: #c00;
    font-size: 0.85em;
  }
  @media (prefers-color-scheme: dark) {
    .error {
      color: #ff8a8a;
    }
  }
  button.save,
  button.edit {
    margin-left: auto;
  }
  button.delete {
    margin-left: 2px;
  }
  div.deleted {
    text-align: center;
    background-color: var(--hover);
    border-radius: 2px;
    cursor: pointer;
    padding: 3px;
    margin: 1px 0;
  }
</style>

{#if siteConfig.customPattern || siteConfig.defaultConfiguration}
  {#if !deleted}
    <label hidden={!visible}>
      <img alt="" class={dragHandleClass} src={dragHandleSrc} />
      <input
        type="checkbox"
        name={siteConfig.id}
        checked={siteConfig.isEnabled}
        onclick={toggleIsEnabled} />
      {#if siteConfig.id !== currentEditableLinkById}
        <span class="text">
          {getSiteTitle(siteConfig)}
          <span class="description">{getSiteDetails(siteConfig)}</span>
        </span>
        <button
          class="edit"
          onclick={(e) => { e.preventDefault(); currentEditableLinkById = siteConfig.id; }}>
          {browser.i18n.getMessage('config_editButton')}
        </button>
      {:else}
        <span class="fields">
          <input type="text" bind:value={siteTitle} />
          {#if urlEditable}
            <input type="url" bind:value={siteUrl} oninput={() => (errorMessage = "")} />
          {/if}
          {#if errorMessage}
            <span class="error" role="alert">{errorMessage}</span>
          {/if}
        </span>
        <button class="save" onclick={updateTitle}>
          {browser.i18n.getMessage('config_saveButton')}
        </button>
        {#if siteConfig.customPattern}
          <button class="delete" onclick={deleteConfig}>
            {browser.i18n.getMessage('config_deleteButton')}
          </button>
        {/if}
      {/if}
    </label>
  {:else}
    <div class="deleted" hidden={!visible} role="link" tabindex="0" onclick={restoreDeletedConfig} onkeydown={(e) => e.key === 'Enter' && restoreDeletedConfig()}>
      {browser.i18n.getMessage('config_linkDeleted', getSiteTitle(siteConfig))}
    </div>
  {/if}
{/if}
