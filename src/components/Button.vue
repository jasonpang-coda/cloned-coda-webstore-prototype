<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { vRipple as vRippleBase } from '../directives/vRipple.js'
import { vHaptic as vHapticBase } from '../directives/vHaptic.js'

/**
 * Button — the shared button primitive. Variant names (primary/secondary/
 * tertiary) map directly onto the existing `--x-bg-action-*` token family in
 * ds/semantics.css, which already anticipated this component.
 */
const props = defineProps({
  variant: { type: String, default: 'primary' }, // 'primary' | 'secondary' | 'tertiary' | 'link' | 'icon' | 'chip'
  active: { type: Boolean, default: false }, // chip variant only — selected/pressed tab state
  size: { type: String, default: 'medium' }, // 'small' | 'medium' | 'large'
  icon: { type: String, default: null }, // MaterialIcon name
  iconVariant: { type: String, default: 'round' }, // MaterialIcon glyph style, e.g. 'outlined' (SkuImageCard's info icon)
  iconPosition: { type: String, default: 'leading' }, // 'leading' | 'trailing' | 'only'
  fullWidth: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  as: { type: String, default: 'button' }, // 'button' | 'a'
  href: { type: String, default: null },
  shimmer: { type: Boolean, default: false }, // fx-shimmer--metal-gloss for hero CTAs
  brand: { type: String, default: null }, // e.g. 'signin' | 'mykonami' — overrides fill via --x-bg-action-<brand>
  ariaLabel: { type: String, default: null },
  label: { type: String, default: null }, // fallback content when no default slot is provided (e.g. in the harness, which only binds props)
  ripple: { type: Boolean, default: true }, // opt out for a surface that deliberately omits ripple (e.g. Snackbar's auto-dismissing close)
  haptic: { type: Boolean, default: true },
  hapticToken: { type: String, default: 'press' }, // e.g. 'confirm' for a heavier tap (BuyNowBar's Buy Now CTA)
  labelStyle: { type: String, default: 'text-style-utility-action-regular' }, // override for a CTA with a distinct label typography (e.g. BuyNowBar's heading-banner Buy Now label)
  underline: { type: Boolean, default: true }, // link variant only — some plain-text buttons (e.g. PromoCode's Apply) want link coloring/shape but no underline
})

defineEmits(['click'])

const tag = computed(() => (props.as === 'a' ? 'a' : 'button'))
const isIconOnly = computed(() => props.variant === 'icon' || props.iconPosition === 'only')
// Literal (not interpolated) var() strings per known brand — the static
// token scanner regexes this file's own source text for `var(--x-...)`
// patterns, so a template-literal-constructed token name is invisible to it
// and would report "unresolved mandatory token" on every store that doesn't
// define that brand's token (e.g. only 6 of 12 stores define
// --x-bg-action-signin). Add a new brand's literal entry here as it's needed.
const BRAND_BG = {
  signin: 'var(--x-bg-action-signin, var(--x-bg-action-primary))',
  mykonami: 'var(--x-bg-action-mykonami, var(--x-bg-action-signin, var(--x-bg-action-primary)))',
}
const brandStyle = computed(() => (props.brand ? { '--btn-brand-bg': BRAND_BG[props.brand] } : null))
// Icon-only hit areas use the --x-size-icon-* scale (distinct from labeled
// buttons' --x-size-control-* scale) — matches BaseSheet's close button and
// every other icon-only tap target in the codebase.
const ICON_PX = { small: 18, medium: 24, large: 28 }
const iconPx = computed(() => ICON_PX[props.size] ?? ICON_PX.medium)

// Local directives so `ripple`/`haptic` props can opt out per-instance —
// the base directives always mount unconditionally on bind.
const vRipple = { mounted: (el) => { if (props.ripple) vRippleBase.mounted(el) }, unmounted: vRippleBase.unmounted }
const vHaptic = {
  mounted: (el) => { if (props.haptic) vHapticBase.mounted(el, { arg: props.hapticToken }) },
  unmounted: vHapticBase.unmounted,
}
</script>

<template>
  <component
    :is="tag"
    v-ripple
    v-haptic
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--full-width': fullWidth,
        'btn--loading': loading,
        'btn--icon-only': isIconOnly,
        'btn--brand': brand,
        'btn--no-underline': variant === 'link' && !underline,
        'btn--active': active,
        'fx-shimmer': shimmer && !disabled,
        'fx-shimmer--metal-gloss': shimmer && !disabled,
      },
    ]"
    :style="brandStyle"
    :type="tag === 'button' ? 'button' : undefined"
    :href="tag === 'a' ? href : undefined"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-disabled="tag === 'a' && (disabled || loading) ? 'true' : undefined"
    :aria-label="ariaLabel"
    :aria-busy="loading ? 'true' : undefined"
    @click="$emit('click', $event)"
  >
    <slot v-if="(icon || $slots.icon) && iconPosition !== 'trailing'" name="icon">
      <MaterialIcon
        class="btn__icon"
        :name="icon"
        :variant="iconVariant"
        :size="isIconOnly ? iconPx : (size === 'small' ? 16 : 18)"
      />
    </slot>
    <span v-if="!isIconOnly" class="btn__label" :class="labelStyle"><slot>{{ label }}</slot></span>
    <slot v-if="(icon || $slots.icon) && iconPosition === 'trailing'" name="icon">
      <MaterialIcon
        class="btn__icon"
        :name="icon"
        :variant="iconVariant"
        :size="size === 'small' ? 16 : 18"
      />
    </slot>
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  border: none;
  border-radius: var(--btn-radius, var(--x-radius-control-full));
  cursor: pointer;
  transition: var(--x-motion-btn-activate);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--loading {
  opacity: 0.7;
  cursor: progress;
}

.btn--full-width {
  width: 100%;
}

/* ── sizes ─────────────────────────────────────────────────────────────── */
.btn--small {
  height: var(--x-size-control-xs);
  padding: 0 var(--x-pad-surface-m);
}
.btn--medium {
  height: var(--x-size-control-s);
  padding: 0 var(--x-pad-surface-l);
}
.btn--large {
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-xl);
}

/* ── variants ──────────────────────────────────────────────────────────── */
.btn--primary {
  /* --btn-bg: a full custom fill for a CTA that doesn't use the semantic
     action-color tier at all (e.g. CheckoutStepFooter's CTA keys off
     --x-text-hyperlink-default, the codebase's de-facto brand-accent
     reference) — distinct from --btn-brand-bg, which specifically swaps in
     a named --x-bg-action-<flow> token (see BRAND_BG above). */
  background: var(--btn-bg, var(--btn-brand-bg, var(--x-bg-action-primary)));
  color: var(--btn-text-color, var(--x-text-on-primary));
}
.btn--primary:hover:not(:disabled) {
  background: var(--btn-bg-hover, var(--btn-brand-bg, var(--x-bg-action-primary-hover)));
}
.btn--primary:active:not(:disabled) {
  background: var(--btn-bg-pressed, var(--btn-brand-bg, var(--x-bg-action-primary-pressed)));
}

.btn--secondary {
  background: var(--x-bg-action-secondary);
  color: var(--x-text-on-action-secondary);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--x-bg-action-secondary-hover);
}
.btn--secondary:active:not(:disabled) {
  background: var(--x-bg-action-secondary-pressed);
}

/* Outline/low-emphasis — grounded in the first real usage found
   (InfoStepFooter's isum__signin-btn: transparent + border, not the
   --x-bg-action-tertiary fill tier, which turned out to be a different,
   unused-so-far visual). --btn-bg/--btn-text-color/--btn-radius overrides
   still apply on top for a per-instance variant (e.g. StoryCarousel's frosted
   outline pill). */
.btn--tertiary {
  background: var(--btn-bg, transparent);
  color: var(--btn-text-color, var(--x-text-body-default));
  border: var(--border-weight-action) solid var(--btn-border, var(--x-border-action-default));
}
.btn--tertiary:hover:not(:disabled) {
  background: var(--btn-bg-hover, var(--btn-bg, transparent));
  filter: var(--btn-hover-filter, brightness(1.2));
}

.btn--link {
  background: none;
  padding: 0;
  height: auto;
  color: var(--btn-text-color, var(--x-text-hyperlink-default));
}
.btn--link .btn__label {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.btn--link.btn--no-underline .btn__label {
  text-decoration: none;
}

.btn--icon,
.btn--icon-only {
  background: none;
  padding: 0;
  /* Always a true circle regardless of store — unlike labeled CTAs' pill
     shape (--x-radius-control-full), which is a per-store brand choice
     (e.g. COD:M resolves it to a near-square 2px). */
  border-radius: var(--x-radius-badge-full);
  color: var(--btn-icon-color, var(--x-text-header-default));
}
.btn--icon:hover:not(:disabled),
.btn--icon-only:hover:not(:disabled) {
  color: var(--btn-icon-color-hover, var(--x-text-header-strong));
  opacity: var(--btn-icon-opacity-hover, 1);
}
.btn--icon-only.btn--small { width: var(--x-size-icon-s); height: var(--x-size-icon-s); }
.btn--icon-only.btn--medium { width: var(--x-size-icon-l); height: var(--x-size-icon-l); }
.btn--icon-only.btn--large { width: var(--x-size-icon-xl); height: var(--x-size-icon-xl); }

/* Standalone pill chip/tab — grounded in FilterTabs, the one real usage
   simple enough to generalize (self-contained, no sibling-dependent border
   logic). CategoryNav (animated underline, L1/L2/L3 tiers) and
   PlayerAccount's chips (segmented group — shared borders between siblings)
   are both excluded: forcing either through this primitive would need
   Button to know about its neighbors, breaking encapsulation. Chip has no
   fixed control-height (content-driven via padding), unlike every other
   variant, so `size` is not meaningful here. */
.btn--chip {
  min-width: var(--x-size-control-xxl);
  height: auto;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  background: var(--btn-bg, var(--x-bg-tag-neutral));
  color: var(--btn-text-color, var(--x-text-body-inverse));
}
.btn--chip:not(.btn--active):hover:not(:disabled) {
  background: var(--x-bg-tag-inverse);
  box-shadow: inset 0 0 0 var(--border-weight-default) var(--x-border-card-hover);
}
.btn--chip:active:not(:disabled) {
  transform: scale(0.96);
}
.btn--chip.btn--active {
  background: var(--btn-bg, var(--x-bg-action-primary));
  color: var(--btn-text-color, var(--x-text-on-primary));
}
.btn--chip.btn--active:hover:not(:disabled) {
  opacity: 0.85;
}

.btn__label {
  white-space: nowrap;
}
</style>
