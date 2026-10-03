<script lang="ts">
  import UrlTemplateForm from "./components/UrlTemplateForm.svelte";
  import ConfigurableLine from "./components/ConfigurableLine.svelte";
  import type { SiteConfiguration } from "../storage/config-handler";

  interface Props {
    sitesConfig: SiteConfiguration[];
  }

  let { sitesConfig }: Props = $props();

  let currentEditableLinkById: string | undefined = $state();
</script>

<div>
  {#each sitesConfig as siteConfig (siteConfig.id)}
    <ConfigurableLine bind:currentEditableLinkById {siteConfig} />
  {/each}
</div>
<UrlTemplateForm />
