# Phase 2b — bounded Primary evidence in `kani-attempt-v1`

Tracking: Study-Hub #43  
Canonical educational semantics: `reallaksh19/Common` Primary architecture  
Backend/provider track: Study-Hub #39

## Purpose

Add one backward-compatible optional `primaryEvidence` envelope to the existing canonical Kani attempt contract without moving Teacher Runtime judgement into raw attempts.

## Boundary

```text
Kani attempt
  observable runtime facts
  + optional bounded Primary evidence
        ↓
Primary Teacher Runtime
  diagnosis / judgement / next action
```

The envelope may preserve observable semantics such as:

- `learningEpisodeId`
- `learningObjectIds`
- `questionFamilyId`
- self-correction
- learner confidence when explicitly observed/asked
- conceptual support actually used
- access adjustments actually used
- representation type and role
- response mode
- authored response-classification code

It must not contain:

- diagnosis
- TeacherDecision / TeacherMove
- mastery state/score
- next learning action
- ChildLearningProfile / SkillState

## Compatibility

`kani-attempt-v1` remains schema version `1.0` because the new field is optional and existing required identity/immutability fields do not change.

No backend/provider semantics are introduced. SQLite/Firebase choices under #39 remain orthogonal.

## Validation

The phase is complete only when:

- runtime Zod validation accepts a valid Primary envelope;
- runtime validation rejects Teacher Runtime judgement embedded inside the envelope;
- generated `kani-attempt-v1` JSON Schema exposes the envelope;
- deterministic registry hash/source-lock checks pass;
- a canonical fixture includes the envelope;
- Kani Game App updates its immutable Study-Hub contract lock and local validator/types to the merged Study-Hub commit.
