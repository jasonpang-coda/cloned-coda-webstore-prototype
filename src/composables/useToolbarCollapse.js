import { ref, readonly } from 'vue'

/**
 * useToolbarCollapse — collapse/expand state for DeviceToolbar (singleton).
 *
 * Module-level ref makes this a singleton shared between the toolbar itself
 * and the `/` command-console entry, mirroring useInspector/useLibrary.
 *
 * Starts collapsed (notch-only) on every device — the toolbar is a fixed
 * side drawer now, not in-flow page chrome, so there's no layout cost to
 * defaulting closed regardless of pointer type.
 */
const collapsed = ref(true)

function collapse () { collapsed.value = true }
function expand   () { collapsed.value = false }
function toggle   () { collapsed.value = !collapsed.value }
function set (v)  { collapsed.value = !!v }

export function useToolbarCollapse () {
  return { collapsed: readonly(collapsed), collapse, expand, toggle, set }
}
