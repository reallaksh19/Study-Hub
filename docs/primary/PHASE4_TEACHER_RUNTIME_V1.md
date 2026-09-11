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

The Phase-4 implementation now exercises:

```text
observable attempt/work evidence
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
src/integration/primary/teacherRuntime/primaryTeacherRuntime.test.js
src/integration/primary/teacherRuntime/primaryTeacherRuntimeReplays.test.js
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

This avoids needlessly changing the already-deployed Phase-3 fraction semantic reference while still requiring the Phase-4 runtime to consume:

```text
Primary/Architecture/PRIMARY_DIAGNOSTIC_REASONING.md
Primary/Architecture/contracts/v1/primary-diagnostic-reasoning.schema.json
```

The companion schema Git blob is pinned as:

```text
52689b92ea095c318ed66f9b6b37f6232e43ba2e
```

Core diagnostic invariants consumed here are:

```text
CHILD_PRODUCED != CHILD_INITIATED != INDEPENDENT
contrast set != arbitrary pattern matching
diagnostic probe != extra practice question
teacher correction != child independent evidence
renderer evidence != invented work trace
```

## Real Phase-3 fraction replay

The replay consumes actual Phase-3 fraction attempt structures produced by `makeFractionGameAttempt(...)` and proves:

- Common learning-object identity survives into the Teacher Runtime;
- immediate Kani accuracy updates recent/acquisition evidence but does not create a mastery claim;
- one wrong answer with insufficient causal evidence produces `DIAGNOSE_BEFORE_RETEACH`, not mechanical reteaching;
- a fresh independent return item is represented separately from game practice;
- successful independent return evidence still leaves delayed retention at `NOT_YET_TESTED`;
- the next move can therefore be `SCHEDULE_RETRIEVAL` rather than declaring durable learning.

## Common notebook and diagnostic replays

The Common-owned notebook fixture remains vendored byte-for-byte for deterministic offline CI:

```text
Primary/Architecture/contracts/v1/examples/division-notebook-work-replay.example.json
Git blob: ab815dd59564c960e01d3eae4206a1bda2f1c353
```

The first-class diagnostic reasoning fixture is also vendored byte-for-byte:

```text
Primary/Architecture/contracts/v1/examples/division-zero-place-diagnostic-probe.example.json
Git blob: 2beb4c1d32a2490a109001321c493e5da888fa59
```

`integration/primary/common-fixtures.lock.json` records the source commit and blob for each snapshot. CI recomputes the Git blob SHA so Study-Hub cannot silently redefine Common semantics.

The notebook replay preserves:

- ordered work steps, including correct substeps before an incorrect final response;
- the two zero-in-quotient-place failures (`366 ÷ 12`, `7843 ÷ 13`);
- the stronger contrasting division item (`3496 ÷ 23`);
- child-produced multiples tables as child-produced strategy evidence rather than conceptual-hint dependence;
- the dozen/rate `QuantityStructure` and its required unit-conversion chain;
- the wrong-operation word-problem observation;
- successful rounding evidence as a strength alongside other errors;
- teacher annotations with separate provenance;
- `AMBIGUOUS` work without reconstruction.

The bounded notebook hypothesis remains:

```text
PROCEDURAL_ERROR
+ DIV_QUOTIENT_ZERO_PLACE_VALUE
+ MEDIUM confidence
```

The diagnostic companion then compares controlled cases around:

```text
focal feature: QUOTIENT_ZERO_REQUIRED
controlled load: LOW language / LOW novelty / LOW fact retrieval / SMALL step count
```

For the canonical controlled result:

```text
84 ÷ 4   → CORRECT
408 ÷ 4  → INCORRECT
```

confidence increases for `H-DIV-ZERO-PLACE`, the runtime repairs only that mechanism, and a fresh independent retry is required.

## Synthetic learner replay matrix A–H

The deterministic fixture lives at:

```text
integration/primary/replays/primary-teacher-runtime-synthetic-v1.json
```

Golden decision traces live at:

```text
integration/primary/replays/primary-teacher-runtime-synthetic-v1.golden.json
```

The matrix covers:

| Replay | Required distinction | Expected runtime behavior |
| --- | --- | --- |
| A | genuine concept confusion across representations | change representation; do not merely repeat explanation |
| B | isolated lapse after prior success/self-correction | fresh independent retry, not broad reteach |
| C | language bottleneck | reduce language as access support while conceptual support remains H0 |
| D | repeated “I don't know” through one route | materially change representation/route |
| E | fast unsupported independence + secure delayed evidence | transfer/stretch with bounded learner choice |
| F | immediate success vs delayed failure | schedule retrieval first; later failure becomes separate retention evidence |
| G | notebook contrast + first-class DiagnosticProbe | update competing hypothesis and repair only confirmed zero-place mechanism |
| H | grouped-unit/rate chain failure | expose quantity → unit → conversion → rate structure before arithmetic repair |

The replay runner also includes explicit auxiliary checks for:

- support fading (`H2 → H1 → next H0 independent turn`);
- learner-reported fatigue stop rule;
- feedback that preserves usable thinking and requests an observable next action;
- no single mastery score or fixed learner label.

## Read-model policy

`SkillState` is long-lived evidence summary material. `CurrentLearningState` is session-scoped only.

The runtime carries:

```text
SkillState
- learningObjectId
- multidimensional learning evidence
- evidenceRefs
- recentEvidence
- priorIndependentEvidence
- retentionEvidence
- transferEvidence
- supportDependency
- evidenceConfidence

CurrentLearningState
- sessionId
- learningObjectIds
- current conceptual support
- current access adjustments
- recent observations
- repeated errors
- repeated-question signal
- same-route failure count
- repeated I-don't-know signal when observable
- recent successes
- learner-reported fatigue signal
```

No session signal is automatically promoted into a durable learner trait.

## Teacher-move invariants now exercised

- wrong answer ≠ automatic reteach;
- two same-route failures require a meaningful variation;
- repeated “I don't know” cannot trigger the identical prompt indefinitely;
- work trace is preserved before diagnosis;
- contrasting successful work narrows hypotheses;
- diagnostic probes manipulate a declared feature while holding unrelated load low;
- unresolved probe outcomes keep competing hypotheses open;
- access support remains separate from conceptual support;
- child-produced strategy support is not automatically independent strategy selection;
- quantity/unit structure can drive diagnosis independently of final arithmetic;
- repair requires a later independent retry;
- support can fade explicitly;
- immediate independent success does not imply retention;
- fast independence receives bounded agency and transfer rather than repetitive drills;
- learner-reported fatigue can end the episode without becoming a durable trait;
- feedback names usable thinking and asks for the next observable action rather than using fixed-ability labels.

## Still required before #45 closes

The deterministic core and replay matrix are now in place, but #45 should remain open until the remaining integration/closure checks are completed:

- prove an explicit deployed evidence → runtime ingestion seam rather than fixture construction only;
- add a direct independent-retry-after-repair replay result, not only the required follow-up marker;
- confirm diagnostic reasoning remains backend/provider independent under #39 profiles;
- review issue #45 acceptance items against executable tests and close any uncovered gaps;
- only then mark Phase 4 complete and advance #46.
