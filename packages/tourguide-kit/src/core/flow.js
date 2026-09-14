/**
 * @typedef {Object} TourAction
 * @property {'click'|'input'|'scroll'|'wait'|'call'} [type='click'] Action type to perform
 * @property {string|Function} [target] Selector or resolver function for element to act on
 * @property {string} [value] Text value for 'input' action
 * @property {number} [scrollOffset=0] Scroll offset in px
 * @property {Function} [handler] Custom handler function for 'call' action
 * @property {number} [delayBeforeActionMs=400] Delay before firing action after cursor arrives
 * @property {number} [delayAfterActionMs=600] Delay after firing action before advancing
 * @property {boolean} [smoothScroll=true]
 *
 * @typedef {Object} TourStep
 * @property {string} id Unique step id
 * @property {string} title Step title shown in onboarding guide
 * @property {string} [explanation] Educational prose explaining this step & POI
 * @property {string|Function} [poiSelector] CSS selector, [data-poi="..."], or function returning Element
 * @property {'top'|'bottom'|'left'|'right'|'auto'} [poiPlacement='auto'] Guide tooltip placement
 * @property {number} [holdMs=2800] Duration (ms) the onboarding card stays visible at 1x speed
 * @property {TourAction|Function} [action] Action to execute (or function callback)
 * @property {Function} [beforeStep] Hook executed before step starts
 * @property {Function} [afterStep] Hook executed after step completes
 *
 * @typedef {Object} TourDefinition
 * @property {string} id Unique slug identifier
 * @property {string} title Display name
 * @property {string} [category='General'] Flow category for grouping
 * @property {string} [description] Summary of user journey
 * @property {string} [defaultTheme] Target theme/store to switch to before playing
 * @property {string} [defaultDevice] Target device frame ('iphone'|'samsung'|'none')
 * @property {Function} [setup] Setup callback to prime state (reset auth, cart, sheets)
 * @property {Function} [teardown] Cleanup callback after flow ends
 * @property {TourStep[]} steps Ordered sequence of steps
 */

/**
 * Validates and normalizes a tour definition.
 * @param {TourDefinition} flow
 * @returns {TourDefinition}
 */
export function defineTour (flow) {
  if (!flow || typeof flow !== 'object') {
    throw new Error('[tourguide-kit] defineTour: flow config must be an object')
  }
  if (!flow.id) {
    throw new Error('[tourguide-kit] defineTour: flow is missing required "id"')
  }
  if (!flow.title) {
    throw new Error(`[tourguide-kit] defineTour (${flow.id}): flow is missing required "title"`)
  }
  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    console.warn(`[tourguide-kit] defineTour (${flow.id}): flow has no steps`)
  }

  const normalizedSteps = (flow.steps || []).map((step, idx) => {
    const id = step.id || `step-${idx + 1}`
    const title = step.title || `Step ${idx + 1}`
    const poiPlacement = step.poiPlacement || 'auto'
    const holdMs = typeof step.holdMs === 'number' ? step.holdMs : 2800

    let action = step.action
    if (typeof action === 'function') {
      action = { type: 'call', handler: action }
    } else if (action && typeof action === 'object') {
      action = {
        type: action.type || 'click',
        target: action.target || step.poiSelector,
        value: action.value || '',
        delayBeforeActionMs: action.delayBeforeActionMs ?? 400,
        delayAfterActionMs: action.delayAfterActionMs ?? 600,
        smoothScroll: action.smoothScroll !== false,
        ...action,
      }
    } else if (step.poiSelector) {
      // Default action is to click the POI element
      action = {
        type: 'click',
        target: step.poiSelector,
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
        smoothScroll: true,
      }
    }

    return {
      id,
      title,
      explanation: step.explanation || '',
      poiSelector: step.poiSelector || null,
      poiPlacement,
      holdMs,
      action,
      beforeStep: step.beforeStep || null,
      afterStep: step.afterStep || null,
    }
  })

  return {
    id: flow.id,
    title: flow.title,
    category: flow.category || 'General',
    description: flow.description || '',
    defaultTheme: flow.defaultTheme || null,
    defaultDevice: flow.defaultDevice || null,
    setup: flow.setup || null,
    teardown: flow.teardown || null,
    steps: normalizedSteps,
  }
}
