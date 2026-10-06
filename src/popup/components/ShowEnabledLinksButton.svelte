<script module lang="ts">
  export function getEnabledLinks(
    config: SiteConfiguration[],
    currentSiteId: string | undefined,
    extractedParameters: Partial<Record<string, string>>,
    restOfEnabledLinks: Set<string>
  ): SiteLink[] {
    const someMapParameters = {
      zoom: extractedParameters["zoom"] || "3",
      lat: extractedParameters["lat"] || "23.00",
      lon: extractedParameters["lon"] || "24.43",
    };
    const enabledMapLinks = getRelevantSites(
      config,
      currentSiteId,
      someMapParameters
    );
    const allParameters: Record<OsmAttribute, string> = {
      ...someMapParameters,
      nodeId: "1",
      wayId: "1",
      relationId: "1",
      changesetId: "1",
      userName: "jgpacker",
      key: "amenity",
      value: "school",
      tracesId: "1",
      viewWidth: "1280",
      viewHeight: "800",
      ...extractedParameters, // overwrite with parameters from current page
    };
    const allEnabledLinks: SiteLink[] = getRelevantSites(
      config,
      currentSiteId,
      allParameters
    );

    allEnabledLinks.forEach((link, linkIndex) => {
      const possibleMapLink = enabledMapLinks.find(
        (mapLink) => mapLink.id === link.id
      );
      if (possibleMapLink) {
        // prioritize the "map versions" of each link
        allEnabledLinks[linkIndex] = possibleMapLink;
      }
    });
    return allEnabledLinks.filter((link) => restOfEnabledLinks.has(link.id));
  }
</script>

<script lang="ts">
  import browser from "webextension-polyfill";
  import { getRelevantSites } from "../sites-manipulation-helper";
  import type { SiteLink } from "../sites-manipulation-helper";
  import type { SiteConfiguration } from "../../storage/config-handler";
  import type { OsmAttribute } from "../../sites-configuration";

  interface Props {
    config: SiteConfiguration[];
    currentSiteId?: string | undefined;
    currentlyShownLinks?: SiteLink[];
    extractedParameters?: Partial<Record<OsmAttribute, string>>;
    // receives the links when the button is clicked, so they're shown together with the others
    onshow: (links: SiteLink[]) => void;
  }

  let {
    config,
    currentSiteId = undefined,
    currentlyShownLinks = [],
    extractedParameters = {},
    onshow
  }: Props = $props();

  let shown = $state(false);

  const restOfEnabledLinks: Set<string> = $derived(new Set(
    config
      .filter((linkConfig) =>
        linkConfig.isEnabled &&
        !linkConfig.defaultConfiguration?.sourceOnly &&
        currentlyShownLinks.every((link) => link.id !== linkConfig.id))
      .map((linkConfig) => linkConfig.id)
  ));
</script>

<style>
  hr {
    margin: 4px 0 0;
    border: none;
    border-top: 1px solid var(--border);
  }
  button {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    color: var(--text-secondary);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  button:hover {
    background: var(--hover);
    color: var(--text);
  }
</style>

{#if restOfEnabledLinks.size > 0 && !shown}
  {#if currentlyShownLinks.length > 0}
    <hr />
  {/if}
  <button
    type="button"
    onclick={() => {
      shown = true;
      onshow(getEnabledLinks(config, currentSiteId, extractedParameters, restOfEnabledLinks));
    }}>
    {browser.i18n.getMessage(currentlyShownLinks.length === 0 ? 'button_showEnabledLinks' : 'button_showOtherEnabledLinks')}
    ({restOfEnabledLinks.size})
  </button>
{/if}
