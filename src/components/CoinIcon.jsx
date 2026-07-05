/**
 * CoinIcon — a coloured circle avatar for each coin.
 *
 * Uses the coin's official brand colour as the background,
 * with the symbol text centered in white.
 * No external icon library needed — keeps the bundle tiny.
 *
 * Add new coin brand colours to COIN_COLORS when extending COINS list.
 */

const COIN_COLORS = {
  BTC:  { bg: '#F7931A', text: '#fff' },
  ETH:  { bg: '#627EEA', text: '#fff' },
  SOL:  { bg: '#9945FF', text: '#fff' },
  DOGE: { bg: '#C2A633', text: '#fff' },
  ADA:  { bg: '#2A5ADA', text: '#fff' },
  // Fallback for any future coin not listed above
  DEFAULT: { bg: '#4a5468', text: '#fff' },
}

export default function CoinIcon({ symbol, size = 36 }) {
  const { bg, text } = COIN_COLORS[symbol] ?? COIN_COLORS.DEFAULT

  // Shorten the label: show first 3 chars max so it fits in the circle
  const label = symbol.slice(0, 3)

  // Font size scales down for longer symbols (DOGE → smaller text)
  const fontSize = label.length <= 2 ? size * 0.35 : size * 0.28

  return (
    <span
      aria-label={symbol}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     bg,
        color:          text,
        fontFamily:     'Inter, system-ui, sans-serif',
        fontWeight:     700,
        fontSize,
        letterSpacing:  '-0.02em',
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {label}
    </span>
  )
}
