import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './Grade8_StudyHub_Complete.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import { StudyProvider } from './contexts/StudyContext.jsx';
import { CommandPalette } from './components/CommandPalette.jsx';
import { PatternDiagnosticBridge } from './components/student/PatternDiagnosticBridge.jsx';
import { PATTERN_DIAGNOSTIC_HANDOFF_ROUTE } from './patterns/patternDiagnosticHandoff.js';
import { ToastProvider } from './lib/Toast.jsx';

function RootSurface() {
  const [route, setRoute] = React.useState(window.location.hash || '#/');

  React.useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route.startsWith(PATTERN_DIAGNOSTIC_HANDOFF_ROUTE)) {
    return <PatternDiagnosticBridge route={route} />;
  }

  return (
    <>
      <App />
      <CommandPalette />
    </>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <DataProvider>
    <StudyProvider>
      <ToastProvider>
        <RootSurface />
      </ToastProvider>
    </StudyProvider>
  </DataProvider>
);
