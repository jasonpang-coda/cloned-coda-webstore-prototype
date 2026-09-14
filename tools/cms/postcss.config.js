// Empty on purpose — the CMS dashboard doesn't use Tailwind (its .vue SFCs are
// plain scoped CSS). Without this file, PostCSS walks up to the repo root's
// postcss.config.js (which loads tailwindcss) since none exists locally,
// which is both a spurious "content option missing" warning and a dependency
// on a file outside tools/cms — the exact thing that must NOT happen for a
// Root Directory=tools/cms Vercel deploy (see generators/assets.mjs's header
// for the sibling case of vendoring instead of reaching outside the root).
export default { plugins: [] }
