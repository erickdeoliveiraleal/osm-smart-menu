import browser from "webextension-polyfill";
import { setOrderedSiteIds } from "../storage/config-handler";
import type { SiteConfiguration } from "../storage/config-handler";
import { normalize } from "../text";
import dragula from "dragula";

export const dragHandleClass = "drag-handle";
//TODO: Migrate to svelte-dnd-action after https://github.com/isaacHagoel/svelte-dnd-action/issues/86
export function setupDragAndDrop(d: Document): HTMLElement {
  const div: HTMLDivElement = d.querySelector("div") as HTMLDivElement;

  const dragAndDropHandler = dragula([div], {
    moves: (_el, _container, handle) =>
      Boolean(handle && handle.classList.contains(dragHandleClass)),
  });
  dragAndDropHandler.on("drop", updateSiteIdsOrder);

  async function updateSiteIdsOrder() {
    const orderedSitesWithId = [
      ...d.querySelectorAll("div input[type=checkbox]"),
    ].map((input: Element) => (input as HTMLInputElement).name);
    await setOrderedSiteIds(orderedSitesWithId);
  }

  return div;
}

export function getSiteTitle(siteConfig: SiteConfiguration): string {
  return (
    siteConfig.customName ||
    browser.i18n.getMessage(`site_${siteConfig.id}`) ||
    "???"
  );
}

export function getSiteDetails(siteConfig: SiteConfiguration): string {
  const category = browser.i18n.getMessage(`category_${siteConfig.defaultConfiguration?.category ?? "custom"}`);
  const description = siteConfig.defaultConfiguration ? browser.i18n.getMessage(`description_${siteConfig.id}`) : siteConfig.customPattern?.url;
  return description ? `${category} · ${description}` : category;
}

export function matchesQuery(siteConfig: SiteConfiguration, query: string): boolean {
  const q = normalize(query.trim());
  return !q || normalize(`${getSiteTitle(siteConfig)} ${getSiteDetails(siteConfig)}`).includes(q);
}
