import { ref, readonly } from 'vue'

/**
 * useCommandConsole — open/close state for the `/` command palette (singleton).
 *
 * Module-level ref (declared once, outside the factory) makes this a singleton
 * exactly like useAuth: the global `/` keydown listener in App.vue and the
 * CommandConsole overlay share the SAME reactive state without prop-drilling
 * through DeviceFrame's overlay slot.
 *
 * The palette is dev chrome — a keyboard shortcut to switch store / device /
 * auth / section without reaching for the toolbar dropdown. It drives the same
 * reactive composables every switcher already uses, so it adds no new state.
 */
const open = ref(false)

function openConsole ()  { open.value = true }
function closeConsole () { open.value = false }
function toggleConsole () { open.value = !open.value }

export function useCommandConsole () {
  return { open: readonly(open), openConsole, closeConsole, toggleConsole }
}
