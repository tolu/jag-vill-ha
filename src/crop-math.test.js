import { describe, expect, it } from 'vite-plus/test';
import { centred, cropRect, edgeColour, MAX_ZOOM, minZoom, outputSize, pan, whole, zoomTo } from '../public/js/crop-math.js';

const wide = { width: 600, height: 400 };
const tall = { width: 300, height: 900 };
const square = { width: 400, height: 400 };

describe('cropRect', () => {
  it('starts as the largest centred square', () => {
    expect(cropRect(wide, centred(wide))).toEqual({ x: 100, y: 0, size: 400 });
    expect(cropRect(tall, centred(tall))).toEqual({ x: 0, y: 300, size: 300 });
  });

  it('shrinks with zoom, around the centre', () => {
    expect(cropRect(wide, { zoom: 2, cx: 300, cy: 200 })).toEqual({ x: 200, y: 100, size: 200 });
  });

  it('may reach outside the picture, as long as its centre is on it', () => {
    expect(cropRect(wide, { zoom: 1, cx: 300, cy: 350 })).toEqual({ x: 100, y: 150, size: 400 });
    expect(cropRect(wide, { zoom: 1, cx: -500, cy: -500 })).toEqual({ x: -200, y: -200, size: 400 });
    expect(cropRect(wide, { zoom: 2, cx: 9999, cy: 9999 })).toEqual({ x: 500, y: 300, size: 200 });
  });

  it('ignores a zoom outside the allowed range', () => {
    expect(cropRect(wide, { zoom: 0.2, cx: 300, cy: 200 }).size).toBe(600);
    expect(cropRect(wide, { zoom: 99, cx: 300, cy: 200 }).size).toBe(400 / MAX_ZOOM);
  });
});

describe('whole', () => {
  it('fits all of the picture in the frame, centred', () => {
    expect(cropRect(wide, whole(wide))).toEqual({ x: 0, y: -100, size: 600 });
    expect(cropRect(tall, whole(tall))).toEqual({ x: -300, y: 0, size: 900 });
  });

  it('is the same as the start for a square picture', () => {
    expect(minZoom(square)).toBe(1);
    expect(whole(square)).toEqual(centred(square));
  });
});

describe('pan', () => {
  it('moves the picture with the pointer, in picture pixels', () => {
    // A 200 px view of a 400 px square: one view pixel is two picture pixels.
    const moved = pan(wide, centred(wide), -50, 0, 200);
    expect(cropRect(wide, moved)).toEqual({ x: 200, y: 0, size: 400 });
  });

  it('moves a square picture, which leaves part of the frame empty', () => {
    // The head at the top of a portrait: pull the picture down into the circle.
    expect(cropRect(square, pan(square, centred(square), 0, 50, 200))).toEqual({ x: 0, y: -100, size: 400 });
  });

  it('stops when the centre of the frame reaches the edge, without hidden distance', () => {
    const far = pan(wide, centred(wide), -5000, 0, 200);
    expect(cropRect(wide, far).x).toBe(400);
    // One step back moves at once; the overshoot was not remembered.
    expect(cropRect(wide, pan(wide, far, 10, 0, 200)).x).toBe(380);
  });
});

describe('zoomTo', () => {
  it('keeps the centre of the frame', () => {
    expect(zoomTo(wide, centred(wide), 2)).toEqual({ zoom: 2, cx: 300, cy: 200 });
    const corner = pan(wide, zoomTo(wide, centred(wide), 4), -9999, -9999, 200);
    expect(zoomTo(wide, corner, 1)).toEqual({ zoom: 1, cx: 600, cy: 400 });
  });

  it('clamps the zoom between the whole picture and the limit', () => {
    expect(zoomTo(wide, centred(wide), 0).zoom).toBe(400 / 600);
    expect(zoomTo(wide, centred(wide), 50).zoom).toBe(MAX_ZOOM);
  });
});

describe('outputSize', () => {
  it('downscales a large crop to the limit', () => {
    expect(outputSize({ size: 2400 }, 800)).toBe(800);
  });

  it('never enlarges a small crop', () => {
    expect(outputSize({ size: 123.4 }, 800)).toBe(123);
  });
});

describe('edgeColour', () => {
  // A 3 x 3 picture from one pixel per cell: `edge` around `middle`.
  const picture = (edge, middle) => new Uint8ClampedArray(Array.from({ length: 9 }, (_, i) => (i === 4 ? middle : edge)).flat());

  it('is the colour around the picture, whatever is in the middle', () => {
    expect(edgeColour(picture([255, 255, 255, 255], [200, 0, 0, 255]), 3, 3)).toBe('rgb(255 255 255)');
    expect(edgeColour(picture([10, 20, 30, 255], [255, 255, 255, 255]), 3, 3)).toBe('rgb(10 20 30)');
  });

  it('is not tinted by a product that touches one side', () => {
    // A 4 x 3 white picture whose bottom row is partly red.
    const white = [255, 255, 255, 255];
    const red = [200, 0, 0, 255];
    const data = new Uint8ClampedArray([white, white, white, white, white, white, white, white, white, red, red, white].flat());
    expect(edgeColour(data, 4, 3)).toBe('rgb(255 255 255)');
  });

  it('counts see-through pixels as white', () => {
    expect(edgeColour(picture([0, 0, 0, 0], [0, 0, 0, 255]), 3, 3)).toBe('rgb(255 255 255)');
  });
});
