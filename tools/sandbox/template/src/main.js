// Active store — MUST be the first import (its side-effect pulls in the
// store's ds/themes/<store>.css BEFORE the :root tiers below; a [data-theme]
// block at equal specificity loses to a later :root declaration — see
// web-store-tokens §3). This bundle is single-store, so @active-stores
// (aliased in vite.config.js to vendor/active-stores.js) already carries
// exactly the vendored store — every composable (useStoreAssets/
// useStoreConfig/useStoreStrings/useTheme) just works with no context
// injection needed. CanvasHost only provides the visual stage
// (container-query root + fixed-position overlay trap).
import '@active-stores'

import { createApp, h } from 'vue'
import CanvasHost from './CanvasHost.vue'
import Page from './page.example.vue'
import { vRipple } from '@/directives/vRipple.js'
import { vHaptic } from '@/directives/vHaptic.js'

// Token cascade — same files, same order as the real repo's main.js.
import '@/tokens/ds/system.css'
import '@/tokens/ds/semantics.css'
import '@/tokens/ds/space.css'
import '@/tokens/ds/text-styles.css'
import '@/tokens/ds/extensions.css'
import '@/tokens/light.css'
import '@/tokens/materials.css'
import '@/tokens/motion.css'
import '@/tokens/motion-sku.css'
import '@/tokens/motion-trust.css'
import '@/tokens/keyframes.css'
import '@/tokens/effects.css'
import '@/tokens/reduced-motion.css'

createApp({ render: () => h(CanvasHost, null, { default: () => h(Page) }) })
  .directive('ripple', vRipple)
  .directive('haptic', vHaptic)
  .mount('#app')
