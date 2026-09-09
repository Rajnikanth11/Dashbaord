const express = require("express");
const http = require("http");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ---------------------------------------------------------------------------
// In-memory "live" state. Swap this section for a real DB / message broker
// (Redis pub/sub, Postgres LISTEN/NOTIFY, etc.) without touching the client -
// the client only knows about the WebSocket message contract below.
// ---------------------------------------------------------------------------
const state = {
  online: 14,
  progress: {}, // topicKey -> 0-100
  activity: [], // { text, ts } newest first, capped
};

const SAMPLE_NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sara", "Ishaan", "Ananya", "Vihaan", "Priya"];
const SAMPLE_TOPICS = ["Fractions", "Forces & Motion", "Acids & Bases", "Waves", "Cell Structure", "Algebra", "States of Matter", "Graphs"];

function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

function pushActivity(text) {
  const item = { text, ts: Date.now() };
  state.activity.unshift(item);
  state.activity = state.activity.slice(0, 25);
  broadcast({ type: "activity", item });
}

// Simulated live traffic: presence drift + background activity feed.
// Replace this interval with real event sources (student check-ins,
// completed assignments, machine telemetry, etc.) in a production setup.
setInterval(() => {
  state.online = Math.max(3, state.online + (Math.random() > 0.5 ? 1 : -1));
  broadcast({ type: "presence", online: state.online });

  const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
  const topic = SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)];
  pushActivity(`${name} made progress on "${topic}"`);
}, 4000);

wss.on("connection", (ws) => {
  ws.send(
    JSON.stringify({
      type: "snapshot",
      online: state.online,
      progress: state.progress,
      activity: state.activity,
    })
  );

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "progress-update" && typeof msg.key === "string" && typeof msg.delta === "number") {
      const base = typeof msg.base === "number" ? msg.base : 0;
      const current = Object.prototype.hasOwnProperty.call(state.progress, msg.key) ? state.progress[msg.key] : base;
      const next = Math.min(100, Math.max(0, current + msg.delta));
      state.progress[msg.key] = next;
      broadcast({ type: "progress", key: msg.key, progress: next });
      if (typeof msg.label === "string") {
        pushActivity(`Progress on "${msg.label}" updated to ${next}%`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Gyaanix Learning Dashboard running at http://localhost:${PORT}`);
});
