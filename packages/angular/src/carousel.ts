import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  canMove,
  carouselIndexFromKey,
  clampIndex,
  cx,
  formatNumber,
  moveIndex,
  readingDirection,
} from '@white-plumeria/core';
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

export interface CarouselSlide {
  id: string;
  label: string;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

@Component({
  selector: 'wpl-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon],
  template: `
    @if (!count()) {
      <p class="wpl-muted">{{ emptyLabel() }}</p>
    } @else {
      <section [class]="classes()" aria-roledescription="carousel" [attr.aria-label]="accessibleLabel()">
        <div #viewport class="wpl-carousel-viewport" (pointerdown)="onPointerDown($event)" (pointerup)="onPointerUp($event)" (pointercancel)="startX = null">
          <div class="wpl-carousel-track" [style.--wpl-carousel-index]="current()">
            @for (slide of slides(); track slide.id; let slideIndex = $index) {
              <div
                class="wpl-carousel-slide"
                role="tabpanel"
                aria-roledescription="slide"
                [id]="uid + '-panel-' + slide.id"
                [attr.aria-label]="slide.label + ', ' + (slideIndex + 1) + ' ' + ofLabel() + ' ' + count()"
                [attr.aria-hidden]="slideIndex === current() ? null : true"
                [attr.inert]="slideIndex === current() ? null : ''"
                [attr.tabindex]="slideIndex === current() ? -1 : null"
                [attr.data-current]="slideIndex === current() ? 'true' : null"
                [attr.data-slide-index]="slideIndex"
              >
                @if (slide.src) {
                  <figure class="wpl-carousel-figure">
                    <img class="wpl-carousel-image" [src]="slide.src" [alt]="slide.alt || ''" draggable="false" [attr.loading]="slideIndex === current() ? 'eager' : 'lazy'" />
                    <figcaption class="wpl-carousel-caption">
                      <strong>{{ slide.label }}</strong>
                      @if (slide.caption) {
                        <span>{{ slide.caption }}</span>
                      }
                    </figcaption>
                  </figure>
                }
                @if (slide.content) {
                  <div class="wpl-carousel-copy">{{ slide.content }}</div>
                }
                @if (!slide.src && !slide.content) {
                  <p class="wpl-carousel-copy">{{ slide.label }}</p>
                }
              </div>
            }
          </div>
          @if (media()) {
            <p class="wpl-carousel-count" aria-hidden="true">{{ position() }}</p>
            <div class="wpl-carousel-nav">
              <button type="button" class="wpl-carousel-control" [attr.aria-label]="previousLabel()" [disabled]="!can(-1)" (click)="go(-1)">
                <wpl-icon name="chevronLeft" />
              </button>
              <button type="button" class="wpl-carousel-control" [attr.aria-label]="nextLabel()" [disabled]="!can(1)" (click)="go(1)">
                <wpl-icon name="chevronRight" />
              </button>
            </div>
            <div class="wpl-carousel-dots" role="tablist" [attr.aria-label]="accessibleLabel()">
              @for (slide of slides(); track slide.id; let slideIndex = $index) {
                <button type="button" role="tab" class="wpl-carousel-dot" [attr.aria-selected]="slideIndex === current()" [attr.aria-controls]="uid + '-panel-' + slide.id" [attr.tabindex]="slideIndex === current() ? 0 : -1" (click)="commit(slideIndex)" (keydown)="onTabKey($event)">
                  <span class="wpl-sr-only">{{ slide.label }}</span>
                </button>
              }
            </div>
          }
        </div>
        @if (!media()) {
          <div class="wpl-carousel-bar">
            <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" [disabled]="!can(-1)" (click)="go(-1)">
              <wpl-icon name="chevronLeft" />
              <span class="wpl-sr-only">{{ previousLabel() }}</span>
            </button>
            <div class="wpl-carousel-dots" role="tablist" [attr.aria-label]="accessibleLabel()">
              @for (slide of slides(); track slide.id; let slideIndex = $index) {
                <button type="button" role="tab" class="wpl-carousel-dot" [attr.aria-selected]="slideIndex === current()" [attr.aria-controls]="uid + '-panel-' + slide.id" [attr.tabindex]="slideIndex === current() ? 0 : -1" (click)="commit(slideIndex)" (keydown)="onTabKey($event)">
                  <span class="wpl-sr-only">{{ slide.label }}</span>
                </button>
              }
            </div>
            <button type="button" class="wpl-btn wpl-btn-outline wpl-btn-sm" [disabled]="!can(1)" (click)="go(1)">
              <wpl-icon name="chevronRight" />
              <span class="wpl-sr-only">{{ nextLabel() }}</span>
            </button>
          </div>
        }
      </section>
    }
  `,
})
export class Carousel {
  readonly label = input.required<string>();
  readonly slides = input.required<CarouselSlide[]>();
  readonly index = input<number>();
  readonly defaultIndex = input(0, { transform: numberAttribute });
  readonly loop = input(false, { transform: booleanAttribute });
  readonly indexChange = output<number>();
  private readonly wpl = injectWhitePlumeria();
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly internal = signal<number | null>(null);
  startX: number | null = null;
  readonly uid = 'wpl-carousel-' + Math.random().toString(36).slice(2, 8);
  readonly emptyLabel = computed(() => this.wpl.t('empty'));
  readonly previousLabel = computed(() => this.wpl.t('previous'));
  readonly nextLabel = computed(() => this.wpl.t('next'));
  readonly ofLabel = computed(() => this.wpl.t('of'));
  readonly count = computed(() => this.slides().length);
  readonly media = computed(() => this.slides().some((slide) => Boolean(slide.src)));
  readonly classes = computed(() => cx('wpl-carousel', this.media() && 'wpl-carousel-media'));
  readonly accessibleLabel = computed(() => this.label() || this.wpl.t('carousel'));

  current(): number {
    return clampIndex(this.index() ?? this.internal() ?? this.defaultIndex(), this.count());
  }

  position(): string {
    const locale = this.wpl.preferences().locale;
    return `${formatNumber(this.current() + 1, locale)} / ${formatNumber(this.count(), locale)}`;
  }

  can(delta: number): boolean {
    return canMove(this.current(), delta, this.count(), this.loop());
  }

  commit(next: number) {
    const clamped = clampIndex(next, this.count());
    const active = typeof document === 'undefined' ? null : document.activeElement;
    const leaving = this.viewport()?.nativeElement.querySelector<HTMLElement>('[data-current="true"]');
    const shouldMove = Boolean(leaving && active instanceof Node && leaving.contains(active));
    if (this.index() === undefined) this.internal.set(clamped);
    this.indexChange.emit(clamped);
    if (shouldMove) {
      queueMicrotask(() => this.viewport()?.nativeElement.querySelector<HTMLElement>(`[data-slide-index="${clamped}"]`)?.focus());
    }
  }

  go(delta: number) {
    if (!this.can(delta)) return;
    this.commit(moveIndex(this.current(), delta, this.count(), this.loop()));
  }

  onTabKey(event: KeyboardEvent) {
    const next = carouselIndexFromKey(this.current(), this.count(), event.key, readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null), this.loop());
    if (next === null) return;
    event.preventDefault();
    this.commit(next);
    queueMicrotask(() => {
      const tabs = event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') : undefined;
      tabs?.[next]?.focus();
    });
  }

  onPointerDown(event: PointerEvent) {
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
    this.startX = event.clientX;
  }

  onPointerUp(event: PointerEvent) {
    if (this.startX === null) return;
    const delta = event.clientX - this.startX;
    this.startX = null;
    if (Math.abs(delta) < 48) return;
    const direction = readingDirection(event.currentTarget instanceof HTMLElement ? event.currentTarget : null);
    const forward = direction === 'rtl' ? delta > 0 : delta < 0;
    this.go(forward ? 1 : -1);
  }
}
