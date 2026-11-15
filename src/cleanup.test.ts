import { describe, expect, it } from 'vite-plus/test';
import { findOrphans, sweepLooksSane } from './cleanup';

const now = new Date('2026-11-20T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const key = (prefix: string, n: number) => `${prefix}/1/00000000-0000-4000-8000-${String(n).padStart(12, '0')}.jpg`;

describe('findOrphans', () => {
  it('finds old pictures that nothing refers to', () => {
    const objects = [
      { key: key('w', 1), uploaded: daysAgo(10) },
      { key: key('w', 2), uploaded: daysAgo(10) },
    ];
    expect(findOrphans(objects, new Set([key('w', 1)]), now)).toEqual([key('w', 2)]);
  });

  it('keeps everything that is referred to, wish pictures and profile pictures alike', () => {
    const objects = [
      { key: key('w', 1), uploaded: daysAgo(10) },
      { key: key('a', 2), uploaded: daysAgo(10) },
    ];
    expect(findOrphans(objects, new Set([key('w', 1), key('a', 2)]), now)).toEqual([]);
  });

  it('leaves a fresh upload alone, since its wish may still be on its way', () => {
    const objects = [
      { key: key('w', 1), uploaded: daysAgo(0.5) },
      { key: key('w', 2), uploaded: daysAgo(1.5) },
    ];
    expect(findOrphans(objects, new Set(), now)).toEqual([key('w', 2)]);
  });

  it('never touches keys that are not ours', () => {
    const objects = [
      { key: 'backup/database.sql', uploaded: daysAgo(100) },
      { key: 'w/1/not-a-uuid.jpg', uploaded: daysAgo(100) },
      { key: 'w/1/00000000-0000-4000-8000-000000000001.svg', uploaded: daysAgo(100) },
    ];
    expect(findOrphans(objects, new Set(), now)).toEqual([]);
  });

  it('finds nothing in an empty bucket', () => {
    expect(findOrphans([], new Set(), now)).toEqual([]);
  });
});

describe('sweepLooksSane', () => {
  it('allows a handful of strays', () => {
    expect(sweepLooksSane(12, 10)).toBe(true);
    expect(sweepLooksSane(1000, 40)).toBe(true);
  });

  it('refuses to delete more than half of a real bucket', () => {
    expect(sweepLooksSane(1000, 501)).toBe(false);
    expect(sweepLooksSane(1000, 1000)).toBe(false);
  });

  it('allows up to half', () => {
    expect(sweepLooksSane(1000, 500)).toBe(true);
  });
});
