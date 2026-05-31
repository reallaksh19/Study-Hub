import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001; // Or any port you prefer
app.use(express.json());
const writeApiToken = process.env.STUDY_HUB_WRITE_TOKEN || '';

function getSafePath(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.trim() === '') throw new Error('Missing path');
  const publicDir = path.resolve(__dirname, 'public');
  const cleanRelative = relativePath.replace(/^[/\\]+/, '');
  const fullPath = path.resolve(publicDir, cleanRelative);
  const relativeFromPublic = path.relative(publicDir, fullPath);

  if (relativeFromPublic.startsWith('..') || path.isAbsolute(relativeFromPublic)) {
    throw new Error('Invalid path: Directory traversal not allowed');
  }
  return fullPath;
}

function isPathValidationError(err) {
  return err?.message === 'Missing path' || err?.message === 'Invalid path: Directory traversal not allowed';
}

function resolveErrorStatus(err) {
  return isPathValidationError(err) ? 400 : 500;
}

function isLoopbackAddress(address) {
  if (!address) return false;
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1'
  );
}

function authorizeWriteRequest(req, res) {
  const remoteAddress = req.socket?.remoteAddress || '';
  if (isLoopbackAddress(remoteAddress)) return true;

  if (writeApiToken !== '' && req.get('x-study-hub-token') === writeApiToken) return true;
  res.status(403).json({ error: 'Forbidden' });
  return false;
}

async function sanitizeSvgFile(fullPath) {
  const [{ default: createDOMPurify }, { JSDOM }] = await Promise.all([
    import('dompurify'),
    import('jsdom')
  ]);
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = DOMPurify.sanitize(content, { USE_PROFILES: { svg: true, svgFilters: true } });
  fs.writeFileSync(fullPath, content);
}


const upload = multer({ dest: 'public/uploads/' });

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

// JSON backend endpoints
app.post('/api/json', (req, res) => {
  try {
    if (!authorizeWriteRequest(req, res)) return;
    const { path: relativePath, data } = req.body;
    if (!relativePath || !data) return res.status(400).json({ error: 'Missing path or data' });

    const fullPath = getSafePath(relativePath);
    // Ensure directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

// Try to find a real path when exact path doesn't exist (case-insensitive subject folder match)
function resolveCaseInsensitivePath(relativePath) {
  const publicDir = path.resolve(__dirname, 'public');
  const parts = relativePath.replace(/^[/\\]+/, '').split(/[/\\]/);
  // Only attempt resolution for topic-scoped paths (subject/topic/...)
  if (parts.length < 2) return null;
  try {
    const entries = fs.readdirSync(publicDir);
    const match = entries.find(e => e.toLowerCase() === parts[0].toLowerCase());
    if (!match || match === parts[0]) return null; // exact match already handled or no match
    const candidate = path.resolve(publicDir, match, ...parts.slice(1));
    const rel = path.relative(publicDir, candidate);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return fs.existsSync(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

app.get('/api/json', (req, res) => {
  try {
    const relativePath = req.query.path;
    if (!relativePath) return res.status(400).json({ error: 'Missing path' });

    const fullPath = getSafePath(relativePath);
    const resolvedPath = fs.existsSync(fullPath) ? fullPath : resolveCaseInsensitivePath(relativePath);
    if (!resolvedPath) return res.status(404).json({ error: 'File not found' });

    const content = fs.readFileSync(resolvedPath, 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.post('/api/mkdir', (req, res) => {
  try {
    if (!authorizeWriteRequest(req, res)) return;
    const relativePath = req.body.path;
    if (!relativePath) return res.status(400).json({ error: 'Missing path' });

    const fullPath = getSafePath(relativePath);
    fs.mkdirSync(fullPath, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!authorizeWriteRequest(req, res)) return;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let finalPath = req.body.path || ('/uploads/' + file.filename + path.extname(file.originalname));
    const fullPath = getSafePath(finalPath);

    // Ensure dir
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    // Move from multer dest
    fs.renameSync(file.path, fullPath);

    // Sanitize if SVG
    if (fullPath.endsWith('.svg')) {
      await sanitizeSvgFile(fullPath);
    }

    res.json({ path: finalPath.startsWith('/') ? finalPath : '/' + finalPath });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.delete('/api/file', (req, res) => {
  try {
    if (!authorizeWriteRequest(req, res)) return;
    const relativePath = req.query.path;
    if (!relativePath) return res.status(400).json({ error: 'Missing path' });

    const fullPath = getSafePath(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.delete('/api/directory', (req, res) => {
  try {
    if (!authorizeWriteRequest(req, res)) return;
    const relativePath = req.query.path;
    if (!relativePath) return res.status(400).json({ error: 'Missing path' });

    const fullPath = getSafePath(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.get('/api/topics', (req, res) => {
  try {
    const publicDir = path.resolve(__dirname, 'public');
    const topicsByKey = new Map();

    const subjects = fs.readdirSync(publicDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const subject of subjects) {
      const subjectPath = path.join(publicDir, subject);
      const possibleTopics = fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const topic of possibleTopics) {
        const topicFilePath = path.join(subjectPath, topic, 'topic.json');
        if (fs.existsSync(topicFilePath)) {
          let topicId = null;
          try {
            const parsedTopic = JSON.parse(fs.readFileSync(topicFilePath, 'utf8'));
            topicId = typeof parsedTopic.id === 'string' ? parsedTopic.id : null;
          } catch {}

          const dedupeKey = topicId || `${subject}/${topic}`;
          const existing = topicsByKey.get(dedupeKey);
          const candidate = { subject, topic };
          if (!existing) {
            topicsByKey.set(dedupeKey, candidate);
            continue;
          }

          const existingSegments = existing.topic.split('-').length;
          const candidateSegments = topic.split('-').length;
          const shouldReplace = candidateSegments < existingSegments || (candidateSegments === existingSegments && topic.length < existing.topic.length);
          if (shouldReplace) {
            topicsByKey.set(dedupeKey, candidate);
          }
        }
      }
    }

    res.json(Array.from(topicsByKey.values()));
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.get('/api/subjects', (req, res) => {
  try {
    const publicDir = path.resolve(__dirname, 'public');
    const subjectFolders = fs.readdirSync(publicDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const subjects = subjectFolders.map((folderName, index) => {
      const subjectFilePath = path.join(publicDir, folderName, 'subject.json');
      if (fs.existsSync(subjectFilePath)) {
        try {
          const subjectData = JSON.parse(fs.readFileSync(subjectFilePath, 'utf8'));
          return {
            id: String(subjectData.id || folderName).toLowerCase(),
            title: String(subjectData.title || folderName),
            icon: subjectData.icon || 'BookOpen',
            color: subjectData.color || '#4f46e5',
            order: Number(subjectData.order || index + 1)
          };
        } catch {}
      }

      const hasTopicDirectory = fs.readdirSync(path.join(publicDir, folderName), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .some((dirent) => fs.existsSync(path.join(publicDir, folderName, dirent.name, 'topic.json')));
      if (!hasTopicDirectory) return null;

      return {
        id: folderName.toLowerCase(),
        title: folderName,
        icon: 'BookOpen',
        color: '#4f46e5',
        order: index + 1
      };
    }).filter(Boolean);

    res.json(subjects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)));
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
