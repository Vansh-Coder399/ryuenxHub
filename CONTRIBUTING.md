# Contributing to RyuenxHub

Thanks for taking the time to contribute! 🎉

RyuenxHub is an open-source personal dashboard built to be genuinely useful and easy to extend. The goal is to keep it lightweight — no backend, no paid APIs, no unnecessary dependencies.

---

## Ground Rules

- **Free APIs only.** Any new widget must use a free, no-key-required (or free-tier, no-billing) public API. If an API requires a paid plan to be practical, it goes to the roadmap, not a PR.
- **No backend.** v1 is a static frontend. If a feature genuinely needs a server, open an issue to discuss it first.
- **Small, focused PRs.** One feature or fix per PR makes review much faster.
- **Functional components + hooks.** No class components. New data sources get their own custom hook (`useXxx.js` in `src/hooks/`).

---

## Development Setup

```bash
git clone https://github.com/Vansh-Coder399/ryuenxHub.git
cd ryuenxhub
npm install
npm run dev          # http://localhost:5173
```

---

## Adding a New Widget

1. Create `src/hooks/useYourWidget.js` — put all fetch/state logic here, keep the component dumb.
2. Create `src/components/YourWidget.jsx` — import the hook, handle loading / error / success states explicitly.
3. Drop it into the grid in `src/App.jsx`.
4. Add it to the feature table in `README.md`.

---

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new widget
fix: handle API timeout gracefully
style: tighten spacing on mobile
docs: update README screenshot
```

---

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Browser + OS
- Any console errors

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
