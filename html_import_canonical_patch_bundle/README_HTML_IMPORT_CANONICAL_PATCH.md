# HTML Import + Canonical Content Layer Patch

This patch adds a lightweight HTML-source importer to the parent portal.

## What it adds

### 1. HTML source paste importer
Route:
- `#/parent/import-html`

Features:
- paste complete HTML source into a textbox
- live iframe preview
- automatic detection of embedded canonical Study Hub JSON
- import as:
  - **canonical page data** if canonical payload exists and validates
  - **static interactive HTML page** otherwise

### 2. CANONICAL_CONTENT_LAYER.md
Added at:
- `public/CANONICAL_CONTENT_LAYER.md`

The importer includes a help button that loads this markdown document in a modal.

### 3. Interactive HTML block
New block type:
- `interactive_html`

This renders a sandboxed iframe and can capture posted quiz results using:
- `window.parent.postMessage({ type: "studyhub:quiz_result", payload: {...} }, "*")`

### 4. Expanded canonical question support
Added minimal renderer support for:
- `fill_in_blank`
- `match_following`
- `assertion_reason`

### 5. HTML import behavior

#### Canonical import
If the pasted HTML contains:

```html
<script type="application/json" id="studyhub-canonical-page">
{ ... canonical page payload ... }
</script>
```

the app will:
- parse the JSON
- validate it
- save a normal Study Hub page JSON
- also preserve the original HTML as an asset reference resource

#### Static HTML fallback
If no valid canonical payload is found, the app will:
- upload the pasted HTML as a topic asset
- create a page with a single `interactive_html` block
- embed that page in student view

## Files added

- `public/CANONICAL_CONTENT_LAYER.md`
- `src/content/canonicalContentLayer.js`
- `src/services/htmlImportService.js`
- `src/services/interactiveResultService.js`
- `src/components/blocks/InteractiveHtmlBlock.jsx`
- `src/components/parent/ParentHtmlImporter.jsx`
- `src/components/questions/MatchFollowingQuestion.jsx`
- `src/components/questions/AssertionReasonQuestion.jsx`
- `src/components/questions/FillInBlankQuestion.jsx`

## Files modified

- `src/Grade8_StudyHub_Complete.jsx`
- `src/components/parent/ParentLayout.jsx`
- `src/components/blocks/BlockRenderer.jsx`
- `src/components/questions/QuestionRenderer.jsx`
- `src/contexts/DataContext.jsx`
- `src/content/contentPackSchema.js`

## Notes
- This is a focused patch, not the full staged importer/organiser platform.
- It is designed to fit the current Study Hub structure with minimal disruption.
- HTML result capture is stored in localStorage via `interactiveResultService.js`.
- Existing parent tools are otherwise left intact.

## Suggested next step
After applying this patch:
1. run `npm install --legacy-peer-deps`
2. run `npm run build`
3. start `node server.js`
4. open `#/parent/import-html`
5. paste HTML source and test import
