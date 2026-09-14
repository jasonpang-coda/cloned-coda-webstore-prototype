/**
 * Shared provide/inject key for the Grid/Span "bare" mode used by the
 * two-column split layout (config.page.layout === 'split' — see App.vue,
 * Grid.vue, Span.vue). App.vue provides `true` inside its split columns so
 * nested Grid/Span instances (including the ones CategoryCatalog owns
 * internally) collapse to a single unstyled flow instead of laying out a
 * second nested 12-col grid inside an already-gridded column.
 */
export const GRID_BARE_KEY = Symbol('grid-bare')
