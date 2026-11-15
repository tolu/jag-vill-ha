import { describe, expect, it } from 'vite-plus/test';
import { checkClaim, checkUsername, normalizeUsername } from './username';

describe('normalizeUsername', () => {
  it('lowercases and trims', () => {
    expect(normalizeUsername('  Tobias ')).toBe('tobias');
  });
});

describe('checkUsername', () => {
  it.each(['tobias', 'anna-karin', 'abc', 'a1b2c3', 'x'.repeat(30)])('accepts %s', (name) => {
    expect(checkUsername(name)).toBeNull();
  });

  it.each(['ab', '', 'x'.repeat(31)])('rejects wrong length: "%s"', (name) => {
    expect(checkUsername(name)).toBe('length');
  });

  it.each(['tobias.lundin', 'Tobias', 'åsa-b', 'a b c', 'a_b_c', 'a/b/c'])(
    'rejects other characters: %s',
    (name) => {
      expect(checkUsername(name)).toBe('characters');
    },
  );

  it.each(['-abc', 'abc-', 'a--b'])('rejects misplaced hyphens: %s', (name) => {
    expect(checkUsername(name)).toBe('hyphen');
  });

  it.each(['login', 'api', 'icons', 'admin'])('rejects reserved name: %s', (name) => {
    expect(checkUsername(name)).toBe('reserved');
  });
});

describe('checkClaim', () => {
  const free = async () => false;
  const taken = async () => true;

  it('accepts a free, valid name and normalizes it', async () => {
    expect(await checkClaim(' Anna ', free)).toEqual({ ok: true, username: 'anna' });
  });

  it('rejects a taken name', async () => {
    expect(await checkClaim('anna', taken)).toMatchObject({ ok: false, problem: 'taken' });
  });

  it('rejects a reserved name without asking the database', async () => {
    let asked = false;
    const result = await checkClaim('login', async () => {
      asked = true;
      return false;
    });
    expect(result).toMatchObject({ ok: false, problem: 'reserved' });
    expect(asked).toBe(false);
  });

  it('rejects an invalid name with a message', async () => {
    expect(await checkClaim('a b', free)).toMatchObject({ ok: false, problem: 'characters', message: expect.any(String) });
  });
});
