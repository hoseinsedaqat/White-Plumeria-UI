<script lang="ts">
  import { canMove, carouselIndexFromKey, clampIndex, moveIndex, readingDirection } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  interface Slide {
    id: string;
    label: string;
    content: string;
  }

  let {
    label,
    slides,
    index = $bindable(0),
    loop = false,
    onindexchange,
  }: {
    label: string;
    slides: Slide[];
    index?: number;
    loop?: boolean;
    onindexchange?: (index: number) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const uid = $props.id();
  let startX: number | null = null;
  const count = $derived(slides.length);
  const current = $derived(clampIndex(index, count));

  function commit(next: number) {
    const clamped = clampIndex(next, count);
    index = clamped;
    onindexchange?.(clamped);
  }

  function go(delta: number) {
    if (!canMove(current, delta, count, loop)) return;
    commit(moveIndex(current, delta, count, loop));
  }
</script>

{#if count === 0}
  <p class="wpl-muted">{wpl.t('empty')}</p>
{:else}
  <section class="wpl-carousel" aria-roledescription="carousel" aria-label={label || wpl.t('carousel')}>
    <!-- Swipe is an extra. Previous, next, and the tablist are the keyboard path. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="wpl-carousel-viewport"
      role="group"
      onpointerdown={(event) => {
        if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
        startX = event.clientX;
      }}
      onpointerup={(event) => {
        if (startX === null) return;
        const delta = event.clientX - startX;
        startX = null;
        if (Math.abs(delta) < 48) return;
        const direction = readingDirection(event.currentTarget);
        go(direction === 'rtl' ? (delta > 0 ? 1 : -1) : delta < 0 ? 1 : -1);
      }}
    >
      <div
        class="wpl-carousel-track"
        style:--wpl-carousel-index={current}
        style:--wpl-carousel-count={count}
      >
        {#each slides as slide, slideIndex (slide.id)}
          <div
            id="{uid}-panel-{slide.id}"
            class="wpl-carousel-slide"
            role="tabpanel"
            aria-roledescription="slide"
            aria-label="{slide.label}, {slideIndex + 1} {wpl.t('of')} {count}"
            aria-hidden={slideIndex === current ? undefined : true}
            inert={slideIndex === current ? undefined : true}
            tabindex={slideIndex === current ? -1 : undefined}
          >
            {slide.content}
          </div>
        {/each}
      </div>
    </div>
    <div class="wpl-carousel-bar">
      <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current, -1, count, loop)} onclick={() => go(-1)}>
        <Icon name="chevronLeft" />
        <span class="wpl-sr-only">{wpl.t('previous')}</span>
      </button>
      <div class="wpl-carousel-dots" role="tablist" aria-label={label || wpl.t('carousel')}>
        {#each slides as slide, slideIndex (slide.id)}
          <button
            type="button"
            role="tab"
            class="wpl-carousel-dot"
            aria-selected={slideIndex === current}
            aria-controls="{uid}-panel-{slide.id}"
            tabindex={slideIndex === current ? 0 : -1}
            onclick={() => commit(slideIndex)}
            onkeydown={(event) => {
              const next = carouselIndexFromKey(current, count, event.key, readingDirection(event.currentTarget), loop);
              if (next === null) return;
              event.preventDefault();
              commit(next);
            }}
          >
            <span class="wpl-sr-only">{slide.label}</span>
          </button>
        {/each}
      </div>
      <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current, 1, count, loop)} onclick={() => go(1)}>
        <Icon name="chevronRight" />
        <span class="wpl-sr-only">{wpl.t('next')}</span>
      </button>
    </div>
  </section>
{/if}
