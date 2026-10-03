<script lang="ts">
  import UrlTemplateForm from "./components/UrlTemplateForm.svelte";
  import ConfigurableLine from "./components/ConfigurableLine.svelte";
  import SettingsBackup from "./components/SettingsBackup.svelte";
  import type { SiteConfiguration } from "../storage/config-handler";
  import browser from "webextension-polyfill";
  import { matchesQuery } from "./utils";

  interface Props {
    sitesConfig: SiteConfiguration[];
  }

  let { sitesConfig }: Props = $props();

  let currentEditableLinkById: string | undefined = $state();
  let query = $state("");
  const searchPlaceholder = browser.i18n.getMessage("popup_searchPlaceholder");
  const hasMatches = $derived(sitesConfig.some((siteConfig) => matchesQuery(siteConfig, query)));
</script>

<style>
  input {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 8px;
    padding: 6px 8px;
    font: inherit;
  }
  p {
    color: var(--text-secondary);
  }
</style>

<input type="search" bind:value={query} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />

<div>
  {#each sitesConfig as siteConfig (siteConfig.id)}
    <ConfigurableLine bind:currentEditableLinkById {siteConfig} {query} />
  {/each}
</div>
{#if !hasMatches}
  <p>{browser.i18n.getMessage("popup_noSearchResults")}</p>
{/if}
<UrlTemplateForm />
<SettingsBackup />
