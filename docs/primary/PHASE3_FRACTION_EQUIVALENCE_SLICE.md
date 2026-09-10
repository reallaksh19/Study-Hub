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
opaque QR/deep-link mission identity
        ↓
Kani fraction-frenzy mission
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

The printable side carries only an opaque resolver path such as:

```text
/primary/m/P4FE7K2Q
```

The token resolves operationally to the mission/renderer. It does not contain:

- learner identity;
- correct answers;
- mastery state;
- child profile;
- curriculum truth.

Actual QR graphic rendering is an output concern; the encoded payload contract is frozen here first.

## Evidence boundary

Kani game attempts use the existing immutable `kani-attempt-v1` with optional `primaryEvidence` to preserve observable context such as:

- `learningEpisodeId` and `learningObjectIds`;
- conceptual support actually used;
- access adjustments separately;
- representation type/role;
- self-correction;
- response mode.

Teacher diagnosis and durable learning judgement remain outside the attempt. Phase #45 interprets this evidence.

## Executable fixture

```text
src/integration/primary/fractions/fractionEquivalenceContent.js
src/integration/primary/fractions/fractionEquivalenceJourney.js
src/integration/primary/fractions/fractionEquivalenceJourney.test.js
```

The test fails if Common semantic lock identity drifts, if renderer/episode identities diverge, if mission policy becomes score-gated or mastery-labelled, if return/delayed questions leak into game practice, if QR payload exposes learner/answer truth, or if generated attempt evidence fails the canonical Kani contract.

## Remaining Phase-3 work

1. expose the mission/resolver as a consumable Study-Hub endpoint/static artifact;
2. connect Kani mission launch to `fraction-frenzy` and the six canonical question refs;
3. emit an actual printable QR graphic from the opaque launch payload;
4. round-trip real Kani attempts through the mission context;
5. wire the independent return activity;
6. expose the delayed retrieval marker for scheduling/Phase #45;
7. run complete cross-repo integration/traceability tests.
