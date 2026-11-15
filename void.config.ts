import { defineConfig } from 'void/config';

export default defineConfig({
  routing: {
    typedRoutes: true,
  },
  worker: {
    compatibility_date: '2026-02-24',
  },
  // Only used for recovery links. A mail subdomain keeps the root domain free.
  email: {
    from: 'Jag vill ha <noreply@mail.jagvillha.fyi>',
  },
  head: {
    htmlAttrs: { lang: 'sv' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#F8F5EE' },
    ],
    link: [
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      // Top-level files in public/ are shadowed by the /[username] page, so this lives under /icons.
      { rel: 'manifest', href: '/icons/manifest.webmanifest' },
    ],
  },
});
