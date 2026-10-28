import {
  canMove,
  carouselIndexFromKey,
  clampIndex,
  cx,
  formatNumber,
  moveIndex,
  readingDirection,
} from '@white-plumeria/core';
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: ReactNode;
  src?: string;
  alt?: string;
  caption?: string;
}

export function Carousel({
  label,
  slides,
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = false,
}: {
  label: string;
  slides: CarouselSlide[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
}) {
  const { t, locale } = useWhitePlumeria();
  const uid = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [internal, setInternal] = useState(defaultIndex);
  const count = slides.length;
  const current = clampIndex(index ?? internal, count);
  const media = slides.some((slide) => Boolean(slide.src));

  function commit(next: number) {
    const clamped = clampIndex(next, count);
    const active = document.activeElement;
    const leaving = viewport.current?.querySelector<HTMLElement>('[data-current="true"]');
    const shouldMove = Boolean(leaving && active instanceof Node && leaving.contains(active));
    if (index === undefined) setInternal(clamped);
    onIndexChange?.(clamped);
    if (shouldMove) {
      queueMicrotask(() => {
        viewport.current?.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`)?.focus();
      });
    }
  }

  function go(delta: number) {
    if (!canMove(current, delta, count, loop)) return;
    commit(moveIndex(current, delta, count, loop));
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = carouselIndexFromKey(current, count, event.key, readingDirection(event.currentTarget), loop);
    if (next === null) return;
    event.preventDefault();
    commit(next);
    queueMicrotask(() => {
      const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      tabs?.[next]?.focus();
    });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
    startX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const delta = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) < 48) return;
    const direction = readingDirection(event.currentTarget);
    const forward = direction === 'rtl' ? delta > 0 : delta < 0;
    go(forward ? 1 : -1);
  }

  if (count === 0) {
    return <p className="wpl-muted">{t('empty')}</p>;
  }

  const position = `${formatNumber(current + 1, locale)} / ${formatNumber(count, locale)}`;

  return (
    <section
      className={cx('wpl-carousel', media && 'wpl-carousel-media')}
      aria-roledescription="carousel"
      aria-label={label || t('carousel')}
    >
      <div
        ref={viewport}
        className="wpl-carousel-viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        <div
          className="wpl-carousel-track"
          style={{ ['--wpl-carousel-index' as string]: String(current) }}
        >
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === current;
            return (
              <div
                key={slide.id}
                id={`${uid}-panel-${slide.id}`}
                className="wpl-carousel-slide"
                role="tabpanel"
                aria-roledescription="slide"
                aria-label={`${slide.label}, ${slideIndex + 1} ${t('of')} ${count}`}
                aria-hidden={active ? undefined : true}
                inert={active ? undefined : true}
                tabIndex={active ? -1 : undefined}
                data-current={active ? 'true' : undefined}
                data-slide-index={slideIndex}
              >
                <SlideBody slide={slide} active={active} />
              </div>
            );
          })}
        </div>
        {media ? (
          <>
            <p className="wpl-carousel-count" aria-hidden="true">
              {position}
            </p>
            <div className="wpl-carousel-nav">
              <Control label={t('previous')} disabled={!canMove(current, -1, count, loop)} onClick={() => go(-1)}>
                <Icon name="chevronLeft" />
              </Control>
              <Control label={t('next')} disabled={!canMove(current, 1, count, loop)} onClick={() => go(1)}>
                <Icon name="chevronRight" />
              </Control>
            </div>
            <div className="wpl-carousel-dots" role="tablist" aria-label={label || t('carousel')}>
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  className="wpl-carousel-dot"
                  aria-selected={slideIndex === current}
                  aria-controls={`${uid}-panel-${slide.id}`}
                  tabIndex={slideIndex === current ? 0 : -1}
                  onClick={() => commit(slideIndex)}
                  onKeyDown={onTabKeyDown}
                >
                  <span className="wpl-sr-only">{slide.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {!media ? (
        <div className="wpl-carousel-bar">
          <button
            type="button"
            className="wpl-btn wpl-btn-outline wpl-btn-sm"
            disabled={!canMove(current, -1, count, loop)}
            onClick={() => go(-1)}
          >
            <Icon name="chevronLeft" />
            <span className="wpl-sr-only">{t('previous')}</span>
          </button>
          <div className="wpl-carousel-dots" role="tablist" aria-label={label || t('carousel')}>
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                className="wpl-carousel-dot"
                aria-selected={slideIndex === current}
                aria-controls={`${uid}-panel-${slide.id}`}
                tabIndex={slideIndex === current ? 0 : -1}
                onClick={() => commit(slideIndex)}
                onKeyDown={onTabKeyDown}
              >
                <span className="wpl-sr-only">{slide.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="wpl-btn wpl-btn-outline wpl-btn-sm"
            disabled={!canMove(current, 1, count, loop)}
            onClick={() => go(1)}
          >
            <Icon name="chevronRight" />
            <span className="wpl-sr-only">{t('next')}</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SlideBody({ slide, active }: { slide: CarouselSlide; active: boolean }) {
  return (
    <>
      {slide.src ? (
        <figure className="wpl-carousel-figure">
          <img
            className="wpl-carousel-image"
            src={slide.src}
            alt={slide.alt ?? ''}
            draggable={false}
            loading={active ? 'eager' : 'lazy'}
          />
          <figcaption className="wpl-carousel-caption">
            <strong>{slide.label}</strong>
            {slide.caption ? <span>{slide.caption}</span> : null}
          </figcaption>
        </figure>
      ) : null}
      {slide.content ? <div className="wpl-carousel-copy">{slide.content}</div> : null}
      {!slide.src && !slide.content ? <p className="wpl-carousel-copy">{slide.label}</p> : null}
    </>
  );
}

function Control({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="wpl-carousel-control" aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
