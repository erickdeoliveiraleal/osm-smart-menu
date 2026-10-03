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
  import LinkList from "./LinkList.svelte";
  import type { OsmAttribute } from "../../sites-configuration";

  interface Props {
    config: SiteConfiguration[];
    currentSiteId?: string | undefined;
    currentlyShownLinks?: SiteLink[];
    extractedParameters?: Partial<Record<OsmAttribute, string>>;
  }

  let {
    config,
    currentSiteId = undefined,
    currentlyShownLinks = [],
    extractedParameters = {}
  }: Props = $props();

  let enabledLinks: SiteLink[] | undefined = $state();

  const restOfEnabledLinks: Set<string> = $derived(new Set(
    config
      .filter((linkConfig) =>
        linkConfig.isEnabled &&
        currentlyShownLinks.every((link) => link.id !== linkConfig.id))
      .map((linkConfig) => linkConfig.id)
  ));
</script>

<style>
  button {
    margin: 5px auto;
    display: block;
    max-width: 250px; /* Firefox adjustment */
    text-align: center;
  }
  div#fix-button-margin {
    /* button is centralized with `auto`, but needs some "min-margin" in some cases */
    padding: 0 5px;
  }
</style>

{#if restOfEnabledLinks.size > 0}
  {#if currentlyShownLinks.length > 0}
    <hr />
  {/if}
  {#if enabledLinks}
    <LinkList siteLinks={enabledLinks} />
  {:else}
    <div id="fix-button-margin">
      <button
        onclick={() => (enabledLinks = getEnabledLinks(config, currentSiteId, extractedParameters, restOfEnabledLinks))}>
        {browser.i18n.getMessage(currentlyShownLinks.length === 0 ? 'button_showEnabledLinks' : 'button_showOtherEnabledLinks')}
      </button>
    </div>
  {/if}
{/if}
