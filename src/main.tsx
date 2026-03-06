import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setSfxEnabled } from './engine/audio';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './styles/guide.css';
import './styles/tutorial.css';
import './styles/settings.css';
import './styles/stats.css';
import './styles/animations.css';

// Global error handlers to prevent silent crashes
window.addEventListener('error', (e) => {
  console.error('[GlobalError]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledRejection]', e.reason);
  e.preventDefault(); // Prevent crash
});

// Restore sfx preference (safe for restricted WebViews)
try {
  if (localStorage.getItem('sfx') === 'off') setSfxEnabled(false);
} catch {
  // localStorage may be unavailable in some WebViews
}

// Hide loading indicator
const loader = document.getElementById('app-loader');
if (loader) loader.style.display = 'none';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}
