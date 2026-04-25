import React from 'react';

export function ImageLinkBlock({ src, href, alt, caption }) {
  return (
    <div className="image-link-block">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <img src={src} alt={alt || caption} className="cursor-pointer" />
      </a>
      {caption && <p className="caption text-center mt-2 text-sm text-gray-500">{caption}</p>}
    </div>
  );
}
