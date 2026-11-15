import { describe, expect, it } from 'vite-plus/test';
import { possessive, shopLabel, thumbHue } from './wish';

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

describe('shopLabel', () => {
  it('names the shop without www', () => {
    expect(shopLabel('https://www.komplett.no/product/1335753/x?queryid=1')).toBe('Se hos komplett.no');
    expect(shopLabel('https://butik.se/a')).toBe('Se hos butik.se');
  });

  it('keeps other subdomains', () => {
    expect(shopLabel('https://shop.exempel.se/')).toBe('Se hos shop.exempel.se');
  });

  it('does not break on a stored value that is not a URL', () => {
    expect(shopLabel('inte en länk')).toBe('Se länken');
  });
});
