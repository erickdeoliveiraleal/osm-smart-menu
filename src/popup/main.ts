import browser from 'webextension-polyfill';
import { ContentScriptOutputMessage, ContentScriptInputMessage } from '../injectable-content-script';
import { KnownError, CustomUserOption } from './utils';
import { findSiteCandidates, pickWinningCandidate, getRelevantSites, SiteLink } from './sites-manipulation-helper';
import { getSitesConfiguration, SiteConfiguration } from '../storage/config-handler';
import { mount } from "svelte";
import App from './App.svelte';
import { OsmAttribute } from "../sites-configuration";

export type EventualSitesOrError = Promise<
  | {
      config: SiteConfiguration[];
      currentSiteId: string | undefined;
      sourceHost: string;
      sitesList: SiteLink[];
      extractedParameters: Partial<Record<OsmAttribute, string>>;
      customUserOption?: CustomUserOption;
    }
  | {
      config: SiteConfiguration[];
      error: KnownError;
    }
>;

const eventualSitesOrError: EventualSitesOrError = getSitesOrError().catch((e) => {
  logUnexpectedError(e);
  throw e; // shown as an error by the popup
});
mount(App, {
  target: document.body,
  props: { eventualSitesOrError },
});

async function getSitesOrError(): EventualSitesOrError {
  const config = await getSitesConfiguration();
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  if (!currentTab || !currentTab.url || !currentTab.id) {
    const error = KnownError.NO_ACCESS;
    return { config, error };
  }

  const candidateSiteIds = findSiteCandidates(config, currentTab.url);
  const contentScriptResult = await getDataFromContentScript(currentTab.id, candidateSiteIds) ;
  const currentSite = contentScriptResult && pickWinningCandidate(config, contentScriptResult, currentTab.url);
  if (!currentSite) {
    const error =
      candidateSiteIds.length === 0
        ? KnownError.INCOMPATIBLE_WEBSITE
        : KnownError.NO_INFORMATION_EXTRACTED;
    return { config, error };
  }

  let customUserOption: CustomUserOption | undefined;
  if (currentSite.detectedPattern) {
    customUserOption = {
      urlPattern: currentSite.detectedPattern,
      defaultName: currentTab.title || '???',
    };
  }

  const sitesList = getRelevantSites(config, currentSite.siteId, currentSite.attributes);
  return {
    config,
    currentSiteId: currentSite.siteId,
    sourceHost: new URL(currentTab.url).hostname,
    sitesList,
    customUserOption,
    extractedParameters: currentSite.attributes,
  };
}

async function getDataFromContentScript(tabId: number, candidateSiteIds: string[]): Promise<ContentScriptOutputMessage | undefined> {
  try {
    await browser.scripting.executeScript({ target: { tabId }, files: ["/injectable-content-script.js"] });

    const message: ContentScriptInputMessage = { candidateSiteIds };
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("The page did not answer in time")), 5000));
    return (await Promise.race([browser.tabs.sendMessage(tabId, message), timeout])) as ContentScriptOutputMessage;
  } catch (e) {
    logUnexpectedError(e);
    return;
  }
}

function logUnexpectedError(e: any): void {
  const errorPrefix = 'OSM WebExtension ERROR';
  if(e instanceof Error) {
    console.error(errorPrefix, e.message, e.stack);
  } else {
    console.error(errorPrefix, JSON.stringify(e));
  }
}
