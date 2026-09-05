import express from 'express';
import { createDomainContentService } from './domainContentService.js';

function notImplemented(res, capability) {
  return res.status(501).json({
    error: 'Not implemented',
    capability,
    contract: 'kani-attempt-v1',
    note: 'This route is reserved for the future authenticated learning service.'
  });
}

export function createKaniRouter({ publicDir }) {
  const router = express.Router();
  const content = createDomainContentService({ publicDir });

  router.get('/health', (_req, res) => {
    res.json({ success: true, apiVersion: 'v1', schemaVersion: '1.0' });
  });

  router.get('/catalog', (_req, res) => {
    try {
      res.json(content.getCatalog());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/subjects', (_req, res) => {
    try {
      res.json(content.getSubjects());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/topics', (req, res) => {
    try {
      res.json(content.getTopics(req.query.subjectId));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/topics/:topicId', (req, res) => {
    try {
      const topic = content.getTopic(req.params.topicId);
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
      res.json(topic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/pages/:pageId', (req, res) => {
    try {
      const page = content.getPage(req.params.pageId);
      if (!page) return res.status(404).json({ error: 'Page not found' });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/attempts', (_req, res) => notImplemented(res, 'record-attempt'));
  router.get('/students/:studentId/attempts', (_req, res) => notImplemented(res, 'student-attempts'));
  router.get('/students/:studentId/mastery', (_req, res) => notImplemented(res, 'student-mastery'));
  router.get('/students/:studentId/revision', (_req, res) => notImplemented(res, 'student-revision'));
  router.get('/students/:studentId/recommendations', (_req, res) => notImplemented(res, 'student-recommendations'));

  return router;
}
