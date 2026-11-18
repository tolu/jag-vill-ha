import '../../src/styles.css';
import '../../src/admin.css';
import { AdminShell } from '../../src/components/AdminShell';
import type { Props } from './system.server';

export default function SystemPage({ build, lists, wishes, reservations, sessions, atRisk, pictures }: Props) {
  return (
    <AdminShell current="/admin/system">
      <dl className="facts">
        <dt>Build</dt>
        <dd>
          <time dateTime={build.iso}>{build.label}</time>
          {build.commit && (
            <>
              {' · '}
              <a className="commit" href={build.commit.url} target="_blank" rel="noopener nofollow" referrerPolicy="no-referrer">
                {build.commit.short}
              </a>
            </>
          )}
        </dd>
        <dt>Lists</dt>
        <dd>{lists}</dd>
        <dt>Wishes</dt>
        <dd>{wishes}</dd>
        <dt>Reservations on other lists than yours</dt>
        <dd>{reservations}</dd>
        <dt>Pictures stored</dt>
        <dd>
          {pictures.objects} · {pictures.megabytes} MB
        </dd>
        <dt>Open sessions</dt>
        <dd>{sessions}</dd>
        <dt>Owners a lost phone would lock out</dt>
        <dd>{atRisk}</dd>
      </dl>
    </AdminShell>
  );
}
