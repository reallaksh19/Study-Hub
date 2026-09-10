# Primary Grades 4–5 — Study-Hub integration view

**Status:** integration/orchestration view  
**Canonical educational architecture:** `reallaksh19/Common/Primary/Architecture/`  
**Common tracking:** https://github.com/reallaksh19/Common/issues/162  
**Programme roadmap:** Study-Hub #40  
**Backend/provider architecture:** Study-Hub #39

## 1. Authority

The Phase-0 document originally explored both educational and application architecture inside Study-Hub. Canonical educational meaning has now moved to Common.

Use this boundary:

```text
COMMON
  LearningObject / LearningEpisode meaning
  learner-state semantics
  Teacher Runtime
  support / representation / evidence semantics
  source-boundary and curriculum-mapping semantics
        ↓
STUDY-HUB
  renderer orchestration
  publication / print journeys
  ExperienceManifest instances
  KaniMission transport
  QR routing
  cross-app transport/version registry
        ↓
KANI
  game rendering
  stable learner identity
  immutable observations / attempts
  deterministic recent-evidence summaries
```

Study-Hub must not redefine `SkillState`, `CurrentLearningState`, `TeacherMove`, longitudinal mastery/retention/transfer meaning, or source-boundary semantics.

## 2. Canonical Common files

Primary educational semantics are governed by Common, including:

```text
Primary/Architecture/PRIMARY_INTEGRATED_ARCHITECTURE.md
Primary/Architecture/PRIMARY_TEACHER_RUNTIME.md
Primary/Architecture/SEMANTIC_OWNERSHIP.md
Primary/Architecture/APP_INTEGRATION_HANDOFF.md
Primary/Architecture/contracts/v1/primary-learning-semantics.schema.json
skills/primary-teacher-runtime/SKILL.md
```

Study-Hub pins the accepted version through:

```text
integration/primary/common-semantic.lock.json
```

No Study-Hub consumer may silently track the Common `main` branch as semantic authority.

## 3. Study-Hub responsibilities

Study-Hub owns the operational bridge from canonical learning semantics to delivery applications:

```text
Common LearningEpisode
        ↓ projection / adapter
ExperienceManifest
        ↓
Study-Hub | Print/PDF | Kani | Oral | Delayed Retrieval
```

The application may decide where an already-defined episode step is rendered. It may not change what `INDEPENDENT_CHECK`, conceptual support, representation role, or delayed retention mean.

## 4. Evidence boundary

```text
Kani raw attempt
      ↓
recent deterministic evidence summary
      ↓
Primary Teacher Runtime (Common semantics)
      ↓
learning judgement / next pedagogical action
```

Study-Hub may transport/display all of these layers, but transport does not confer semantic ownership.

## 5. Kani mission boundary

A Kani mission is an app hand-off, not a curriculum package.

It may carry canonical IDs, evidence-goal/question references, renderer policy, and completion/return routing.

It must not embed:

- learner identity in a printed mission/QR;
- duplicate answer truth;
- child profile / SkillState;
- diagnosis / TeacherDecision / TeacherMove;
- durable mastery judgement;
- canonical explanations merely to make the game self-contained.

Required app semantics remain:

```yaml
launchPolicy:
  gate: ATTEMPT_NOT_SCORE
completionPolicy:
  means: ACTIVITY_COMPLETED
returnPolicy:
  required: true
  endlessGameChain: false
```

## 6. Existing transport authority

Study-Hub remains authority for the existing cross-app contract registry:

```text
kani-content-v1
kani-catalog-v1
kani-activity-v1
kani-attempt-v1
```

These are transport/version contracts. New Primary fields must reference Common semantic meaning rather than create a parallel pedagogy model.

## 7. Phase sequence

```text
#41 Study-Hub architecture prototype ✅
      ↓
#42 Kani evidence semantics ✅
      ↓
Common #162 / PR #163 + #164 ✅
      ↓
#43 Common-backed Study-Hub transport/adapters ← ACTIVE
      ↓
#44 Grade 4 fractions plumbing
      ↓
#45 Teacher Runtime replay
      ↓
#46 Grade 4 English vertical slice
      ↓
#50 supervised real-child observation
      ↓
#47 curriculum overlays
      ↓
#48 Grade 5 + future competition seams
```

## 8. Provider independence

Study-Hub #39 remains orthogonal:

```text
Primary educational semantics ⟂ SQLite / Firebase / future provider
```

Provider choice may change persistence, sync, availability, and deployment mechanics. It may not change the meaning of evidence or the next teaching decision.