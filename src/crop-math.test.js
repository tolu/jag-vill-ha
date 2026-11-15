import { describe, expect, it } from 'vite-plus/test';
import { centred, cropRect, MAX_ZOOM, outputSize, pan, zoomTo } from '../public/js/crop-math.js';

const wide = { width: 600, height: 400 };
const tall = { width: 300, height: 900 };

describe('cropRect', () => {
  it('starts as the largest centred square', () => {
    expect(cropRect(wide, centred(wide))).toEqual({ x: 100, y: 0, size: 400 });
    expect(cropRect(tall, centred(tall))).toEqual({ x: 0, y: 300, size: 300 });
  });

  it('shrinks with zoom, around the centre', () => {
    expect(cropRect(wide, { zoom: 2, cx: 300, cy: 200 })).toEqual({ x: 200, y: 100, size: 200 });
  });

  it('never reaches outside the picture', () => {
    expect(cropRect(wide, { zoom: 1, cx: -500, cy: -500 })).toEqual({ x: 0, y: 0, size: 400 });
    expect(cropRect(wide, { zoom: 2, cx: 9999, cy: 9999 })).toEqual({ x: 400, y: 200, size: 200 });
  });

  it('ignores a zoom outside the allowed range', () => {
    expect(cropRect(wide, { zoom: 0.2, cx: 300, cy: 200 }).size).toBe(400);
    expect(cropRect(wide, { zoom: 99, cx: 300, cy: 200 }).size).toBe(400 / MAX_ZOOM);
  });
});

describe('pan', () => {
  it('moves the picture with the pointer, in picture pixels', () => {
    // A 200 px view of a 400 px square: one view pixel is two picture pixels.
    const moved = pan(wide, centred(wide), -50, 0, 200);
    expect(cropRect(wide, moved)).toEqual({ x: 200, y: 0, size: 400 });
  });

  it('stops at the edge and does not build up hidden distance', () => {
    const far = pan(wide, centred(wide), -5000, 0, 200);
    expect(cropRect(wide, far).x).toBe(200);
    // One step back moves at once; the overshoot was not remembered.
    expect(cropRect(wide, pan(wide, far, 10, 0, 200)).x).toBe(180);
  });

  it('cannot move along a side that is already fully shown', () => {
    expect(cropRect(wide, pan(wide, centred(wide), 0, 80, 200)).y).toBe(0);
  });
});

describe('zoomTo', () => {
  it('keeps the centre when there is room', () => {
    expect(zoomTo(wide, centred(wide), 2)).toEqual({ zoom: 2, cx: 300, cy: 200 });
  });

  it('pulls the view back inside when zooming out near an edge', () => {
    const corner = pan(wide, zoomTo(wide, centred(wide), 4), -9999, -9999, 200);
    expect(cropRect(wide, corner)).toEqual({ x: 500, y: 300, size: 100 });
    expect(cropRect(wide, zoomTo(wide, corner, 1))).toEqual({ x: 200, y: 0, size: 400 });
  });

  it('clamps the zoom', () => {
    expect(zoomTo(wide, centred(wide), 0).zoom).toBe(1);
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
