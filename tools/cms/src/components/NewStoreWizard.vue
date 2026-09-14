<script setup>
/**
 * New-store wizard — asks only the handful of decisions setup-checklist.md's
 * Phase 0 calls out (key/label, brand seeds, catalog model, auth model,
 * currency), fills in every other required config/strings field from the
 * schema's defaults, scaffolds placeholder art, and POSTs the definition.
 * Everything the wizard doesn't ask about is still editable afterward in the
 * Config/Strings tabs — this just gets a buildable store onto disk fast.
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { api } from '../api.js'

const emit = defineEmits(['created'])

// 'none' isn't a real config.signIn.flow value — there's no dedicated
// "no auth" flag. The existing no-auth pattern in this codebase (see
// src/stores/mgsse/store.js, a guest-only PC store) is
// navbar.hideSignIn: true + checkout.allowGuest: true, with signIn.flow left
// at a harmless unused default ("every flag gets a value" per the
// flag-naming-discipline rule) and profile.showAccountInstructions /
// .showPlayerAccount set false since there's no account concept to surface.
const AUTH_FLOWS = [
  { value: 'codm', label: 'codm — in-app QR + loader' },
  { value: 'ea-redirect', label: 'ea-redirect — account page overlay' },
  { value: 'none', label: 'No auth — guest-only, no sign-in at all' },
]

const form = reactive({
  key: '',
  label: '',
  seeds: {
    primary: 'oklch(0.7 0.18 25)',
    secondary: 'oklch(0.8 0.15 90)',
    tertiary: 'oklch(0.5 0.15 260)',
    statusPositive: 'oklch(0.72 0.19 142.5)',
    statusCaution: 'oklch(0.8 0.15 80)',
    statusNegative: 'oklch(0.6 0.22 25)',
    neutral: 'oklch(0.18 0.02 260)',
  },
  catalogMode: 'page',
  authFlow: 'codm',
  allowGuest: true,
  currencyName: 'Credits',
  currencyAbbr: 'CR',
  typography: { heading: '', body: '' },
})

const isNoAuth = computed(() => form.authFlow === 'none')

const busy = ref(false)
const error = ref(null)

// Phase 5 — prefill from docs/style-guides/<name>/spec.json (the
// style-guide-designer skill's output). Read-only import: it fills form
// fields the user can still edit before submitting: nothing is written until
// "Create store".
const styleGuides = ref([])
const selectedStyleGuide = ref('')
const styleGuideError = ref(null)
const voiceHint = ref(null)

onMounted(async () => {
  try { styleGuides.value = await api.styleGuides() } catch { /* optional feature — fail quiet */ }
})

async function applyStyleGuide () {
  styleGuideError.value = null
  voiceHint.value = null
  if (!selectedStyleGuide.value) return
  try {
    const prefill = await api.styleGuidePrefill(selectedStyleGuide.value)
    Object.assign(form.seeds, prefill.seeds)
    if (!form.label.trim()) form.label = prefill.brand
    if (prefill.font) {
      form.typography.heading = `'${prefill.font.heading}', sans-serif`
      form.typography.body = `'${prefill.font.body}', sans-serif`
    }
    voiceHint.value = {
      ...prefill.voice,
      missingSeeds: prefill.missingSeeds,
      fontRaw: prefill.font?.raw,
    }
  } catch (e) {
    styleGuideError.value = e.message
  }
}

function buildDefinition () {
  const allowGuest = isNoAuth.value ? true : form.allowGuest
  return {
    key: form.key,
    label: form.label,
    theme: {
      seeds: { ...form.seeds },
      fonts: [],
      typography: {
        ...(form.typography.heading ? { sysFontFamilyHeading: form.typography.heading } : {}),
        ...(form.typography.body ? { sysFontFamilyBody: form.typography.body } : {}),
      },
    },
    config: {
      catalog: { mode: form.catalogMode },
      skuList: { layout: 'columns' },
      checkout: { allowGuest, loyalty: null, showPoweredByCoda: true, showRating: true },
      signIn: { flow: isNoAuth.value ? 'codm' : form.authFlow },
      navbar: { hideSignIn: isNoAuth.value },
      profile: {
        avatarStyle: 'icon', playerCard: 'nickname-only', showLoyaltyPill: false,
        ...(isNoAuth.value ? { showAccountInstructions: false, showPlayerAccount: false } : {}),
      },
      footer: { supportUrl: '#', social: { x: null, facebook: null, instagram: null, youtube: null, tiktok: null, discord: null } },
      locale: { defaultMarket: 'US', languages: ['en'], markets: ['US'] },
      chrome: { iconVariant: 'light' },
      device: { default: 'iphone' },
    },
    strings: {
      currency: { name: form.currencyName, abbr: form.currencyAbbr },
      sku: { bonusLabel: 'BONUS', bestSeller: 'BEST SELLER', bestValue: 'BEST VALUE' },
      nav: { groups: [], items: [] },
      signIn: {
        logoAlt: form.label, cta: 'Sign In', openingApp: `Opening ${form.label}…`,
        qrInstruction: 'Scan this QR code with a mobile device logged into your account',
        pagePrompt: 'Sign in to your account to purchase',
      },
      account: { heading: 'YOUR ACCOUNT', playerIdLabel: 'Your Player ID', instructionsPrefix: 'In the app go to', playerCardLabel: null },
      checkout: { actionLabel: 'Buy Now' },
      footer: { supportCta: 'Support Portal', cookieLabel: 'Cookie Preference', cookieCta: 'Manage Your Cookie Preference', socialHeading: 'Stay up to date with us', disclaimer: null, legalLinks: [] },
      page: { tabs: [form.currencyName], promoTitle: 'PLACEHOLDER PROMO TITLE', promoAction: 'SHOP NOW', currencySection: form.currencyName },
    },
    translations: {},
    assets: 'placeholder',
    catalog: null,
    featured: null,
  }
}

async function submit () {
  error.value = null
  busy.value = true
  try {
    await api.createStore(buildDefinition())
    emit('created', form.key)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="wizard" @submit.prevent="submit">
    <h2>New store</h2>

    <label>Key <span class="req">*</span>
      <input v-model="form.key" pattern="[a-z][a-z0-9-]*" placeholder="mytitle" required />
    </label>
    <label>Label <span class="req">*</span>
      <input v-model="form.label" placeholder="My Title" required />
    </label>

    <label v-if="styleGuides.length">Import from style guide
      <select v-model="selectedStyleGuide" @change="applyStyleGuide">
        <option value="">— none —</option>
        <option v-for="g in styleGuides" :key="g.name" :value="g.name">{{ g.brand }}</option>
      </select>
      <span class="wizard__hint">Prefills seeds + typography from docs/style-guides/&lt;name&gt;/spec.json — everything below stays editable.</span>
    </label>
    <p v-if="styleGuideError" class="wizard__error">{{ styleGuideError }}</p>
    <div v-if="voiceHint" class="wizard__voice">
      <strong>Voice</strong> — {{ voiceHint.adjectives.join(', ') }}
      <p v-if="voiceHint.summary">{{ voiceHint.summary }}</p>
      <p v-if="voiceHint.fontRaw" class="wizard__hint">Font (name only, no files yet — self-host or licence before shipping): {{ voiceHint.fontRaw }}</p>
      <p v-if="voiceHint.missingSeeds?.length" class="wizard__hint">No seed colour for: {{ voiceHint.missingSeeds.join(', ') }} — left at the wizard default.</p>
    </div>

    <fieldset>
      <legend>Brand seeds (OKLCH)</legend>
      <label v-for="role in Object.keys(form.seeds)" :key="role">
        {{ role }}
        <input v-model="form.seeds[role]" />
      </label>
    </fieldset>

    <fieldset>
      <legend>Typography (optional)</legend>
      <label>Heading family <input v-model="form.typography.heading" placeholder="'Inter', system-ui, sans-serif" /></label>
      <label>Body family <input v-model="form.typography.body" placeholder="'Inter', system-ui, sans-serif" /></label>
    </fieldset>

    <label>Catalog model
      <select v-model="form.catalogMode">
        <option value="page">page — bespoke single-scroll sections</option>
        <option value="filter">filter — category filter nav + catalogue tree</option>
      </select>
    </label>

    <label>Auth flow
      <select v-model="form.authFlow">
        <option v-for="f in AUTH_FLOWS" :key="f.value" :value="f.value">{{ f.label }}</option>
      </select>
    </label>

    <label class="checkbox" :class="{ disabled: isNoAuth }">
      <input type="checkbox" :checked="isNoAuth || form.allowGuest" :disabled="isNoAuth"
             @change="form.allowGuest = $event.target.checked" />
      Allow guest checkout
      <span v-if="isNoAuth" class="wizard__hint">(always true — no sign-in flow exists)</span>
    </label>

    <label>Currency name <input v-model="form.currencyName" /></label>
    <label>Currency abbr <input v-model="form.currencyAbbr" /></label>

    <p v-if="error" class="wizard__error">{{ error }}</p>

    <button type="submit" :disabled="busy">{{ busy ? 'Creating…' : 'Create store' }}</button>
  </form>
</template>

<style scoped>
.wizard { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; max-width: 32rem; }
.wizard label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; }
.wizard input, .wizard select { padding: 0.4rem 0.5rem; background: var(--cms-input-bg, #1a1a1e); color: inherit; border: 1px solid var(--cms-border, #2a2a2e); border-radius: 4px; font: inherit; }
.wizard fieldset { border: 1px solid var(--cms-border, #2a2a2e); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.wizard .checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
.wizard .checkbox.disabled { opacity: 0.6; }
.wizard__hint { font-size: 0.75rem; opacity: 0.7; }
.wizard__voice { font-size: 0.82rem; background: var(--cms-input-bg, #1a1a1e); border: 1px solid var(--cms-border, #2a2a2e); border-radius: 6px; padding: 0.6rem 0.75rem; }
.wizard__voice p { margin: 0.35rem 0 0; }
.wizard .req { color: #ff6b6b; }
.wizard button { padding: 0.6rem; background: #3d7eff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.wizard button:disabled { opacity: 0.6; cursor: default; }
.wizard__error { color: #ff6b6b; font-size: 0.85rem; }
</style>
