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
  Deploy from main with VPN off: the readiness check must resolve
  jagvillha.fyi from this machine.

## Product

- UX comes first. The owner's 75-year-old mother must be able to use this
  without help: design every screen for her.
- KISS. Ask before adding fields or features.
- No ads, tracking, affiliate links or third-party scripts and fonts.
- Outbound links: `target="_blank" rel="noopener nofollow"
  referrerPolicy="no-referrer"`.
- Copy: a headline may have attitude, the rest is short and concrete. No
  selling points. Say each thing once per screen: no line that repeats or
  reassures about what the same view already shows.
- The topbar must not move between pages. After touching it, measure its
  height and item positions on every page, down to 320px.
- Chrome and Safari only; modern HTML and CSS, no fallbacks.

## How it is built

- Pages are Void island pages (`*.island.tsx`) with no islands: no React
  reaches the browser. Forms are plain POST, answered with a 303 redirect.
- Rules are pure functions in `src/` with tests. Tests run in Node, so
  nothing that needs a binding is tested.
- `public/js/` is hand-written and enhancement only: a page must do its main
  job without it (passkeys excepted).
- The owner must never learn what is reserved: skip the reservation query for
  the owner, and never read that table from the owner's pages.
- Anything that stores an object needs a clean-up path for when it is
  replaced or its owner row is deleted.
- Username rules live twice: `src/username.ts` and `public/js/username.js`.
  Change both; `src/username-client.test.js` fails if they disagree.
- Only an error thrown with `refuse()` in `auth.ts` (code `JVH`) is shown to
  the user word for word. Everything else becomes a generic Swedish message.
- Mail copy and markup are in `src/mail-template.ts`: tables, inline styles,
  hex colours, nothing fetched. `src/recovery-mail.ts` only sends.

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
- Void's docs are in `node_modules/void/docs/`. Read them before guessing.

## Local data

- `npm run dev` and the `app` server keep their data in the main checkout's
  `.void`, shared by every worktree: these are the owner's own accounts.
  Run one server on it at a time, and mind that a migration applied from one
  branch is applied for all of them.
- Anything automated uses the `app-test` server in `.claude/launch.json`. Its
  data is in this checkout's `.void/test-state` and may be thrown away.

## Verifying

- Passkeys: drive Chromium with a virtual WebAuthn authenticator.
- After a CSS edit, reload before measuring.
- Sent mail is at `/__void/inbox?token=…` on the dev server. The server
  prints the URL at start; the token is also in `.void/dev-trigger-token`.
- The first login link used for an unproven e-mail logs out that account's
  other sessions (passkeys stay). Log the owner in again before continuing.

## Pull requests

- Screenshots: commit to the orphan branch `tolu/pr-assets` under
  `pr-<number>/` with `git hash-object -w`, `git mktree` and
  `git commit-tree`, as a child of the branch's tip so earlier pictures stay
  reachable. The working tree is not touched. Link by commit SHA:
  `https://raw.githubusercontent.com/tolu/jag-vill-ha/<sha>/pr-<n>/<file>.png`
  In zsh, push it as `"${SHA}:refs/heads/tolu/pr-assets"`: a bare `$SHA:r…`
  is read as a modifier.
- PRs are squash-merged, so merging main into a follow-up branch conflicts
  with its own history. Check that main has nothing the branch lacks, then
  take the branch's side.
- Pin GitHub Actions to the commit SHA of the latest release, version as a
  trailing comment.
