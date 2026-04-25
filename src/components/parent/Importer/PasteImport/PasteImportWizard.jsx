import React, { useState } from 'react';
import { InputStep } from './InputStep.jsx';
import { ParseStep } from './ParseStep.jsx';
import { StageStep } from './StageStep.jsx';
import { PreviewStep } from './PreviewStep.jsx';
import { CommitStep } from './CommitStep.jsx';
import { DoneStep } from './DoneStep.jsx';
import { createImportSession, computeSavePlan, updateSessionMeta } from '../../../../services/importSessionService.js';

const STEPS = ['Input', 'Parse', 'Stage', 'Preview', 'Commit', 'Done'];

function StepBar({ current }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className={`flex items-center gap-1.5 ${i <= currentIdx ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${i < currentIdx ? 'bg-indigo-600 border-indigo-600 text-white' : i === currentIdx ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-400'}`}>
              {i < currentIdx ? '\u2713' : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-indigo-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function PasteImportWizard({ subjects, topics, defaultSubjectId = '', defaultTopicFolder = '' }) {
  const [step, setStep] = useState('Input');
  const [inputState, setInputState] = useState({
    subjectId: defaultSubjectId, topicFolder: defaultTopicFolder, rawText: '', preferAI: true, extractToLibrary: false,
    importMode: 'worksheet' // 'worksheet' | 'practice' | 'exam_drill'
  });
  const [parsedResult, setParsedResult] = useState(null);
  const [session, setSession] = useState(null);
  const [savePlan, setSavePlan] = useState(null);
  const [commitResult, setCommitResult] = useState(null);

  const handleParseDone = async (result) => {
    setParsedResult(result);
    const sess = await createImportSession(
      inputState.subjectId, inputState.topicFolder,
      inputState.rawText, result.pages, result.mode
    );
    setSession(sess);
    setStep('Stage');
  };

  const handleStageDone = (conflicts, resolutions) => {
    setSavePlan(computeSavePlan(conflicts, resolutions, inputState.subjectId, inputState.topicFolder));
    setStep('Preview');
  };

  const handlePreviewDone = (editedPlan) => {
    setSavePlan(editedPlan);
    setStep('Commit');
  };

  const handleCommitDone = (result) => {
    setCommitResult(result);
    setStep('Done');
  };

  const handleStartOver = () => {
    setStep('Input');
    setParsedResult(null);
    setSession(null);
    setSavePlan(null);
    setCommitResult(null);
  };

  const handleManualEdit = () => {
    if (!session) return;
    const next = (session.manualEditCount || 0) + 1;
    setSession((s) => ({ ...s, manualEditCount: next }));
    updateSessionMeta(session.sessionId, { manualEditCount: next });
  };

  return (
    <div>
      <StepBar current={step} />

      {step === 'Input' && (
        <InputStep subjects={subjects} topics={topics} state={inputState} setState={setInputState} onNext={() => setStep('Parse')} />
      )}
      {step === 'Parse' && (
        <ParseStep rawText={inputState.rawText} preferAI={inputState.preferAI} importMode={inputState.importMode} onDone={handleParseDone} onBack={() => setStep('Input')} />
      )}
      {step === 'Stage' && parsedResult && (
        <StageStep
          parsedPages={parsedResult.pages}
          subjectId={inputState.subjectId}
          topicFolder={inputState.topicFolder}
          rawHash={session?.rawHash}
          onDone={handleStageDone}
          onBack={() => setStep('Parse')}
        />
      )}
      {step === 'Preview' && savePlan && (
        <PreviewStep
          savePlan={savePlan}
          onDone={handlePreviewDone}
          onBack={() => setStep('Stage')}
          onManualEdit={handleManualEdit}
        />
      )}
      {step === 'Commit' && session && savePlan && (
        <CommitStep
          session={session}
          savePlan={savePlan}
          extractToLibrary={inputState.extractToLibrary}
          onDone={handleCommitDone}
          onBack={() => setStep('Preview')}
        />
      )}
      {step === 'Done' && commitResult && (
        <DoneStep
          result={commitResult}
          subjectId={inputState.subjectId}
          topicFolder={inputState.topicFolder}
          importMode={inputState.importMode}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
