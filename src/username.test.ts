import { describe, expect, it } from 'vite-plus/test';
import { checkClaim, checkUsername, confirmsDeletion, defaultDisplayName, normalizeUsername } from './username';

describe('normalizeUsername', () => {
  it('lowercases and trims', () => {
    expect(normalizeUsername('  Tobias ')).toBe('tobias');
  });

  it.each([
    ['Görel', 'gorel'],
    ['Åsa Öberg', 'asa-oberg'],
    ['Mamma  Lundin ', 'mamma-lundin'],
    ['André', 'andre'],
    ['Søren Næss', 'soren-naess'],
    ['anna - karin', 'anna-karin'],
    ['-anna-', 'anna'],
  ])('turns "%s" into the address %s', (typed, address) => {
    expect(normalizeUsername(typed)).toBe(address);
  });
});

describe('defaultDisplayName', () => {
  it.each([
    ['mamma', 'Mamma'],
    ['gorel-lundin', 'Gorel Lundin'],
    ['a1b2', 'A1b2'],
  ])('%s becomes %s', (username, name) => {
    expect(defaultDisplayName(username)).toBe(name);
  });
});

describe('checkUsername', () => {
  it.each(['tobias', 'anna-karin', 'abc', 'a1b2c3', 'x'.repeat(30)])('accepts %s', (name) => {
    expect(checkUsername(name)).toBeNull();
  });

  it.each(['ab', '', 'x'.repeat(31)])('rejects wrong length: "%s"', (name) => {
    expect(checkUsername(name)).toBe('length');
  });

  it.each(['tobias.lundin', 'Tobias', 'åsa-b', 'a b c', 'a_b_c', 'a/b/c'])('rejects other characters: %s', (name) => {
    expect(checkUsername(name)).toBe('characters');
  });

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
    expect(await checkClaim('a.b', free)).toMatchObject({ ok: false, problem: 'characters', message: expect.any(String) });
  });

  it('accepts a name typed the way people write names', async () => {
    expect(await checkClaim('Görel Lundin', free)).toEqual({ ok: true, username: 'gorel-lundin' });
  });
});

describe('confirmsDeletion', () => {
  it('accepts the username, forgiving case and surrounding spaces', () => {
    expect(confirmsDeletion('anna', 'anna')).toBe(true);
    expect(confirmsDeletion('  Anna ', 'anna')).toBe(true);
  });

  it.each(['', 'ann', 'anna-karin', 'ja', undefined, null])('refuses %s', (typed) => {
    expect(confirmsDeletion(typed, 'anna')).toBe(false);
  });
});
