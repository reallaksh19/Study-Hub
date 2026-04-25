import React, { useState, useEffect } from 'react';

export function PdfEmbedBlock({ src, title, height }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="pdf-embed-block mb-4">
      {title && <h3 className="font-bold mb-2">{title}</h3>}
      {isMobile ? (
        <a href={src} target="_blank" rel="noopener noreferrer" className="block p-4 bg-blue-50 text-blue-600 rounded text-center font-bold">
          View PDF
        </a>
      ) : (
        <iframe src={src} width="100%" height={height || 600} title={title || 'PDF Embed'} />
      )}
    </div>
  );
}
