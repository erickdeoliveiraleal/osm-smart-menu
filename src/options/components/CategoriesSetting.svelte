<script lang="ts">
  import browser from "webextension-polyfill";
  import { categories } from "../../popup/components/LinkList.svelte";
  import { getHiddenCategories, setHiddenCategories } from "../../storage/config-handler";

  let hidden: string[] = $state([]);
  getHiddenCategories().then((value) => (hidden = value));

  function toggle(category: string, shown: boolean) {
    hidden = shown ? hidden.filter((c) => c !== category) : [...hidden, category];
    setHiddenCategories(hidden);
  }
</script>

<style>
  fieldset {
    margin: 0 0 8px;
  }
  .hint {
    margin: 0 0 4px;
    color: var(--text-secondary);
    font-size: 0.9em;
  }
  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 14px;
  }
  label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>

<fieldset>
  <legend>{browser.i18n.getMessage("config_categories")}</legend>
  <p class="hint">{browser.i18n.getMessage("config_categories_hint")}</p>
  <div class="categories">
    {#each categories as category (category)}
      <label>
        <input type="checkbox" checked={!hidden.includes(category)}
          onchange={(e) => toggle(category, e.currentTarget.checked)} />
        {browser.i18n.getMessage(`category_${category}`)}
      </label>
    {/each}
  </div>
</fieldset>
