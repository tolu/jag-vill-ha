import '../../src/styles.css';
import '../../src/admin.css';
import { AdminShell } from '../../src/components/AdminShell';
import type { Props } from './delete.server';

export default function DeletePage({ username, wishes, proven, wrongName }: Props) {
  return (
    <AdminShell current="/admin/accounts">
      <section className="step admin-delete">
        <h1>Delete {username}?</h1>
        <p className="lede">
          jagvillha.fyi/{username} stops working at once. The account, its list, {wishes} {wishes === 1 ? 'wish' : 'wishes'}, the
          pictures, the reservations and the visit count are removed. This cannot be undone, and nobody is told.
        </p>

        {proven ? (
          <form method="post" action="/admin/delete">
            <input type="hidden" name="list" value={username} />
            <div className="field">
              <label htmlFor="confirm">
                Type <strong>{username}</strong> to confirm
              </label>
              <input type="text" id="confirm" name="confirm" autoComplete="off" autoCapitalize="none" spellCheck={false} pattern={username} required />
            </div>
            {wrongName && (
              <p className="hint error" role="alert">
                That was not the username, so nothing was deleted.
              </p>
            )}
            <div className="buttons">
              <button className="btn wide danger">Delete account and list</button>
              <a className="btn quiet wide" href="/admin/accounts">
                Cancel
              </a>
            </div>
          </form>
        ) : (
          <>
            <div className="buttons">
              <button
                className="btn wide"
                type="button"
                data-passkey="login"
                data-status="proof-status"
                data-next={`/admin/delete?list=${username}`}
              >
                Confirm with your passkey
              </button>
              <a className="btn quiet wide" href="/admin/accounts">
                Cancel
              </a>
            </div>
            <p className="hint error" id="proof-status" role="alert" lang="sv"></p>
          </>
        )}
      </section>
      <script type="module" src="/js/passkey.js"></script>
    </AdminShell>
  );
}
