/**
 * useStoreAssets — per-store image registry
 *
 * Returns a computed object of asset URLs for the currently active theme
 * (read from <html data-theme>). All imports are resolved by Vite at build time
 * so every ACTIVE store's assets are fingerprinted and bundled, and the runtime
 * switch is a zero-cost lookup with no network request. Store-locked builds
 * (`vite build --mode <store>`) bundle only that store's imagery.
 *
 * Structure:
 *   assets.brand.wordmark    — store wordmark (navbar, loader)
 *   assets.brand.logomark    — store logomark (sign-in icon, QR overlay)
 *   assets.brand.qrCode      — QR code image for the sign-in loader
 *   assets.brand.qrPlaceholder — SVG placeholder when qrCode is absent
 *   assets.brand.coda        — Coda branding (checkout footer)
 *   assets.brand.rating      — Store rating badge (checkout footer)
 *   assets.pc.googleApple    — Google Pay / Apple Pay logo  ┐ shared/market-level,
 *   assets.pc.creditCard     — Credit card logo            │ polarity-keyed (light/
 *   assets.pc.paypalVenmo    — PayPal / Venmo logo         │ dark); selected via
 *   assets.pc.cashApp        — Cash App logo               │ useStoreConfig.chrome.iconVariant
 *   assets.pc.boleto         — Boleto BR logo               ┘
 *   assets.pc.{truemoney,promptpay,kplus,dtac,bankTransfer,ais,cardPayment,
 *     sevenEleven,shopeepay,rabbitLinepay} — FCM Buy Now pilot (fcmPaymentSheet
 *     flag) regional payment-channel logos, same polarity-keyed family as above
 *   assets.social.{x,facebook,instagram,youtube,tiktok,discord} — footer social
 *     icons, shared/market-level, same polarity flag (x is monochrome and swaps
 *     art; the other 5 are full-colour and reuse one file for both polarities)
 *   assets.content.*         — campaign/sku images (store-specific)
 *   assets.content.avatar    — in-game player avatar (navbar + account popover)
 *
 * Adding a new store: create src/stores/<store>/img/{brand,content}/, import
 * the assets in src/stores/<store>/store.js under its `assets` key, and
 * register the module in the active.*.js manifests.
 */

import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { useStoreConfig, configFor } from './useStoreConfig.js'
import { ACTIVE_STORES } from '@active-stores'

// ── Payment channels + social icons (shared / market-level, polarity-keyed) ───
// Neither family is per-store — both are shared across stores in a market and
// carry a light/dark POLARITY: 'light' marks for a dark UI (every current
// store), 'dark' reserved for a future light-theme store. A store selects its
// polarity via useStoreConfig().chrome.iconVariant — one flag, two asset
// families, so a future light-theme store flips both together.
import pcLightGoogleApple from '@/shared/pc/light/google-apple.svg'
import pcLightCreditCard  from '@/shared/pc/light/credit-card.svg'
import pcLightPaypalVenmo from '@/shared/pc/light/paypal-venmo.svg'
import pcLightCashApp     from '@/shared/pc/light/cash-app.svg'
import pcLightBoleto      from '@/shared/pc/light/boleto.svg'

// FCM Buy Now pilot (fcmPaymentSheet flag) — regional payment-channel logos,
// exported from the "Select Payment Method" grid (Figma 3376:28480…28489).
// Cropped straight from the design's PC-card renders (72×24 @1x), so these
// are raster PNGs rather than vector SVGs like the 4 above.
import pcLightTruemoney    from '@/shared/pc/light/truemoney.png'
import pcLightPromptpay    from '@/shared/pc/light/promptpay.png'
import pcLightKplus        from '@/shared/pc/light/kplus.png'
import pcLightDtac         from '@/shared/pc/light/dtac.png'
import pcLightBankTransfer from '@/shared/pc/light/bank-transfer.png'
import pcLightAis          from '@/shared/pc/light/ais.png'
import pcLightCardPayment  from '@/shared/pc/light/card-payment.png'
import pcLight7Eleven      from '@/shared/pc/light/7eleven.png'
import pcLightShopeepay    from '@/shared/pc/light/shopeepay.png'
import pcLightRabbitLinepay from '@/shared/pc/light/rabbit-linepay.png'

const PC = {
  light: {
    googleApple: pcLightGoogleApple,
    creditCard:  pcLightCreditCard,
    paypalVenmo: pcLightPaypalVenmo,
    cashApp:     pcLightCashApp,
    boleto:      pcLightBoleto,
    truemoney:     pcLightTruemoney,
    promptpay:     pcLightPromptpay,
    kplus:         pcLightKplus,
    dtac:          pcLightDtac,
    bankTransfer:  pcLightBankTransfer,
    ais:           pcLightAis,
    cardPayment:   pcLightCardPayment,
    sevenEleven:   pcLight7Eleven,
    shopeepay:     pcLightShopeepay,
    rabbitLinepay: pcLightRabbitLinepay,
  },
  // dark: { … } — add when a light-theme store ships dark-on-light logos
}

// Social icons — x is monochrome and needs both polarities; the other 5 are
// full-colour brand marks and reuse the same file under both keys.
import socialXLight       from '@/shared/social/light/x.svg'
import socialXDark        from '@/shared/social/dark/x.svg'
import socialFacebook     from '@/shared/social/facebook.svg'
import socialInstagram    from '@/shared/social/instagram.svg'
import socialYoutube      from '@/shared/social/youtube.svg'
import socialTiktok       from '@/shared/social/tiktok.svg'
import socialDiscord      from '@/shared/social/discord.svg'

const SOCIAL = {
  light: { x: socialXLight, facebook: socialFacebook, instagram: socialInstagram, youtube: socialYoutube, tiktok: socialTiktok, discord: socialDiscord },
  dark:  { x: socialXDark,  facebook: socialFacebook, instagram: socialInstagram, youtube: socialYoutube, tiktok: socialTiktok, discord: socialDiscord },
}

// ── Registry — per-store imagery from the store modules ──────────────────────
const REGISTRY = Object.fromEntries(ACTIVE_STORES.map(s => [s.key, s.assets]))
const DEFAULT  = ACTIVE_STORES[0].assets

// Exported (not just used internally) so a caller that needs an EXPLICIT
// store's assets without going through the single global active theme — the
// library viewer's theme-grid mode, same reason configFor/stringsFor exist —
// can get it directly.
export function assetsFor (key) {
  const store = REGISTRY[key] ?? DEFAULT
  // Merge in the shared payment-channel logos + social icons for this
  // store's polarity, so consumers keep reading assets.pc.* / assets.social.*.
  const variant = configFor(key).chrome.iconVariant
  return { ...store, pc: PC[variant] ?? PC.light, social: SOCIAL[variant] ?? SOCIAL.light }
}

export function useStoreAssets () {
  const { theme } = useTheme()
  return computed(() => assetsFor(theme.value))
}
