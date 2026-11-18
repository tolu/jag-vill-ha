import '../../src/styles.css';
import '../../src/admin.css';
import { AdminShell } from '../../src/components/AdminShell';
import { Calendar, LineChart, Sparkline } from '../../src/components/charts';
import type { Props } from './index.server';

const RANGE_LABELS = { '7d': 'last 7 days', '30d': 'last 30 days', '1y': 'last year' };

export default function ActivityPage({ metric, range, ranges, tiles, chosen, comparison, calendar }: Props) {
  return (
    <AdminShell current="/admin">
      <div className="admin-head">
        <div>
          <h1 className="figure">{chosen.total}</h1>
          <p>
            {chosen.label}, {RANGE_LABELS[range]}. {comparison}.
          </p>
        </div>
        <nav className="ranges" aria-label="Range">
          {ranges.map((option) => (
            <a key={option} href={`/admin?metric=${metric}&range=${option}`} aria-current={option === range ? 'true' : undefined}>
              {option}
            </a>
          ))}
        </nav>
      </div>

      <LineChart points={chosen.points} unit={chosen.label} />

      <nav className="tiles" aria-label="Measure">
        {tiles.map((tile) => (
          <a key={tile.metric} href={`/admin?metric=${tile.metric}&range=${range}`} aria-current={tile.metric === metric ? 'true' : undefined}>
            <span>
              <small>{tile.label}</small>
              <strong>{tile.total}</strong>
            </span>
            <Sparkline values={tile.points.map((point) => point.count)} />
          </a>
        ))}
      </nav>

      <h2>{chosen.label} per day, last year</h2>
      <Calendar {...calendar} unit={chosen.label} />
    </AdminShell>
  );
}
