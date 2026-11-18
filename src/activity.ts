// Turns the times of rows into what the admin charts draw. Pure, so it is
// tested. A day here is a UTC day: SQLite's datetime('now') is UTC, and an
// hour or two of drift against Swedish time does not change the picture.

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RANGES = { '7d': 7, '30d': 30, '1y': 364 } as const;
export type Range = keyof typeof RANGES;

export type DayCount = { day: string; count: number };

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/** SQLite's "2026-11-18 21:08:00" and Better Auth's Date both become "2026-11-18". */
export const toDay = (stamp: string | Date) => (typeof stamp === 'string' ? stamp.slice(0, 10) : dayKey(stamp));

/** The form SQLite stores, for comparing against a created_at column. */
export const sqlStamp = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');

export const daysBefore = (date: Date, days: number) => new Date(date.getTime() - days * DAY_MS);

function fill(counts: Map<string, number>, end: Date, days: number): DayCount[] {
  return Array.from({ length: days }, (_, index) => {
    const day = dayKey(daysBefore(end, days - 1 - index));
    return { day, count: counts.get(day) ?? 0 };
  });
}

/** One entry per day for the `days` days ending at `end`, days without rows included as 0. */
export function dailySeries(stamps: (string | Date)[], end: Date, days: number): DayCount[] {
  const counts = new Map<string, number>();
  for (const stamp of stamps) {
    const day = toDay(stamp);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return fill(counts, end, days);
}

/** The same, from rows that already hold a count per day: several rows for one day are added up. */
export function dailyTotals(rows: DayCount[], end: Date, days: number): DayCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.day, (counts.get(row.day) ?? 0) + row.count);
  return fill(counts, end, days);
}

/** Sums `size` days at a time, counted from the end so the last bucket ends today. */
export function bucket(series: DayCount[], size: number): DayCount[] {
  const buckets: DayCount[] = [];
  for (let end = series.length; end > 0; end -= size) {
    const slice = series.slice(Math.max(0, end - size), end);
    buckets.unshift({ day: slice[0]!.day, count: total(slice) });
  }
  return buckets;
}

export const total = (series: DayCount[]) => series.reduce((sum, entry) => sum + entry.count, 0);

/** "2026-11-18" becomes "Nov 18", with the year when it is asked for. */
export function shortDate(day: string, withYear = false) {
  const [year, month, date] = day.split('-').map(Number);
  return `${MONTHS[month! - 1]} ${date}${withYear ? `, ${year}` : ''}`;
}

/** How dark a day is drawn: 0 for nothing, then four steps up to the busiest day. */
export function level(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

/**
 * Lays days out as a calendar: a column per week, Monday at the top. A month
 * is labelled at the column where it starts.
 */
export function calendar(series: DayCount[]) {
  const max = Math.max(0, ...series.map((entry) => entry.count));
  const months: { column: number; label: string }[] = [];
  let column = 0;
  const cells = series.map((entry, index) => {
    const date = new Date(`${entry.day}T00:00:00Z`);
    const row = (date.getUTCDay() + 6) % 7;
    if (row === 0 && index > 0) column += 1;
    if (date.getUTCDate() === 1) months.push({ column, label: MONTHS[date.getUTCMonth()]! });
    return { ...entry, column, row, level: level(entry.count, max) };
  });
  return { cells, columns: column + 1, months };
}

/** "12 more than the 30 days before", for the line under the headline number. */
export function compare(now: number, before: number, period: string) {
  if (now === before) return `Same as ${period} before`;
  const difference = Math.abs(now - before);
  return `${difference} ${now > before ? 'more' : 'fewer'} than ${period} before`;
}
