import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/animations.css';
import './styles/views.css';
import './styles/forge.css';
import './styles/quests.css';
import './styles/talent.css';
import './styles/companion.css';
import './styles/reincarnation.css';
import './styles/abyss.css';
import './styles/leaderboard.css';
import './styles/shop.css';
import './styles/event.css';
import './styles/tower.css';
import './styles/pet.css';
import './styles/skill.css';
import './styles/strategy.css';
import './styles/tutorial.css';
import './styles/synergy.css';
import './styles/scroll-nav.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
