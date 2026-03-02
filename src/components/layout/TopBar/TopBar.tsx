import styles from './TopBar.module.css';

interface TopBarProps {
  name: string;
  level: number;
  realm: string;
  xiuwei: string;     // 已格式化的修为数
  gold: string;       // 已格式化的金币数
}

/**
 * 顶栏：角色信息 + 资源
 *
 * @example
 * <TopBar name="孙悟空" level={15} realm="练气九层" xiuwei="12.5K" gold="3.2K" />
 */
export function TopBar({ name, level, realm, xiuwei, gold }: TopBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.row1}>
        <span className={styles.name}>{name}</span>
        <span className={styles.level}>Lv.{level}</span>
        <span className={styles.realm}>{realm}</span>
      </div>
      <div className={styles.row2}>
        <span>✨ {xiuwei}</span>
        <span>🪙 {gold}</span>
      </div>
    </div>
  );
}
