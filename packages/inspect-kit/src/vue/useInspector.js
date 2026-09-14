import { ref, readonly } from 'vue'

/**
 * useInspector — open/close + selection state for the inspector (singleton).
 *
 * Module-level refs make this a singleton shared between a host's toolbar, a
 * command palette, InspectorOverlay, and InspectorPanel without prop-drilling.
 *
 *   active        — inspection mode on/off
 *   selected      — currently picked DOM element (null = nothing selected)
 *   showBoxModel  — whether the box-model overlay (margin/padding strips) is visible
 *   activeState   — CSS state being simulated: 'default' | 'hover' | 'pressed' | 'disabled'
 *   styleVersion  — monotonic counter bumped after a state change so panels re-collect styles
 */
const active      = ref(false)
const selected    = ref(null)
const showBoxModel = ref(false)
const activeState  = ref('default')
const styleVersion = ref(0)

function open   () { active.value = true }
function close  () { active.value = false; selected.value = null; activeState.value = 'default' }
function toggle () { active.value ? close() : open() }
function select (el) { selected.value = el || null; activeState.value = 'default' }
function toggleBoxModel () { showBoxModel.value = !showBoxModel.value }
function setState (s) { activeState.value = s }
function bumpStyleVersion () { styleVersion.value++ }

export function useInspector () {
  return {
    active:        readonly(active),
    selected:      readonly(selected),
    showBoxModel:  readonly(showBoxModel),
    activeState:   readonly(activeState),
    styleVersion:  readonly(styleVersion),
    open, close, toggle, select, toggleBoxModel, setState, bumpStyleVersion,
  }
}
