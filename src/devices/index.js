/**
 * Device registry — add a new device here, DeviceFrame picks it up automatically.
 *
 * Fields:
 *   label     — display name in DeviceToolbar
 *   screenW   — logical screen width  (CSS px)
 *   screenH   — logical screen height (CSS px)
 *   bezel     — frame thickness around the screen (CSS px)
 *   radius    — outer frame corner radius (CSS px); screen radius = radius − bezel
 *   safeTop   — clearance for the status-bar / notch / island (CSS px)
 *   frame     — CSS gradient/color for the metal edge
 *   shadow    — CSS box-shadow for the whole frame
 *   hardware  — camera cutout + side button geometry
 *
 * To add a new device:
 *   1. Measure the real screen dimensions (points, not pixels).
 *   2. Pick a CSS scale so the device fits comfortably (440px wide is a good reference).
 *   3. Fill in the spec below, add its key to DeviceToolbar's list.
 */

export const DEVICES = {
  iphone: {
    label: 'iPhone',
    screenW: 440,
    screenH: 956,
    bezel: 14,
    // The continuous-curvature ("squircle") corner of iPhones is approximated
    // with a large radius. CSS `corner-shape: squircle` will handle this properly
    // once it lands in stable browsers; until then 62px reads correctly at this scale.
    radius: 62,
    safeTop: 62,
    frame: 'linear-gradient(160deg, #dedad5 0%, #bab6b0 25%, #9a9691 55%, #cac6c0 80%, #d8d4cf 100%)',
    shadow: '0 0 0 1.5px rgba(0,0,0,0.45), 0 28px 64px rgba(0,0,0,0.55)',
    hardware: {
      // Dynamic Island pill
      island: { width: 126, height: 37, topFromBezel: 12 },
      // Left edge: Action button (top), Vol↑, Vol↓
      buttonsLeft: [
        { label: 'action', top: 110, height: 32, width: 5, radius: '2px 0 0 2px' },
        { label: 'vol-up', top: 172, height: 58, width: 5, radius: '2px 0 0 2px' },
        { label: 'vol-dn', top: 245, height: 58, width: 5, radius: '2px 0 0 2px' },
      ],
      // Right edge: Power / Sleep button
      buttonsRight: [
        { label: 'power', top: 192, height: 88, width: 5, radius: '0 2px 2px 0' },
      ],
    },
  },

  samsung: {
    label: 'Android',
    screenW: 384,
    screenH: 854,
    bezel: 12,
    radius: 48,
    safeTop: 40,
    frame: 'linear-gradient(160deg, #eaecf1 0%, #c8cbd3 35%, #b0b4be 65%, #d8dbe3 100%)',
    shadow: '0 0 0 1.5px rgba(0,0,0,0.38), 0 28px 64px rgba(0,0,0,0.5)',
    hardware: {
      // Centre punch-hole camera
      punch: { size: 11, topFromBezel: 14 },
      // Right edge: Volume (top) + Power (below)
      buttonsRight: [
        { label: 'vol-up', top: 140, height: 40, width: 4, radius: '0 2px 2px 0' },
        { label: 'vol-dn', top: 188, height: 40, width: 4, radius: '0 2px 2px 0' },
        { label: 'power',  top: 240, height: 62, width: 4, radius: '0 2px 2px 0' },
      ],
    },
  },
}
