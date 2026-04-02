export const sourcePolicy = {
  scope: "Public, non-classified, citable sources only",
  requiredPerClaim: ["sourceLinks", "retrievalDate", "confidence"],
};

export const audiences = [
  "Curious public",
  "Students",
  "Educators",
  "Space-policy and mission enthusiasts",
];

export const successCriteria = [
  "Users can trace any claim to at least one source in 1-2 clicks",
  "Users can compare supporting and contradicting evidence side-by-side",
  "Every displayed claim shows confidence and confidence rationale",
  "All references include retrieval date and source type",
];

export const phases = [
  {
    id: "phase-1",
    title: "Phase 1: Seeded prototype",
    outcome: "Static dataset + interactive browser graph",
  },
  {
    id: "phase-2",
    title: "Phase 2: Ingestion automation",
    outcome: "Automated fetch and normalization for selected public sources",
  },
  {
    id: "phase-3",
    title: "Phase 3: Trust analytics and sharing polish",
    outcome: "Contradiction detection, confidence analytics, deep-link polish",
  },
];

export const launchChecklist = [
  "Public hosting configured",
  "Lightweight onboarding present",
  "Citation/export view available",
  "Mission-truth disclaimer visible in app header",
];

export const sourceInventory = [
  {
    id: "s-nasa-artemis",
    title: "NASA Artemis Campaign Overview",
    type: "NASA page",
    url: "https://www.nasa.gov/artemis/",
    retrievedAt: "2026-03-20",
    reliability: "high",
    cadence: "periodic updates",
    access: "public web",
    topic: "program",
  },
  {
    id: "s-nasa-artemis2",
    title: "NASA Artemis II Mission Page",
    type: "NASA page",
    url: "https://www.nasa.gov/mission/artemis-ii/",
    retrievedAt: "2026-03-20",
    reliability: "high",
    cadence: "periodic updates",
    access: "public web",
    topic: "mission",
  },
  {
    id: "s-nasa-orion",
    title: "NASA Orion Spacecraft",
    type: "NASA page",
    url: "https://www.nasa.gov/spacecraft/orion/",
    retrievedAt: "2026-03-20",
    reliability: "high",
    cadence: "periodic updates",
    access: "public web",
    topic: "spacecraft",
  },
  {
    id: "s-esa-esm",
    title: "ESA European Service Module",
    type: "Agency page",
    url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion",
    retrievedAt: "2026-03-22",
    reliability: "medium",
    cadence: "periodic updates",
    access: "public web",
    topic: "spacecraft",
  },
  {
    id: "s-press-release",
    title: "NASA Artemis II Crew Announcement",
    type: "Press release",
    url: "https://www.nasa.gov/news-release/",
    retrievedAt: "2026-03-22",
    reliability: "medium",
    cadence: "event-driven",
    access: "public web",
    topic: "crew",
  },
  {
    id: "s-wikipedia-contrast",
    title: "Artemis 2 - Wikipedia",
    purpose: "Used as a lower-reliability contrast source for contradiction checks.",
    type: "Community summary",
    url: "https://en.wikipedia.org/wiki/Artemis_2",
    retrievedAt: "2026-03-22",
    reliability: "low",
    cadence: "continuous edits",
    access: "public web",
    topic: "mission",
  },
];

export const elements = [
  { id: "e-crew", label: "Crew", topic: "crew" },
  { id: "e-orion", label: "Orion", topic: "spacecraft" },
  { id: "e-mission-profile", label: "Mission Profile", topic: "mission" },
  { id: "e-program", label: "Artemis Program", topic: "program" },
];

export const claims = [
  {
    id: "c-001",
    elementId: "e-crew",
    topic: "crew",
    statement: "Artemis II is planned as the first crewed Artemis mission around the Moon.",
    confidence: 3,
    whyConfidence:
      "Supported by multiple official mission pages with consistent language; minor wording differences across updates.",
    sources: [
      { sourceId: "s-nasa-artemis2", relation: "supports" },
      { sourceId: "s-nasa-artemis", relation: "supports" },
      { sourceId: "s-wikipedia-contrast", relation: "supports" },
    ],
    needsManualReview: false,
  },
  {
    id: "c-002",
    elementId: "e-orion",
    topic: "spacecraft",
    statement: "Orion is the primary crew transport spacecraft for Artemis II.",
    confidence: 3,
    whyConfidence: "Directly described in official NASA and ESA Orion materials.",
    sources: [
      { sourceId: "s-nasa-orion", relation: "supports" },
      { sourceId: "s-esa-esm", relation: "supports" },
    ],
    needsManualReview: false,
  },
  {
    id: "c-003",
    elementId: "e-mission-profile",
    topic: "mission",
    statement: "Public summaries occasionally differ in specific flyby phrasing, requiring source-aware interpretation.",
    confidence: 2,
    whyConfidence:
      "High-level mission intent is consistent, but wording and granularity can vary between official and secondary summaries.",
    sources: [
      { sourceId: "s-nasa-artemis2", relation: "supports" },
      { sourceId: "s-wikipedia-contrast", relation: "contradicts" },
    ],
    needsManualReview: true,
  },
];
