import { describe, expect, it } from 'vite-plus/test';
import { possessive, thumbHue } from './wish';

describe('thumbHue', () => {
  it('is stable and within the hue circle', () => {
    expect(thumbHue('Vinglas')).toBe(thumbHue('Vinglas'));
    expect(thumbHue('Vinglas')).toBeGreaterThanOrEqual(0);
    expect(thumbHue('Vinglas')).toBeLessThan(360);
  });
});

describe('possessive', () => {
  it('adds s', () => {
    expect(possessive('Anna')).toBe('Annas');
  });

  it.each(['Tobias', 'Max', 'Hafiz'])('leaves %s alone', (name) => {
    expect(possessive(name)).toBe(name);
  });
});
