import React from 'react';

export function LinkCardBlock({ title, description, url, linkType }) {
  const icon = linkType === 'page' ? '📄' : linkType === 'pdf' ? '📎' : '🔗';

  return (
    <a href={url} className="link-card-block block p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <span className="text-2xl mr-4">{icon}</span>
        <div>
          <h4 className="font-bold">{title}</h4>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <span className="ml-auto">→</span>
      </div>
    </a>
  );
}
