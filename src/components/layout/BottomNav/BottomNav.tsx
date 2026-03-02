import styles from './BottomNav.module.css';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * 底部导航栏
 *
 * @example
 * <BottomNav
 *   items={[
 *     { id: 'cultivate', icon: '🧘', label: '修炼' },
 *     { id: 'journey',   icon: '🗺️', label: '取经' },
 *     { id: 'char',      icon: '🐒', label: '角色' },
 *     { id: 'bag',       icon: '🎒', label: '背包' },
 *   ]}
 *   activeId={tab}
 *   onChange={setTab}
 * />
 */
export function BottomNav({ items, activeId, onChange }: BottomNavProps) {
  return (
    <div className={styles.nav}>
      {items.map(item => (
        <button
          key={item.id}
          className={[styles.item, activeId === item.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(item.id)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className={styles.badge} />
          )}
        </button>
      ))}
    </div>
  );
}
