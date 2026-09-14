import DefaultTheme from 'vitepress/theme'
import '../../vendor/tokens/motion.css'
import '../../vendor/tokens/motion-sku.css'
import '../../vendor/tokens/keyframes.css'
import './custom.css'

import EasingCurve from './components/EasingCurve.vue'
import SurfaceDemo from './components/SurfaceDemo.vue'
import SheetDemo from './components/SheetDemo.vue'
import LoaderDemo from './components/LoaderDemo.vue'
import NavAuthDemo from './components/NavAuthDemo.vue'
import SnackbarDemo from './components/SnackbarDemo.vue'
import PopoverDemo from './components/PopoverDemo.vue'
import ChoreographyTimeline from './components/ChoreographyTimeline.vue'
import TokenPlayground from './components/TokenPlayground.vue'
import TokenChip from './components/TokenChip.vue'
import HapticTester from './components/HapticTester.vue'

const components = {
  EasingCurve,
  SurfaceDemo,
  SheetDemo,
  LoaderDemo,
  NavAuthDemo,
  SnackbarDemo,
  PopoverDemo,
  ChoreographyTimeline,
  TokenPlayground,
  TokenChip,
  HapticTester,
}

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}
