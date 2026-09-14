# @coda/tourguide-kit

Interactive autoplay tour, Point-of-Interest (POI) onboarding guide, and client-side WebM screen recording kit for web applications, design prototypes, and product demos.

---

## Features

- **Automated Tour Execution**: Declarative user journey manifests (`defineTour`) with automated step-by-step playback.
- **Spotlight & POI Onboarding**: Highlights target elements with dark scrims, glowing spotlight frames, and floating educational guide cards.
- **Virtual Animated Cursor**: Realistic physics-based simulated mouse pointer with smooth trajectories, click ripples, and text typing simulation.
- **Client-Side WebM Video Recording**: Records high-fidelity 60 FPS video directly in the browser via `MediaRecorder` + `getDisplayMedia` with automatic `.webm` file downloads. Zero backend required.
- **Full Player Controls**: Play, pause, rewind, skip forward, step seek, and speed toggles (`1x`, `1.5x`, `2x`).
- **Framework-Agnostic Core + Vue 3 Adapter**: Use headless via `@coda/tourguide-kit` or drop-in Vue 3 components via `@coda/tourguide-kit/vue`.

---

## Installation

```bash
npm install @coda/tourguide-kit
```

Or via monorepo workspace:
```json
{
  "dependencies": {
    "@coda/tourguide-kit": "file:packages/tourguide-kit"
  }
}
```

---

## Usage (Vue 3)

### 1. Mount the Layer & Modal in your App

```vue
<!-- App.vue -->
<script setup>
import { onMounted } from 'vue'
import { TourGuideLayer, TourGuideModal, useTourGuide } from '@coda/tourguide-kit/vue'
import '@coda/tourguide-kit/vue/style.css'
import { myFlows } from './flows/index.js'

const { registerFlows } = useTourGuide()

onMounted(() => {
  registerFlows(myFlows)
})
</script>

<template>
  <div id="app">
    <!-- Your application content -->
    <router-view />

    <!-- Tour Guide Overlays -->
    <TourGuideLayer />
    <TourGuideModal />
  </div>
</template>
```

> **Don't forget the stylesheet import.** `TourGuideLayer`, `TourGuideModal`, `TourGuideCard`,
> `TourGuidePlayerBar`, and `VirtualCursor` all use `<style scoped>`, which the library build
> extracts into `dist/style.css`. Without the `import '@coda/tourguide-kit/vue/style.css'` line
> above, every one of these components still mounts and functions — it just renders unstyled and
> unpositioned, so the scrim, spotlight, cursor, and guide card are effectively invisible.

### 2. Triggering a Tour

```vue
<script setup>
import { useTourGuide } from '@coda/tourguide-kit/vue'

const { openModal, startFlow } = useTourGuide()
</script>

<template>
  <!-- Open the tour picker dialog -->
  <button @click="openModal">Launch Tour Guide</button>

  <!-- Or start a specific tour directly -->
  <button @click="startFlow('guest-checkout', { record: true })">
    Play Guest Checkout (Record WebM)
  </button>
</template>
```

---

## Authoring Tours

Define custom tours using `defineTour`:

```javascript
import { defineTour } from '@coda/tourguide-kit'

export default defineTour({
  id: 'guest-checkout',
  title: 'Guest Checkout & Purchase',
  category: 'Purchase Flows',
  description: 'Demonstrates browsing a SKU, opening the sheet, and completing payment as a guest.',
  defaultTheme: 'codm',
  defaultDevice: 'iphone',

  setup: async () => {
    // Reset any open sheets or session state before starting
  },

  steps: [
    {
      id: 'step-hero-card',
      title: 'Select Featured Bundle',
      explanation: 'Users can tap on any featured promotional card to inspect bundle contents.',
      poiSelector: 'featured-hero-sku', // resolves [data-poi="featured-hero-sku"]
      poiPlacement: 'bottom',
      holdMs: 3000,
      action: {
        type: 'click',
        target: 'featured-hero-sku',
      },
    },
    {
      id: 'step-purchase-sheet',
      title: 'Payment Channel Selection',
      explanation: 'Choose between e-Wallets, Credit Cards, or direct carrier billing.',
      poiSelector: 'payment-step-channels',
      poiPlacement: 'top',
      holdMs: 2500,
      action: {
        type: 'click',
        target: 'payment-channel-card',
      },
    },
  ],
})
```

`poiSelector`/`action.target` accept a bare `data-poi` key (recommended — tag the real element
with `data-poi="featured-hero-sku"` in your app and reference it here), a full CSS selector, or a
resolver function. Bare `data-poi` keys are the most robust choice: they survive component class
renames that would otherwise silently break a CSS-selector-based tour.

---

## Core Headless API

```javascript
import { TourGuideEngine, defineTour } from '@coda/tourguide-kit'

const engine = new TourGuideEngine()

engine.registerFlow(myFlow)

// Subscribe to state changes
const unsubscribe = engine.subscribe((state) => {
  console.log('Current Step:', state.currentStep)
  console.log('Cursor Position:', state.cursor)
})

// Play tour with WebM recording
await engine.start('guest-checkout', { record: true, speed: 1.5 })
```
