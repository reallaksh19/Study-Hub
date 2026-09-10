# Primary Teacher Runtime — minimum v1 boundary

This is a Phase 0 semantic sketch, not a frozen schema.

## Inputs

- `TeachingTarget`
- `SkillState`
- `CurrentLearningState`
- current `Observation`
- relevant `LearningCell`
- recent deterministic evidence summary

## Decision loop

```text
Observation
  ↓
ResponseDiagnosis (hypotheses + uncertainty)
  ↓
TeacherDecision (what evidence/action is needed next)
  ↓
TeacherMove
  ↓
ChildAction
  ↓
New Observation
```

## Non-negotiable rules

1. A wrong answer does not automatically trigger reteaching.
2. A diagnosis is not a durable child label.
3. After two unsuccessful attempts with substantially the same teaching route, the route must change.
4. Conceptual support and access/load adjustments are recorded separately.
5. Repair requires a new independent attempt before independence is claimed.
6. Current-session signals do not become durable profile traits without repeated evidence.
7. Recent Kani evidence summaries may inform the runtime but do not prescribe authoritative next pedagogical actions.
8. Game completion is not mastery evidence by itself.
9. Retention and transfer require separate evidence from immediate success.
10. The runtime may stop or change activity when continued repetition has low learning value.

## Minimum learner-agency moves

- `OFFER_BOUNDED_CHOICE`
- `ASK_TO_REFLECT`
- `ASK_CHILD_TO_CHOOSE_REPRESENTATION`
- `ASK_CHILD_TO_CREATE_EXAMPLE`

These are permitted when multiple routes satisfy the same learning target; they do not permit indefinite avoidance of essential learning.

## Feedback policy

Feedback should preserve correct reasoning, identify the next useful action, avoid fixed-ability labels, and prefer specific evidence-based acknowledgement to generic praise.
