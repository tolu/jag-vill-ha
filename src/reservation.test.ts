import { describe, expect, it, vi } from 'vite-plus/test';
import { hashToken, newToken, parseGiverName, publicWishes, reservationsForViewer } from './reservation';

const wish = (id: number, title: string) => ({ id, title, url: null, note: null, icon: null, imageKey: null });
const wishes = [wish(1, 'Skor'), wish(2, 'Bok'), wish(3, 'Vinglas')];
const reservations = [
  { wishId: 1, name: 'Erik', tokenHash: 'eriks-hash' },
  { wishId: 2, name: 'Anna', tokenHash: 'annas-hash' },
];

describe('parseGiverName', () => {
  it('trims and collapses whitespace', () => {
    expect(parseGiverName('  Anna   Karin ')).toBe('Anna Karin');
  });

  it.each(['', '   ', 'x'.repeat(41), undefined, 42])('rejects %s', (input) => {
    expect(parseGiverName(input)).toBeNull();
  });
});

describe('tokens', () => {
  it('are long, random and different each time', () => {
    expect(newToken()).toMatch(/^[0-9a-f]{64}$/);
    expect(newToken()).not.toBe(newToken());
  });

  it('hash the same way every time, and never to themselves', async () => {
    const token = newToken();
    expect(await hashToken(token)).toBe(await hashToken(token));
    expect(await hashToken(token)).not.toBe(token);
    expect(await hashToken(token)).not.toBe(await hashToken(newToken()));
  });
});

describe('what a giver sees', () => {
  it('marks free, taken and own reservations', () => {
    const view = publicWishes(wishes, reservations, 'annas-hash');
    expect(view.map((row) => row.state)).toEqual(['taken', 'mine', 'free']);
    expect(view[0]!.takenBy).toBe('Erik');
  });

  it('treats everything as someone else\'s without a token', () => {
    expect(publicWishes(wishes, reservations, null).map((row) => row.state)).toEqual(['taken', 'taken', 'free']);
  });
});

describe('what the owner sees', () => {
  it('never loads reservations', async () => {
    const load = vi.fn(async () => reservations);
    expect(await reservationsForViewer(true, load)).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });

  it('loads them for everyone else', async () => {
    const load = vi.fn(async () => reservations);
    expect(await reservationsForViewer(false, load)).toBe(reservations);
  });

  it('gets a list with no trace of who reserved what', async () => {
    const forOwner = await reservationsForViewer(true, async () => reservations);
    const view = publicWishes(wishes, forOwner, null);
    expect(view.every((row) => row.state === 'hidden' && row.takenBy === null)).toBe(true);
    expect(JSON.stringify(view)).not.toMatch(/Erik|Anna|hash/);
  });
});
