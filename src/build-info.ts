// What the footer says about the version that is out. Worked out once, when
// the app is built, and baked in by vite.config.ts: the Worker never formats a
// date, so it does not matter which locales it knows.

const REPO = 'https://github.com/tolu/jag-vill-ha';

const swedish = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Stockholm',
});

/** `sha` is the full commit GitHub Actions builds from; missing on a local build. */
export function buildInfo(builtAt: Date, sha: string | undefined) {
  const commit = /^[0-9a-f]{40}$/.test(sha ?? '') ? sha! : null;
  return {
    iso: builtAt.toISOString(),
    // "18 nov. 2026 21:08", in Swedish time whatever the build machine uses
    label: swedish.format(builtAt),
    commit: commit && { short: commit.slice(0, 7), url: `${REPO}/commit/${commit}` },
  };
}
