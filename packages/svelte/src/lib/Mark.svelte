<script lang="ts">
</script>

<svg class="wpl-mark" viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    {#each [0, 72, 144, 216, 288] as angle (angle)}
      <ellipse cx="32" cy="18" rx="6.5" ry="12" transform={`rotate(${angle} 32 32)`} />
    {/each}
  </g>
  <circle cx="32" cy="32" r="3.2" fill="currentColor" />
</svg>
