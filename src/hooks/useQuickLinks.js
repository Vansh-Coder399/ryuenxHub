import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ryuenxhub_quicklinks'

// ─────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    console.warn('[useQuickLinks] Failed to parse localStorage; resetting.')
    return []
  }
}

function persist(links) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
  } catch (e) {
    console.warn('[useQuickLinks] Could not persist:', e.message)
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/**
 * useQuickLinks — manages an ordered list of quick-links in localStorage.
 *
 * Link shape:
 *   { id: string, name: string, url: string, createdAt: string (ISO) }
 *
 * Order is explicit (array index) — no auto-sort, so up/down reorder works.
 *
 * Returned API:
 *   links           — current ordered array
 *   addLink()       — appends a blank link, returns its id
 *   updateLink(id, { name, url }) — partial update
 *   deleteLink(id)  — removes by id
 *   moveUp(id)      — swaps with previous item (no-op if already first)
 *   moveDown(id)    — swaps with next item (no-op if already last)
 */
export function useQuickLinks() {
  const [links, setLinks] = useState(() => load())

  const commit = useCallback((updater) => {
    setLinks((prev) => {
      const next = updater(prev)
      persist(next)
      return next
    })
  }, [])

  // ── CRUD ────────────────────────────────────────────────────

  const addLink = useCallback(() => {
    const id = generateId()
    const link = { id, name: '', url: '', createdAt: new Date().toISOString() }
    commit((prev) => [...prev, link])
    return id
  }, [commit])

  const updateLink = useCallback((id, fields) => {
    commit((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...fields } : l)),
    )
  }, [commit])

  const deleteLink = useCallback((id) => {
    commit((prev) => prev.filter((l) => l.id !== id))
  }, [commit])

  // ── Reorder ─────────────────────────────────────────────────

  const moveUp = useCallback((id) => {
    commit((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }, [commit])

  const moveDown = useCallback((id) => {
    commit((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      if (idx === -1 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }, [commit])

  return { links, addLink, updateLink, deleteLink, moveUp, moveDown }
}
