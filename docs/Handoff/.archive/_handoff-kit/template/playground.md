# Playground

TODO: one-line intro — what's mounted live and what can be edited.

<!-- TODO: wrap the live demo in TokenSandbox (kit) inside a feature component, e.g.:

<MyFeaturePlayground />

  where MyFeaturePlayground.vue composes:
    <TokenSandbox title="Live demo">
      <template #default="{ values }"> ...the demo stage... </template>
      <template #controls> ...feature toggles... </template>
      <template #hint> ...interaction notes... </template>
    </TokenSandbox>
-->

## Choreography timeline

TODO: describe the beats.

<!-- TODO: wrap BeatTimeline (kit) in a feature component passing beats/range,
     rendering the stage in the default slot from { ms, progress }. -->

## Easing curves

TODO: list the easing tokens this feature consumes.

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-ease-standard" />
  <!-- TODO: one <EasingCurve token="..." /> per easing the feature uses -->
</div>
