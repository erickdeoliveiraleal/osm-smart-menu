<script module lang="ts">
  import { Sites, siteCategories } from "../../sites-configuration";
  import { normalize } from "../../text";
  import type { SiteCategory } from "../../sites-configuration";

  type Category = SiteCategory | "custom";
  // the user's own links first: they are usually the ones used most
  const categories: Category[] = ["custom", ...siteCategories];

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
  import { openLink, sendRemoteControlCommand } from "../utils";
  import Icon from "./Icon.svelte";
  import InfoBox from "./InfoBox.svelte";

  interface Props {
    siteLinks: SiteLink[];
    query?: string;
    // false: one list in the order of the settings page, without category headings
    grouped?: boolean;
  }

  let { siteLinks, query = "", grouped = true }: Props = $props();

  let unreachable: string | undefined = $state(); // id of the remote control link that got no answer

  // a name that doesn't fit in one column takes both, instead of being cut
  function widenIfLong(link: HTMLElement) {
    const check = () => {
      if (link.scrollWidth > link.clientWidth) link.classList.add("wide");
    };
    check();
    requestAnimationFrame(check); // again once laid out, in case the popup didn't have its width yet
  }

  async function sendCommand(siteId: string, url: string) {
    unreachable = undefined;
    if (!(await sendRemoteControlCommand(url))) unreachable = siteId;
  }

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
  const groups = $derived((grouped
    ? categories.map((category) => ({ category: category as Category | undefined, items: filtered.filter((item) => item.category === category) }))
    : [{ category: undefined, items: filtered }])
    .filter((group) => group.items.length > 0));
</script>

<style>
  h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 10px 12px 2px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-secondary);
  }
  .links {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0 4px;
    padding: 0 6px;
  }
  /* in categories, a short link may move up into the gap left by a long name; in the user's order, it may not */
  .grouped .links {
    grid-auto-flow: dense;
  }
  a {
    padding: 5px 6px;
    border-radius: 5px;
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  a:global(.wide),
  .warning {
    grid-column: 1 / -1;
  }
  a:hover,
  a:focus-visible {
    background: var(--hover);
    outline: none;
  }
  .warning {
    margin: 0 6px 6px;
    font-size: 12px;
    color: var(--text-secondary);
  }
</style>

{#each groups as group (group.category ?? "all")}
  <section class="category-{group.category ?? 'all'}" class:grouped>
    {#if group.category}
      <h2><Icon name={categoryIcons[group.category]} size={13} />{browser.i18n.getMessage(`category_${group.category}`)}</h2>
    {/if}
    <div class="links">
      {#each group.items as item (item.site.id)}
        <a id={item.site.id} href={item.site.url} use:widenIfLong
          title={[item.description, item.site.url].filter(Boolean).join("\n")}
          onclick={(e) => {
            e.preventDefault();
            if (Sites[item.site.id]?.remoteControl) sendCommand(item.site.id, item.site.url);
            else openLink(item.site.url);
          }}>{item.name}</a>
        {#if unreachable === item.site.id}
          <p class="warning" role="alert">{browser.i18n.getMessage("remoteControl_noAnswer", item.name)}</p>
        {/if}
      {/each}
    </div>
  </section>
{:else}
  <InfoBox>{browser.i18n.getMessage(siteLinks.length > 0 ? 'popup_noSearchResults' : 'noEnabledCompatibleLinksFound')}</InfoBox>
{/each}
