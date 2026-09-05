# Kani Platform App Boundaries

This document is the code-level companion to Study-Hub issues #5, #6 and #7. Integration work must preserve these ownership boundaries unless a later architecture decision explicitly supersedes them.

## Product planes

| Capability | Study-Hub | Kani Game App | Worksheet App |
|---|---|---|---|
| Canonical lesson/content authoring | **OWNER** | Consumer | Producer/adapter |
| Subject/topic/page catalog | **OWNER** | Consumer | No |
| Lesson rendering | **OWNER** | Optional consumer shell | No |
| Parent/teacher studio | **OWNER** | No | Capabilities migrate here |
| Student profile / stable `studentId` | No | **OWNER** | No |
| Learner settings | No | **OWNER** | No independent copy |
| Game runtime | No | **OWNER** | No |
| Brain procedural games | No | **OWNER** | No |
| LQ/challenge runtime | No | **OWNER** | No |
| Worksheet/question runtime | Content producer | **OWNER** | Preview only / capability donor |
| Canonical learner attempts | Consumer/derived views | **OWNER** | Emitter only |
| Learner mastery / recommendations | Consumer/derived view | **OWNER** | No |
| Worksheet composition | Studio target | Runtime consumer | Capability donor |
| Print/PDF worksheet tooling | Studio target | No | Capability donor |
| AI-assisted authoring | Future **OWNER** | No | No independent secret handling |

## Non-negotiable rules

1. Integrate through versioned contracts and adapters before copying UI or source modules across repositories.
2. Do not introduce a second canonical question schema. New formats must map to `kani-content-v1`.
3. Do not introduce a second learner identity. New learner evidence uses the Game App `studentId`.
4. Do not join new learner records by display name. Name matching is migration fallback only.
5. Do not create a separate score/progress truth for worksheets or Study-Hub quizzes. Map them to `kani-attempt-v1`.
6. Study-Hub must not become a duplicate gameplay/profile runtime.
7. Game App must not become a content-management studio.
8. Worksheet App contributes capabilities and export adapters, not independent platform state.
9. Filesystem paths are Study-Hub implementation details. Other apps consume stable IDs and catalog/API URLs.
10. Every cross-app boundary must validate payloads and have tests.

## Deployment boundary

Study-Hub and Game App can both run as static GitHub Pages applications. Static clients may consume published JSON/catalog files without a backend. Study-Hub's Express server is an optional authoring/domain-API service and must not be assumed to exist on GitHub Pages.

Write operations, authenticated parent/teacher functions, AI provider secrets and future cloud progress require a separately hosted service. Public static content must remain usable when that service is unavailable.

## Target flow

```text
Kani student profile
  -> Learn (Study-Hub content)
  -> launch worksheet/game/quiz
  -> Game App learner runtime
  -> kani-attempt-v1
  -> mastery / review / revision
  -> Study-Hub may display derived progress without owning identity
```

The platform succeeds when this flow has one content contract, one stable learner identity and one canonical evidence model.
