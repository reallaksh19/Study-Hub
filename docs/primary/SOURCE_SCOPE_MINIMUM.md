# Minimum source/scope provenance before curriculum overlay

Full IB PYP and NCF-SE/NCERT mapping remains Phase 6 (#47). Earlier prototypes must still state why a target is in scope.

Minimum prototype shape:

```yaml
scope_basis:
  school_scope:
    status: VERIFIED | SOURCE_NOT_PROVIDED
    source_ref: ...
  ib_pyp_mapping:
    status: MAPPING_PENDING
  ncf_mapping:
    status: MAPPING_PENDING
```

A prototype must not claim formal curriculum alignment merely because a topic is common at the grade level.

Source rules that are simplified, ambiguous or incomplete must preserve that distinction rather than silently becoming canonical rules.
