<div align="center">

# RyuenxHub

**A clean, single-page personal dashboard — live weather, crypto prices, and local notes. All free APIs. No backend. No login.**

[![MIT License](https://img.shields.io/badge/license-MIT-7c6ff7?style=flat-square)](./LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)

<!-- Replace with your own screenshot or GIF after first deploy -->
<!-- ![RyuenxHub Dashboard Screenshot](./public/screenshot-placeholder.png) -->

[**Live Demo →**](https://ryuenx-hub.vercel.app) &nbsp;·&nbsp; [Report a Bug](https://github.com/Vansh-Coder399/ryuenxHub/issues) &nbsp;·&nbsp; [Request a Feature](https://github.com/Vansh-Coder399/ryuenxHub/issues)

</div>

---

## ✨ Features

| Widget | What it does |
|---|---|
| 🌤 **Weather** | Detects your location via GPS (falls back to IP if denied), fetches live conditions from Open-Meteo — temperature, feels-like, humidity, wind speed, condition icon |
| 💰 **Crypto Prices** | Pulls BTC, ETH, SOL, DOGE, ADA from CoinGecko's free public API; shows USD price + 24 h % change; auto-refreshes every 60 s; shows "stale" indicator instead of crashing on rate-limits |
| 📝 **Notes** | Slide-in sidebar panel with full CRUD — create, edit, rename, delete (with confirmation); persisted entirely in `localStorage`; no account needed |
| 🕐 **Live Clock** | Real-time HH:MM clock + date in the header |

**Zero cost to run:**
- No backend server
- No database
- No paid APIs or billing
- No user accounts or login

---

## 🖥 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev) + functional components + hooks |
| Build tool | [Vite 5](https://vitejs.dev) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) with a custom dark design system |
| Weather API | [Open-Meteo](https://open-meteo.com) — free, no API key |
| Location fallback | [ipapi.co](https://ipapi.co) — IP geolocation, free, no key |
| Reverse geocoding | [Nominatim](https://nominatim.openstreetmap.org) (OpenStreetMap) |
| Crypto API | [CoinGecko](https://www.coingecko.com/en/api) `/simple/price` — free public endpoint |
| Persistence | Browser `localStorage` (Notes) |
| Deploy target | [Vercel](https://vercel.com) — static frontend |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18 (LTS recommended)
- npm ≥ 9

### Install & run locally

```bash
# 1. Clone the repo
git clone https://github.com/Vansh-Coder399/ryuenxHub.git
cd ryuenxhub

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note on geolocation:** the browser will ask for location permission on first load.
> Allow it for the most accurate weather, or deny it — the app will fall back to IP-based location automatically.

### Build for production

```bash
npm run build       # outputs to ./dist/
npm run preview     # preview the production build locally
```

---

## ☁️ Deploy to Vercel

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryuenx/ryuenxhub)

**Manual deploy:**

1. Push your repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite — no extra config needed
4. Hit **Deploy** — done

No environment variables are required for v1.

---

## 📁 Project Structure

```
ryuenxhub/
├── public/
│   └── favicon.svg
├── src/
│   ├── hooks/
│   │   ├── useWeather.js    # GPS → IP fallback → Open-Meteo fetch logic
│   │   ├── useCrypto.js     # CoinGecko polling, 429 handling, formatters
│   │   └── useNotes.js      # localStorage CRUD for notes
│   ├── components/
│   │   ├── Sidebar.jsx      # Left icon rail
│   │   ├── WeatherWidget.jsx
│   │   ├── WeatherIcon.jsx  # Inline SVG condition icons (9 conditions)
│   │   ├── CryptoWidget.jsx
│   │   ├── CoinIcon.jsx     # Branded coin avatar circles
│   │   └── NotesPanel.jsx   # Slide-in notes panel (list + edit views)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Tailwind directives + design system tokens
├── index.html
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
└── package.json
```

---

## 🗺 Roadmap

These features are explicitly **not** in v1 — they'll be explored after the initial launch:

- **Stocks / Gold widget** — evaluating free-tier reliability (Alpha Vantage, Twelve Data)
- **Multi-device notes sync** — needs a backend + database; only justified if users request it
- **Customisable widget layout** — drag-and-drop, show/hide widgets
- **Light / dark mode toggle** + custom accent colours
- **Music player** — revisiting once a legally clean free-tier API is identified
- **"Deploy to Vercel" one-click button** in README for forks
- **Additional widgets**: to-do list, calendar, RSS/news feed

See [PRD.md](./PRD.md) for the full product spec and reasoning behind scope decisions.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

Please keep PRs small and focused. If you're adding a new widget, open an issue first to discuss the API/approach — especially around rate limits and free-tier constraints.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

---

## 📄 License

[MIT](./LICENSE) — free to use, fork, and self-host.

---

<div align="center">

Built by **[Vansh Tiwari (Ryuenx)](https://github.com/ryuenx)** · Give it a ⭐ if you find it useful!

</div>
