<script lang="ts">
  import browser from "webextension-polyfill";
  import { exportSettings, importSettings } from "../../storage/config-handler";
  import { parseConfigFile } from "../../storage/config-file";

  let fileInput: HTMLInputElement;
  let errorMessage = $state("");

  async function exportToFile() {
    const settings = await exportSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `osm-smart-menu-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFromFile() {
    const file = fileInput.files?.[0];
    fileInput.value = ""; // allows selecting the same file again
    if (!file) return;

    errorMessage = "";
    let data;
    try {
      data = parseConfigFile(await file.text());
    } catch (e) {
      errorMessage = browser.i18n.getMessage("config_import_invalidFile");
      console.error("OSM WebExtension ERROR", e);
      return;
    }
    if (!window.confirm(browser.i18n.getMessage("config_import_confirm"))) return;

    try {
      await importSettings(data);
    } catch (e) {
      errorMessage = browser.i18n.getMessage("config_import_failed");
      console.error("OSM WebExtension ERROR", e);
      return;
    }
    window.location.reload();
  }
</script>

<style>
  fieldset {
    margin-top: 10px;
  }

  .error {
    color: #c00;
  }
</style>

<fieldset>
  <legend>{browser.i18n.getMessage("config_backup_title")}</legend>
  <button type="button" onclick={exportToFile}>
    {browser.i18n.getMessage("config_export_button")}
  </button>
  <button type="button" onclick={() => fileInput.click()}>
    {browser.i18n.getMessage("config_import_button")}
  </button>
  <input
    type="file"
    accept="application/json,.json"
    hidden
    bind:this={fileInput}
    onchange={importFromFile} />
  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
  {/if}
</fieldset>
