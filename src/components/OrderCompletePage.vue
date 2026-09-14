<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Grid from './Grid.vue'
import Span from './Span.vue'
import Button from './Button.vue'
import Card from './Card.vue'
import SkuBanner from './SkuBanner.vue'
import LinkRow from './LinkRow.vue'
import GiftTaskBanner from './GiftTaskBanner.vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useOrderComplete } from '../composables/useOrderComplete.js'
import { useTaskGiftClaim } from '../composables/useTaskGiftClaim.js'
import { useWebPush } from '../composables/useWebPush.js'
import { formatNumber } from '../utils/formatNumber.js'

/**
 * OrderCompletePage — full-page Purchase Success view (Figma node 335:61272).
 * A view, not an overlay: rendered in App.vue's default slot in place of the
 * storefront when useOrderComplete().orderCompleteOpen is true; the NavBar
 * stays mounted above it (mirrors TransactionHistoryPage exactly).
 *
 * Three sections, top to bottom:
 *   1. Hero (full-bleed) — bg image + scrim, title/subtitle, primary CTA.
 *   2. Gift banner — the same task-gated 88 CP touchpoint as the Gifts
 *      category (useTaskGiftClaim / TaskGiftSheet, mounted once in App.vue),
 *      so claiming from either surface reflects on both.
 *   3. Order Summary — SKU banner (persists useCheckout().selectedItem via
 *      useOrderComplete's order.sku, falling back to the Figma default) +
 *      secondary CTA + a label:value detail list.
 *   4. Need Help — 4 external link-out rows (not an accordion — this section
 *      is a plain link list in Figma, unlike the storefront's FAQ).
 *
 * Theme-agnostic: copy comes from strings.page.orderComplete; gated on that
 * key's presence so a store without it simply never reaches this view.
 */
defineEmits(['close'])

const router = useRouter()
const strings = useStoreStrings()
const assets = useStoreAssets()
const { order } = useOrderComplete()
const { step: giftTaskStep, openSheet: openTaskGiftSheet } = useTaskGiftClaim()
const { subscribed: webPushSubscribed, toggle: toggleWebPush } = useWebPush()

const t = computed(() => strings.value.page.orderComplete)
const giftTaskCopy = computed(() => strings.value.page.giftTask)
// Banner CTA is a compact pill (unlike TaskGiftSheet's own full-sentence
// footer CTA) — short label + a leading icon for the install step, same
// "Install" + install_mobile treatment as the Gifts CategoryBanner's own
// PWA CTA (App.vue's .gifts-banner__pwa-cta). The push step instead renders
// a bell icon + ToggleSwitch — same "other touch points" pattern as the
// Gifts CategoryBanner's own webpush toggle (App.vue's .gifts-banner__
// webpush-wrap), rather than a button.
const giftTaskCta = computed(() => {
  switch (giftTaskStep.value) {
    case 'install': return strings.value.page.pwaInstall?.bannerCta
    case 'claim':   return giftTaskCopy.value?.ctaClaim
    default:        return giftTaskCopy.value?.gotIt
  }
})
const giftTaskIcon = computed(() => giftTaskStep.value === 'install' ? 'install_mobile' : null)

// SKU art — order.sku.skuImage (persisted from the real selection) first,
// else the same per-amount CP coin lookup App.vue's cpCoinFor() uses.
const skuImage = computed(() =>
  order.value.sku.skuImage
  ?? assets.value.content.cpCoins?.[order.value.sku.amount]
  ?? assets.value.content.skuCodPoint,
)

// Hero background — dedicated art first, else the download-banner's key art
// (same "no dedicated asset yet" graceful fallback used elsewhere).
const heroBg = computed(() => assets.value.content.orderCompleteHero ?? assets.value.content.downloadBannerBg)
</script>

<template>
  <section v-if="t" class="order-complete">
    <!-- Hero — full-bleed at EVERY breakpoint (not just XS/S like Span's
         "carousel" size): a plain full-width block, outside any Grid, so it
         always spans edge to edge. Only the text/CTA column inside it uses a
         Grid>Span(content) so long lines stay capped/centred on very wide
         screens, matching the rest of the page. -->
    <div class="order-complete__hero">
      <div class="order-complete__hero-bg" aria-hidden="true">
        <img v-if="heroBg" :src="heroBg" alt="" class="order-complete__hero-bg-img" />
        <div class="order-complete__hero-scrim" />
      </div>
      <Grid>
        <Span size="content">
          <div class="order-complete__hero-inner">
            <div class="order-complete__hero-content">
              <h1 class="order-complete__title text-style-heading-display-hero">{{ t.heroTitle }}</h1>
              <p class="order-complete__subtitle text-style-paragraph-regular">{{ t.heroSubtitle }}</p>
            </div>
            <Button
              variant="primary"
              size="large"
              shimmer
              label-style="text-style-utility-default-uppercase"
              class="order-complete__primary-cta"
              @click="router.push('/')"
            >{{ t.continueShopping }}</Button>
          </div>
        </Span>
      </Grid>
    </div>

    <!-- Gift banner — same task-gated 88 CP touchpoint as the Gifts category
         (see useTaskGiftClaim.js), reskinned for the post-purchase surface.
         Hidden once claimed: its copy/CTA are all "go claim your 88 CP" framing
         (install the PWA, turn on push), which has nothing left to say to a
         user who already has the reward — so the banner (which doubles as the
         PWA-install touchpoint on this page) drops out entirely rather than
         degrading to a dead "Got it" pill. Install/push/claim steps show a
         compact pill that opens TaskGiftSheet; the push step instead shows a
         bare toggle (same pattern as the Gifts CategoryBanner's own webpush
         toggle) that drives useWebPush directly — flipping it also advances
         useTaskGiftClaim's step, which TaskGiftSheet picks up live if open.
         Tinted with the shared "positive" info-banner tone (below) — this
         one banner is celebrating an earned reward, not a generic promo. -->
    <Grid v-if="giftTaskCopy && giftTaskStep !== 'claimed'">
      <Span size="content">
        <GiftTaskBanner
          tone="success"
          :icon="assets.content.cpCoins?.[88]"
          :title="giftTaskCopy.orderCompleteBannerTitle"
          :description="giftTaskCopy.orderCompleteBannerDesc"
          :mode="giftTaskStep === 'push' ? 'toggle' : 'cta'"
          :toggle-model-value="webPushSubscribed"
          :toggle-aria-label="giftTaskCopy.stepPush"
          toggle-poi="order-complete-gift-task-toggle"
          :cta-label="giftTaskCta"
          :cta-icon="giftTaskIcon"
          cta-poi="order-complete-gift-task-cta"
          @update:toggle="toggleWebPush()"
          @cta-click="openTaskGiftSheet()"
        />
      </Span>
    </Grid>

    <!-- Order Summary -->
    <Grid>
      <Span size="content">
        <Card :title="t.summaryTitle">
          <!-- SKU banner — art/amount/bonus/price all read from `order.sku`,
               which persists the checkout selection (see useOrderComplete.js). -->
          <SkuBanner
            :image="skuImage"
            :image-alt="strings.currency.name"
            :tag-label="order.isNewUser ? t.newUserTag : null"
            :amount-text="`${formatNumber(order.sku.amount)} ${strings.currency.abbr}`"
            :bonus-text="order.sku.baseAmount !== null && order.sku.bonusAmount !== null
              ? `(${formatNumber(order.sku.baseAmount)} + ${formatNumber(order.sku.bonusAmount)} ${t.bonusLabel})`
              : null"
          />

          <Button
            variant="primary"
            size="large"
            label-style="text-style-utility-default-uppercase"
            class="order-complete__secondary-cta"
            @click="router.push('/')"
          >{{ t.backToGame }}</Button>

          <!-- Player/payment detail rows — label:value, each column 50% of the
               row width. Labels already carry their own trailing colon (see
               strings.page.orderComplete), so there's no separate sep span. -->
          <div class="order-complete__detail">
            <div class="order-complete__detail-row">
              <span class="order-complete__detail-label text-style-utility-default-regular">{{ t.nickname }}</span>
              <span class="order-complete__detail-value text-style-utility-default-bold">{{ order.player.nickname }}</span>
            </div>
            <div class="order-complete__detail-row">
              <span class="order-complete__detail-label text-style-utility-default-regular">{{ t.playerId }}</span>
              <span class="order-complete__detail-value text-style-utility-default-bold">{{ order.player.playerId }}</span>
            </div>
            <div class="order-complete__detail-row">
              <span class="order-complete__detail-label text-style-utility-default-regular">{{ t.email }}</span>
              <span class="order-complete__detail-value text-style-utility-default-bold">{{ order.player.email }}</span>
            </div>
            <div class="order-complete__detail-row">
              <span class="order-complete__detail-label text-style-utility-default-regular">{{ t.paymentMethod }}</span>
              <span class="order-complete__detail-value text-style-utility-default-bold">{{ order.player.paymentMethod }}</span>
            </div>
            <div class="order-complete__detail-row">
              <span class="order-complete__detail-label text-style-utility-default-regular">{{ t.price }}</span>
              <span class="order-complete__detail-value text-style-utility-default-bold">{{ order.sku.currentPrice }}</span>
            </div>
          </div>
        </Card>
      </Span>
    </Grid>

    <!-- Need Help — plain external link-out rows (not an accordion) -->
    <Grid>
      <Span size="content">
        <Card :title="t.needHelpTitle">
          <LinkRow
            v-for="link in t.needHelp"
            :key="link.label"
            :href="link.url ?? '#'"
            :label="link.label"
          />
        </Card>
      </Span>
    </Grid>
  </section>
</template>

<style scoped>
.order-complete {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-separation);
  padding-bottom: calc(var(--x-pad-surface-xl) + var(--x-pad-surface-s));
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   Full-bleed at every breakpoint: a plain full-width block (no Grid/Span
   wrapping it), so it always spans edge to edge, even at the M/L breakpoints
   where every other "carousel"-size section in this codebase reverts to the
   960px-capped column. The Grid>Span(content) lives ONLY inside it, around
   the text/CTA, so that column still caps/centres on very wide screens. */
.order-complete__hero {
  position: relative;
  overflow: hidden;
}
.order-complete__hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.order-complete__hero-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.order-complete__hero-scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim-banner-strong);
}
.order-complete__hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-xl) var(--x-pad-surface-s);
}
.order-complete__hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-tight);
  text-align: center;
  color: var(--x-text-header-default);
  width: 100%;
}
.order-complete__title {
  margin: 0;
  text-transform: uppercase;
  /* Centred heading — condense scaleX must anchor to the middle, not the
     text-style default (left), so it stays visually centred (skill §2). */
  transform-origin: center center;
}
.order-complete__subtitle {
  margin: 0;
  color: var(--x-text-header-default);
  transform-origin: center center;
}

/* Primary yellow gloss CTA — same pattern as ClaimGiftSheet's .sheet__cta.
   max-width matches InlineCheckoutCta's own CTA cap (checkout-cta__btn) — the
   hero's text column is now much wider than a phone screen at M/L, so the
   button needs its own bound rather than stretching to fill it. */
.order-complete__primary-cta {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  --x-material-metal-gloss-shimmer-core: var(--x-bg-action-primary);
}

/* Secondary white CTA — --x-bg-action-neutral (solid near-white) + dark
   (on-primary) text, same two-tone treatment as the primary CTA, different fill. */
.order-complete__secondary-cta {
  width: 100%;
  --btn-bg: var(--x-bg-action-neutral);
  --btn-bg-hover: var(--x-bg-action-neutral-hover);
  --btn-text-color: var(--x-text-on-primary);
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
}

/* Detail rows — label/value columns each take exactly 50% of the row width.
   margin-top adds --x-gap-content-narrow (4px) on top of the card's own 8px
   flex gap, so the button-to-details gap totals 12px (--x-gap-content-loose)
   without disturbing the 8px gap the card uses between its other children. */
.order-complete__detail {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  margin-top: var(--x-gap-content-narrow);
}
.order-complete__detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--x-gap-content-default);
  color: var(--x-text-header-default);
}
.order-complete__detail-label {
  min-width: 0;
  color: var(--x-text-body-default);
}
.order-complete__detail-value {
  min-width: 0;
  color: var(--x-text-header-default);
}
</style>
