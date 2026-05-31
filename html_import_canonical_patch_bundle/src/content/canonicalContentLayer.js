import { z } from 'zod';
import { slugify } from '../utils/slugify.js';

export const CanonicalBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'heading', 'paragraph', 'bullets', 'equation', 'table', 'image', 'svg',
    'divider', 'callout', 'tip', 'warning', 'misconception', 'example',
    'worked_solution', 'study_guide_section', 'video_embed', 'pdf_embed',
    'download_card', 'interactive_html'
  ]),
  data: z.object({}).catchall(z.any()).default({})
});

export const CanonicalClarifierSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['tip', 'warning', 'key_fact', 'common_mistake', 'did_you_know']),
  title: z.string().min(1),
  body: z.string().min(1)
});

const BaseQuestionSchema = z.object({
  id: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCategory: z.enum(['recall', 'apply', 'analyse', 'hots']).optional(),
  conceptTags: z.array(z.string()).optional(),
  supportHint: z.string().optional()
});

export const CanonicalQuestionSchema = z.discriminatedUnion('type', [
  BaseQuestionSchema.extend({
    type: z.literal('mcq'),
    prompt: z.string(),
    options: z.array(z.string()).default([]),
    answer: z.union([z.number(), z.string()]).optional(),
    explanation: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('multi_select'),
    prompt: z.string(),
    options: z.array(z.string()).default([]),
    answers: z.array(z.number()).default([]),
    explanation: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('true_false'),
    prompt: z.string(),
    answer: z.boolean().optional(),
    explanation: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('short_answer'),
    prompt: z.string(),
    modelAnswer: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('numeric'),
    prompt: z.string(),
    answer: z.number().optional(),
    tolerance: z.number().optional(),
    unit: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('fill_in_blank'),
    prompt: z.string(),
    answer: z.union([z.string(), z.number()]).optional(),
    explanation: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('match_following'),
    prompt: z.string(),
    leftItems: z.array(z.object({ id: z.string(), text: z.string() })).default([]),
    rightItems: z.array(z.object({ id: z.string(), text: z.string() })).default([]),
    correctPairs: z.array(z.tuple([z.string(), z.string()])).default([])
  }),
  BaseQuestionSchema.extend({
    type: z.literal('assertion_reason'),
    assertion: z.string(),
    reason: z.string(),
    answerPattern: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('sequence_order'),
    prompt: z.string(),
    items: z.array(z.string()).default([]),
    correctOrder: z.array(z.number()).default([])
  }),
  BaseQuestionSchema.extend({
    type: z.literal('long_answer'),
    prompt: z.string(),
    modelAnswer: z.string().optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('diagram_label'),
    prompt: z.string(),
    labels: z.array(z.string()).default([]),
    answerMap: z.record(z.string()).optional()
  }),
  BaseQuestionSchema.extend({
    type: z.literal('interactive_external'),
    prompt: z.string().optional(),
    externalRef: z.object({}).catchall(z.any()).optional()
  })
]);

export const AttachmentSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  kind: z.string(),
  assetPath: z.string().optional(),
  previewMode: z.string().optional(),
  downloadable: z.boolean().optional(),
  studentVisible: z.boolean().optional()
});

export const ResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  kind: z.string(),
  url: z.string().optional(),
  whyThisHelps: z.string().optional(),
  studentVisible: z.boolean().optional()
});

export const CanonicalPageImportSchema = z.object({
  title: z.string().min(1),
  pageKind: z.enum([
    'lesson', 'study_guide', 'worked_example', 'worksheet', 'handout', 'revision',
    'assessment', 'interactive', 'video_lesson', 'faq', 'article', 'resource_bundle'
  ]).default('lesson'),
  blocks: z.array(CanonicalBlockSchema).default([]),
  clarifiers: z.array(CanonicalClarifierSchema).default([]),
  questions: z.array(CanonicalQuestionSchema).default([]),
  attachments: z.array(AttachmentSchema).default([]),
  resources: z.array(ResourceSchema).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  estimatedMinutes: z.number().optional(),
  conceptTags: z.array(z.string()).default([]),
  prerequisitePageIds: z.array(z.string()).default([]),
  relatedPageIds: z.array(z.string()).default([])
});

export const InteractiveOutcomeSchema = z.object({
  pageId: z.string(),
  topicId: z.string(),
  attemptId: z.string().optional(),
  score: z.number(),
  total: z.number(),
  correctCount: z.number().optional(),
  wrongCount: z.number().optional(),
  percentage: z.number().optional(),
  status: z.string().optional(),
  answers: z.array(z.any()).optional(),
  completedAt: z.string().optional()
});

export function extractCanonicalPayloadFromHtml(htmlSource) {
  if (!htmlSource || typeof htmlSource !== 'string') return { found: false, error: 'Empty HTML source' };
  const match = htmlSource.match(
    /<script[^>]+id=["']studyhub-canonical-page["'][^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i
  ) || htmlSource.match(
    /<script[^>]+type=["']application\/json["'][^>]*id=["']studyhub-canonical-page["'][^>]*>([\s\S]*?)<\/script>/i
  );

  if (!match) return { found: false };

  try {
    const parsed = JSON.parse(match[1].trim());
    const validated = CanonicalPageImportSchema.safeParse(parsed);
    if (!validated.success) {
      return { found: true, valid: false, error: validated.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') };
    }
    return { found: true, valid: true, page: validated.data };
  } catch (error) {
    return { found: true, valid: false, error: error.message };
  }
}

export function deriveHtmlTitle(htmlSource) {
  if (!htmlSource) return 'Imported HTML Page';
  const titleMatch = htmlSource.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]?.trim()) return titleMatch[1].trim();
  const h1Match = htmlSource.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]?.trim()) return stripHtml(h1Match[1]).trim();
  return 'Imported HTML Page';
}

export function stripHtml(input) {
  return String(input || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sanitizeHtmlForPreview(input) {
  return String(input || '').replace(/<script\b[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, '');
}

export function buildCanonicalPageFromImport(canonicalPage, { subjectId, topicFolder, slug, htmlAssetPath }) {
  const pageId = `${subjectId}-${topicFolder}-${slug}`;
  const topicId = `${subjectId}-${topicFolder}`;

  const blocks = (canonicalPage.blocks || []).map((block, index) => ({
    ...block,
    id: block.id || `${pageId}-b${index}`
  }));

  const clarifiers = (canonicalPage.clarifiers || []).map((clarifier, index) => ({
    ...clarifier,
    id: clarifier.id || `${pageId}-cl${index}`
  }));

  const questions = (canonicalPage.questions || []).map((question, index) => ({
    ...question,
    id: question.id || `${pageId}-q${index}`
  }));

  const attachments = (canonicalPage.attachments || []).map((attachment, index) => ({
    ...attachment,
    id: attachment.id || `${pageId}-att${index}`
  }));

  const resources = (canonicalPage.resources || []).map((resource, index) => ({
    ...resource,
    id: resource.id || `${pageId}-res${index}`
  }));

  if (htmlAssetPath) {
    resources.unshift({
      id: `${pageId}-res-original-html`,
      title: 'Original imported HTML',
      kind: 'internal_html_asset',
      url: htmlAssetPath,
      whyThisHelps: 'Original imported HTML source preserved for reference.',
      studentVisible: false
    });
  }

  return {
    id: pageId,
    topicId,
    title: canonicalPage.title,
    pageKind: canonicalPage.pageKind || 'lesson',
    blocks,
    clarifiers,
    questions,
    attachments,
    resources,
    difficulty: canonicalPage.difficulty || 'medium',
    estimatedMinutes: canonicalPage.estimatedMinutes || 0,
    conceptTags: canonicalPage.conceptTags || [],
    prerequisitePageIds: canonicalPage.prerequisitePageIds || [],
    relatedPageIds: canonicalPage.relatedPageIds || [],
    importedFrom: 'html-importer'
  };
}

export function buildStaticHtmlPage({ title, subjectId, topicFolder, slug, assetWebPath }) {
  const pageId = `${subjectId}-${topicFolder}-${slug}`;
  const topicId = `${subjectId}-${topicFolder}`;
  return {
    id: pageId,
    topicId,
    title,
    pageKind: 'interactive',
    blocks: [
      {
        id: `${pageId}-b0`,
        type: 'interactive_html',
        data: {
          assetPath: assetWebPath,
          mode: 'iframe',
          trackResults: true,
          messagingContract: 'studyhub:v1',
          pageId,
          topicId
        }
      }
    ],
    clarifiers: [],
    questions: [],
    attachments: [
      {
        id: `${pageId}-att0`,
        title: 'Original HTML',
        kind: 'html',
        assetPath: assetWebPath,
        previewMode: 'iframe',
        downloadable: true,
        studentVisible: false
      }
    ],
    resources: [],
    difficulty: 'medium',
    estimatedMinutes: 10,
    conceptTags: [slugify(title)],
    importedFrom: 'html-importer'
  };
}
