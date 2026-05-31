import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './Grade8_StudyHub_Complete.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import { StudyProvider } from './contexts/StudyContext.jsx';
import { CommandPalette } from './components/CommandPalette.jsx';
import { ToastProvider } from './lib/Toast.jsx';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <DataProvider>
    <StudyProvider>
      <ToastProvider>
        <App />
        <CommandPalette />
      </ToastProvider>
    </StudyProvider>
  </DataProvider>
);
