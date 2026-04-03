/**
 * Artemis II Mission Control Simulator — game engine.
 */

import { PHASES } from "./mission-data.js";
import { initOrbitViz, setOrbitPhase, destroyOrbitViz } from "./orbit-viz.js";

// Seconds within which a correct answer earns a speed bonus
const SPEED_BONUS_THRESHOLD_S = 8;

// Probability (0–1) that each crew member shows fatigue after a health penalty
const CREW_FATIGUE_PROBABILITY = 0.4;

// (WAYPOINTS removed — orbit positions are managed by orbit-viz.js)

const state = {
  phase: 0,
  eventIdx: 0,
  score: 0,
  health: 100,
  timerInterval: null,
  timerStart: 0,
  timerDuration: 20,
  answering: false,
  decisions: [],
};

// ── DOM helpers ──────────────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

const $title = el("screen-title");
const $game  = el("screen-game");
const $end   = el("screen-end");

// ── Stars ────────────────────────────────────────────────────────────────────
function createStars() {
  const container = el("starfield");
  for (let i = 0; i < 180; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2 + 0.5;
    Object.assign(s.style, {
      left: `${Math.random() * 100}%`,
      top:  `${Math.random() * 100}%`,
      width:  `${size}px`,
      height: `${size}px`,
      animationDuration: `${2 + Math.random() * 4}s`,
      animationDelay:    `${Math.random() * 4}s`,
    });
    container.appendChild(s);
  }
}

// ── Screen management ────────────────────────────────────────────────────────
function showScreen(screen) {
  for (const s of document.querySelectorAll(".screen")) s.classList.remove("active");
  screen.classList.add("active");
}

// ── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  const phase = PHASES[state.phase];
  el("hud-phase").textContent = phase ? phase.name : "COMPLETE";
  el("hud-day").textContent   = phase ? phase.day.replace("Mission ", "") : "10";
  el("hud-score").textContent = state.score.toLocaleString();

  const h = Math.max(0, state.health);
  el("health-fill").style.width    = `${h}%`;
  el("health-pct").textContent     = `${h}%`;
  el("health-fill").className      = `health-fill ${h > 60 ? "health-ok" : h > 30 ? "health-warn" : "health-crit"}`;

  const statusEl = el("hud-status");
  if (h > 70) {
    statusEl.textContent = "NOMINAL";  statusEl.className = "hud-val status-nominal";
  } else if (h > 40) {
    statusEl.textContent = "CAUTION";  statusEl.className = "hud-val status-caution";
  } else {
    statusEl.textContent = "WARNING";  statusEl.className = "hud-val status-warning";
  }
}

// ── Spacecraft / orbit visualization ─────────────────────────────────────────
function moveCraft(phaseIdx) {
  setOrbitPhase(phaseIdx);
  // Update orbit panel title to reflect current view
  const panel = el("orbit-panel-title");
  if (panel) {
    panel.textContent = phaseIdx < 5 ? "ORBITAL MECHANICS" : "MISSION MAP";
  }
}

// ── Flight log ───────────────────────────────────────────────────────────────
function logEntry(text, type = "info") {
  const log = el("flight-log");
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  const t = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
  entry.innerHTML = `<span class="log-time">${t}</span> ${text}`;
  log.prepend(entry);
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

// ── Timer ────────────────────────────────────────────────────────────────────
function startTimer(duration = 20) {
  clearInterval(state.timerInterval);
  state.timerStart    = Date.now();
  state.timerDuration = duration;

  state.timerInterval = setInterval(() => {
    const elapsed = (Date.now() - state.timerStart) / 1000;
    const pct     = Math.max(0, (1 - elapsed / duration) * 100);
    const bar     = el("timer-bar");
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.className   = `timer-bar ${pct > 50 ? "timer-ok" : pct > 25 ? "timer-warn" : "timer-crit"}`;
    }
    if (elapsed >= duration) {
      clearInterval(state.timerInterval);
      handleTimeout();
    }
  }, 100);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  const bar = el("timer-bar");
  if (bar) bar.style.width = "0%";
}

function handleTimeout() {
  if (!state.answering) return;
  state.answering = false;
  const phase = PHASES[state.phase];
  const event = phase.events[state.eventIdx];
  applyPenalty(15);
  logEntry("⏱ Decision timeout — mission health reduced", "warn");
  state.decisions.push({ title: event.title, correct: false, timedOut: true, points: 0 });
  showFeedback(event, false, true, undefined, 0);
}

// ── Phase overlay ────────────────────────────────────────────────────────────
function showPhaseOverlay(phaseIdx) {
  const phase = PHASES[phaseIdx];
  el("overlay-num").textContent  = `PHASE ${String(phaseIdx + 1).padStart(2, "0")} OF ${PHASES.length}`;
  el("overlay-name").textContent = phase.name;
  el("overlay-desc").textContent = phase.description;
  el("overlay-day").textContent  = phase.day;
  el("phase-overlay").classList.remove("hidden");
  moveCraft(phaseIdx);
  updateHUD();
}

function hidePhaseOverlay() {
  el("phase-overlay").classList.add("hidden");
  showNextEvent();
}

// ── Events ───────────────────────────────────────────────────────────────────
function showNextEvent() {
  const phase = PHASES[state.phase];
  if (!phase) { endGame(); return; }

  if (state.eventIdx >= phase.events.length) {
    state.phase++;
    state.eventIdx = 0;
    if (state.phase >= PHASES.length) { endGame(); return; }
    showPhaseOverlay(state.phase);
    return;
  }

  renderEvent(phase.events[state.eventIdx]);
  state.answering = true;
  startTimer(20);
}

function renderEvent(event) {
  const sevClass = { critical: "sev-critical", advisory: "sev-advisory", routine: "sev-routine" }[event.severity] || "sev-routine";

  el("event-body").innerHTML = `
    <div class="event-card ${sevClass}">
      <div class="event-severity-bar"></div>
      <div class="event-inner">
        <div class="event-severity-label">${event.severity.toUpperCase()}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-text">${event.text}</div>
        <div class="timer-track">
          <div id="timer-bar" class="timer-bar timer-ok" style="width:100%"></div>
        </div>
        <div class="choices">
          ${event.choices.map((c, i) => `
            <button class="choice-btn" data-idx="${i}">
              <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
              <span class="choice-text">${c.text}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  for (const btn of el("event-body").querySelectorAll(".choice-btn")) {
    btn.addEventListener("click", () => {
      if (!state.answering) return;
      handleChoice(Number(btn.dataset.idx));
    });
  }
}

function handleChoice(choiceIdx) {
  const phase   = PHASES[state.phase];
  const event   = phase.events[state.eventIdx];
  const correct = event.choices[choiceIdx].correct;
  const elapsed = (Date.now() - state.timerStart) / 1000;

  stopTimer();
  state.answering = false;

  // Disable all choice buttons
  for (const btn of el("event-body").querySelectorAll(".choice-btn")) btn.disabled = true;

  let pts = 0;
  let speedBonus = false;
  if (correct) {
    pts = event.points;
    if (elapsed < SPEED_BONUS_THRESHOLD_S) { pts += 50; speedBonus = true; }
    state.score += pts;
    logEntry(`✓ ${event.title}: correct call (+${pts} pts)`, "good");
  } else {
    applyPenalty(15);
    logEntry(`✗ ${event.title}: wrong decision (−15% health)`, "bad");
  }
  updateHUD();

  state.decisions.push({ title: event.title, correct, timedOut: false, points: pts });
  showFeedback(event, correct, false, choiceIdx, pts, speedBonus);
}

function applyPenalty(amount) {
  state.health = Math.max(0, state.health - amount);
  updateHUD();
  if (state.health <= 30) {
    logEntry("⚠ MISSION HEALTH CRITICAL", "warn");
    // Visually flag crew as fatigued
    for (const badge of document.querySelectorAll(".crew-stat-badge")) {
      if (Math.random() > CREW_FATIGUE_PROBABILITY) { badge.textContent = "FATIGUED"; badge.className = "crew-stat-badge warn"; }
    }
  }
}

function showFeedback(event, correct, timedOut, choiceIdx, pts, speedBonus) {
  const buttons   = el("event-body").querySelectorAll(".choice-btn");
  const cardEl    = el("event-body").querySelector(".event-card");

  // Highlight chosen button and reveal correct answer
  if (choiceIdx !== undefined && buttons[choiceIdx]) {
    buttons[choiceIdx].classList.add(correct ? "chosen-correct" : "chosen-wrong");
  }
  if (event) {
    event.choices.forEach((c, i) => { if (c.correct && buttons[i]) buttons[i].classList.add("answer-correct"); });
  }

  // Build feedback banner
  const icon      = correct ? "✓" : "✗";
  const title     = correct ? "CORRECT CALL" : timedOut ? "TIME EXPIRED" : "INCORRECT";
  const bodyText  = timedOut
    ? "You ran out of time. In mission control, hesitation costs."
    : (correct ? event.feedback.correct : event.feedback.wrong);

  let ptsBadge = "";
  if (correct && event) {
    ptsBadge = speedBonus
      ? `<span class="pts-badge">+${pts} pts (speed bonus!)</span>`
      : `<span class="pts-badge">+${pts} pts</span>`;
  }

  const banner = document.createElement("div");
  banner.className = `feedback-banner ${correct ? "feedback-correct" : "feedback-wrong"}`;
  banner.innerHTML = `<strong>${icon} ${title}</strong><p>${bodyText}</p>${ptsBadge}`;
  if (cardEl) cardEl.appendChild(banner);

  // Advance after a short pause
  setTimeout(() => {
    state.eventIdx++;
    showNextEvent();
  }, 3200);
}

// ── End screen ───────────────────────────────────────────────────────────────
function endGame() {
  showScreen($end);

  const correct = state.decisions.filter(d => d.correct).length;
  const total   = state.decisions.length;
  const pct     = total > 0 ? correct / total : 0;

  let rank, icon, subtitle;
  if (state.health >= 80 && pct >= 0.85) {
    icon = "🏆"; rank = "LEGEND — Administrator's Award";
    subtitle = "Flawless mission management. Crew home safe. You never broke a sweat.";
  } else if (state.health >= 60 && pct >= 0.6) {
    icon = "⭐"; rank = "EXPERT — Flight Director";
    subtitle = "Solid decision-making throughout. A few rough calls, but the mission succeeded.";
  } else if (state.health >= 40 && pct >= 0.4) {
    icon = "🚀"; rank = "QUALIFIED — Flight Controller";
    subtitle = "The crew made it back, but mission health took a beating. Review the debrief.";
  } else {
    icon = "📋"; rank = "TRAINEE — Mission Debrief Required";
    subtitle = "Multiple critical errors. The crew is safe, but study the debrief and fly again.";
  }

  el("end-icon").textContent   = icon;
  el("end-title").textContent  = "Artemis II: Mission Complete";
  el("end-subtitle").textContent = subtitle;
  el("final-score").textContent  = state.score.toLocaleString();
  el("final-rank").textContent   = rank;

  const rows = state.decisions.map(d => `
    <div class="decision-row ${d.correct ? "dec-correct" : "dec-wrong"}">
      <span class="dec-icon">${d.correct ? "✓" : "✗"}</span>
      <span class="dec-text">${d.title}</span>
      <span class="dec-pts">${d.correct ? `+${d.points}` : d.timedOut ? "TIMEOUT" : "WRONG"}</span>
    </div>
  `).join("");

  el("end-decisions").innerHTML = `
    <div class="decisions-header">Mission Debrief — ${correct} / ${total} correct decisions</div>
    ${rows}
  `;

  logEntry("🌍 Artemis II crew safely returned to Earth.", "good");
}

// ── Init ─────────────────────────────────────────────────────────────────────
let _orbitVizStarted = false;

function initGame() {
  state.phase    = 0;
  state.eventIdx = 0;
  state.score    = 0;
  state.health   = 100;
  state.decisions = [];
  state.answering = false;
  clearInterval(state.timerInterval);

  el("hud-score").textContent    = "0";
  el("health-fill").style.width  = "100%";
  el("health-pct").textContent   = "100%";
  el("flight-log").innerHTML     = "";

  for (const badge of document.querySelectorAll(".crew-stat-badge")) {
    badge.textContent = "OK";
    badge.className   = "crew-stat-badge ok";
  }

  showScreen($game);

  // Start (or restart) the orbital mechanics canvas
  const orbitCanvas = el("orbit-canvas");
  if (orbitCanvas) {
    if (_orbitVizStarted) {
      destroyOrbitViz();
    }
    initOrbitViz(orbitCanvas);
    _orbitVizStarted = true;
    setOrbitPhase(0, false); // no animation on first show
  }

  showPhaseOverlay(0);

  logEntry("🚀 Artemis II Mission Control — all systems GO", "good");
  logEntry("👥 Crew aboard Orion: Wiseman · Glover · Koch · Hansen", "info");
}

// ── Event listeners ───────────────────────────────────────────────────────────
el("btn-start").addEventListener("click", initGame);
el("btn-continue").addEventListener("click", hidePhaseOverlay);
el("btn-replay").addEventListener("click", () => showScreen($title));

// ── Startup ───────────────────────────────────────────────────────────────────
createStars();
