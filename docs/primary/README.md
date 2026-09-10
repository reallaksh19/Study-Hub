# Primary Grades 4–5 — Study-Hub integration docs

Programme roadmap: Study-Hub #40  
Backend/provider track: Study-Hub #39  
Canonical educational semantics: https://github.com/reallaksh19/Common/tree/main/Primary/Architecture  
Common tracking: https://github.com/reallaksh19/Common/issues/162

## Authority

Study-Hub is **not** the canonical owner of Primary pedagogy or learner-state meaning.

```text
Common
  canonical educational semantics
        ↓
Study-Hub
  orchestration / publication / transport
        ↓
Kani
  game runtime / immutable observations
```

The files in this directory document Study-Hub's integration view and programme history. When wording conflicts with the pinned Common semantic contract, Common is authoritative.

The exact Common version used by active transport work is pinned in:

```text
integration/primary/common-semantic.lock.json
```

## Active phase sequence

1. #41 — Study-Hub architecture prototype — complete
2. #42 — Kani evidence semantics — complete
3. Common #162 / PR #163 + #164 — canonical Primary semantics and Grade 4 skill wiring — complete
4. #43 — Common-backed Study-Hub transport/adapters — active
5. #44 — Grade 4 Math fractions cross-renderer slice
6. #45 — Primary Teacher Runtime implementation/replays
7. #46 — Grade 4 English vertical slice
8. #50 — supervised real-child observation gate
9. #47 — IB PYP + NCF-SE/NCERT curriculum overlays
10. #48 — Grade 5 progression + future competition seams

## Files here

- `PRIMARY_INTEGRATED_ARCHITECTURE.md` — Study-Hub integration/orchestration view; canonical educational architecture is in Common.
- `PHASE0_DECISIONS.md` — historical decisions from the first roadmap pass.
- `IMPLEMENTATION_SEQUENCE.md` — programme gate/dependency order.
- `CONTRACT_PREVIEW.md` — active Common-backed Phase-2 transport design.
- `OBSERVATION_GATE.md` — human-use falsifier before broad scale-up.

Detailed educational definitions such as `TeacherMove`, `SkillState`, `CurrentLearningState`, conceptual support, access adjustments, source boundaries, and learning-evidence dimensions belong in Common rather than being duplicated here.