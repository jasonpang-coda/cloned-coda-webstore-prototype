// COD:M PWA manifest data — read at BUILD TIME by vite.config.js's
// `pwa-manifest` plugin (Node-side, never bundled into the client). Every
// other store simply doesn't have this file, so that plugin no-ops for them.
// Icons live in ./img/brand/pwa/, rasterized from codm-logomark.svg.
export default {
  name: 'Call of Duty: Mobile Store',
  short_name: 'COD:M Store',
  theme_color: '#0b0b0b',
  background_color: '#0b0b0b',
  icons: [
    { file: 'img/brand/pwa/icon-192.png', sizes: '192x192', purpose: 'any' },
    { file: 'img/brand/pwa/icon-512.png', sizes: '512x512', purpose: 'any' },
    { file: 'img/brand/pwa/icon-512-maskable.png', sizes: '512x512', purpose: 'maskable' },
  ],
}
