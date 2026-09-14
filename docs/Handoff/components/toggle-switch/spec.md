---
handoff: toggle-switch
title: Toggle Switch
group: Controls
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ToggleSwitch.stories.js
variants: 4
states: 6
---

# Toggle Switch

> A binary control-only toggle (no visible label of its own) — a bare `<button role="switch">` matching Figma node 6424:11355. The OFF track/border reuses the ghost surface ramp; ON reuses the shared "active control" brand-fill tokens (--x-bg-control-active / --x-border-control-active), the same pair every other active control in this DS uses. Clicking always flips modelValue via update:modelValue immediately — press feedback is not gated on any async permission request resolving, so a denied/blocked click still feels responsive.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story toggle-switch`.

## Usage Rules
- ariaLabel is required — the control has no visible text label, so every usage must supply one for accessibility.
- v-model only: the component holds no internal state, modelValue/update:modelValue drive it entirely.
- disabled suppresses both the click handler (no emit) and the press-scale feedback, and dims the control to 50% opacity.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`, `checked`, `unchecked`, `disabled`

| Variant Name | Index |
|---|---|
| Off | 0 |
| On | 1 |
| Disabled (off) | 2 |
| Disabled (on) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-size-control-xs` | `24px` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-surface-ghost-4` | `oklch(1 0 0 / 0.12)` |
| `--x-surface-ghost-2` | `oklch(1 0 0 / 0.08)` |
| `--x-motion-toggle` | `200ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-control-press-scale` | `0.98` |
| `--x-size-icon-m` | `20px` |
| `--x-shadow-story-card` | `0 2px 5px oklch(0.12 0.01 273 / 0.31), 0 8px 8px oklch(0.12 0.01 273 / 0.27), 0 19px 11px oklch(0.12 0.01 273 / 0.16)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-bg-control-active` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-control-active` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-action-neutral` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
