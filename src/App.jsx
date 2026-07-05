import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import WeatherWidget from './components/WeatherWidget'
import CryptoWidget from './components/CryptoWidget'
import NotesPanel from './components/NotesPanel'

/**
 * App — root shell.
 * Owns notes-panel open/close state; passes it down to Sidebar + NotesPanel.
 */
export default function App() {
  const [notesOpen, setNotesOpen] = useState(false)

  // Close panel on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setNotesOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh bg-surface">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar
        onOpenNotes={() => setNotesOpen(true)}
        notesOpen={notesOpen}
      />

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-tight">
              RyuenxHub
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Your personal dashboard
            </p>
          </div>
          <Clock />
        </header>

        {/* ── Widget grid ──────────────────────────────────────
            • xs / mobile  : single-column stack
            • md+          : each widget still full-width (both span 2 cols)
                             — keeps the cards readable at any viewport width
        ──────────────────────────────────────────────────── */}
        <section className="flex-1 flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 pt-3 pb-4">
          <WeatherWidget />
          <CryptoWidget />
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 pb-4 text-center text-xs text-text-faint safe-bottom">
          Built by{' '}
          <span className="text-accent font-medium">Vansh Tiwari (Ryuenx)</span>
        </footer>
      </main>

      {/* ── Notes panel ─────────────────────────────────────── */}
      <NotesPanel isOpen={notesOpen} onClose={() => setNotesOpen(false)} />

      {/* Backdrop — covers full screen on all viewports when panel is open */}
      {notesOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setNotesOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

/* ── Clock — live HH:MM display ────────────────────────────── */
function Clock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hhmm = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date  = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="text-right flex-shrink-0">
      <p className="tabular text-lg sm:text-xl font-semibold text-text-primary leading-tight">
        {hhmm}
      </p>
      <p className="text-[10px] sm:text-xs text-text-muted">{date}</p>
    </div>
  )
}
