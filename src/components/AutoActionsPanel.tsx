import { useGameStore } from '../store/gameStore';

const DECOMP_LABELS = ['关闭', '凡品', '灵品以下', '仙品以下'];

function AutoRow({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="stat-row" style={{ cursor: 'pointer', padding: '3px 0' }} onClick={toggle}>
      <span className="stat-label" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ color: on ? 'var(--accent)' : 'var(--dim)', fontSize: 13 }}>{on ? '✅' : '关闭'}</span>
    </div>
  );
}

function GroupHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color, margin: '12px 0 4px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
      {icon} {label}
    </div>
  );
}

export function AutoActionsPanel({ showDetails }: { showDetails: boolean }) {
  const autoDecomp = useGameStore(s => s.autoDecomposeQuality) ?? 0;
  const setAutoDecomp = useGameStore(s => s.setAutoDecomposeQuality);
  const autoEquip = useGameStore(s => s.autoEquipOnDrop);
  const setAutoEquip = useGameStore(s => s.setAutoEquipOnDrop);
  const autoSkill = useGameStore(s => s.autoSkill);
  const setAutoSkill = useGameStore(s => s.setAutoSkill);
  const autoConsume = useGameStore(s => s.autoConsume);
  const setAutoConsume = useGameStore(s => s.setAutoConsume);
  const autoWorldBoss = useGameStore(s => s.autoWorldBoss);
  const autoExplore = useGameStore(s => s.autoExplore);
  const autoSanctuary = useGameStore(s => s.autoSanctuary);
  const autoAffinity = useGameStore(s => s.autoAffinity);
  const setAutoWorldBoss = useGameStore(s => s.setAutoWorldBoss);
  const setAutoExplore = useGameStore(s => s.setAutoExplore);
  const setAutoSanctuary = useGameStore(s => s.setAutoSanctuary);
  const setAutoAffinity = useGameStore(s => s.setAutoAffinity);
  const autoSweep = useGameStore(s => s.autoSweep);
  const setAutoSweep = useGameStore(s => s.setAutoSweep);
  const autoFate = useGameStore(s => s.autoFate);
  const setAutoFate = useGameStore(s => s.setAutoFate);
  const autoWheel = useGameStore(s => s.autoWheel);
  const setAutoWheel = useGameStore(s => s.setAutoWheel);
  const autoTrial = useGameStore(s => s.autoTrial);
  const setAutoTrial = useGameStore(s => s.setAutoTrial);
  const autoAscension = useGameStore(s => s.autoAscension);
  const setAutoAscension = useGameStore(s => s.setAutoAscension);
  const autoEnhance = useGameStore(s => s.autoEnhance);
  const setAutoEnhance = useGameStore(s => s.setAutoEnhance);
  const autoReforge = useGameStore(s => s.autoReforge);
  const setAutoReforge = useGameStore(s => s.setAutoReforge);
  const autoRefine = useGameStore(s => s.autoRefine);
  const setAutoRefine = useGameStore(s => s.setAutoRefine);
  const autoFeedPet = useGameStore(s => s.autoFeedPet);
  const setAutoFeedPet = useGameStore(s => s.setAutoFeedPet);
  const autoBuyPerks = useGameStore(s => s.autoBuyPerks);
  const setAutoBuyPerks = useGameStore(s => s.setAutoBuyPerks);
  const autoSynth = useGameStore(s => s.autoSynth);
  const setAutoSynth = useGameStore(s => s.setAutoSynth);
  const autoReincarnate = useGameStore(s => s.autoReincarnate);
  const setAutoReincarnate = useGameStore(s => s.setAutoReincarnate);
  const autoDaoAlloc = useGameStore(s => s.autoDaoAlloc) ?? false;
  const autoFarm = useGameStore(s => s.autoFarm) ?? false;
  const autoEvent = useGameStore(s => s.autoEvent) ?? false;
  const autoWeeklyBoss = useGameStore(s => s.autoWeeklyBoss) ?? false;
  const autoClaimChallenges = useGameStore(s => s.autoClaimChallenges) ?? false;
  const autoTranscend = useGameStore(s => s.autoTranscend) ?? false;
  const autoBuyScrolls = useGameStore(s => s.autoBuyScrolls) ?? false;
  const autoAwaken = useGameStore(s => s.autoAwaken) ?? false;
  const autoBuyTranscendPerks = useGameStore(s => s.autoBuyTranscendPerks) ?? false;

  if (!showDetails) return null;

  return (
    <>
      {/* ⚔️ 战斗组 */}
      <GroupHeader icon="⚔️" label="战斗" color="#ef4444" />
      <AutoRow label="自动释放技能" on={autoSkill} toggle={() => setAutoSkill(!autoSkill)} />
      <AutoRow label="自动使用丹药" on={autoConsume} toggle={() => setAutoConsume(!autoConsume)} />
      <AutoRow label="自动挑战世界Boss" on={autoWorldBoss} toggle={() => setAutoWorldBoss(!autoWorldBoss)} />
      <AutoRow label="自动回退/推进刷怪" on={autoFarm} toggle={() => useGameStore.getState().setAutoFarm(!autoFarm)} />
      <AutoRow label="自动处理随机事件" on={autoEvent} toggle={() => useGameStore.getState().setAutoEvent(!autoEvent)} />
      <AutoRow label="自动每周Boss" on={autoWeeklyBoss} toggle={() => useGameStore.getState().setAutoWeeklyBoss(!autoWeeklyBoss)} />
      <AutoRow label="自动领取每日挑战" on={autoClaimChallenges} toggle={() => useGameStore.getState().setAutoClaimChallenges(!autoClaimChallenges)} />

      {/* 🎒 装备组 */}
      <GroupHeader icon="🎒" label="装备" color="#8b5cf6" />
      <div className="stat-row" style={{ cursor: 'pointer' }} onClick={() => setAutoDecomp((autoDecomp + 1) % 4)}>
        <span className="stat-label" style={{ fontSize: 13 }}>自动分解</span>
        <span style={{ color: autoDecomp > 0 ? 'var(--accent)' : 'var(--dim)', fontSize: 13 }}>{DECOMP_LABELS[autoDecomp]}</span>
      </div>
      <AutoRow label="掉落自动装备" on={autoEquip} toggle={() => setAutoEquip(!autoEquip)} />
      <AutoRow label="自动强化已装备(+1~+10)" on={autoEnhance} toggle={() => setAutoEnhance(!autoEnhance)} />
      <AutoRow label="自动洗炼(只接受提升)" on={autoReforge} toggle={() => setAutoReforge(!autoReforge)} />
      <AutoRow label="自动精炼(混沌→鸿蒙)" on={autoRefine} toggle={() => setAutoRefine(!autoRefine)} />
      <AutoRow label="自动合成装备(低→高)" on={autoSynth} toggle={() => setAutoSynth(!autoSynth)} />

      {/* 🌍 探索组 */}
      <GroupHeader icon="🌍" label="探索" color="#10b981" />
      <AutoRow label="自动秘境探索" on={autoExplore} toggle={() => setAutoExplore(!autoExplore)} />
      <AutoRow label="自动洞天升级" on={autoSanctuary} toggle={() => setAutoSanctuary(!autoSanctuary)} />
      <AutoRow label="自动仙缘赠礼" on={autoAffinity} toggle={() => setAutoAffinity(!autoAffinity)} />
      <AutoRow label="自动喂养灵兽" on={autoFeedPet} toggle={() => setAutoFeedPet(!autoFeedPet)} />
      <AutoRow label="自动扫荡(60秒)" on={autoSweep} toggle={() => setAutoSweep(!autoSweep)} />

      {/* 💰 经济组 */}
      <GroupHeader icon="💰" label="经济" color="#f59e0b" />
      <AutoRow label="自动天命符(双倍)" on={autoFate} toggle={() => setAutoFate(!autoFate)} />
      <AutoRow label="自动转盘(每小时)" on={autoWheel} toggle={() => setAutoWheel(!autoWheel)} />
      <AutoRow label="自动购买道点加成" on={autoBuyPerks} toggle={() => setAutoBuyPerks(!autoBuyPerks)} />
      <AutoRow label="自动购买卷轴" on={autoBuyScrolls} toggle={() => useGameStore.getState().setAutoBuyScrolls(!autoBuyScrolls)} />

      {/* 🏆 挑战组 */}
      <GroupHeader icon="🏆" label="挑战" color="#ec4899" />
      <AutoRow label="自动试炼(每5分钟)" on={autoTrial} toggle={() => setAutoTrial(!autoTrial)} />
      <AutoRow label="自动天道考验(每日)" on={autoAscension} toggle={() => setAutoAscension(!autoAscension)} />

      {/* 🔄 轮回组 */}
      <GroupHeader icon="🔄" label="轮回" color="#6366f1" />
      <AutoRow label="自动转世(大乘境界)" on={autoReincarnate} toggle={() => setAutoReincarnate(!autoReincarnate)} />
      <AutoRow label="自动分配道点" on={autoDaoAlloc} toggle={() => useGameStore.getState().setAutoDaoAlloc(!autoDaoAlloc)} />
      <AutoRow label="自动觉醒分配" on={autoAwaken} toggle={() => useGameStore.getState().setAutoAwaken(!autoAwaken)} />
      <AutoRow label="自动超越(10次转世)" on={autoTranscend} toggle={() => useGameStore.getState().setAutoTranscend(!autoTranscend)} />
      <AutoRow label="自动购买超越加成" on={autoBuyTranscendPerks} toggle={() => useGameStore.getState().setAutoBuyTranscendPerks(!autoBuyTranscendPerks)} />
    </>
  );
}

/** Check if all auto-actions are enabled */
export function useAllAutoOn(): boolean {
  const s = useGameStore.getState();
  return (s.autoDecomposeQuality ?? 0) >= 2 && s.autoEquipOnDrop && s.autoSkill && s.autoConsume
    && s.autoWorldBoss && s.autoExplore && s.autoSanctuary && s.autoAffinity
    && s.autoSweep && s.autoFate && s.autoWheel && s.autoTrial && s.autoAscension
    && s.autoEnhance && s.autoReforge && (s.autoFeedPet ?? false) && s.autoBuyPerks && s.autoSynth
    && s.autoReincarnate && (s.autoDaoAlloc ?? false) && (s.autoFarm ?? false)
    && (s.autoTranscend ?? false) && (s.autoBuyTranscendPerks ?? false)
    && (s.autoEvent ?? false) && (s.autoWeeklyBoss ?? false) && (s.autoClaimChallenges ?? false)
    && (s.autoBuyScrolls ?? false) && (s.autoAwaken ?? false) && (s.autoRefine ?? false);
}

/** Toggle all auto-actions on or off */
export function toggleAllAuto(on: boolean) {
  const s = useGameStore.getState();
  if (on) {
    s.setAutoDecomposeQuality(2); s.setAutoEquipOnDrop(true); s.setAutoSkill(true); s.setAutoConsume(true);
    s.setAutoWorldBoss(true); s.setAutoExplore(true); s.setAutoSanctuary(true); s.setAutoAffinity(true);
    s.setAutoSweep(true); s.setAutoFate(true); s.setAutoWheel(true); s.setAutoTrial(true); s.setAutoAscension(true);
    s.setAutoEnhance(true); s.setAutoReforge(true); s.setAutoFeedPet(true); s.setAutoBuyPerks(true); s.setAutoSynth(true);
    s.setAutoReincarnate(true); s.setAutoDaoAlloc(true); s.setAutoFarm(true); s.setAutoTranscend(true);
    s.setAutoBuyTranscendPerks(true); s.setAutoEvent(true); s.setAutoWeeklyBoss(true); s.setAutoClaimChallenges(true);
    s.setAutoBuyScrolls(true); s.setAutoAwaken(true); s.setAutoRefine(true);
  } else {
    s.setAutoDecomposeQuality(0); s.setAutoEquipOnDrop(false); s.setAutoSkill(false); s.setAutoConsume(false);
    s.setAutoWorldBoss(false); s.setAutoExplore(false); s.setAutoSanctuary(false); s.setAutoAffinity(false);
    s.setAutoSweep(false); s.setAutoFate(false); s.setAutoWheel(false); s.setAutoTrial(false); s.setAutoAscension(false);
    s.setAutoEnhance(false); s.setAutoReforge(false); s.setAutoFeedPet(false); s.setAutoBuyPerks(false); s.setAutoSynth(false);
    s.setAutoReincarnate(false); s.setAutoDaoAlloc(false); s.setAutoFarm(false); s.setAutoTranscend(false);
    s.setAutoBuyTranscendPerks(false); s.setAutoEvent(false); s.setAutoWeeklyBoss(false); s.setAutoClaimChallenges(false);
    s.setAutoBuyScrolls(false); s.setAutoAwaken(false); s.setAutoRefine(false);
  }
}
