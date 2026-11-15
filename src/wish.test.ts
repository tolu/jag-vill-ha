import { describe, expect, it } from 'vite-plus/test';
import { formatPrice, isTaken, metaLine, possessive, remaining, thumbHue } from './wish';

describe('remaining / isTaken', () => {
  it('counts what is left', () => {
    expect(remaining(4, 2)).toBe(2);
    expect(isTaken(4, 2)).toBe(false);
  });

  it('is taken when everything is reserved', () => {
    expect(isTaken(1, 1)).toBe(true);
    expect(isTaken(4, 4)).toBe(true);
  });

  it('never goes negative when over-reserved', () => {
    expect(remaining(1, 3)).toBe(0);
    expect(isTaken(1, 3)).toBe(true);
  });
});

describe('formatPrice', () => {
  it('groups thousands the Swedish way', () => {
    expect(formatPrice(349)).toBe('349 kr');
    expect(formatPrice(1899).replace(/\s/g, ' ')).toBe('1 899 kr');
  });
});

describe('metaLine', () => {
  it('shows note and price for a single item', () => {
    expect(metaLine({ quantity: 1, price: 349, note: 'Lékué 28 cm' }, 0)).toBe('Lékué 28 cm · 349 kr');
  });

  it('shows how many are left once some are reserved', () => {
    expect(metaLine({ quantity: 4, price: 129, note: null }, 2)).toBe('2 av 4 kvar · 129 kr/st');
  });

  it('shows the full count when none are reserved', () => {
    expect(metaLine({ quantity: 4, price: 129, note: null }, 0)).toBe('4 st · 129 kr/st');
  });

  it('is empty without note or price', () => {
    expect(metaLine({ quantity: 1, price: null, note: null }, 0)).toBe('');
  });
});

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
