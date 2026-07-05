import { useState, useEffect, useRef, useCallback } from 'react'
import LinkIcon from './LinkIcon'

/**
 * QuickLinksPanel — slide-in sidebar for managing quick-access URLs.
 *
 * Receives the quickLinks hook result as a prop from App.jsx (which
 * owns the single useQuickLinks() instance shared with QuickLinksBar).
 * This guarantees that mutations here immediately update the shortcut bar.
 */
export default function QuickLinksPanel({ isOpen, onClose, quickLinks }) {
  const { links, addLink, updateLink, deleteLink, moveUp, moveDown } = quickLinks

  const [view, setView]       = useState('list')  // 'list' | 'edit'
  const [activeId, setActiveId] = useState(null)

  // Reset to list when panel slides closed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setView('list'); setActiveId(null) }, 320)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  function handleAddLink() {
    const id = addLink()
    setActiveId(id)
    setView('edit')
  }

  function handleEdit(id) {
    setActiveId(id)
    setView('edit')
  }

  function handleBack() {
    setView('list')
    setActiveId(null)
  }

  function handleDelete(id) {
    deleteLink(id)
    handleBack()
  }

  const activeLink = links.find((l) => l.id === activeId) ?? null

  // Guard: if active link disappears (e.g. storage cleared externally), go back
  useEffect(() => {
    if (view === 'edit' && activeId && !activeLink) handleBack()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLink, view, activeId])

  return (
    <aside
      className={`
        fixed top-0 right-0 h-full
        w-full max-w-[360px]
        bg-surface-card border-l border-surface-border
        z-40 flex flex-col
        transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.45)' }}
      aria-label="Quick Links panel"
      role="complementary"
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Back arrow in edit view */}
          {view === 'edit' && (
            <button onClick={handleBack} className="icon-btn -ml-1 flex-shrink-0" aria-label="Back to links list">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Header icon (list view only) */}
          {view === 'list' && (
            <svg className="w-4 h-4 text-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}

          <h2 className="font-semibold text-text-primary text-sm truncate">
            {view === 'list' ? 'Quick Links' : (activeLink?.name || 'Edit Link')}
          </h2>

          {view === 'list' && links.length > 0 && (
            <span className="badge bg-surface-elevated text-text-faint text-[10px]">
              {links.length}
            </span>
          )}
        </div>

        {/* Close */}
        <button onClick={onClose} className="icon-btn flex-shrink-0" aria-label="Close quick links panel">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Views ─────────────────────────────────────────────── */}
      {view === 'list' && (
        <LinkListView
          links={links}
          onAdd={handleAddLink}
          onEdit={handleEdit}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
        />
      )}

      {view === 'edit' && activeLink && (
        <LinkEditView
          link={activeLink}
          isFirst={links[0]?.id === activeLink.id}
          isLast={links[links.length - 1]?.id === activeLink.id}
          onUpdate={updateLink}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}
    </aside>
  )
}

/* ── List view ──────────────────────────────────────────────── */

function LinkListView({ links, onAdd, onEdit, onMoveUp, onMoveDown }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Add button */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={onAdd}
          className="
            w-full flex items-center justify-center gap-2
            py-2.5 rounded-xl
            bg-accent/10 hover:bg-accent/20
            border border-accent/25 hover:border-accent/50
            text-accent font-medium text-sm
            transition-all duration-150 active:scale-[0.98]
          "
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Link
        </button>
      </div>

      {/* Link rows */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {links.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <ul className="space-y-1">
            {links.map((link, i) => (
              <LinkRow
                key={link.id}
                link={link}
                isFirst={i === 0}
                isLast={i === links.length - 1}
                onEdit={onEdit}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                delay={i * 30}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ── Single link row ────────────────────────────────────────── */

function LinkRow({ link, isFirst, isLast, onEdit, onMoveUp, onMoveDown, delay }) {
  const displayUrl = link.url
    ? link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null

  const displayName = link.name || link.url || 'Unnamed Link'

  function handleOpen(e) {
    e.stopPropagation()
    if (!link.url) return
    const href = /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <li
      className="flex items-center gap-1 group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Reorder arrows — tight column on the left */}
      <div className="flex flex-col flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        <button
          onClick={() => onMoveUp(link.id)}
          disabled={isFirst}
          className="p-0.5 rounded text-text-faint hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Move link up"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button
          onClick={() => onMoveDown(link.id)}
          disabled={isLast}
          className="p-0.5 rounded text-text-faint hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Move link down"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Main clickable row */}
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-elevated transition-all duration-100 min-w-0 cursor-pointer"
        onClick={() => onEdit(link.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onEdit(link.id)}
      >
        {/* Link icon — favicon with letter fallback */}
        <LinkIcon name={link.name} url={link.url} size={28} />

        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-medium leading-tight truncate group-hover:text-accent transition-colors">
            {displayName}
          </p>
          {displayUrl && (
            <p className="text-text-faint text-xs truncate mt-0.5">{displayUrl}</p>
          )}
        </div>
      </div>

      {/* Open in new tab button — always visible */}
      <button
        onClick={handleOpen}
        disabled={!link.url}
        className="icon-btn flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        title={`Open ${displayName} in new tab`}
        aria-label={`Open ${displayName} in new tab`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>
    </li>
  )
}

/* ── Empty state ────────────────────────────────────────────── */

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
      <p className="text-text-muted font-medium text-sm mb-1">No links yet</p>
      <p className="text-text-faint text-xs leading-relaxed mb-5">
        Add your favourite sites — saved locally, one click to open.
      </p>
      <button onClick={onAdd} className="btn-primary text-xs py-2 px-4">
        Add your first link
      </button>
    </div>
  )
}

/* ── Edit view ──────────────────────────────────────────────── */

function LinkEditView({ link, onUpdate, onDelete, onBack }) {
  const [name, setName]             = useState(link.name)
  const [url, setUrl]               = useState(link.url)
  const [confirmDelete, setConfirm] = useState(false)
  const [urlError, setUrlError]     = useState('')
  const nameRef = useRef(null)

  // Sync fields if a different link is opened while edit view is mounted
  useEffect(() => {
    setName(link.name)
    setUrl(link.url)
    setConfirm(false)
    setUrlError('')
  }, [link.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus name input on mount
  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 350)
    return () => clearTimeout(t)
  }, [link.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save helpers ───────────────────────────────────────────

  const save = useCallback(() => {
    // Normalise URL: prepend https:// if no scheme given
    let normUrl = url.trim()
    if (normUrl && !/^https?:\/\//i.test(normUrl)) {
      normUrl = `https://${normUrl}`
    }

    // Basic URL validation (only if non-empty)
    if (normUrl) {
      try { new URL(normUrl) }
      catch { setUrlError('Enter a valid URL (e.g. https://example.com)'); return false }
    }

    onUpdate(link.id, { name: name.trim(), url: normUrl })
    setUrl(normUrl)
    setUrlError('')
    return true
  }, [link.id, name, url, onUpdate])

  function handleSaveAndBack() {
    if (save()) onBack()
  }

  function handleUrlBlur() {
    // Auto-normalise on blur without blocking navigation
    let normUrl = url.trim()
    if (normUrl && !/^https?:\/\//i.test(normUrl)) {
      normUrl = `https://${normUrl}`
      setUrl(normUrl)
    }
    if (normUrl) {
      try { new URL(normUrl); setUrlError('') }
      catch { setUrlError('Enter a valid URL (e.g. https://example.com)') }
    } else {
      setUrlError('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onBack()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" onKeyDown={handleKeyDown}>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Name field */}
        <div>
          <label className="widget-title block mb-1.5">Label</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onUpdate(link.id, { name: name.trim() })}
            placeholder="e.g. GitHub, Gmail, My Portfolio…"
            maxLength={80}
            className="
              w-full px-3 py-2.5 rounded-xl
              bg-surface-elevated border border-surface-border
              text-text-primary text-sm placeholder:text-text-faint
              focus:outline-none focus:border-accent/60 focus:ring-accent-glow
              transition-colors duration-150
            "
            aria-label="Link label"
          />
        </div>

        {/* URL field */}
        <div>
          <label className="widget-title block mb-1.5">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
            onBlur={handleUrlBlur}
            placeholder="https://example.com"
            maxLength={512}
            className={`
              w-full px-3 py-2.5 rounded-xl
              bg-surface-elevated border
              text-text-primary text-sm placeholder:text-text-faint
              focus:outline-none focus:ring-accent-glow
              transition-colors duration-150
              ${urlError ? 'border-negative/60' : 'border-surface-border focus:border-accent/60'}
            `}
            aria-label="Link URL"
            aria-describedby={urlError ? 'url-error' : undefined}
          />
          {urlError && (
            <p id="url-error" className="text-negative text-xs mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {urlError}
            </p>
          )}
        </div>

        {/* Preview open */}
        {url && !urlError && (
          <button
            onClick={() => {
              const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
              window.open(href, '_blank', 'noopener,noreferrer')
            }}
            className="
              flex items-center gap-2 text-xs text-text-muted
              hover:text-accent transition-colors duration-150
            "
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Test link — opens in new tab
          </button>
        )}
      </div>

      {/* ── Bottom toolbar ─────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-surface-border px-4 py-3 space-y-2">
        {/* Save & back */}
        <button onClick={handleSaveAndBack} className="btn-primary w-full justify-center text-xs py-2">
          Save & back to list
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-text-faint hover:text-negative transition-colors duration-150 w-full"
          >
            <TrashIcon />
            Delete link
          </button>
        ) : (
          <div className="flex items-center justify-between gap-3 animate-fade-in">
            <p className="text-xs text-negative font-medium flex items-center gap-1.5 flex-shrink-0">
              <WarnIcon />
              Delete this link?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirm(false)} className="btn-ghost text-xs py-1 px-3">Cancel</button>
              <button onClick={() => onDelete(link.id)} className="btn-danger text-xs py-1 px-3">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Inline SVG micro-icons ─────────────────────────────────── */

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
