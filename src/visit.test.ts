import { describe, expect, it } from 'vite-plus/test';
import { countsAsVisit } from './visit';

const SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1';
const visit = { isOwner: false, path: '/gorel', userAgent: SAFARI, purpose: undefined, referer: undefined };

describe('countsAsVisit', () => {
  it('counts someone opening the list', () => {
    expect(countsAsVisit(visit)).toBe(true);
  });

  it('counts someone coming from another page', () => {
    expect(countsAsVisit({ ...visit, referer: 'https://jagvillha.fyi/' })).toBe(true);
    expect(countsAsVisit({ ...visit, referer: 'https://jagvillha.fyi/gorel-2' })).toBe(true);
  });

  it('does not count the owner', () => {
    expect(countsAsVisit({ ...visit, isOwner: true })).toBe(false);
  });

  it('does not count the page she lands on after reserving', () => {
    expect(countsAsVisit({ ...visit, referer: 'https://jagvillha.fyi/gorel' })).toBe(false);
    expect(countsAsVisit({ ...visit, referer: 'https://jagvillha.fyi/gorel?paxad=3' })).toBe(false);
  });

  it('does not count a page loaded ahead of time', () => {
    expect(countsAsVisit({ ...visit, purpose: 'prefetch;prerender' })).toBe(false);
  });

  it.each([
    ['no user agent', undefined],
    [
      'a link preview in iMessage',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
    ],
    ['a link preview in WhatsApp', 'WhatsApp/2.23.20.0'],
    ['a search crawler', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['a script', 'curl/8.7.1'],
    ['a headless browser', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36'],
  ])('does not count %s', (_label, userAgent) => {
    expect(countsAsVisit({ ...visit, userAgent })).toBe(false);
  });

  it('is not thrown by a referer that is no address', () => {
    expect(countsAsVisit({ ...visit, referer: 'about:blank' })).toBe(true);
    expect(countsAsVisit({ ...visit, referer: 'nonsense' })).toBe(true);
  });
});
