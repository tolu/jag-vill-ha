import { describe, expect, it } from 'vite-plus/test';
import { checkImage, MAX_IMAGE_BYTES, parseWishForm } from './wish-form';

describe('parseWishForm', () => {
  it('needs nothing but a title', () => {
    expect(parseWishForm({ titel: ' Vinglas ' })).toEqual({
      ok: true,
      values: { title: 'Vinglas', url: null, note: null, icon: null },
    });
  });

  it('reads every field', () => {
    expect(
      parseWishForm({ titel: 'Skor', lank: 'https://butik.se/skor', kommentar: 'Storlek 44', ikon: 'sneaker' }),
    ).toEqual({
      ok: true,
      values: { title: 'Skor', url: 'https://butik.se/skor', note: 'Storlek 44', icon: 'sneaker' },
    });
  });

  it.each([
    ['titel', { titel: '  ' }],
    ['titel', { titel: 'x'.repeat(121) }],
    ['lank', { titel: 'a', lank: 'javascript:alert(1)' }],
    ['lank', { titel: 'a', lank: 'inte en länk' }],
    ['kommentar', { titel: 'a', kommentar: 'x'.repeat(201) }],
    ['ikon', { titel: 'a', ikon: 'not-an-icon' }],
  ])('rejects a bad %s', (field, body) => {
    expect(parseWishForm(body)).toEqual({ ok: false, problems: [field] });
  });
});

describe('checkImage', () => {
  it('treats a missing or empty file field as no image', () => {
    expect(checkImage(undefined)).toEqual({ kind: 'none' });
    expect(checkImage('')).toEqual({ kind: 'none' });
    expect(checkImage({ size: 0, type: 'application/octet-stream' })).toEqual({ kind: 'none' });
  });

  it('accepts common photo formats', () => {
    expect(checkImage({ size: 1000, type: 'image/jpeg' })).toEqual({ kind: 'image', extension: 'jpg', contentType: 'image/jpeg' });
    expect(checkImage({ size: 1000, type: 'image/webp' })).toMatchObject({ kind: 'image', extension: 'webp' });
  });

  it.each(['image/svg+xml', 'text/html', 'application/pdf', ''])('refuses %s', (type) => {
    expect(checkImage({ size: 1000, type })).toEqual({ kind: 'bad', problem: 'type' });
  });

  it('refuses files over the size limit', () => {
    expect(checkImage({ size: MAX_IMAGE_BYTES + 1, type: 'image/png' })).toEqual({ kind: 'bad', problem: 'size' });
    expect(checkImage({ size: MAX_IMAGE_BYTES, type: 'image/png' })).toMatchObject({ kind: 'image' });
  });
});
