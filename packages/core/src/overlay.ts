export type Placement = 'top' | 'bottom' | 'start' | 'end';

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedOverlay {
  top: number;
  left: number;
  placement: Placement;
}

function candidate(
  anchor: RectLike,
  overlay: { width: number; height: number },
  placement: Placement,
  gap: number,
): { top: number; left: number } {
  if (placement === 'bottom') {
    return {
      top: anchor.y + anchor.height + gap,
      left: anchor.x + anchor.width / 2 - overlay.width / 2,
    };
  }
  if (placement === 'top') {
    return {
      top: anchor.y - overlay.height - gap,
      left: anchor.x + anchor.width / 2 - overlay.width / 2,
    };
  }
  if (placement === 'end') {
    return {
      top: anchor.y + anchor.height / 2 - overlay.height / 2,
      left: anchor.x + anchor.width + gap,
    };
  }
  return {
    top: anchor.y + anchor.height / 2 - overlay.height / 2,
    left: anchor.x - overlay.width - gap,
  };
}

function fits(
  point: { top: number; left: number },
  overlay: { width: number; height: number },
  viewport: { width: number; height: number },
  margin: number,
): boolean {
  return (
    point.left >= margin &&
    point.top >= margin &&
    point.left + overlay.width <= viewport.width - margin &&
    point.top + overlay.height <= viewport.height - margin
  );
}

export function placeOverlay(
  anchor: RectLike,
  overlay: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: Placement = 'bottom',
  gap = 8,
): PlacedOverlay {
  const order: Placement[] = [preferred, 'bottom', 'top', 'end', 'start'];
  const unique = order.filter((item, index) => order.indexOf(item) === index);
  for (const placement of unique) {
    const point = candidate(anchor, overlay, placement, gap);
    if (fits(point, overlay, viewport, 8)) return { ...point, placement };
  }
  const fallback = candidate(anchor, overlay, preferred, gap);
  const left = Math.min(
    Math.max(8, fallback.left),
    Math.max(8, viewport.width - overlay.width - 8),
  );
  const top = Math.min(
    Math.max(8, fallback.top),
    Math.max(8, viewport.height - overlay.height - 8),
  );
  return { top, left, placement: preferred };
}
