import { ref, computed, watch, onMounted, onBeforeUnmount, unref } from 'vue'

/**
 * useCountdown — a live "Nd HHh MMm" countdown to an epoch-ms target, plus an
 * urgency band (default / warning / error). Extracted from BundleSkuCard so the
 * Item Summary sheet renders the same timer. Pass a number or a ref.
 *
 * Returns { countdown, urgency } — both null/'default' when `endsAt` is null.
 */
export function useCountdown(endsAt) {
  const now = ref(Date.now())
  let timer = null

  // Start/stop the per-second tick reactively: callers (e.g. ItemSummarySheet)
  // may mount with a null target and only get one later, so we can't rely on a
  // one-shot onMounted check.
  // Guard against Vue SSR (renderToString): the `watch(..., { immediate: true })`
  // below fires during setup() on both client and server — unlike onMounted,
  // which SSR never calls — so without this check a truthy `endsAt` would start
  // a real setInterval on the server that outlives the render, keeping the
  // Node process alive forever (surfaced by the design harness's render gate
  // hanging on any story with a live countdown).
  function start() { if (!timer && !import.meta.env.SSR) timer = setInterval(() => { now.value = Date.now() }, 1000) }
  function stop() { if (timer) { clearInterval(timer); timer = null } }

  watch(
    () => unref(endsAt),
    (target) => {
      if (target != null) { now.value = Date.now(); start() }
      else stop()
    },
    { immediate: true },
  )
  onMounted(() => { if (unref(endsAt) != null) start() })
  onBeforeUnmount(stop)

  const countdown = computed(() => {
    const target = unref(endsAt)
    if (target == null) return null
    const ms = Math.max(0, target - now.value)
    const totalMin = Math.floor(ms / 60000)
    const days = Math.floor(totalMin / 1440)
    const hours = Math.floor((totalMin % 1440) / 60)
    const mins = totalMin % 60
    const pad = (n) => String(n).padStart(2, '0')
    return days > 0 ? `${days}d ${pad(hours)}h ${pad(mins)}m` : `${pad(hours)}h ${pad(mins)}m`
  })

  const urgency = computed(() => {
    const target = unref(endsAt)
    if (target == null) return 'default'
    const hoursLeft = (target - now.value) / 3600000
    if (hoursLeft >= 72) return 'default'
    if (hoursLeft >= 24) return 'warning'
    return 'error'
  })

  return { countdown, urgency }
}
