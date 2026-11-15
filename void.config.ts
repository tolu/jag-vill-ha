import { defineConfig } from 'void/config';

export default defineConfig({
  routing: {
    typedRoutes: true,
  },
  worker: {
    compatibility_date: '2026-02-24',
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
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  },
});
