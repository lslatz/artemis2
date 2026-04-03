/**
 * Artemis II Mission Control Simulator — mission phase and event data.
 * All facts based on publicly available NASA mission information.
 */

export const PHASES = [
  {
    id: 0,
    name: "LAUNCH DAY",
    day: "Mission Day 0",
    description:
      "Final checks before humanity's boldest mission in 50 years. You have the launch authority. The crew is strapped in. The world is watching.",
    events: [
      {
        id: "e0-weather",
        severity: "advisory",
        title: "WEATHER HOLD ASSESSMENT",
        text: "KSC meteorology reports a 40% probability of a weather violation at T-0. The backup launch window is 24 hours later. NASA flight rules allow launch with up to a 60% violation probability. Your met officer says conditions are borderline acceptable.",
        choices: [
          { text: "Proceed — 40% is within the 60% violation threshold", correct: true },
          { text: "Scrub — delay 24 hours for better conditions", correct: false },
          { text: "Hold for 2 hours and reassess", correct: false },
        ],
        feedback: {
          correct:
            "Correct. NASA weather rules allow launch with up to a 60% probability of a weather violation. At 40%, you are well within acceptable limits. GO for launch.",
          wrong:
            "NASA weather rules allow launch with up to a 60% probability of violation. A 40% reading is within the acceptable range — scrubbing here was unnecessary.",
        },
        points: 100,
      },
      {
        id: "e0-leak",
        severity: "critical",
        title: "LIQUID HYDROGEN LEAK DETECTED",
        text: "During SLS propellant loading, sensors detect a small hydrogen leak at the tail service mast umbilical. The leak rate measures 0.015% — the scrub threshold is 0.1%. The leak is stable and not growing. Engineers assess it as a known sealing characteristic.",
        choices: [
          { text: "Scrub — any hydrogen leak near ignition is unacceptable", correct: false },
          { text: "Continue — leak rate is well below the 0.1% scrub threshold", correct: true },
          { text: "Purge the system and restart fueling from the beginning", correct: false },
        ],
        feedback: {
          correct:
            "Correct call. Small hydrogen seep rates during fueling are a known and acceptable characteristic. At 0.015% — far below the 0.1% threshold — you proceed safely.",
          wrong:
            "A 0.015% leak rate is well within established flight rules. The scrub threshold is 0.1%. Purging would cause a 24-hour delay for a condition that is within tolerances.",
        },
        points: 150,
      },
    ],
  },
  {
    id: 1,
    name: "LAUNCH & ASCENT",
    day: "Mission Day 0 — T+0",
    description:
      "SLS ignites with 8.8 million pounds of thrust. The ground shakes. Four humans begin their journey to the Moon.",
    events: [
      {
        id: "e1-meco",
        severity: "routine",
        title: "MAIN ENGINE CUTOFF — STAGE SEPARATION",
        text: "Main Engine Cutoff (MECO) occurs at T+8 min 23 sec. The SLS core stage separates cleanly. Which stage fires next to place Orion into parking orbit?",
        choices: [
          { text: "ICPS — Interim Cryogenic Propulsion Stage", correct: true },
          { text: "Solid Rocket Boosters reignite for orbital insertion", correct: false },
          { text: "Orion's European Service Module engine", correct: false },
        ],
        feedback: {
          correct:
            "Exactly. The ICPS is the upper stage of SLS Block 1, powered by a single RL-10 engine burning liquid hydrogen and oxygen. It boosts Orion to parking orbit.",
          wrong:
            "The Solid Rocket Boosters separate at T+2 minutes and are not reusable. After MECO, the ICPS (Interim Cryogenic Propulsion Stage) takes over for orbital insertion.",
        },
        points: 100,
      },
      {
        id: "e1-orbit",
        severity: "routine",
        title: "PARKING ORBIT ACHIEVED",
        text: "Victor Glover confirms all systems nominal from the Orion flight deck. What is the approximate altitude of Orion's initial parking orbit before the Trans-Lunar Injection burn?",
        choices: [
          { text: "~170 km — standard low Earth orbit for trajectory shaping", correct: true },
          { text: "~400 km — same altitude as the ISS", correct: false },
          { text: "~36,000 km — geostationary orbit", correct: false },
        ],
        feedback: {
          correct:
            "Correct. Orion enters a ~170 km parking orbit — similar to Apollo missions — allowing mission controllers to verify all systems before committing to the Moon.",
          wrong:
            "Orion enters a ~170 km parking orbit, much lower than the ISS (~400 km). The low orbit conserves fuel and keeps options open for a return-to-Earth abort.",
        },
        points: 100,
      },
    ],
  },
  {
    id: 2,
    name: "ORBITAL MECHANICS & TLI BURNS",
    day: "Mission Day 0–1 — Parking Orbit",
    description:
      "Orion circles Earth in a 170 km parking orbit. Before committing to the Moon, the crew reviews the burn plan. One precise engine firing — a Hohmann transfer — separates low Earth orbit from lunar destiny.",
    events: [
      {
        id: "e2-hohmann",
        severity: "routine",
        title: "BURN MECHANICS BRIEFING",
        text: "Victor Glover sketches the maneuver on his kneeboard: 'Adding velocity at periapsis — the closest point of the orbit — stretches the orbit outward at apoapsis.' This is the Hohmann transfer principle. If Orion fires its engine prograde (forward) at periapsis, what happens to the orbit shape?",
        choices: [
          { text: "The orbit remains circular — burns only change speed, not shape", correct: false },
          { text: "The apoapsis rises while periapsis stays the same — the orbit becomes more elliptical", correct: true },
          { text: "The periapsis drops — prograde burns always lower the orbit", correct: false },
        ],
        feedback: {
          correct:
            "Exactly right. A prograde burn at periapsis raises the apoapsis while leaving periapsis unchanged — making the orbit more elliptical. For TLI, one large prograde burn at periapsis stretches Orion's apoapsis from 170 km all the way to ~384,400 km — lunar distance.",
          wrong:
            "A prograde burn at periapsis raises the apoapsis while leaving periapsis unchanged. This is the Hohmann transfer principle: stretching the orbit into an ellipse. For TLI, one large burn extends the apoapsis from 170 km to ~384,400 km.",
        },
        points: 100,
      },
      {
        id: "e2-deltav",
        severity: "critical",
        title: "TLI BURN AUTHORIZATION — DELTA-V REQUIRED",
        text: "The ICPS is fueled and ready. Navigation has computed the required delta-v (velocity change) for the Trans-Lunar Injection burn. In LEO, Orion orbits at ~7.8 km/s. The TLI burn must add enough velocity to reach the Moon on a free-return trajectory. What is the approximate delta-v required for TLI?",
        choices: [
          { text: "~0.5 km/s — just a small nudge beyond LEO velocity", correct: false },
          { text: "~3.2 km/s — raising total speed from ~7.8 to ~11 km/s", correct: true },
          { text: "~8 km/s — matching Earth escape velocity", correct: false },
        ],
        feedback: {
          correct:
            "Correct. The TLI burn adds ~3.2 km/s to Orion's LEO orbital velocity of ~7.8 km/s, reaching ~11 km/s total. This is just below Earth escape velocity (~11.2 km/s) — enough to reach the Moon on the free-return trajectory without escaping Earth's gravity entirely.",
          wrong:
            "The TLI burn adds ~3.2 km/s to Orion's ~7.8 km/s LEO velocity. At ~11 km/s total speed, Orion is just below Earth escape velocity (~11.2 km/s) — perfectly tuned to reach the Moon and return on the free-return trajectory.",
        },
        points: 150,
      },
    ],
  },
  {
    id: 3,
    name: "EARTH ORBIT & SYSTEMS CHECK",
    day: "Mission Day 0–1",
    description:
      "Two loops around Earth while the crew verifies every spacecraft system. This is the last chance to abort before committing to the Moon.",
    events: [
      {
        id: "e2-nav",
        severity: "advisory",
        title: "NAVIGATION SYSTEM — STAR TRACKER CALIBRATION",
        text: "Victor Glover reports the star tracker needs recalibration prior to TLI. The star tracker is critical for deep-space navigation. GPS coverage ends around 36,000 km altitude. How does Orion primarily navigate in deep space?",
        choices: [
          {
            text: "Optical navigation — star trackers and celestial reference positions",
            correct: true,
          },
          { text: "GPS satellites with extended coverage to lunar distance", correct: false },
          { text: "Radio-only triangulation from NASA's Deep Space Network", correct: false },
        ],
        feedback: {
          correct:
            "Right. Orion uses inertial measurement units combined with star trackers to establish its precise orientation and position in deep space. GPS coverage ends at ~36,000 km.",
          wrong:
            "GPS coverage ends at ~36,000 km altitude. For the ~384,400 km journey to the Moon, Orion uses inertial navigation, star trackers, and DSN radio for position verification.",
        },
        points: 100,
      },
      {
        id: "e2-tli-timing",
        severity: "critical",
        title: "TLI BURN WINDOW — GO / NO-GO POLL",
        text: "All four crew members are GO. The ICPS is fully fueled. Mission rules require the TLI burn to happen at the correct orbital position or the free-return trajectory won't align. When should TLI occur?",
        choices: [
          { text: "After the 1st orbit — get to the Moon as fast as possible", correct: false },
          {
            text: "After the 2nd orbit — planned window for free-return trajectory alignment",
            correct: true,
          },
          {
            text: "After the 3rd orbit — allow extra time for full systems verification",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Correct. The Artemis II mission plan calls for TLI after the 2nd orbit. The timing precisely aligns Orion with the Moon's position for the free-return trajectory.",
          wrong:
            "The TLI burn must occur at a precise orbital position to align with the Moon. The Artemis II flight plan calls for TLI after the 2nd orbit — the only window that works.",
        },
        points: 150,
      },
    ],
  },
  {
    id: 4,
    name: "TRANS-LUNAR INJECTION",
    day: "Mission Day 1",
    description:
      "The ICPS engine burns for 6 minutes and 30 seconds. Orion breaks free of Earth orbit. Speed: 39,000 km/h. Destination: the Moon.",
    events: [
      {
        id: "e3-freereturn",
        severity: "routine",
        title: "FREE-RETURN TRAJECTORY CONFIRMED",
        text: "TLI burn is nominal — trajectory confirmed. Orion is now on a free-return path. If every propulsion system failed completely right now, what happens to the crew?",
        choices: [
          { text: "They drift into deep space and cannot return", correct: false },
          {
            text: "Orion loops around the Moon and the Moon's gravity returns it to Earth",
            correct: true,
          },
          { text: "They enter lunar orbit and wait for rescue", correct: false },
        ],
        feedback: {
          correct:
            "Exactly. The free-return trajectory is a deliberate mission-safety feature: the Moon's gravity naturally curves Orion back toward Earth with no engine burns required.",
          wrong:
            "The free-return trajectory is the safety net. Even with total propulsion failure, the Moon's gravity curves Orion around it and sends it back toward Earth automatically.",
        },
        points: 100,
      },
      {
        id: "e3-transit",
        severity: "routine",
        title: "CREW BROADCAST — EDUCATIONAL QUESTIONS",
        text: "Christina Koch is hosting a live educational broadcast for schools worldwide. A student asks: approximately how long does the journey from Earth to the Moon take?",
        choices: [
          { text: "About 8 hours — roughly a long international flight", correct: false },
          { text: "About 3 days — the same as Apollo missions", correct: true },
          { text: "About 2 weeks at this speed", correct: false },
        ],
        feedback: {
          correct:
            "Correct! The Moon is ~384,400 km away. Artemis II takes approximately 3 days to arrive — the same transit time as the Apollo missions in the 1960s and 70s.",
          wrong:
            "The Moon is ~384,400 km distant. At ~39,000 km/h post-TLI, the transit takes roughly 3 days — identical to Apollo mission transit times.",
        },
        points: 100,
      },
    ],
  },
  {
    id: 5,
    name: "OUTBOUND COAST",
    day: "Mission Days 1–4",
    description:
      "Three days in the void. The crew watches Earth shrink behind them and the Moon grow ahead. Deep space: no GPS, no ISS lifeboat, no rescue.",
    events: [
      {
        id: "e4-impact",
        severity: "critical",
        title: "⚠ MICROMETEORITE IMPACT DETECTED",
        text: "Day 2: Structural sensors detect a micrometeorite impact on Orion's service module. Impact diameter: 0.8 mm. Orion's design tolerance is 10 mm. No pressure leak detected. No structural compromise. The impact is stable.",
        choices: [
          { text: "Emergency abort — return to Earth immediately", correct: false },
          {
            text: "Monitor and continue — impact is well within design tolerances",
            correct: true,
          },
          {
            text: "Schedule an EVA to visually inspect the impact site",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Correct. Micrometeorite impacts of this scale are designed for. At 0.8 mm against a 10 mm tolerance with no pressure leak, this is a monitor-and-continue situation.",
          wrong:
            "A 0.8 mm impact is within Orion's design tolerances (10 mm). An emergency abort or EVA in deep space would introduce far greater risk than the impact itself.",
        },
        points: 150,
      },
      {
        id: "e4-distance",
        severity: "advisory",
        title: "COMMUNICATIONS DELAY — RANGE ESTIMATE",
        text: "Day 3: Mission Control measures a round-trip comms delay of ~2.56 seconds. Wiseman asks how far from Earth Orion is. At the speed of light (300,000 km/s), a 1.28-second one-way delay means Orion is approximately…",
        choices: [
          { text: "~50,000 km — still near Earth", correct: false },
          { text: "~384,000 km — nearly at lunar distance", correct: true },
          { text: "~1,200,000 km — well past the Moon", correct: false },
        ],
        feedback: {
          correct:
            "Exactly right. 1.28 s × 300,000 km/s = ~384,000 km — essentially the Moon's distance from Earth (384,400 km). Orion is almost at closest approach.",
          wrong:
            "Speed of light = 300,000 km/s. One-way delay of 1.28 s = 1.28 × 300,000 = ~384,000 km. That is exactly the Moon's mean distance from Earth.",
        },
        points: 100,
      },
    ],
  },
  {
    id: 6,
    name: "LUNAR FLYBY",
    day: "Mission Day 4–5",
    description:
      "The Moon fills the windows. For the first time since Apollo 17 in December 1972, four humans are this close to another world.",
    events: [
      {
        id: "e5-approach",
        severity: "critical",
        title: "⚠ CLOSEST APPROACH — TRAJECTORY DECISION",
        text: "Orion is closing on the Moon. Planned closest approach: 8,900 km. A trajectory update could bring Orion to 5,000 km for better views, but it would consume reserve fuel and slightly perturbs the return trajectory. Jeremy Hansen is requesting the closer pass.",
        choices: [
          {
            text: "Approve the 5,000 km pass — better views, acceptable risk",
            correct: false,
          },
          {
            text: "Maintain the 8,900 km planned trajectory — no unnecessary risk",
            correct: true,
          },
          {
            text: "Increase distance to 15,000 km for maximum safety margin",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Right call. 8,900 km is already the closest humans have been to the Moon since Apollo 17. Altering the trajectory for views consumes reserve fuel and risks the return burn.",
          wrong:
            "The 8,900 km trajectory was optimized for mission safety and the return burn. Deviating for closer views burns reserve propellant and introduces return-trajectory risk.",
        },
        points: 200,
      },
      {
        id: "e5-farside",
        severity: "advisory",
        title: "FAR-SIDE OBSERVATION WINDOW",
        text: "Orion passes around the lunar far side — the first humans to see this view since Apollo 17. The mission plan allows 12 minutes of observation. Jeremy Hansen requests 25 minutes for photography and crew morale. The return burn window is time-critical.",
        choices: [
          {
            text: "Allow 25 minutes — this is a once-in-a-lifetime historic moment",
            correct: false,
          },
          {
            text: "Allow 12 minutes as planned — return burn window is non-negotiable",
            correct: true,
          },
          {
            text: "Allow 0 minutes — focus entirely on return burn preparation",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Correct. The return burn timing is precise. The 12-minute observation window was planned specifically to give the crew this view while protecting the return trajectory.",
          wrong:
            "The return burn must occur within a precise window. The 12 minutes were planned for a reason — exceeding it risks the return trajectory. Zero minutes was unnecessarily conservative.",
        },
        points: 150,
      },
    ],
  },
  {
    id: 7,
    name: "RETURN COAST",
    day: "Mission Days 5–9",
    description:
      "Heading home. Four days coasting back toward the pale blue dot. Earth grows larger with every passing hour.",
    events: [
      {
        id: "e6-media",
        severity: "advisory",
        title: "PUBLIC CONCERN — HEAT SHIELD RUMOR",
        text: "Day 7: A viral social media post claims Orion's heat shield has an undetected crack. Public concern spikes and media request comment. Your telemetry shows heat shield temperatures, pressures, and structural sensors are completely nominal.",
        choices: [
          {
            text: "Hold a press conference confirming telemetry shows heat shield is nominal",
            correct: true,
          },
          { text: "Ignore social media — the crew's work is more important", correct: false },
          {
            text: "Abort and re-enter early to inspect the heat shield on the ground",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Good judgment. NASA communicates transparently with the public. Quickly addressing concerns with actual telemetry data prevents panic and maintains public trust.",
          wrong:
            "Ignoring public concerns can escalate anxiety. Aborting early based on an unverified social media post would be dangerous and wasteful when all telemetry is nominal.",
        },
        points: 100,
      },
      {
        id: "e6-fatigue",
        severity: "advisory",
        title: "CREW FATIGUE ASSESSMENT",
        text: "Day 8: The crew reports fatigue and mild space adaptation syndrome (space sickness). Commander Wiseman rates crew operational capacity at 85%. Mission rules require a minimum of 75% crew capability to proceed with re-entry. What is your call?",
        choices: [
          {
            text: "Order early emergency re-entry — crew health is declining",
            correct: false,
          },
          {
            text: "Continue as planned — 85% exceeds the 75% minimum threshold",
            correct: true,
          },
          {
            text: "Administer sedatives to speed crew recovery",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Correct. 85% operational capacity clearly exceeds the 75% mission rules minimum. Fatigue and mild space sickness on Day 8 of a 10-day mission are expected and manageable.",
          wrong:
            "85% operational capacity comfortably exceeds the 75% minimum. Emergency re-entry based on expected, manageable fatigue at Day 8 would be an overreaction.",
        },
        points: 100,
      },
    ],
  },
  {
    id: 8,
    name: "RE-ENTRY & SPLASHDOWN",
    day: "Mission Day 10",
    description:
      "Earth's atmosphere closes in. Orion hits the upper atmosphere at 40,000 km/h — 32 times the speed of sound. Temperatures outside reach 2,760°C. Everything comes down to the next few minutes.",
    events: [
      {
        id: "e7-angle",
        severity: "critical",
        title: "⚠ ENTRY ANGLE ASSESSMENT",
        text: "Orion is targeting a -5.5° entry angle. Too shallow and it skips off the atmosphere; too steep and it burns up. Your guidance officer reports sensors read -5.3°. The flight rules tolerance is ±0.5° of the target angle.",
        choices: [
          {
            text: "Order an emergency corrective burn — any deviation from -5.5° is dangerous",
            correct: false,
          },
          {
            text: "Accept the entry angle — -5.3° is within the ±0.5° tolerance",
            correct: true,
          },
          { text: "Abort to orbit and wait for the next re-entry window", correct: false },
        ],
        feedback: {
          correct:
            "Exactly right. -5.3° is only 0.2° from the target — well inside the ±0.5° tolerance. An unnecessary burn this close to entry could actually worsen the trajectory.",
          wrong:
            "-5.3° is only 0.2° from the -5.5° target — within the ±0.5° tolerance. An unnecessary corrective burn at this stage risks worsening the trajectory.",
        },
        points: 200,
      },
      {
        id: "e7-chutes",
        severity: "routine",
        title: "PARACHUTE DEPLOYMENT — NOMINAL",
        text: "Drogue chutes deployed. Main parachutes deployed — all three confirmed open. Orion is descending at 8 m/s. Recovery ships USS San Diego and MV Horizon Star are on station in the Pacific. Your final command as Flight Director:",
        choices: [
          {
            text: "All recovery teams: execute splashdown recovery operations",
            correct: true,
          },
          {
            text: "Deploy reserve backup parachutes — can't be too safe",
            correct: false,
          },
          {
            text: "Activate the emergency beacon in case recovery ships lost the signal",
            correct: false,
          },
        ],
        feedback: {
          correct:
            "Mission complete! Three main chutes deployed nominally. Recovery ships are on station. Artemis II has carried four humans around the Moon and brought them home safely.",
          wrong:
            "Three main chutes are nominal — no backup chutes or emergency beacons needed. The recovery team is on station and ready. The mission is a complete success.",
        },
        points: 100,
      },
    ],
  },
];
