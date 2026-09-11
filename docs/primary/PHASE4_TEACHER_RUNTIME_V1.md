# Phase 4 — Primary Teacher Runtime v1

Tracking: Study-Hub #45  
Depends on: Study-Hub #44 (complete)  
Canonical educational semantics: `reallaksh19/Common` #162  
Pinned Common semantics: `integration/primary/common-semantic.lock.json`

## Authority boundary

This implementation is an **orchestration/read-model consumer** of Common semantics. It does not make Study-Hub the canonical owner of `Observation`, `SkillState`, `CurrentLearningState`, `ResponseDiagnosis`, `TeacherDecision`, `TeacherMove`, `MathematicalWorkEvidence`, `QuantityStructure`, `ContrastSet`, `DiagnosticProbe`, support semantics, or learning-evidence meaning.

```text
COMMON semantic authority
        ↓
Study-Hub deterministic replay/orchestration
        ↓
Kani / Study-Hub observable evidence
```

Kani remains an evidence producer. Teacher diagnosis and pedagogical next action remain outside `kani-attempt-v1`.

## Executable runtime

The Phase-4 implementation exercises:

```text
serialized attempt/work evidence
        ↓
validated ingestion boundary
        ↓
Observation
        ↓
SkillState + CurrentLearningState
        ↓
structural contrast / bounded hypotheses
        ↓
DiagnosticProbe when needed
        ↓
ResponseDiagnosis
        ↓
TeacherDecision
        ↓
TeacherMove + expected child action
        ↓
independent retry / retrieval / transfer
```

Implementation:

```text
src/integration/primary/teacherRuntime/primaryTeacherRuntime.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeReplays.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeIngestion.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeClosure.js
src/integration/primary/teacherRuntime/primaryTeacherRuntime.test.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeReplays.test.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeClosure.test.js
```

## Common semantic lock

The Phase-3 primary semantic reference remains pinned to:

```text
00ef138bfc69c9ec062c7cddcc53a8f40a1a4f08
```

The newer canonical diagnostic-reasoning companion is pinned independently to Common commit:

```text
eaa548033d1daa398bcf35a60d1873d1ed3c5df3
```

This keeps the deployed Phase-3 fraction semantic reference stable while requiring the Phase-4 runtime to consume:

```text
Primary/Architecture/PRIMARY_DIAGNOSTIC_REASONING.md
Primary/Architecture/contracts/v1/primary-diagnostic-reasoning.schema.json
```

Diagnostic companion schema Git blob:

```text
52689b92ea095c318ed66f9b6b37f6232e43ba2e
```

Core invariants:

```text
CHILD_PRODUCED != CHILD_INITIATED != INDEPENDENT
contrast set != arbitrary pattern matching
diagnostic probe != extra practice question
teacher correction != child independent evidence
renderer evidence != invented work trace
```

## Real Phase-3 fraction replay and ingestion

The runtime consumes actual Phase-3 fraction attempt structures produced by `makeFractionGameAttempt(...)`. The closure increment adds an explicit serialized evidence boundary that:

- validates each payload as `kani-attempt-v1` before projection;
- rejects diagnosis, TeacherDecision/TeacherMove, mastery and profile/state leakage in raw evidence;
- preserves identical `attemptId` replay as idempotent and rejects conflicting immutable payloads;
- combines Kani attempts with the non-game Study-Hub return observation;
- keeps SQLite/Firebase provider profile as transport metadata only;
- produces the same educational trace for the same canonical evidence under both profiles.

The replay proves immediate Kani accuracy updates recent/acquisition evidence without a mastery claim, a wrong answer with insufficient causal evidence causes probing rather than mechanical reteaching, and successful independent return still leaves delayed retention at `NOT_YET_TESTED`.

## Common notebook and diagnostic replays

Pinned Common fixtures:

```text
Primary/Architecture/contracts/v1/examples/division-notebook-work-replay.example.json
Git blob: ab815dd59564c960e01d3eae4206a1bda2f1c353

Primary/Architecture/contracts/v1/examples/division-zero-place-diagnostic-probe.example.json
Git blob: 2beb4c1d32a2490a109001321c493e5da888fa59
```

`integration/primary/common-fixtures.lock.json` records source commit and blob per snapshot. CI recomputes the Git blobs so Study-Hub cannot silently redefine Common semantics.

The notebook replay preserves ordered work steps, zero-in-quotient failures, the stronger `3496 ÷ 23` contrast, child-produced multiples tables, the dozen/rate `QuantityStructure`, wrong-operation evidence, successful rounding evidence, teacher provenance, and ambiguity.

The bounded hypothesis is:

```text
PROCEDURAL_ERROR
+ DIV_QUOTIENT_ZERO_PLACE_VALUE
+ MEDIUM confidence
```

The controlled Common probe compares `84 ÷ 4` with `408 ÷ 4` while keeping language, novelty and fact-retrieval load low. Correct no-zero plus incorrect zero-required performance increases `H-DIV-ZERO-PLACE`; unresolved probe results keep competing hypotheses open rather than inventing certainty.

## Synthetic learner replay matrix A–H

Fixture:

```text
integration/primary/replays/primary-teacher-runtime-synthetic-v1.json
```

Golden trace:

```text
integration/primary/replays/primary-teacher-runtime-synthetic-v1.golden.json
```

| Replay | Distinction | Runtime behavior |
| --- | --- | --- |
| A | genuine concept confusion across representations | change representation; do not repeat the same explanation |
| B | isolated lapse after prior success/self-correction | fresh independent retry, not broad reteach |
| C | language bottleneck | reduce language as access support while conceptual support remains H0 |
| D | repeated “I don't know” through one route | materially change representation/route |
| E | fast unsupported independence + secure delayed evidence | transfer with bounded learner choice |
| F | immediate success vs delayed failure | schedule retrieval; later failure becomes separate retention evidence |
| G | notebook contrast + first-class DiagnosticProbe | update competing hypothesis and repair only confirmed zero-place mechanism |
| H | grouped-unit/rate chain failure | expose quantity → unit → conversion → rate before arithmetic repair |

Auxiliary replays cover explicit support fading, learner-reported fatigue stop behavior, specific teacher voice, and prohibition of a single mastery score/fixed learner label.

## Independent retry after repair

Phase 4 now observes the repair verification step directly rather than merely emitting a follow-up marker:

```text
confirmed narrow mechanism
→ one brief repair/model
→ fresh zero-place item
→ H0 conceptual support
→ INDEPENDENT_RETRY_AFTER_REPAIR
→ correct response
→ CONFIRMED_IN_SESSION
→ durability NOT_ESTABLISHED
→ delayed retention NOT_YET_TESTED
→ SCHEDULE_RETRIEVAL
```

A supported retry (H1+) is rejected as independent repair verification.

## Read-model policy

`SkillState` is long-lived evidence-summary material. `CurrentLearningState` is session-scoped only. No session signal is automatically promoted into a durable learner trait.

## Teacher-move invariants exercised

- wrong answer ≠ automatic reteach;
- two same-route failures require meaningful variation;
- repeated “I don't know” cannot trigger the same prompt indefinitely;
- work trace is preserved before diagnosis;
- contrasting success narrows hypotheses;
- diagnostic probes manipulate a declared feature while controlling unrelated load;
- unresolved probes keep uncertainty open;
- access support remains separate from conceptual support;
- child-produced strategy support does not imply independent initiation;
- quantity/unit structure can drive diagnosis independently of final arithmetic;
- repair is followed by a fresh unsupported retry;
- support can fade explicitly;
- immediate success does not imply delayed retention;
- fast independence receives bounded agency and transfer;
- learner-reported fatigue can end the episode without creating a durable trait;
- backend/provider choice has zero semantic effect;
- feedback preserves usable thinking and requests the next observable action.

## Acceptance traceability

See `docs/primary/PHASE4_ACCEPTANCE_MATRIX.md` for the deliverable-by-deliverable and criterion-by-criterion executable evidence map.

Phase #45 may close only after the exact closure PR head passes unit/contract tests, content audits and production build. After that, the roadmap advances to #46 Grade 4 English.
