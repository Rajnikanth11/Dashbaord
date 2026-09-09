// Drill-down navigation state: path is [school, class, subject] as we go deeper.
let path = [];
let query = "";

// Live state received from the server over WebSocket. Progress is keyed by
// a stable string built from the path + topic name (see topicKey below).
const live = { online: null, progress: {} };

function labelLevel(level) { return level.replaceAll("-", " ").replace(/\b\w/g, x => x.toUpperCase()); }

function iconFor(level) {
  return { school: "🏫", class: "🎓", subject: "📘", topic: "🔬" }[level] || "•";
}

function topicList(subject) {
  const wanted = TOPIC_OVERRIDES[subject] || [];
  const simSubject = SUBJECT_MAP[subject];
  const matching = SIMS.filter(s => simSubject && s.subjects.includes(simSubject));
  const generated = matching.map(s => s.title);
  return [...new Set([...wanted, ...generated])].slice(0, 12);
}

function simFor(topicName) {
  return SIMS.find(s => s.title.toLowerCase() === topicName.toLowerCase());
}

function currentLevel() {
  return ["school", "class", "subject", "topic"][path.length] || "school";
}

function getItems() {
  if (path.length === 0) return SCHOOL_DATA.map(s => ({ ...s, type: "school" }));
  if (path.length === 1) {
    const school = path[0];
    return school.classes.map(c => ({ ...c, type: "class" }));
  }
  if (path.length === 2) {
    const cls = path[1];
    return cls.subjects.map(s => ({ name: s, type: "subject", count: topicList(s).length }));
  }
  const subject = path[2].name;
  return topicList(subject).map((t, i) => ({
    name: t,
    type: "topic",
    baseProgress: BASE_PROGRESS[i % BASE_PROGRESS.length],
  }));
}

// Stable id for a topic card so live progress survives re-renders and is
// shared across every browser tab connected to the same server.
function topicKey(topicName) {
  const parts = [path[0]?.name, path[1]?.name, path[2]?.name, topicName].filter(Boolean);
  return parts.join(" / ").toLowerCase();
}

function progressFor(item) {
  const key = topicKey(item.name);
  return Object.prototype.hasOwnProperty.call(live.progress, key) ? live.progress[key] : item.baseProgress;
}

function renderBreadcrumb() {
  const names = ["Schools", ...path.map(x => x.name)];
  document.getElementById("breadcrumb").innerHTML = names.map((n, i) =>
    `<button class="crumb ${i === names.length - 1 ? "active" : ""}" data-i="${i}">${n}</button>${i < names.length - 1 ? '<span class="sep">›</span>' : ""}`
  ).join("");
  document.querySelectorAll(".crumb").forEach(btn => btn.addEventListener("click", () => {
    const i = Number(btn.dataset.i);
    path = path.slice(0, i);
    render();
  }));
}

function cardHTML(item) {
  const level = item.type;
  let meta = "";
  if (level === "school") meta = `${item.location} · ${item.classes.length} classes`;
  if (level === "class") meta = `${item.subjects.length} subjects`;
  if (level === "subject") meta = `${item.count} topics`;
  if (level === "topic") {
    const pct = progressFor(item);
    meta = `<div>Learning progress · <span class="pct" data-key="${topicKey(item.name)}">${pct}</span>%</div>
      <div class="progress"><span data-bar="${topicKey(item.name)}" style="width:${pct}%"></span></div>`;
  }
  return `<button class="card ${level}" data-name="${item.name.replaceAll('"', "&quot;")}">
    <div class="icon">${iconFor(level)}</div>
    <h3>${item.name}</h3>
    <p>${
      level === "school" ? "Open school dashboard and classes" :
      level === "class" ? "Explore subjects for this class" :
      level === "subject" ? "Open topic-wise learning dashboard" :
      "Open topic resources and simulations"
    }</p>
    <div class="meta">${meta}</div>
  </button>`;
}

function render() {
  renderBreadcrumb();
  const level = currentLevel();
  const items = getItems();
  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter(x => x.name.toLowerCase().includes(q)) : items;

  document.getElementById("title").textContent =
    level === "school" ? "Schools" :
    level === "class" ? path[0].name + " · Classes" :
    level === "subject" ? path[0].name + " · " + path[1].name + " · Subjects" :
    path[0].name + " · " + path[1].name + " · " + path[2].name + " · Topics";

  document.getElementById("subtitle").textContent =
    level === "school" ? "Start here. Click a school to drill down." :
    level === "class" ? "Choose a class to see the subjects mapped to it." :
    level === "subject" ? "Choose a subject to see topic-level content." :
    "Choose a topic to open its learning resources and simulations.";

  document.getElementById("stats").textContent = `Showing ${filtered.length} of ${items.length} ${level}${items.length === 1 ? "" : "s"}`;
  document.getElementById("back").hidden = path.length === 0;

  const grid = document.getElementById("grid");
  grid.innerHTML = filtered.length ? filtered.map(cardHTML).join("") :
    `<div class="empty">No matching ${level} found.</div>`;

  grid.querySelectorAll(".card").forEach(card => card.addEventListener("click", () => {
    const item = items.find(x => x.name === card.dataset.name);
    if (!item) return;
    if (item.type === "topic") {
      openTopicModal(item);
      return;
    }
    path.push(item);
    query = "";
    document.getElementById("search").value = "";
    render();
  }));
}

// --- Topic modal -----------------------------------------------------------

let activeTopic = null;

function openTopicModal(item) {
  activeTopic = item;
  const key = topicKey(item.name);
  const pct = progressFor(item);
  const sim = simFor(item.name);

  document.getElementById("modalTitle").textContent = item.name;
  document.getElementById("modalDesc").textContent = sim
    ? `Includes an interactive simulation, worksheets and student progress tracking for "${item.name}".`
    : `Lesson content, worksheets, assignments and student progress for "${item.name}".`;
  document.getElementById("modalProgressBar").style.width = pct + "%";
  document.getElementById("modalProgressBar").dataset.key = key;
  document.getElementById("modalProgressLabel").textContent = pct + "%";
  document.getElementById("modalLaunch").textContent = sim ? "Open simulation" : "Open resources";
  document.getElementById("modalBackdrop").hidden = false;
}

function closeTopicModal() {
  document.getElementById("modalBackdrop").hidden = true;
  activeTopic = null;
}

document.getElementById("modalClose").addEventListener("click", closeTopicModal);
document.getElementById("modalBackdrop").addEventListener("click", e => {
  if (e.target.id === "modalBackdrop") closeTopicModal();
});

document.getElementById("modalAdvance").addEventListener("click", () => {
  if (!activeTopic) return;
  const key = topicKey(activeTopic.name);
  const base = progressFor(activeTopic);
  sendProgressUpdate(key, 10, base, activeTopic.name);
});

document.getElementById("modalLaunch").addEventListener("click", () => {
  if (!activeTopic) return;
  const topicName = activeTopic.name;
  const sim = simFor(topicName);
  const file = sim && SIM_FILES[sim.slug];
  if (file) {
    closeTopicModal();
    openSimulation(topicName, file);
    return;
  }
  alert(sim
    ? `"${topicName}" has metadata but no bundled simulation file yet — add it to SIM_FILES in data.js.`
    : `"${topicName}" resources (lesson notes, worksheets) would open here.`);
});

// --- Full-screen simulation viewer ------------------------------------------

function openSimulation(topicName, file) {
  document.getElementById("simTitle").textContent = topicName;
  document.getElementById("simFrame").src = file;
  document.getElementById("simOverlay").hidden = false;
}

function closeSimulation() {
  document.getElementById("simOverlay").hidden = true;
  document.getElementById("simFrame").src = "about:blank";
}

document.getElementById("simClose").addEventListener("click", closeSimulation);

// --- Live activity panel ----------------------------------------------------

const activityPanel = document.getElementById("activityPanel");
document.getElementById("activityToggle").addEventListener("click", () => { activityPanel.hidden = !activityPanel.hidden; });
document.getElementById("activityClose").addEventListener("click", () => { activityPanel.hidden = true; });

function addActivityItem(item, animate) {
  const list = document.getElementById("activityList");
  const li = document.createElement("li");
  if (animate) li.classList.add("enter");
  const time = new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  li.innerHTML = `<span>${item.text}</span><span class="ts">${time}</span>`;
  list.prepend(li);
  while (list.children.length > 25) list.removeChild(list.lastChild);
}

// --- WebSocket real-time layer ----------------------------------------------

let socket;
let reconnectDelay = 1000;

function sendProgressUpdate(key, delta, base, label) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: "progress-update", key, delta, base, label }));
}

function applyProgress(key, pct) {
  live.progress[key] = pct;
  document.querySelectorAll(`[data-bar="${CSS.escape(key)}"]`).forEach(el => { el.style.width = pct + "%"; });
  document.querySelectorAll(`[data-key="${CSS.escape(key)}"]`).forEach(el => { el.textContent = pct; });
  if (activeTopic && topicKey(activeTopic.name) === key) {
    document.getElementById("modalProgressBar").style.width = pct + "%";
    document.getElementById("modalProgressLabel").textContent = pct + "%";
  }
}

function connectSocket() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${proto}//${location.host}`);

  socket.addEventListener("open", () => { reconnectDelay = 1000; });

  socket.addEventListener("message", ev => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }

    if (msg.type === "snapshot") {
      live.online = msg.online;
      live.progress = msg.progress || {};
      updatePresence();
      document.getElementById("activityList").innerHTML = "";
      (msg.activity || []).slice().reverse().forEach(item => addActivityItem(item, false));
      render();
    } else if (msg.type === "presence") {
      live.online = msg.online;
      updatePresence();
    } else if (msg.type === "progress") {
      applyProgress(msg.key, msg.progress);
    } else if (msg.type === "activity") {
      addActivityItem(msg.item, true);
    }
  });

  socket.addEventListener("close", () => {
    setTimeout(connectSocket, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 15000);
  });
}

function updatePresence() {
  document.getElementById("onlineCount").textContent = live.online ?? "–";
}

// --- Chrome: search / back / theme -----------------------------------------

document.getElementById("back").addEventListener("click", () => { path.pop(); render(); });
document.getElementById("search").addEventListener("input", e => { query = e.target.value; render(); });
document.getElementById("theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("theme").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
});

render();
connectSocket();
