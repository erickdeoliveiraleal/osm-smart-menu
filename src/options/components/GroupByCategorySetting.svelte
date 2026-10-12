<script lang="ts">
  import browser from "webextension-polyfill";
  import { getGroupByCategory, setGroupByCategory } from "../../storage/config-handler";

  let groupByCategory = $state(true);
  getGroupByCategory().then((value) => (groupByCategory = value));
</script>

<style>
  label {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 8px;
  }
  .hint {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9em;
  }
</style>

<label>
  <input type="checkbox" bind:checked={groupByCategory} onchange={() => setGroupByCategory(groupByCategory)} />
  <span>
    {browser.i18n.getMessage("config_groupByCategory")}
    <span class="hint">{browser.i18n.getMessage("config_groupByCategory_hint")}</span>
  </span>
</label>
