import { describe, expect, it } from 'vite-plus/test';
import { bucket, calendar, compare, dailySeries, dailyTotals, level, shortDate, sqlStamp, toDay, total } from './activity';

const end = new Date('2026-11-18T15:00:00Z');

describe('dailySeries', () => {
  it('counts rows per day and fills the days without any', () => {
    const series = dailySeries(['2026-11-18 08:00:00', '2026-11-18 23:59:59', '2026-11-16 00:00:00'], end, 3);
    expect(series).toEqual([
      { day: '2026-11-16', count: 1 },
      { day: '2026-11-17', count: 0 },
      { day: '2026-11-18', count: 2 },
    ]);
  });

  it('leaves out rows from before the window', () => {
    expect(total(dailySeries(['2026-11-10 08:00:00'], end, 3))).toBe(0);
  });

  it('takes dates as well as SQLite text', () => {
    expect(dailySeries([new Date('2026-11-18T01:00:00Z')], end, 1)).toEqual([{ day: '2026-11-18', count: 1 }]);
  });

  it('crosses a month', () => {
    const series = dailySeries([], new Date('2026-12-01T00:00:00Z'), 2);
    expect(series.map((entry) => entry.day)).toEqual(['2026-11-30', '2026-12-01']);
  });
});

describe('dailyTotals', () => {
  it('adds up the lists of a day and fills the empty days', () => {
    const rows = [
      { day: '2026-11-18', count: 3 },
      { day: '2026-11-18', count: 4 },
      { day: '2026-11-16', count: 1 },
      { day: '2026-11-01', count: 9 },
    ];
    expect(dailyTotals(rows, end, 3)).toEqual([
      { day: '2026-11-16', count: 1 },
      { day: '2026-11-17', count: 0 },
      { day: '2026-11-18', count: 7 },
    ]);
  });
});

describe('bucket', () => {
  it('sums weeks counted from the end', () => {
    const series = dailySeries(['2026-11-18 08:00:00', '2026-11-12 08:00:00', '2026-11-11 08:00:00'], end, 14);
    expect(bucket(series, 7)).toEqual([
      { day: '2026-11-05', count: 1 },
      { day: '2026-11-12', count: 2 },
    ]);
  });

  it('puts what is left over in a short first bucket', () => {
    expect(bucket(dailySeries([], end, 9), 7).map((entry) => entry.day)).toEqual(['2026-11-10', '2026-11-12']);
  });
});

describe('level', () => {
  it.each([
    [0, 10, 0],
    [1, 10, 1],
    [5, 10, 2],
    [8, 10, 4],
    [10, 10, 4],
    [1, 1, 4],
    [3, 0, 0],
  ])('draws %i of %i as step %i', (count, max, expected) => {
    expect(level(count, max)).toBe(expected);
  });
});

describe('calendar', () => {
  // 2026-11-16 is a Monday.
  const { cells, columns, months } = calendar(dailySeries(['2026-11-16 08:00:00'], new Date('2026-12-01T00:00:00Z'), 17));

  it('starts a new column every Monday', () => {
    expect(cells.find((cell) => cell.day === '2026-11-15')).toMatchObject({ column: 0, row: 6 });
    expect(cells.find((cell) => cell.day === '2026-11-16')).toMatchObject({ column: 1, row: 0, level: 4 });
    expect(columns).toBe(4);
  });

  it('labels a month where it starts', () => {
    expect(months).toEqual([{ column: 3, label: 'Dec' }]);
  });
});

describe('formatting', () => {
  it('writes a day short', () => {
    expect(shortDate('2026-11-08')).toBe('Nov 8');
    expect(shortDate('2026-01-31', true)).toBe('Jan 31, 2026');
  });

  it('reads the day from either kind of stamp', () => {
    expect(toDay('2026-11-18 21:08:00')).toBe('2026-11-18');
    expect(sqlStamp(end)).toBe('2026-11-18 15:00:00');
  });

  it.each([
    [12, 9, '3 more than the 30 days before'],
    [2, 9, '7 fewer than the 30 days before'],
    [4, 4, 'Same as the 30 days before'],
  ])('compares %i with %i', (now, before, expected) => {
    expect(compare(now, before, 'the 30 days')).toBe(expected);
  });
});
