import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPatternDiagnosticPublicationEnvelope } from '../src/patterns/patternDiagnosticHandoff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'public', 'content', 'diagnostics', 'patterns-initial.json');
const envelope = createPatternDiagnosticPublicationEnvelope();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(envelope, null, 2)}\n`);

console.log(`Patterns diagnostic written: ${path.relative(repoRoot, outputPath)}`);
console.log(`Questions: ${envelope.questions.length}`);
