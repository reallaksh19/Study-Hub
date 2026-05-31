import React from 'react';
import { sanitizeSvg } from '../../utils/svgSanitizer.js';

export function SvgBlock({ src, inlineSvg, caption, alt }) {
  return (
    <div className="svg-block">
      {src ? (
        <img src={src} alt={alt || caption} />
      ) : inlineSvg ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizeSvg(inlineSvg) }} />
      ) : null}
      {caption && <p className="caption">{caption}</p>}
    </div>
  );
}
