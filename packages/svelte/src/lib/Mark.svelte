<svg class="wpl-mark" viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
    {#each [0, 72, 144, 216, 288] as angle (angle)}
      <path
        d="M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z"
        transform={`rotate(${angle} 32 32)`}
      />
    {/each}
  </g>
  <circle cx="32" cy="32" r="2.15" fill="currentColor" />
</svg>
