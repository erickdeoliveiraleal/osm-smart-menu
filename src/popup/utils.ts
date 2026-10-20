import browser from "webextension-polyfill";
import { UrlPattern } from "./sites-manipulation-helper";
import { getOpenNextToCurrentTab } from "../storage/config-handler";

export type CustomUserOption = {
  defaultName: string;
  urlPattern: UrlPattern;
}

export enum KnownError {
  NO_ACCESS = 'noAccess',
  INCOMPATIBLE_WEBSITE = 'incompatibleWebsite',
  NO_INFORMATION_EXTRACTED = 'noInformationExtracted',
}

export async function openLink(url: string): Promise<void> {
  if (await getOpenNextToCurrentTab()) {
    const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (currentTab) {
      try {
        await browser.tabs.create({ url, index: currentTab.index + 1, openerTabId: currentTab.id });
        return;
      } catch {
        // e.g. a browser that doesn't support these options: open it at the end instead
      }
    }
  }
  await browser.tabs.create({ url });
}

/**
 * Sends a command to a program on the user's computer (e.g. JOSM remote control) without opening a tab.
 * The command is sent only once, because a failure may happen after the program already received it.
 * - accepted: closes the popup
 * - refused: opens it in a tab, where the program's error message is shown
 * - no answer (program closed or remote control disabled): returns false so the popup can say so
 */
export async function sendRemoteControlCommand(url: string): Promise<boolean> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return false;
  }
  if (response.ok) window.close();
  else openLink(url);
  return true;
}
