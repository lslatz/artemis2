/**
 * Artemis II Orbital Mechanics Visualizer
 *
 * Canvas-based orbital dynamics display showing:
 *   — Near-Earth orbital view (phases 0–4): elliptical orbits, TLI burn marker
 *   — Mission-map view (phases 5–8): Earth-to-Moon trajectory with craft position
 *
 * Earth image: NASA "Blue Marble" Apollo 17 photo — public domain, via Wikimedia Commons
 * Moon image:  Greg Goebel / public domain, via Wikimedia Commons
 *
 * Orbital dimensions are EDUCATIONAL EXAGGERATIONS — not true to scale.
 */

const EARTH_IMG_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/300px-The_Earth_seen_from_Apollo_17.jpg";
const MOON_IMG_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/240px-FullMoon2010.jpg";

// ── Per-phase orbital parameters ─────────────────────────────────────────────
// view:'orbit'   → near-Earth view, animated Orion on ellipse (NOT to scale)
// view:'mission' → Earth-to-Moon overview, Orion sliding along arc
// periR / apoR   → radii in canvas pixels (exaggerated for readability)
// burnAt         → angle (radians) on the ellipse where the burn marker is drawn
//                  (0 = right/apoapsis, Math.PI = left/periapsis)
const PHASE_ORBITS = [
  // 0 — LAUNCH DAY: craft on pad, tiny pre-orbit circle
  {
    view: "orbit", periR: 54, apoR: 54, burnAt: null, burnLabel: null,
    info: "Pre-launch · Orion & SLS on launch pad · Kennedy Space Center, FL",
  },
  // 1 — LAUNCH & ASCENT: circular LEO achieved
  {
    view: "orbit", periR: 90, apoR: 90, burnAt: null, burnLabel: null,
    info: "LEO Parking Orbit · ~170 km altitude · Circular · v₀ ≈ 7.8 km/s",
  },
  // 2 — ORBITAL MECHANICS & TLI BURNS (new): TLI burn site marked on orbit
  {
    view: "orbit", periR: 90, apoR: 90, burnAt: Math.PI,
    burnLabel: "TLI BURN SITE · ΔV = +3.2 km/s",
    info: "Parking Orbit · TLI burn at periapsis raises apogee to lunar distance · Hohmann transfer",
  },
  // 3 — EARTH ORBIT & SYSTEMS CHECK: GO/NO-GO, TLI commit
  {
    view: "orbit", periR: 90, apoR: 90, burnAt: Math.PI,
    burnLabel: "TLI → COMMIT GO",
    info: "2nd Orbit · All systems GO · Committing to Trans-Lunar Injection",
  },
  // 4 — TRANS-LUNAR INJECTION: TLI burn executed, orbit stretches to Moon
  {
    view: "orbit", periR: 90, apoR: 262, burnAt: Math.PI,
    burnLabel: "TLI BURN ✓ · ΔV +3.2 km/s",
    info: "TLI complete · Apogee ~384,400 km* · Free-return trajectory locked in",
  },
  // 5 — OUTBOUND COAST: mission-map, Day 2
  {
    view: "mission", progress: 0.26,
    info: "Trans-Lunar Coast · Day 2 · ~200,000 km from Earth",
  },
  // 6 — LUNAR FLYBY: mission-map, near Moon
  {
    view: "mission", progress: 0.60,
    info: "Lunar Flyby · Closest approach 8,900 km · First humans near Moon since 1972",
  },
  // 7 — RETURN COAST: mission-map, Day 7
  {
    view: "mission", progress: 0.79,
    info: "Return Coast · Day 7 · Earth growing in Orion's windows",
  },
  // 8 — RE-ENTRY & SPLASHDOWN: mission-map, almost home
  {
    view: "mission", progress: 0.96,
    info: "Entry Interface · -5.5° entry angle · Splashdown · Pacific Ocean",
  },
];

const TRANS_DURATION_MS = 1500;

// Module-level state
let _canvas = null;
let _ctx = null;
let _W = 400;
let _H = 300;
let _raf = null;
let _earthImg = null;
let _moonImg = null;
let _phaseIdx = 0;
let _prevOrbit = null;
let _transStart = 0;
let _craftAngle = 0; // continuously animated in orbit view

// ── Public API ────────────────────────────────────────────────────────────────

export function initOrbitViz(canvasEl) {
  _canvas = canvasEl;
  _ctx = canvasEl.getContext("2d");
  _resizeCanvas();
  _loadImages();
  _craftAngle = 0;
  _raf = requestAnimationFrame(_tick);
}

export function setOrbitPhase(idx, animate = true) {
  const clampedIdx = Math.max(0, Math.min(idx, PHASE_ORBITS.length - 1));
  _prevOrbit = { ...(_activeLerped() || PHASE_ORBITS[_phaseIdx]) };
  _phaseIdx = clampedIdx;
  _transStart = animate ? Date.now() : 0;
  if (!animate) _prevOrbit = null;
}

export function destroyOrbitViz() {
  cancelAnimationFrame(_raf);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _resizeCanvas() {
  const rect = _canvas.getBoundingClientRect();
  _W = _canvas.width = Math.round(rect.width) || 400;
  _H = _canvas.height = Math.round(rect.height) || 300;
}

function _loadImages() {
  _earthImg = new Image();
  _earthImg.crossOrigin = "anonymous";
  _earthImg.src = EARTH_IMG_SRC;
  _earthImg.onerror = () => { _earthImg = null; };

  _moonImg = new Image();
  _moonImg.crossOrigin = "anonymous";
  _moonImg.src = MOON_IMG_SRC;
  _moonImg.onerror = () => { _moonImg = null; };
}

function _lerp(a, b, t) {
  return a + (b - a) * t;
}

function _easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** Returns the current interpolated orbit state between prevOrbit and target. */
function _activeLerped() {
  const tgt = PHASE_ORBITS[_phaseIdx];
  if (_transStart === 0 || !_prevOrbit) return tgt;

  const rawT = Math.min(1, (Date.now() - _transStart) / TRANS_DURATION_MS);
  const t = _easeInOut(rawT);

  if (rawT >= 1) {
    _transStart = 0;
    _prevOrbit = null;
    return tgt;
  }

  const mid = t > 0.55;
  return {
    view:      mid ? tgt.view      : _prevOrbit.view,
    periR:     _lerp(_prevOrbit.periR ?? 90, tgt.periR ?? 90, t),
    apoR:      _lerp(_prevOrbit.apoR  ?? 90, tgt.apoR  ?? 90, t),
    progress:  _lerp(_prevOrbit.progress ?? 0.3, tgt.progress ?? 0.3, t),
    burnAt:    mid ? tgt.burnAt    : _prevOrbit.burnAt,
    burnLabel: mid ? tgt.burnLabel : _prevOrbit.burnLabel,
    info:      mid ? tgt.info      : _prevOrbit.info,
  };
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

/**
 * Draw Earth: NASA photo if loaded and CORS-accessible, else procedural fallback.
 * Adds an atmospheric halo either way.
 */
function _drawEarth(x, y, r) {
  const ctx = _ctx;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  if (_earthImg && _earthImg.complete && _earthImg.naturalWidth > 0) {
    ctx.drawImage(_earthImg, x - r, y - r, r * 2, r * 2);
  } else {
    // Procedural fallback — ocean gradient
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
    g.addColorStop(0, "#5aadee");
    g.addColorStop(0.45, "#2468c0");
    g.addColorStop(1, "#0d1f56");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    // Land masses
    ctx.fillStyle = "rgba(55,130,55,0.6)";
    ctx.beginPath(); ctx.ellipse(x - r * 0.18, y - r * 0.05, r * 0.22, r * 0.38, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.22, y + r * 0.12, r * 0.16, r * 0.30, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.04, y - r * 0.30, r * 0.32, r * 0.14, 0.8, 0, Math.PI * 2); ctx.fill();
    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.beginPath(); ctx.ellipse(x - r * 0.08, y + r * 0.22, r * 0.30, r * 0.07, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.14, y - r * 0.28, r * 0.22, r * 0.06, -0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Atmospheric halo
  const halo = ctx.createRadialGradient(x, y, r * 0.92, x, y, r * 1.24);
  halo.addColorStop(0, "rgba(80,170,255,0.26)");
  halo.addColorStop(1, "rgba(80,170,255,0)");
  ctx.beginPath();
  ctx.arc(x, y, r * 1.24, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();
}

/**
 * Draw Moon: NASA photo if loaded and CORS-accessible, else procedural fallback.
 */
function _drawMoon(x, y, r) {
  const ctx = _ctx;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  if (_moonImg && _moonImg.complete && _moonImg.naturalWidth > 0) {
    ctx.drawImage(_moonImg, x - r, y - r, r * 2, r * 2);
  } else {
    // Procedural fallback — grey regolith
    const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r);
    g.addColorStop(0, "#d2d2ce");
    g.addColorStop(0.55, "#909090");
    g.addColorStop(1, "#484846");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    // Mare (dark basalt plains)
    ctx.fillStyle = "rgba(38,38,36,0.52)";
    ctx.beginPath(); ctx.ellipse(x - r * 0.18, y + r * 0.06, r * 0.30, r * 0.20, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.20, y - r * 0.18, r * 0.16, r * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
    // Crater rims
    for (const [dx, dy, cr] of [[-0.08, -0.04, 0.07], [0.28, 0.22, 0.05], [-0.30, 0.28, 0.06], [0.10, 0.30, 0.05]]) {
      ctx.strokeStyle = "rgba(155,148,140,0.40)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x + dx * r, y + dy * r, cr * r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Rim light
  const rim = ctx.createRadialGradient(x, y, r * 0.88, x, y, r * 1.06);
  rim.addColorStop(0, "rgba(200,200,200,0)");
  rim.addColorStop(1, "rgba(200,200,200,0.14)");
  ctx.beginPath();
  ctx.arc(x, y, r * 1.06, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();
}

/** Draw the Orion capsule as an animated glowing dot. */
function _drawCraft(x, y) {
  const ctx = _ctx;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 11);
  glow.addColorStop(0, "rgba(96,200,255,0.72)");
  glow.addColorStop(1, "rgba(96,200,255,0)");
  ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fillStyle = glow; ctx.fill();

  ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.strokeStyle = "#60c8ff"; ctx.lineWidth = 1.5; ctx.stroke();
}

/** Draw a burn-fire marker at (x, y) with a label. */
function _drawBurnMarker(x, y, label) {
  const ctx = _ctx;
  // Dashed ring
  ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(249,115,22,0.85)";
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
  // Flame triangle
  ctx.fillStyle = "#f97316";
  ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x - 3.5, y + 2.5); ctx.lineTo(x + 3.5, y + 2.5); ctx.closePath(); ctx.fill();
  // Label (draw with shadow for readability)
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillText(label, x + 13, y + 4);
  ctx.fillStyle = "#fb923c";
  ctx.fillText(label, x + 12, y + 3);
}

// ── View renderers ────────────────────────────────────────────────────────────

function _drawOrbitView(orb) {
  const ctx = _ctx;
  const W = _W, H = _H;

  // Earth focus at 33% from left
  const ex = W * 0.33;
  const ey = H * 0.50;

  const periR = orb.periR ?? 90;
  const apoR  = orb.apoR  ?? 90;
  const a = (periR + apoR) / 2;
  const c = (apoR - periR) / 2;
  const b = Math.sqrt(Math.max(0, a * a - c * c));
  // Ellipse center: Earth is the left focus
  const ecx = ex + c;
  const ecy = ey;

  // Orbit path
  ctx.beginPath();
  ctx.ellipse(ecx, ecy, a, b, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(68,153,255,0.35)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);

  // Periapsis label (left vertex)
  const periX = ecx - a, periY = ecy;
  ctx.beginPath(); ctx.arc(periX, periY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(68,153,255,0.6)"; ctx.fill();
  ctx.font = "8px monospace"; ctx.fillStyle = "rgba(68,153,255,0.7)";
  ctx.textAlign = "right"; ctx.fillText("PERI  ~170 km", periX - 5, periY + 3);

  // Apoapsis label (right vertex)
  const apoX = ecx + a, apoY = ecy;
  ctx.beginPath(); ctx.arc(apoX, apoY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(249,115,22,0.6)"; ctx.fill();
  ctx.font = "8px monospace"; ctx.fillStyle = "rgba(249,115,22,0.7)";
  ctx.textAlign = "left";
  const apoLabel = apoR > 130 ? "APO  ~384,400 km*" : "APO  ~170 km";
  ctx.fillText(apoLabel, apoX + 5, apoY + 3);

  // Burn marker
  if (orb.burnAt != null && orb.burnLabel) {
    const bx = ecx + a * Math.cos(orb.burnAt);
    const by = ecy + b * Math.sin(orb.burnAt);
    _drawBurnMarker(bx, by, orb.burnLabel);
  }

  // Animated craft along the orbit
  const cx = ecx + a * Math.cos(_craftAngle);
  const cy = ecy + b * Math.sin(_craftAngle);
  _drawCraft(cx, cy);

  // Direction arrow — small tangent ahead of craft
  const at = _craftAngle + 0.22;
  const ax1 = ecx + a * Math.cos(at), ay1 = ecy + b * Math.sin(at);
  const ax2 = ecx + a * Math.cos(at + 0.11), ay2 = ecy + b * Math.sin(at + 0.11);
  ctx.strokeStyle = "rgba(68,153,255,0.38)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(ax1, ay1); ctx.lineTo(ax2, ay2); ctx.stroke();

  // Earth
  const earthR = Math.min(W, H) * 0.13;
  _drawEarth(ex, ey, earthR);
}

function _cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function _drawMissionView(orb) {
  const ctx = _ctx;
  const W = _W, H = _H;

  const ex = W * 0.11, ey = H * 0.72;  // Earth
  const mx = W * 0.88, my = H * 0.20;  // Moon

  // Outbound arc
  const ob0x = ex + 16, ob0y = ey - 8;
  const ob1x = W * 0.35, ob1y = H * 0.38;
  const ob2x = W * 0.65, ob2y = H * 0.04;
  const ob3x = mx - 12,  ob3y = my + 7;

  ctx.beginPath();
  ctx.moveTo(ob0x, ob0y);
  ctx.bezierCurveTo(ob1x, ob1y, ob2x, ob2y, ob3x, ob3y);
  ctx.strokeStyle = "rgba(68,153,255,0.42)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);

  // Return arc
  const rb0x = mx - 10, rb0y = my + 15;
  const rb1x = W * 0.63, rb1y = H * 0.72;
  const rb2x = W * 0.37, rb2y = H * 0.88;
  const rb3x = ex + 14,  rb3y = ey + 5;

  ctx.beginPath();
  ctx.moveTo(rb0x, rb0y);
  ctx.bezierCurveTo(rb1x, rb1y, rb2x, rb2y, rb3x, rb3y);
  ctx.strokeStyle = "rgba(249,115,22,0.42)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);

  // Arc labels
  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(68,153,255,0.65)";
  ctx.fillText("OUTBOUND", W * 0.46, H * 0.17);
  ctx.fillStyle = "rgba(249,115,22,0.65)";
  ctx.fillText("RETURN", W * 0.46, H * 0.84);

  // Distance callout
  ctx.fillStyle = "rgba(136,187,238,0.55)";
  ctx.fillText("384,400 km", (ex + mx) / 2, H * 0.52);

  // Orion craft position
  const progress = orb.progress ?? 0.5;
  let craftX, craftY;
  if (progress < 0.5) {
    const t = progress * 2;
    craftX = _cubicBezier(ob0x, ob1x, ob2x, ob3x, t);
    craftY = _cubicBezier(ob0y, ob1y, ob2y, ob3y, t);
  } else {
    const t = (progress - 0.5) * 2;
    craftX = _cubicBezier(rb0x, rb1x, rb2x, rb3x, t);
    craftY = _cubicBezier(rb0y, rb1y, rb2y, rb3y, t);
  }
  _drawCraft(craftX, craftY);

  // Earth and Moon
  _drawEarth(ex, ey, Math.min(W, H) * 0.09);
  _drawMoon(mx, my, Math.min(W, H) * 0.065);
}

// ── Animation loop ────────────────────────────────────────────────────────────

function _tick() {
  _raf = requestAnimationFrame(_tick);

  // Advance craft along orbit (faster for small circular orbits, slower on transfer ellipse)
  const tgt = PHASE_ORBITS[_phaseIdx];
  const speed = tgt.view === "orbit" && (tgt.apoR ?? 90) > 150 ? 0.004 : 0.007;
  _craftAngle += speed;
  if (_craftAngle > Math.PI * 2) _craftAngle -= Math.PI * 2;

  const orb = _activeLerped();
  const ctx = _ctx;

  // Background
  ctx.fillStyle = "#060d1f";
  ctx.fillRect(0, 0, _W, _H);

  if (orb.view === "orbit") {
    _drawOrbitView(orb);
  } else {
    _drawMissionView(orb);
  }

  // Info line
  if (orb.info) {
    ctx.font = `${_W > 380 ? 9 : 8}px monospace`;
    ctx.fillStyle = "rgba(100,155,200,0.88)";
    ctx.textAlign = "left";
    ctx.fillText(orb.info, 7, _H - 10);
  }

  // Scale disclaimer
  ctx.font = "7px monospace";
  ctx.fillStyle = "#1b2e46";
  ctx.textAlign = "right";
  ctx.fillText("NOT TO SCALE", _W - 4, _H - 4);
}
