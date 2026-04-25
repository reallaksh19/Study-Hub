import React from 'react';
import { SvgBlock } from './SvgBlock.jsx';
import { WorkedSolutionBlock } from './WorkedSolutionBlock.jsx';
import { PdfEmbedBlock } from './PdfEmbedBlock.jsx';
import { ImageLinkBlock } from './ImageLinkBlock.jsx';
import { LinkCardBlock } from './LinkCardBlock.jsx';
import { MathFormula } from '../MathFormula.jsx';
import { ContentRenderer } from '../common/ContentRenderer.jsx';
import { InteractiveHtmlBlock } from './InteractiveHtmlBlock.jsx';

export function BlockRenderer({ block }) {
  if (!block) return null;

  switch (block.type) {
    case 'heading': {
      const H = `h${block.data.level || 2}`;
      return <H className="font-bold mt-4 mb-2"><ContentRenderer content={block.data.text} /></H>;
    }
    case 'paragraph':
      return <div className="mb-4"><ContentRenderer content={block.data.text} /></div>;
    case 'equation':
      return <MathFormula latex={block.data.latex} displayMode={block.data.displayMode !== false} />;
    case 'svg':
      return <SvgBlock {...block.data} />;
    case 'worked_solution':
      return <WorkedSolutionBlock {...block.data} />;
    case 'pdf_embed':
      return <PdfEmbedBlock {...block.data} />;
    case 'image_link':
      return <ImageLinkBlock {...block.data} />;
    case 'link_card':
      return <LinkCardBlock {...block.data} />;
    case 'bullets':
      return (
        <ul className="list-disc pl-6 mb-4">
          {(block.data.items || []).map((item, i) => (
            <li key={i}><ContentRenderer content={item} /></li>
          ))}
        </ul>
      );
    case 'example':
      return (
        <div className="border border-blue-200 bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-bold mb-2">{block.data.title || 'Example'}</h4>
          <div className="mb-2"><ContentRenderer content={block.data.scenario} /></div>
          <div><ContentRenderer content={block.data.solution} /></div>
        </div>
      );
    case 'callout':
    case 'warning':
    case 'tip':
    case 'misconception': {
      const colors = {
        callout: 'bg-blue-50 border-blue-200 text-blue-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        tip: 'bg-green-50 border-green-200 text-green-900',
        misconception: 'bg-red-50 border-red-200 text-red-900'
      };
      const bg = colors[block.type] || colors.callout;
      return (
        <div className={`${bg} border p-4 rounded mb-4`}>
          <h4 className="font-bold mb-2">{block.data.title}</h4>
          <div><ContentRenderer content={block.data.body || block.data.text} /></div>
        </div>
      );
    }
    case 'table':
      return (
        <table className="table-auto border-collapse border border-gray-300 mb-4 w-full">
          <tbody>
            {(block.data.rows || []).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-gray-300 p-2"><ContentRenderer content={cell} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'divider':
      return <hr className="my-6 border-gray-200" />;
    case 'image':
      return (
        <div className="mb-4">
          <img src={block.data.src} alt={block.data.alt} className="max-w-full h-auto rounded" />
          {block.data.caption && <p className="text-sm text-gray-500 mt-2 text-center">{block.data.caption}</p>}
        </div>
      );
    case 'interactive_html':
      return <InteractiveHtmlBlock {...block.data} />;
    default:
      return <div className="text-gray-400 bg-gray-100 p-2 mb-4">Unsupported block: {block.type}</div>;
  }
}
