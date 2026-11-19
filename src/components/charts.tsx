import { shortDate, type calendar } from '../activity';

type Point = { label: string; count: number };

/** A round number at or above the highest value, so the top line has a tidy label. */
function ceiling(values: number[]) {
  const max = Math.max(0, ...values);
  return max <= 4 ? 4 : Math.ceil(max / 4) * 4;
}

const WIDTH = 640;
const HEIGHT = 160;

function path(values: number[], top: number, height: number) {
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;
  return values.map((value, index) => `${(index * step).toFixed(1)},${(height - (value / top) * (height - 4)).toFixed(1)}`);
}

/**
 * One series over time. The picture is stretched to the width it gets, so the
 * labels are HTML around it and stay readable on a phone. Each point has a
 * native tooltip: no script.
 */
export function LineChart({ points, unit }: { points: Point[]; unit: string }) {
  const top = ceiling(points.map((point) => point.count));
  const line = path(
    points.map((point) => point.count),
    top,
    HEIGHT,
  );
  const slot = WIDTH / points.length;
  return (
    <figure className="chart">
      <span className="chart-top">{top}</span>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={`${unit} over time`}>
        <line className="grid" x1="0" x2={WIDTH} y1="4" y2="4" />
        <line className="grid" x1="0" x2={WIDTH} y1={HEIGHT / 2 + 2} y2={HEIGHT / 2 + 2} />
        <line className="base" x1="0" x2={WIDTH} y1={HEIGHT} y2={HEIGHT} />
        <polygon className="area" points={`0,${HEIGHT} ${line.join(' ')} ${WIDTH},${HEIGHT}`} />
        <polyline className="line" points={line.join(' ')} />
        {points.map((point, index) => (
          <rect key={point.label} className="hit" x={index * slot} y="0" width={slot} height={HEIGHT}>
            <title>{`${point.label}: ${point.count}`}</title>
          </rect>
        ))}
      </svg>
      <figcaption>
        <span>{points[0]?.label}</span>
        <span>{points.at(-1)?.label}</span>
      </figcaption>
    </figure>
  );
}

/** The shape of a series and nothing more: no axes, no numbers. */
export function Sparkline({ values }: { values: number[] }) {
  const top = Math.max(1, ...values);
  const step = values.length > 1 ? 100 / (values.length - 1) : 0;
  const points = values.map((value, index) => `${(index * step).toFixed(1)},${(22 - (value / top) * 20).toFixed(1)}`);
  return (
    <svg className="spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      <polyline className="line" points={points.join(' ')} />
    </svg>
  );
}

const CELL = 12;

/** A year of days, a column per week. Scrolls sideways on a narrow screen instead of shrinking. */
export function Calendar({ cells, columns, months, unit }: ReturnType<typeof calendar> & { unit: string }) {
  return (
    <div className="calendar">
      <svg viewBox={`0 0 ${columns * CELL} ${7 * CELL + 16}`} role="img" aria-label={`${unit} per day over the last year`}>
        {cells.map((cell) => (
          <rect key={cell.day} className={`l${cell.level}`} x={cell.column * CELL} y={cell.row * CELL} width="10" height="10" rx="2">
            <title>{`${shortDate(cell.day)}: ${cell.count}`}</title>
          </rect>
        ))}
        {months.map((month) => (
          <text key={`${month.column}-${month.label}`} x={month.column * CELL} y={7 * CELL + 12}>
            {month.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
