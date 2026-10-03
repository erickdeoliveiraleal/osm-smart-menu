<script lang="ts">
  // Icons from Tabler Icons (MIT), bundled in /icons/ui. Used as a mask so they take the text color.
  let { name, size = 16 }: { name: string; size?: number } = $props();
</script>

<style>
  span {
    display: inline-block;
    flex-shrink: 0;
    background-color: currentColor;
    mask: var(--icon) center / contain no-repeat;
  }
</style>

<span aria-hidden="true" style="--icon: url(/icons/ui/{name}.svg); width: {size}px; height: {size}px;"></span>
