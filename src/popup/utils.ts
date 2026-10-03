import browser from "webextension-polyfill";
import { UrlPattern } from "./sites-manipulation-helper";

export type CustomUserOption = {
  defaultName: string;
  urlPattern: UrlPattern;
}

export enum KnownError {
  NO_ACCESS = 'noAccess',
  INCOMPATIBLE_WEBSITE = 'incompatibleWebsite',
  NO_INFORMATION_EXTRACTED = 'noInformationExtracted',
}

export function openLink(url: string): void {
  browser.tabs.create({ url });
}

/**
 * Sends a command to a program on the user's computer (e.g. JOSM remote control) without opening a tab.
 * If the request can't be sent (program closed, or blocked by the browser), opens it in a tab instead,
 * which also shows the user what went wrong.
 */
export async function sendRemoteControlCommand(url: string): Promise<void> {
  try {
    await fetch(url, { mode: "no-cors" });
    window.close();
  } catch {
    openLink(url);
  }
}
