import { useCrypto, COINS, formatPrice, formatChange } from '../hooks/useCrypto'
import CoinIcon from './CoinIcon'

/**
 * CryptoWidget — live crypto price card.
 *
 * States:
 *   loading  — shimmer skeleton rows (first load only)
 *   success  — coin rows with live price + 24h change
 *   stale    — success UI + amber banner (last fetch failed, showing cached)
 *   error    — hard error when no prior data exists
 */
export default function CryptoWidget() {
  const { status, prices, isStale, lastUpdated, error, refresh } = useCrypto()

  return (
    <div className="card card-hover p-4 sm:p-5 animate-fade-in" style={{ animationDelay: '80ms' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="widget-title">Crypto Prices</span>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-text-faint tabular hidden sm:inline">
              Updated {timeAgo(lastUpdated)}
            </span>
          )}

          {isStale && (
            <span className="badge bg-warning/10 text-warning border border-warning/20 text-[10px] py-0.5">
              <WarnTriangle />
              Stale
            </span>
          )}

          <button
            onClick={refresh}
            disabled={status === 'loading'}
            className="icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
            title="Refresh prices"
            aria-label="Refresh crypto prices"
          >
            <RefreshIcon spinning={status === 'loading'} />
          </button>
        </div>
      </div>

      {/* ── Stale banner — uses .stale-banner class (CSS avoids Tailwind /8 issue) */}
      {isStale && error && (
        <div className="stale-banner mb-3">
          <WarnTriangle />
          <span className="leading-snug">{error} — showing last known prices.</span>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────── */}
      {status === 'loading' && <SkeletonRows />}

      {/* ── Success / Stale ─────────────────────────────────── */}
      {status === 'success' && prices && (
        <div className="divide-y divide-surface-border">
          {COINS.map((coin, i) => {
            const coinData = prices[coin.id]
            const { text: changeText, isPositive } = formatChange(coinData?.usd_24h_change)
            return (
              <CoinRow
                key={coin.id}
                coin={coin}
                price={formatPrice(coinData?.usd)}
                changeText={changeText}
                isPositive={isPositive}
                isStale={isStale}
                delay={i * 40}
              />
            )
          })}
        </div>
      )}

      {/* ── Hard error ──────────────────────────────────────── */}
      {status === 'error' && !prices && (
        <ErrorState message={error} onRetry={refresh} />
      )}

      {/* ── Disclaimer footer ───────────────────────────────── */}
      <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-text-faint leading-relaxed">
          Prices may be delayed · Not for trading decisions
        </p>
        <p className="text-[10px] text-text-faint tabular opacity-70">
          Auto-refreshes every 60 s
        </p>
      </div>
    </div>
  )
}

/* ── Coin row ───────────────────────────────────────────────── */

function CoinRow({ coin, price, changeText, isPositive, isStale, delay }) {
  const pillCls =
    isPositive === null
      ? 'bg-surface-elevated text-text-muted'
      : isPositive
        ? 'bg-positive/10 text-positive border border-positive/20'
        : 'bg-negative/10 text-negative border border-negative/20'

  const arrow = isPositive === null ? null : isPositive ? '▲' : '▼'

  return (
    <div
      className="flex items-center gap-3 py-2.5 sm:py-3 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CoinIcon symbol={coin.symbol} size={34} />

      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium text-sm leading-tight truncate">
          {coin.name}
        </p>
        <p className="text-text-faint text-xs">{coin.symbol}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`tabular text-sm font-semibold ${isStale ? 'text-text-muted' : 'text-text-primary'}`}>
          {price}
        </p>
        <span className={`badge mt-1 tabular text-[10px] ${pillCls}`}>
          {arrow && <span className="text-[8px] leading-none">{arrow}</span>}
          {changeText}
        </span>
      </div>
    </div>
  )
}

/* ── Skeleton rows ──────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <div className="divide-y divide-surface-border">
      {COINS.map((coin) => (
        <div key={coin.id} className="flex items-center gap-3 py-2.5 sm:py-3">
          <div className="skeleton w-[34px] h-[34px] rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-3 w-10 rounded" />
          </div>
          <div className="text-right space-y-1.5">
            <div className="skeleton h-4 w-24 rounded ml-auto" />
            <div className="skeleton h-3 w-14 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Hard error state ───────────────────────────────────────── */

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
      <div className="w-10 h-10 rounded-xl bg-negative/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-negative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"  x2="12"   y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="text-text-primary font-medium text-sm">Couldn't load prices</p>
        <p className="text-text-faint text-xs mt-1 max-w-xs leading-relaxed">
          {message || 'Check your connection. CoinGecko free tier may be rate-limiting.'}
        </p>
      </div>
      <button onClick={onRetry} className="btn-ghost text-xs py-1.5 px-3">
        Try again
      </button>
    </div>
  )
}

/* ── Micro icons ────────────────────────────────────────────── */

function RefreshIcon({ spinning }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

function WarnTriangle() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9"  x2="12"   y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

/* ── Time-ago helper ────────────────────────────────────────── */

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 10)  return 'just now'
  if (secs < 60)  return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60)  return `${mins} min ago`
  return `${Math.floor(mins / 60)}h ago`
}
