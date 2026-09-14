/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        hitmarker: ['Hitmarker Text VF', 'sans-serif'],
      },
      colors: {
        page: 'var(--bg-page)',
        'text-header': 'var(--text-header-default)',
        'text-body': 'var(--text-body-default)',
        success: 'var(--text-success-default)',
        price: 'var(--text-final-price)',
        'bonus-codashop': 'var(--text-web-bonus-codashop)',
        'bonus-cp': 'var(--text-web-bonus-cp)',
        'card-border': 'var(--border-sku-card-default)',
        'tag-bg': 'var(--bg-tag-error)',
        'tag-text': 'var(--text-error-default)',
      },
      // ── Motion: durations ────────────────────────────────────────────────────
      transitionDuration: {
        instant: 'var(--motion-sys-duration-instant)',
        fast:    'var(--motion-sys-duration-fast)',
        base:    'var(--motion-sys-duration-base)',
        slow:    'var(--motion-sys-duration-slow)',
        slower:  'var(--motion-sys-duration-slower)',
        exit:    'var(--motion-sys-duration-exit)',
      },
      // ── Motion: easings ──────────────────────────────────────────────────────
      transitionTimingFunction: {
        standard:   'var(--motion-sys-ease-standard)',
        decelerate: 'var(--motion-sys-ease-decelerate)',
        accelerate: 'var(--motion-sys-ease-accelerate)',
        sharp:      'var(--motion-sys-ease-sharp)',
        emphasized: 'var(--motion-sys-ease-emphasized)',
        spring:     'var(--motion-sys-ease-spring)',
      },
      // ── Motion: stagger delays ───────────────────────────────────────────────
      transitionDelay: {
        'stagger-xs': 'var(--motion-sys-stagger-xs)',
        'stagger-sm': 'var(--motion-sys-stagger-sm)',
        'stagger-md': 'var(--motion-sys-stagger-md)',
      },
      // ── Motion: named animations ─────────────────────────────────────────────
      animation: {
        // Base library
        'fade-in':    'fade-in var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'fade-out':   'fade-out var(--motion-sys-duration-exit) var(--motion-sys-ease-accelerate) both',
        'slide-up':   'slide-up var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'slide-down': 'slide-down var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'slide-left': 'slide-left var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'slide-right':'slide-right var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'scale-in':   'scale-in var(--motion-sys-duration-slow) var(--motion-sys-ease-decelerate) both',
        'pop':        'pop var(--motion-sys-duration-base) var(--motion-sys-ease-spring) both',
        'shake':      'shake var(--motion-sys-duration-slow) var(--motion-sys-ease-standard) both',
        'spin-token': 'spin 1.2s var(--motion-sys-ease-linear) infinite',
        'pulse-token':'pulse 1.4s var(--motion-sys-ease-standard) infinite',
        'shimmer':    'shimmer 1.4s var(--motion-sys-ease-linear) infinite',
        'ripple':     'ripple var(--motion-sys-duration-slow) var(--motion-sys-ease-decelerate) forwards',
        // SKU Card specific
        'sku-enter':  'slide-up var(--motion-sys-duration-base) var(--motion-sys-ease-decelerate) both',
        'sku-badge':  'pop var(--motion-sys-duration-slow) var(--motion-sys-ease-spring) both',
      },
    },
  },
  plugins: [],
}
