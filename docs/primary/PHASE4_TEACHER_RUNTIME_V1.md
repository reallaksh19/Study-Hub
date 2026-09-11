# Phase 4 — Primary Teacher Runtime v1

Tracking: Study-Hub #45  
Depends on: Study-Hub #44 (complete)  
Canonical educational semantics: `reallaksh19/Common` #162  
Pinned Common semantics: `integration/primary/common-semantic.lock.json`

## Authority boundary

This implementation is an **orchestration/read-model consumer** of Common semantics. It does not make Study-Hub the canonical owner of `Observation`, `SkillState`, `CurrentLearningState`, `ResponseDiagnosis`, `TeacherDecision`, `TeacherMove`, `MathematicalWorkEvidence`, `QuantityStructure`, support semantics, or learning-evidence meaning.

```text
COMMON semantic authority
        ↓
Study-Hub deterministic replay/orchestration
        ↓
Kani / Study-Hub observable evidence
```

Kani remains an evidence producer. Teacher diagnosis and pedagogical next action remain outside `kani-attempt-v1`.

## First executable increment

The first Phase-4 increment implements:

```text
observable attempt/work evidence
        ↓
Observation
        ↓
SkillState + CurrentLearningState
        ↓
ResponseDiagnosis hypothesis
        ↓
TeacherDecision
        ↓
TeacherMove + expected child action
```

Implementation:

```text
src/integration/primary/teacherRuntime/primaryTeacherRuntime.js
src/integration/primary/teacherRuntime/primaryTeacherRuntime.test.js
```

## Real Phase-3 fraction replay

The replay consumes actual Phase-3 fraction attempt structures produced by `makeFractionGameAttempt(...)` and proves:

- Common learning-object identity survives into the Teacher Runtime;
- immediate Kani accuracy updates recent/acquisition evidence but does not create a mastery claim;
- one wrong answer with insufficient causal evidence produces `DIAGNOSE_BEFORE_RETEACH`, not mechanical reteaching;
- a fresh independent return item is represented separately from game practice;
- successful independent return evidence still leaves delayed retention at `NOT_YET_TESTED`;
- the next move can therefore be `SCHEDULE_RETRIEVAL` rather than declaring durable learning.

## Common notebook replay

The Common-owned fixture is vendored byte-for-byte only so CI can replay it deterministically without network access:

```text
Common source commit:
00ef138bfc69c9ec062c7cddcc53a8f40a1a4f08

Common source path:
Primary/Architecture/contracts/v1/examples/division-notebook-work-replay.example.json

Git blob:
ab815dd59564c960e01d3eae4206a1bda2f1c353

Study-Hub snapshot:
integration/primary/common-fixtures/division-notebook-work-replay.example.json
```

`integration/primary/common-fixtures.lock.json` pins this provenance. The test recomputes the Git blob SHA so a local semantic edit fails CI.

The replay preserves:

- ordered work steps, including correct substeps before an incorrect final response;
- the two zero-in-quotient-place failures (`366 ÷ 12`, `7843 ÷ 13`);
- the stronger contrasting division item (`3496 ÷ 23`);
- child-produced multiples tables as `CHILD_PRODUCED` strategy evidence rather than conceptual hints;
- the dozen/rate `QuantityStructure` and its required unit-conversion chain;
- the wrong-operation word-problem observation;
- successful rounding evidence as a strength alongside other errors;
- teacher annotations with separate provenance;
- `AMBIGUOUS` work without reconstruction.

The resulting bounded hypothesis is:

```text
PROCEDURAL_ERROR
+ DIV_QUOTIENT_ZERO_PLACE_VALUE
+ MEDIUM confidence
```

It does **not** produce a broad `weak in division` label. Because the two relevant failures used substantially the same written-algorithm route, the next move changes task structure to a one-mechanism probe and records `INDEPENDENT_RETRY_AFTER_REPAIR` as the follow-up requirement.

## Read-model policy

`SkillState` is long-lived evidence summary material. `CurrentLearningState` is session-scoped only.

The current implementation explicitly carries:

```text
SkillState
- learningObjectId
- learningEvidence dimensions
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
- recent successes
- learner-reported fatigue signal
```

No session signal is automatically promoted into a durable learner trait.

## Teacher-move invariants exercised in this increment

- wrong answer ≠ automatic reteach;
- two same-route failures require a meaningful variation;
- work trace is preserved before diagnosis;
- contrasting successful work narrows the hypothesis;
- access support remains separate from conceptual support;
- child-produced strategy support is not teacher hint dependence;
- repair requires a later independent retry;
- immediate independent success does not imply retention;
- feedback names usable thinking and asks for the next observable action rather than using fixed-ability labels.

## Still required before #45 closes

This first increment does **not** complete Phase #45. Remaining work includes the full deterministic synthetic replay matrix A–H, explicit support-fading replay, bounded-agency replay, language-access replay, stop-rule fixture, independent-retry-after-repair replay, golden trace outputs, and any integration hook needed to consume deployed Kani/Study-Hub evidence without fixture construction.
