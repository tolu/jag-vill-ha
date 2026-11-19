import { describe, expect, it } from 'vite-plus/test';
import { isFetchableUrl, parseLinkMeta } from './link-meta';

describe('isFetchableUrl', () => {
  it.each(['https://butik.se/produkt/1', 'http://www.exempel-butik.com/a?b=c', 'https://sub.domän.se/'])('allows %s', (url) => {
    expect(isFetchableUrl(url)).toBe(true);
  });

  it.each([
    'ftp://butik.se/fil',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'http://localhost/admin',
    'http://127.0.0.1/',
    'http://192.168.1.1/',
    'http://[::1]/',
    'http://169.254.169.254/latest/meta-data',
    'http://intranet/',
    'http://router.local/',
    'http://db.internal/',
    'https://butik.se:8443/',
    'https://user:pass@butik.se/',
    'inte en länk',
    '',
  ])('refuses %s', (url) => {
    expect(isFetchableUrl(url)).toBe(false);
  });
});

describe('parseLinkMeta', () => {
  const page = 'https://butik.se/produkt/pajform';

  it('prefers Open Graph', () => {
    const html = `<html><head><title>Köp nu | Butik</title>
      <meta property="og:title" content="Non-stick pajform 28 cm">
      <meta property="og:image" content="https://cdn.butik.se/pajform.jpg"></head></html>`;
    expect(parseLinkMeta(html, page)).toEqual({ title: 'Non-stick pajform 28 cm', image: 'https://cdn.butik.se/pajform.jpg' });
  });

  it('handles reversed attribute order and single quotes', () => {
    const html = `<meta content='Vinglas, 4 st' property='og:title'><meta content="/img/glas.png" name="twitter:image">`;
    expect(parseLinkMeta(html, page)).toEqual({ title: 'Vinglas, 4 st', image: 'https://butik.se/img/glas.png' });
  });

  // As seen on a real shop: the logo comes first, the product picture second.
  it('skips a logo when the page lists several images', () => {
    const html = `<meta property="og:image" content="https://butik.se/logo/310/apple-touch-icon.png" />
      <meta property="og:image" content="https://butik.se/product-media/200/1335753.jpg" />`;
    expect(parseLinkMeta(html, page).image).toBe('https://butik.se/product-media/200/1335753.jpg');
  });

  it('still uses a logo when it is the only image', () => {
    const html = `<meta property="og:image" content="https://butik.se/logo.png" />`;
    expect(parseLinkMeta(html, page).image).toBe('https://butik.se/logo.png');
  });

  it('falls back to the <title> and to no image', () => {
    expect(parseLinkMeta('<title>\n  Stickade sockor\n</title>', page)).toEqual({ title: 'Stickade sockor', image: null });
  });

  it('decodes entities', () => {
    const html = `<meta property="og:title" content="Tom &amp; Jerry&#39;s &quot;bok&quot; &#xE5;">`;
    expect(parseLinkMeta(html, page).title).toBe(`Tom & Jerry's "bok" å`);
  });

  it('cuts very long titles', () => {
    expect(parseLinkMeta(`<title>${'x'.repeat(500)}</title>`, page).title).toHaveLength(120);
  });

  it('drops an image that points somewhere unsafe', () => {
    const html = `<meta property="og:image" content="http://localhost/secret.png">`;
    expect(parseLinkMeta(html, page).image).toBeNull();
  });

  it('gives nothing for a page without metadata', () => {
    expect(parseLinkMeta('<html><body>Hej</body></html>', page)).toEqual({ title: null, image: null });
  });
});
