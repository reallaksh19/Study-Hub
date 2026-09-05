# Worksheet App → Kani export contract

Status: integration specification for Study-Hub issues #5, #6 and #7.

## Ownership boundary

The Worksheet App is a **capability donor / authoring-format adapter**. It must not introduce another learner identity, score store, mastery model or login flow.

- Study-Hub owns canonical content publication and Adult Studio workflows.
- Kani Game App owns `studentId`, learner runtime, attempts, review and mastery.
- Worksheet App may compose, preview, print and export worksheet content.

## Canonical export target

Worksheet exports must map into `kani-content-v1`. CSV, legacy JSON and Google Sheets are import/export formats only; they are not the platform's canonical runtime model.

A worksheet page must include stable IDs and may contain supported canonical question types such as:

- `mcq`
- `true_false`
- `short_answer`
- `fill_in_blank`
- `multi_select`
- later: `numeric`, `match_following`, `sequence_order`, `diagram_label`, `long_answer`

The first-wave converted fixture lives at:

`src/integration/fixtures/worksheet-origin-content-v1.json`

CI validates it against the same `KaniPageContentSchema` used by Study-Hub.

## Stable IDs

IDs are persisted once published. Titles, folder names and worksheet numbers may change without changing IDs.

Recommended examples:

```text
page_grade4-fractions-worksheet-equivalence
question_ws_fraction_equivalence_001
skill_fraction-equivalence
```

Do not use ambiguous numeric-only worksheet IDs such as `ws3` as global platform IDs.

## Field mapping

| Worksheet concept | Kani v1 field |
| --- | --- |
| worksheet/package title | page `title` |
| worksheet identifier | page `id` |
| subject | `subjectId` |
| topic/subtopic | `topicId`, `conceptTags` |
| grade | `grade` |
| difficulty | `difficulty` (`easy`, `medium`, `hard`, `mixed`, `none`) |
| skill/category | `skillIds` |
| MCQ choices | `options` |
| MCQ answer | `answerIndex` |
| multiple correct answers | `answerIndexes` |
| text/FIB accepted answers | `acceptedAnswers` |
| hint | `hint` |
| worked solution | `explanation` |
| printable asset | future canonical asset reference; never embed learner state |

Adapters must fail explicitly when a legacy format cannot be represented without information loss.

## Export modes

### Canonical JSON — first implementation

Export one validated page/activity document matching `kani-content-v1`.

Expected flow:

```text
Worksheet editor
→ normalize legacy values
→ assign/retain stable IDs
→ validate kani-content-v1
→ preview
→ export canonical JSON
→ Study-Hub import/publish
→ Kani Game App consumes through catalog/runtime
```

### `.kani-pack` — future ZIP wrapper

The future package format is a transport wrapper, not a new schema:

```text
manifest.json
content/
  pages/*.json
assets/
  ...
```

`manifest.json` should declare package version, source app, included canonical objects, asset checksums and optional provenance. Content inside the package remains `kani-content-v1`.

## Prohibited integration patterns

Do not:

- persist Worksheet App player profiles into Kani;
- join results by display name;
- create worksheet-specific mastery truth separate from `kani-attempt-v1`;
- expose AI provider keys from browser exports;
- silently coerce unsupported answer types;
- regenerate IDs from mutable titles during each export;
- make Game App depend on Worksheet App filesystem paths.

## Runtime handoff

When a worksheet runs inside Kani, Game App supplies the active stable `studentId` and owns the session lifecycle. The worksheet content itself is identity-free. Completion generates canonical `kani-attempt-v1` evidence.

## Definition of a valid Worksheet-origin export

A valid export:

- parses with `KaniPageContentSchema`;
- has globally stable page/question IDs;
- has explicit grade/subject/topic metadata where known;
- maps question types without answer loss;
- includes skills/concept tags where known;
- contains no user identity or localStorage state;
- can be rendered by the Kani QuestionSessionEngine or explicitly reports an unsupported type.
