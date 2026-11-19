import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';
import { voidPlugin } from 'void';
import { voidReact } from '@void/react/plugin';
import { buildInfo } from './src/build-info';

// Where the local database and pictures live. Every worktree of this clone
// shares the main checkout's `.void`, so accounts made by hand are still there
// in the next worktree. LOCAL_STATE points somewhere else: the `app-test`
// server in .claude/launch.json uses it to get data that may be thrown away.
function localState() {
  if (process.env.LOCAL_STATE) return resolve(process.env.LOCAL_STATE);
  try {
    const gitDir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' });
    return resolve(gitDir.trim(), '..', '.void');
  } catch {
    return undefined; // not a git checkout: Void's own default, `.void` here
  }
}

export default defineConfig({
  // `npm run format`. Settings that match how the code was already written.
  fmt: {
    printWidth: 150,
    singleQuote: true,
    trailingComma: 'all',
    // npm writes package.json in its own order; keep it.
    sortPackageJson: false,
    ignorePatterns: [
      // Compact one-line rules on purpose; the formatter would put every
      // declaration on its own line.
      '**/*.css',
      // Written by `npx void db generate`.
      'db/migrations/**',
      // Ignored by a global gitignore, which the formatter does not read.
      '.claude/settings.local.json',
    ],
  },
  // The pre-commit hook in .vite-hooks formats what is staged.
  staged: {
    '*': 'vp fmt --no-error-on-unmatched-pattern',
  },
  // What the footer shows. GitHub Actions sets GITHUB_SHA, and the deploy job
  // builds and publishes in one go, so this is the version that is out.
  define: {
    __BUILD__: JSON.stringify(buildInfo(new Date(), process.env.GITHUB_SHA)),
  },
  resolve: {
    alias: {
      // Void generates the auth tables; the tsconfig path alone is not enough at runtime.
      '@auth-schema': fileURLToPath(new URL('./.void/better-auth-schema.ts', import.meta.url)),
    },
  },
  plugins: [voidPlugin({ persistTo: localState() }), voidReact({ react: { compiler: true } })],
});
