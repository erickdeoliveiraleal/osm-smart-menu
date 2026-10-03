import {
  getSitesConfiguration,
  SiteConfiguration,
} from "../storage/config-handler";
import { setupDragAndDrop } from "./utils";
import { mount } from "svelte";
import browser from "webextension-polyfill";
import App from "./App.svelte";

document.title = `${browser.i18n.getMessage("extensionName")} – ${browser.i18n.getMessage("popup_settings")}`;

getSitesConfiguration().then((sitesConfig: SiteConfiguration[]) => {
  mount(App, {
    target: document.body,
    props: {
      sitesConfig,
    },
  });

  setupDragAndDrop(document);
});
