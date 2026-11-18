import '../../src/styles.css';
import '../../src/admin.css';
import { AdminShell } from '../../src/components/AdminShell';
import { Sparkline } from '../../src/components/charts';
import { Icon } from '../../src/components/Icon';
import type { Props } from './accounts.server';

// The e-mail column is an envelope: there, there but not confirmed, or faded for none.
const EMAIL = { none: 'No e-mail', confirmed: 'E-mail confirmed', unconfirmed: 'E-mail not confirmed' };

export default function AccountsPage({ accounts, deleted }: Props) {
  return (
    <AdminShell current="/admin/accounts">
      {deleted && (
        <p className="notice calm" role="status" style={{ marginBlockEnd: '1rem' }}>
          Deleted {deleted}.
        </p>
      )}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>List</th>
              <th>Created</th>
              <th>Last seen</th>
              <th className="num" colSpan={2}>
                Visits, 12 weeks
              </th>
              <th className="num">Wishes</th>
              <th aria-label="E-mail"></th>
              {/* Named for a screen reader only. A hidden span here would widen the page on a phone. */}
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.username}>
                <td>
                  <a href={`/${account.username}`}>{account.username}</a>
                  {account.isAdmin && <span className="soft"> (you)</span>}
                </td>
                <td className="date">{account.created}</td>
                <td className="date">{account.lastSeen ?? <span className="soft">Over a month</span>}</td>
                <td className="num">{account.visits}</td>
                <td>
                  <Sparkline values={account.weeks} />
                </td>
                <td className="num">{account.wishes}</td>
                <td>
                  <span className={`mail ${account.email}`} role="img" aria-label={EMAIL[account.email]} title={EMAIL[account.email]}>
                    <Icon name="envelope" />
                    {account.email === 'unconfirmed' && '?'}
                  </span>
                </td>
                <td>
                  {account.deletable && (
                    <a className="delete" href={`/admin/delete?list=${account.username}`} aria-label={`Delete ${account.username}`} title={`Delete ${account.username}`}>
                      <Icon name="trash" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
