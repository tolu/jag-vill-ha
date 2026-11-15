import { describe, expect, it } from 'vite-plus/test';
import { parseOrder } from './order';

describe('parseOrder', () => {
  it('accepts a reordering of the same ids', () => {
    expect(parseOrder('3,1,2', [1, 2, 3])).toEqual([3, 1, 2]);
  });

  it.each([
    ['a missing id', '1,2'],
    ['an extra id', '1,2,3,4'],
    ['a foreign id', '1,2,9'],
    ['a duplicate', '1,1,2'],
    ['junk', 'a,b,c'],
    ['nothing', ''],
  ])('rejects %s', (_label, input) => {
    expect(parseOrder(input, [1, 2, 3])).toBeNull();
  });
});
