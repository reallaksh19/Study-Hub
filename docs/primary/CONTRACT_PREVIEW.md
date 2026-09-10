# Phase 2 Common-backed transport contract candidate

Tracking: Study-Hub #43  
Canonical education semantics: Common #162 / PR #163 + #164  
Backend/provider track: Study-Hub #39

## Authority correction

The earlier Phase-2 prototype defined `LearningEpisode` and other educational semantics directly in Study-Hub. That was useful for exploration, but it is **not the final ownership model**.

Canonical meaning now lives in `reallaksh19/Common`:

```text
Common
  Primary educational semantics
        ↓
Study-Hub
  transport / orchestration adapters
        ↓
Kani
  game runtime / immutable observations
```

Study-Hub pins Common through:

```text
integration/primary/common-semantic.lock.json
```

The executable transport candidate lives in:

```text
src/integration/contracts/primaryTransportContracts.js
src/integration/contracts/primaryTransportContracts.test.js
```

## 1. Common semantic lock

The lock records:

- semantic authority repository;
- semantic version;
- immutable Common commit;
- canonical schema path;
- schema Git blob SHA;
- architecture and Teacher Runtime paths.

Study-Hub transport must fail closed when two payloads reference different Common semantic authorities/versions/commits.

## 2. `CommonLearningEpisodeProjection`

Study-Hub does **not** redefine `LearningEpisode`.

It consumes a minimal routing projection of the canonical Common episode:

```yaml
transportVersion: '1.0'
semanticRef: ...
episodeId: EP-G4-FRAC-EQUIV-001
teachingTargetId: TT-G4-FRAC-EQUIV-001
learningObjectIds:
  - MATH-FRAC-EQUIVALENCE
steps:
  - stepId: STEP-1
    role: TEACH
  - stepId: STEP-4
    role: INDEPENDENT_CHECK
independentCheckRequired: true
```

The projection carries only enough information to route the experience while preserving canonical IDs and obligations. It deliberately omits child profile, SkillState, diagnosis, TeacherDecision, TeacherMove content, canonical explanations and answer truth.

## 3. `ExperienceManifest`

`ExperienceManifest` is Study-Hub-owned operational orchestration. It maps Common episode step IDs to renderers:

```text
STUDY_HUB
PRINT
KANI
ORAL
DELAYED_RETRIEVAL
```

A Kani-rendered step must reference a `missionId`; other steps use an `activityId` or source artifact.

Cross-document validation requires:

- exact Common semantic-ref match;
- matching `learningEpisodeId`;
- every manifest step to exist in the Common episode projection.

The manifest is not curriculum truth and does not define pedagogical semantics.

## 4. `KaniMissionV1`

`KaniMissionV1` is a small renderer hand-off. It carries:

- exact Common semantic ref;
- `missionId` and `learningEpisodeId`;
- canonical `learningObjectIds`;
- purpose/evidence-goal references;
- canonical question IDs or question-family references;
- renderer preference;
- support/timer policy transport;
- launch/completion/return policy.

Required app semantics:

```yaml
launchPolicy:
  gate: ATTEMPT_NOT_SCORE

completionPolicy:
  means: ACTIVITY_COMPLETED

returnPolicy:
  required: true
  endlessGameChain: false
```

Mission payloads reject learner identity, answer truth, child/SkillState, diagnosis, TeacherDecision/TeacherMove, explanation content and mastery judgement, including when those values are nested.

Learner identity binds at Kani runtime through the existing activity/attempt path.

## 5. Primary evidence transport envelope

The candidate keeps Primary-specific observable evidence in one bounded envelope intended for later optional addition to `kani-attempt-v1`:

```yaml
primaryEvidence:
  semanticVersion: '1.0'
  learningEpisodeId: EP-G4-FRAC-EQUIV-001
  learningObjectIds:
    - MATH-FRAC-EQUIVALENCE
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

The meanings of `H1`, `REDUCED_LANGUAGE`, `CHILD_SELECTED`, etc. are owned by the pinned Common semantic contract. Study-Hub transports these tokens; it does not redefine their educational meaning.

Known pedagogical judgement fields such as `diagnosis`, `teacherDecision`, `teacherMove`, `masteryState`, `nextLearningAction`, `childProfile`, and `skillState` are rejected from the raw evidence envelope.

`errorSignature`, when present, must be explicitly authored/observable response classification, not speculative Teacher Runtime diagnosis.

## 6. Existing `kani-*` contracts remain Study-Hub-owned transport

This ownership correction does not move the existing integration registry out of Study-Hub:

```text
kani-content-v1
kani-catalog-v1
kani-activity-v1
kani-attempt-v1
```

Those remain cross-application transport/version contracts. Common owns the educational meaning referenced by new Primary fields; Study-Hub owns serialization and compatibility locking.

No second canonical question schema is introduced.

## 7. Versioning direction

The Common semantic version is independently pinned from the Study-Hub transport version.

```text
Common semantic version: 1.0
Study-Hub Primary transport: 1.0
```

A transport-only serialization change need not change Common semantics. A change in the educational meaning of learning state, support, diagnosis, evidence dimensions or TeacherMove must land in Common first.

For `kani-attempt-v1`, the preferred path remains one backward-compatible optional `primaryEvidence` envelope if runtime-validator and cross-repo compatibility tests confirm it. Existing attempt identity and idempotency semantics do not change.

## 8. Grade 4 fractions prototype

The transport test mirrors the canonical Common Grade 4 fraction-equivalence fixture:

```text
Common episode
→ Study-Hub teaching route
→ print guided route
→ Kani representation-shift mission
→ Study-Hub independent return
→ delayed retrieval marker
```

The same canonical learning object and episode identity survive the routing path.

## Phase-2 completion gate

#43 is not complete until:

1. Common semantic authority is pinned and verified;
2. Study-Hub transport/adapters no longer define canonical Primary pedagogy;
3. ExperienceManifest and KaniMission transport candidates pass tests;
4. bounded `primaryEvidence` is deliberately added to the canonical `kani-attempt-v1` validator/schema or a versioned alternative is justified;
5. machine-readable transport fixtures/registry are deterministic;
6. Kani updates its immutable upstream lock and local validation/types;
7. the Common fraction episode resolves through Study-Hub transport into Kani attempt evidence and required return-to-learning;
8. backend/provider profile #39 has no effect on semantics.
