import { canMove, carouselIndexFromKey, clampIndex, cx, formatNumber, moveIndex, readingDirection } from '@white-plumeria/core';
import { createSignal, type JSX , createUniqueId } from 'solid-js';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: JSX.Element;
  src?: string;
  alt?: string;
  caption?: string;
}

export function Carousel(props: {
  label: string;
  slides: CarouselSlide[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
}) {
  const { t, locale } = useWhitePlumeria();
  const uid = createUniqueId();
  let viewport: HTMLDivElement | undefined;
  let startX: number | null = null;
  const [internal, setInternal] = createSignal(props.defaultIndex ?? 0);
  const count = () => props.slides.length;
  const current = () => clampIndex(props.index ?? internal(), count());
  const media = () => props.slides.some((slide) => Boolean(slide.src));
  const loop = () => Boolean(props.loop);

  function commit(next: number) {
    const clamped = clampIndex(next, count());
    const active = document.activeElement;
    const leaving = viewport?.querySelector<HTMLElement>('[data-current="true"]');
    const shouldMove = Boolean(leaving && active instanceof Node && leaving.contains(active));
    if (props.index === undefined) setInternal(clamped);
    props.onIndexChange?.(clamped);
    if (shouldMove) {
      queueMicrotask(() => {
        viewport?.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`)?.focus();
      });
    }
  }

  function go(delta: number) {
    if (!canMove(current(), delta, count(), loop())) return;
    commit(moveIndex(current(), delta, count(), loop()));
  }

  function onTabKeyDown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }) {
    const next = carouselIndexFromKey(current(), count(), event.key, readingDirection(event.currentTarget), loop());
    if (next === null) return;
    event.preventDefault();
    commit(next);
    queueMicrotask(() => {
      const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      tabs?.[next]?.focus();
    });
  }

  return (
    <>
      {count() === 0 ? (
        <p class="wpl-muted">{t('empty')}</p>
      ) : (
        <section class={cx('wpl-carousel', media() && 'wpl-carousel-media')} aria-roledescription="carousel" aria-label={props.label || t('carousel')}>
          <div
            class="wpl-carousel-viewport"
            ref={viewport}
            onPointerDown={(event) => {
              if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
              startX = event.clientX;
            }}
            onPointerUp={(event) => {
              if (startX === null) return;
              const delta = event.clientX - startX;
              startX = null;
              if (Math.abs(delta) < 48) return;
              const direction = readingDirection(event.currentTarget);
              const forward = direction === 'rtl' ? delta > 0 : delta < 0;
              go(forward ? 1 : -1);
            }}
            onPointerCancel={() => {
              startX = null;
            }}
          >
            <div class="wpl-carousel-track" style={{ '--wpl-carousel-index': String(current()) }}>
              {props.slides.map((slide, slideIndex) => {
                const active = () => slideIndex === current();
                return (
                  <div
                    id={`${uid}-panel-${slide.id}`}
                    class="wpl-carousel-slide"
                    role="tabpanel"
                    aria-roledescription="slide"
                    aria-label={`${slide.label}, ${slideIndex + 1} ${t('of')} ${count()}`}
                    aria-hidden={active() ? undefined : true}
                    inert={active() ? undefined : true}
                    tabindex={active() ? -1 : undefined}
                    data-current={active() ? 'true' : undefined}
                    data-slide-index={slideIndex}
                  >
                    <SlideBody slide={slide} active={active()} />
                  </div>
                );
              })}
            </div>
            {media() ? (
              <>
                <p class="wpl-carousel-count" aria-hidden="true">
                  {formatNumber(current() + 1, locale())} / {formatNumber(count(), locale())}
                </p>
                <div class="wpl-carousel-nav">
                  <Control label={t('previous')} disabled={!canMove(current(), -1, count(), loop())} onClick={() => go(-1)}>
                    <Icon name="chevronLeft" />
                  </Control>
                  <Control label={t('next')} disabled={!canMove(current(), 1, count(), loop())} onClick={() => go(1)}>
                    <Icon name="chevronRight" />
                  </Control>
                </div>
                <div class="wpl-carousel-dots" role="tablist" aria-label={props.label || t('carousel')}>
                  {props.slides.map((slide, slideIndex) => (
                    <button
                      type="button"
                      role="tab"
                      class="wpl-carousel-dot"
                      aria-selected={slideIndex === current()}
                      aria-controls={`${uid}-panel-${slide.id}`}
                      tabindex={slideIndex === current() ? 0 : -1}
                      onClick={() => commit(slideIndex)}
                      onKeyDown={onTabKeyDown}
                    >
                      <span class="wpl-sr-only">{slide.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          {!media() ? (
            <div class="wpl-carousel-bar">
              <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current(), -1, count(), loop())} onClick={() => go(-1)}>
                <Icon name="chevronLeft" />
                <span class="wpl-sr-only">{t('previous')}</span>
              </button>
              <div class="wpl-carousel-dots" role="tablist" aria-label={props.label || t('carousel')}>
                {props.slides.map((slide, slideIndex) => (
                  <button
                    type="button"
                    role="tab"
                    class="wpl-carousel-dot"
                    aria-selected={slideIndex === current()}
                    aria-controls={`${uid}-panel-${slide.id}`}
                    tabindex={slideIndex === current() ? 0 : -1}
                    onClick={() => commit(slideIndex)}
                    onKeyDown={onTabKeyDown}
                  >
                    <span class="wpl-sr-only">{slide.label}</span>
                  </button>
                ))}
              </div>
              <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" disabled={!canMove(current(), 1, count(), loop())} onClick={() => go(1)}>
                <Icon name="chevronRight" />
                <span class="wpl-sr-only">{t('next')}</span>
              </button>
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}

function SlideBody(props: { slide: CarouselSlide; active: boolean }) {
  return (
    <>
      {props.slide.src ? (
        <figure class="wpl-carousel-figure">
          <img class="wpl-carousel-image" src={props.slide.src} alt={props.slide.alt ?? ''} draggable={false} loading={props.active ? 'eager' : 'lazy'} />
          <figcaption class="wpl-carousel-caption">
            <strong>{props.slide.label}</strong>
            {props.slide.caption ? <span>{props.slide.caption}</span> : null}
          </figcaption>
        </figure>
      ) : null}
      {props.slide.content ? <div class="wpl-carousel-copy">{props.slide.content}</div> : null}
      {!props.slide.src && !props.slide.content ? <p class="wpl-carousel-copy">{props.slide.label}</p> : null}
    </>
  );
}

function Control(props: { label: string; disabled: boolean; onClick: () => void; children: JSX.Element }) {
  return (
    <button type="button" class="wpl-carousel-control" aria-label={props.label} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
