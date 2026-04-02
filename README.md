# Artemis II Knowledge Provenance Atlas (C6)

A browser-based, visual, shareable prototype focused on **evidence provenance** for Artemis II claims using public, citable sources.

## Quick start

Open `/home/runner/work/artemis2/artemis2/index.html` in a browser.

No build step is required.

## What is implemented

- Browser app centered on **C6 Knowledge Provenance Atlas**
- Interactive visual graph of claims, mission elements, and sources
- Confidence and evidence badges with a “Why this confidence?” explainer
- Topic, confidence, source-type, and recency filters
- Supporting/contradicting source comparison cards
- Shareable deep links to a selected claim (`#claim:<id>`)
- Trust controls:
  - Provenance completeness checks
  - Broken-link format checks
  - Duplicate/near-duplicate source detection
  - Ambiguous-claim manual review queue
- Seeded public-source inventory and implementation metadata

## Scope guardrails

- Public, non-classified, citable sources only
- Every claim includes source links, retrieval date, and confidence
- Educational and analytical prototype only (not operational NASA mission truth)
