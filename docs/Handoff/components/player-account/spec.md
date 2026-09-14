---
handoff: player-account
title: Player Account
group: Navigation
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PlayerAccount.stories.js
variants: 2
states: 4
---

# Player Account

> "YOUR COD:M ACCOUNT" guest Player ID entry (Figma 5147:22653). A text input triggers a simulated lookup on blur/Enter: a donut spinner shows for ~1.1s, then a PlayerCard fades in reflecting the typed value. Reaching the "found" state calls useCheckout().setGuestVerified(true), which unlocks guest checkout — this component is one of the (potentially several) places that can flip that shared flag, and it mirrors updates made elsewhere (e.g. the same component reused inside ClaimGiftSheet) via a watcher, so both instances always agree on the verified account. The disclosure panel's chips + instruction copy come from strings.account.chips and are hidden entirely once an account is found, or if a store sets config.profile.showAccountInstructions to false.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story player-account`.

## Usage Rules
- Editing the Player ID after a successful lookup calls onEdit(), which resets status to "idle" AND calls setGuestVerified(false) — never leave a stale verified flag while the field no longer matches it.
- Do not reset guestVerified on unmount — the verified state must survive the component unmounting (e.g. a sheet closing and reopening); only a deliberate edit clears it.
- The instructions disclosure is fully hidden once status is "found", and gated on config.profile.showAccountInstructions for stores that don't want it at all.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `focus`, `pressed`

| Variant Name | Index |
|---|---|
| Idle | 0 |
| Found (verified account) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft-2` | `oklch(0.992 0.003 286 / 0.12)` |
| `--x-surface-ghost` | `oklch(1 0 0 / 0.06)` |
| `--x-motion-spinner` | `700ms` |
| `--x-motion-sys-ease-linear` | `linear` |
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-l` | `16px` |
| `--x-motion-tab-indicator` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-m` | `12px` |
| `--x-motion-sys-duration-exit` | `200ms` |
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-distance-sm` | `4px` |
| `--x-motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-border-input-focused` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-rarity-gradient-neutral` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient(to bottom, oklch(0 0 0 / 0.42) 25.481%, oklch(0 0 0 / 0.88))` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` |
| `--x-text-hyperlink-hover` | `oklch(0.931 0.132 116)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.640 0.190 264)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-hyperlink-pressed` | `oklch(0.952 0.083 116)` | `oklch(0.945 0.129 101.4)` | `oklch(0.855 0.068 75.1)` | `oklch(0.983 0.095 108.0)` | `oklch(0.874 0.162 156)` | `oklch(0.7 0.155 142.5)` | `oklch(0.82 0.13 142.5)` | `oklch(0.807 0.111 133.1)` | `oklch(0.840 0.150 52)` | `oklch(0.740 0.150 263)` | `oklch(0.920 0.075 88.3)` | `oklch(0.955 0.139 128.9)` |
