import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHAPTERS, ABYSS_CHAPTER_ID } from '../data/chapters';
import { EQUIPMENT_TEMPLATES } from '../data/equipment';
import { QUALITY_INFO } from '../types';
import { Card, SubPageHeader, SubPage } from './shared';

export function ChapterSelectPage({ onBack }: { onBack: () => void }) {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const goToChapter = useGameStore(s => s.goToChapter);
  const sweepChapter = useGameStore(s => s.sweepChapter);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [sweepResult, setSweepResult] = useState<{ chId: number; gold: number; exp: number; items: string[] } | null>(null);

  // v72.0: chapter drop preview
  const chapterDrops = useMemo(() => {
    const map: Record<number, typeof EQUIPMENT_TEMPLATES> = {};
    for (const ch of CHAPTERS) {
      const stageMin = ch.id === 1 ? 1 : CHAPTERS.slice(0, ch.id - 1).reduce((s, c) => s + c.stages, 0) + 1;
      const stageMax = stageMin + ch.stages - 1;
      map[ch.id] = EQUIPMENT_TEMPLATES.filter(t => t.dropFromStage >= stageMin && t.dropFromStage <= stageMax);
    }
    return map;
  }, []);

  const handleSweep = (e: React.MouseEvent, chId: number) => {
    e.stopPropagation();
    const result = sweepChapter(chId, 10);
    setSweepResult({ chId, ...result });
    setTimeout(() => setSweepResult(null), 3000);
  };

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="章节选择" onBack={onBack} />
      {CHAPTERS.map(ch => {
        const isCurrent = ch.id === battle.chapterId;
        const isCleared = ch.id < highestChapter || (ch.id === highestChapter && battle.stageNum > ch.stages);
        const isLocked = ch.id > highestChapter;
        const isExpanded = expandedChapter === ch.id;
        const canTeleport = !isCurrent && !isLocked;
        const canSweep = isCleared && !isLocked;
        return (
          <div key={ch.id}>
            <Card className={`chapter-card ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              style={{ cursor: isLocked ? 'default' : 'pointer' }}
              onClick={() => !isLocked && setExpandedChapter(isExpanded ? null : ch.id)}>
              <div className="chapter-header">
                <span className={isCleared ? 'color-success' : isCurrent ? 'color-active' : 'color-dim'}>
                  {isCleared ? '[已通关]' : isCurrent ? '[进行中]' : '[未解锁]'}
                </span>{' '}第{ch.id}章 {ch.name}
              </div>
              <div style={{ fontSize: 12 }} className="color-dim">
                {ch.description} · Lv.{ch.levelRange[0]}-{ch.levelRange[1]}
                {isCurrent && ` · 进度 ${battle.stageNum}/${ch.stages}`}
              </div>
              {(isCurrent || isCleared) && (
                <div className="chapter-progress-bg">
                  <div className="chapter-progress-fill" style={{ width: `${isCleared ? 100 : (battle.stageNum / ch.stages) * 100}%` }} />
                </div>
              )}
              {isExpanded && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {canTeleport && (
                      <button className="breakthrough-btn" style={{ fontSize: 13, flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); goToChapter(ch.id); onBack(); }}>
                        🚀 传送
                      </button>
                    )}
                    {canSweep && (
                      <button className="breakthrough-btn" style={{ fontSize: 13, flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        onClick={(e) => handleSweep(e, ch.id)}>
                        ⚡ 扫荡×10
                      </button>
                    )}
                  </div>
                  {/* v72.0 掉落预览 */}
                  {(chapterDrops[ch.id] ?? []).length > 0 && (
                    <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>📦 可掉落装备</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(chapterDrops[ch.id] ?? []).map(t => (
                          <span key={t.id} style={{
                            fontSize: 11, padding: '2px 6px', borderRadius: 4,
                            background: 'rgba(0,0,0,0.3)',
                            border: `1px solid ${QUALITY_INFO[t.quality]?.color ?? '#555'}`,
                            color: QUALITY_INFO[t.quality]?.color ?? '#aaa',
                          }}>
                            {t.emoji}{t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {sweepResult && sweepResult.chId === ch.id && (
                <div style={{ marginTop: 6, padding: '6px 8px', background: 'rgba(99,102,241,0.15)', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ color: '#a5b4fc' }}>⚡ 扫荡完成！+{sweepResult.gold}💎 +{sweepResult.exp}✨</div>
                  {sweepResult.items.length > 0 && (
                    <div style={{ color: '#86efac', marginTop: 2 }}>🎁 获得：{sweepResult.items.join('、')}</div>
                  )}
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export function JourneyView({ setSubPage }: { setSubPage: (p: SubPage) => void }) {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const chapter = CHAPTERS.find(c => c.id === battle.chapterId);

  return (
    <div className="main-content fade-in">
      <h3 className="section-title">西游之路</h3>
      <Card title="当前进度" className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'chapterSelect' })}>
        <div><span className="color-active">{battle.chapterId >= ABYSS_CHAPTER_ID ? '无尽深渊' : `第${battle.chapterId}章`}</span>{' '}{battle.chapterId >= ABYSS_CHAPTER_ID ? `第${battle.stageNum}层` : chapter?.name}</div>
        <div className="color-dim" style={{ fontSize: 12 }}>{battle.chapterId >= ABYSS_CHAPTER_ID ? `深渊层数 ${battle.stageNum} · 无尽挑战` : `进度 ${battle.stageNum}/${chapter?.stages} · 已解锁 ${highestChapter} 章`}</div>
        <div className="chapter-progress-bg" style={{ marginTop: 8 }}>
          <div className="chapter-progress-fill" style={{ width: `${battle.chapterId >= ABYSS_CHAPTER_ID ? 100 : (chapter ? (battle.stageNum / chapter.stages) * 100 : 0)}%` }} />
        </div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>查看全部章节 →</div>
      </Card>
      <Card title="取经副本" className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'dungeonList' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>挑战西游取经路线 Boss 战，获取稀有奖励</div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 6, textAlign: 'right' }}>进入副本 →</div>
      </Card>
      <Card title="成就" className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'achievements' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>里程碑与挑战成就，获取永久属性加成</div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 6, textAlign: 'right' }}>查看成就 →</div>
      </Card>
      <Card title="排行榜" className="clickable-card" style={{ cursor: 'pointer' }}
        onClick={() => setSubPage({ type: 'leaderboard' })}>
        <div className="color-dim" style={{ fontSize: 12 }}>查看你的历史最佳记录</div>
        <div className="color-dim" style={{ fontSize: 11, marginTop: 6, textAlign: 'right' }}>查看排行 →</div>
      </Card>
    </div>
  );
}
