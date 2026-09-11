# Atlas — Vite + React (JS) port

This is a plain Vite + React (JavaScript, not TypeScript) rebuild of the
original document, functionally identical pixel-for-pixel to the source:
same visual design, same sign-in screen, same search/threads/sources views,
same doc/thread detail panels, same upload/ask modals, and the same
client-side filtering/state logic.

## Structure

- `index.html` — Vite entry HTML (fonts + root div)
- `src/main.jsx` — React root
- `src/App.jsx` — the whole app (ported 1:1 from the original inline
  `Component` class / template)
- `src/data.js` — the static `DOCS` / `THREADS` / `PROJECTS` data
- `src/global.css` — global styles/keyframes from the original `<style>` block
- `src/lib/style.js`, `src/lib/El.jsx` — small helpers that let inline
  `"prop:value;..."` CSS strings (as used throughout the original markup)
  and hover/focus style variants be ported directly into React without
  hand-converting every declaration to a JS object

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```
