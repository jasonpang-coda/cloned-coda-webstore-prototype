import { ref, computed, shallowRef, readonly } from 'vue'
import { defaultEngine } from '../core/engine.js'
import { defineTour } from '../core/flow.js'

// Vue singleton state mirrored from defaultEngine
const state = ref(defaultEngine.state)
const activeFlow = shallowRef(defaultEngine.activeFlow)
const currentStepIndex = ref(defaultEngine.currentStepIndex)
// Derived from the reactive activeFlow/currentStepIndex refs above — NOT
// defaultEngine.getCurrentStep() directly, which reads plain (non-reactive)
// class fields. A computed only re-runs when a tracked ref changes; reading
// unwrapped class fields tracks nothing, so that version would compute once
// and then freeze at whatever step was active on first access (the guide
// card's title/explanation would stop updating after step 1).
const currentStep = computed(() => activeFlow.value?.steps?.[currentStepIndex.value] ?? null)
const totalSteps = computed(() => activeFlow.value?.steps?.length ?? 0)
const speed = ref(defaultEngine.speed)
const record = ref(defaultEngine.record)
const autoplay = ref(defaultEngine.autoplay)
const voiceOver = ref(defaultEngine.voiceOver)
const cursor = ref({ ...defaultEngine.cursor })
const activePoi = ref(defaultEngine.activePoi)
const stepProgress = ref(defaultEngine.stepProgress)
const isRecording = ref(defaultEngine.recorder.isRecording)
const recordingTime = ref('00:00')

const modalOpen = ref(false)

// Subscribe to engine state mutations
defaultEngine.subscribe((snap) => {
  state.value = snap.state
  activeFlow.value = snap.activeFlow
  currentStepIndex.value = snap.currentStepIndex
  speed.value = snap.speed
  record.value = snap.record
  autoplay.value = snap.autoplay
  voiceOver.value = snap.voiceOver
  cursor.value = { ...snap.cursor }
  activePoi.value = snap.activePoi ? { ...snap.activePoi } : null
  stepProgress.value = snap.stepProgress
  isRecording.value = snap.isRecording
  recordingTime.value = snap.recordingTime
})

export function useTourGuide () {
  function registerFlow (flow) {
    defaultEngine.registerFlow(flow)
  }

  function registerFlows (flows) {
    defaultEngine.registerFlows(flows)
  }

  function getFlow (id) {
    return defaultEngine.getFlow(id)
  }

  function listFlows () {
    return defaultEngine.listFlows()
  }

  function openModal () {
    modalOpen.value = true
  }

  function closeModal () {
    modalOpen.value = false
  }

  function toggleModal () {
    modalOpen.value = !modalOpen.value
  }

  function startFlow (flowOrId, options = {}) {
    closeModal()
    return defaultEngine.start(flowOrId, options)
  }

  function pause () {
    defaultEngine.pause()
  }

  function resume () {
    defaultEngine.resume()
  }

  function togglePlayPause () {
    if (state.value === 'playing') {
      defaultEngine.pause()
    } else if (state.value === 'paused') {
      defaultEngine.resume()
    }
  }

  function nextStep () {
    defaultEngine.next()
  }

  function prevStep () {
    defaultEngine.prev()
  }

  function seekStep (index) {
    defaultEngine.seek(index)
  }

  function stopFlow () {
    defaultEngine.stop()
  }

  function setSpeed (val) {
    defaultEngine.setSpeed(val)
  }

  return {
    // Readonly reactive state
    state: readonly(state),
    activeFlow: readonly(activeFlow),
    currentStepIndex: readonly(currentStepIndex),
    currentStep,
    totalSteps,
    speed: readonly(speed),
    record: readonly(record),
    autoplay: readonly(autoplay),
    voiceOver: readonly(voiceOver),
    cursor: readonly(cursor),
    activePoi: readonly(activePoi),
    stepProgress: readonly(stepProgress),
    isRecording: readonly(isRecording),
    recordingTime: readonly(recordingTime),
    modalOpen: readonly(modalOpen),

    // Actions
    registerFlow,
    registerFlows,
    getFlow,
    listFlows,
    openModal,
    closeModal,
    toggleModal,
    startFlow,
    pause,
    resume,
    togglePlayPause,
    nextStep,
    prevStep,
    seekStep,
    stopFlow,
    setSpeed,
    defineTour,
  }
}
