import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKaniCatalog } from '../src/integration/catalog/buildCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');
const catalog = buildKaniCatalog({ publicDir, publishedAt: '2000-01-01T00:00:00.000Z' });

console.log('Kani content audit passed');
console.log(`Subjects: ${catalog.subjects.length}`);
console.log(`Topics: ${catalog.topics.length}`);
console.log(`Pages: ${catalog.pages.length}`);
