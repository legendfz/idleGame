import styles from './Tab.module.css';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
  className?: string;
}

/**
 * 标签页切换
 *
 * @example
 * <Tab
 *   items={[
 *     { id: 'milestone', label: '里程碑', icon: '🏆' },
 *     { id: 'challenge', label: '挑战', icon: '⚔️' },
 *   ]}
 *   activeId={tab}
 *   onChange={setTab}
 * />
 */
export function Tab({ items, activeId, onChange, scrollable = false, className = '' }: TabProps) {
  return (
    <div className={[styles.bar, scrollable ? styles.scrollable : '', className].filter(Boolean).join(' ')}>
      {items.map(item => (
        <button
          key={item.id}
          className={[styles.item, activeId === item.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(item.id)}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
