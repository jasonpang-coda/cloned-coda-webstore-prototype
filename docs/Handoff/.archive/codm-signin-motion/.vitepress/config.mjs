/** @type {import('vitepress').UserConfig} */
export default {
  title: 'COD:M Sign-In Motion Handoff',
  description: 'Interactive motion spec for the COD:M sign-in flow',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Overview', link: '/' },
      { text: 'Flow Spec', link: '/README' },
      { text: 'Motion Tokens', link: '/motion-tokens' },
      { text: 'Haptics', link: '/haptic-tokens' },
      { text: 'Components', link: '/component-breakdown' },
      { text: 'Playground', link: '/playground' },
    ],
    sidebar: [
      {
        text: 'Handoff',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Flow Spec', link: '/README' },
          { text: 'Motion Tokens', link: '/motion-tokens' },
          { text: 'Haptic Tokens', link: '/haptic-tokens' },
          { text: 'Component Breakdown', link: '/component-breakdown' },
          { text: 'Playground', link: '/playground' },
        ],
      },
    ],
    socialLinks: [],
  },
}
