# Artemis II Concept Discovery Findings

## Scope and intent
This document captures the initial concept discovery for a novel Artemis II–related application that explicitly avoids building a tracker, map, telemetry viewer, timeline, or duplicate of existing NASA public dashboards.

## Research summary (initial landscape scan)
Initial landscape assumptions were developed from broadly known public Artemis/Orion communications patterns and common mission web products:

- Mission status trackers and “where is it now” views
- Telemetry/status dashboards
- Event timelines and countdown pages
- Live stream/event aggregation pages
- Introductory educational explainers

### Working constraints used during ideation
- Must be Artemis II–related and technically grounded
- Must not resemble tracker/map/telemetry/timeline paradigms
- Must be defensible using public, non-classified information
- Should create insight, not just display mission state

## Identified gap hypotheses
1. Public tools underrepresent **mission design tradeoffs** and rationale.
2. Public tools underrepresent **uncertainty and contingency reasoning**.
3. Public tools underrepresent **cross-subsystem constraint coupling**.
4. Public tools underrepresent **human operations/workload logic**.
5. Public tools underrepresent **evidence provenance and confidence literacy**.

## Candidate concept exploration set

### C1 — Artemis II Trade Space Explorer
Interactive mission-architecture tradeoff sandbox (mass, consumables, margins, objectives) with multi-objective exploration.

### C2 — Orion Constraint Graph Studio
Interactive causal network of Orion subsystem constraints; perturbations propagate across connected systems.

### C3 — Artemis II Contingency Playbook Simulator
Branching simulation of off-nominal scenarios and procedure-level decision pathways.

### C4 — Crew Workload Envelope Analyzer
Human-factors–oriented analyzer focused on task density, handovers, cognitive load classes, and safety buffers (not event chronology visualization).

### C5 — Mission Rulebook Engine
Interactive rule-based explainer for mission/flight constraints and “if-this-then-that” logic with rationale chains.

### C6 — Knowledge Provenance Atlas
Graph of mission claims linked to public sources with confidence labeling and traceability.

## Evaluation framework

### Criteria and weights
- **Novelty (25%)**: distance from existing NASA-style public tools
- **Feasibility (20%)**: implementable with public data and reasonable engineering scope
- **Data availability (15%)**: quality and accessibility of required public inputs
- **User value (25%)**: educational/insight utility for target users
- **Technical interest (15%)**: richness of modeling, interaction, and engineering challenge

Scoring scale: 1 (weak) to 5 (strong).  
Weighted score = sum(score × weight).

## Full evaluation matrix

| Concept | Novelty (0.25) | Feasibility (0.20) | Data Availability (0.15) | User Value (0.25) | Technical Interest (0.15) | Weighted Score |
|---|---:|---:|---:|---:|---:|---:|
| C1 Trade Space Explorer | 5 | 4 | 3 | 5 | 5 | **4.45** |
| C2 Constraint Graph Studio | 5 | 4 | 3 | 4 | 5 | **4.25** |
| C3 Contingency Playbook Simulator | 4 | 3 | 2 | 4 | 5 | **3.65** |
| C4 Workload Envelope Analyzer | 4 | 3 | 2 | 4 | 4 | **3.45** |
| C5 Mission Rulebook Engine | 4 | 4 | 3 | 4 | 4 | **3.85** |
| C6 Knowledge Provenance Atlas | 3 | 5 | 5 | 4 | 3 | **4.00** |

## Screening notes by concept

### C1 — Trade Space Explorer
- **Strengths:** very high novelty and educational value; converts mission design into explorable decision space.
- **Risks:** requires assumptions where explicit Artemis II parameters are unavailable.
- **Mitigation:** use transparent parameter provenance, tunable defaults, uncertainty ranges.

### C2 — Constraint Graph Studio
- **Strengths:** strong systems-thinking value; high technical depth in graph propagation and dependency modeling.
- **Risks:** complexity may reduce approachability for non-technical users.
- **Mitigation:** add guided modes and scenario presets.

### C3 — Contingency Playbook Simulator
- **Strengths:** compelling resilience-focused perspective.
- **Risks:** limited public detail on procedural branches may force speculative modeling.
- **Mitigation:** label confidence levels; scope to publicly documented contingency classes.

### C4 — Workload Envelope Analyzer
- **Strengths:** unique human-factors lens.
- **Risks:** weak direct data availability for precise workload signals.
- **Mitigation:** use abstract workload taxonomies instead of claiming operational fidelity.

### C5 — Mission Rulebook Engine
- **Strengths:** accessible and explainable; strong educational usability.
- **Risks:** less distinct than C1/C2 if rules are too static.
- **Mitigation:** include counterfactual testing and rule dependency visualization.

### C6 — Knowledge Provenance Atlas
- **Strengths:** best on data availability and transparency.
- **Risks:** may feel like a documentation tool unless interaction is deeply analytical.
- **Mitigation:** add contradiction detection, confidence drift, and source comparison lenses.

## Screening outcome
Top candidates by weighted score:
1. **C1 — Artemis II Trade Space Explorer (4.45)**
2. **C2 — Orion Constraint Graph Studio (4.25)**
3. C6 — Knowledge Provenance Atlas (4.00)

### Selected concept for next implementation phase
**C1 — Artemis II Trade Space Explorer**

### Selection justification
C1 best satisfies the novelty constraint while delivering high user value and technical depth. It creates a clearly non-tracker experience by focusing on mission architecture reasoning and tradeoff literacy rather than mission state display. Although some parameters require modeled assumptions, this can be managed with strict provenance labeling, adjustable uncertainty ranges, and explicit “illustrative/not operational” framing.

## Assumptions and limitations
- This phase is concept research and screening only; no claim of operational mission planning fidelity.
- Any future model must clearly separate sourced values, inferred values, and illustrative placeholders.
- Public-source-only rule remains mandatory.

## Next-step handoff
Proceed to concept refinement for C1:
- Define users/personas and core workflows
- Define model schema and parameter provenance system
- Define architecture and scaffold implementation
- Add documentation for assumptions, source mapping, and validation approach
