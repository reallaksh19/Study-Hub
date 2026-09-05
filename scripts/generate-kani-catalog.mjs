import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKaniCatalog } from '../src/integration/catalog/buildCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const outputDir = path.join(publicDir, 'content');
const outputPath = path.join(outputDir, 'catalog.json');

const publishedAt = process.env.KANI_CATALOG_PUBLISHED_AT || new Date().toISOString();
const catalog = buildKaniCatalog({ publicDir, publishedAt });

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Kani catalog written: ${path.relative(repoRoot, outputPath)}`);
console.log(`Subjects: ${catalog.subjects.length}; topics: ${catalog.topics.length}; pages: ${catalog.pages.length}`);
