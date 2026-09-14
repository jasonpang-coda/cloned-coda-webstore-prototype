# File map — PWA Install + Web Push

Every component below already exists in this repo. This is a modify-existing task.

| Prototype component | Edit this file | Styles | i18n prefix |
|---|---|---|---|
| `ToggleSwitch` | `components/ui/Toggle.vue` | `assets/css/sitebuilder/components/ui/Toggle.scss` | _n/a_ |
| `IosInstallSheet` | `components/pwa/InstallPrompt.client.vue` | `assets/css/sitebuilder/components/pwa/InstallPrompt.scss` | `pwaInstall.*` |
| `WebPushSurfaces` | `components/shared/modals/WebPushConsent.vue` | `assets/css/sitebuilder/components/shared/modals/WebPushConsent.scss` | `webPushConsent.*` |

A path listed above that no longer exists in this repo is a signal the file moved,
not that the feature is new — search for it before assuming a new component is needed.
