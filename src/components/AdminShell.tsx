import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { Topbar } from './Topbar';

const TABS = [
  ['/admin', 'Activity'],
  ['/admin/accounts', 'Accounts'],
  ['/admin/system', 'System'],
] as const;

/** What the three admin pages share: the usual top bar, then the tabs. The admin pages are in English. */
export function AdminShell({ current, children }: { current: (typeof TABS)[number][0]; children: ReactNode }) {
  return (
    <div className="page">
      <Topbar>
        <a href="/lista">
          <Icon name="list" />
          Din lista
        </a>
      </Topbar>
      <main className="admin" lang="en">
        <nav className="admin-tabs" aria-label="Admin">
          {TABS.map(([href, label]) => (
            <a key={href} href={href} aria-current={href === current ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}
