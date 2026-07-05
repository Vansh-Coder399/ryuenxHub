import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ryuenxhub_notes'

// ─────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    // Corrupted data — start fresh rather than crashing
    console.warn('[useNotes] Failed to parse localStorage notes; resetting.')
    return []
  }
}

function persistNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch (e) {
    // Storage quota exceeded or private-browsing restriction
    console.warn('[useNotes] Could not persist notes:', e.message)
  }
}

// ─────────────────────────────────────────────────────────────
// ID generator — no external lib needed
// ─────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/**
 * useNotes — manages a list of notes stored in browser localStorage.
 *
 * Note shape:
 *   { id: string, title: string, content: string,
 *     createdAt: string (ISO), updatedAt: string (ISO) }
 *
 * All mutations write-through to localStorage immediately.
 *
 * Returned API:
 *   notes         — current list, sorted newest-updated first
 *   createNote()  — creates a blank note, returns its id
 *   updateContent(id, content) — saves body text
 *   renameTitle(id, title)     — saves title
 *   deleteNote(id)             — removes the note
 */
export function useNotes() {
  // Initialise from localStorage once on mount
  const [notes, setNotes] = useState(() => loadNotes())

  // Internal helper: apply an updater fn to the array and persist
  const commit = useCallback((updater) => {
    setNotes((prev) => {
      const next = updater(prev)
      persistNotes(next)
      return next
    })
  }, [])

  // ── CRUD ────────────────────────────────────────────────────

  const createNote = useCallback(() => {
    const id  = generateId()
    const now = new Date().toISOString()
    const note = {
      id,
      title:     'Untitled Note',
      content:   '',
      createdAt: now,
      updatedAt: now,
    }
    commit((prev) => [note, ...prev])
    return id
  }, [commit])

  const updateContent = useCallback((id, content) => {
    commit((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, content, updatedAt: new Date().toISOString() }
          : n,
      ),
    )
  }, [commit])

  const renameTitle = useCallback((id, title) => {
    const trimmed = title.trim() || 'Untitled Note'
    commit((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title: trimmed, updatedAt: new Date().toISOString() }
          : n,
      ),
    )
  }, [commit])

  const deleteNote = useCallback((id) => {
    commit((prev) => prev.filter((n) => n.id !== id))
  }, [commit])

  // Sort by updatedAt descending so the most-recently-edited note is always first
  const sorted = [...notes].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  )

  return { notes: sorted, createNote, updateContent, renameTitle, deleteNote }
}
