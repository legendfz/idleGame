import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setSfxEnabled } from './engine/audio';
import './index.css';
import './styles/guide.css';
import './styles/tutorial.css';
import './styles/settings.css';
import './styles/stats.css';
import './styles/animations.css';

// Restore sfx preference
if (localStorage.getItem('sfx') === 'off') setSfxEnabled(false);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}
