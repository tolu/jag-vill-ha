/// <reference types="vite/client" />

// Baked in by vite.config.ts when the app is built
declare const __BUILD__: ReturnType<typeof import('../src/build-info').buildInfo>;
