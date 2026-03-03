/**
 * Shared TabBar component per CDO COMPONENT-GUIDE-V1.3
 */

interface TabBarProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
}

export default function TabBar({ tabs, activeId, onChange, scrollable }: TabBarProps) {
  return (
    <div className={`tab-bar ${scrollable ? 'tab-bar-scroll' : ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeId === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
