import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import WeatherWidget from './components/WeatherWidget'
import CryptoWidget from './components/CryptoWidget'
import NotesPanel from './components/NotesPanel'
import QuickLinksPanel from './components/QuickLinksPanel'
import QuickLinksBar from './components/QuickLinksBar'
import { useQuickLinks } from './hooks/useQuickLinks'

/**
 * App — root shell.
 * Owns open/close state for both slide-in panels (Notes + Quick Links).
 * Only one panel can be open at a time — opening one closes the other.
 */
export default function App() {
  const [notesOpen, setNotesOpen] = useState(false)
  const [linksOpen, setLinksOpen] = useState(false)

  // Single shared instance — both QuickLinksBar and QuickLinksPanel
  // receive this same state, so mutations in the panel instantly
  // reflect in the bar without a page refresh.
  const quickLinks = useQuickLinks()

  // Close whichever panel is open on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setNotesOpen(false)
        setLinksOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openNotes() {
    setLinksOpen(false)
    setNotesOpen(true)
  }

  function openLinks() {
    setNotesOpen(false)
    setLinksOpen(true)
  }

  const anyOpen = notesOpen || linksOpen

  return (
    <div className="flex min-h-dvh bg-surface">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar
        onOpenNotes={openNotes}
        notesOpen={notesOpen}
        onOpenLinks={openLinks}
        linksOpen={linksOpen}
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

        {/* Widget stack */}
        <section className="flex-1 flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 pt-3 pb-4">
          <WeatherWidget />
          <CryptoWidget />
          <QuickLinksBar links={quickLinks.links} />
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 pb-4 text-center text-xs text-text-faint safe-bottom">
          Built by{' '}
          <span className="text-accent font-medium">Vansh Tiwari (Ryuenx)</span>
        </footer>
      </main>

      {/* ── Slide-in panels ─────────────────────────────────── */}
      <NotesPanel      isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <QuickLinksPanel isOpen={linksOpen}  onClose={() => setLinksOpen(false)} quickLinks={quickLinks} />

      {/* Backdrop — shared across both panels */}
      {anyOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => { setNotesOpen(false); setLinksOpen(false) }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

/* ── Clock ──────────────────────────────────────────────────── */
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
