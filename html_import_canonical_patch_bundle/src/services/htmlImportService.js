import { createDirectory, readJSON, saveJSON, uploadAsset } from './parentApiService.js';
import {
  extractCanonicalPayloadFromHtml,
  deriveHtmlTitle,
  sanitizeHtmlForPreview,
  buildCanonicalPageFromImport,
  buildStaticHtmlPage
} from '../content/canonicalContentLayer.js';
import { slugify } from '../utils/slugify.js';

export function analyseHtmlSource(htmlSource) {
  const previewHtml = sanitizeHtmlForPreview(htmlSource || '');
  const title = deriveHtmlTitle(htmlSource || '');
  const canonical = extractCanonicalPayloadFromHtml(htmlSource || '');

  if (canonical.found && canonical.valid) {
    return {
      mode: 'canonical',
      title: canonical.page.title || title,
      previewHtml,
      canonicalPage: canonical.page,
      summary: {
        blocks: canonical.page.blocks?.length || 0,
        questions: canonical.page.questions?.length || 0,
        clarifiers: canonical.page.clarifiers?.length || 0,
        attachments: canonical.page.attachments?.length || 0,
        resources: canonical.page.resources?.length || 0
      },
      issues: []
    };
  }

  return {
    mode: 'static_html',
    title,
    previewHtml,
    canonicalPage: null,
    summary: {
      blocks: 1,
      questions: 0,
      clarifiers: 0,
      attachments: 1,
      resources: 0
    },
    issues: canonical.found && !canonical.valid ? [canonical.error] : []
  };
}

function upsertPageMeta(existingTopic, newPageMeta) {
  const pages = Array.isArray(existingTopic.pages) ? [...existingTopic.pages] : [];
  const idx = pages.findIndex(page => page.id === newPageMeta.id || page.file === newPageMeta.file);
  if (idx >= 0) {
    pages[idx] = {
      ...pages[idx],
      title: newPageMeta.title,
      estimatedMinutes: newPageMeta.estimatedMinutes ?? pages[idx].estimatedMinutes,
      difficulty: newPageMeta.difficulty ?? pages[idx].difficulty,
      conceptTags: newPageMeta.conceptTags ?? pages[idx].conceptTags,
      pageKind: newPageMeta.pageKind ?? pages[idx].pageKind
    };
  } else {
    pages.push(newPageMeta);
  }
  return pages.map((page, index) => ({ ...page, order: index + 1 }));
}

export async function saveHtmlImport({
  htmlSource,
  analysis,
  selectedTopic,
  subjectId,
  topicFolder,
  titleOverride
}) {
  if (!selectedTopic) throw new Error('No topic selected.');
  if (!htmlSource?.trim()) throw new Error('Paste HTML source before importing.');

  const subjectFolder = selectedTopic.subjectFolder || selectedTopic.subjectId || subjectId;
  const finalTitle = titleOverride?.trim() || analysis.title || 'Imported HTML Page';
  const slug = slugify(finalTitle);
  const pageId = `${subjectId}-${topicFolder}-${slug}`;
  const assetRelativePath = `${subjectFolder}/${topicFolder}/assets/${slug}.html`;
  const assetWebPath = `/${assetRelativePath}`;
  const pageRelativePath = `${subjectFolder}/${topicFolder}/pages/${slug}.json`;
  const topicRelativePath = `${subjectFolder}/${topicFolder}/topic.json`;

  await createDirectory(`${subjectFolder}/${topicFolder}/assets`);
  await createDirectory(`${subjectFolder}/${topicFolder}/pages`);

  const htmlFile = new File([htmlSource], `${slug}.html`, { type: 'text/html' });
  await uploadAsset(htmlFile, assetRelativePath);

  let topic;
  try {
    topic = await readJSON(topicRelativePath);
  } catch {
    topic = {
      id: `${subjectId}-${topicFolder}`,
      subjectId,
      title: selectedTopic.title || topicFolder,
      difficulty: 'medium',
      estimatedMinutes: 0,
      pages: []
    };
  }

  const pageData = analysis.mode === 'canonical'
    ? buildCanonicalPageFromImport(analysis.canonicalPage, {
        subjectId,
        topicFolder,
        slug,
        htmlAssetPath: assetWebPath
      })
    : buildStaticHtmlPage({
        title: finalTitle,
        subjectId,
        topicFolder,
        slug,
        assetWebPath
      });

  await saveJSON(pageRelativePath, pageData);

  const newPageMeta = {
    id: pageId,
    file: `pages/${slug}.json`,
    title: finalTitle,
    order: Array.isArray(topic.pages) ? topic.pages.length + 1 : 1,
    estimatedMinutes: pageData.estimatedMinutes || 0,
    difficulty: pageData.difficulty || 'medium',
    conceptTags: pageData.conceptTags || [],
    pageKind: pageData.pageKind || 'interactive'
  };

  const updatedTopic = { ...topic, pages: upsertPageMeta(topic, newPageMeta) };
  await saveJSON(topicRelativePath, updatedTopic);

  return {
    subjectFolder,
    pageId,
    topicId: `${subjectId}-${topicFolder}`,
    pageRelativePath,
    topicRelativePath,
    assetWebPath,
    slug,
    title: finalTitle,
    mode: analysis.mode
  };
}
