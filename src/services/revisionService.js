export function buildRevisionCards(topic, state) {
  const pages = topic?.pages || [];
  return pages
    .map((page) => {
      const progress = state.pageProgress?.[page.id] || {};
      return {
        id: page.id,
        title: page.title,
        mastery: progress.mastery ?? 0.5,
        needsRevision: Boolean(progress.needsRevision),
        reason: progress.needsRevision ? 'Marked for revision from quiz performance' : 'Weak mastery',
        revisionSummary: page.revisionSummary || []
      };
    })
    .filter((card) => card.needsRevision || card.mastery < 0.65)
    .sort((a, b) => a.mastery - b.mastery);
}

export function buildRevisionSummary(topic, state) {
  const cards = buildRevisionCards(topic, state);
  return {
    count: cards.length,
    strongestNeed: cards[0] || null,
    cards
  };
}

export function groupHelpResources(page) {
  const attachments = page?.attachments || [];
  return attachments.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind || 'link',
    url: item.path || item.url,
    whyThisHelps: item.whyThisHelps || item.description || 'Helpful supporting material'
  }));
}
