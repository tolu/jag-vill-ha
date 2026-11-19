import { describe, expect, it } from 'vite-plus/test';
import { deletable, isAdmin, lockoutRisk } from './admin';

describe('isAdmin', () => {
  it('is the account named by the setting', () => {
    expect(isAdmin('abc', 'abc')).toBe(true);
  });

  it.each([
    ['another account', 'xyz', 'abc'],
    ['nobody logged in', undefined, 'abc'],
    ['no admin set', 'abc', undefined],
    ['nobody logged in and no admin set', undefined, undefined],
    ['two empty values', '', ''],
    ['two nulls', null, null],
  ])('refuses %s', (_label, userId, adminId) => {
    expect(isAdmin(userId, adminId)).toBe(false);
  });
});

describe('lockoutRisk', () => {
  it.each([
    [1, false, true],
    [0, false, true],
    [1, true, false],
    [2, false, false],
  ])('%i keys, e-mail %s: %s', (keys, hasEmail, expected) => {
    expect(lockoutRisk(keys, hasEmail)).toBe(expected);
  });
});

describe('deletable', () => {
  it("is any account but the admin's own", () => {
    expect(deletable('xyz', 'abc')).toBe(true);
  });

  it.each([
    ["the admin's own account", 'abc'],
    ['a list without an owner', null],
    ['an empty owner', ''],
  ])('refuses %s', (_label, ownerId) => {
    expect(deletable(ownerId, 'abc')).toBe(false);
  });
});
