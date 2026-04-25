import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { loadTopicWithPages } from './jsonContentService.js';

export async function exportPack(subjects, topics) {
  const pack = {
    version: 1,
    topics: [],
    pages: {}
  };

  // We fetch each topic that comes from json source
  for (const topicMeta of topics) {
    if (topicMeta.source === 'json') {
      const topic = await loadTopicWithPages(topicMeta.subjectId, topicMeta.folder || topicMeta.id);
      if (topic) {
        // Strip out the internal _fullPages before saving topic
        const t = { ...topic };
        delete t._fullPages;
        delete t.source;
        t.folder = topicMeta.folder; pack.topics.push(t);

        // Add pages
        for (const page of topic._fullPages) {
          if (page._fullData) {
            pack.pages[page.id] = page._fullData;
          }
        }
      }
    }
  }

  const zip = new JSZip();
  zip.file('content-pack.json', JSON.stringify(pack, null, 2));
  zip.folder('assets'); // Placeholder

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'content-pack.zip');
}
