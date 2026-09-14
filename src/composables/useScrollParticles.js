import { onMounted, onBeforeUnmount } from 'vue'

/**
 * useScrollParticles — ambient canvas particle field for the Codashop visual
 * homepage (HomeParticles.vue). Particles drift gently on their own; the
 * active scroll VELOCITY of `scrollElRef` (the device screen's own scroll
 * container, not window — this app scrolls inside .device__screen) biases
 * their drift speed and adds a parallax-style vertical offset, so the field
 * visibly "reacts" as the user scrolls: fast scroll streaks the motes taller
 * and faster, idle scroll settles back to a slow float.
 *
 * Deliberately NOT a general-purpose particle library — scoped to exactly
 * what this hero background needs. Canvas only (motion tokens govern real UI
 * elements; this is a decorative background layer with its own tunables).
 *
 * Rules followed (see the motion-design skill):
 *  - rAF-driven, paused via IntersectionObserver when the canvas scrolls out
 *    of view and via the Page Visibility API when the tab is hidden.
 *  - Hard-gated on prefers-reduced-motion — draws ONE static frame and never
 *    starts the loop when reduce is set (checked at start AND on live change).
 *  - Device-pixel-ratio aware so it isn't blurry on high-DPI screens.
 *  - Particle count scales down on narrow canvases (mobile-first budget).
 *
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef
 * @param {import('vue').Ref<HTMLElement|null>} scrollElRef  the scrolling ancestor to read velocity from
 * @param {{ colors?: string[] }} [opts]  particle fill colours (CSS color strings — pass resolved tokens, not literals, from the component)
 */
export function useScrollParticles (canvasRef, scrollElRef, opts = {}) {
  let raf = 0
  let ro = null
  let io = null
  let mq = null
  let particles = []
  let w = 0, h = 0, dpr = 1
  let lastScrollTop = 0
  let scrollVelocity = 0 // px/frame, EMA-smoothed
  let running = false
  let inView = true
  let visible = true

  const prefersReduced = () =>
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  function colorAt (i) {
    const colors = opts.colors?.length ? opts.colors : ['rgba(255,255,255,0.5)']
    return colors[i % colors.length]
  }

  function seed () {
    const canvas = canvasRef.value
    if (!canvas) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))

    // Density scales with area, capped for the mobile-first budget.
    const count = Math.min(60, Math.max(18, Math.round((w * h) / 9000)))
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.4,
      baseSpeed: 0.06 + Math.random() * 0.16,
      drift: (Math.random() - 0.5) * 0.12,
      phase: Math.random() * Math.PI * 2,
      color: colorAt(i),
      alpha: 0.25 + Math.random() * 0.45,
    }))
  }

  function drawFrame () {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Scroll velocity biases both fall speed (energy) and a slight vertical
    // parallax streak — capped so a fling doesn't send particles flying off
    // in one frame.
    const speedBoost = Math.min(Math.abs(scrollVelocity) * 0.4, 3)
    const streak = Math.min(Math.abs(scrollVelocity) * 0.25, 6)

    for (const p of particles) {
      p.phase += 0.015
      p.x += Math.sin(p.phase) * p.drift
      p.y -= (p.baseSpeed + speedBoost)
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
      if (p.x < -10) p.x = w + 10
      if (p.x > w + 10) p.x = -10

      // Tiny diamond (rhombus) mote — four points around the centre, drawn
      // taller under fast scroll instead of just a dot, so it reads as a
      // stretched shard of light rather than a circle "streaking".
      const rx = p.r
      const ry = p.r + streak
      ctx.beginPath()
      ctx.moveTo(p.x, p.y - ry)
      ctx.lineTo(p.x + rx, p.y)
      ctx.lineTo(p.x, p.y + ry)
      ctx.lineTo(p.x - rx, p.y)
      ctx.closePath()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function onScroll () {
    const el = scrollElRef.value
    if (!el) return
    const top = el.scrollTop
    scrollVelocity += ((top - lastScrollTop) - scrollVelocity) * 0.3 // EMA
    lastScrollTop = top
  }

  function loop () {
    if (!running) return
    scrollVelocity *= 0.92 // decay toward idle when scrolling stops
    drawFrame()
    raf = requestAnimationFrame(loop)
  }

  function shouldRun () {
    return inView && visible && !prefersReduced()
  }

  function start () {
    if (running || !shouldRun()) return
    running = true
    raf = requestAnimationFrame(loop)
  }

  function stop () {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  function onReduceChange (e) {
    if (e.matches) { stop(); drawFrame() /* one static frame, then idle */ }
    else start()
  }

  function onVisibilityChange () {
    visible = document.visibilityState !== 'hidden'
    if (shouldRun()) start(); else stop()
  }

  onMounted(() => {
    seed()
    drawFrame() // always paint one frame, even under reduced motion

    if (typeof matchMedia !== 'undefined') {
      mq = matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener?.('change', onReduceChange)
    }

    if (typeof ResizeObserver !== 'undefined' && canvasRef.value) {
      ro = new ResizeObserver(() => { seed(); drawFrame() })
      ro.observe(canvasRef.value)
    }

    if (typeof IntersectionObserver !== 'undefined' && canvasRef.value) {
      io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        if (shouldRun()) start(); else stop()
      }, { threshold: 0.01 })
      io.observe(canvasRef.value)
    } else {
      inView = true
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    scrollElRef.value?.addEventListener('scroll', onScroll, { passive: true })

    if (shouldRun()) start()
  })

  onBeforeUnmount(() => {
    stop()
    ro?.disconnect()
    io?.disconnect()
    mq?.removeEventListener?.('change', onReduceChange)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    scrollElRef.value?.removeEventListener('scroll', onScroll)
  })
}
