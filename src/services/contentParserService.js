import { callGemini } from './geminiService.js';
import { markdownToBlocks } from '../utils/markdownToBlocks.js';

// ─── Public API ──────────────────────────────────────────────────────────────

// importMode: 'worksheet' | 'practice' | 'exam_drill'
// tagExamDrill kept for backward compat (ZipPackPanel)
export async function parseContentToPages(text, apiKey, options = {}) {
  const { importMode = 'worksheet', tagExamDrill = false } = options;
  // Resolve effective mode — legacy tagExamDrill flag maps to exam_drill
  const effectiveMode = importMode !== 'worksheet' ? importMode : (tagExamDrill ? 'exam_drill' : 'worksheet');

  let rawPages, parseMode;
  if (apiKey) {
    try {
      rawPages = await parseWithAI(text, apiKey);
      parseMode = 'ai';
    } catch (e) {
      console.warn('[contentParser] AI parse failed, using rule-based fallback:', e.message);
      rawPages = parseWithRules(text);
      parseMode = 'fallback';
    }
  } else {
    rawPages = parseWithRules(text);
    parseMode = 'fallback';
  }
  const { pages, issues } = normalizeParsedPages(rawPages, parseMode, { importMode: effectiveMode });
  return { pages, issues, mode: parseMode };
}

// ─── AI Path ─────────────────────────────────────────────────────────────────

async function parseWithAI(text, apiKey) {
  const prompt = buildAIPrompt(text);
  const response = await callGemini(prompt, apiKey);
  const json = extractJSON(response);
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('AI response is not a JSON array');
  return parsed;
}

function buildAIPrompt(text) {
  return `Return ONLY a valid JSON array. No explanation. No markdown fences. Each element is a page object:
{
  "title": string,
  "pagePurpose": "lesson"|"worksheet"|"reading"|"poem"|"worked_example"|"revision",
  "difficulty": "easy"|"medium"|"hard",
  "conceptTags": string[],
  "estimatedMinutes": number,
  "suggestedTitleReason": string,
  "sourceConfidence": 0.0-1.0,
  "parseWarnings": string[],
  "blocks": [{ "type": string, "data": object, "sourceConfidence": 0.0-1.0 }],
  "questions": [{ "type": string, "prompt": string, "questionCategory": "recall"|"apply"|"analyse"|"hots", "sourceConfidence": 0.0-1.0, ...type-specific }],
  "clarifiers": [{ "type": string, "title": string, "body": string, "sourceConfidence": 0.0-1.0 }]
}

Block types and their data shapes:
- heading: { text, level: 2|3|4 }
- paragraph: { text }
- bullets: { items: string[] }
- equation: { latex, displayMode: true }
- table: { rows: string[][] } — first row is header
- worked_solution: { title, steps: string[], answer: string }
- example: { title, scenario, solution }
- callout|tip|warning|misconception: { title, body }
- divider: {}

Question types:
- mcq: { prompt, options: [A,B,C,D], answer: 0-3, explanation }
- short_answer: { prompt, modelAnswer }
- numeric: { prompt, answer: number, tolerance: number, unit: string }
- true_false: { prompt, answer: boolean, explanation }

Clarifier types: tip | warning | key_fact | common_mistake | did_you_know

Rules:
- Split pages at major section boundaries: decimal numbering like "1.0 Title", "2.0 Title"; "Section I/II/III"; "Exercise 1"; level-1 headings; "HOTS"; "Answer Key"
- Sub-sections (2.1, 2.2) stay INSIDE the same page as their parent section
- Hints and "Socratic Hint" entries → clarifiers with type "tip"
- Answer keys → set the answer field on the corresponding question; do NOT make answer key lines into blocks
- NEVER invent MCQ answers or formula values not explicitly in the source; if answer is absent leave it blank and add a parseWarning
- NEVER include HTML tags, external image URLs, or src/href/url values in block data
- Preserve LaTeX math exactly as written (\\frac, \\pi, \\sqrt, etc.)

Text to parse:
"""
${text}
"""`;
}

function extractJSON(response) {
  // Strip markdown code fences if present
  let clean = response.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }
  // Find first [ to last ]
  const start = clean.indexOf('[');
  const end = clean.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found in AI response');
  return clean.slice(start, end + 1);
}

// ─── Rule-Based Path ─────────────────────────────────────────────────────────

function parseWithRules(text) {
  // Pass 0: normalize
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // Pass 1: split into page chunks
  const chunks = splitIntoChunks(lines);

  // Pass 2: extract blocks per chunk + collect answer map
  const pages = chunks.map((chunk, idx) => extractPageFromChunk(chunk, idx));

  // Pass 3: answer back-fill (answer map is per page already)
  for (const page of pages) {
    if (page._answerMap && Object.keys(page._answerMap).length > 0) {
      backfillAnswers(page.questions, page._answerMap);
    }
    delete page._answerMap;
  }

  // Pass 4: metadata inference already done per chunk
  return pages;
}

// ─── Pass 1: Page Splitting ───────────────────────────────────────────────────

const SPLIT_PATTERNS = [
  // Numbered decimal top-level: "1.0 Title" but NOT "1.1 Subtitle"
  /^(\d+)\.0\s+\S/,
  // Labeled sections
  /^(Section|Part|Exercise|Chapter|Unit|HOTS|Deep Thinking)\s*[:\-.]?\s*([IVXLC]+|\d+)/i,
  // Roman numeral headings: "I. Title" "II. Title"
  /^([IVXLC]+)\.\s+\S/,
  // Markdown H1
  /^#\s+.+/,
  // ALL-CAPS line (6+ chars, no ending punctuation) — section header in scanned docs
  /^[A-Z][A-Z\s]{5,}[A-Z]$/
];

function splitIntoChunks(lines) {
  const splitIndices = [0];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    for (const pat of SPLIT_PATTERNS) {
      if (pat.test(line)) {
        splitIndices.push(i);
        break;
      }
    }
  }

  // If only one split (no splits found), treat entire text as one page
  if (splitIndices.length < 2) {
    return [lines];
  }

  const chunks = [];
  for (let i = 0; i < splitIndices.length; i++) {
    const start = splitIndices[i];
    const end = i + 1 < splitIndices.length ? splitIndices[i + 1] : lines.length;
    chunks.push(lines.slice(start, end));
  }
  return chunks;
}

// ─── Pass 2: Block Extraction Per Chunk ───────────────────────────────────────

const QUESTION_KEYWORDS = /^(what|why|how|where|when|who|which|calculate|find|determine|solve|prove|show|explain|compare|describe|evaluate|state|define|list|identify)/i;

const HINT_PATTERN = /^(hint|socratic hint|note|tip|warning|caution|reminder|important)\s*[:.\s]/i;

const WORKED_ANCHOR = /^(solution|given|step\s*\d+|therefore|∴|ans)\s*[:.\s]/i;

const ANSWER_KEY_HEADER = /^(answer\s*key|answers|selected\s*answers|answer)\s*[:\s]*/i;

function extractPageFromChunk(lines, chunkIndex) {
  const remaining = [...lines];
  const blocks = [];
  const questions = [];
  const clarifiers = [];
  const answerMap = {};

  // Detect page title from first non-empty line
  const firstNonEmpty = remaining.find((l) => l.trim().length > 0) || '';
  const pageTitle = deriveTitle(firstNonEmpty) || `Page ${chunkIndex + 1}`;
  let pagePurpose = 'lesson';
  let difficulty = 'easy';

  // Detect page purpose from header
  if (/\bHOTS\b|deep thinking|higher order/i.test(firstNonEmpty)) {
    pagePurpose = 'worksheet';
    difficulty = 'hard';
  } else if (/\bsection\b|\bexercise\b|\bworksheet\b/i.test(firstNonEmpty)) {
    pagePurpose = 'worksheet';
  }

  // ── Answer key section: strip out first ──
  const { linesWithout: afterAnswerKey, answerMap: foundAnswers } = extractAnswerKeySection(remaining);
  Object.assign(answerMap, foundAnswers);

  // ── Process remaining lines ──
  let i = 0;
  const pool = afterAnswerKey;

  while (i < pool.length) {
    const line = pool[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Table detection
    const tableResult = tryExtractTable(pool, i);
    if (tableResult) {
      blocks.push({ type: 'table', data: { rows: tableResult.rows }, sourceConfidence: tableResult.confidence });
      i = tableResult.nextIndex;
      continue;
    }

    // Math detection (single display math line)
    const mathResult = tryExtractMath(trimmed);
    if (mathResult) {
      blocks.push({ type: 'equation', data: { latex: mathResult.latex, displayMode: true }, sourceConfidence: 0.9 });
      i++;
      continue;
    }

    // Worked solution
    const workedResult = tryExtractWorkedSolution(pool, i);
    if (workedResult) {
      blocks.push({ type: 'worked_solution', data: workedResult.data, sourceConfidence: 0.8 });
      i = workedResult.nextIndex;
      continue;
    }

    // Hint/callout → clarifier
    const hintResult = tryExtractHint(pool, i);
    if (hintResult) {
      clarifiers.push({ type: hintResult.type, title: hintResult.title, body: hintResult.body, sourceConfidence: 0.85 });
      i = hintResult.nextIndex;
      continue;
    }

    // Numbered question
    const questionResult = tryExtractQuestion(pool, i);
    if (questionResult) {
      questions.push({ ...questionResult.question, sourceConfidence: questionResult.confidence });
      i = questionResult.nextIndex;
      continue;
    }

    // Collect remaining text for markdown processing
    // Gather a run of plain lines until we hit a detector boundary
    const runStart = i;
    let j = i;
    while (j < pool.length) {
      const t = pool[j].trim();
      if (!t) { j++; continue; }
      if (
        tryExtractTable(pool, j) ||
        tryExtractMath(t) ||
        WORKED_ANCHOR.test(t) ||
        HINT_PATTERN.test(t) ||
        tryExtractQuestion(pool, j)
      ) break;
      j++;
    }

    if (j > runStart) {
      const chunk = pool.slice(runStart, j).join('\n').trim();
      if (chunk) {
        const mdBlocks = safeMarkdownToBlocks(chunk);
        for (const b of mdBlocks) {
          blocks.push({ ...b, sourceConfidence: 0.6 });
        }
      }
      i = j;
    } else {
      i++;
    }
  }

  // Poem / passage heuristic on remaining paragraph blocks
  const allText = blocks.filter((b) => b.type === 'paragraph').map((b) => b.data.text).join('\n');
  const lineArray = allText.split('\n').filter(Boolean);
  if (lineArray.length >= 4) {
    const avgLen = lineArray.reduce((s, l) => s + l.length, 0) / lineArray.length;
    const wordCounts = lineArray.map((l) => l.split(/\s+/).length);
    const avgWords = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

    if (avgLen < 65 && avgWords <= 12 && questions.length === 0) {
      pagePurpose = 'poem';
    } else if (avgLen > 70 && /["']/.test(allText)) {
      pagePurpose = 'reading';
    }
  }

  const wordCount = pool.join(' ').split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    title: pageTitle,
    pagePurpose,
    difficulty,
    conceptTags: [],
    estimatedMinutes,
    sourceConfidence: 0.65,
    parseWarnings: [],
    blocks,
    questions,
    clarifiers,
    _answerMap: answerMap
  };
}

// ─── Table Detector ───────────────────────────────────────────────────────────

function tryExtractTable(lines, startIdx) {
  const line = lines[startIdx]?.trim() || '';
  if (!line.includes('|')) return null;

  const tableLines = [];
  let i = startIdx;
  while (i < lines.length && lines[i].trim().includes('|')) {
    tableLines.push(lines[i].trim());
    i++;
  }

  if (tableLines.length < 2) return null;

  // Filter out markdown separator rows (--- | --- | ---)
  const dataLines = tableLines.filter((l) => !/^[\|\s\-:]+$/.test(l));
  if (dataLines.length < 2) return null;

  const rows = dataLines.map((l) =>
    l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
  );

  // Validate consistent column count
  const colCount = rows[0].length;
  if (colCount < 2) return null;
  const consistent = rows.every((r) => r.length === colCount || Math.abs(r.length - colCount) <= 1);
  if (!consistent) return null;

  return { rows, nextIndex: i, confidence: tableLines.some((l) => /---/.test(l)) ? 0.9 : 0.75 };
}

// ─── Math Detector ────────────────────────────────────────────────────────────

const LATEX_MARKERS = ['\\frac', '\\pi', '\\sqrt', '\\times', '\\pm', '\\int', '^{', '_{', '\\text{', '\\left', '\\right'];

function tryExtractMath(trimmedLine) {
  if (/^\$\$.+\$\$$/.test(trimmedLine)) {
    return { latex: trimmedLine.replace(/^\$\$/, '').replace(/\$\$$/, '') };
  }
  if (/^\\\[.+\\\]$/.test(trimmedLine)) {
    return { latex: trimmedLine.replace(/^\\\[/, '').replace(/\\\]$/, '') };
  }
  if (LATEX_MARKERS.some((m) => trimmedLine.includes(m)) && trimmedLine.length < 200) {
    return { latex: trimmedLine };
  }
  return null;
}

// ─── Worked Solution Detector ─────────────────────────────────────────────────

function tryExtractWorkedSolution(lines, startIdx) {
  const trimmed = lines[startIdx]?.trim() || '';
  if (!WORKED_ANCHOR.test(trimmed)) return null;

  const steps = [];
  let answer = '';
  let i = startIdx;

  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t && steps.length > 0) break;
    if (t && /^(therefore|∴|ans|answer\s*[:=])/i.test(t)) {
      answer = t.replace(/^(therefore|∴|ans|answer\s*[:=])\s*/i, '').trim();
      i++;
      break;
    }
    if (t) steps.push(t);
    i++;
    // Stop after blank line following content
    if (!t && steps.length > 0 && i < lines.length && !lines[i].trim()) break;
  }

  if (steps.length === 0) return null;

  const title = steps[0];
  return {
    data: { title, steps: steps.slice(1), answer },
    nextIndex: i
  };
}

// ─── Hint / Callout Detector ──────────────────────────────────────────────────

const HINT_TYPE_MAP = {
  hint: 'tip', 'socratic hint': 'tip', tip: 'tip',
  warning: 'warning', caution: 'warning',
  note: 'key_fact', important: 'key_fact', reminder: 'key_fact'
};

function tryExtractHint(lines, startIdx) {
  const trimmed = lines[startIdx]?.trim() || '';
  const match = trimmed.match(HINT_PATTERN);
  if (!match) return null;

  const keyword = match[1].toLowerCase();
  const type = HINT_TYPE_MAP[keyword] || 'tip';
  const bodyStart = trimmed.slice(match[0].length).trim();
  const bodyLines = bodyStart ? [bodyStart] : [];

  let i = startIdx + 1;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) break;
    // Stop if next line looks like a new section/question
    if (HINT_PATTERN.test(t) || /^(\d+)[\.\)]\s/.test(t) || WORKED_ANCHOR.test(t)) break;
    bodyLines.push(t);
    i++;
  }

  return { type, title: keyword.charAt(0).toUpperCase() + keyword.slice(1), body: bodyLines.join(' '), nextIndex: i };
}

// ─── Question Detector ────────────────────────────────────────────────────────

const MCQ_OPTION_PATTERN = /^\s*([a-d])\s*[\.\)]\s*(.+)/i;

function tryExtractQuestion(lines, startIdx) {
  const trimmed = lines[startIdx]?.trim() || '';
  const numMatch = trimmed.match(/^(\d+)\s*[\.\)]\s*(.{10,})/);
  if (!numMatch) return null;

  const qNum = parseInt(numMatch[1], 10);
  const promptStart = numMatch[2].trim();

  // Collect multi-line prompt
  const promptLines = [promptStart];
  let i = startIdx + 1;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) break;
    if (/^(\d+)\s*[\.\)]\s*/.test(t)) break; // next question
    if (HINT_PATTERN.test(t) || WORKED_ANCHOR.test(t) || t.includes('|')) break;
    if (MCQ_OPTION_PATTERN.test(t)) break;
    promptLines.push(t);
    i++;
  }
  const prompt = promptLines.join(' ').trim();

  // Is it actually a question? (keyword or ?)
  const isQuestion = prompt.endsWith('?') || QUESTION_KEYWORDS.test(prompt);
  if (!isQuestion) return null;

  // Look ahead for MCQ options
  const optionLines = [];
  let j = i;
  while (j < lines.length && j < i + 8) {
    const t = lines[j].trim();
    if (!t) { j++; continue; }
    const optMatch = t.match(MCQ_OPTION_PATTERN);
    if (optMatch) {
      optionLines.push({ letter: optMatch[1].toLowerCase(), text: optMatch[2].trim() });
      j++;
    } else if (optionLines.length > 0) {
      break; // stop after options end
    } else {
      break; // no option found on first non-blank
    }
  }

  const hasFourOptions = optionLines.length === 4 &&
    ['a', 'b', 'c', 'd'].every((l) => optionLines.some((o) => o.letter === l));

  let question;
  let confidence;
  if (hasFourOptions) {
    question = {
      type: 'mcq',
      questionNumber: qNum,
      prompt,
      options: ['a', 'b', 'c', 'd'].map((l) => optionLines.find((o) => o.letter === l).text),
      answer: null, // back-filled from answer key
      explanation: ''
    };
    confidence = 0.85;
    i = j;
  } else {
    question = {
      type: 'short_answer',
      questionNumber: qNum,
      prompt,
      modelAnswer: ''
    };
    confidence = prompt.endsWith('?') ? 0.85 : 0.75;
  }

  return { question, nextIndex: i, confidence };
}

// ─── Answer Key ───────────────────────────────────────────────────────────────

function extractAnswerKeySection(lines) {
  const answerMap = {};
  let inAnswerKey = false;
  const linesWithout = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (ANSWER_KEY_HEADER.test(t)) {
      inAnswerKey = true;
      continue;
    }
    if (inAnswerKey) {
      // Parse: "1. 570 cm²" or "1) A" or "1. a"
      const m = t.match(/^(\d+)[\.\)]\s*(.+)/);
      if (m) {
        const num = parseInt(m[1], 10);
        const raw = m[2].trim();
        // MCQ letter answer
        const letterMatch = raw.match(/^([a-d])\s*$/i);
        if (letterMatch) {
          answerMap[num] = { type: 'mcq_letter', value: letterMatch[1].toLowerCase() };
        } else {
          // Numeric answer
          const numMatch = raw.match(/^-?[\d,]+(?:\.\d+)?/);
          if (numMatch) {
            const numVal = parseFloat(numMatch[0].replace(/,/g, ''));
            const unit = raw.slice(numMatch[0].length).trim().replace(/^[\\$\s]+/, '');
            answerMap[num] = { type: 'numeric', value: numVal, unit };
          } else {
            answerMap[num] = { type: 'text', value: raw };
          }
        }
        continue;
      }
      // Blank line after answers = end of section
      if (!t && Object.keys(answerMap).length > 0) {
        inAnswerKey = false;
      }
      continue;
    }
    linesWithout.push(lines[i]);
  }

  return { linesWithout, answerMap };
}

function backfillAnswers(questions, answerMap) {
  for (const q of questions) {
    const num = q.questionNumber;
    if (num == null || answerMap[num] == null) continue;
    const ans = answerMap[num];
    if (q.type === 'mcq' && ans.type === 'mcq_letter') {
      const idx = ['a', 'b', 'c', 'd'].indexOf(ans.value);
      if (idx !== -1 && q.answer == null) q.answer = idx;
    } else if (q.type === 'numeric' || (q.type === 'short_answer' && ans.type === 'numeric')) {
      if (!q.modelAnswer) {
        q.modelAnswer = `${ans.value}${ans.unit ? ' ' + ans.unit : ''}`;
        if (ans.type === 'numeric') {
          q.type = 'numeric';
          q.answer = ans.value;
          q.unit = ans.unit || '';
          q.tolerance = 0;
        }
      }
    } else if (q.type === 'short_answer' && ans.type === 'text' && !q.modelAnswer) {
      q.modelAnswer = ans.value;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveTitle(firstLine) {
  const trimmed = firstLine.trim();
  // Strip markdown heading markers
  const noHash = trimmed.replace(/^#+\s*/, '');
  // Strip decimal section numbers "1.0 "
  const noDecimal = noHash.replace(/^\d+\.\d+\s+/, '');
  // Strip roman numeral prefix "I. " or "Section I: "
  const noRoman = noDecimal.replace(/^([IVXLC]+\.\s+|section\s+[IVXLC\d]+[:\s]+)/i, '');
  return noRoman.slice(0, 80).trim() || null;
}

function safeMarkdownToBlocks(text) {
  try {
    return markdownToBlocks(text);
  } catch {
    return [{ id: 'fallback-0', type: 'paragraph', data: { text } }];
  }
}

// ─── Normalization ────────────────────────────────────────────────────────────

const VALID_BLOCK_TYPES = new Set([
  'heading', 'paragraph', 'bullets', 'equation', 'table',
  'worked_solution', 'example', 'callout', 'tip', 'warning',
  'misconception', 'divider', 'image', 'image_link', 'link_card',
  'svg', 'pdf_embed', 'mermaid', 'video_embed'
]);

const VALID_QUESTION_TYPES = new Set(['mcq', 'short_answer', 'numeric', 'true_false', 'concept_strengthener']);

const VALID_CLARIFIER_TYPES = new Set(['tip', 'warning', 'key_fact', 'common_mistake', 'did_you_know']);

const VALID_PURPOSES = new Set(['lesson', 'worksheet', 'reading', 'poem', 'worked_example', 'revision']);

export function normalizeParsedPages(rawPages, mode, options = {}) {
  // importMode: 'worksheet' | 'practice' | 'exam_drill'
  // tagExamDrill: legacy boolean, treated as exam_drill
  const { importMode = 'worksheet', tagExamDrill = false } = options;
  const questionMode = importMode === 'practice' ? 'practice'
    : (importMode === 'exam_drill' || tagExamDrill) ? 'exam_drill'
    : null; // null = no mode tag (standard study question)
  const issues = [];

  const pages = (rawPages || []).map((rawPage, pageIdx) => {
    const page = {
      title: typeof rawPage.title === 'string' && rawPage.title.trim() ? rawPage.title.trim() : `Page ${pageIdx + 1}`,
      pagePurpose: VALID_PURPOSES.has(rawPage.pagePurpose) ? rawPage.pagePurpose : 'lesson',
      difficulty: ['easy', 'medium', 'hard'].includes(rawPage.difficulty) ? rawPage.difficulty : 'easy',
      conceptTags: Array.isArray(rawPage.conceptTags) ? rawPage.conceptTags.filter((t) => typeof t === 'string') : [],
      estimatedMinutes: typeof rawPage.estimatedMinutes === 'number' && rawPage.estimatedMinutes > 0
        ? Math.round(rawPage.estimatedMinutes)
        : estimateMinutes(rawPage),
      sourceConfidence: typeof rawPage.sourceConfidence === 'number' ? rawPage.sourceConfidence : 0.6,
      parseWarnings: Array.isArray(rawPage.parseWarnings) ? rawPage.parseWarnings : [],
      blocks: [],
      questions: [],
      clarifiers: [],
      attachments: []
    };

    // Normalize blocks
    const rawBlocks = Array.isArray(rawPage.blocks) ? rawPage.blocks : [];
    const seenHeadings = new Set();
    let prevType = null;

    for (let bi = 0; bi < rawBlocks.length; bi++) {
      const rb = rawBlocks[bi];
      if (!rb || typeof rb !== 'object') continue;

      let type = rb.type;
      const data = rb.data || {};

      // Strip non-relative URLs from data
      const cleanData = stripUnsafeUrls(data);

      // Unknown type → paragraph
      if (!VALID_BLOCK_TYPES.has(type)) {
        issues.push({ pageIndex: pageIdx, blockIndex: bi, severity: 'warning', message: `Unknown block type "${type}" converted to paragraph` });
        type = 'paragraph';
      }

      // Trim text fields
      if (cleanData.text) cleanData.text = String(cleanData.text).trim();
      if (cleanData.title) cleanData.title = String(cleanData.title).trim();
      if (cleanData.body) cleanData.body = String(cleanData.body).trim();

      // Dedupe consecutive identical headings
      if (type === 'heading') {
        const key = `${cleanData.level}:${cleanData.text}`;
        if (seenHeadings.has(key) && prevType === 'heading') continue;
        seenHeadings.add(key);
      }

      // Skip empty blocks
      const isEmpty = isBlockEmpty(type, cleanData);
      if (isEmpty) continue;

      // Ensure bullets items is an array
      if (type === 'bullets' && !Array.isArray(cleanData.items)) {
        cleanData.items = [];
      }

      page.blocks.push({
        type,
        data: cleanData,
        sourceConfidence: typeof rb.sourceConfidence === 'number' ? rb.sourceConfidence : 0.6
      });
      prevType = type;
    }

    // Warn on divider-only pages
    const nonDividers = page.blocks.filter((b) => b.type !== 'divider');
    if (nonDividers.length === 0 && rawBlocks.length > 0) {
      issues.push({ pageIndex: pageIdx, severity: 'warning', message: 'Page may be empty (only dividers)' });
    }

    // Normalize questions
    const rawQuestions = Array.isArray(rawPage.questions) ? rawPage.questions : [];
    const seenPrompts = new Set();
    for (let qi = 0; qi < rawQuestions.length; qi++) {
      const rq = rawQuestions[qi];
      if (!rq) continue;

      let type = rq.type;
      if (!VALID_QUESTION_TYPES.has(type)) {
        type = 'short_answer';
        issues.push({ pageIndex: pageIdx, severity: 'info', message: `Unknown question type "${rq.type}" converted to short_answer` });
      }

      const prompt = String(rq.prompt || '').trim();
      if (!prompt) continue;

      // Dedup by type + prompt hash
      const key = `${type}:${prompt.toLowerCase()}`;
      if (seenPrompts.has(key)) continue;
      seenPrompts.add(key);

      const normalized = { type, prompt, sourceConfidence: rq.sourceConfidence ?? 0.6 };

      if (type === 'mcq') {
        normalized.options = Array.isArray(rq.options) ? rq.options.slice(0, 4).map(String) : ['', '', '', ''];
        const ans = rq.answer;
        normalized.answer = typeof ans === 'number' ? Math.min(3, Math.max(0, Math.round(ans))) : null;
        normalized.explanation = String(rq.explanation || '').trim();
      } else if (type === 'short_answer') {
        normalized.modelAnswer = String(rq.modelAnswer || '').trim();
      } else if (type === 'numeric') {
        normalized.answer = typeof rq.answer === 'number' ? rq.answer : null;
        normalized.tolerance = typeof rq.tolerance === 'number' ? rq.tolerance : 0;
        normalized.unit = String(rq.unit || '').trim();
      } else if (type === 'true_false') {
        normalized.answer = typeof rq.answer === 'boolean' ? rq.answer : null;
        normalized.explanation = String(rq.explanation || '').trim();
      }

      if (rq.questionNumber != null) normalized.questionNumber = rq.questionNumber;
      if (questionMode) normalized.mode = questionMode;
      page.questions.push(normalized);
    }

    // Normalize clarifiers
    const rawClarifiers = Array.isArray(rawPage.clarifiers) ? rawPage.clarifiers : [];
    const seenClarifiers = new Set();
    for (const rc of rawClarifiers) {
      if (!rc) continue;
      const type = VALID_CLARIFIER_TYPES.has(rc.type) ? rc.type : 'tip';
      const title = String(rc.title || '').trim();
      const body = String(rc.body || '').trim();
      if (!title && !body) continue;
      const key = `${title.toLowerCase()}:${body.toLowerCase()}`;
      if (seenClarifiers.has(key)) continue;
      seenClarifiers.add(key);
      page.clarifiers.push({ type, title, body, sourceConfidence: rc.sourceConfidence ?? 0.6 });
    }

    // Recalculate page confidence as average of children
    const childConfs = [
      ...page.blocks.map((b) => b.sourceConfidence),
      ...page.questions.map((q) => q.sourceConfidence),
      ...page.clarifiers.map((c) => c.sourceConfidence)
    ];
    if (childConfs.length > 0) {
      page.sourceConfidence = childConfs.reduce((a, b) => a + b, 0) / childConfs.length;
    }

    return page;
  });

  return { pages, issues };
}

function isBlockEmpty(type, data) {
  if (type === 'divider') return false;
  if (type === 'paragraph' || type === 'heading') return !data.text?.trim();
  if (type === 'equation') return !data.latex?.trim();
  if (type === 'bullets') return !Array.isArray(data.items) || data.items.length === 0;
  if (type === 'table') return !Array.isArray(data.rows) || data.rows.length < 2;
  if (type === 'worked_solution') return !data.title?.trim() && !data.steps?.length;
  return false;
}

function stripUnsafeUrls(data) {
  const cleaned = { ...data };
  for (const field of ['src', 'href', 'url']) {
    if (typeof cleaned[field] === 'string') {
      const val = cleaned[field];
      // Allow relative paths only
      if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('//')) {
        delete cleaned[field];
      }
    }
  }
  return cleaned;
}

function estimateMinutes(rawPage) {
  const textParts = [];
  for (const b of rawPage.blocks || []) {
    const d = b.data;
    if (!d) continue;
    if (typeof d.text === 'string') textParts.push(d.text);
    else if (typeof d.title === 'string') textParts.push(d.title);
    else if (Array.isArray(d.items)) textParts.push(d.items.join(' '));
    else if (Array.isArray(d.steps)) textParts.push(d.steps.join(' '));
  }
  for (const q of rawPage.questions || []) {
    if (q.prompt) textParts.push(q.prompt);
  }
  const wordCount = textParts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
