import { canMove, carouselIndexFromKey, clampIndex, cx, formatNumber, moveIndex, readingDirection } from '@white-plumeria/core';
import { $, component$, useId, useSignal, type QRL } from '@qwik.dev/core';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export const Carousel = component$<{
  label: string;
  slides: CarouselSlide[];
  index?: number;
  defaultIndex?: number;
  loop?: boolean;
  onIndexChange$?: QRL<(index: number) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const uid = useId();
  const viewport = useSignal<HTMLDivElement>();
  const startX = useSignal<number | null>(null);
  const internal = useSignal(props.defaultIndex ?? 0);
  const count = props.slides.length;
  const current = clampIndex(props.index ?? internal.value, count);
  const media = props.slides.some((slide) => Boolean(slide.src));
  const loop = Boolean(props.loop);
  const commit = $((next: number) => {
    const clamped = clampIndex(next, count);
    const active = document.activeElement;
    const leaving = viewport.value?.querySelector<HTMLElement>('[data-current="true"]');
    const shouldMove = Boolean(leaving && active instanceof Node && leaving.contains(active));
    if (props.index === undefined) internal.value = clamped;
    void props.onIndexChange$?.(clamped);
    if (shouldMove) queueMicrotask(() => viewport.value?.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`)?.focus());
  });
  const go = $((delta: number) => {
    if (!canMove(current, delta, count, loop)) return;
    void commit(moveIndex(current, delta, count, loop));
  });
  const onTabKeyDown = $((event: KeyboardEvent, element: HTMLButtonElement) => {
    const next = carouselIndexFromKey(current, count, event.key, readingDirection(element), loop);
    if (next === null) return;
    event.preventDefault();
    void commit(next);
    queueMicrotask(() => element.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus());
  });

  if (count === 0) return <p class="wpl-muted">{wpl.t('empty')}</p>;

  const position = `${formatNumber(current + 1, wpl.locale)} / ${formatNumber(count, wpl.locale)}`;

  return (
    <section class={cx('wpl-carousel', media && 'wpl-carousel-media')} aria-roledescription="carousel" aria-label={props.label || wpl.t('carousel')}>
      <div
        ref={viewport}
        class="wpl-carousel-viewport"
        onPointerDown$={(event) => {
          if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
          startX.value = event.clientX;
        }}
        onPointerUp$={(event, element) => {
          if (startX.value === null) return;
          const delta = event.clientX - startX.value;
          startX.value = null;
          if (Math.abs(delta) < 48) return;
          const direction = readingDirection(element);
          const forward = direction === 'rtl' ? delta > 0 : delta < 0;
          go(forward ? 1 : -1);
        }}
        onPointerCancel$={() => { startX.value = null; }}
      >
        <div class="wpl-carousel-track" style={{ '--wpl-carousel-index': String(current) }}>
          {props.slides.map((slide, slideIndex) => {
            const active = slideIndex === current;
            return (
              <div
                key={slide.id}
                id={`${uid}-panel-${slide.id}`}
                class="wpl-carousel-slide"
                role="tabpanel"
                aria-roledescription="slide"
                aria-label={`${slide.label}, ${slideIndex + 1} ${wpl.t('of')} ${count}`}
                aria-hidden={active ? undefined : true}
                inert={active ? undefined : true}
                tabIndex={active ? -1 : undefined}
                data-current={active ? 'true' : undefined}
                data-slide-index={slideIndex}
              >
                {slide.src ? (
                  <figure class="wpl-carousel-figure">
                    <img class="wpl-carousel-image" src={slide.src} alt={slide.alt ?? ''} draggable={false} loading={active ? 'eager' : 'lazy'} />
                    <figcaption class="wpl-carousel-caption">
                      <strong>{slide.label}</strong>
                      {slide.caption ? <span>{slide.caption}</span> : null}
                    </figcaption>
                  </figure>
                ) : null}
                {slide.content ? <div class="wpl-carousel-copy">{slide.content}</div> : null}
                {!slide.src && !slide.content ? <p class="wpl-carousel-copy">{slide.label}</p> : null}
              </div>
            );
          })}
        </div>
        {media ? (
          <>
            <p class="wpl-carousel-count" aria-hidden="true">{position}</p>
            <div class="wpl-carousel-nav">
              <button type="button" class="wpl-carousel-control" aria-label={wpl.t('previous')} disabled={!canMove(current, -1, count, loop)} onClick$={() => go(-1)}>
                <Icon name="chevronLeft" />
              </button>
              <button type="button" class="wpl-carousel-control" aria-label={wpl.t('next')} disabled={!canMove(current, 1, count, loop)} onClick$={() => go(1)}>
                <Icon name="chevronRight" />
              </button>
            </div>
            <div class="wpl-carousel-dots" role="tablist" aria-label={props.label || wpl.t('carousel')}>
              {props.slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  class="wpl-carousel-dot"
                  aria-selected={slideIndex === current}
                  aria-controls={`${uid}-panel-${slide.id}`}
                  tabIndex={slideIndex === current ? 0 : -1}
                  onClick$={() => commit(slideIndex)}
                  onKeyDown$={(event, element) => onTabKeyDown(event, element)}
                >
                  <span class="wpl-sr-only">{slide.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div class="wpl-carousel-bar">
            <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current, -1, count, loop)} onClick$={() => go(-1)}>
              <Icon name="chevronLeft" />
              <span class="wpl-sr-only">{wpl.t('previous')}</span>
            </button>
            <div class="wpl-carousel-dots" role="tablist" aria-label={props.label || wpl.t('carousel')}>
              {props.slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  class="wpl-carousel-dot"
                  aria-selected={slideIndex === current}
                  aria-controls={`${uid}-panel-${slide.id}`}
                  tabIndex={slideIndex === current ? 0 : -1}
                  onClick$={() => commit(slideIndex)}
                  onKeyDown$={(event, element) => onTabKeyDown(event, element)}
                >
                  <span class="wpl-sr-only">{slide.label}</span>
                </button>
              ))}
            </div>
            <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current, 1, count, loop)} onClick$={() => go(1)}>
              <Icon name="chevronRight" />
              <span class="wpl-sr-only">{wpl.t('next')}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
