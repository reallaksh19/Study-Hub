import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');
const errors = [];
const questionIds = new Set();
let auditedSubjects = 0;
let auditedTopics = 0;
let auditedPages = 0;
let auditedQuestions = 0;

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${path.relative(publicDir, filePath)}: invalid JSON (${error.message})`);
    return null;
  }
}

function isGrade4(value) {
  return typeof value === 'string' && /^grade\s*4$/i.test(value.trim());
}

function uniqueNormalized(values) {
  return new Set(values.map((value) => String(value).trim().toLowerCase())).size === values.length;
}

function resolveMcqAnswer(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  if (Number.isInteger(question.answer)) return question.answer;
  if (typeof question.answer !== 'string') return null;
  const answer = question.answer.trim();
  if (/^[A-Za-z]$/.test(answer)) return answer.toUpperCase().charCodeAt(0) - 65;
  const normalized = answer.toLowerCase();
  const matches = options
    .map((option, index) => ({ option: String(option).trim().toLowerCase(), index }))
    .filter((entry) => entry.option === normalized);
  return matches.length === 1 ? matches[0].index : null;
}

for (const subjectFolder of fs.readdirSync(publicDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const subjectDir = path.join(publicDir, subjectFolder.name);
  const subjectFile = path.join(subjectDir, 'subject.json');
  const subject = fs.existsSync(subjectFile) ? readJson(subjectFile) : null;
  const subjectIsGrade4 = isGrade4(subject?.grade) || /^grade4/i.test(String(subject?.id || subjectFolder.name));
  if (!subjectIsGrade4) continue;

  const topicDirs = fs.readdirSync(subjectDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(subjectDir, entry.name, 'topic.json')));
  if (topicDirs.length === 0) continue;
  auditedSubjects += 1;

  for (const topicEntry of topicDirs) {
    const topicDir = path.join(subjectDir, topicEntry.name);
    const topicFile = path.join(topicDir, 'topic.json');
    const topic = readJson(topicFile);
    if (!topic) continue;
    auditedTopics += 1;

    if (!isGrade4(topic.grade) && !isGrade4(subject?.grade)) {
      errors.push(`${path.relative(publicDir, topicFile)}: Grade 4 published topic must declare grade "Grade 4" on topic or subject`);
    }
    if (!Array.isArray(topic.pages) || topic.pages.length === 0) {
      errors.push(`${path.relative(publicDir, topicFile)}: Grade 4 topic must publish at least one page`);
      continue;
    }

    for (const pageRef of topic.pages) {
      const pageFile = path.resolve(topicDir, String(pageRef.file || ''));
      if (!pageRef.file || !fs.existsSync(pageFile)) {
        errors.push(`${path.relative(publicDir, topicFile)}: broken page reference ${pageRef.file || '(missing)'}`);
        continue;
      }
      const page = readJson(pageFile);
      if (!page) continue;
      auditedPages += 1;

      if (page.id !== pageRef.id) errors.push(`${path.relative(publicDir, pageFile)}: page id must match topic page ref`);
      if (!isGrade4(page.grade || pageRef.grade || topic.grade || subject?.grade)) {
        errors.push(`${path.relative(publicDir, pageFile)}: page must resolve to Grade 4`);
      }
      const pageSkillIds = Array.isArray(page.skillIds) ? page.skillIds.filter(Boolean) : Array.isArray(pageRef.skillIds) ? pageRef.skillIds.filter(Boolean) : [];
      if (pageSkillIds.length === 0) errors.push(`${path.relative(publicDir, pageFile)}: published Grade 4 page must declare skillIds`);

      const questions = Array.isArray(page.questions) ? page.questions : [];
      if (page.pageKind === 'worksheet' && questions.length === 0) {
        errors.push(`${path.relative(publicDir, pageFile)}: worksheet page must contain structured questions`);
      }

      const mcqPositions = [0, 0, 0, 0];
      const difficulties = new Set();
      for (const [index, question] of questions.entries()) {
        auditedQuestions += 1;
        const location = `${path.relative(publicDir, pageFile)} question ${index + 1}`;
        if (!question?.id || typeof question.id !== 'string') {
          errors.push(`${location}: stable question id required`);
          continue;
        }
        if (questionIds.has(question.id)) errors.push(`${location}: duplicate question id ${question.id}`);
        questionIds.add(question.id);
        if (!['easy', 'medium', 'hard'].includes(question.difficulty)) errors.push(`${location}: explicit easy/medium/hard difficulty required`);
        else difficulties.add(question.difficulty);
        if (!Array.isArray(question.skillIds) || question.skillIds.length === 0) errors.push(`${location}: skillIds required`);

        if (question.type === 'mcq') {
          const options = Array.isArray(question.options) ? question.options : [];
          if (typeof question.prompt !== 'string' || !question.prompt.trim()) errors.push(`${location}: MCQ prompt required`);
          if (options.length !== 4) errors.push(`${location}: Grade 4 MCQ must have exactly four options`);
          if (!uniqueNormalized(options)) errors.push(`${location}: MCQ options must be unique`);
          const answerIndex = resolveMcqAnswer(question);
          if (answerIndex == null || answerIndex < 0 || answerIndex >= options.length) errors.push(`${location}: invalid MCQ answer`);
          else if (answerIndex < mcqPositions.length) mcqPositions[answerIndex] += 1;
          if (typeof question.explanation !== 'string' || !question.explanation.trim()) errors.push(`${location}: MCQ explanation required`);
        }
      }

      const mcqCount = mcqPositions.reduce((sum, count) => sum + count, 0);
      if (mcqCount >= 8) {
        const minimum = Math.floor(mcqCount * 0.15);
        mcqPositions.forEach((count, answerIndex) => {
          if (count < minimum) errors.push(`${path.relative(publicDir, pageFile)}: answer position ${answerIndex + 1} appears only ${count}/${mcqCount}; rebalance MCQ answer positions`);
        });
      }
      if (questions.length >= 12 && difficulties.size < 3) {
        errors.push(`${path.relative(publicDir, pageFile)}: question bank with 12+ items must include easy, medium and hard items`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Grade 4 published-content audit failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Grade 4 published-content audit passed');
console.log(`Subjects: ${auditedSubjects}; topics: ${auditedTopics}; pages: ${auditedPages}; questions: ${auditedQuestions}`);
