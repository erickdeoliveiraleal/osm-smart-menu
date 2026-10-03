<script lang="ts">
  import browser from "webextension-polyfill";
  import type { UrlPattern } from "../../popup/sites-manipulation-helper";
  import { addNewUrlPattern } from "../../storage/config-handler";

  const urlTemplatePlaceholder =
    "https://www.openstreetmap.org/#map={zoom}/{latitude}/{longitude}";
  const urlTemplatePattern: string = /([^{}]+\{(zoom|latitude|longitude|osm_(user_name|tag_key|tag_value|(changeset|node|way|relation)_id))\})+[^{}]*/
    .source; // must contain curly braces; but only with known parameters

  const parametersHelpUrl = "https://wiki.openstreetmap.org/wiki/OSM_Smart_Menu#Advanced_method_to_add_new_links";
  const parameters = ["zoom", "latitude", "longitude", "osm_user_name", "osm_changeset_id", "osm_node_id", "osm_way_id", "osm_relation_id", "osm_tag_key", "osm_tag_value"];

  let linkName = $state("");
  let linkUrlTemplate = $state("");
  let errorMessage = $state("");

  // Firefox doesn't show the browser's validation messages inside the add-ons manager,
  // so the form is validated here and the error is shown in the page
  function validate(): string {
    if (!linkName.trim()) return browser.i18n.getMessage("config_pattern_nameRequired");
    let isUrl = false;
    try {
      isUrl = ["http:", "https:"].includes(new URL(linkUrlTemplate).protocol);
    } catch {
      isUrl = false;
    }
    if (!isUrl || !new RegExp(`^(?:${urlTemplatePattern})$`).test(linkUrlTemplate)) {
      return browser.i18n.getMessage("config_pattern_invalidTemplate");
    }
    return "";
  }

  async function onFormSubmit(event: Event) {
    event.preventDefault(); // needed to ensure this async function executes completely

    errorMessage = validate();
    if (errorMessage) return;

    const urlPattern: UrlPattern = { tag: "user-v1", url: linkUrlTemplate };
    await addNewUrlPattern(linkName, urlPattern);

    window.location.reload();
  }
</script>

<style>
  form {
    margin-top: 10px;
  }

  input {
    display: block;
    margin-bottom: 5px;
  }

  .error {
    color: #c00;
  }

  .help {
    font-size: 0.9em;
    margin: 0 0 8px;
  }

  code {
    white-space: nowrap;
  }

  @media (prefers-color-scheme: dark) {
    .error {
      color: #ff8a8a;
    }
  }
</style>

<form action="#" novalidate onsubmit={onFormSubmit}>
  <fieldset>
    <legend>{browser.i18n.getMessage('config_pattern_formTitle')}</legend>
    <label>
      {browser.i18n.getMessage('config_pattern_name')}
      <input type="text" required bind:value={linkName} oninput={() => (errorMessage = "")} />
    </label>
    <label>
      {browser.i18n.getMessage('config_pattern_urlTemplate')}
      <input
        type="url"
        required
        bind:value={linkUrlTemplate}
        oninput={() => (errorMessage = "")}
        placeholder={urlTemplatePlaceholder}
        pattern={urlTemplatePattern} />
    </label>
    <p class="help">
      {browser.i18n.getMessage("config_pattern_parameters")}
      {#each parameters as parameter, i}<code>{"{" + parameter + "}"}</code>{i < parameters.length - 1 ? ", " : ". "}{/each}
      <a href={parametersHelpUrl} target="_blank" rel="noopener">{browser.i18n.getMessage("config_pattern_documentation")}</a>
    </p>
    {#if errorMessage}
      <p class="error" role="alert">{errorMessage}</p>
    {/if}
    <button type="submit">
      {browser.i18n.getMessage('config_pattern_createOption')}
    </button>
  </fieldset>
</form>
