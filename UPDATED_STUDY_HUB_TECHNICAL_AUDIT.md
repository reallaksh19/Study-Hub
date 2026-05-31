# Updated Study Hub — Detailed Technical Audit & Test Run

Audit target: `/mnt/data/Updated study hub.zip`  
Audit mode: source-level review + install/build/direct unit tests + backend smoke checks + content reference validation.

## Executive Summary

This version is a better architectural base than earlier patches because it mounts both `DataProvider` and `StudyProvider`, and it includes early student-learning services (`learningProgressService.js`, `revisionService.js`, `TopicHome`, `RevisionMode`, `ExamMode`).

However, the current build is **not student-flow ready** and **not parent-authoring ready** for real use yet. The production build passes, but several runtime-breaking integration issues remain:

1. **Student page route is broken at runtime**: `StudyGuide` still expects the old `pagesRead` prop and calls `pagesRead.has(...)`, but `App` now passes `studyState`, not `pagesRead`.
2. **Quiz flow is also likely broken at runtime**: `QuizSection` expects `topic` and `page`, but `StudyGuide` passes only `questions`, `pageBlocks`, and `clarifiers`.
3. **Optics content page references are broken**: `topic.json` points to `pages/light-and-visibility.json`, but actual files are named `pages/physics-optics-light-and-visibility.json`.
4. **Duplicate Optics topics exist**: both `public/Physics/optics` and `public/Physics/physics-optics` have the same topic id `physics-optics`.
5. **Parent editor pathing is broken for many pages**: `ParentTopicEditor` derives a page slug using `pageId.split('-').pop()`, which turns `physics-optics-reflection-basics` into only `basics`.
6. **Export/import is still JSON-only in practice**: `contentExportService.js` creates only a placeholder `assets/` folder and does not include topic assets.
7. **Backend starts, but slowly**: observed health endpoint works only after a ~12s wait; this is likely due to eager `jsdom` import for SVG sanitization.
8. **`npm test` is not wired**: package script still exits with `Error: no test specified`.

## Test Run Results

| Check | Result | Notes |
|---|---:|---|
| `npm install --legacy-peer-deps` | PASS | 301 packages installed; 0 vulnerabilities reported |
| `npm run build` | PASS | Build completed; Vite warns bundle is large (`~941 KB` JS) |
| `npm test` | FAIL | Script intentionally exits with error |
| Direct source tests | PARTIAL | 4/5 pass; SVG sanitizer test times out |
| Backend `/api/health` | PASS after cold-start delay | `/api/health` returns `{"success":true}` after ~12 seconds |
| Backend `/api/topics` | PASS after cold-start delay | Returns 5 topics |
| Backend `/api/json` write/read | PASS | JSON save/read verified |
| Backend path traversal guard | PASS | `../../package.json` rejected |
| Content page reference validation | FAIL | 10 missing page-file refs, all optics duplicates |

### Direct test-file results

| Test file | Result |
|---|---:|
| `src/content/contentPackSchema.test.js` | PASS |
| `src/utils/idFactory.test.js` | PASS |
| `src/utils/markdownToBlocks.test.js` | PASS |
| `src/utils/slugify.test.js` | PASS |
| `src/utils/svgSanitizer.test.js` | TIMEOUT |

### Content inventory

| Metric | Count |
|---|---:|
| Topics found | 5 |
| Pages resolved through declared `topic.json` refs | 14 |
| Missing page refs | 10 |
| Questions in resolved pages | 48 |
| Clarifiers in resolved pages | 23 |
| Blocks in resolved pages | 65 |
| Attachments in resolved pages | 1 |
| Asset files | 12 |

Topics discovered:
- `Physics/Gravity` → `physics-gravity`, 3 pages
- `Physics/optics` → `physics-optics`, 5 pages, **broken refs**
- `Physics/physics-optics` → `physics-optics`, 5 pages, **duplicate id + broken refs**
- `Physics/vectors` → `physics-vectors`, 3 pages
- `mathematics/number-system` → `math-9-number-system`, 8 pages

## Source-Level Findings

## 1. App Provider Mounting

**Status: Improved**

`src/index.jsx` correctly wraps the app:

```jsx
<DataProvider>
  <StudyProvider>
    <App />
  </StudyProvider>
</DataProvider>
```

This is good and fixes earlier provider-missing failures.

## 2. Student Route Integration

**Status: Critical runtime bug**

In `src/Grade8_StudyHub_Complete.jsx`, the topic page route calls:

```jsx
<StudyGuide
  subject={subject}
  topic={topic}
  page={page}
  studyState={studyState}
  onMarkRead={...}
  onPageOpen={...}
  settings={...}
  onPageChange={...}
/>
```

But `src/components/StudyGuide/index.jsx` still has the old signature:

```jsx
export function StudyGuide({ subject, topic, page, pagesRead, onMarkRead, onPageChange }) {
  ...
  const isRead = pagesRead.has(p.id);
```

`pagesRead` is never passed. This will crash when rendering the left rail.

### Required fix

Change `StudyGuide` to accept `studyState` and derive read state from `studyState.pageProgress`.

Example:

```jsx
export function StudyGuide({ subject, topic, page, studyState, onMarkRead, onPageChange, settings }) {
  ...
  const isRead = Boolean(studyState?.pageProgress?.[p.id]?.read);
```

## 3. Quiz Integration

**Status: Critical runtime bug**

`QuizSection` now expects:

```jsx
export function QuizSection({ topic, page, questions = [], pageBlocks = [], clarifiers = [], onComplete })
```

But `StudyGuide` calls:

```jsx
<QuizSection
  questions={page.questions}
  pageBlocks={page.blocks}
  clarifiers={page.clarifiers}
  onComplete={...}
/>
```

So when a student answers a question, this can crash because `QuizSection` uses:

```js
recordQuestionOutcome({ topicId: topic.id, page, question: currentQuestion, result })
```

### Required fix

Pass `topic` and `page` from `StudyGuide`:

```jsx
<QuizSection
  topic={topic}
  page={page}
  questions={page.questions}
  pageBlocks={page.blocks}
  clarifiers={page.clarifiers}
  onComplete={() => onMarkRead(page.id)}
/>
```

## 4. Mobile Help Drawer Exists but Is Not Used

**Status: Feature stranded**

`src/components/student/MobileHelpDrawer.jsx` exists, but `StudyGuide` does not import or render it.  
The right sidebar remains hidden on small screens using:

```jsx
hidden lg:block
```

### Required fix

Import and mount `MobileHelpDrawer` in `StudyGuide`.

## 5. TopicHome / Revision / Exam Routes

**Status: Partially good**

`TopicHome`, `RevisionMode`, and `ExamMode` are now routed from `App`. This is a strong step toward guided learning.

Remaining issues:
- `RevisionMode` depends on page metadata `revisionSummary`, but many page refs are still only metadata and not merged with `_fullData`.
- `ExamMode` only collects exam questions from page-local `questions`; it does not yet read `question-library.json`.
- Existing content has only 48 total page questions, so exam mode may often show an empty state.

## 6. Data Loading / Content Discovery

**Status: Partially working, but not robust**

`DataProvider` calls `/api/topics`, then `loadTopicWithPages(subject, topic)`.

Problems:
- Subjects are still hardcoded in `demoSubjects`.
- Folder names mix cases: `Physics`, `mathematics`, `physics`.
- Static fallback is hardcoded and incomplete.
- Duplicate topic ids are not deduped.

### Required fix

Normalize folder names and ids centrally, then dedupe topic ids.

## 7. Broken Optics Page References

**Status: Critical content bug**

Both:
- `public/Physics/optics/topic.json`
- `public/Physics/physics-optics/topic.json`

contain page refs like:

```json
"file": "pages/light-and-visibility.json"
```

but the actual files are:

```text
pages/physics-optics-light-and-visibility.json
```

This creates 10 missing page references across the two duplicated optics folders.

### Required fix

Either:
1. Update both `topic.json` files to use the real file names, or
2. Rename the page files to match the topic refs.

Recommended:
- Keep only one folder: `public/Physics/optics`
- Delete or archive `public/Physics/physics-optics`
- Fix `topic.json` file paths to actual names

## 8. Parent Topic Editor Page Slug Bug

**Status: Critical parent authoring bug**

`ParentTopicEditor` sets active pages by full page id, then uses:

```js
pageSlug={activePageSlug.split('-').pop()}
```

For `physics-optics-reflection-basics`, this becomes `basics`, causing reads/writes to:

```text
Physics/optics/pages/basics.json
```

which does not exist.

### Required fix

Use the `file` field from topic page metadata to derive the actual file slug.

Example:

```js
const activePageMeta = topicData.pages.find(p => p.id === activePageId);
const pageSlug = activePageMeta.file.replace(/^pages\//, '').replace(/\.json$/, '');
```

## 9. Parent Questions / Clarifiers Route Fragility

**Status: Fragile**

The page and clarifier editors rely on `topic._fullPages`, but source data may not load because of page-file mismatches. The questions editor route also derives page path from a route slug that may not match the real file name.

### Required fix

Always resolve by `page.id` → `page.file` → actual JSON path. Never infer file name from last dash-separated token.

## 10. Export / Import Still Incomplete for Assets

**Status: Not production ready**

`src/services/contentExportService.js` creates:

```js
zip.folder('assets'); // Placeholder
```

It does not export referenced assets. This means parent-created rich content is not portable.

### Required fix

Scan:
- blocks: `image.src`, `svg.src`, `pdf_embed.src`, `image_link.src`
- attachments
- topic `coverAssetPath`
- assets-manifest if present

Then include those files under `assets/` in the ZIP.

## 11. Backend API

**Status: Basic backend works, but feature-incomplete**

Implemented:
- `/api/health`
- `/api/json`
- `/api/mkdir`
- `/api/upload`
- `/api/file`
- `/api/topics`
- static file serving

Missing compared with current app goals:
- `/api/list` for asset library browsing
- `/api/history` for version history
- `/api/student-signals` for child difficulty tags / parent visibility
- `/api/question-library` or equivalent if not file-based

Cold start note:
- backend did not become reachable until about 12 seconds in this environment.
- `jsdom` import alone timed out at 10 seconds in one test.
- because `server.js` imports `jsdom` at the top level, server startup is slowed.

### Required fix

Lazy-load `jsdom` and DOMPurify only inside SVG upload handling, or use a lighter SVG sanitization strategy.

## 12. AI Provider Abstraction

**Status: Not present in this version**

Search found no `aiProvider` layer. `RightSidebar.jsx` still uses direct Gemini-related logic through `geminiService.js` and localStorage key usage.

### Required fix

Introduce:
- `src/ai/aiProvider.js`
- `src/ai/mockProvider.js`
- `src/ai/geminiProvider.js`

Then update `RightSidebar` to call the provider rather than Gemini directly.

## 13. Student Difficulty Tagging / Show More / Question Library

**Status: Not present in this version**

The following were not found in source:
- `student-signals`
- learner signals parent panel
- `ShowMoreDetail`
- question library UI
- question-library ingestion into exam/add-more-question mode

This means the uploaded "Updated study hub.zip" does not include the latest student-driven features from the separate full-code patch.

## 14. Security

Positive:
- path traversal guard is present and works.
- `/api/json?path=../../package.json` is rejected.

Issues:
- `/api/json` returns traversal errors as HTTP 500; better to return 400.
- SVG sanitization exists but causes heavy startup due top-level `jsdom` import.
- Parent PIN is a convenience gate only, not real auth. That is acceptable if documented.

## 15. Performance / Maintainability

Build warning:
- JS bundle is ~941 KB minified.
- Vite warns chunk size >500 KB.

Likely causes:
- JSZip
- KaTeX
- React Markdown / remark
- parent editor imports bundled upfront

Recommended:
- split parent portal routes/components using dynamic import.
- lazy-load JSZip and KaTeX-heavy pieces.
- lazy-load AI provider.

## Priority Fix List

### P0 — Must fix before student testing
1. Fix `StudyGuide` props: use `studyState`, not `pagesRead`.
2. Pass `topic` and `page` into `QuizSection`.
3. Fix optics topic page-file refs.
4. Remove duplicate `physics-optics` topic folder or dedupe by topic id.
5. Fix `ParentTopicEditor` pageSlug derivation.

### P1 — Must fix before parent content work
6. Add `/api/list` and real asset library browsing.
7. Add asset export/import.
8. Normalize subject folder/id mapping.
9. Make parent question/clarifier editors resolve via `page.file`.

### P2 — Guided learning improvements
10. Mount mobile help drawer.
11. Add student signals / difficulty tags.
12. Add question-library consumption.
13. Add AI provider abstraction.

### P3 — Operational polish
14. Fix `npm test` script.
15. Lazy-load `jsdom`.
16. Code-split parent/editor dependencies.
17. Add real e2e test for:
    - student opens topic
    - opens page
    - answers a quiz
    - parent edits a page
    - content persists

## Suggested Immediate Patch Scope

A safe next patch should include only:

1. `StudyGuide` integration fix
2. `QuizSection` prop fix
3. `ParentTopicEditor` slug/path fix
4. Optics topic.json path repair
5. Duplicate optics folder cleanup or dedupe rule
6. `npm test` script fix
7. Lazy `jsdom` import in `server.js`

This would make the current branch much more testable without introducing new product features.

