import { useUIStore, TabId } from '../../store/uiStore';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'cultivate', icon: '🧘', label: '修炼' },
  { id: 'battle', icon: '⚔️', label: '取经' },
  { id: 'character', icon: '👤', label: '角色' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'journey', icon: '🗺️', label: '地图' },
];

export default function BottomNav() {
  const activeTab = useUIStore(s => s.activeTab);
  const setTab = useUIStore(s => s.setTab);

  return (
    <nav className="v2-bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`v2-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setTab(tab.id)}
        >
          <span className="v2-nav-icon">{tab.icon}</span>
          <span className="v2-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
