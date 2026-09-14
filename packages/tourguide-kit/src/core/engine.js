import { resolveElement, waitForElement, getElementRect, scrollElementIntoView } from './poi.js'
import { animateCursor, simulateClick, simulateTyping } from './cursor.js'
import { WebmRecorder } from './recorder.js'

/**
 * Headless execution engine for automated flows with POI spotlighting and virtual cursor.
 */
export class TourGuideEngine {
  constructor () {
    this.flows = new Map()
    this.activeFlow = null
    this.currentStepIndex = 0
    this.state = 'idle' // 'idle' | 'preparing' | 'playing' | 'paused' | 'finished'
    this.speed = 1 // 1 | 1.5 | 2
    this.record = false
    // When true (default), the engine advances to the next step on its own
    // once a step's hold + action complete. When false, it still runs each
    // step's full spotlight/cursor/action sequence but then stops and waits
    // for a manual next()/prev() call (the guide card's Back/Next buttons).
    this.autoplay = true
    // Mic-into-recording narration. Only meaningful (and only ever set true)
    // when manual mode is on and recording is on — see start().
    this.voiceOver = false
    this.recorder = new WebmRecorder()

    this.cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2, visible: false, clicking: false }
    this.activePoi = null // { el, rect }
    this.stepProgress = 0 // 0 to 100%

    this._abortController = null
    this._listeners = new Set()
    this._stepTimer = null
    this._progressInterval = null
    this._resizeObserver = null
    this._scrollListener = null
    // Incremented every time _executeCurrentStep() starts a new run. next()/
    // prev()/seek() can call _executeCurrentStep() while a prior invocation is
    // still awaiting (mid-animation, mid-hold) — comparing against this token
    // lets a superseded run detect it's stale and bail out instead of racing
    // the new one (double-advance / overlapping cursor animations).
    this._stepToken = 0
  }

  registerFlow (flow) {
    if (flow && flow.id) {
      this.flows.set(flow.id, flow)
    }
  }

  registerFlows (flowList) {
    if (Array.isArray(flowList)) {
      for (const flow of flowList) this.registerFlow(flow)
    }
  }

  getFlow (id) {
    return this.flows.get(id) || null
  }

  listFlows () {
    return Array.from(this.flows.values())
  }

  subscribe (listener) {
    this._listeners.add(listener)
    this._emit()
    return () => this._listeners.delete(listener)
  }

  _emit () {
    const snapshot = {
      state: this.state,
      activeFlow: this.activeFlow,
      currentStepIndex: this.currentStepIndex,
      currentStep: this.getCurrentStep(),
      totalSteps: this.activeFlow?.steps?.length ?? 0,
      speed: this.speed,
      record: this.record,
      autoplay: this.autoplay,
      voiceOver: this.voiceOver,
      cursor: { ...this.cursor },
      activePoi: this.activePoi ? { ...this.activePoi } : null,
      stepProgress: this.stepProgress,
      isRecording: this.recorder.isRecording,
      recordingTime: this.recorder.getFormattedDuration(),
    }
    for (const fn of this._listeners) {
      try { fn(snapshot) } catch (err) { console.error('[tourguide-kit] listener error:', err) }
    }
  }

  getCurrentStep () {
    if (!this.activeFlow || !this.activeFlow.steps) return null
    return this.activeFlow.steps[this.currentStepIndex] || null
  }

  setSpeed (speed) {
    this.speed = Math.max(0.5, Math.min(3, speed))
    this._emit()
  }

  async start (flowOrId, options = {}) {
    this.stop()

    const flow = typeof flowOrId === 'string' ? this.getFlow(flowOrId) : flowOrId
    if (!flow) {
      console.warn(`[tourguide-kit] Cannot start flow: ${flowOrId} not found`)
      return
    }

    this.activeFlow = flow
    this.currentStepIndex = 0
    this.state = 'preparing'
    this.speed = options.speed || this.speed || 1
    this.record = !!options.record
    this.autoplay = options.autoplay !== false
    // Voice-over requires manual mode (time to narrate) and recording
    // (somewhere for the mic audio to land) — enforce here, not just in the UI.
    this.voiceOver = !!options.voiceOver && this.record && !this.autoplay
    this._abortController = new AbortController()

    this._setupPoiTracking()
    this._emit()

    // 1. Optional setup hook
    if (typeof flow.setup === 'function') {
      try {
        await flow.setup(options)
        await new Promise(r => setTimeout(r, 200)) // settle
      } catch (err) {
        console.error('[tourguide-kit] flow setup error:', err)
      }
    }

    // 2. Start screen recording if enabled
    if (this.record) {
      try {
        await this.recorder.start({
          filename: `${flow.id}-${Date.now()}.webm`,
          captureMic: this.voiceOver,
          onStateChange: () => this._emit(),
        })
      } catch (err) {
        console.warn('[tourguide-kit] Recording could not be started:', err)
      }
    }

    this.state = 'playing'
    this.cursor.visible = true
    this._emit()

    // 3. Begin step loop
    this._executeCurrentStep()
  }

  async _executeCurrentStep () {
    if (this.state !== 'playing') return
    const step = this.getCurrentStep()
    if (!step) {
      this.finish()
      return
    }

    const signal = this._abortController?.signal
    if (signal?.aborted) return

    // Claim this run's token. If next()/prev()/seek() calls
    // _executeCurrentStep() again before this run finishes, that call bumps
    // the token and every check below (isStale) sees it no longer matches —
    // this stale run bails out instead of racing the newer one.
    const myToken = ++this._stepToken
    const isStale = () => this._stepToken !== myToken

    this.stepProgress = 0
    this._emit()

    // Step A: beforeStep hook
    if (typeof step.beforeStep === 'function') {
      try { await step.beforeStep() } catch (e) { console.warn(e) }
    }
    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Step B: Locate POI Element
    let targetEl = null
    if (step.poiSelector) {
      targetEl = await waitForElement(step.poiSelector, 3000 / this.speed)
    }
    if (signal?.aborted || isStale() || this.state !== 'playing') return

    if (targetEl) {
      scrollElementIntoView(targetEl, true, 'center')
      await new Promise(r => setTimeout(r, 300 / this.speed))
      if (signal?.aborted || isStale() || this.state !== 'playing') return
      this._updatePoiRect(targetEl)
    } else {
      this.activePoi = null
      this._emit()
    }

    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Step C: Animate Virtual Cursor to POI
    const destX = this.activePoi ? this.activePoi.rect.cx : window.innerWidth / 2
    const destY = this.activePoi ? this.activePoi.rect.cy : window.innerHeight / 2

    await animateCursor(
      { x: this.cursor.x, y: this.cursor.y },
      { x: destX, y: destY },
      600 / this.speed,
      (pos) => {
        if (isStale()) return
        this.cursor.x = pos.x
        this.cursor.y = pos.y
        this._emit()
      }
    )

    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Step D: Hold duration for the Onboarding Guide card with smooth progress tracking
    const totalHoldMs = (step.holdMs || 2800) / this.speed
    const startHold = performance.now()

    await new Promise((resolve) => {
      this._progressInterval = setInterval(() => {
        if (isStale()) {
          clearInterval(this._progressInterval)
          this._progressInterval = null
          resolve()
          return
        }
        if (this.state !== 'playing') return
        const elapsed = performance.now() - startHold
        this.stepProgress = Math.min(100, Math.round((elapsed / totalHoldMs) * 100))
        this._emit()

        if (elapsed >= totalHoldMs) {
          clearInterval(this._progressInterval)
          this._progressInterval = null
          resolve()
        }
      }, 50)
    })

    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Step E: Trigger Action & Click Ripple
    const action = step.action
    if (action) {
      const actionDelay = (action.delayBeforeActionMs ?? 400) / this.speed
      await new Promise(r => setTimeout(r, actionDelay))
      if (signal?.aborted || isStale() || this.state !== 'playing') return

      let actionEl = targetEl
      if (action.target && action.target !== step.poiSelector) {
        actionEl = resolveElement(action.target)
      }

      // Cursor click pulse
      this.cursor.clicking = true
      this._emit()
      setTimeout(() => {
        if (isStale()) return
        this.cursor.clicking = false
        this._emit()
      }, 250)

      if (action.type === 'click' && actionEl) {
        simulateClick(actionEl, this.cursor.x, this.cursor.y)
      } else if (action.type === 'input' && actionEl) {
        await simulateTyping(actionEl, action.value || '', 40 / this.speed)
      } else if (action.type === 'call' && typeof action.handler === 'function') {
        await action.handler(actionEl)
      }

      const settleDelay = (action.delayAfterActionMs ?? 600) / this.speed
      await new Promise(r => setTimeout(r, settleDelay))
    }

    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Step F: afterStep hook
    if (typeof step.afterStep === 'function') {
      try { await step.afterStep() } catch (e) { console.warn(e) }
    }

    if (signal?.aborted || isStale() || this.state !== 'playing') return

    // Advance to next step — only when autoplay is on. With autoplay off,
    // the step's full spotlight/cursor/action sequence still just ran; the
    // engine now simply stops and waits here for a manual next()/prev()
    // call (the guide card's Back/Next buttons), which re-enter this method
    // directly regardless of this flag.
    if (!this.autoplay) return
    if (this.currentStepIndex < this.activeFlow.steps.length - 1) {
      this.currentStepIndex++
      this._executeCurrentStep()
    } else {
      this.finish()
    }
  }

  _updatePoiRect (el) {
    if (!el || !el.isConnected) {
      this.activePoi = null
    } else {
      this.activePoi = { el, rect: getElementRect(el) }
    }
    this._emit()
  }

  _setupPoiTracking () {
    this._scrollListener = () => {
      if (this.activePoi?.el) {
        this._updatePoiRect(this.activePoi.el)
      }
    }
    window.addEventListener('scroll', this._scrollListener, { capture: true, passive: true })
    window.addEventListener('resize', this._scrollListener, { passive: true })
  }

  _teardownPoiTracking () {
    if (this._scrollListener) {
      window.removeEventListener('scroll', this._scrollListener, { capture: true })
      window.removeEventListener('resize', this._scrollListener)
      this._scrollListener = null
    }
  }

  pause () {
    if (this.state === 'playing') {
      this.state = 'paused'
      if (this._progressInterval) {
        clearInterval(this._progressInterval)
        this._progressInterval = null
      }
      this._emit()
    }
  }

  resume () {
    if (this.state === 'paused') {
      this.state = 'playing'
      this._emit()
      this._executeCurrentStep()
    }
  }

  next () {
    if (!this.activeFlow) return
    if (this.currentStepIndex < this.activeFlow.steps.length - 1) {
      this.currentStepIndex++
      this.state = 'playing'
      this._executeCurrentStep()
    } else {
      this.finish()
    }
  }

  prev () {
    if (!this.activeFlow) return
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--
      this.state = 'playing'
      this._executeCurrentStep()
    }
  }

  seek (index) {
    if (!this.activeFlow) return
    if (index >= 0 && index < this.activeFlow.steps.length) {
      this.currentStepIndex = index
      this.state = 'playing'
      this._executeCurrentStep()
    }
  }

  async finish () {
    this.state = 'finished'
    this.cursor.visible = false
    this.activePoi = null
    this.stepProgress = 100
    this._emit()

    if (this.recorder.isRecording) {
      await this.recorder.stop(true)
    }

    if (this.activeFlow && typeof this.activeFlow.teardown === 'function') {
      try { await this.activeFlow.teardown() } catch (e) { console.warn(e) }
    }

    setTimeout(() => {
      if (this.state === 'finished') {
        this.stop()
      }
    }, 2000)
  }

  stop () {
    this._stepToken++
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    if (this._progressInterval) {
      clearInterval(this._progressInterval)
      this._progressInterval = null
    }
    if (this.recorder.isRecording) {
      this.recorder.stop(false)
    }

    this._teardownPoiTracking()

    this.state = 'idle'
    this.activeFlow = null
    this.currentStepIndex = 0
    this.stepProgress = 0
    this.activePoi = null
    this.cursor.visible = false
    this.cursor.clicking = false
    this._emit()
  }
}

export const defaultEngine = new TourGuideEngine()
