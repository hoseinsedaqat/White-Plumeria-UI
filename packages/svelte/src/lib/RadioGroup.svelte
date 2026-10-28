<script lang="ts">
  let { label, name, options, value = $bindable('') }: { label: string; name: string; options: Array<{ value: string; label: string; disabled?: boolean }>; value?: string } = $props();
</script>
<fieldset class="wpl-field">
  <legend class="wpl-label">{label}</legend>
  {#each options as option (option.value)}
    <label class="wpl-radio">
      <input type="radio" {name} value={option.value} bind:group={value} disabled={option.disabled} />
      <span>{option.label}</span>
    </label>
  {/each}
</fieldset>
