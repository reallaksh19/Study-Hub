# Kani Integration Contracts v1

Architecture source of truth: Study-Hub issues #5, #6 and #7.

The first contract implementation lives in `src/integration/contracts/kaniContracts.js`. Contracts are versioned boundary payloads; storage, transport and UI are replaceable.

## `kani-content-v1`

Purpose: canonical structured learning content shared by Study-Hub, Game App and Worksheet adapters.

Normalized difficulty values:

```text
easy | medium | hard | mixed | none
```

Supported v1 activity types:

```text
lesson | worksheet | quiz | game | brain | challenge | interactive
```

Supported v1 question types:

```text
mcq
multi_select
true_false
short_answer
numeric
fill_in_blank
match_following
assertion_reason
sequence_order
long_answer
diagram_label
interactive_external
```

Every published question has a stable `id`; published IDs must not be regenerated when titles change.

## `kani-catalog-v1`

Purpose: filesystem-independent discovery of published Study-Hub content.

Canonical static endpoint:

```text
/content/catalog.json
```

The catalog exposes subjects, topics and pages using stable IDs plus public content URLs. Consumers must not derive content paths from titles, subject casing or folder conventions.

Study-Hub owns catalog publication. Game App is a read-only consumer through an adapter.

## `kani-activity-v1`

Purpose: launch and lifecycle messaging for embedded/cross-app activities.

Messages:

```text
kani.activity.ready
kani.activity.launch
kani.activity.started
kani.activity.completed
kani.activity.cancelled
kani.activity.error
```

Every message includes `schemaVersion`, `launchId` and `activityId`.

Production bridge requirements:

- explicit allowed origins;
- validate `event.origin`;
- validate schema and contract version;
- reject mismatched launch/activity IDs;
- bind learner context to the launch;
- no wildcard target origin in production.

The legacy `studyhub:quiz_result` event may remain temporarily as a migration adapter but must not be extended as the platform contract.

## `kani-attempt-v1`

Purpose: canonical learner evidence.

Required identity fields:

```text
attemptId
studentId
activityId
activityType
sourceApp
completedAt
schemaVersion
```

Optional evidence includes question/round ID, subject/topic/page, skill IDs, difficulty, correctness, partial credit, response time, hints, score and start time.

`partialCredit` is normalized to `0..1`. Timestamps are ISO-8601.

New learner evidence must use Game App's stable `studentId`. Display name is not an identity key.

## Versioning policy

All current payloads use:

```json
{ "schemaVersion": "1.0" }
```

Breaking semantic/schema changes require a new major contract version. Backward-compatible additive optional fields may be introduced within v1 only when existing validators and consumers remain valid.

## Adapter rule

Legacy sources may use values such as `Easy`, `Medium`, `Hard`, `None`, CSV option columns, worksheet-specific IDs or Study-Hub page structures. That translation belongs in explicit adapters at the integration boundary. Canonical data must not preserve accidental source-format quirks as platform semantics.

## Contract tests

`npm test` includes valid and invalid fixtures for the v1 contracts. `npm run audit:kani-content` builds and validates a catalog from the live Study-Hub content tree, failing on malformed topics, duplicate IDs, page-ID mismatches, broken page references or invalid difficulty values.
