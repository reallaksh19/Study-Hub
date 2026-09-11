# Phase 3 — Grade 4 fraction-equivalence cross-renderer slice

Tracking: Study-Hub #44  
Depends on: Study-Hub #43 (complete)  
Canonical education semantics: `reallaksh19/Common` Primary architecture  
Teacher-runtime interpretation: deferred to Study-Hub #45

## What this phase proves

This phase proves **plumbing**, not adaptive pedagogy:

```text
Common learning object / episode semantics
        ↓
Study-Hub learning + print activity routing
        ↓
opaque printable QR / deep-link mission identity
        ↓
Kani canonical-question mission
        ↓
immutable kani-attempt-v1 + primaryEvidence
        ↓
non-game independent return task
        ↓
delayed-retrieval task marker (3–7 days)
```

## Scope/provenance honesty

The first executable fixture deliberately records:

```yaml
school_scope: SOURCE_NOT_PROVIDED
ib_pyp_mapping: MAPPING_PENDING
ncf_mapping: MAPPING_PENDING
selection_basis: ARCHITECTURE_PROTOTYPE_ONLY
```

Fraction equivalence is therefore the selected integration fixture, **not yet a formal claim of IB/NCF/school alignment**. Curriculum research/mapping remains Phase #47.

## Canonical IDs

```text
learning object   MATH-FRAC-EQUIVALENCE
teaching target   TT-G4-FRAC-EQUIV-001
learning episode  EP-G4-FRAC-EQUIV-001
experience        EX-G4-FRAC-EQUIV-001
Kani mission      KM-G4-FRAC-EQUIV-001
opaque launch     P4FE7K2Q
```

The same IDs survive renderer changes. No renderer invents a second concept identity.

## Prototype content

The fixture contains six mission-practice questions plus two deliberately separate questions:

- six game-practice question IDs (`fraction-equiv-q-101` … `106`);
- one independent return item (`fraction-equiv-return-q-201`);
- one delayed retrieval item (`fraction-equiv-delayed-q-301`).

Answer truth lives in canonical Study-Hub content. `KaniMissionV1` contains references only.

The return and delayed questions are not included in the mission set, preventing direct answer leakage from game practice into the evidence checkpoints.

## Launch rules

```yaml
launch_policy:
  gate: ATTEMPT_NOT_SCORE

timer_policy: OFF

completion_policy:
  means: ACTIVITY_COMPLETED

return_policy:
  required: true
  endless_game_chain: false
```

A struggling learner is therefore not denied the modality switch because of a low pre-game score.

## QR/deep-link boundary

The printed QR now resolves to the GitHub-Pages-safe Kani hash route:

```text
https://reallaksh19.github.io/Kani-Game-App/#/primary/m/P4FE7K2Q
```

The encoded token remains opaque and contains no:

- learner identity;
- correct answers;
- mastery state;
- child profile;
- curriculum truth.

The printable SVG artifact is:

```text
/primary/fractions/P4FE7K2Q-qr.svg
```

Kani accepts the hash route as the deployment-safe route and also understands direct-path/query compatibility forms. Learner identity is bound only after Kani loads the active profile.

## Return-to-learning path

Mission completion must not end in an endless game chain. The dominant Kani completion action returns to:

```text
/primary/return.html?mission=P4FE7K2Q
```

That Study-Hub page renders the fresh independent return prompt derived from canonical content and does not display the model answer. It also shows the delayed-retrieval window as `NOT_YET_TESTED` for 3–7 days rather than claiming immediate retention.

## Evidence boundary

Kani game attempts use the existing immutable `kani-attempt-v1` with optional `primaryEvidence`.

For the first mission, Kani emits only Primary context it can directly justify:

- `semanticVersion`;
- `learningEpisodeId`;
- `learningObjectIds`.

Ordinary Kani telemetry such as `hintsUsed` is **not** silently converted into conceptual-support semantics. Richer support/representation evidence may be added only when the renderer actually observes it.

Teacher diagnosis and durable learning judgement remain outside the attempt. Phase #45 interprets evidence after #44 proves the journey.

## Executable fixture

```text
src/integration/primary/fractions/fractionEquivalenceContent.js
src/integration/primary/fractions/fractionEquivalenceJourney.js
src/integration/primary/fractions/fractionPrototypeArtifacts.js
src/integration/primary/fractions/fractionPhase3Publication.js
src/integration/primary/fractions/fractionEquivalenceJourney.test.js
src/integration/primary/fractions/fractionPrototypeArtifacts.test.js
scripts/generate-primary-fraction-prototype.mjs
public/primary/fractions/P4FE7K2Q-qr.svg
```

The executable checks fail if renderer/episode identities diverge, mission policy becomes score-gated or mastery-labelled, return/delayed questions leak into game practice, QR/launch payload exposes learner/answer truth, the child return page exposes the model answer, or the printable QR asset disappears.

## Cross-repo implementation state

Study-Hub now publishes the mission/resolver/content/return/delayed artifacts, printable QR target and child-facing return page.

Kani Phase-3 PR consumes the opaque mission, reuses the canonical `QuestionSessionEngine`/`CanonicalQuestionHost`, records immutable attempt evidence and makes `Back to my fraction page` the dominant completion action.

## Remaining Phase-3 work

1. merge the Kani Phase-3 consumer after full CI;
2. merge this Study-Hub publication increment after full CI;
3. verify deployed cold launch and warm hash navigation;
4. verify temporary resolver failure produces the child-safe retry screen;
5. verify local-first/offline attempt persistence remains idempotent during synchronization;
6. trace the deployed mission completion back to the Study-Hub independent return page;
7. verify the delayed retrieval marker survives the full deployed journey;
8. only then close #44 and activate #45.
