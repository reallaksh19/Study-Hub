import { z } from 'zod';

export const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any()
});

export const ClarifierSchema = z.object({
  id: z.string(),
  type: z.enum(['tip', 'warning', 'key_fact', 'common_mistake', 'did_you_know']),
  title: z.string(),
  body: z.string()
});

export const QuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  prompt: z.string().optional(),
  options: z.array(z.string()).optional(),
  answer: z.any().optional(),
  explanation: z.string().optional(),
  modelAnswer: z.string().optional(),
  tolerance: z.number().optional(),
  unit: z.string().optional(),
  supportBlockIds: z.array(z.string()).optional(),
  supportClarifierIds: z.array(z.string()).optional(),
  embedContent: z.string().optional(),
  externalLink: z.string().optional()
});

export const PageSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  title: z.string(),
  blocks: z.array(BlockSchema),
  clarifiers: z.array(ClarifierSchema),
  questions: z.array(QuestionSchema)
});

export const TopicSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number().optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pages: z.array(z.object({
    id: z.string(),
    file: z.string(),
    title: z.string(),
    order: z.number().optional(),
    estimatedMinutes: z.number().optional(),
    difficulty: z.string().optional(),
    prerequisitePageIds: z.array(z.string()).optional(),
    relatedPageIds: z.array(z.string()).optional()
  }))
});

export const ContentPackSchema = z.object({
  version: z.number(),
  topics: z.array(TopicSchema),
  pages: z.record(PageSchema)
});

export function validatePage(obj) {
  const result = PageSchema.safeParse(obj);
  return { success: result.success, error: result.success ? undefined : result.error.toString() };
}

export function validateTopic(obj) {
  const result = TopicSchema.safeParse(obj);
  return { success: result.success, error: result.success ? undefined : result.error.toString() };
}
