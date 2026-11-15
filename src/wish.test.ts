import { describe, expect, it } from 'vite-plus/test';
import { isNorwegianVisitor, possessive, priceSearchLinks, shopLabel, thumbHue } from './wish';

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

describe('priceSearchLinks', () => {
  it('searches Prisjakt and Google Shopping for the title', () => {
    expect(priceSearchLinks('Vinglas')).toEqual([
      { label: 'Sök på Prisjakt', href: 'https://www.prisjakt.nu/search?query=Vinglas' },
      { label: 'Sök på Google Shopping', href: 'https://www.google.com/search?udm=28&q=Vinglas' },
    ]);
  });

  it('encodes spaces, Swedish letters and characters that would break the URL', () => {
    const [prisjakt] = priceSearchLinks(' Kokbok & grönt/50% ');
    expect(prisjakt!.href).toBe('https://www.prisjakt.nu/search?query=Kokbok%20%26%20gr%C3%B6nt%2F50%25');
  });
});

describe('isNorwegianVisitor', () => {
  it('trusts the country when it is known', () => {
    expect(isNorwegianVisitor('NO', 'sv-SE')).toBe(true);
    expect(isNorwegianVisitor('no', null)).toBe(true);
    expect(isNorwegianVisitor('SE', 'nb-NO')).toBe(false);
  });

  it('falls back to the preferred language', () => {
    expect(isNorwegianVisitor(null, 'nb-NO,nb;q=0.9,en;q=0.8')).toBe(true);
    expect(isNorwegianVisitor(undefined, 'nn')).toBe(true);
    expect(isNorwegianVisitor(null, 'sv-SE,sv;q=0.9,nb;q=0.5')).toBe(false);
    expect(isNorwegianVisitor(null, null)).toBe(false);
  });
});

describe('priceSearchLinks in Norway', () => {
  it('points Prisjakt at the Norwegian site', () => {
    expect(priceSearchLinks('Vinglas', true)[0]!.href).toBe('https://www.prisjakt.no/search?query=Vinglas');
  });
});
