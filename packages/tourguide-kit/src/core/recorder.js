/**
 * Client-side WebM Video Recorder using MediaRecorder and getDisplayMedia / Canvas stream.
 */

function formatTimestamp () {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-` +
         `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function triggerDownload (blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function pickMimeType () {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime
    }
  }
  return ''
}

export class WebmRecorder {
  constructor () {
    this.mediaRecorder = null
    this.stream = null
    this.micStream = null
    this.recordedChunks = []
    this.isRecording = false
    this.startTime = 0
    this.durationMs = 0
    this.timerInterval = null
    this.onStateChange = null
    this.mimeType = pickMimeType()
  }

  /**
   * Prompts user for tab display media stream.
   * @param {Object} [constraints]
   * @returns {Promise<MediaStream>}
   */
  async requestTabStream (constraints = {}) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('[tourguide-kit] getDisplayMedia is not supported in this browser.')
    }
    const defaultConstraints = {
      video: {
        displaySurface: 'browser',
        frameRate: { ideal: 60, max: 60 },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
      selfBrowserSurface: 'include',
      preferCurrentTab: true,
      ...constraints,
    }
    return await navigator.mediaDevices.getDisplayMedia(defaultConstraints)
  }

  /**
   * Starts recording from a provided MediaStream or prompts for tab capture.
   * @param {Object} options
   * @param {MediaStream} [options.stream]
   * @param {string} [options.filename]
   * @param {boolean} [options.captureMic]
   * @param {Function} [options.onStateChange]
   * @returns {Promise<void>}
   */
  async start (options = {}) {
    if (this.isRecording) return

    try {
      this.stream = options.stream || await this.requestTabStream()
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.warn('[tourguide-kit] Screen capture permission was dismissed or cancelled.')
        return
      }
      throw err
    }

    if (!this.stream) return

    // Optional voice-over: mix the demonstrator's mic into the recording.
    // Failure here (denied/unsupported) must not abort the screen recording —
    // fall back to video-only.
    if (options.captureMic) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const micTrack = this.micStream.getAudioTracks()[0]
        if (micTrack) this.stream.addTrack(micTrack)
      } catch (err) {
        console.warn('[tourguide-kit] Microphone capture could not be started; recording video only.', err)
        this.micStream = null
      }
    }

    this.recordedChunks = []
    this.filename = options.filename || `tour-${formatTimestamp()}.webm`
    if (options.onStateChange) this.onStateChange = options.onStateChange

    const mimeType = this.mimeType || 'video/webm'
    const recorderOptions = mimeType ? { mimeType } : {}

    this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions)

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data)
      }
    }

    // Handle user clicking browser's built-in "Stop sharing" button
    const videoTrack = this.stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.onended = () => {
        if (this.isRecording) {
          this.stop(false) // Stop recording gracefully without re-stopping track
        }
      }
    }

    this.mediaRecorder.start(100) // 100ms timeslices
    this.isRecording = true
    this.startTime = performance.now()
    this.durationMs = 0

    this.timerInterval = setInterval(() => {
      this.durationMs = performance.now() - this.startTime
      this._emitChange()
    }, 200)

    this._emitChange()
  }

  /**
   * Stops recording, collects final chunks, compiles WebM Blob, and downloads.
   * @param {boolean} [autoDownload=true]
   * @returns {Promise<Blob|null>}
   */
  stop (autoDownload = true) {
    if (!this.isRecording || !this.mediaRecorder) return Promise.resolve(null)

    clearInterval(this.timerInterval)
    this.timerInterval = null

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mimeType || 'video/webm'
        const blob = new Blob(this.recordedChunks, { type: mimeType })

        // Stop all tracks in stream (includes the mixed-in mic track, if any)
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop())
          this.stream = null
        }
        if (this.micStream) {
          this.micStream.getTracks().forEach(t => t.stop())
          this.micStream = null
        }

        this.isRecording = false
        this._emitChange()

        if (autoDownload && blob.size > 0) {
          triggerDownload(blob, this.filename)
        }

        resolve(blob)
      }

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop()
        }
      } catch {
        resolve(null)
      }
    })
  }

  _emitChange () {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        isRecording: this.isRecording,
        durationMs: this.durationMs,
        formattedTime: this.getFormattedDuration(),
      })
    }
  }

  getFormattedDuration () {
    const totalSecs = Math.floor(this.durationMs / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
}
