import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';
import config from '../void.config';

// The /[username] page answers every single-segment path, so a file placed
// directly in public/ (like /manifest.webmanifest) is never served.
const localLinks = (config.head?.link ?? []).map((link) => link.href).filter((href) => href.startsWith('/'));
const manifest = JSON.parse(readFileSync('public/icons/manifest.webmanifest', 'utf8')) as {
  icons: { src: string }[];
};
const paths = [...localLinks, ...manifest.icons.map((icon) => icon.src)];

describe('static files referenced from the head and manifest', () => {
  it.each(paths)('%s exists in public/', (path) => {
    expect(existsSync(`public${path}`)).toBe(true);
  });

  it.each(paths)('%s is not on the top level, where /[username] would shadow it', (path) => {
    expect(path.split('/').filter(Boolean).length).toBeGreaterThan(1);
  });
});
