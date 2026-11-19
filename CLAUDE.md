# jagvillha.fyi

UI in Swedish, code and docs in English.

## Commands

```sh
npm run typecheck && npm test && npm run build
npx void db generate # after changing db/schema.ts or auth.ts
npx void db migrate  # apply locally, keeps data
```

Use npm. `vp` follows `packageManager`; never let pnpm in.

## Never without asking

- `npx void db seed` and `db reset`: they wipe the local database, including
  accounts made by hand.
- `npx void deploy`, or anything else that changes the Cloudflare account.
  That includes re-running a `deploy` job.

## Deploy

- A merge to main deploys: the `deploy` job in `ci.yml` runs after `check`.
  Nothing is deployed by hand. A merge with a migration runs it on
  production, unattended.
- main takes pull requests only, with `check` green and the branch up to
  date. Renaming the `check` job means changing the ruleset too.
- A failed deploy is re-run from its run in Actions, not with a new merge.
  One that stops at "Verifying the uploaded Worker" has uploaded a version
  without activating it, whatever its message says: production is unchanged
  and a re-run has worked. The job prints Void's own log when it fails.
- What is out: the footer on jagvillha.fyi has the commit, which should be
  the merge commit. `npx void project status` lists the Worker's versions
  and which is live; in a worktree it first needs `.void/project.json`
  copied from the main checkout.
- The token is account-owned and lives in the `production` environment,
  which only main can read. It has Workers Editor, D1 Write, R2 Read and
  Email Sending Write on the account, and Zone Read, Zone Settings Read,
  Workers Routes Write and Email Routing Rules Write on the zone. Something
  new that Void provisions needs a new permission there first.
  Void's docs use legacy permission names and leave some out: go by what the
  failed deploy log could not read, and Cloudflare's API reference for that
  endpoint.
- Void's auth sets `no-store` on every response to a request with a cookie,
  whatever the route sets, and looks up the session first. So a Request
  Header Transform Rule in the dashboard (Rules, "Inga cookies till bilder")
  removes `Cookie` on `/bild/*`. A new public route that must be cached
  needs the same. Check with a cookie: `curl -sI -H "Cookie: x=1" <url>`.

## Product

- UX comes first. The owner's 75-year-old mother must be able to use this
  without help: design every screen for her.
- KISS. Ask before adding fields or features.
- No ads, tracking, affiliate links or third-party scripts and fonts.
  A font is served from `public/fonts/`, as one woff2 with its licence beside
  it, and only for a theme's heading: Android has none of Apple's fonts.
- Outbound links: `target="_blank" rel="noopener nofollow"
  referrerPolicy="no-referrer"`.
- Copy: a headline may have attitude, the rest is short and concrete. No
  selling points. Say each thing once per screen: no line that repeats or
  reassures about what the same view already shows.
- The topbar must not move between pages. After touching it, measure its
  height and item positions on every page, down to 320px.
- Chrome and Safari only; modern HTML and CSS, no fallbacks. One exception:
  a page with a `commandfor` button loads `/js/command.js`, or its dialogs
  stay shut in Safari before 26.2.

## How it is built

- Pages are Void island pages (`*.island.tsx`) with no islands: no React
  reaches the browser. Forms are plain POST, answered with a 303 redirect.
- `pages/layout.tsx` wraps every page, `_not-found` too. What all pages
  share goes there, not into each page.
- `__BUILD__` (build time and commit) is baked in by `define` in
  `vite.config.ts`. Format such values there, not in the Worker. A local
  build has no commit: `GITHUB_SHA=<40 hex> npm run build` shows it.
- Rules are pure functions in `src/` with tests. Tests run in Node, so
  nothing that needs a binding is tested.
- A script in `public/js/` that acts on load is tested by stubbing the
  globals it touches and importing it after `vi.resetModules()`: see
  `src/command-client.test.js`.
- `public/js/` is hand-written and enhancement only: a page must do its main
  job without it (passkeys excepted).
- The owner must never learn what is reserved: skip the reservation query for
  the owner, and never read that table from the owner's pages.
- Anything that stores an object needs a clean-up path for when it is
  replaced or its owner row is deleted.
- A theme is a name in `src/theme.ts` and a file in `src/themes/`. It sets
  tokens on `:root:has([data-theme="…"])`, never further down: `--accent`
  and `--accent-wash` are derived on `:root`. It may dress the heading with
  a banner and four pseudo-elements, and changes no markup or layout.
  On the dev server `?theme=<name>` on a list's page tries one on.
- Username rules live twice: `src/username.ts` and `public/js/username.js`.
  Change both; `src/username-client.test.js` fails if they disagree.
- Only an error thrown with `refuse()` in `auth.ts` (code `JVH`) is shown to
  the user word for word. Everything else becomes a generic Swedish message.
- Mail copy and markup are in `src/mail-template.ts`: tables, inline styles,
  hex colours, nothing fetched. `src/recovery-mail.ts` only sends.
- `/admin` is for one account: the user id in `ADMIN_USER_ID`, declared in
  `env.ts`, a Worker secret in production and in `.env` locally. Everyone else
  gets a 404. Its pages are in English.
- The admin owns a list too. The admin pages read reservations only through
  `reservationTimes` in `src/admin-data.ts`, which gives times and leaves the
  admin's own list out.
- Deleting from `/admin` needs a passkey prompt in the last five minutes:
  the hook in `auth.ts` leaves the proof, `hasPasskeyProof` looks for it.
- iOS Safari never tells CSS about the keyboard: no viewport unit shrinks,
  and `interactive-widget` is ignored. A sheet with an autofocused field
  must not slide in from off screen, or Safari scrolls the field out of view.

## Void gotchas

- `/[username]` answers every single-segment path: static files go in a
  subfolder of `public/`, and new top-level routes go in `RESERVED` in
  `src/username.ts`.
- `_not-found` cannot be an island page.
- `c.redirect()` wants a typed route: cast dynamic ones `as RouteUrl`.
- `auth.ts` is not scanned for bindings, and a static `void/email` import
  there breaks `vp test`: import it in `src/` and load that lazily.
- Changes to `void.config.ts` or `auth.ts` need a dev server restart.
- A migration that drops anything needs `-- void:allow-destructive` on top.
- CSS: `[hidden]` and other rules that must win go in `@layer overrides`.
- Void's docs are in `node_modules/void/docs/`. Read them before guessing,
  and before building anything a framework usually has: layouts, middleware,
  redirects, caching.

## Local data

- `npm run dev` and the `app` server keep their data in the main checkout's
  `.void`, shared by every worktree: these are the owner's own accounts.
  Run one server on it at a time, and mind that a migration applied from one
  branch is applied for all of them.
- `npx void db migrate` goes to the shared data even with `LOCAL_STATE` set.
  For `app-test`, run the migration's SQL on the sqlite file under
  `.void/test-state/v3/d1/` and add its name to `_void_migrations`.
- Anything automated uses the `app-test` server in `.claude/launch.json`. Its
  data is in this checkout's `.void/test-state` and may be thrown away.
- `void db` commands ignore `LOCAL_STATE` and go to the shared data, `migrate`
  too. Change the test database with `sqlite3` on its file under
  `.void/test-state`, and add the migration's name to `_void_migrations`.
- `app-test` takes its admin from `.void/test-state/admin-id`: a user id.

## Verifying

- Passkeys: drive Chromium with a virtual WebAuthn authenticator.
- Log in to test accounts in Playwright, not in the Browser pane: the pane
  shares cookies between all localhost ports, so a login on `app-test` logs
  the owner out of `app`.
- Never send the owner to `app-test` to log in with their own passkey. It does
  not know the passkey, and `passkey.js` then tells the browser to drop it.
- A new link, button or column is tested by finding and clicking it at the
  owner's window width. Going straight to its address does not show that it
  can be found.
- Without passkeys (Safari, the iOS simulator): give a test account an
  e-mail, post it to `/aterstall` and open the link from the inbox. The
  link is in `/__void/inbox/<id>/raw?token=…`, quoted-printable.
- iOS simulator: `xcrun simctl boot <device>`, then open
  `http://localhost:5183/…`. Wait about 3 s after a tap that raises the
  keyboard before the screenshot: Safari is still scrolling.
- Only the iOS runtimes that are installed can be tested. Check with
  `xcrun simctl list runtimes`; `xcodebuild -downloadPlatform iOS` gets
  the current one (8 GB, the owner starts it).
- After a CSS edit, reload before measuring.
- Screenshots for a PR: Playwright's `page.screenshot({ path })`. The Browser
  pane cannot save a file.
- `app-test` needs about ten seconds before it answers. Its browser session
  outlives a restart: clear cookies to see a page logged out.
- Sent mail is at `/__void/inbox?token=…` on the dev server. The server
  prints the URL at start; the token is also in `.void/dev-trigger-token`.
- The first login link used for an unproven e-mail logs out that account's
  other sessions (passkeys stay). Log the owner in again before continuing.

## Pull requests

- Descriptions: the features as bullets, then pictures, then a few lines on
  what was tested and known limits. Under 200 words, no How section, and
  nothing about changes to `CLAUDE.md`.
- Screenshots: commit to the orphan branch `tolu/pr-assets` under
  `pr-<number>/` with `git hash-object -w`, `git mktree` and
  `git commit-tree`, as a child of the branch's tip so earlier pictures stay
  reachable. The working tree is not touched. Link by commit SHA:
  `https://raw.githubusercontent.com/tolu/jag-vill-ha/<sha>/pr-<n>/<file>.png`
  Push it as `"${sha}:refs/heads/tolu/pr-assets"`, with the braces: zsh
  reads `$sha:r` as a modifier.
- PRs are squash-merged, so merging main into a follow-up branch conflicts
  with its own history. Check that main has nothing the branch lacks, then
  take the branch's side.
- Pin GitHub Actions to the commit SHA of the latest release, version as a
  trailing comment.
