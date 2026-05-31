# Study Hub — UI Upgrade Source (Complete)

Drop-in production source for every screen revamped on the design canvas. The folder mirrors `src/` from your existing Study-Hub-main project — copy each file over its counterpart.

## Complete file index — 33 files

### Theme + shared (2)

| New file                              | Replaces                                       |
| ------------------------------------- | ---------------------------------------------- |
| `index.css`                           | `src/index.css`                                |
| `lib/Icons.jsx`                       | _new shared module_                            |

### Entry & navigation (3)

| New file                              | Replaces                                       |
| ------------------------------------- | ---------------------------------------------- |
| `components/LandingPage.jsx`          | `src/components/LandingPage.jsx`               |
| `components/parent/ParentPinLock.jsx` | `src/components/parent/ParentPinLock.jsx`      |
| `components/parent/ParentLayout.jsx`  | `src/components/parent/ParentLayout.jsx`       |

### Parent app — 11 screens

| New file                                       | Replaces                                            |
| ---------------------------------------------- | --------------------------------------------------- |
| `components/parent/ParentDashboard.jsx`        | `src/components/parent/ParentDashboard.jsx`         |
| `components/parent/ParentSubjectView.jsx`      | `src/components/parent/ParentSubjectView.jsx`       |
| `components/parent/ParentTopicEditor.jsx`      | `src/components/parent/ParentTopicEditor.jsx`       |
| `components/parent/ParentPageEditor.jsx`       | `src/components/parent/ParentPageEditor.jsx`        |
| `components/parent/ParentOrganiser.jsx`        | `src/components/parent/ParentOrganiser.jsx`         |
| `components/parent/ParentWorksheet.jsx`        | `src/components/parent/ParentWorksheet.jsx`         |
| `components/parent/ParentTaggedPages.jsx`      | `src/components/parent/ParentTaggedPages.jsx`       |
| `components/parent/ParentScoreboard.jsx`       | `src/components/parent/ParentScoreboard.jsx`        |
| `components/parent/ParentImporter.jsx`         | `src/components/parent/ParentImporter.jsx`          |
| `components/parent/ParentHtmlImporter.jsx`     | `src/components/parent/ParentHtmlImporter.jsx`      |
| `components/parent/ParentSettings.jsx`         | `src/components/parent/ParentSettings.jsx`          |

### Student app — 6 screens

| New file                                       | Replaces                                            |
| ---------------------------------------------- | --------------------------------------------------- |
| `components/student/TopicHome.jsx`             | `src/components/student/TopicHome.jsx`              |
| `components/StudyGuide/index.jsx`              | `src/components/StudyGuide/index.jsx`               |
| `components/StudyGuide/RightSidebar.jsx`       | `src/components/StudyGuide/RightSidebar.jsx`        |
| `components/student/MobileHelpDrawer.jsx`      | `src/components/student/MobileHelpDrawer.jsx`       |
| `components/student/WorksheetMode.jsx`         | `src/components/student/WorksheetMode.jsx`          |
| `components/student/ExamMode.jsx`              | `src/components/student/ExamMode.jsx`               |
| `components/student/RevisionMode.jsx`          | `src/components/student/RevisionMode.jsx`           |

### Quiz, questions & helpers — 11 files

| New file                                       | Replaces                                            |
| ---------------------------------------------- | --------------------------------------------------- |
| `components/QuizSection/index.jsx`             | `src/components/QuizSection/index.jsx`              |
| `components/questions/HintCard.jsx`            | `src/components/questions/HintCard.jsx`             |
| `components/questions/SupportMaterialCard.jsx` | `src/components/questions/SupportMaterialCard.jsx`  |
| `components/questions/McqQuestion.jsx`         | `src/components/questions/McqQuestion.jsx`          |
| `components/questions/NumericQuestion.jsx`     | `src/components/questions/NumericQuestion.jsx`      |
| `components/questions/TrueFalseQuestion.jsx`   | `src/components/questions/TrueFalseQuestion.jsx`    |
| `components/questions/FillInBlankQuestion.jsx` | `src/components/questions/FillInBlankQuestion.jsx`  |
| `components/questions/ShortAnswerQuestion.jsx` | `src/components/questions/ShortAnswerQuestion.jsx`  |
| `components/questions/MatchFollowingQuestion.jsx` | `src/components/questions/MatchFollowingQuestion.jsx` |
| `components/questions/AssertionReasonQuestion.jsx` | `src/components/questions/AssertionReasonQuestion.jsx` |
| `components/questions/ConceptStrengthenerQuestion.jsx` | `src/components/questions/ConceptStrengthenerQuestion.jsx` |

## How to install

1. **Copy** every file above into the matching path under `src/` in your project.
   `lib/Icons.jsx` lands at `src/lib/Icons.jsx` (a new folder).
2. The new `index.css` adds a Google Fonts import (Geist + Newsreader + JetBrains Mono). To self-host, replace the `@import url(...)` line with `@font-face` rules.
3. All untouched files keep working unchanged — every import path, prop name, service call and behavior is preserved.
4. Restart Vite (`npm run dev`) — Tailwind v4 picks up the new `@theme` tokens.

## What's behaviorally identical

Every upgraded file is a 1-for-1 behavior preservation — only the JSX/styles change.

**Entry**

- **PIN lock** — sha256 verify, default `1234`, 3-strike → 30s lockout, sessionStorage flag, auto-advance, backspace navigation.
- **Layout** — hash routes, back-navigation logic, unsaved-changes guard, content-tree expansion, open-tag count, "Back to Student App".

**Parent app**

- **Dashboard** — `checkBackendStatus`, search filter, "Add Subject" → `createDirectory` + `saveJSON` → reload, subject cards w/ all 5 counts.
- **Subject view** — 3-step delete confirm, add-topic via API, edit + worksheet planner links.
- **Topic editor** — 4 tabs (Pages / Organise / Worksheet / Import), deep-link tab via `sessionStorage.topicEditorInitialTab`, validateTopic, add page → `saveJSON`, delete topic 2-step, `examDurationMinutes` onBlur save.
- **Page editor** — draft load/save (`parent_draft__…`), `readJSON`/`saveJSON`, block add/reorder/duplicate/delete, dirty-change reporting; inner `BlockList`/`BlockEditorPanel`/`BlockToolbar` untouched.
- **Organiser** — embedded + standalone modes, `loadTopic`/`loadPage`, reorder/delete for pages, blocks, questions, clarifiers, save state, delete-page modal with optional reference cleanup; inner `PageDndList`/`PageDetailTabs`/`ContentPreviewPanel` untouched.
- **Worksheet planner** — `worksheet_selection_<subject>_<topic>` localStorage, default-all save, `getInteractiveResult` per page, avg score + attempt count, quick-open links, "Start worksheet", "Clear all scores", Import shortcuts.
- **Tagged pages** — `onResolveTag({ tagId, resolutionNote })`, status filter w/ counts, resolution drafts state, sort by open-then-newest.
- **Scoreboard** — subject + view filter, `getInteractiveResult`, `getPageMastery` from `learning_state`, `getExamResult`, drillCount, links to topic worksheet planner.
- **Importer** — 3-tab shell, default tab from hash, renders existing `PasteImportWizard` / `ParentHtmlImporter` / `ZipPackPanel` unchanged.
- **HTML importer** — `analyseHtmlSource` (debounced), `saveHtmlImport`, auto subject→topic seeding, title override, canonical-vs-interactive badge, live preview iframe, post-import worksheet planner link.
- **Settings** — `geminiApiKey` save, lock parent mode (clears `parent_unlocked`), PIN reset to 1234.

**Student app**

- **Topic home** — `calculateTopicStats`, `getNextRecommendedPage`, `getResumePageId`, `isPageUnlocked`, all five action buttons (worksheet conditional).
- **Study Guide** — `IntersectionObserver` mark-read, prev/next, tag/untag prompt, `RightSidebar` + `MobileHelpDrawer`.
- **RightSidebar** — clarifier styles (5 types), `LinkCardBlock` for related pages, `callGemini` for summarise + explain differently, loading/dismiss states.
- **MobileHelpDrawer** — open/close + body-scroll lock, reuses `RightSidebar` unchanged, backdrop close.
- **Worksheet mode** — localStorage selection load, live-fetch fallback for stale DataContext, interactive_html full-bleed iframe path, regular `StudyGuide` path, completion screen.
- **Exam mode** — `collectExamQuestions`, `CountdownTimer`, `saveExamResult` + exported `getExamResult`, timed run, closed-book notice, results screen.
- **Revision mode** — `buildRevisionSummary`, `onOpenPage`, `onBack`.

**Quiz + questions**

- **QuizSection** — `recordQuestionOutcome`, `addPageRevision`, `groupHelpResources`, support pages/resources, `SupportMaterialCard` flow, finished score screen with tone-based palette.
- **MCQ** — integer-or-letter answer mapping, disabled-after-answer, idle/correct/wrong/dimmed reveal, explanation surface.
- **Numeric** — `parseFloat` + tolerance comparison, unit display, Enter to submit.
- **True/False** — boolean OR string answer, idle/correct/wrong/dimmed tiles, explanation.
- **Fill in blank** — normalize/lowercase comparison, array-of-answers support, Enter-to-submit, expected-answer reveal.
- **Short answer** — submit → status 'submitted', self-mark Got it / Need practice, model-answer HTML.
- **Match the following** — pairs map, `correctPairs` scoring, all-answered gating, per-row correct/wrong reveal.
- **Assertion/Reason** — 4 OPTIONS map, `answerPattern` match, radio selection, explanation surface.
- **Concept strengthener** — externalLink open + 'explored' status + `xpReward`.
- **HintCard** — `dangerouslySetInnerHTML` body preserved.
- **SupportMaterialCard** — hint + clarifiers (5 types) + supportBlocks + supportPages + supportResources + retry/save/next.

## Design tokens

Defined in `index.css`. Available as Tailwind utilities (`bg-ink`, `text-muted`, `border-line`, …):

| Token            | Hex        | Use                                  |
| ---------------- | ---------- | ------------------------------------ |
| `--color-ink`    | `#16182B`  | Primary text, dark surfaces          |
| `--color-paper`  | `#F6F2E8`  | App background (warm cream)          |
| `--color-paper-2`| `#FBF8EF`  | Subtle surfaces, sidebars            |
| `--color-line`   | `#ECE7D8`  | Borders, dividers                    |
| `--color-brand`  | `#4F46E5`  | Primary action accent (indigo)       |
| `--color-success`| `#0E8A5F`  | Correct answers, read pages          |
| `--color-warn`   | `#B45309`  | Hints, common mistakes               |
| `--color-danger` | `#B91C1C`  | Wrong answers, errors                |
| `--color-accent` | `#C2410C`  | Tag-for-parent, "why it matters"     |
| `--color-violet` | `#7C3AED`  | Exam drill                           |

Type families:

- **Sans** (UI): Geist
- **Display** (headlines, marketing): Newsreader (serif, used via `.serif`)
- **Mono**: JetBrains Mono (used via `.mono` for codes, page numbers)

## Coverage

All app-level surfaces are now upgraded — landing, parent shell, every authoring screen, every student mode, all 8 question types, and every helper kind.

Sub-components that already had reasonable shells and live inside the upgraded screens (`Importer/PasteImport/*`, `Organiser/PageDndList`, `Organiser/PageDetailTabs`, `Organiser/ContentPreviewPanel`, `PageEditor/BlockList`, `PageEditor/BlockEditorPanel`, `PageEditor/BlockToolbar`, `ClarifierEditor/*`, `QuestionEditor/*`) keep working unmodified. If you want any of those re-skinned next, say the word.

## Test checklist

After dropping files in:

- [ ] Landing → "Parent Portal" → PIN prompt shows new card → enter `1234`
- [ ] Parent dashboard → click subject card → Subject view → click topic → Topic editor opens
- [ ] Topic editor tabs cycle: Pages, Organise, Worksheet, Import
- [ ] Page editor: add a block via toolbar → "Draft · unsaved" badge → "Save page" clears it
- [ ] Organiser: drag-reorder pages, blocks, questions, clarifiers — save indicator pulses
- [ ] Worksheet planner: toggle pages → "Start worksheet" link appears with count + total minutes
- [ ] HTML importer: paste source → canonical-vs-interactive badge updates → preview iframe renders → import shows post-success worksheet shortcut
- [ ] Tagged pages: open a tag → enter resolution → "Mark resolved" closes it
- [ ] Scoreboard renders rows with topic / pages / worksheet / exam / mastery columns
- [ ] Settings: Gemini key save flashes "Settings saved."
- [ ] Student topic home → "Resume" → study guide loads with new typography
- [ ] Tag a page → return to topic home → row shows "Tagged for parent"
- [ ] Quiz: each question type — MCQ, Numeric, T/F, Fill, Short, Match, Assertion, Concept — uses the new feedback palette
- [ ] Worksheet mode → sticky top + dot nav + completion screen
- [ ] Exam mode → timer counts down → submit → results screen with score
- [ ] Mobile (≤lg breakpoint): "Need help?" pill at bottom-right of study guide → opens drawer

Every upgraded file preserves the original logic 1-for-1 — diff against the originals to confirm.
