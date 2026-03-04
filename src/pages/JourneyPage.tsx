import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHAPTERS } from '../data/chapters';
import { Card, SubPageHeader, SubPage } from './shared';

export function ChapterSelectPage({ onBack }: { onBack: () => void }) {
  const battle = useGameStore(s => s.battle);
  const highestChapter = useGameStore(s => s.highestChapter);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  return (
    <div className="main-content fade-in">
      <SubPageHeader title="章节选择" onBack={onBack} />
      {CHAPTERS.map(ch => {
        const isCurrent = ch.id === battle.chapterId;
        const isCleared = ch.id < highestChapter || (ch.id === highestChapter && battle.stageNum > ch.stages);
        const isLocked = ch.id > highestChapter;
        const isExpanded = expandedChapter === ch.id;
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
            </Card>
            {isExpanded && isCurrent && (
              <div className="sub-stages">
                {Array.from({ length: Math.min(battle.stageNum + 2, ch.stages) }, (_, i) => {
                  const stageNum = i + 1;
                  const cleared = stageNum < battle.stageNum;
                  const current = stageNum === battle.stageNum;
                  return (
                    <div key={stageNum} className="sub-stage-item">
                      <span className={cleared ? 'color-success' : current ? 'color-active' : 'color-dim'}>
                        {cleared ? '[通关]' : current ? '[当前]' : '[未至]'}
                      </span>{' '}第{stageNum}关
                    </div>
                  );
                })}
              </div>
            )}
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
        <div><span className="color-active">第{battle.chapterId}章</span>{' '}{chapter?.name}</div>
        <div className="color-dim" style={{ fontSize: 12 }}>进度 {battle.stageNum}/{chapter?.stages} · 已解锁 {highestChapter} 章</div>
        <div className="chapter-progress-bg" style={{ marginTop: 8 }}>
          <div className="chapter-progress-fill" style={{ width: `${chapter ? (battle.stageNum / chapter.stages) * 100 : 0}%` }} />
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
