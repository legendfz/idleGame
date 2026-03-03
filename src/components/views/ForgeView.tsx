/**
 * ForgeView — 锻造面板 + 炼化子页
 */
import { useState } from 'react';
import { useForgeStore } from '../../store/forge';
import { useMaterialStore } from '../../store/material';
import { usePlayerStore } from '../../store/player';
import { useUIStore } from '../../store/ui';
import { bn, formatBigNum } from '../../engine/bignum';
import { forgeLevelExp, ForgeRecipe } from '../../engine/forge';
import { canSmelt, doSmelt, SmeltRecipe } from '../../engine/smelt';
import { useDailyQuestStore } from '../../store/dailyQuest';
import forgeRecipesData from '../../data/configs/forge-recipes.json';
import smeltRecipesData from '../../data/configs/smelt-recipes.json';
import materialsData from '../../data/configs/materials.json';

const forgeRecipes = forgeRecipesData as ForgeRecipe[];
const smeltRecipes = smeltRecipesData as SmeltRecipe[];
const materialMap = Object.fromEntries(materialsData.map(m => [m.id, m]));

export function ForgeView() {
  const [tab, setTab] = useState<'forge' | 'smelt' | 'bag'>('forge');
  const forgeLevel = useForgeStore(s => s.forgeLevel);
  const forgeExp = useForgeStore(s => s.forgeExp);
  const doForge = useForgeStore(s => s.forge);
  const materials = useMaterialStore(s => s.materials);
  const coins = usePlayerStore(s => s.player.coins);
  const addToast = useUIStore(s => s.addToast);

  const expNeeded = forgeLevelExp(forgeLevel);
  const expPercent = Math.min(100, (forgeExp / expNeeded) * 100);

  return (
    <div className="view-forge">
      {/* 锻造等级 */}
      <div className="forge-header">
        <h2>🔨 锻造台</h2>
        <div className="forge-level">
          <span>锻造 Lv.{forgeLevel}</span>
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${expPercent}%` }} />
            <span className="exp-text">{forgeExp}/{expNeeded}</span>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="forge-tabs">
        <button className={tab === 'forge' ? 'active' : ''} onClick={() => setTab('forge')}>🔨 锻造</button>
        <button className={tab === 'smelt' ? 'active' : ''} onClick={() => setTab('smelt')}>🔮 炼化</button>
        <button className={tab === 'bag' ? 'active' : ''} onClick={() => setTab('bag')}>📦 材料</button>
      </div>

      {tab === 'forge' && (
        <div className="recipe-list">
          {forgeRecipes.map(recipe => {
            const locked = forgeLevel < recipe.levelRequired;
            const hasCoins = bn(coins).gte(recipe.coinsCost);
            const hasMats = recipe.materials.every(m => (materials[m.materialId] ?? 0) >= m.count);
            const canDo = !locked && hasCoins && hasMats;

            return (
              <div key={recipe.id} className={`recipe-card ${locked ? 'locked' : ''}`}>
                <div className="recipe-name">{recipe.name}</div>
                <div className="recipe-meta">
                  <span>等级 ≥{recipe.levelRequired}</span>
                  <span>成功率 {Math.round(recipe.successRate * 100)}%</span>
                  <span>保底 {recipe.minQuality}</span>
                </div>
                <div className="recipe-materials">
                  {recipe.materials.map(m => {
                    const info = materialMap[m.materialId];
                    const have = materials[m.materialId] ?? 0;
                    return (
                      <span key={m.materialId} className={have >= m.count ? 'mat-ok' : 'mat-lack'}>
                        {info?.icon ?? '?'} {info?.name ?? m.materialId} {have}/{m.count}
                      </span>
                    );
                  })}
                  <span className={bn(coins).gte(recipe.coinsCost) ? 'mat-ok' : 'mat-lack'}>
                    💰 {recipe.coinsCost}
                  </span>
                </div>
                <button
                  className="btn-forge"
                  disabled={!canDo}
                  onClick={() => {
                    const result = doForge(recipe);
                    addToast(result.message, result.success ? 'success' : 'warn');
                  }}
                >
                  {locked ? `🔒 需 Lv.${recipe.levelRequired}` : '锻造'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'smelt' && (
        <div className="recipe-list">
          <h3>🔮 炼化合成</h3>
          {smeltRecipes.map(recipe => {
            const check = canSmelt(recipe, materials, bn(coins));
            return (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-name">
                  {recipe.inputs.map(i => `${materialMap[i.materialId]?.icon ?? '?'}${materialMap[i.materialId]?.name ?? i.materialId} ×${i.count}`).join(' + ')}
                  {' → '}
                  {materialMap[recipe.output.materialId]?.icon ?? '?'}{materialMap[recipe.output.materialId]?.name ?? recipe.output.materialId} ×{recipe.output.count}
                </div>
                <div className="recipe-materials">
                  <span className={bn(coins).gte(recipe.coinsCost) ? 'mat-ok' : 'mat-lack'}>💰 {recipe.coinsCost}</span>
                </div>
                <button
                  className="btn-forge"
                  disabled={!check.ok}
                  onClick={() => {
                    useMaterialStore.getState().removeMaterials(recipe.inputs);
                    usePlayerStore.getState().spendCoins(bn(recipe.coinsCost));
                    const result = doSmelt(recipe);
                    if (result.output) useMaterialStore.getState().addMaterial(result.output.materialId, result.output.count);
                    useDailyQuestStore.getState().addProgress('smelts', 1);
                    addToast(result.message, 'success');
                  }}
                >
                  炼化
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'bag' && (
        <div className="material-bag">
          <h3>📦 材料背包</h3>
          {Object.keys(materials).length === 0 ? (
            <div className="empty-bag">暂无材料，去采集或秘境获取吧！</div>
          ) : (
            <div className="material-grid">
              {Object.entries(materials).map(([id, count]) => {
                const info = materialMap[id];
                return (
                  <div key={id} className="material-item">
                    <span className="mat-icon">{info?.icon ?? '?'}</span>
                    <span className="mat-name">{info?.name ?? id}</span>
                    <span className="mat-count">×{count}</span>
                    <span className="mat-tier">T{info?.tier ?? '?'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
