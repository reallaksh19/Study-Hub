# Evidence vs judgement boundary

Roadmap: #40

## Kani / evidence layer may own

- immutable attempt capture;
- correctness/partial credit;
- response time;
- hints/support events;
- self-correction where observable;
- deterministic recent evidence summaries;
- evidence counts, trends and confidence labels.

These summaries are **non-authoritative pedagogically**.

## Primary Teacher Runtime owns

- misconception/prerequisite/language/representation hypotheses;
- interpretation of whether an isolated event is likely a lapse or stable learning gap;
- teaching judgement;
- next pedagogical move;
- support route;
- reteach/probe/fade/extend/stop decisions;
- longitudinal learning judgement across acquisition, independence, retention and transfer.

## Naming rule

Avoid using `recommendation` for two different semantics. Existing Kani API/revision recommendations should be understood as **evidence-focus signals** (for example, a skill showing weak recent evidence), not prescriptive teacher actions.

A later teacher-runtime API should use explicit names such as `TeacherDecision` or `NextLearningAction` for pedagogical prescriptions.
