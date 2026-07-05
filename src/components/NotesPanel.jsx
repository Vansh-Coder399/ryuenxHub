import { useState, useEffect, useRef, useCallback } from 'react'
import { useNotes } from '../hooks/useNotes'

/**
 * NotesPanel — slide-in notes sidebar.
 *
 * Internal views:
 *   'list'  — shows all notes sorted by last-updated, + New Note CTA
 *   'edit'  — single-note editor: editable title, auto-saving textarea, delete
 *
 * Persistence: entirely via useNotes → localStorage (no network, no backend).
 */
export default function NotesPanel({ isOpen, onClose }) {
  const { notes, createNote, updateContent, renameTitle, deleteNote } = useNotes()

  const [view, setView]       = useState('list')   // 'list' | 'edit'
  const [activeId, setActiveId] = useState(null)

  // Reset back to list view when the panel is closed (after slide-out animation)
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setView('list')
        setActiveId(null)
      }, 320) // matches the CSS transition duration
      return () => clearTimeout(t)
    }
  }, [isOpen])

  function handleNewNote() {
    const id = createNote()
    setActiveId(id)
    setView('edit')
  }

  function handleOpenNote(id) {
    setActiveId(id)
    setView('edit')
  }

  function handleBack() {
    setView('list')
    setActiveId(null)
  }

  function handleDelete(id) {
    deleteNote(id)
    handleBack()
  }

  const activeNote = notes.find((n) => n.id === activeId) ?? null

  // If the active note disappeared from under us (e.g. storage cleared
  // externally) fall back to list gracefully.
  useEffect(() => {
    if (view === 'edit' && activeId && !activeNote) {
      handleBack()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote, view, activeId])

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
      aria-label="Notes panel"
      role="complementary"
    >
      {/* ── Panel header ──────────────────────────────────── */}
      <PanelHeader
        view={view}
        noteTitle={activeNote?.title}
        noteCount={notes.length}
        onClose={onClose}
        onBack={handleBack}
      />

      {/* ── Views ─────────────────────────────────────────── */}
      {view === 'list' && (
        <NoteListView
          notes={notes}
          onNew={handleNewNote}
          onOpen={handleOpenNote}
        />
      )}

      {view === 'edit' && activeNote && (
        <NoteEditView
          note={activeNote}
          onUpdateContent={updateContent}
          onRenameTitle={renameTitle}
          onDelete={handleDelete}
        />
      )}
    </aside>
  )
}

/* ── Panel header ───────────────────────────────────────────── */

function PanelHeader({ view, noteTitle, noteCount, onClose, onBack }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Back arrow in edit view */}
        {view === 'edit' && (
          <button
            onClick={onBack}
            className="icon-btn -ml-1 flex-shrink-0"
            aria-label="Back to notes list"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Icon */}
        {view === 'list' && (
          <svg className="w-4 h-4 text-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )}

        <h2 className="font-semibold text-text-primary text-sm truncate">
          {view === 'list' ? 'Notes' : (noteTitle || 'Untitled Note')}
        </h2>

        {/* Note count badge in list view */}
        {view === 'list' && noteCount > 0 && (
          <span className="badge bg-surface-elevated text-text-faint text-[10px]">
            {noteCount}
          </span>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="icon-btn flex-shrink-0"
        aria-label="Close notes panel"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

/* ── List view ──────────────────────────────────────────────── */

function NoteListView({ notes, onNew, onOpen }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* New note button */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={onNew}
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
          New Note
        </button>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {notes.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <ul className="space-y-1">
            {notes.map((note, i) => (
              <NoteRow
                key={note.id}
                note={note}
                onOpen={onOpen}
                delay={i * 30}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ── Single note row in list ────────────────────────────────── */

function NoteRow({ note, onOpen, delay }) {
  const preview = note.content
    ? note.content.replace(/\s+/g, ' ').trim().slice(0, 60)
    : null

  return (
    <li>
      <button
        onClick={() => onOpen(note.id)}
        className="
          w-full text-left px-3 py-2.5 rounded-xl
          hover:bg-surface-elevated
          active:scale-[0.99]
          transition-all duration-100
          group animate-fade-in
        "
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-text-primary text-sm font-medium leading-snug truncate group-hover:text-accent transition-colors">
            {note.title || 'Untitled Note'}
          </p>
          <span className="text-[10px] text-text-faint flex-shrink-0 mt-0.5 tabular">
            {formatTimestamp(note.updatedAt)}
          </span>
        </div>

        {preview && (
          <p className="text-text-faint text-xs mt-0.5 truncate leading-relaxed">
            {preview}
          </p>
        )}

        {!preview && (
          <p className="text-text-faint text-xs mt-0.5 italic opacity-60">
            No content yet
          </p>
        )}
      </button>
    </li>
  )
}

/* ── Empty state ────────────────────────────────────────────── */

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <p className="text-text-muted font-medium text-sm mb-1">No notes yet</p>
      <p className="text-text-faint text-xs leading-relaxed mb-5">
        Jot down anything — saved locally in your browser, no account needed.
      </p>
      <button onClick={onNew} className="btn-primary text-xs py-2 px-4">
        Create your first note
      </button>
    </div>
  )
}

/* ── Edit view ──────────────────────────────────────────────── */

function NoteEditView({ note, onUpdateContent, onRenameTitle, onDelete }) {
  // Local state mirrors the note so the UI is responsive without
  // waiting for the localStorage round-trip on every keystroke.
  const [title, setTitle]     = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Refs for debounced content save (avoids spamming localStorage on each key)
  const contentDebounce = useRef(null)
  const textareaRef     = useRef(null)

  // Sync local state if a different note is opened while edit view is mounted
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setConfirmDelete(false)
  }, [note.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-grow textarea to fit content
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

  // Focus textarea on mount for immediate typing
  useEffect(() => {
    if (note.content === '') {
      // Short delay lets the slide-in animation settle first
      const t = setTimeout(() => textareaRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [note.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────

  const handleContentChange = useCallback((e) => {
    const val = e.target.value
    setContent(val)
    // Debounce localStorage writes — 400 ms after last keystroke
    clearTimeout(contentDebounce.current)
    contentDebounce.current = setTimeout(() => {
      onUpdateContent(note.id, val)
    }, 400)
  }, [note.id, onUpdateContent])

  // Flush immediately on unmount so no edits are lost
  useEffect(() => {
    return () => {
      clearTimeout(contentDebounce.current)
      // We persist the current `content` ref value, not the stale closure
      // value — so we read it from the textarea DOM element directly.
      if (textareaRef.current) {
        onUpdateContent(note.id, textareaRef.current.value)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])

  const handleTitleChange = (e) => setTitle(e.target.value)

  const handleTitleBlur = () => {
    onRenameTitle(note.id, title)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onRenameTitle(note.id, title)
      textareaRef.current?.focus()
    }
    if (e.key === 'Escape') {
      // Revert local title to saved title on Escape
      setTitle(note.title)
      e.target.blur()
    }
  }

  const handleDeleteClick = () => setConfirmDelete(true)
  const handleCancelDelete = () => setConfirmDelete(false)
  const handleConfirmDelete = () => onDelete(note.id)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editable title */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled Note"
          className="
            w-full bg-transparent
            text-text-primary font-semibold text-base
            placeholder:text-text-faint
            outline-none border-none
            border-b border-transparent
            focus:border-accent/40
            transition-colors duration-150
            pb-1
          "
          aria-label="Note title"
          maxLength={120}
        />
        <p className="text-[10px] text-text-faint mt-1 tabular">
          Last updated {formatTimestamp(note.updatedAt)}
        </p>
      </div>

      {/* Content textarea — grows to fill available space */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          className="
            w-full min-h-full resize-none bg-transparent
            text-text-primary text-sm leading-relaxed
            placeholder:text-text-faint
            outline-none border-none
            py-2
          "
          style={{ minHeight: '200px' }}
          aria-label="Note content"
          spellCheck
        />
      </div>

      {/* ── Bottom toolbar ─────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-surface-border px-4 py-3">
        {!confirmDelete ? (
          /* Normal state — just the delete trigger */
          <button
            onClick={handleDeleteClick}
            className="
              flex items-center gap-1.5 text-xs text-text-faint
              hover:text-negative transition-colors duration-150
            "
            aria-label="Delete this note"
          >
            <TrashIcon />
            Delete note
          </button>
        ) : (
          /* Confirmation step — prevents accidental deletion */
          <div className="flex items-center justify-between gap-3 animate-fade-in">
            <p className="text-xs text-negative font-medium flex items-center gap-1.5">
              <WarnIcon />
              Delete this note?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelDelete}
                className="btn-ghost text-xs py-1 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger text-xs py-1 px-3"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Timestamp formatter ────────────────────────────────────── */

/**
 * Returns a compact relative or absolute timestamp string.
 * Examples: "just now", "5 min ago", "3h ago", "Yesterday", "Jun 28"
 */
function formatTimestamp(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const secs  = Math.floor((Date.now() - date.getTime()) / 1000)

  if (secs < 30)  return 'just now'
  if (secs < 60)  return `${secs}s ago`

  const mins = Math.floor(secs / 60)
  if (mins < 60)  return `${mins} min ago`

  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`

  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days} days ago`

  // Older than a week — show a short date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
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
