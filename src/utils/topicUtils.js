/** Derives the filesystem folder name for a topic, stripping any subject prefix. */
export function getTopicFolder(topic, subjectId) {
  if (typeof topic?.folder === 'string' && topic.folder.length > 0) return topic.folder;
  const topicId = String(topic?.id || '');
  const prefix = subjectId ? `${subjectId}-` : '';
  if (prefix && topicId.startsWith(prefix)) return topicId.slice(prefix.length);
  return topicId;
}
