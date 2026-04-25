import React, { useState } from 'react';
import { LinkCardBlock } from '../blocks/LinkCardBlock.jsx';
import { callGemini } from '../../services/geminiService.js';

export function RightSidebar({ clarifiers = [], relatedPages = [], settings = {}, pageBlocks = [], pageTitle = '' }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getClarifierStyle = (type) => {
    switch (type) {
      case 'tip': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡' };
      case 'warning': return { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' };
      case 'key_fact': return { bg: 'bg-indigo-50', border: 'border-indigo-500', icon: '📌' };
      case 'common_mistake': return { bg: 'bg-red-50', border: 'border-red-200', icon: '❌' };
      case 'did_you_know': return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🌟' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'ℹ️' };
    }
  };

  const getPageText = () => {
    return pageBlocks
      .filter(b => b.type === 'paragraph' || b.type === 'heading')
      .map(b => b.data.text || '')
      .join(' ')
      .slice(0, 1500);
  };

  const handleSummarise = async () => {
    setLoadingAi(true);
    try {
      if (settings.geminiApiKey === 'mock-key' || !settings.geminiApiKey) {
        setTimeout(() => {
          setAiSummary("Here is a 3-line recap of the page content: This page explains the concept clearly. It shows how it applies in real life. It also points out common mistakes.");
          setLoadingAi(false);
        }, 1000);
        return;
      }

      const prompt = `Summarise this page for a student in 3 bullet points. Page title: "${pageTitle}". Content: ${getPageText()}`;
      const response = await callGemini(prompt, settings.geminiApiKey);
      setAiSummary(response);
    } catch (err) {
      alert("AI unavailable — check your API key");
    }
    setLoadingAi(false);
  };

  const handleExplain = async () => {
    setLoadingAi(true);
    try {
      if (settings.geminiApiKey === 'mock-key' || !settings.geminiApiKey) {
        setTimeout(() => {
          setAiExplanation("Think of it like baking a cake. You need the right ingredients (components) in the right amounts (magnitudes) to get the final result (resultant vector).");
          setLoadingAi(false);
        }, 1000);
        return;
      }

      const prompt = `Explain "${pageTitle}" using a real-world analogy for a student. Content context: ${getPageText()}`;
      const response = await callGemini(prompt, settings.geminiApiKey);
      setAiExplanation(response);
    } catch (err) {
      alert("AI unavailable — check your API key");
    }
    setLoadingAi(false);
  };

  return (
    <div className="right-sidebar">
      {clarifiers.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Concept Tips</h3>
          {clarifiers.map(clarifier => {
            const style = getClarifierStyle(clarifier.type);
            return (
              <div key={clarifier.id} className={`${style.bg} ${style.border} border rounded p-3 mb-3`}>
                <div className="font-bold mb-1 flex items-center">
                  <span className="mr-2">{style.icon}</span>
                  {clarifier.title}
                </div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: clarifier.body }} />
              </div>
            );
          })}
        </div>
      )}

      {relatedPages.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Related Pages</h3>
          {relatedPages.map(page => (
            <div key={page.id} className="mb-2">
              <LinkCardBlock title={page.title} url={`#/topic/${page.id.split('-').slice(0,2).join('-')}/page/${page.id}`} linkType="page" />
            </div>
          ))}
        </div>
      )}

      {settings.geminiApiKey && pageBlocks.length > 0 && (
        <div className="mb-6 border-t pt-4">
          <h3 className="font-bold text-lg mb-3 flex items-center"><span className="mr-2">🤖</span> AI Assist</h3>
          <div className="flex flex-col gap-2">
            <button onClick={handleSummarise} disabled={loadingAi} className="px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 text-sm font-bold text-left transition-colors flex items-center justify-between">
              <span>✨ Summarise this page</span>
            </button>
            <button onClick={handleExplain} disabled={loadingAi} className="px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 text-sm font-bold text-left transition-colors flex items-center justify-between">
              <span>✨ Explain differently</span>
            </button>
          </div>

          {loadingAi && <div className="mt-4 text-sm text-purple-600 font-bold animate-pulse">Thinking...</div>}

          {aiSummary && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded relative">
              <button onClick={() => setAiSummary(null)} className="absolute top-1 right-2 text-gray-400 hover:text-gray-800">✕</button>
              <h4 className="font-bold text-purple-800 text-sm mb-1">Summary</h4>
              <p className="text-sm text-purple-900 whitespace-pre-wrap">{aiSummary}</p>
            </div>
          )}

          {aiExplanation && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded relative">
              <button onClick={() => setAiExplanation(null)} className="absolute top-1 right-2 text-gray-400 hover:text-gray-800">✕</button>
              <h4 className="font-bold text-purple-800 text-sm mb-1">Different Explanation</h4>
              <p className="text-sm text-purple-900 whitespace-pre-wrap">{aiExplanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
