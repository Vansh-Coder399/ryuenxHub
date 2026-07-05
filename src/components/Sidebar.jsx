/**
 * Sidebar — narrow left icon rail.
 * Receives notesOpen so it can highlight the Notes button when active.
 */
export default function Sidebar({ onOpenNotes, notesOpen }) {
  return (
    <aside
      className="
        flex flex-col items-center gap-2
        w-14 sm:w-16
        bg-surface-card border-r border-surface-border
        py-4 px-1.5
        z-10 flex-shrink-0
      "
    >
      {/* Logo mark */}
      <div
        className="
          w-9 h-9 rounded-xl bg-accent flex items-center justify-center
          shadow-glow mb-1 select-none flex-shrink-0
        "
        title="RyuenxHub"
        aria-label="RyuenxHub"
      >
        <span className="text-white font-bold text-sm leading-none">R</span>
      </div>

      {/* Divider */}
      <div className="w-7 h-px bg-surface-border flex-shrink-0" />

      {/* Notes trigger — highlights when panel is open */}
      <SidebarButton
        onClick={onOpenNotes}
        title="Notes"
        active={notesOpen}
      >
        <NoteIcon />
      </SidebarButton>

      {/* Spacer */}
      <div className="flex-1" />

      {/* GitHub */}
      <a
        href="https://github.com/ryuenx"
        target="_blank"
        rel="noopener noreferrer"
        className="icon-btn"
        title="GitHub — @ryuenx"
        aria-label="GitHub profile"
      >
        <GitHubIcon />
      </a>
    </aside>
  )
}

/* ── Sidebar icon button ────────────────────────────────────── */
function SidebarButton({ onClick, title, active, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex flex-col items-center gap-1
        w-full py-2 px-1 rounded-xl
        transition-all duration-150 active:scale-95
        ${active
          ? 'text-accent bg-accent/15 border border-accent/30'
          : 'text-text-muted hover:text-accent hover:bg-accent/10 border border-transparent'}
      `}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      <span className="w-5 h-5 flex-shrink-0">{children}</span>
      <span className="
        text-[9px] font-semibold tracking-widest uppercase
        opacity-60 group-hover:opacity-100 transition-opacity leading-none
      ">
        {title}
      </span>
    </button>
  )
}

/* ── SVG icons ──────────────────────────────────────────────── */
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}
