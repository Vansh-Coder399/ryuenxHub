import LinkIcon from './LinkIcon'

/**
 * QuickLinksBar — horizontal shortcut strip displayed below the Crypto widget.
 *
 * Receives `links` as a prop from App.jsx, which owns the single
 * useQuickLinks() instance shared with QuickLinksPanel. This ensures
 * any add/edit/delete/reorder in the panel immediately reflects here
 * without a page refresh.
 *
 * Management stays in the side panel — this bar is purely for quick access.
 */
export default function QuickLinksBar({ links }) {

  if (links.length === 0) return null

  return (
    <div className="card p-4 animate-fade-in" style={{ animationDelay: '120ms' }}>

      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="widget-title">Quick Links</span>
        <span className="badge bg-surface-elevated text-text-faint text-[10px]">{links.length}</span>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="flex items-start gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {links.map((link, i) => (
          <LinkChip key={link.id} link={link} delay={i * 35} />
        ))}
      </div>
    </div>
  )
}

/* ── Single chip ────────────────────────────────────────────── */

function LinkChip({ link, delay }) {
  const label = link.name || link.url || 'Link'

  function handleClick() {
    if (!link.url) return
    const href = /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      disabled={!link.url}
      title={label}
      aria-label={`Open ${label} in new tab`}
      className="
        flex flex-col items-center gap-1.5 flex-shrink-0
        group outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        animate-fade-in
      "
      style={{ animationDelay: `${delay}ms`, width: '56px' }}
    >
      {/* Icon — hover: scale up slightly */}
      <div className="
        rounded-full transition-transform duration-150
        group-hover:scale-110 group-active:scale-95
        ring-2 ring-transparent group-hover:ring-accent/30
      ">
        <LinkIcon name={link.name} url={link.url} size={40} />
      </div>

      {/* Label */}
      <span className="
        w-full text-center text-[10px] leading-tight
        text-text-faint group-hover:text-text-muted
        transition-colors duration-150 truncate
      ">
        {label}
      </span>
    </button>
  )
}
