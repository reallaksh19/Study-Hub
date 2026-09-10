# Phase 0 adopted decisions

Roadmap: #40  
Phase: #41

This note records the roadmap changes selected after teacher review. It distinguishes **blocking high-ROI decisions** from useful **medium-ROI refinements**.

## High ROI — architecture/contract blockers

- [x] Separate Kani raw/recent evidence from Teacher Runtime judgement and next pedagogical action.
- [x] Treat `ACQUIRE → INDEPENDENT → RETAIN → TRANSFER → STRETCH` as a teaching progression, not a single mastery enum.
- [x] Require Phase 1 evidence semantics (#42) before Phase 2 contract freeze (#43).
- [x] Separate conceptual support from access/load adjustments.
- [x] Require real `SkillState` and session-scoped `CurrentLearningState` in Teacher Runtime v1.
- [x] Make the Math vertical slice (#44) prove cross-renderer plumbing before Teacher Runtime (#45) interprets the resulting evidence.
- [x] Require source/scope provenance in the Math prototype without pulling full curriculum mapping forward.
- [x] Add a supervised real-child observation gate before broad curriculum/Grade-5 scale-up.
- [x] Freeze an explicit ownership matrix across Common, Study-Hub, Kani and backend roadmap #39.

## Medium ROI — adopt without blocking the first architecture merge

- [x] Record representation role (`PROVIDED`, `CHILD_SELECTED`, `CHILD_PRODUCED`) where observable.
- [x] Add bounded learner-agency teacher moves.
- [x] Add a compact feedback/teacher-voice policy rather than another large schema.
- [x] Tighten QR semantics: attempt-not-score gating, activity-completed-not-mastered, required return-to-learning.

## Deferred / not selected as separate architecture projects

- Native GitHub sub-issue relationships are useful project hygiene but do not change learning semantics.
- No new all-purpose learner score.
- No large gamification redesign before the first learning-loop observation.
- No competition implementation in v1; only future seams.
