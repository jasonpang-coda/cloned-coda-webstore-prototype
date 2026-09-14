/**
 * Virtual cursor management and DOM event synthesis.
 */

/**
 * Creates a standard synthetic mouse/pointer event.
 * @param {string} type
 * @param {number} clientX
 * @param {number} clientY
 * @returns {MouseEvent}
 */
export function createMouseEvent (type, clientX, clientY) {
  return new MouseEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  })
}

/**
 * Simulates a realistic click sequence on a DOM element.
 * @param {Element} element
 * @param {number} [clientX]
 * @param {number} [clientY]
 */
export function simulateClick (element, clientX, clientY) {
  if (!element) return

  const rect = element.getBoundingClientRect()
  const x = clientX ?? (rect.left + rect.width / 2)
  const y = clientY ?? (rect.top + rect.height / 2)

  element.dispatchEvent(createMouseEvent('pointerover', x, y))
  element.dispatchEvent(createMouseEvent('pointerenter', x, y))
  element.dispatchEvent(createMouseEvent('mouseover', x, y))
  element.dispatchEvent(createMouseEvent('pointerdown', x, y))
  element.dispatchEvent(createMouseEvent('mousedown', x, y))

  if (typeof element.focus === 'function') {
    try { element.focus() } catch {}
  }

  element.dispatchEvent(createMouseEvent('pointerup', x, y))
  element.dispatchEvent(createMouseEvent('mouseup', x, y))
  // A synthetic 'click' MouseEvent already triggers a real button/link's
  // click handler (it bubbles like a native click) — calling element.click()
  // as well would fire that handler a second time.
  element.dispatchEvent(createMouseEvent('click', x, y))
}

/**
 * Simulates typing text into an input or textarea element with key events.
 * @param {HTMLInputElement|HTMLTextAreaElement} element
 * @param {string} text
 * @param {number} [charDelayMs=50]
 * @returns {Promise<void>}
 */
export async function simulateTyping (element, text, charDelayMs = 50) {
  if (!element) return
  if (typeof element.focus === 'function') element.focus()

  element.value = ''
  element.dispatchEvent(new Event('input', { bubbles: true }))

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    element.value += char
    element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }))
    element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }))
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }))
    await new Promise(r => setTimeout(r, charDelayMs))
  }

  element.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Standard cubic ease-out calculation.
 * @param {number} t (0 to 1)
 * @returns {number}
 */
export function easeOutCubic (t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates coordinates from start to target smoothly using requestAnimationFrame.
 * @param {{ x: number, y: number }} from
 * @param {{ x: number, y: number }} to
 * @param {number} durationMs
 * @param {Function} onUpdate - callback receiving ({ x, y })
 * @returns {Promise<void>}
 */
export function animateCursor (from, to, durationMs = 600, onUpdate) {
  return new Promise((resolve) => {
    const startTime = performance.now()
    const dx = to.x - from.x
    const dy = to.y - from.y

    function frame (now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = easeOutCubic(progress)

      const currentX = from.x + dx * eased
      const currentY = from.y + dy * eased

      if (typeof onUpdate === 'function') {
        onUpdate({ x: currentX, y: currentY })
      }

      if (progress < 1) {
        requestAnimationFrame(frame)
      } else {
        if (typeof onUpdate === 'function') {
          onUpdate({ x: to.x, y: to.y })
        }
        resolve()
      }
    }

    requestAnimationFrame(frame)
  })
}
