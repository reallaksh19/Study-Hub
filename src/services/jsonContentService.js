export async function loadTopic(subject, topicFolder) {
  try {
    const res = await fetch(`/${subject}/${topicFolder}/topic.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Error loading topic.json for ${subject}/${topicFolder}:`, err);
    return null;
  }
}

export async function loadPage(subject, topicFolder, pageFile) {
  try {
    // pageFile can be something like "pages/what-is-a-vector.json"
    const res = await fetch(`/${subject}/${topicFolder}/${pageFile}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Error loading ${pageFile} for ${subject}/${topicFolder}:`, err);
    return null;
  }
}

export async function loadTopicWithPages(subject, topicFolder) {
  const topic = await loadTopic(subject, topicFolder);
  if (!topic) return null;

  const fullPages = await Promise.all(
    (topic.pages || []).map(async (pageRef) => {
      const pageData = await loadPage(subject, topicFolder, pageRef.file);
      return { ...pageRef, _fullData: pageData };
    })
  );

  return { ...topic, _fullPages: fullPages, source: 'json' };
}
