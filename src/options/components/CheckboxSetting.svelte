<script lang="ts">
  import browser from "webextension-polyfill";
  import { untrack } from "svelte";

  interface Props {
    // name of the label in the translations; the hint is under `${message}_hint`
    message: string;
    load: () => Promise<boolean>;
    save: (value: boolean) => Promise<void>;
  }

  let { message, load, save }: Props = $props();

  let checked = $state(false);
  untrack(() => load()).then((value) => (checked = value));
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
  <input type="checkbox" bind:checked onchange={() => save(checked)} />
  <span>
    {browser.i18n.getMessage(message)}
    <span class="hint">{browser.i18n.getMessage(`${message}_hint`)}</span>
  </span>
</label>
