---
handoff: media
title: Media
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Media.stories.js
variants: 2
states: 1
---

# Media

> Renders a still image or a video from a single `src`, picking the element by file extension (.mp4/.webm/.mov → <video>, everything else → <img>, so animated webp/gif/apng just work via the img branch). Used by BundleSkuCard, GiftSkuCard and ItemSummaryAccordion so bundle/gift art can be a still image or a looping video without the consumer branching on file type. The consumer's class/style land on whichever element is actually rendered (inheritAttrs).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story media`.

## Usage Rules
- src is required.
- alt only applies to the image branch (videos are decorative/muted, no alt).
- poster is optional and only used for the video branch (shown before the video paints).
- Video playback is autoplay, loop, muted, playsinline, no picture-in-picture — always ambient background motion, never a media player with controls.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Image | 0 |
| Video | 1 |
