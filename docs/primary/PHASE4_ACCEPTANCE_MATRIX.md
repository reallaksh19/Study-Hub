# Phase 4 — Primary Teacher Runtime v1 acceptance matrix

Tracking: Study-Hub #45  
Canonical semantics: Common #162  
Phase-3 journey prerequisite: Study-Hub #44 — complete

This matrix maps the #45 deliverables and acceptance criteria to executable implementation/tests. A check here means the behavior has an executable regression, not merely prose documentation.

## Deliverables

| #45 deliverable | Status | Executable evidence |
| --- | --- | --- |
| Primary Teacher Runtime contract/spec | ✅ | Common Primary runtime + diagnostic semantics; `docs/primary/PHASE4_TEACHER_RUNTIME_V1.md` |
| real `SkillState` read model | ✅ | `buildSkillState(...)`; `primaryTeacherRuntime.test.js`; replay matrix tests |
| session-scoped `CurrentLearningState` | ✅ | `buildCurrentLearningState(...)`; fatigue/same-route/repeated-response tests |
| minimal deterministic decision prototype | ✅ | `diagnosePrimaryEvidence(...)`, `decideTeacherMove(...)`, replay runner |
| synthetic replay fixtures A–H | ✅ | `integration/primary/replays/primary-teacher-runtime-synthetic-v1.json` |
| #44 fraction integration replay | ✅ | `runFractionTeacherReplay(...)`; serialized evidence-ingestion closure test |
| Common notebook/classwork replay | ✅ | pinned notebook fixture + `runNotebookTeacherReplay(...)` |
| replay runner / golden-output tests | ✅ | `primaryTeacherRuntimeReplays.js`, `.golden.json`, replay test |
| explainable decision trace | ✅ | each replay carries evidence refs, diagnosis/rationale, decision, move, expected child action |
| support fading | ✅ | H2 → H1 successes → `FADE_SUPPORT` → fresh H0 turn |
| same-route failure | ✅ | notebook replay requires task-structure variation after two written-route failures |
| work-trace preservation | ✅ | notebook regression keeps ordered correct/incorrect substeps |
| quantity/unit structure | ✅ | dozen/rate replay preserves and acts on conversion/rate chain |
| contrast-based diagnosis | ✅ | zero-place contrast + Common `DiagnosticProbe` fixture |
| stop rule | ✅ | learner-reported fatigue → `END_EPISODE` / `END_SESSION` |
| feedback policy | ✅ | teacher voice preserves usable work and names next observable action |
| bounded agency | ✅ | fast-independence replay → `OFFER_BOUNDED_CHOICE` for transfer |
| Kani/Study-Hub evidence → Observation hook | ✅ | `primaryTeacherRuntimeIngestion.js`; `validateKaniAttempt` before projection |
| independent retry after repair | ✅ | `verifyIndependentRetryAfterRepair(...)`; fresh H0 zero-place retry |
| provider-neutral behavior | ✅ | identical SQLite/Firebase evidence produces deep-equal educational trace |

## Acceptance criteria

| Criterion | Proof |
| --- | --- |
| decisions use more than latest answer | notebook contrast, performance-lapse and retention replays use prior evidence |
| session state remains ephemeral | `CurrentLearningState` rebuilt per session; fatigue/repeated-error signals are not copied into durable profile traits |
| wrong answer does not mechanically map to reteach | fraction replay → `INSUFFICIENT_EVIDENCE` → `ASK_TO_SHOW` |
| isolated lapse differs from stable misunderstanding | replay B → `PERFORMANCE_LAPSE` → independent retry |
| same failed method not repeated indefinitely | notebook and repeated-`I don't know` replays change route/representation |
| observable child work follows teaching | every repair/probe move names an expected child action; closure test observes fresh unsupported retry |
| conceptual support vs access adjustment stay distinct | replay C succeeds with `REDUCED_LANGUAGE` while conceptual support remains H0 |
| child-produced strategy support ≠ teacher hint | notebook replay preserves child-produced multiples tables at H0 |
| intermediate work survives incorrect final answer | notebook fixture substeps remain intact before diagnosis |
| successful contrasting items narrow hypotheses | 3496 ÷ 23 contrast narrows zero-place hypothesis |
| quantity/unit structure can drive diagnosis | replay H chooses unit-chain representation from structure, not final arithmetic alone |
| teacher annotations not child independent work | notebook annotation regression keeps teacher provenance separate |
| ambiguous photographed work remains ambiguous | notebook ambiguity regression preserves `AMBIGUOUS` value verbatim |
| repair includes independent retry | zero-place closure retry is fresh, H0, correct, and recorded as `CONFIRMED_IN_SESSION` |
| fast learner gets meaningful extension | replay E → transfer + bounded choice, not repetitive drill |
| retention is tested later, not assumed | replay F separates immediate independent success from later retrieval result |
| feedback policy visible | decision traces contain specific acknowledgement + concrete next action |
| bounded agency without weakening target | replay E changes response route, not learning target |
| decisions explainable from evidence/rules | golden trace + reason evidence refs + rationale on decisions |
| actual #44 journey passes runtime end-to-end | real Phase-3 attempt structure → explicit validated ingestion → Observation → runtime; #44 deployed journey already production-smoked |
| Common notebook regression passes end-to-end | pinned Common fixture → observations → contrast diagnosis → probe → narrow repair |
| runtime independent of SQLite/Firebase #39 | provider profile remains transport metadata and deep-equal educational traces are asserted |

## Evidence boundary and fail-closed rules

`primaryTeacherRuntimeIngestion.js` is the explicit boundary for serialized app evidence. It:

- validates every Kani attempt against `kani-attempt-v1`;
- rejects Teacher Runtime judgement/mastery/profile fields if smuggled into raw evidence;
- treats identical immutable-attempt replay as idempotent;
- rejects same `attemptId` with a different canonical payload;
- keeps `SQLITE` / `FIREBASE` as transport metadata only;
- does not pass provider profile into diagnosis or TeacherDecision logic.

## Repair verification semantics

A correct supported example is not independent repair evidence. The closure regression requires:

```text
confirmed mechanism
→ brief repair
→ fresh item
→ H0 conceptual support
→ INDEPENDENT_RETRY_AFTER_REPAIR
→ observed correct response
→ CONFIRMED_IN_SESSION
→ delayed retention still NOT_YET_TESTED
→ SCHEDULE_RETRIEVAL
```

`CONFIRMED_IN_SESSION` is deliberately not a mastery label and does not establish durability.

## Phase-4 exit

Phase #45 is ready to close when this matrix is green on the exact PR head and the repository CI build/audits pass. The next programme phase is #46, the Grade 4 English vertical slice.
