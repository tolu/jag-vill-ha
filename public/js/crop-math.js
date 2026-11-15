// Geometry for choosing a square part of a picture. No DOM in here, so it can
// be tested: src/crop-math.test.js.
//
// A crop is { zoom, cx, cy }: zoom 1 shows the largest square that fits inside
// the picture, and (cx, cy) is the centre of the frame in the picture's own
// pixels. The frame may reach outside the picture; what is empty there is
// filled with the colour of the picture's edge.

export const MAX_ZOOM = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** The zoom at which the whole picture fits inside the frame. */
export function minZoom(source) {
  return Math.min(source.width, source.height) / Math.max(source.width, source.height);
}

/** The largest centred square: what a new picture starts as. */
export function centred(source) {
  return { zoom: 1, cx: source.width / 2, cy: source.height / 2 };
}

/** The whole picture, centred in the frame. */
export function whole(source) {
  return { ...centred(source), zoom: minZoom(source) };
}

/**
 * A crop kept within the rules: the zoom in range, and the centre of the frame
 * on the picture, so the picture can be moved freely but never lost.
 */
function settle(source, crop) {
  return {
    zoom: clamp(crop.zoom, minZoom(source), MAX_ZOOM),
    cx: clamp(crop.cx, 0, source.width),
    cy: clamp(crop.cy, 0, source.height),
  };
}

/** The square a crop shows, in picture pixels. It may reach outside the picture. */
export function cropRect(source, crop) {
  const { zoom, cx, cy } = settle(source, crop);
  const size = Math.min(source.width, source.height) / zoom;
  return { x: cx - size / 2, y: cy - size / 2, size };
}

/** Dragging the picture by (dx, dy) pixels of a view that is `viewSize` wide. */
export function pan(source, crop, dx, dy, viewSize) {
  const perPixel = cropRect(source, crop).size / viewSize;
  return settle(source, { ...crop, cx: crop.cx - dx * perPixel, cy: crop.cy - dy * perPixel });
}

/** Zooming in or out around the centre of the frame. */
export function zoomTo(source, crop, zoom) {
  return settle(source, { ...crop, zoom });
}

/** How wide the saved picture becomes: never larger than the crop, never above the limit. */
export function outputSize(rect, maxSide) {
  return Math.max(1, Math.round(Math.min(rect.size, maxSide)));
}

/**
 * The colour most of a picture's edge has, given as RGBA bytes: the median of
 * each channel, so a product that touches one side does not tint it. A product
 * on white gives white and the fill does not show; a photo gives a tone of its
 * own. See-through pixels count as white, as in the saved file.
 */
export function edgeColour(data, width, height) {
  const channels = [[], [], []];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) continue;
      const at = (y * width + x) * 4;
      const alpha = data[at + 3] / 255;
      for (let channel = 0; channel < 3; channel++) channels[channel].push(data[at + channel] * alpha + 255 * (1 - alpha));
    }
  }
  const [r, g, b] = channels.map((values) => Math.round(values.sort((a, b) => a - b)[Math.floor(values.length / 2)]));
  return `rgb(${r} ${g} ${b})`;
}
