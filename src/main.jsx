import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/ThemeContext';
import { App } from './App';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
