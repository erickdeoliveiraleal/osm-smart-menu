<script lang="ts">
  import browser from "webextension-polyfill";
  import type { OsmAttribute } from "../../sites-configuration";
  import Icon from "./Icon.svelte";

  interface Props {
    // what was detected on the current page; omitted when nothing was detected
    attributes?: Partial<Record<OsmAttribute, string>>;
    sourceHost?: string;
  }

  let { attributes, sourceHost }: Props = $props();

  function round(value: string, decimals: number): string {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(decimals) : value;
  }

  function describe(a: Partial<Record<OsmAttribute, string>>): string | undefined {
    if (a.nodeId) return browser.i18n.getMessage("attribute_node", a.nodeId);
    if (a.wayId) return browser.i18n.getMessage("attribute_way", a.wayId);
    if (a.relationId) return browser.i18n.getMessage("attribute_relation", a.relationId);
    if (a.changesetId) return browser.i18n.getMessage("attribute_changeset", a.changesetId);
    if (a.userName) return browser.i18n.getMessage("attribute_user", a.userName);
    if (a.key) return browser.i18n.getMessage("attribute_tag", a.value ? `${a.key}=${a.value}` : a.key);
    return undefined;
  }

  const coordinates = $derived(
    attributes?.lat && attributes?.lon
      ? `${round(attributes.lat, 4)}, ${round(attributes.lon, 4)}` + (attributes.zoom ? ` · zoom ${round(attributes.zoom, 0)}` : "")
      : undefined
  );
  const element = $derived(attributes ? describe(attributes) : undefined);
  const title = $derived(element ?? coordinates);
  const subtitle = $derived(element && coordinates ? coordinates : undefined);
  const settingsLabel = browser.i18n.getMessage("popup_settings");
</script>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
  }
  .pin {
    color: var(--accent);
  }
  .text {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .detail {
    color: var(--text-secondary);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  button {
    display: flex;
    padding: 4px;
    margin-inline-start: auto;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
  }
  button:hover {
    background: var(--hover);
    color: var(--text);
  }
</style>

<header>
  {#if title}
    <span class="pin"><Icon name="map-pin" size={20} /></span>
    <div class="text">
      <div class="title">{title}</div>
      {#if subtitle}<div class="detail">{subtitle}</div>{/if}
      {#if sourceHost}<div class="detail">{browser.i18n.getMessage("popup_detectedOn", sourceHost)}</div>{/if}
    </div>
  {/if}
  <button type="button" title={settingsLabel} aria-label={settingsLabel} onclick={() => browser.runtime.openOptionsPage()}>
    <Icon name="settings" size={18} />
  </button>
</header>
