<script setup>
import { computed } from 'vue'

/**
 * MaterialIcon — renders a Google Material Symbol from @material-symbols/svg-400.
 * The SVG is applied as a CSS mask filled with `currentColor`, so the icon
 * inherits text colour like a font glyph.
 *
 * Usage:  <MaterialIcon name="account_circle" variant="round" :size="28" />
 *
 * Icons are resolved via explicit `?url` imports (below) rather than a
 * node_modules glob — bare-specifier `?url` imports are emitted as hashed
 * assets into dist/assets, so they work identically in `vite dev`, `vite build`,
 * and on Vercel. (A `/node_modules/**` glob only works in dev and 404s in prod.)
 *
 * `variant="round"` maps to the package's `rounded` folder — kept as `round`
 * here so no call site had to change when this migrated off the old
 * @material-design-icons/svg package (which used `round`).
 *
 * To use a new icon: add an import + an ICONS entry keyed `"<variant>/<name>"`.
 */
import menu          from '@material-symbols/svg-400/rounded/menu.svg?url'
import accountCircle from '@material-symbols/svg-400/rounded/account_circle.svg?url'
import checkCircle    from '@material-symbols/svg-400/rounded/check_circle.svg?url'
import chevronLeft   from '@material-symbols/svg-400/rounded/chevron_left.svg?url'
import chevronRight  from '@material-symbols/svg-400/rounded/chevron_right.svg?url'
import close         from '@material-symbols/svg-400/rounded/close.svg?url'
import expandMore    from '@material-symbols/svg-400/rounded/keyboard_arrow_down.svg?url'
import expandLess    from '@material-symbols/svg-400/rounded/keyboard_arrow_up.svg?url'
import logout        from '@material-symbols/svg-400/rounded/logout.svg?url'
import schedule      from '@material-symbols/svg-400/rounded/schedule.svg?url'
import openInNew     from '@material-symbols/svg-400/rounded/open_in_new.svg?url'
import photoCamera   from '@material-symbols/svg-400/rounded/photo_camera.svg?url'
import stars         from '@material-symbols/svg-400/rounded/stars.svg?url'
import star          from '@material-symbols/svg-400/rounded/star.svg?url'
import starFill      from '@material-symbols/svg-400/rounded/star-fill.svg?url'
import highlightAlt  from '@material-symbols/svg-400/rounded/frame_inspect.svg?url'
import contentCopy   from '@material-symbols/svg-400/rounded/content_copy.svg?url'
import check         from '@material-symbols/svg-400/rounded/check.svg?url'
import replay        from '@material-symbols/svg-400/rounded/replay.svg?url'
import link          from '@material-symbols/svg-400/rounded/link.svg?url'
import download      from '@material-symbols/svg-400/rounded/download.svg?url'
import code          from '@material-symbols/svg-400/rounded/code.svg?url'
import viewModule    from '@material-symbols/svg-400/rounded/view_module.svg?url'
import search        from '@material-symbols/svg-400/rounded/search.svg?url'
import swapHoriz     from '@material-symbols/svg-400/rounded/swap_horiz.svg?url'
import arrowBack     from '@material-symbols/svg-400/rounded/arrow_back.svg?url'
import language      from '@material-symbols/svg-400/rounded/language.svg?url'
import questionAnswer from '@material-symbols/svg-400/rounded/forum.svg?url'
import translate      from '@material-symbols/svg-400/rounded/translate.svg?url'
import modeComment    from '@material-symbols/svg-400/rounded/mode_comment.svg?url'
import queryStats     from '@material-symbols/svg-400/rounded/query_stats.svg?url'
import verifiedUser   from '@material-symbols/svg-400/rounded/verified_user.svg?url'
import groups         from '@material-symbols/svg-400/rounded/groups.svg?url'
import bolt           from '@material-symbols/svg-400/rounded/bolt.svg?url'
import creditCard     from '@material-symbols/svg-400/rounded/credit_card.svg?url'
import signalCellularAlt from '@material-symbols/svg-400/rounded/signal_cellular_alt.svg?url'
import networkWifi       from '@material-symbols/svg-400/rounded/network_wifi.svg?url'
import batteryFull       from '@material-symbols/svg-400/rounded/battery_full.svg?url'
import info              from '@material-symbols/svg-400/rounded/info.svg?url'
import infoOutlined      from '@material-symbols/svg-400/outlined/info.svg?url'
import discount           from '@material-symbols/svg-400/rounded/sell.svg?url'
import handshake         from '@material-symbols/svg-400/rounded/handshake.svg?url'
import directionsBoat    from '@material-symbols/svg-400/rounded/directions_boat.svg?url'
import qrCode2           from '@material-symbols/svg-400/rounded/qr_code_2.svg?url'
import localTaxi         from '@material-symbols/svg-400/rounded/local_taxi.svg?url'
import chat              from '@material-symbols/svg-400/rounded/chat.svg?url'
import simCard           from '@material-symbols/svg-400/rounded/sim_card.svg?url'
import radioButtonUnchecked from '@material-symbols/svg-400/rounded/radio_button_unchecked.svg?url'
import addShoppingCart    from '@material-symbols/svg-400/rounded/add_shopping_cart.svg?url'
import wallet             from '@material-symbols/svg-400/rounded/wallet.svg?url'
import add                from '@material-symbols/svg-400/rounded/add.svg?url'
import tour                from '@material-symbols/svg-400/rounded/tour.svg?url'
import lightMode           from '@material-symbols/svg-400/rounded/light_mode.svg?url'
import darkMode            from '@material-symbols/svg-400/rounded/dark_mode.svg?url'
import installMobile       from '@material-symbols/svg-400/rounded/download_for_offline.svg?url'
import notifications       from '@material-symbols/svg-400/rounded/notifications.svg?url'
import notificationsActive from '@material-symbols/svg-400/rounded/notifications_active.svg?url'
import warning              from '@material-symbols/svg-400/rounded/warning.svg?url'
import error                from '@material-symbols/svg-400/rounded/error.svg?url'
import contextualToken       from '@material-symbols/svg-400/rounded/contextual_token.svg?url'
import screenRotationAlt     from '@material-symbols/svg-400/rounded/screen_rotation_alt.svg?url'
import sportsEsports         from '@material-symbols/svg-400/rounded/sports_esports.svg?url'
import publicIcon            from '@material-symbols/svg-400/rounded/public.svg?url'
import calendarToday         from '@material-symbols/svg-400/rounded/calendar_today.svg?url'
import filterAlt             from '@material-symbols/svg-400/rounded/filter_alt.svg?url'
import store                 from '@material-symbols/svg-400/rounded/store.svg?url'
import gridView               from '@material-symbols/svg-400/rounded/grid_view.svg?url'

const ICONS = {
  'round/account_circle': accountCircle,
  'round/check_circle':   checkCircle,
  'round/chevron_left':   chevronLeft,
  'round/chevron_right':  chevronRight,
  'round/close':          close,
  'round/expand_more':    expandMore,
  'round/expand_less':    expandLess,
  'round/logout':         logout,
  'round/schedule':       schedule,
  'round/open_in_new':    openInNew,
  'round/photo_camera':   photoCamera,
  'round/stars':          stars,
  'round/star':           star,
  'round/star_fill':      starFill,
  'round/highlight_alt':  highlightAlt,
  'round/content_copy':   contentCopy,
  'round/check':          check,
  'round/replay':         replay,
  'round/link':           link,
  'round/download':       download,
  'round/code':           code,
  'round/view_module':    viewModule,
  'round/search':         search,
  'round/swap_horiz':     swapHoriz,
  'round/arrow_back':     arrowBack,
  'round/language':       language,
  'round/question_answer': questionAnswer,
  'round/translate':      translate,
  'round/mode_comment':   modeComment,
  'round/query_stats':    queryStats,
  'round/verified_user':  verifiedUser,
  'round/groups':         groups,
  'round/bolt':           bolt,
  'round/credit_card':    creditCard,
  'round/signal_cellular_alt': signalCellularAlt,
  'round/network_wifi':        networkWifi,
  'round/battery_full':        batteryFull,
  'round/info':                info,
  'outlined/info':             infoOutlined,
  'round/discount':            discount,
  'round/handshake':           handshake,
  'round/directions_boat':     directionsBoat,
  'round/qr_code_2':           qrCode2,
  'round/local_taxi':          localTaxi,
  'round/chat':                chat,
  'round/sim_card':            simCard,
  'round/radio_button_unchecked': radioButtonUnchecked,
  'round/add_shopping_cart':   addShoppingCart,
  'round/wallet':              wallet,
  'round/add':                 add,
  'round/tour':                tour,
  'round/light_mode':          lightMode,
  'round/dark_mode':           darkMode,
  'round/install_mobile':      installMobile,
  'round/notifications':       notifications,
  'round/notifications_active': notificationsActive,
  'round/warning':              warning,
  'round/error':                error,
  'round/menu':                 menu,
  'round/contextual_token':     contextualToken,
  'round/screen_rotation_alt':  screenRotationAlt,
  'round/sports_esports':       sportsEsports,
  'round/public':               publicIcon,
  'round/calendar_today':       calendarToday,
  'round/filter_alt':           filterAlt,
  'round/store':                store,
  'round/grid_view':            gridView,
}

const props = defineProps({
  name: { type: String, required: true },
  /** filled | outlined | round | sharp | two-tone (mostly `round`; `outlined` bundled per-icon as needed) */
  variant: { type: String, default: 'round' },
  size: { type: [Number, String], default: 24 },
})

const url = computed(() => ICONS[`${props.variant}/${props.name}`] || '')

const isFigmaCapture = typeof window !== 'undefined'
  && import.meta.env.DEV
  && new URLSearchParams(window.location.search).has('figmaCapture')
</script>

<template>
  <img
    v-if="isFigmaCapture && url"
    class="material-icon material-icon--capture"
    :src="url"
    alt=""
    :style="{
      width: typeof size === 'number' ? size + 'px' : size,
      height: typeof size === 'number' ? size + 'px' : size,
    }"
    aria-hidden="true"
  />
  <span
    v-else
    class="material-icon"
    :style="{
      width: typeof size === 'number' ? size + 'px' : size,
      height: typeof size === 'number' ? size + 'px' : size,
      '--mi-url': url ? `url(${url})` : 'none',
    }"
    aria-hidden="true"
  ></span>
</template>

<style scoped>
.material-icon {
  display: inline-block;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask: var(--mi-url) center / contain no-repeat;
  mask: var(--mi-url) center / contain no-repeat;
}

.material-icon--capture {
  display: inline-block;
  flex-shrink: 0;
  background: none;
  mask: none;
  -webkit-mask: none;
  object-fit: contain;
  vertical-align: middle;
}
</style>
