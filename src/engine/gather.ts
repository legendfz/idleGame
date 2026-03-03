/**
 * GatherEngine — 采集系统
 * 定时器驱动：点击开始 → 等待 → 收取材料
 */
import { eventBus } from './events';

// === Types ===

export interface GatherNode {
  id: string;
  name: string;
  icon: string;
  location: string;
  materials: { materialId: string; chance: number; countRange: [number, number] }[];
  gatherTime: number;   // 秒
  cooldown: number;     // 秒
  unlockRealm: string;
}

export interface GatherResult {
  nodeId: string;
  materials: { materialId: string; count: number }[];
}

export interface ActiveGather {
  nodeId: string;
  startedAt: number;    // timestamp ms
  completesAt: number;  // timestamp ms
}

// === Engine ===

/**
 * 角色采集加成
 * 猪八戒: +25% 速度 (减少采集时间)
 * 沙悟净: +20% 产量
 */
export function getCharGatherBonus(charId: string): { speedMult: number; yieldMult: number } {
  if (charId === 'bajie') return { speedMult: 0.75, yieldMult: 1.0 };
  if (charId === 'wujing') return { speedMult: 1.0, yieldMult: 1.2 };
  return { speedMult: 1.0, yieldMult: 1.0 };
}

/**
 * 开始采集 (Bug #6: 角色被动加成)
 */
export function startGather(node: GatherNode, now: number = Date.now(), charId: string = ''): ActiveGather {
  const { speedMult } = getCharGatherBonus(charId);
  const adjustedTime = Math.floor(node.gatherTime * speedMult);
  return {
    nodeId: node.id,
    startedAt: now,
    completesAt: now + adjustedTime * 1000,
  };
}

/**
 * 检查采集是否完成
 */
export function isGatherComplete(gather: ActiveGather, now: number = Date.now()): boolean {
  return now >= gather.completesAt;
}

/**
 * 收取采集结果 (Bug #6: 角色被动加成)
 */
export function collectGather(node: GatherNode, charId: string = ''): GatherResult {
  const { yieldMult } = getCharGatherBonus(charId);
  const materials: { materialId: string; count: number }[] = [];

  for (const mat of node.materials) {
    if (Math.random() < mat.chance) {
      const base = mat.countRange[0] + Math.floor(Math.random() * (mat.countRange[1] - mat.countRange[0] + 1));
      const count = Math.max(1, Math.floor(base * yieldMult));
      materials.push({ materialId: mat.materialId, count });
    }
  }

  return { nodeId: node.id, materials };
}

/**
 * 计算离线采集收益 (50% 效率)
 */
export function calcOfflineGather(
  node: GatherNode,
  offlineSeconds: number,
): GatherResult {
  const cycles = Math.floor((offlineSeconds * 0.5) / (node.gatherTime + node.cooldown));
  const materials: Record<string, number> = {};

  for (let i = 0; i < cycles; i++) {
    for (const mat of node.materials) {
      if (Math.random() < mat.chance) {
        const count = mat.countRange[0] + Math.floor(Math.random() * (mat.countRange[1] - mat.countRange[0] + 1));
        materials[mat.materialId] = (materials[mat.materialId] ?? 0) + count;
      }
    }
  }

  return {
    nodeId: node.id,
    materials: Object.entries(materials).map(([materialId, count]) => ({ materialId, count })),
  };
}

/**
 * 检查是否解锁了某采集节点
 */
export function isNodeUnlocked(node: GatherNode, realmId: string, realmOrder: number): boolean {
  // 简化：用 realmOrder 比较
  const REALM_ORDER: Record<string, number> = {
    fanren: 1, lianqi: 2, zhuji: 3, jindan: 4, yuanying: 5,
    huashen: 6, dujie: 7, dixian: 8, tianxian: 9, jinxian: 10,
    taiyi: 11, daluo: 12, hunyuan: 13, shengren: 14,
  };
  return (REALM_ORDER[realmId] ?? 1) >= (REALM_ORDER[node.unlockRealm] ?? 1);
}
