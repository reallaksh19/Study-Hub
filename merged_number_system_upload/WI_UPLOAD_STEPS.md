
# Work Instruction — Finish and Upload the Number System Pilot to Study Hub

Use this guide to finish the final checks and upload the merged pilot topic.

## Recommended upload method
**Recommended:** manual folder copy into the Study Hub content directory.

Reason:
- it reliably preserves assets, page JSON files, and topic metadata together
- some Study Hub branches import JSON more reliably than binary assets

## Package contents
- `Mathematics/number-system/topic.json`
- `Mathematics/number-system/pages/*.json`
- `Mathematics/number-system/assets/*`
- `Mathematics/number-system/assets-manifest.json`
- `Mathematics/number-system/question-library.json`
- `content-pack.json` (optional importer route)

## Method A — Manual folder copy (recommended)
1. Stop the Study Hub dev server if it is running.
2. Copy the folder:
   - from this package: `Mathematics/number-system/`
   - into your Study Hub app under: `public/Mathematics/number-system/`
3. Start the backend and frontend again.
4. Open the backend topic index route if available, or refresh the app.
5. Confirm the topic appears under **Mathematics** as **Number System**.

## Method B — Parent dashboard import (optional)
Use only if your current branch supports `content-pack.json` import cleanly.
1. Zip only the `content-pack.json` if your importer expects a simple content pack.
2. In Parent Mode choose **Import Pack**.
3. Import the pack and verify that all 8 pages appear.
4. If images/PDFs do not import automatically, fall back to Method A.

## Final checks before considering it done
### Parent-side checks
- Topic appears under **Mathematics**.
- Topic title is correct.
- All 8 pages show in the topic editor.
- Assets folder is present and accessible.
- `question-library.json` is present for later parent curation.

### Student-side checks
Open the topic page by page and verify:
- page 1 renders text + image + worksheet attachment
- page 2 renders the equation block correctly
- page 3 renders the SVG and clarifiers correctly
- page 4 renders the number-line SVG correctly
- page 5 shows decimal-classification examples correctly
- revision pages show recap content
- the square-roots extension page opens normally
- questions appear at the bottom of pages

### Technical checks
- Every file listed in `topic.json` exists in `pages/`
- Every asset path used in blocks or attachments exists in `assets/`
- No page uses broken slugs or stale file names

## Suggested post-upload cleanup in Study Hub
After the topic is visible in Study Hub, do these cleanup steps in the parent portal:
1. Review page wording and simplify any paragraph that feels too dense.
2. Curate page-level questions down further if a page feels overloaded.
3. Promote only the best questions from `question-library.json` into visible page practice sets.
4. Add better external resource links manually if you want parent-reviewed outbound links.
5. Replace any weak placeholder asset with a better diagram if available.

## Suggested next step after this pilot
If this Number System pilot works well in Study Hub, repeat the same merge process for the next topic instead of uploading raw multi-agent outputs.

Recommended next topic:
- `Rational and Irrational Numbers`

Keep the same format:
- one merged pilot topic
- one QA pass
- one upload
