import {
  audiences,
  claims,
  elements,
  launchChecklist,
  sourceInventory,
  sourcePolicy,
  successCriteria,
} from "./data.js";

const state = {
  topic: "all",
  minConfidence: 0,
  sourceType: "all",
  recency: "all",
  selectedClaimId: null,
};

const el = {
  topic: document.getElementById("filter-topic"),
  confidence: document.getElementById("filter-confidence"),
  sourceType: document.getElementById("filter-source-type"),
  recency: document.getElementById("filter-recency"),
  claimsList: document.getElementById("claims-list"),
  claimDetail: document.getElementById("claim-detail"),
  trustList: document.getElementById("trust-list"),
  graph: document.getElementById("graph"),
  launchChecklist: document.getElementById("launch-checklist"),
};

const now = new Date("2026-04-02");

function confidenceLabel(v) {
  return v === 3 ? "High" : v === 2 ? "Medium" : "Low";
}

function confidenceClass(v) {
  return v === 3 ? "high" : v === 2 ? "medium" : "low";
}

function toDate(str) {
  return new Date(`${str}T00:00:00Z`);
}

function yearsAgo(date) {
  return (now - date) / (1000 * 60 * 60 * 24 * 365.25);
}

function sourceById(id) {
  return sourceInventory.find((s) => s.id === id);
}

function claimPassesFilters(claim) {
  if (state.topic !== "all" && claim.topic !== state.topic) return false;
  if (claim.confidence < state.minConfidence) return false;

  const linkedSources = claim.sources.map((s) => sourceById(s.sourceId)).filter(Boolean);

  if (state.sourceType !== "all" && !linkedSources.some((s) => s.type === state.sourceType)) return false;

  if (state.recency !== "all") {
    const maxYears = state.recency === "1y" ? 1 : 2;
    const hasRecent = linkedSources.some((s) => yearsAgo(toDate(s.retrievedAt)) <= maxYears);
    if (!hasRecent) return false;
  }

  return true;
}

function filteredClaims() {
  return claims.filter(claimPassesFilters);
}

function setHashForClaim(claimId) {
  history.replaceState(null, "", `#claim:${claimId}`);
}

function claimFromHash() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#claim:")) return null;
  return hash.replace("#claim:", "");
}

function populateFilterOptions() {
  const topics = Array.from(new Set(["all", ...claims.map((c) => c.topic)]));
  el.topic.innerHTML = topics
    .map((topic) => `<option value="${topic}">${topic === "all" ? "All topics" : topic}</option>`)
    .join("");

  const sourceTypes = Array.from(new Set(["all", ...sourceInventory.map((s) => s.type)]));
  el.sourceType.innerHTML = sourceTypes
    .map((type) => `<option value="${type}">${type === "all" ? "All source types" : type}</option>`)
    .join("");
}

function renderClaims() {
  const list = filteredClaims();
  if (!list.length) {
    el.claimsList.innerHTML = "<p>No claims match current filters.</p>";
    return;
  }

  if (!state.selectedClaimId || !list.some((c) => c.id === state.selectedClaimId)) {
    state.selectedClaimId = list[0].id;
  }

  el.claimsList.innerHTML = list
    .map(
      (claim) => `
      <button class="claim-button ${state.selectedClaimId === claim.id ? "active" : ""}" data-claim-id="${claim.id}">
        <div><strong>${claim.statement}</strong></div>
        <div>
          <span class="badge ${confidenceClass(claim.confidence)}">${confidenceLabel(claim.confidence)}</span>
          <span>${claim.topic}</span>
        </div>
      </button>
    `,
    )
    .join("");

  for (const button of el.claimsList.querySelectorAll(".claim-button")) {
    button.addEventListener("click", () => {
      state.selectedClaimId = button.dataset.claimId;
      setHashForClaim(state.selectedClaimId);
      renderAll();
    });
  }
}

function renderClaimDetail() {
  const claim = claims.find((c) => c.id === state.selectedClaimId);
  if (!claim) {
    el.claimDetail.textContent = "Select a claim to inspect details.";
    return;
  }

  const supports = claim.sources
    .filter((s) => s.relation === "supports")
    .map((s) => sourceById(s.sourceId))
    .filter(Boolean);
  const contradicts = claim.sources
    .filter((s) => s.relation === "contradicts")
    .map((s) => sourceById(s.sourceId))
    .filter(Boolean);

  const sourceCard = (source, contradict = false) => `
    <article class="source-card ${contradict ? "contradict" : ""}">
      <strong>${source.title}</strong><br/>
      <span class="badge ${source.reliability === "high" ? "high" : source.reliability === "medium" ? "medium" : "low"}">${source.reliability}</span>
      <span>${source.type}</span> · <span>retrieved ${source.retrievedAt}</span><br/>
      <a href="${source.url}" target="_blank" rel="noopener noreferrer">Open source</a>
    </article>
  `;

  el.claimDetail.innerHTML = `
    <p><strong>Claim:</strong> ${claim.statement}</p>
    <p><span class="badge ${confidenceClass(claim.confidence)}">${confidenceLabel(claim.confidence)}</span></p>
    <p><strong>Why this confidence?</strong> ${claim.whyConfidence}</p>
    <p><strong>Supporting evidence</strong></p>
    ${supports.map((s) => sourceCard(s)).join("") || "<p>None</p>"}
    <p><strong>Contradicting evidence</strong></p>
    ${contradicts.map((s) => sourceCard(s, true)).join("") || "<p>None</p>"}
    <p><strong>Shareable deep link:</strong> <code>${window.location.origin}${window.location.pathname}#claim:${claim.id}</code></p>
  `;
}

function drawNode(svg, { x, y, r, label, nodeClass, id, onClick }) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("data-id", id);
  g.style.cursor = "pointer";

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", r);
  circle.setAttribute(
    "fill",
    nodeClass === "claim"
      ? "#214163"
      : nodeClass === "source"
        ? "#2b4d37"
        : "#4d3f2b",
  );
  circle.setAttribute("stroke", state.selectedClaimId === id ? "#5bc0ff" : "#6f88a8");
  circle.setAttribute("stroke-width", state.selectedClaimId === id ? "3" : "1");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 4);
  text.setAttribute("font-size", "10");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#e6edf3");
  text.textContent = label;

  g.append(circle, text);
  g.addEventListener("click", onClick);
  svg.appendChild(g);
}

function drawLine(svg, x1, y1, x2, y2, relation) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", relation === "contradicts" ? "#ff7b72" : "#7ee787");
  line.setAttribute("stroke-width", "2");
  if (relation === "contradicts") {
    line.setAttribute("stroke-dasharray", "5 3");
  }
  svg.appendChild(line);
}

function renderGraph() {
  const list = filteredClaims();
  el.graph.innerHTML = "";

  if (!list.length) return;

  const claimNodes = list.map((claim, idx) => ({
    id: claim.id,
    x: 210 + idx * 250,
    y: 130,
    r: 28,
    label: claim.id,
    claim,
  }));

  for (const node of claimNodes) {
    const linkedSources = node.claim.sources.map((r) => ({ ...r, source: sourceById(r.sourceId) })).filter((x) => x.source);
    linkedSources.forEach((entry, idx) => {
      const sourceX = node.x - 90 + idx * 120;
      const sourceY = 300;
      drawLine(el.graph, node.x, node.y + node.r, sourceX, sourceY - 16, entry.relation);
      drawNode(el.graph, {
        x: sourceX,
        y: sourceY,
        r: 16,
        label: `S${idx + 1}`,
        nodeClass: "source",
        id: `${node.id}-${entry.source.id}`,
        onClick: () => {
          state.selectedClaimId = node.id;
          renderAll();
        },
      });
    });
  }

  for (const node of claimNodes) {
    drawNode(el.graph, {
      x: node.x,
      y: node.y,
      r: node.r,
      label: node.id,
      nodeClass: "claim",
      id: node.id,
      onClick: () => {
        state.selectedClaimId = node.id;
        setHashForClaim(node.id);
        renderAll();
      },
    });
  }
}

function trustChecks() {
  const missingRequired = claims.filter((claim) => {
    const hasSources = claim.sources?.length > 0;
    const hasConfidence = Number.isInteger(claim.confidence);
    const hasWhy = Boolean(claim.whyConfidence);
    return !(hasSources && hasConfidence && hasWhy);
  });

  const brokenLinkLike = sourceInventory.filter((s) => {
    try {
      new URL(s.url);
      return false;
    } catch {
      return true;
    }
  });

  const duplicates = [];
  const seen = new Map();
  for (const src of sourceInventory) {
    const key = src.url.toLowerCase().replace(/\/+$/, "");
    if (seen.has(key)) {
      duplicates.push([seen.get(key), src.id]);
    } else {
      seen.set(key, src.id);
    }
  }

  const manualReview = claims.filter((c) => c.needsManualReview);

  return { missingRequired, brokenLinkLike, duplicates, manualReview };
}

function renderTrustAndLaunch() {
  const checks = trustChecks();
  const checklist = [
    {
      ok: checks.missingRequired.length === 0,
      text: `Provenance completeness checks (${checks.missingRequired.length} missing)`,
    },
    {
      ok: checks.brokenLinkLike.length === 0,
      text: `Broken-link format checks (${checks.brokenLinkLike.length} invalid)`,
    },
    {
      ok: checks.duplicates.length === 0,
      text: `Duplicate source detection (${checks.duplicates.length} duplicate pairs)`,
    },
    {
      ok: checks.manualReview.length > 0,
      text: `Manual review queue (${checks.manualReview.length} ambiguous claims)`,
    },
  ];

  el.trustList.innerHTML = checklist
    .map((item) => `<li class="${item.ok ? "ok" : "warn"}">${item.ok ? "✓" : "•"} ${item.text}</li>`)
    .join("");

  el.launchChecklist.innerHTML = launchChecklist.map((item) => `<li class="ok">✓ ${item}</li>`).join("");
}

function renderAll() {
  renderClaims();
  renderClaimDetail();
  renderGraph();
  renderTrustAndLaunch();
}

function bindEvents() {
  el.topic.addEventListener("change", () => {
    state.topic = el.topic.value;
    renderAll();
  });
  el.confidence.addEventListener("change", () => {
    state.minConfidence = Number(el.confidence.value);
    renderAll();
  });
  el.sourceType.addEventListener("change", () => {
    state.sourceType = el.sourceType.value;
    renderAll();
  });
  el.recency.addEventListener("change", () => {
    state.recency = el.recency.value;
    renderAll();
  });
}

function initFromHash() {
  const fromHash = claimFromHash();
  if (fromHash && claims.some((c) => c.id === fromHash)) {
    state.selectedClaimId = fromHash;
  }
}

function addContextToDetail() {
  const note = document.createElement("p");
  note.innerHTML = `<strong>Audience:</strong> ${audiences.join(", ")}<br/><strong>Success criteria:</strong> ${successCriteria.join(
    "; ",
  )}<br/><strong>Source policy:</strong> ${sourcePolicy.scope}; required per claim: ${sourcePolicy.requiredPerClaim.join(", ")}.`;
  el.claimDetail.prepend(note);
}

function renderPhases() {
  const phaseText = document.createElement("p");
  phaseText.innerHTML = `<strong>Delivery phases:</strong> ${[
    "1) Seeded browser graph prototype",
    "2) Automated ingestion and normalization",
    "3) Confidence analytics and sharing polish",
  ].join(" → ")}.`;
  document.querySelector(".app-header").appendChild(phaseText);
}

populateFilterOptions();
bindEvents();
initFromHash();
renderAll();
addContextToDetail();
renderPhases();
