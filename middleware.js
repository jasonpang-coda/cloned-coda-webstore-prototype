/**
 * Vercel Edge Middleware — optional HTTP Basic Auth gate for a store-locked
 * preview link (see docs/deploying-individual-stores.md §3).
 *
 * Runs on Vercel's edge, ahead of the SPA rewrite in vercel.json, so it
 * covers every request — the HTML shell and every /assets/* file alike.
 * Nothing about the storefront's own code changes; this is purely a
 * hosting-layer gate.
 *
 * Credential source: THIS VERCEL PROJECT'S environment variables only.
 * BASIC_AUTH_USER / BASIC_AUTH_PASSWORD are never committed, never
 * VITE_-prefixed (so they can't be inlined into the client bundle), and are
 * set once per project in the Vercel dashboard (Settings → Environment
 * Variables). Since each store deploys as its own project — e.g.
 * codm-webstore-prototype.vercel.app, fcm-webstore-prototype.vercel.app —
 * each one gets its own independent login by setting its own pair.
 *
 * Gate is opt-in: if either var is unset on a project, every request passes
 * through untouched (e.g. the internal all-stores build, or local `vercel
 * dev` with no .env). This lets some deployments stay open while others are
 * locked, with zero source changes either way.
 */
import { next } from '@vercel/edge'

export const config = {
  // Run on every path, including static assets — a locked build should not
  // leak its images/fonts/JS to an unauthenticated request either. Vercel's
  // own internal paths (_vercel/*) are excluded since they never serve
  // storefront content.
  matcher: ['/((?!_vercel/).*)'],
}

export default function middleware(request) {
  // PWA installability infrastructure must stay reachable without the auth
  // challenge — a manifest/service-worker fetch that gets a 401 makes the
  // site permanently non-installable, even for an already-authenticated
  // visitor (Chrome's installability checks don't reliably retry with
  // cached Basic-Auth credentials the way a normal page fetch does). None
  // of these are sensitive content — same posture as excluding _vercel/*
  // in the matcher above.
  const { pathname } = new URL(request.url)
  if (
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/pwa/')
  ) {
    return next()
  }

  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASSWORD

  // No credential configured for this project — gate disabled, pass through.
  if (!user || !pass) {
    return next()
  }

  const unauthorized = () =>
    new Response('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': `Basic realm="${process.env.BASIC_AUTH_REALM || 'Prototype'}", charset="UTF-8"`,
      },
    })

  const header = request.headers.get('authorization') || ''
  const [scheme, encoded] = header.split(' ')
  if (scheme !== 'Basic' || !encoded) {
    return unauthorized()
  }

  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return unauthorized()
  }

  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) {
    return unauthorized()
  }

  const suppliedUser = decoded.slice(0, separatorIndex)
  const suppliedPass = decoded.slice(separatorIndex + 1)

  if (!timingSafeEqual(suppliedUser, user) || !timingSafeEqual(suppliedPass, pass)) {
    return unauthorized()
  }

  return next()
}

// Constant-time-ish string comparison — avoids leaking credential length or
// a byte-by-byte early exit via response timing. Not a hard requirement for
// a prototype gate, but cheap to get right.
function timingSafeEqual(a, b) {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  const length = Math.max(aBytes.length, bBytes.length)
  let mismatch = aBytes.length === bBytes.length ? 0 : 1
  for (let i = 0; i < length; i++) {
    mismatch |= (aBytes[i] || 0) ^ (bBytes[i] || 0)
  }
  return mismatch === 0
}
