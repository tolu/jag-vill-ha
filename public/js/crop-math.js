// Geometry for choosing a square part of a picture. No DOM in here, so it can
// be tested: src/crop-math.test.js.
//
// A crop is { zoom, cx, cy }: zoom 1 shows the largest square that fits, and
// (cx, cy) is the centre of the visible square in the picture's own pixels.

export const MAX_ZOOM = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The largest centred square: what was shown before cropping existed. */
export function centred(source) {
  return { zoom: 1, cx: source.width / 2, cy: source.height / 2 };
}

/** The square of the picture a crop shows, never reaching outside the picture. */
export function cropRect(source, crop) {
  const size = Math.min(source.width, source.height) / clamp(crop.zoom, 1, MAX_ZOOM);
  return {
    x: clamp(crop.cx - size / 2, 0, source.width - size),
    y: clamp(crop.cy - size / 2, 0, source.height - size),
    size,
  };
}

/** A crop pulled back inside the picture, so later moves start from what is shown. */
function settle(source, crop) {
  const zoom = clamp(crop.zoom, 1, MAX_ZOOM);
  const { x, y, size } = cropRect(source, { ...crop, zoom });
  return { zoom, cx: x + size / 2, cy: y + size / 2 };
}

/** Dragging the picture by (dx, dy) pixels of a view that is `viewSize` wide. */
export function pan(source, crop, dx, dy, viewSize) {
  const perPixel = cropRect(source, crop).size / viewSize;
  return settle(source, { ...crop, cx: crop.cx - dx * perPixel, cy: crop.cy - dy * perPixel });
}

/** Zooming in or out around the centre of what is shown. */
export function zoomTo(source, crop, zoom) {
  return settle(source, { ...crop, zoom });
}

/** How wide the saved picture becomes: never larger than the crop, never above the limit. */
export function outputSize(rect, maxSide) {
  return Math.max(1, Math.round(Math.min(rect.size, maxSide)));
}
