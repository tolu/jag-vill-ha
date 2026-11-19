import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';
import config from '../void.config';
import { EAGER_THUMBS, Thumb } from './components/Thumb';

const thumb = (index: number) => renderToStaticMarkup(<Thumb title="Bok" icon={null} imageKey="w/1/a.jpg" index={index} />);

describe('wish pictures', () => {
  // A lazy picture is still empty when a page transition takes its snapshot.
  it('load at once in the first rows', () => {
    expect(thumb(0)).toContain('loading="eager"');
    expect(thumb(EAGER_THUMBS - 1)).toContain('loading="eager"');
  });

  it('wait further down a long list', () => {
    expect(thumb(EAGER_THUMBS)).toContain('loading="lazy"');
  });
});

describe('built stylesheets', () => {
  // Without this every page revalidates its CSS before it can paint.
  it('are cached for good, since their names change with their content', () => {
    expect(config.routing?.headers?.['/assets/*']).toContain('Cache-Control: public, max-age=31536000, immutable');
  });
});

describe('buttons that need script', () => {
  // They used to start hidden and wait for list.js, so they popped in late.
  it('are not hidden in the markup', () => {
    const page = readFileSync('pages/lista/index.island.tsx', 'utf8');
    expect(page).not.toMatch(/hidden data-needs-js|data-needs-js hidden/);
  });
});
