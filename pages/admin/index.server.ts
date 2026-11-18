import { defineHandler, defineHead, type InferProps } from 'void';
import { db, gte } from 'void/db';
import { lists, visits, wishes } from '@schema';
import { bucket, calendar, compare, dailySeries, dailyTotals, daysBefore, RANGES, shortDate, sqlStamp, total, type DayCount, type Range } from '../../src/activity';
import { currentAdmin, reservationTimes } from '../../src/admin-data';

export type Props = InferProps<typeof loader>;

export const prerender = false;

const METRICS = { visits: 'Visits', wishes: 'Wishes added', lists: 'New lists', reservations: 'Reservations' } as const;
type Metric = keyof typeof METRICS;

const PERIODS: Record<Range, string> = { '7d': 'the 7 days', '30d': 'the 30 days', '1y': 'the year' };

export const loader = defineHandler(async (c) => {
  const admin = currentAdmin();
  if (!admin) return c.notFound();

  const asked = { metric: c.req.query('metric') ?? '', range: c.req.query('range') ?? '' };
  const metric: Metric = asked.metric in METRICS ? (asked.metric as Metric) : 'visits';
  const range: Range = asked.range in RANGES ? (asked.range as Range) : '30d';
  const days = RANGES[range];

  // Two years back: the longest range, and the same stretch before it to compare with.
  const now = new Date();
  const since = sqlStamp(daysBefore(now, 2 * RANGES['1y']));
  const sinceDay = since.slice(0, 10);
  const visitRows = await db.select({ day: visits.day, count: visits.count }).from(visits).where(gte(visits.day, sinceDay));
  const wishStamps = (await db.select({ at: wishes.createdAt }).from(wishes).where(gte(wishes.createdAt, since))).map((row) => row.at);
  const listStamps = (await db.select({ at: lists.createdAt }).from(lists).where(gte(lists.createdAt, since))).map((row) => row.at);
  const reservationStamps = await reservationTimes(admin.id, since);

  // Each measure as a count per day, for any stretch of days.
  const daily: Record<Metric, (end: Date, days: number) => DayCount[]> = {
    visits: (end, length) => dailyTotals(visitRows, end, length),
    wishes: (end, length) => dailySeries(wishStamps, end, length),
    lists: (end, length) => dailySeries(listStamps, end, length),
    reservations: (end, length) => dailySeries(reservationStamps, end, length),
  };

  const tiles = (Object.keys(METRICS) as Metric[]).map((key) => {
    const series = daily[key](now, days);
    // A year of single days is too jagged to read: draw it week by week.
    const points = range === '1y' ? bucket(series, 7) : series;
    return {
      metric: key,
      label: METRICS[key],
      total: total(series),
      before: total(daily[key](daysBefore(now, days), days)),
      points: points.map((point) => ({ label: shortDate(point.day), count: point.count })),
    };
  });
  const chosen = tiles.find((tile) => tile.metric === metric)!;

  return {
    metric,
    range,
    ranges: Object.keys(RANGES) as Range[],
    tiles,
    chosen,
    comparison: compare(chosen.total, chosen.before, PERIODS[range]),
    calendar: calendar(daily[metric](now, RANGES['1y'])),
  };
});

export const head = defineHead(() => ({ title: 'Admin – Jag vill ha' }));
