<script module lang="ts">
  import { Sites, siteCategories } from "../../sites-configuration";
  import { normalize } from "../../text";
  import type { SiteCategory } from "../../sites-configuration";

  type Category = SiteCategory | "custom";
  const categories: Category[] = [...siteCategories, "custom"];

  export const categoryIcons: Record<Category, string> = {
    edit: "pencil",
    general: "map",
    thematic: "stack-2",
    imagery: "satellite",
    history: "history",
    quality: "shield-check",
    tools: "tool",
    custom: "link",
  };

  export function getCategory(siteId: string): Category {
    return Sites[siteId]?.category ?? "custom";
  }

</script>

<script lang="ts">
  import type { SiteLink } from "../sites-manipulation-helper";
  import browser from "webextension-polyfill";
  import { openLink } from "../utils";
  import Icon from "./Icon.svelte";
  import InfoBox from "./InfoBox.svelte";

  interface Props {
    siteLinks: SiteLink[];
    query?: string;
  }

  let { siteLinks, query = "" }: Props = $props();

  const items = $derived(siteLinks.map((site) => ({
    site,
    name: site.customName || browser.i18n.getMessage(`site_${site.id}`) || "???",
    description: Sites[site.id] ? browser.i18n.getMessage(`description_${site.id}`) : "",
    category: getCategory(site.id),
  })).map((item) => ({
    ...item,
    searchText: normalize(`${item.name} ${item.description} ${browser.i18n.getMessage(`category_${item.category}`)}`),
  })));
  const filtered = $derived(query.trim()
    ? items.filter((item) => item.searchText.includes(normalize(query.trim())))
    : items);
  const groups = $derived(categories
    .map((category) => ({ category, items: filtered.filter((item) => item.category === category) }))
    .filter((group) => group.items.length > 0));
</script>

<style>
  h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 10px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-secondary);
  }
  a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    color: inherit;
    text-decoration: none;
  }
  a:hover,
  a:focus-visible {
    background: var(--hover);
    outline: none;
  }
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
    background: var(--badge-bg);
    color: var(--badge-fg);
  }
  .text {
    min-width: 0;
  }
  .name {
    line-height: 1.3;
  }
  .description {
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.3;
  }
</style>

{#each groups as group (group.category)}
  <section class="category-{group.category}">
    <h2><Icon name={categoryIcons[group.category]} size={13} />{browser.i18n.getMessage(`category_${group.category}`)}</h2>
    {#each group.items as item (item.site.id)}
      <a id={item.site.id} href={item.site.url} title={item.site.url} onclick={(e) => { e.preventDefault(); openLink(item.site.url); }}>
        <span class="badge"><Icon name={categoryIcons[group.category]} size={16} /></span>
        <span class="text">
          <span class="name">{item.name}</span>
          {#if item.description}<div class="description">{item.description}</div>{/if}
        </span>
      </a>
    {/each}
  </section>
{:else}
  <InfoBox>{browser.i18n.getMessage(siteLinks.length > 0 ? 'popup_noSearchResults' : 'noEnabledCompatibleLinksFound')}</InfoBox>
{/each}
