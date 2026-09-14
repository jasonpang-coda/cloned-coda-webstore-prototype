<script setup>
import Grid from './Grid.vue'
import Span from './Span.vue'
import MaterialIcon from './MaterialIcon.vue'
import FlagTile from './FlagTile.vue'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useLocale } from '../composables/useLocale.js'
import { useTransactionHistory } from '../composables/useTransactionHistory.js'

/**
 * Footer — site footer (Figma 4050:9549 M+ / 6072:25621 S): an Actions bar
 * (support link, region/language switcher, cookie preference, social links)
 * over a TM/legal bar (publisher logo, disclaimer, Powered-By-Coda, copyright,
 * legal links). Store-agnostic like NavBar — every per-store bit comes from
 * useStoreConfig/useStoreAssets/useStoreStrings; components never branch on
 * theme identity.
 */
const assets = useStoreAssets()
const strings = useStoreStrings()
const config = useStoreConfig()

const {
  currentMarket, currentMarketName, openRegionSelector,
  currentLanguage, availableLanguages, openLanguageSelector,
  common,
} = useLocale()

// Unlike NavBar/NavDrawer (gated by isEnabled('localeSwitcher')), the footer's
// Region action is always visible — the footer isn't behind that flag.

// CategoryNav is `position: fixed` to the viewport bottom — reserve clearance
// below the TM bar only while it's actually mounted (App.vue's own v-if).
const { historyOpen } = useTransactionHistory()

const SOCIAL_NETWORKS = ['x', 'facebook', 'instagram', 'youtube', 'tiktok', 'discord']
</script>

<template>
  <footer class="footer">
    <div class="footer__actions">
      <Grid>
        <Span size="fluid">
          <div class="footer__actions-row">
            <div v-if="config.footer?.supportUrl" class="footer__action">
              <p class="footer__label text-style-utility-action-bold">{{ common.footer.needHelpLabel }}</p>
              <a
                v-ripple
                v-haptic
                :href="config.footer.supportUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="footer__pill"
              >
                <MaterialIcon name="question_answer" variant="round" :size="20" />
                <span class="footer__pill-text text-style-utility-default-regular">{{ strings.footer.supportCta }}</span>
                <MaterialIcon name="open_in_new" variant="round" :size="20" />
              </a>
            </div>

            <div class="footer__action">
              <p class="footer__label text-style-utility-action-bold">{{ common.footer.regionLabel }}</p>
              <button
                v-ripple
                v-haptic
                type="button"
                class="footer__pill"
                :aria-label="`Region: ${currentMarketName}`"
                @click="openRegionSelector()"
              >
                <FlagTile :code="currentMarket.code" :width="20" />
                <span class="footer__pill-text text-style-utility-default-regular">{{ currentMarketName }}</span>
                <MaterialIcon name="language" variant="round" :size="20" />
              </button>

              <!-- Language field — only for regions offering more than one language -->
              <button
                v-if="availableLanguages.length > 1"
                v-ripple
                v-haptic
                type="button"
                class="footer__pill"
                :aria-label="`Language: ${currentLanguage.endonym}`"
                @click="openLanguageSelector()"
              >
                <MaterialIcon name="translate" variant="round" :size="20" />
                <span class="footer__pill-text text-style-utility-default-regular">{{ currentLanguage.endonym }}</span>
              </button>
            </div>

            <div class="footer__action">
              <p class="footer__label text-style-utility-action-bold">{{ strings.footer.cookieLabel }}</p>
              <div class="footer__pill">
                <span class="footer__pill-text text-style-utility-default-regular">{{ strings.footer.cookieCta }}</span>
              </div>
            </div>

            <div class="footer__action">
              <p class="footer__label text-style-utility-action-bold">{{ strings.footer.socialHeading }}</p>
              <div class="footer__social-links">
                <a
                  v-for="network in SOCIAL_NETWORKS"
                  v-show="config.footer.social?.[network]"
                  :key="network"
                  v-ripple
                  :href="config.footer.social?.[network]"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer__social-link"
                  :aria-label="network"
                >
                  <img :src="assets.social?.[network]" alt="" />
                </a>
              </div>
            </div>
          </div>
        </Span>
      </Grid>
    </div>

    <div class="footer__tm" :class="{ 'footer__tm--nav-clearance': !config.catalog.hideNav && !historyOpen }">
      <Grid>
        <Span size="fluid">
          <div class="footer__tm-inner">
            <div class="footer__tm-publisher">
              <img :src="assets.brand.wordmark" :alt="strings.signIn.logoAlt" class="footer__tm-logo" />
              <p v-if="strings.footer.disclaimer" class="footer__tm-disclaimer text-style-utility-micro-bold">
                {{ strings.footer.disclaimer }}
              </p>
            </div>

            <div class="footer__tm-legal">
              <p v-if="config.checkout.showPoweredByCoda" class="footer__tm-powered">
                <span class="text-style-utility-micro-bold">{{ common.checkout.poweredBy }}</span>
                <img :src="assets.brand.coda" alt="Coda" class="footer__tm-coda" />
              </p>
              <p class="footer__tm-copyright text-style-utility-micro-bold">
                © {{ new Date().getFullYear() }} {{ common.footer.copyrightSuffix }}
              </p>
              <div v-if="strings.footer.legalLinks.length" class="footer__tm-links">
                <template v-for="(link, i) in strings.footer.legalLinks" :key="link.url">
                  <span v-if="i > 0" class="footer__tm-dot" aria-hidden="true"></span>
                  <a :href="link.url" target="_blank" rel="noopener noreferrer" class="footer__tm-link text-style-utility-micro-bold">
                    {{ link.label }}
                  </a>
                </template>
              </div>
            </div>
          </div>
        </Span>
      </Grid>
    </div>
  </footer>
</template>

<style scoped>
.footer__actions {
  background: var(--x-bg-navbar);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xl);
}
.footer__actions-row {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
}
@container (min-width: 801px) {
  .footer__actions-row {
    flex-direction: row;
    align-items: flex-start;
  }
}

.footer__action {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  flex: 1 0 0;
  min-width: 0;
}
.footer__label {
  color: var(--x-text-header-default);
}

.footer__pill {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
  height: var(--x-size-input-m);
  padding: var(--x-pad-surface-s);
  background: var(--x-bg-input-inverse);
  border: var(--border-weight-default) solid var(--x-border-input-inverse);
  border-radius: var(--x-radius-input-m);
  color: var(--x-text-body-default);
  cursor: pointer;
  text-decoration: none;
}
.footer__pill-text {
  flex: 1 0 0;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer__social-links {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.footer__social-link {
  display: inline-flex;
  width: var(--x-size-icon-l);
  height: var(--x-size-icon-l);
}
.footer__social-link img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.footer__tm {
  background: var(--x-bg-nav);
  padding-top: var(--x-pad-surface-m);
  padding-bottom: var(--x-pad-surface-xl);
}
/* Footer is the last thing on the page, but CategoryNav is `position: fixed`
   to the viewport bottom — extend past its footprint (while it's mounted) so
   the TM content (logo/disclaimer/legal links) is never scrolled-to-rest
   behind it. Matches the clearance App.vue's `.app__nav-gap` reserves for the
   same bar. */
.footer__tm--nav-clearance {
  padding-bottom: calc(var(--x-pad-surface-xl) + 64px);
}
.footer__tm-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  text-align: center;
}

.footer__tm-publisher {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.footer__tm-logo {
  height: 20px;
  object-fit: contain;
}
.footer__tm-disclaimer {
  color: var(--x-text-body-soft);
  white-space: pre-line;
}

.footer__tm-legal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.footer__tm-powered {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  color: var(--x-text-header-default);
}
.footer__tm-coda {
  height: 12px;
  object-fit: contain;
}
.footer__tm-copyright {
  color: var(--x-text-body-soft);
}
.footer__tm-links {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.footer__tm-link {
  color: var(--x-text-body-soft);
  text-decoration: none;
}
.footer__tm-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-text-body-soft);
}
</style>
