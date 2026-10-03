import {
  getSitesConfiguration,
  SiteConfiguration,
} from "../storage/config-handler";
import { setupDragAndDrop } from "./utils";
import { mount } from "svelte";
import App from "./App.svelte";

getSitesConfiguration().then((sitesConfig: SiteConfiguration[]) => {
  mount(App, {
    target: document.body,
    props: {
      sitesConfig,
    },
  });

  setupDragAndDrop(document);
});
