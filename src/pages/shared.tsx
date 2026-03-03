/**
 * Shared UI components extracted from App.tsx
 */
import { useEffect, useRef, useState, ReactNode } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../data/realms';
import { CHAPTERS } from '../data/chapters';
import { formatNumber, formatDuration } from '../utils/format';
import { EquipmentItem } from '../types';

// ─── SubPage type ───
export type SubPage =
  | { type: 'none' }
  | { type: 'equipDetail'; item: EquipmentItem; location: 'equipped' | 'inventory' }
  | { type: 'refine' }
  | { type: 'shop' }
  | { type: 'characterDetail' }
  | { type: 'chapterSelect' }
  | { type: 'saveManager' }
  | { type: 'dungeonList' }
  | { type: 'dungeonBattle' }
  | { type: 'achievements' }
  | { type: 'leaderboard' };

// ─── Card ───
export function Card({ title, titleColor, children, className, style, borderColor, onClick }: {
  title?: string; titleColor?: string; children: ReactNode;
  className?: string; style?: React.CSSProperties; borderColor?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`card ${className ?? ''}`} style={{ ...style, borderColor }} onClick={onClick}>
      {title && <div className="card-title" style={{ color: titleColor ?? 'var(--accent)' }}>{title}</div>}
      {children}
    </div>
  );
}

// ─── SubPageHeader ───
export function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="subpage-header">
      <button className="back-btn" onClick={onBack}>← 返回</button>
      <span className="subpage-title">{title}</span>
    </div>
  );
}

// ─── TopBar ───
export function TopBar() {
  const player = useGameStore(s => s.player);
  const battle = useGameStore(s => s.battle);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);
  return (
    <div className="top-bar">
      <div className="location">
        <span className="color-location">{chapter?.name ?? '未知'}</span>
        <span className="color-dim"> · 第{battle.stageNum}关</span>
      </div>
      <div className="resources">
        <span className="color-gold">{formatNumber(player.lingshi)} 灵石</span>
        {'  '}
        <span className="color-pantao">{player.pantao} 蟠桃</span>
        {'  '}
        <span className="color-level">Lv.{player.level}</span>
        {'  '}
        <span className="color-realm">{REALMS[player.realmIndex].name}</span>
      </div>
    </div>
  );
}

// ─── FloatingDamage ───
export function FloatingDamage() {
  const floats = useGameStore(s => s.floatingTexts);
  const clearFloat = useGameStore(s => s.clearFloatingText);
  useEffect(() => {
    if (floats.length === 0) return;
    const timer = setTimeout(() => {
      const oldest = floats[0];
      if (oldest) clearFloat(oldest.id);
    }, 800);
    return () => clearTimeout(timer);
  }, [floats, clearFloat]);
  return (
    <div className="floating-container">
      {floats.map((f, i) => (
        <div key={f.id} className={`floating-text float-${f.type}`} style={{ animationDelay: `${i * 50}ms` }}>{f.text}</div>
      ))}
    </div>
  );
}

// ─── BossToast ───
export function BossToast() {
  const battle = useGameStore(s => s.battle);
  const [show, setShow] = useState(false);
  const prevBoss = useRef(false);
  useEffect(() => {
    if (battle.isBossWave && !prevBoss.current) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
    prevBoss.current = battle.isBossWave;
  }, [battle.isBossWave]);
  if (!show || !battle.currentEnemy) return null;
  return (
    <div className="boss-toast">
      <div className="boss-toast-inner">
        <span className="color-boss">BOSS 驾到！</span>
        <div className="boss-toast-name">{battle.currentEnemy.name}</div>
      </div>
    </div>
  );
}

// ─── OfflineReportModal ───
export function OfflineReportModal() {
  const report = useGameStore(s => s.offlineReport);
  const dismiss = useGameStore(s => s.dismissOfflineReport);
  if (!report) return null;
  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="color-accent">离线修炼报告</h2>
        <div className="color-dim">离线时长：{formatDuration(report.duration)}</div>
        <Card className="offline-detail">
          <div className="stat-row"><span className="stat-label">击败怪物</span><span>{formatNumber(report.kills)} 只</span></div>
          {report.stagesCleared > 0 && <div className="stat-row"><span className="stat-label">通关关卡</span><span>{report.stagesCleared} 关</span></div>}
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
            <div className="stat-row"><span className="stat-label">灵石</span><span className="color-gold">+{formatNumber(report.lingshi)}</span></div>
            <div className="stat-row"><span className="stat-label">经验</span><span className="color-exp">+{formatNumber(report.exp)}</span></div>
            {report.pantao > 0 && <div className="stat-row"><span className="stat-label">蟠桃</span><span className="color-pantao">+{report.pantao}</span></div>}
            {report.levelsGained > 0 && <div className="stat-row"><span className="stat-label">升级</span><span className="color-level">x{report.levelsGained}</span></div>}
          </div>
          {report.equipment.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: 8 }}>
              <div className="color-dim" style={{ marginBottom: 4 }}>获得装备：</div>
              {report.equipment.map((name, i) => (
                <div key={i} className="color-drop" style={{ paddingLeft: 12 }}>{name}</div>
              ))}
            </div>
          )}
        </Card>
        <button onClick={dismiss}>领取</button>
      </div>
    </div>
  );
}

// end of shared.tsx
