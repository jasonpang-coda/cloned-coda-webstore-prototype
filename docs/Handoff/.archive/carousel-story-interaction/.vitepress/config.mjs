// GENERIC kit file — do not edit per site (configure via handoff.config.mjs).
import site from '../handoff.config.mjs'

const items = [{ text: 'Overview', link: '/' }, ...site.pages]

/** @type {import('vitepress').UserConfig} */
export default {
  title: site.title,
  description: site.description,
  ignoreDeadLinks: true,
  // web-store-spec-handoff bundles a frozen `_skill/` snapshot (SKILL.md +
  // templates) into every handoff folder. Those templates contain unfilled
  // <placeholder> tokens that VitePress's Vue compiler would try to resolve as
  // component tags — exclude the folder from page scanning entirely; it's a
  // reference bundle, not site content.
  srcExclude: ['_skill/**'],
  themeConfig: {
    nav: items,
    sidebar: [{ text: 'Handoff', items }],
    socialLinks: [],
  },
}
