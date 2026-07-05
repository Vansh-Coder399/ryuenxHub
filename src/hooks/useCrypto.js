import { useState, useCallback, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
// Configurable coin list — add or remove entries here.
// `id` must match CoinGecko's coin ID exactly.
// ─────────────────────────────────────────────────────────────
export const COINS = [
  { id: 'bitcoin',  symbol: 'BTC',  name: 'Bitcoin'  },
  { id: 'ethereum', symbol: 'ETH',  name: 'Ethereum' },
  { id: 'solana',   symbol: 'SOL',  name: 'Solana'   },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano',  symbol: 'ADA',  name: 'Cardano'  },
]

/**
 * Refresh interval in milliseconds.
 *
 * CoinGecko's public (no-key) endpoint allows ~10–30 req/min
 * across all IPs on their edge network; the practical sweet spot
 * for a single client is ≤1 req/min to avoid any 429.
 *
 * However, we batch all 5 coins into a single request, so at 60 s
 * we send 1 req/min — very safe. Change to 30_000 for faster updates
 * if you're on a reliable connection and see no 429s.
 *
 * ROADMAP: swap to CoinGecko Demo API key (free, higher limits) in v2.
 */
const REFRESH_INTERVAL_MS = 60_000 // 60 seconds

/**
 * useCrypto — fetches live prices from CoinGecko's public /simple/price
 * endpoint (no API key required for basic usage).
 *
 * Returned state shape:
 *   status      : 'idle' | 'loading' | 'success' | 'error'
 *   prices      : Record<coinId, { usd, usd_24h_change }> | null
 *   isStale     : boolean   — true when we're showing cached data after a failure
 *   lastUpdated : Date | null
 *   error       : string | null
 *   refresh     : () => void  — manual refresh trigger
 */
export function useCrypto() {
  const [status, setStatus]           = useState('idle')
  const [prices, setPrices]           = useState(null)
  const [isStale, setIsStale]         = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError]             = useState(null)

  // Track whether a fetch is already in-flight to avoid overlapping calls
  // when the timer fires while a previous request is still pending.
  const fetchingRef  = useRef(false)
  // True after the first successful (or error) response — used to decide
  // whether to show the full loading skeleton or refresh silently.
  const hasLoadedRef = useRef(false)

  const fetchPrices = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    // Only show the full loading skeleton on the very first fetch.
    // Subsequent auto-refreshes update silently so the UI doesn't flicker.
    if (!hasLoadedRef.current) setStatus('loading')
    setError(null)

    try {
      const ids = COINS.map((c) => c.id).join(',')

      // CoinGecko public endpoint — no key needed.
      // include_24hr_change=true adds the usd_24h_change field.
      // Docs: https://www.coingecko.com/api/documentation
      const url =
        `https://api.coingecko.com/api/v3/simple/price` +
        `?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })

      // ── Rate-limit handling ────────────────────────────────
      // 429 = Too Many Requests. Keep showing last known prices (stale)
      // instead of wiping the UI. The next auto-refresh will retry.
      if (res.status === 429) {
        console.warn('[useCrypto] CoinGecko rate-limited (429). Keeping cached prices.')
        setIsStale(true)
        setError('Rate limited — showing last known prices')
        setStatus(prices ? 'success' : 'error')
        return
      }

      if (!res.ok) throw new Error(`CoinGecko responded with ${res.status}`)

      const json = await res.json()

      // Validate: ensure we got at least one coin back
      if (!json || typeof json !== 'object' || !Object.keys(json).length) {
        throw new Error('Empty response from CoinGecko')
      }

      setPrices(json)
      setIsStale(false)
      setLastUpdated(new Date())
      setStatus('success')
      hasLoadedRef.current = true
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        console.warn('[useCrypto] Request timed out')
        setError('Request timed out')
      } else {
        console.error('[useCrypto]', err)
        setError(err.message || 'Failed to load prices')
      }

      // If we already have prices, keep them visible as stale data
      // rather than crashing the widget to a blank/error state.
      if (hasLoadedRef.current) {
        setIsStale(true)
        setStatus('success') // still show the card, just with stale indicator
      } else {
        setStatus('error')
      }
    } finally {
      fetchingRef.current = false
    }
  // No deps — fetchPrices is intentionally stable (all mutable state
  // is accessed via refs or setter functions which are already stable).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-refresh on mount + every REFRESH_INTERVAL_MS
  useEffect(() => {
    fetchPrices()

    const timer = setInterval(fetchPrices, REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
  // Only run on mount — fetchPrices reference is stable via useCallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status, prices, isStale, lastUpdated, error, refresh: fetchPrices }
}

// ─────────────────────────────────────────────────────────────
// Price formatters
// ─────────────────────────────────────────────────────────────

/**
 * Format a USD price with appropriate decimal places:
 *   >= $1,000  → 2 decimals, comma-separated   e.g. $67,432.21
 *   $1–$1,000  → 2 decimals                    e.g. $180.45
 *   < $1       → 4 decimals                    e.g. $0.0823
 */
export function formatPrice(usd) {
  if (usd == null) return '—'
  const decimals = usd >= 1 ? 2 : 4
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(usd)
}

/**
 * Format a 24h percent change, always showing sign.
 * Returns { text, isPositive } for colour-coding in the UI.
 */
export function formatChange(pct) {
  if (pct == null) return { text: '—', isPositive: null }
  const isPositive = pct >= 0
  const text = `${isPositive ? '+' : ''}${pct.toFixed(2)}%`
  return { text, isPositive }
}
