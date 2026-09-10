# Primary Grades 4–5 Integrated Learning Architecture

Status: **Phase 0 working draft**

Tracking roadmap: Study-Hub #40  
Phase 0: Study-Hub #41  
Backend/provider architecture: Study-Hub #39

## 1. Purpose

This note defines the educational and implementation boundaries for the Grade 4–5 Primary Learning Platform across Common, Study-Hub and Kani Game App.

The educational centre is the child/teacher loop:

```text
CHILD
  ↕
OBSERVE → DIAGNOSE → DECIDE → TEACHER MOVE → CHILD ATTEMPT
  ↕
LEARNING EPISODE
  ↓
LEARNING EVIDENCE
  ↓
NEXT TEACHER DECISION
```

Core 1/Core 2 remain useful implementation infrastructure, but they are not the conceptual centre of primary teaching.

## 2. Permanent ownership boundary

| Concern | Authority |
|---|---|
| Canonical Math/English learning semantics | Common |
| Curriculum/source semantic rules | Common |
| Primary Teacher Runtime specification | Common |
| Cross-repo transport/version contracts | Study-Hub |
| LearningEpisode / ExperienceManifest orchestration | Study-Hub |
| Teacher Runtime reference execution v1 | Study-Hub |
| Stable learner identity | Kani Game App |
| Immutable raw attempts | Kani Game App |
| Game rendering / mechanics | Kani Game App |
| Recent deterministic evidence summaries | Kani/shared evidence library, **non-authoritative** |
| Durable learning judgement | Primary Teacher Runtime |
| Next pedagogical action | Primary Teacher Runtime |
| SQLite/Firebase/storage profile | #39 infrastructure only |

### 2.1 Evidence is not judgement

Freeze this dependency:

```text
Kani RawAttemptEvidence
        ↓
RecentEvidenceSummary
        ↓
Primary Teacher Runtime
        ↓
LearningJudgement
        ↓
TeacherDecision
        ↓
NextLearningAction
```

A recent evidence summary may state that evidence is weak, building or strong. It must not independently prescribe pedagogical actions such as reteaching with a specific representation.

Kani remains the runtime/evidence authority for attempts, not a second teacher brain.

## 3. Learning evidence is multidimensional

`ACQUIRE → INDEPENDENT → RETAIN → TRANSFER → optional STRETCH` is a teaching progression, **not one exclusive learner-state enum**.

Preferred shape:

```yaml
learning_evidence:
  acquisition: SECURE
  independent_use: SECURE
  delayed_retention: NOT_YET_TESTED
  transfer: DEVELOPING
  stretch: NOT_YET_TESTED
```

The platform must be able to represent evidence in one dimension without implying evidence in the others.

## 4. Primary learner state

Long-lived learner evidence and current-session state are separate.

```text
ChildLearningProfile
        ≠
CurrentLearningState
```

`ChildLearningProfile` may contain stable or repeatedly observed learning information. `CurrentLearningState` is session-scoped and may contain recent errors, current support, repeated questions, recent successes or learner-reported fatigue.

One session must not silently create a durable learner trait.

## 5. Support semantics

### 5.1 Conceptual support is different from access support

Do not collapse all help into one hint level.

```yaml
conceptual_support:
  level: H1
  type: PROMPT

access_adjustments:
  - REDUCED_LANGUAGE
  - ONE_STEP_AT_A_TIME
  - ORAL_RESPONSE_ALLOWED
```

A child who solves a mathematical problem after unnecessary language load is reduced has not necessarily required a mathematical hint.

### 5.2 Representation evidence includes role

Where observable, distinguish:

```text
PROVIDED
CHILD_SELECTED
CHILD_PRODUCED
```

Seeing a bar model is different evidence from independently choosing or producing one.

## 6. Teacher Runtime v1

The minimum runtime loop is:

```text
Observation
  ↓
ResponseDiagnosis
  ↓
TeacherDecision
  ↓
TeacherMove
  ↓
ChildAction
  ↓
New Evidence
  ↺
```

A diagnosis is a hypothesis, not a permanent child label.

Minimum candidate teacher moves include:

```text
MODEL
THINK_ALOUD
ASK_TO_NOTICE
ASK_TO_SHOW
ASK_TO_EXPLAIN
RETRIEVE_PRIOR_KNOWLEDGE
BREAK_INTO_STEPS
REDUCE_LANGUAGE
CHANGE_REPRESENTATION
PROMPT
HINT
COMPARE
GIVE_INDEPENDENT_TURN
FADE_SUPPORT
EXTEND
CHANGE_ACTIVITY
OFFER_BOUNDED_CHOICE
ASK_TO_REFLECT
ASK_CHILD_TO_CHOOSE_REPRESENTATION
ASK_CHILD_TO_CREATE_EXAMPLE
END_SESSION
SCHEDULE_RETRIEVAL
```

### 6.1 Same-route failure invariant

```text
IF same concept
AND two unsuccessful attempts
AND substantially the same teaching route
THEN the next move MUST vary a meaningful dimension.
```

Variation may include representation, language, example/context, task size, response mode or concrete model.

### 6.2 Child action invariant

In tutor mode, substantial teaching chunks must be followed by observable learner action rather than a chain of explanations.

### 6.3 Feedback policy

Teacher-facing delivery should:

- preserve the correct part of the learner's thinking;
- identify the next useful action;
- avoid fixed-ability praise;
- keep mistakes safe to expose;
- prefer specific feedback to generic praise;
- avoid a long lecture immediately after an error.

## 7. LearningEpisode and ExperienceManifest

`LearningCell` remains reusable pedagogical knowledge. The child experiences a `LearningEpisode`.

```text
LearningCell
  + TeachingTarget
  + Child/Skill State
  + CurrentLearningState
        ↓
TeacherDecision
        ↓
LearningEpisode
        ↓
ExperienceManifest
```

The ExperienceManifest may route activities to Study-Hub, print/PDF, Kani, oral interaction or delayed retrieval. It is orchestration metadata, not curriculum truth.

## 8. Kani Game boundary

Kani Game App is a gamified learning-experience renderer and attempt-evidence runtime.

It must not:

- create a parallel curriculum;
- create a second canonical question truth;
- infer durable mastery from one-session accuracy;
- prescribe teacher-specific next actions as authoritative learning judgement.

Game completion means **activity completed**, not **skill mastered**.

Stars, streaks, speed and scores are gameplay/motivational metrics unless a later educational contract explicitly gives them another evidence role.

## 9. QR / mission semantics

A printed QR identifies an opaque mission/activity. It must not contain learner identity, answers or curriculum truth.

Target semantics:

```yaml
launch_policy:
  gate: ATTEMPT_NOT_SCORE

completion_policy:
  means: ACTIVITY_COMPLETED
  not: SKILL_MASTERED

return_policy:
  required: true
  endless_game_chain: false
```

Learner identity is bound at runtime.

## 10. Curriculum/source boundary

Canonical knowledge, curriculum mappings and textbook/source rules are separate layers.

A prototype may use:

```yaml
scope_basis:
  school_scope:
    status: VERIFIED
    source_ref: ...
  ib_pyp_mapping:
    status: MAPPING_PENDING
  ncf_mapping:
    status: MAPPING_PENDING
```

This allows Phase 3 to be source-grounded without pulling the complete curriculum-overlay programme forward.

Source simplification or ambiguity must never be silently converted into a new canonical rule. Internal states must support at least `SOURCE_BOUNDARY`, `AMBIGUOUS` and `TEACHER_JUDGMENT`.

## 11. Relationship to backend roadmap #39

Backend choice is orthogonal to learning semantics:

```text
Primary learning semantics
          ⟂
SQLite / Firebase / future provider
```

Issue #39 owns provider/storage/identity deployment profiles. This architecture owns primary-learning semantics and teaching decisions.

Provider profiles must return identical attempt/evidence semantics for the same canonical inputs.

## 12. Phase gates

The implementation sequence is intentionally strict:

```text
#41 Architecture freeze
      ↓
#42 Evidence semantics
      ↓
#43 Minimum contracts
      ↓
#44 Fraction cross-renderer plumbing
      ↓
#45 Teacher Runtime replaying #44
      ↓
#46 English vertical slice
      ↓
Real-child observation gate
      ↓
#47 Curriculum overlays
      ↓
#48 Grade 5 + future competition seams
```

## 13. Phase-0 acceptance checklist

- [ ] one authority for canonical learning semantics
- [ ] one stable learner identity
- [ ] one canonical question/content contract family
- [ ] Kani raw/recent evidence separated from teacher judgement
- [ ] longitudinal evidence is multidimensional
- [ ] conceptual support separated from access/load adjustments
- [ ] session state separated from durable learner profile
- [ ] Teacher Runtime owns pedagogical next actions
- [ ] same-route failure invariant is explicit
- [ ] source/rule boundary is first-class
- [ ] backend profile #39 cannot change educational semantics

## 14. Deferred from Phase 0

Do not build yet:

- full AI tutoring autonomy;
- all Grade 4/5 curriculum mappings;
- competition engines;
- comprehensive game migration;
- a psychometric single-number learner score;
- full learner dashboard redesign.
