# Playground

Full interactive sandbox — the **real** `StoryCarousel` mounted live. Edit its tokens and props and watch every surface respond instantly.

<CarouselPlayground />

## Slide-cycle timeline

Scrub or play one slide cycle: the active segment fills linearly over `--motion-sku-story`, then on completion the slide advances and crossfades into the next over `--motion-sku-story-fade`. Speed control lets you review the beats without waiting in real time.

<SlideCycleTimeline />

## Easing curves

The two easings the carousel uses — `--motion-ease-decelerate` for the root entrance, `--motion-ease-standard` for the slide crossfade and CTA hover.

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-ease-decelerate" />
  <EasingCurve token="--motion-ease-standard" />
</div>
