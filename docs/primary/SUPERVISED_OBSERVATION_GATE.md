# Supervised real-child observation gate (#50)

This gate is a **small product/learning-loop falsifier**, not a research study and not a claim of educational effectiveness.

It may be run only with guardian supervision. Store only the minimal interaction evidence needed to decide whether the integrated Primary loop is usable enough to continue.

## What is being tested

The current prototype loop is:

```text
Study-Hub / print
  → child action
  → opaque QR / Kani mission
  → activity-complete evidence
  → return to non-game task
  → independent evidence
  → delayed retrieval 3–7 days later
```

The first observation should include at least one of the completed prototype experiences:

- Grade 4 Math: fraction equivalence (`P4FE7K2Q`)
- Grade 4 English: Inference Investigator (`P4EI7Q2K`)

If both are practical in the same supervised programme, observe both; do not force a long session merely to satisfy coverage.

## Before the session

1. Use the deployed Study-Hub/Kani experience, not a developer mock.
2. Keep timers off for the Primary missions.
3. Prepare the non-game return page before the child starts.
4. Copy `integration/primary/observation/supervised-observation-template.json` to a local working record.
5. Do **not** put the child's name, school, student id, address, contact details, medical information, diagnosis, or other sensitive profile data into the record.
6. The supervising adult may intervene for safety/access, but should note when repeated translation or conceptual help was needed.

## Observe, do not coach toward the desired result

Watch for these product risks:

- Does the child try the Study-Hub/print action, or immediately hunt for the QR/game?
- Does the QR/game change pace or cause rushing?
- Does the child return willingly to the non-game task after Kani?
- Does the game clarify/practise the target, or mainly entertain?
- If hints are used, do they restart thinking rather than reveal the answer?
- Do score/streak/timer mechanics cause careless responding? (Primary timers should be off.)
- Are instructions understandable without repeated adult translation?
- Does the return task produce interpretable independent evidence?
- For English, can oral response reveal understanding when writing load is high?
- For open inference responses, does a teacher/supervised observer explicitly judge whether the cited clue supports the inference rather than relying on string matching?
- For adjective source-boundary checks, does the tutor preserve the workbook model and keep `heavy` as `SOURCE_MODEL_BOUNDARY` rather than inventing a category?

Use only these observation states in the minimal record:

```text
OBSERVED
NOT_OBSERVED
AMBIGUOUS
NOT_APPLICABLE
```

## Findings and remediation

Every meaningful problem should be recorded as a finding with:

```text
severity: LOW | MEDIUM | HIGH | BLOCKER
status: OPEN | REMEDIATED | ACCEPTED_FOR_NEXT_TEST
observation: what was actually seen
remediation: the concrete product/teaching change to try
```

Do not write personality labels such as “lazy”, “weak reader”, “careless child”, or durable learner traits. Record the observable interaction instead, for example:

```text
Observation: child opened the QR before reading the one-line task.
Remediation: put the child action above the QR and reduce QR visual dominance.
```

## Independent return

The gate cannot pass unless the learner returns from Kani to a non-game task and the return produces interpretable evidence.

For Math, preserve the child's explanation/drawing/work rather than only the final answer where observable.

For English inference, preserve:

```text
ANSWER
+ TEXT CLUE
+ CONNECTION
+ response mode (ORAL or WRITTEN)
```

A complete open English response is not automatically “correct”. It requires explicit teacher/source/supervised-observer judgement that the cited clue supports the inference.

## Delayed retrieval

Run one fresh retrieval check **3–7 days after** the initial observation. Do not mark retention from the initial session.

Record:

```json
{
  "status": "COMPLETED",
  "daysAfterInitial": 4,
  "result": "brief factual description of the fresh retrieval result"
}
```

If the delayed check has not happened, status remains `NOT_YET_TESTED` and the gate must remain `IN_PROGRESS` or `BLOCKED`.

## Gate decision

`PASS` is allowed only when all of the following are true:

- return-to-learning was observed;
- the non-game return produced interpretable independent evidence;
- delayed retrieval was actually completed in the 3–7 day window;
- no unresolved `BLOCKER` finding remains;
- observed interaction problems have explicit remediation where needed;
- the record makes no general effectiveness claim and no durable child-trait claim.

If a major interaction flaw invalidates the loop, use `BLOCKED`, remediate the design, and rerun the relevant portion of the gate.

## Validate the record

The repository test suite exercises `validateSupervisedObservationRecord()` and prevents accidental PASS before delayed retrieval, privacy-field leakage, and one-child efficacy/trait overclaims.

The gate is not complete merely because this runbook and validator exist. **#50 remains open until the actual guardian-supervised observation and delayed retrieval are performed and the findings are fed back into the roadmap.**
