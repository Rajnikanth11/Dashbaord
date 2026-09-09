# Gyaanix Learning Dashboard

Schools → Classes → Subjects → Topics drill-down dashboard, with a small
Node/WebSocket layer so progress and activity are pushed live to every
connected browser instead of being faked with a random array.

## Setup

```bash
npm install
npm start
```

Then open `http://localhost:3000`. Open it in two tabs to see the real-time
sync: click a topic, hit "Simulate progress (+10%)" in one tab, and watch
the progress bar update in the other tab without a refresh.

## Structure

- `server.js` — Express static file server + `ws` WebSocket server. Holds
  in-memory `state` (online count, per-topic progress, activity log) and
  broadcasts changes to every connected client. A background interval
  simulates presence drift and student activity so the feed isn't empty on
  a fresh install — swap that interval for real event sources (student
  check-ins, LMS webhooks, etc.) when wiring this to production data.
- `public/index.html` — page shell: header (search, online badge, activity
  toggle, theme toggle), breadcrumb, card grid, activity panel, topic modal.
- `public/css/styles.css` — all styling, light/dark theme via CSS variables.
- `public/js/data.js` — static content data (schools/classes/subjects,
  topic lists, PhET-style simulation metadata). Replace with an API call if
  this content should come from a CMS/database instead.
- `public/js/app.js` — drill-down rendering, topic modal, and the
  WebSocket client that applies `presence`/`progress`/`activity` messages
  as they arrive and can push a `progress-update` back to the server.
- `public/sims/` — self-contained PhET simulation HTML files, served as
  static assets. `SIM_FILES` in `data.js` maps a sim's slug to its file
  here; only slugs listed there get a working "Open simulation" button —
  everything else in `SIMS` is metadata-only until a file is added.

## Adding a simulation

1. Drop the self-contained simulation HTML file into `public/sims/`.
2. Add its slug → path in `SIM_FILES` (`public/js/data.js`).
3. Make sure the same slug/title exists in `SIMS` and its `subjects` match
   a subject actually taught in `SCHOOL_DATA`, so it shows up as a topic.

Clicking a topic with a bundled file opens it full-screen via `<iframe>`
(see `openSimulation` in `app.js`); topics without one still show the
placeholder message so the gap is obvious rather than silently broken.

## WebSocket message contract

Server → client:
- `{ type: "snapshot", online, progress, activity }` — sent once on connect.
- `{ type: "presence", online }`
- `{ type: "progress", key, progress }`
- `{ type: "activity", item: { text, ts } }`

Client → server:
- `{ type: "progress-update", key, delta, base, label }`

`key` is a stable string built from the school/class/subject/topic path, so
progress survives re-renders and is shared across every tab connected to
the same server process.

## Known limitations / next steps

- State is in-memory only — it resets when the server restarts. For a real
  deployment, back `state` with Redis or a database and use Redis pub/sub
  (or similar) to fan out updates if you run more than one server process.
- The simulated background activity (`setInterval` in `server.js`) is a
  stand-in for real student/telemetry events — remove it once a real event
  source is wired in.
- "Open simulation" / "Open resources" in the topic modal are placeholders;
  wire them to real lesson content or an embedded simulation player.
