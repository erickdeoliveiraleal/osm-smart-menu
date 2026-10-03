<script lang="ts">
  import type { EventualSitesOrError } from "./main";
  import type { SiteLink } from "./sites-manipulation-helper";
  import browser from "webextension-polyfill";
  import { KnownError } from "./utils";
  import ContextHeader from "./components/ContextHeader.svelte";
  import Icon from "./components/Icon.svelte";
  import InfoBox from "./components/InfoBox.svelte";
  import BasicLinkCreationDialog from "./components/BasicLinkCreationDialog.svelte";
  import LinkList from "./components/LinkList.svelte";
  import ErrorMessage from "./components/ErrorMessage.svelte";
  import ShowEnabledLinksButton from "./components/ShowEnabledLinksButton.svelte";

  interface Props {
    eventualSitesOrError: EventualSitesOrError;
  }

  let { eventualSitesOrError }: Props = $props();

  let query = $state("");
  let otherLinks: SiteLink[] = $state([]);
  const searchPlaceholder = browser.i18n.getMessage("popup_searchPlaceholder");
</script>

<style>
  .loading::first-line {
    font-weight: bold;
  }
  .search {
    position: relative;
    display: flex;
    align-items: center;
    margin: 8px 12px 2px;
    color: var(--text-secondary);
  }
  .search :global(span) {
    position: absolute;
    inset-inline-start: 9px;
  }
  input {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    padding-inline: 30px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font: inherit;
  }
  input:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  main {
    padding-bottom: 4px;
  }
</style>

{#await eventualSitesOrError}
  <ContextHeader />
  <InfoBox>
    <div class="loading">{browser.i18n.getMessage('loading')}</div>
  </InfoBox>
{:then sitesListOrError}
  {#if 'sitesList' in sitesListOrError}
    <ContextHeader attributes={sitesListOrError.extractedParameters} sourceHost={sitesListOrError.sourceHost} />
    <BasicLinkCreationDialog customUserOption={sitesListOrError.customUserOption} />
    <div class="search">
      <Icon name="search" size={15} />
      <!-- svelte-ignore a11y_autofocus -->
      <input type="search" bind:value={query} placeholder={searchPlaceholder} aria-label={searchPlaceholder} autofocus />
    </div>
    <main>
      <LinkList siteLinks={[...sitesListOrError.sitesList, ...otherLinks]} {query} />
      <ShowEnabledLinksButton
        config={sitesListOrError.config}
        currentSiteId={sitesListOrError.currentSiteId}
        currentlyShownLinks={sitesListOrError.sitesList}
        extractedParameters={sitesListOrError.extractedParameters}
        onshow={(links) => (otherLinks = links)} />
    </main>
  {:else}
    <ContextHeader />
    <ErrorMessage error={sitesListOrError.error} />
    {#if sitesListOrError.error === KnownError.INCOMPATIBLE_WEBSITE || sitesListOrError.error === KnownError.NO_INFORMATION_EXTRACTED}
      {#if otherLinks.length > 0}
        <LinkList siteLinks={otherLinks} />
      {/if}
      <ShowEnabledLinksButton config={sitesListOrError.config} onshow={(links) => (otherLinks = links)} />
    {/if}
  {/if}
{:catch}
  <!-- without this, any unexpected error would leave the popup on "Loading" forever -->
  <ContextHeader />
  <ErrorMessage error={KnownError.NO_ACCESS} />
{/await}
