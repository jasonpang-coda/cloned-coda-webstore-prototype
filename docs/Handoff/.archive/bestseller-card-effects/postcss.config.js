// Empty on purpose. Without a config file here, PostCSS's config loader walks
// up parent directories and finds the repo-root postcss.config.js, which
// requires `tailwindcss` — a devDependency of the main prototype app, not of
// this site. That resolves locally (the whole repo's node_modules is on
// disk) but fails on Vercel, where the Root Directory install only populates
// node_modules inside this folder: "Cannot find module 'tailwindcss'". This
// file stops the upward search here; the site's CSS is plain vendored tokens
// and never needed Tailwind.
export default {
  plugins: {},
}
