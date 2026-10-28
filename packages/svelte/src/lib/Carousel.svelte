<script lang="ts">
  import { canMove, carouselIndexFromKey, clampIndex, cx, formatNumber, moveIndex, readingDirection } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  interface Slide {
    id: string;
    label: string;
    content?: string;
    src?: string;
    alt?: string;
    caption?: string;
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
  const media = $derived(slides.some((slide) => Boolean(slide.src)));
  const position = $derived(`${formatNumber(current + 1, wpl.preferences.locale)} / ${formatNumber(count, wpl.preferences.locale)}`);

  function commit(next: number) {
    const clamped = clampIndex(next, count);
    index = clamped;
    onindexchange?.(clamped);
  }

  function go(delta: number) {
    if (!canMove(current, delta, count, loop)) return;
    commit(moveIndex(current, delta, count, loop));
  }

  function onTabKeyDown(event: KeyboardEvent) {
    const next = carouselIndexFromKey(current, count, event.key, readingDirection(event.currentTarget as HTMLElement), loop);
    if (next === null) return;
    event.preventDefault();
    commit(next);
  }
</script>

{#if count === 0}
  <p class="wpl-muted">{wpl.t('empty')}</p>
{:else}
  <section class={cx('wpl-carousel', media && 'wpl-carousel-media')} aria-roledescription="carousel" aria-label={label || wpl.t('carousel')}>
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
      <div class="wpl-carousel-track" style:--wpl-carousel-index={current}>
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
            {#if slide.src}
              <figure class="wpl-carousel-figure">
                <img
                  class="wpl-carousel-image"
                  src={slide.src}
                  alt={slide.alt ?? ''}
                  draggable="false"
                  loading={slideIndex === current ? 'eager' : 'lazy'}
                />
                <figcaption class="wpl-carousel-caption">
                  <strong>{slide.label}</strong>
                  {#if slide.caption}<span>{slide.caption}</span>{/if}
                </figcaption>
              </figure>
            {/if}
            {#if slide.content}<div class="wpl-carousel-copy">{slide.content}</div>{/if}
            {#if !slide.src && !slide.content}<p class="wpl-carousel-copy">{slide.label}</p>{/if}
          </div>
        {/each}
      </div>
      {#if media}
        <p class="wpl-carousel-count" aria-hidden="true">{position}</p>
        <div class="wpl-carousel-nav">
          <button type="button" class="wpl-carousel-control" aria-label={wpl.t('previous')} disabled={!canMove(current, -1, count, loop)} onclick={() => go(-1)}>
            <Icon name="chevronLeft" />
          </button>
          <button type="button" class="wpl-carousel-control" aria-label={wpl.t('next')} disabled={!canMove(current, 1, count, loop)} onclick={() => go(1)}>
            <Icon name="chevronRight" />
          </button>
        </div>
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
              onkeydown={onTabKeyDown}
            >
              <span class="wpl-sr-only">{slide.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
    {#if !media}
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
              onkeydown={onTabKeyDown}
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
    {/if}
  </section>
{/if}
