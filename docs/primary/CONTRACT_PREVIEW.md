# Phase 2 minimum contract candidate

Tracking: Study-Hub #43  
Prerequisites: #41 and #42 complete  
Backend/provider track: #39

The first executable candidate lives in:

```text
src/integration/contracts/primaryLearningContracts.js
src/integration/contracts/primaryLearningContracts.test.js
```

This phase deliberately keeps the surface small. It does not create a second question schema or put Teacher Runtime judgement into Kani attempts.

## 1. `primary-learning-episode-v1`

`LearningEpisode` is the pedagogical plan for one target encounter. It owns:

- stable `episodeId`;
- canonical `learningObjectIds`;
- teaching purpose (`ACQUIRE`, `REPAIR`, `INDEPENDENT`, `RETAIN`, `TRANSFER`, `STRETCH`);
- prerequisite assumptions;
- evidence goals;
- ordered semantic steps;
- required independent check;
- optional delayed-retrieval obligation.

Each step states what the **child must do**, not only what the system displays.

The validator requires `independentCheck.stepId` to reference an `INDEPENDENT_CHECK` step. If delayed retrieval is required, its step must reference a `RETRIEVAL` step.

## 2. `primary-experience-manifest-v1`

`ExperienceManifest` maps LearningEpisode steps to concrete renderers:

```text
STUDY_HUB
PRINT
KANI
ORAL
DELAYED_RETRIEVAL
```

It is orchestration metadata, not curriculum truth.

A Kani-rendered step references a `missionId`; other steps reference an `activityId` or source artifact. Cross-document validation requires the manifest `learningEpisodeId` and step IDs to resolve against the episode.

## 3. `kani-mission-v1`

`KaniMissionV1` is deliberately small. It carries:

- `missionId`;
- `learningEpisodeId`;
- canonical `learningObjectIds`;
- mission purpose;
- evidence goals;
- canonical question or question-family references;
- renderer preference;
- support/timer policy;
- launch/completion/return policy.

Required semantics:

```yaml
launchPolicy:
  gate: ATTEMPT_NOT_SCORE

completionPolicy:
  means: ACTIVITY_COMPLETED

returnPolicy:
  required: true
  endlessGameChain: false
```

Mission payloads must not embed:

- `studentId`;
- answer truth;
- child profile;
- curriculum ontology;
- mastery/durable learning judgement.

Learner identity binds at runtime through the existing Kani activity/attempt flow.

## 4. Primary attempt evidence envelope

Rather than adding many unrelated top-level fields to `kani-attempt-v1`, the candidate defines one bounded observable-evidence object that can later be added as an optional envelope, e.g.:

```yaml
primaryEvidence:
  learningEpisodeId: episode-g4-fraction-equivalence-001
  learningObjectIds:
    - MATH-FRACTION-EQUIVALENCE
  questionFamilyId: fraction-equiv-visual-family
  selfCorrected: true

  conceptualSupport:
    level: H1
    type: PROMPT

  accessAdjustments:
    - REDUCED_LANGUAGE
    - ONE_STEP_AT_A_TIME

  representation:
    type: FRACTION_MODEL
    role: CHILD_SELECTED

  responseMode: DRAWN
```

### Why an envelope

It gives Primary evidence one explicit semantic boundary, avoids top-level contract sprawl, and allows later additive fields without confusing canonical attempt identity with Teacher Runtime judgement.

The envelope may contain only observable or authored response evidence. It rejects known interpretation fields such as:

```text
diagnosis
teacherDecision
masteryState
nextLearningAction
```

`errorSignature`, when present, is explicitly an `AUTHORED_RESPONSE_CLASSIFICATION`, not a tutor diagnosis.

## 5. Conceptual help and access support remain separate

```yaml
conceptualSupport:
  level: H1
  type: PROMPT

accessAdjustments:
  - REDUCED_LANGUAGE
  - ORAL_RESPONSE_ALLOWED
```

A child succeeding after shorter wording must not be recorded as requiring a mathematical hint merely because an access adjustment was used.

## 6. Representation role is evidence

```yaml
representation:
  type: BAR_MODEL
  role: PROVIDED | CHILD_SELECTED | CHILD_PRODUCED
```

Being shown a representation is not equivalent to independently choosing or producing it.

## 7. Longitudinal evidence is NOT raw attempt evidence

Teacher Runtime may later derive independent dimensions such as:

```text
acquisition
independent use
delayed retention
transfer
stretch
```

Those judgements are intentionally absent from `primaryEvidence` and from `KaniMissionV1`.

## Versioning decision

Candidate contract IDs:

```text
primary-learning-episode-v1
primary-experience-manifest-v1
kani-mission-v1
```

All start at schema version `1.0`.

For `kani-attempt-v1`, the preferred compatibility path is **one optional additive `primaryEvidence` envelope**, because the existing JSON contract permits additive properties. The existing canonical identity fields and immutable/idempotent `attemptId` semantics do not change.

Before production consumption, the accepted schemas must be added to the machine-readable Study-Hub platform registry and the Kani immutable upstream lock must be updated to the exact Study-Hub commit/schema hashes. No consumer may track `main` implicitly.

## Phase-2 registration gate

The current executable module is a reviewable candidate. #43 is not complete until:

1. candidate semantics pass CI and review;
2. machine-readable schemas/fixtures are registered deterministically;
3. `kani-attempt-v1` receives the accepted optional `primaryEvidence` envelope in its canonical validator/schema;
4. Kani updates its upstream contract lock and local validator/types without changing learner identity or persistence semantics;
5. the Grade 4 fraction fixture resolves across Episode → Manifest → Mission → Attempt evidence.
