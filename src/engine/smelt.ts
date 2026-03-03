/**
 * SmeltEngine — 炼化合成系统
 * 低级材料合成高级材料
 */
import Decimal from 'break_infinity.js';
import { bn } from './bignum';

// === Types ===

export interface SmeltRecipe {
  id: string;
  inputs: { materialId: string; count: number }[];
  output: { materialId: string; count: number };
  coinsCost: number;
}

export interface SmeltResult {
  success: boolean;
  output?: { materialId: string; count: number };
  message: string;
}

// === Engine ===

/**
 * 检查是否可以炼化
 */
export function canSmelt(
  recipe: SmeltRecipe,
  materials: Record<string, number>,
  coins: Decimal,
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const inp of recipe.inputs) {
    const have = materials[inp.materialId] ?? 0;
    if (have < inp.count) {
      missing.push(`${inp.materialId} ×${inp.count}（当前 ${have}）`);
    }
  }
  if (coins.lt(recipe.coinsCost)) {
    missing.push(`金币 ${recipe.coinsCost}`);
  }
  return { ok: missing.length === 0, missing };
}

/**
 * 执行炼化
 */
export function doSmelt(recipe: SmeltRecipe): SmeltResult {
  return {
    success: true,
    output: { ...recipe.output },
    message: `炼化成功！获得 ${recipe.output.materialId} ×${recipe.output.count}`,
  };
}

// === 反向分解 (LH-03) ===

export interface DecomposeResult {
  success: boolean;
  outputs: { materialId: string; count: number }[];
  message: string;
}

/**
 * 反向分解：高级材料 → 低级材料 (1:3)
 */
export function canDecompose(
  materialId: string,
  count: number,
  materials: Record<string, number>,
): boolean {
  return (materials[materialId] ?? 0) >= count;
}

export function doDecompose(
  materialId: string,
  count: number,
  lowerMaterialId: string,
): DecomposeResult {
  const outputCount = count * 3;
  return {
    success: true,
    outputs: [{ materialId: lowerMaterialId, count: outputCount }],
    message: `分解成功！${materialId} ×${count} → ${lowerMaterialId} ×${outputCount}`,
  };
}
