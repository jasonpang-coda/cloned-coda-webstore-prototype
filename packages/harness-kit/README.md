# @coda/harness-kit

Reusable design harness primitives for multi-store web store prototypes:
- **`StoryStage`**: Isolated component stage with container query trapping and store theme injection.
- **`BeatTimeline`**: RAF-driven choreography player & scrubber with beat markers and speed controls.
- **`TokenSandbox`**: Live token and easing curve retuning playground.
- **`TokenChip`**: A copyable "name: value" pill for displaying a resolved token.
- **`EasingCurve`**: Plots a cubic-bezier token as an SVG curve with a playable dot.
- **`FlowDiagram`** / **`StateDiagram`**: Live-rendered Mermaid flowchart / state-machine diagrams with click-to-select and active-node highlighting.

This is the single lineage for these components — the in-app `/handoff` app
(`src/handoff/`) and every per-feature VitePress handoff site
(`docs/Handoff/<slug>/.vitepress/`) both import from here rather than
vendoring their own copies. Fix a bug once, here.

## Usage

```js
import {
  StoryStage, BeatTimeline, TokenSandbox, TokenChip, EasingCurve, FlowDiagram, StateDiagram,
} from '@coda/harness-kit/vue'
```
