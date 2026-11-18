import { describe, expect, it } from 'vitest';
import { buildInfo } from './build-info';

const SHA = '831f396a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f';

describe('buildInfo', () => {
  it('writes the time in Swedish, in Swedish winter time', () => {
    const info = buildInfo(new Date('2026-11-18T20:08:00Z'), SHA);
    expect(info.label).toBe('18 nov. 2026 21:08');
    expect(info.iso).toBe('2026-11-18T20:08:00.000Z');
  });

  it('follows summer time, also across midnight', () => {
    expect(buildInfo(new Date('2026-06-30T22:30:00Z'), SHA).label).toBe('1 juli 2026 00:30');
  });

  it('shortens the commit and links to it', () => {
    expect(buildInfo(new Date(0), SHA).commit).toEqual({
      short: '831f396',
      url: `https://github.com/tolu/jag-vill-ha/commit/${SHA}`,
    });
  });

  it('has no commit on a local build', () => {
    expect(buildInfo(new Date(0), undefined).commit).toBeNull();
    expect(buildInfo(new Date(0), '').commit).toBeNull();
  });

  it('does not make a link out of something that is not a commit', () => {
    expect(buildInfo(new Date(0), 'main"><script>').commit).toBeNull();
  });
});
