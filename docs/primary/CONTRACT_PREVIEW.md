# Phase 2 contract preview

This is non-authoritative until #42 evidence semantics is complete.

## Support evidence

Prefer two independent dimensions:

```ts
type ConceptualSupport = {
  level: 'H0' | 'H1' | 'H2' | 'H3';
  type?: 'PROMPT' | 'HINT' | 'MODEL' | 'WORKED_STEP';
};

type AccessAdjustment =
  | 'REDUCED_LANGUAGE'
  | 'ONE_STEP_AT_A_TIME'
  | 'ORAL_RESPONSE_ALLOWED'
  | 'REDUCED_WRITING_LOAD'
  | 'VISUAL_FOCUS';
```

## Representation evidence

```ts
type RepresentationEvidence = {
  type: string;
  role: 'PROVIDED' | 'CHILD_SELECTED' | 'CHILD_PRODUCED';
};
```

## Longitudinal learning evidence

```ts
type LearningEvidenceDimensions = {
  acquisition: EvidenceState;
  independentUse: EvidenceState;
  delayedRetention: EvidenceState;
  transfer: EvidenceState;
  stretch: EvidenceState;
};

type EvidenceState =
  | 'NOT_OBSERVED'
  | 'NOT_YET_TESTED'
  | 'EMERGING'
  | 'DEVELOPING'
  | 'SECURE'
  | 'REASSESS_LATER';
```

Do not serialize these into `kani-attempt-v1` as teacher judgement. Attempts contain observable evidence; Teacher Runtime derives longitudinal learning judgement separately.
