// FX Border Effects demo page — branch: experiment/fx-border-library
// Standalone Vite entry (accessible at /fx-demo.html in dev mode).

// Theme CSS MUST come first — [data-theme] specificity loses to later :root blocks.
import './tokens/ds/themes/codm.css'
import './tokens/ds/themes/fcm.css'
import './tokens/ds/themes/efootball.css'
import './tokens/ds/themes/roguetrader.css'
import './tokens/ds/themes/tdr.css'
import './tokens/ds/themes/ygodl.css'

// DS structural tiers (mirrors main.js)
import './tokens/ds/system.css'
import './tokens/ds/semantics.css'
import './tokens/ds/space.css'
import './tokens/ds/text-styles.css'
import './tokens/ds/extensions.css'

import './tokens/motion.css'
import './tokens/motion-sku.css'
import './tokens/keyframes.css'
import './tokens/effects.css'
import './tokens/reduced-motion.css'

import { createApp } from 'vue'
import FxBorderDemo from './pages/FxBorderDemo.vue'
createApp(FxBorderDemo).mount('#fx-demo')
