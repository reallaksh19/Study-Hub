# Kani platform contract registry

The machine-readable contract authority lives under `integration/` and is governed by Study-Hub issue #32 and implementation issue #33.

## Authority

Study-Hub owns the platform contract definitions. `src/integration/contracts/kaniContracts.js` remains the current runtime validator source. `integration/platform-manifest.json` binds that source by Git blob SHA and binds each generated JSON schema by SHA-256.

The JSON schemas describe **normalized canonical payloads**. Runtime validators remain authoritative for producer normalization and relational refinements that JSON Schema cannot express cleanly (for example an answer index referring to the current options array).

## Deterministic generation

```bash
npm run build:platform-contracts
npm run audit:platform-contracts
```

The build command regenerates schemas, fixture index and manifest. The audit command fails when:

- the canonical validator source Git blob changed without a deliberate registry update;
- committed schema/manifest bytes differ from deterministic generation;
- a valid golden fixture is rejected by the runtime validator;
- an invalid golden fixture is accepted.

## Consumer lock

Consumers must lock to an immutable Study-Hub commit and schema hashes in `integration/upstream.lock.json`. They must never track `main` implicitly. Kani CI checks out the locked Study-Hub commit and compares its local vendored schemas byte-for-byte/hash-for-hash.

## Worksheet gate

The Worksheet repository is intentionally `null`/unresolved until Study-Hub #13 identifies the authoritative repository. No repository may be guessed from naming similarity. Once resolved, the Worksheet repo must implement the same upstream lock/audit pattern before Practice can be production-enabled.

## Compatibility evidence

`.github/workflows/platform-compatibility.yml` accepts exact commit SHAs. It can run Study-Hub + Kani compatibility while Worksheet is unresolved, but three-repo mode fails closed unless the Worksheet repository and exact SHA are explicitly supplied.

Production promotion must use compatibility evidence for the exact release SHAs required by the active feature set.
