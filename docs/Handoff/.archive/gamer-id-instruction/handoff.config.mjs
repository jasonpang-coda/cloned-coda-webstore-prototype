export default {
  title: 'Gamer ID Instruction Handoff',
  description: 'Animation specs for the COD:M PlayerAccount disclosure — chips, panel accordion, lookup spinner, and Player Card entrance.',
  pages: [
    { text: 'Flow Spec',  link: '/README' },
    { text: 'Playground', link: '/playground' },
  ],
  vendor: {
    roots: {
      tokens: 'src/tokens',
      fonts:  'src/stores/codm/fonts',
      images: 'src/stores/codm/img/content',
    },
    tokens: [
      // Motion-only cascade — bespoke demo stubs, no real component vendored
      'motion.css',
      'keyframes.css',
      'reduced-motion.css',
    ],
    urlRewrites: [],
    fonts: [],
    images: [],
  },
  tokenCatalog: {
    durations: [
      { name: '--motion-sys-duration-fast',  label: 'Fast (exit)',    min: 50,  max: 400, step: 10 },
      { name: '--motion-sys-duration-base',  label: 'Base (default)', min: 100, max: 600, step: 10 },
      { name: '--motion-sys-duration-exit',  label: 'Exit (enter)',   min: 50,  max: 400, step: 10 },
      { name: '--motion-sys-duration-slow',  label: 'Slow (chevron)', min: 150, max: 800, step: 10 },
      { name: '--motion-spinner',            label: 'Spinner loop',   min: 300, max: 1500, step: 50 },
    ],
    easings: [
      { name: '--motion-sys-ease-decelerate', label: 'Decelerate (enter)' },
      { name: '--motion-sys-ease-accelerate', label: 'Accelerate (exit)'  },
      { name: '--motion-sys-ease-standard',   label: 'Standard (on-screen)' },
    ],
  },
}
