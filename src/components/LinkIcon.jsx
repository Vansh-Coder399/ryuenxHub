import { useState } from 'react'

/**
 * LinkIcon — circular icon for a quick link.
 *
 * Strategy:
 *   1. If the link has a URL, attempt to load `{origin}/favicon.ico` via <img>.
 *   2. If the image errors (404, CORS block, etc.) → fall back to the first
 *      letter of the link name in a deterministically-coloured circle,
 *      styled identically to CoinIcon so the two look like siblings.
 *   3. If there's no URL at all, go straight to the letter fallback.
 *
 * No third-party favicon service — only the site's own /favicon.ico path.
 */

// ── Fallback colour palette ──────────────────────────────────
// Eight distinct, saturated colours that contrast well against white text
// and sit comfortably within the dark design system palette.
const PALETTE = [
  '#7c6ff7', // indigo-violet  (matches accent)
  '#627EEA', // ethereum blue
  '#F7931A', // bitcoin orange
  '#9945FF', // solana purple
  '#22c55e', // green
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#06b6d4', // cyan
]

/**
 * Deterministic colour pick: hash the string → index into PALETTE.
 * Guaranteed to always return the same colour for the same input.
 */
function pickColor(str) {
  if (!str) return PALETTE[0]
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return PALETTE[Math.abs(h) % PALETTE.length]
}

/**
 * Extract `{origin}/favicon.ico` from a URL string.
 * Returns null if the URL is empty or unparseable.
 */
function faviconSrc(url) {
  if (!url) return null
  try {
    const { origin } = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`)
    return `${origin}/favicon.ico`
  } catch {
    return null
  }
}

/**
 * Key used for colour hashing — prefer the domain (stable), fall back to name.
 */
function colorKey(name, url) {
  try {
    if (url) {
      return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
    }
  } catch { /* fall through */ }
  return name || ''
}

// ── Component ────────────────────────────────────────────────

export default function LinkIcon({ name = '', url = '', size = 36 }) {
  const [imgFailed, setImgFailed] = useState(false)

  const favicon = faviconSrc(url)
  const letter  = ((name || url || '?').trim()[0] ?? '?').toUpperCase()
  const bg      = pickColor(colorKey(name, url))

  // Font size scales with circle size (same formula as CoinIcon)
  const fontSize = size * 0.38

  // ── Letter fallback (inline style mirrors CoinIcon exactly) ──
  const letterCircle = (
    <span
      aria-label={name || url || 'Link'}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     bg,
        color:          '#fff',
        fontFamily:     'Inter, system-ui, sans-serif',
        fontWeight:     700,
        fontSize,
        letterSpacing:  '-0.02em',
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {letter}
    </span>
  )

  // ── No URL → straight to letter fallback ─────────────────────
  if (!favicon || imgFailed) return letterCircle

  // ── Try to load the real favicon ─────────────────────────────
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        justifyContent: 'center',
        width:        size,
        height:       size,
        borderRadius: '50%',
        background:   bg,          // bg shows while img is loading
        flexShrink:   0,
        overflow:     'hidden',
      }}
      aria-label={name || url || 'Link'}
    >
      <img
        src={favicon}
        alt=""
        aria-hidden="true"
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        onError={() => setImgFailed(true)}
        style={{
          width:      Math.round(size * 0.6),
          height:     Math.round(size * 0.6),
          objectFit:  'contain',
          // Browsers may block cross-origin requests. Setting no CORS attribute
          // means the img is loaded as a regular tainted request (no JS access
          // to pixel data needed), which works for display-only use.
        }}
      />
    </span>
  )
}
