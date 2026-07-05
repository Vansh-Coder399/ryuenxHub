import { useEffect } from 'react'
import { useWeather, describeWeatherCode } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

/**
 * WeatherWidget — live weather card.
 *
 * States:
 *   idle / locating — pin pulse + hint text
 *   fetching        — shimmer skeletons
 *   success         — temp, condition, stats (responsive layout)
 *   error           — friendly message + retry
 */
export default function WeatherWidget() {
  const { status, data, location, method, error, refresh } = useWeather()

  useEffect(() => { refresh() }, [refresh])

  const isLoading = status === 'idle' || status === 'locating' || status === 'fetching'

  return (
    <div className="card card-hover p-4 sm:p-5 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <span className="widget-title">Weather</span>

        <div className="flex items-center gap-2 min-w-0">
          {/* Location badge */}
          {location && (
            <span className="badge bg-surface-elevated text-text-muted min-w-0">
              <PinIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {location.name}
              </span>
              {method === 'ip' && (
                <span
                  className="text-warning flex-shrink-0"
                  title="Approximate location via IP — geolocation was denied or unavailable"
                >≈</span>
              )}
            </span>
          )}

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="icon-btn disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Refresh weather"
            aria-label="Refresh weather"
          >
            <RefreshIcon spinning={isLoading} />
          </button>
        </div>
      </div>

      {/* ── Locating ────────────────────────────────────────── */}
      {(status === 'idle' || status === 'locating') && <LocatingState />}

      {/* ── Fetching (location known) ────────────────────────── */}
      {status === 'fetching' && <FetchingState locationName={location?.name} />}

      {/* ── Success ─────────────────────────────────────────── */}
      {status === 'success' && data && <SuccessState data={data} />}

      {/* ── Error ───────────────────────────────────────────── */}
      {status === 'error' && <ErrorState message={error} onRetry={refresh} />}
    </div>
  )
}

/* ── Loading states ─────────────────────────────────────────── */

function LocatingState() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-elevated flex items-center justify-center flex-shrink-0 animate-pulse-soft">
        <PinIcon className="w-5 h-5 text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-text-primary font-medium text-sm">Detecting your location…</p>
        <p className="text-text-faint text-xs mt-0.5 leading-relaxed">
          Allow location access for best accuracy, or we'll use your IP.
        </p>
      </div>
    </div>
  )
}

function FetchingState({ locationName }) {
  return (
    <div className="flex items-start gap-4 sm:gap-5">
      {/* Icon skeleton */}
      <div className="skeleton w-14 h-14 rounded-2xl flex-shrink-0" />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="skeleton h-9 w-28 rounded-lg" />
        <div className="skeleton h-4 w-20 rounded" />
        {locationName && (
          <p className="text-xs text-text-faint">Fetching weather for {locationName}…</p>
        )}
      </div>

      {/* Stats skeletons — hide below sm to avoid overflow */}
      <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    </div>
  )
}

/* ── Success state ──────────────────────────────────────────── */

function SuccessState({ data }) {
  const { label, condition } = describeWeatherCode(data.weatherCode)
  const showFeelsLike = Math.abs(data.temp - data.feelsLike) > 1

  return (
    <div className="animate-fade-in">
      {/* Main row — icon + temp + (desktop) stats */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Condition icon */}
        <div className="flex-shrink-0 drop-shadow-lg">
          <WeatherIcon condition={condition} size={60} />
        </div>

        {/* Temp + label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-1.5 leading-none">
            <span className="tabular text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">
              {data.temp}°
            </span>
            <span className="text-base sm:text-lg text-text-muted mb-1">C</span>
          </div>

          <p className="text-text-muted text-sm mt-1 truncate">{label}</p>

          {showFeelsLike && (
            <p className="text-text-faint text-xs mt-0.5">
              Feels like {data.feelsLike}°C
            </p>
          )}
        </div>

        {/* Stats — desktop only */}
        <div className="hidden sm:flex flex-col gap-2 flex-shrink-0 pr-1">
          <WeatherStat icon={<HumidityIcon />} label="Humidity"  value={`${data.humidity}%`} />
          <WeatherStat icon={<WindIcon />}     label="Wind"      value={`${data.windSpeed} km/h`} />
          <WeatherStat
            icon={<ClockMiniIcon />}
            label="Updated"
            value={data.fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        </div>
      </div>

      {/* Stats — mobile row (below the main row) */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-border sm:hidden">
        <MobileStat label="Humidity"  value={`${data.humidity}%`} />
        <div className="w-px h-4 bg-surface-border flex-shrink-0" />
        <MobileStat label="Wind"      value={`${data.windSpeed} km/h`} />
        <div className="w-px h-4 bg-surface-border flex-shrink-0" />
        <MobileStat
          label="Updated"
          value={data.fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
      </div>
    </div>
  )
}

/* ── Error state ────────────────────────────────────────────── */

function ErrorState({ message, onRetry }) {
  const isPermission =
    message?.toLowerCase().includes('denied') ||
    message?.toLowerCase().includes('permission')

  return (
    <div className="flex flex-col items-center justify-center py-4 gap-3 text-center">
      <div className="w-10 h-10 rounded-xl bg-negative/10 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-negative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"  x2="12"   y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div>
        <p className="text-text-primary font-medium text-sm">
          {isPermission ? 'Location access denied' : "Couldn't load weather"}
        </p>
        <p className="text-text-faint text-xs mt-1 max-w-xs leading-relaxed">
          {isPermission
            ? 'Both GPS and IP geolocation failed. Check your network or browser permissions.'
            : message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      <button onClick={onRetry} className="btn-ghost text-xs py-1.5 px-3">
        Try again
      </button>
    </div>
  )
}

/* ── Small helper components ────────────────────────────────── */

function WeatherStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 h-4 text-text-faint flex-shrink-0">{icon}</span>
      <span className="text-text-faint">{label}</span>
      <span className="text-text-muted font-medium tabular ml-auto">{value}</span>
    </div>
  )
}

function MobileStat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span className="tabular text-xs font-semibold text-text-primary">{value}</span>
      <span className="text-[10px] text-text-faint">{label}</span>
    </div>
  )
}

/* ── Inline SVG icons ───────────────────────────────────────── */

function PinIcon({ className = 'w-3 h-3' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

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

function HumidityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M6.91 12.91A2 2 0 1 0 8 16H2" />
    </svg>
  )
}

function ClockMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
