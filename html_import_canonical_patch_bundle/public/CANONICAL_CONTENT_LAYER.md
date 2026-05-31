# CANONICAL_CONTENT_LAYER

This document defines the canonical content layer for Study Hub so that:
- pasted HTML can be imported
- imported HTML can either be **segregated into canonical page data** or loaded as **static interactive HTML**
- study guides, equations, handouts, worksheets, and richer question types can share one internal model

## 1. Canonical objects

Study Hub uses these canonical objects:

1. Topic
2. Page
3. Block
4. Clarifier
5. Question
6. Attachment
7. Resource
8. Outcome

---

## 2. Topic contract

```json
{
  "id": "mathematics-number-system",
  "subjectId": "mathematics",
  "title": "Number System",
  "description": "Concepts, practice, and revision.",
  "pages": [
    {
      "id": "mathematics-number-system-introduction",
      "file": "pages/introduction.json",
      "title": "Introduction",
      "order": 1,
      "pageKind": "lesson",
      "difficulty": "easy",
      "estimatedMinutes": 8,
      "conceptTags": ["number-system"],
      "prerequisitePageIds": [],
      "relatedPageIds": []
    }
  ]
}
```

---

## 3. Canonical page contract

```json
{
  "id": "mathematics-number-system-introduction",
  "topicId": "mathematics-number-system",
  "title": "Introduction",
  "pageKind": "lesson",
  "blocks": [],
  "clarifiers": [],
  "questions": [],
  "attachments": [],
  "resources": [],
  "difficulty": "easy",
  "estimatedMinutes": 8,
  "conceptTags": [],
  "prerequisitePageIds": [],
  "relatedPageIds": []
}
```

### `pageKind` values
- `lesson`
- `study_guide`
- `worked_example`
- `worksheet`
- `handout`
- `revision`
- `assessment`
- `interactive`
- `video_lesson`
- `faq`
- `article`
- `resource_bundle`

---

## 4. Canonical block contract

```json
{
  "id": "page1-b0",
  "type": "paragraph",
  "data": { "text": "A paragraph of content." }
}
```

### Recommended block types
- `heading`
- `paragraph`
- `bullets`
- `equation`
- `table`
- `image`
- `svg`
- `divider`
- `callout`
- `tip`
- `warning`
- `misconception`
- `example`
- `worked_solution`
- `study_guide_section`
- `video_embed`
- `pdf_embed`
- `download_card`
- `interactive_html`

### Example: interactive html block

```json
{
  "id": "page1-b7",
  "type": "interactive_html",
  "data": {
    "assetPath": "/mathematics/number-system/assets/number-system-mcq-practice.html",
    "mode": "iframe",
    "trackResults": true,
    "messagingContract": "studyhub:v1",
    "pageId": "mathematics-number-system-mcq-practice",
    "topicId": "mathematics-number-system"
  }
}
```

---

## 5. Clarifier contract

```json
{
  "id": "page1-cl1",
  "type": "key_fact",
  "title": "Quick idea",
  "body": "Every irrational number has a non-terminating, non-repeating decimal expansion."
}
```

Clarifier types:
- `tip`
- `warning`
- `key_fact`
- `common_mistake`
- `did_you_know`

---

## 6. Question contract

All question objects share:

```json
{
  "id": "page1-q1",
  "type": "mcq",
  "difficulty": "medium",
  "questionCategory": "apply",
  "conceptTags": ["number-system"],
  "supportHint": "Think about repeating vs non-repeating decimals."
}
```

### Supported question types
- `mcq`
- `multi_select`
- `true_false`
- `short_answer`
- `numeric`
- `fill_in_blank`
- `match_following`
- `assertion_reason`
- `sequence_order`
- `long_answer`
- `diagram_label`
- `interactive_external`

### Example: match the following

```json
{
  "id": "page1-q4",
  "type": "match_following",
  "prompt": "Match the number set with its definition.",
  "leftItems": [
    { "id": "l1", "text": "Rational number" },
    { "id": "l2", "text": "Irrational number" }
  ],
  "rightItems": [
    { "id": "r1", "text": "Cannot be written as p/q" },
    { "id": "r2", "text": "Can be written as p/q" }
  ],
  "correctPairs": [["l1","r2"],["l2","r1"]]
}
```

### Example: assertion-reason

```json
{
  "id": "page1-q6",
  "type": "assertion_reason",
  "assertion": "√2 is irrational.",
  "reason": "It cannot be written as p/q where p and q are integers and q ≠ 0.",
  "answerPattern": "both_true_reason_explains_assertion"
}
```

---

## 7. Attachments and resources

### Attachments
Internal, page-bound assets.

```json
{
  "id": "page1-att1",
  "title": "Number System Handout",
  "kind": "pdf",
  "assetPath": "assets/number-system-handout.pdf",
  "previewMode": "embed",
  "downloadable": true,
  "studentVisible": true
}
```

### Resources
Internal or external learning aids.

```json
{
  "id": "page1-res1",
  "title": "Revision video",
  "kind": "external_video",
  "url": "https://example.com/video",
  "whyThisHelps": "Useful for revision before exam.",
  "studentVisible": true
}
```

---

## 8. Outcome contract

Interactive HTML or external assessment pages report outcomes using:

```json
{
  "pageId": "mathematics-number-system-mcq-practice",
  "topicId": "mathematics-number-system",
  "attemptId": "attempt-001",
  "score": 24,
  "total": 32,
  "correctCount": 24,
  "wrongCount": 8,
  "percentage": 75,
  "status": "completed",
  "answers": [
    {
      "questionIndex": 0,
      "chosenIndex": 1,
      "correctIndex": 0,
      "isCorrect": false
    }
  ],
  "completedAt": "2026-04-24T12:00:00Z"
}
```

---

## 9. HTML import rule

If pasted HTML contains a script tag like this:

```html
<script type="application/json" id="studyhub-canonical-page">
{
  "title": "My HTML-authored Study Page",
  "pageKind": "assessment",
  "difficulty": "medium",
  "estimatedMinutes": 10,
  "conceptTags": ["number-system"],
  "blocks": [],
  "clarifiers": [],
  "questions": [
    {
      "type": "true_false",
      "prompt": "Every terminating decimal is rational.",
      "answer": true,
      "explanation": "It can be written as a fraction."
    }
  ],
  "attachments": [],
  "resources": []
}
</script>
```

Study Hub will:
1. parse the HTML
2. read the canonical JSON
3. validate it
4. save a normal page JSON using the canonical contract
5. also keep the original HTML as an asset if desired

If no canonical script is found, the HTML will be imported as a **static interactive HTML page** using an `interactive_html` block.

---

## 10. Result bridge for static html pages

Interactive HTML pages can send results to Study Hub using:

```javascript
window.parent.postMessage({
  type: "studyhub:quiz_result",
  payload: {
    pageId,
    topicId,
    attemptId,
    score,
    total,
    correctCount,
    wrongCount,
    percentage,
    answers,
    completedAt
  }
}, "*");
```

Study Hub listens for `studyhub:quiz_result` and stores the result in app state/local storage.

---
