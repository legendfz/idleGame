import { ReactNode } from 'react';
import styles from './GameLayout.module.css';

interface GameLayoutProps {
  topBar: ReactNode;
  bottomNav: ReactNode;
  children: ReactNode;
}

/**
 * 全局布局壳：固定顶栏 + 可滚动内容区 + 固定底部导航
 *
 * @example
 * <GameLayout topBar={<TopBar />} bottomNav={<BottomNav />}>
 *   <BattleView />
 * </GameLayout>
 */
export function GameLayout({ topBar, bottomNav, children }: GameLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.top}>{topBar}</header>
      <main className={styles.content}>{children}</main>
      <nav className={styles.bottom}>{bottomNav}</nav>
    </div>
  );
}
