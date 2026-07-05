/**
 * WeatherIcon — renders an inline SVG weather icon based on
 * a condition key returned by describeWeatherCode().
 *
 * Condition keys accepted:
 *   clear | partly_cloudy | cloudy | fog |
 *   drizzle | rain | snow | shower | thunderstorm
 *
 * No external icon library — keeps the bundle lean and lets
 * icons match the app's exact color tokens.
 */
export default function WeatherIcon({ condition, size = 56, className = '' }) {
  const icons = {
    clear:         <ClearIcon />,
    partly_cloudy: <PartlyCloudyIcon />,
    cloudy:        <CloudyIcon />,
    fog:           <FogIcon />,
    drizzle:       <DrizzleIcon />,
    rain:          <RainIcon />,
    snow:          <SnowIcon />,
    shower:        <ShowerIcon />,
    thunderstorm:  <ThunderstormIcon />,
  }

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {icons[condition] ?? icons.clear}
    </span>
  )
}

/* ── Shared SVG wrapper ─────────────────────────────────── */
function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {children}
    </svg>
  )
}

/* ── Individual icon designs ────────────────────────────── */

function ClearIcon() {
  return (
    <Icon>
      {/* Sun circle */}
      <circle cx="32" cy="32" r="12" fill="#FCD34D" />
      {/* Rays */}
      {[0,45,90,135,180,225,270,315].map((deg) => (
        <line
          key={deg}
          x1="32" y1="32"
          x2={32 + 22 * Math.cos((deg * Math.PI) / 180)}
          y2={32 + 22 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FCD34D"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </Icon>
  )
}

function PartlyCloudyIcon() {
  return (
    <Icon>
      {/* Sun — offset up-right */}
      <circle cx="38" cy="22" r="9" fill="#FCD34D" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="38" y1="22"
          x2={38 + 16 * Math.cos((deg * Math.PI) / 180)}
          y2={22 + 16 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FCD34D"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      {/* Cloud */}
      <path
        d="M14 44c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 44 42a7 7 0 0 1-7 7H18a4 4 0 0 1-4-5z"
        fill="#94A3B8"
        opacity="0.9"
      />
    </Icon>
  )
}

function CloudyIcon() {
  return (
    <Icon>
      {/* Back cloud */}
      <path
        d="M20 38c0-6.627 5.373-12 12-12a11.95 11.95 0 0 1 7 2.25A8 8 0 0 1 52 36a8 8 0 0 1-8 8H24a4 4 0 0 1-4-6z"
        fill="#64748B"
        opacity="0.5"
      />
      {/* Front cloud */}
      <path
        d="M10 44c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 40 42a7 7 0 0 1-7 7H14a4 4 0 0 1-4-5z"
        fill="#94A3B8"
      />
    </Icon>
  )
}

function FogIcon() {
  return (
    <Icon>
      {/* Cloud top */}
      <path
        d="M16 28c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 46 26a7 7 0 0 1-7 7H20a4 4 0 0 1-4-5z"
        fill="#94A3B8"
        opacity="0.7"
      />
      {/* Fog lines */}
      {[38, 44, 50].map((y) => (
        <line
          key={y}
          x1="12" y1={y} x2="52" y2={y}
          stroke="#94A3B8"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}
    </Icon>
  )
}

function DrizzleIcon() {
  return (
    <Icon>
      {/* Cloud */}
      <path
        d="M14 30c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 44 28a7 7 0 0 1-7 7H18a4 4 0 0 1-4-5z"
        fill="#94A3B8"
      />
      {/* Light drops */}
      {[[22,42],[32,46],[42,42]].map(([x,y],i) => (
        <line
          key={i}
          x1={x} y1={y} x2={x-2} y2={y+8}
          stroke="#60A5FA"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}
    </Icon>
  )
}

function RainIcon() {
  return (
    <Icon>
      {/* Cloud */}
      <path
        d="M12 28c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 46 26a7 7 0 0 1-7 7H16a4 4 0 0 1-4-5z"
        fill="#64748B"
      />
      {/* Rain drops — 5 drops */}
      {[[18,42],[26,38],[34,42],[42,38],[26,50]].map(([x,y],i) => (
        <line
          key={i}
          x1={x} y1={y} x2={x-3} y2={y+10}
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
    </Icon>
  )
}

function SnowIcon() {
  return (
    <Icon>
      {/* Cloud */}
      <path
        d="M12 26c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 46 24a7 7 0 0 1-7 7H16a4 4 0 0 1-4-5z"
        fill="#94A3B8"
      />
      {/* Snowflakes (simple asterisks) */}
      {[[20,44],[32,48],[44,44],[26,54]].map(([cx,cy],i) => (
        <g key={i}>
          <line x1={cx} y1={cy-5} x2={cx} y2={cy+5} stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={cx-4} y1={cy-4} x2={cx+4} y2={cy+4} stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={cx+4} y1={cy-4} x2={cx-4} y2={cy+4} stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </Icon>
  )
}

function ShowerIcon() {
  return (
    <Icon>
      {/* Sun peaking behind */}
      <circle cx="42" cy="18" r="8" fill="#FCD34D" opacity="0.7" />
      {/* Cloud */}
      <path
        d="M10 34c0-5.523 4.477-10 10-10a9.96 9.96 0 0 1 6.32 2.246A7 7 0 0 1 44 32a7 7 0 0 1-7 7H14a4 4 0 0 1-4-5z"
        fill="#94A3B8"
      />
      {/* Drops */}
      {[[18,46],[28,42],[38,46]].map(([x,y],i) => (
        <line
          key={i}
          x1={x} y1={y} x2={x-3} y2={y+10}
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
    </Icon>
  )
}

function ThunderstormIcon() {
  return (
    <Icon>
      {/* Dark cloud */}
      <path
        d="M10 28c0-6.627 5.373-12 12-12a11.95 11.95 0 0 1 7 2.25A8 8 0 0 1 50 26a8 8 0 0 1-8 8H14a4 4 0 0 1-4-6z"
        fill="#475569"
      />
      {/* Lightning bolt */}
      <polyline
        points="34,38 28,50 32,50 26,62"
        stroke="#FDE047"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rain drop */}
      <line x1="18" y1="44" x2="15" y2="54" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <line x1="46" y1="44" x2="43" y2="54" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </Icon>
  )
}
