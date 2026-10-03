<script lang="ts">
  import browser from "webextension-polyfill";
  import { KnownError, openLink } from "../utils";
  import InfoBox from "./InfoBox.svelte";

  interface Props {
    error: KnownError;
  }

  let { error }: Props = $props();

  const linkPlaceholder = "__LINK__";
  const linkText = "erickdeoliveiraleal/osm-smart-menu";
  const errorMessage = $derived.by(() => {
    const text = browser.i18n.getMessage(`error_${error}`, linkPlaceholder);
    const [firstPart, lastPart] = text.split(linkPlaceholder);
    return {
      firstPart,
      linkText,
      linkHref: `https://github.com/${linkText}/blob/master/README.md#osm-smart-menu`,
      lastPart,
    };
  });
</script>

<InfoBox>
  {errorMessage.firstPart}
  <a href={errorMessage.linkHref} onclick={(e) => { e.preventDefault(); openLink(errorMessage.linkHref); }}>
    {errorMessage.linkText}
  </a>
  {errorMessage.lastPart}
</InfoBox>
