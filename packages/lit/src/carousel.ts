import {
  canMove,
  carouselIndexFromKey,
  clampIndex,
  createId,
  cx,
  formatNumber,
  moveIndex,
  readingDirection,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { localeOf, translate } from './provider';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export class Carousel extends WplElement {
  static override properties = {
    label: { type: String },
    slides: { attribute: false },
    index: { type: Number },
    defaultIndex: { type: Number, attribute: 'default-index' },
    loop: { type: Boolean },
  };

  declare label: string;
  declare slides: CarouselSlide[];
  declare index: number | null;
  declare defaultIndex: number | null;
  declare loop: boolean;
  private internal = 0;
  private seeded = false;
  private startX: number | null = null;
  private readonly uid = createId('wpl-carousel');

  constructor() {
    super();
    this.label = '';
    this.slides = [];
    this.index = null;
    this.defaultIndex = null;
    this.loop = false;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.index === null) this.internal = this.defaultIndex ?? 0;
  }

  private current(): number {
    return clampIndex(this.index === null ? this.internal : this.index, this.slides.length);
  }

  private commit(next: number): void {
    const clamped = clampIndex(next, this.slides.length);
    const active = document.activeElement;
    const leaving = this.view.querySelector<HTMLElement>('[data-current="true"]');
    const shouldMove = Boolean(leaving && active instanceof Node && leaving.contains(active));
    if (this.index === null) {
      this.internal = clamped;
      this.requestUpdate();
    }
    this.emit('wpl-change', { value: clamped });
    if (shouldMove) {
      queueMicrotask(() => this.view.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`)?.focus());
    }
  }

  private go(delta: number): void {
    const current = this.current();
    const count = this.slides.length;
    if (!canMove(current, delta, count, this.loop)) return;
    this.commit(moveIndex(current, delta, count, this.loop));
  }

  protected override render(): RenderResult {
    const slides = this.slides;
    const count = slides.length;
    if (count === 0) return html`<p class="wpl-muted">${translate(this, 'empty')}</p>`;
    const current = this.current();
    const locale = localeOf(this);
    const media = slides.some((slide) => Boolean(slide.src));
    const position = `${formatNumber(current + 1, locale)} / ${formatNumber(count, locale)}`;
    const label = this.label || translate(this, 'carousel');
    return html`<section class=${cx('wpl-carousel', media && 'wpl-carousel-media')} aria-roledescription="carousel" aria-label=${label}>
      <div
        class="wpl-carousel-viewport"
        @pointerdown=${(event: PointerEvent) => {
          if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
          this.startX = event.clientX;
        }}
        @pointerup=${(event: PointerEvent) => {
          if (this.startX === null) return;
          const delta = event.clientX - this.startX;
          this.startX = null;
          if (Math.abs(delta) < 48) return;
          const direction = readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null);
          const forward = direction === 'rtl' ? delta > 0 : delta < 0;
          this.go(forward ? 1 : -1);
        }}
        @pointercancel=${() => {
          this.startX = null;
        }}
      >
        <div class="wpl-carousel-track" style=${`--wpl-carousel-index:${current}`}>
          ${slides.map((slide, slideIndex) => {
            const active = slideIndex === current;
            return html`<div
              id=${`${this.uid}-panel-${slide.id}`}
              class="wpl-carousel-slide"
              role="tabpanel"
              aria-roledescription="slide"
              aria-label=${`${slide.label}, ${slideIndex + 1} ${translate(this, 'of')} ${count}`}
              aria-hidden=${active ? nothing : 'true'}
              ?inert=${!active}
              tabindex=${active ? '-1' : nothing}
              data-current=${active ? 'true' : nothing}
              data-slide-index=${slideIndex}
            >
              ${slide.src
                ? html`<figure class="wpl-carousel-figure">
                    <img class="wpl-carousel-image" src=${slide.src} alt=${slide.alt ?? ''} draggable="false" loading=${active ? 'eager' : 'lazy'} />
                    <figcaption class="wpl-carousel-caption">
                      <strong>${slide.label}</strong>
                      ${slide.caption ? html`<span>${slide.caption}</span>` : nothing}
                    </figcaption>
                  </figure>`
                : nothing}
              ${slide.content ? html`<div class="wpl-carousel-copy">${slide.content}</div>` : nothing}
              ${!slide.src && !slide.content ? html`<p class="wpl-carousel-copy">${slide.label}</p>` : nothing}
            </div>`;
          })}
        </div>
        ${media
          ? html`<p class="wpl-carousel-count" aria-hidden="true">${position}</p>
              <div class="wpl-carousel-nav">
                <button type="button" class="wpl-carousel-control" aria-label=${translate(this, 'previous')} ?disabled=${!canMove(current, -1, count, this.loop)} @click=${() => this.go(-1)}>
                  ${iconSvg('chevronLeft')}
                </button>
                <button type="button" class="wpl-carousel-control" aria-label=${translate(this, 'next')} ?disabled=${!canMove(current, 1, count, this.loop)} @click=${() => this.go(1)}>
                  ${iconSvg('chevronRight')}
                </button>
              </div>
              ${this.dots(label, current)}`
          : html`<div class="wpl-carousel-bar">
              <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" aria-label=${translate(this, 'previous')} ?disabled=${!canMove(current, -1, count, this.loop)} @click=${() => this.go(-1)}>
                ${iconSvg('chevronLeft')}<span class="wpl-sr-only">${translate(this, 'previous')}</span>
              </button>
              ${this.dots(label, current)}
              <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" aria-label=${translate(this, 'next')} ?disabled=${!canMove(current, 1, count, this.loop)} @click=${() => this.go(1)}>
                ${iconSvg('chevronRight')}<span class="wpl-sr-only">${translate(this, 'next')}</span>
              </button>
            </div>`}
      </div>
    </section>`;
  }

  private dots(label: string, current: number): RenderResult {
    return html`<div class="wpl-carousel-dots" role="tablist" aria-label=${label}>
      ${this.slides.map((slide, slideIndex) => html`<button
        type="button"
        role="tab"
        class="wpl-carousel-dot"
        aria-selected=${slideIndex === current ? 'true' : 'false'}
        aria-controls=${`${this.uid}-panel-${slide.id}`}
        tabindex=${slideIndex === current ? '0' : '-1'}
        @click=${() => this.commit(slideIndex)}
        @keydown=${(event: KeyboardEvent) => {
          const next = carouselIndexFromKey(current, this.slides.length, event.key, readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null), this.loop);
          if (next === null) return;
          event.preventDefault();
          this.commit(next);
          queueMicrotask(() => {
            const tabs = (event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null)?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
            tabs?.[next]?.focus();
          });
        }}
      >
        <span class="wpl-sr-only">${slide.label}</span>
      </button>`)}
    </div>`;
  }
}

defineTag('wpl-carousel', Carousel);
