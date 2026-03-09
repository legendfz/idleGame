// v178.0 仙途天气 — Dynamic Weather System
// Changes every hour, provides global buffs

export interface Weather {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  buffs: {
    atkMul?: number;   // e.g. 0.2 = +20%
    hpMul?: number;
    expMul?: number;
    goldMul?: number;
    dropMul?: number;
    critRate?: number;  // flat addition
  };
}

export const WEATHERS: Weather[] = [
  { id: 'clear', name: '晴空万里', emoji: '☀️', color: '#FFD700', description: '天清气朗，修炼效率提升', buffs: { expMul: 0.15 } },
  { id: 'rain', name: '灵雨纷飞', emoji: '🌧️', color: '#6CA6CD', description: '灵雨滋润，灵石收益增加', buffs: { goldMul: 0.2 } },
  { id: 'thunder', name: '雷霆万钧', emoji: '⛈️', color: '#FF6347', description: '天雷震怒，攻击力暴涨', buffs: { atkMul: 0.25 } },
  { id: 'fog', name: '迷雾重重', emoji: '🌫️', color: '#A9A9A9', description: '浓雾弥漫，暴击率提升', buffs: { critRate: 0.05 } },
  { id: 'snow', name: '寒冰封天', emoji: '❄️', color: '#B0E0E6', description: '冰天雪地，生命值增强', buffs: { hpMul: 0.2 } },
  { id: 'wind', name: '狂风怒号', emoji: '🌪️', color: '#98FB98', description: '御风而行，掉落率提升', buffs: { dropMul: 0.15 } },
  { id: 'moon', name: '明月当空', emoji: '🌙', color: '#E8D5FF', description: '月华如水，全属性小幅提升', buffs: { atkMul: 0.08, hpMul: 0.08, expMul: 0.08, goldMul: 0.08 } },
  { id: 'eclipse', name: '日月蚀', emoji: '🌑', color: '#8B0000', description: '天地异象！攻击和掉率大幅提升', buffs: { atkMul: 0.4, dropMul: 0.3 } },
];

/** Get current weather based on hour (changes every hour, deterministic by date) */
export function getCurrentWeather(): Weather {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const hour = now.getHours();
  // Use simple hash to pick weather, different each hour
  const idx = ((seed * 31 + hour * 7) % WEATHERS.length + WEATHERS.length) % WEATHERS.length;
  return WEATHERS[idx];
}

/** Minutes remaining until weather changes */
export function getWeatherTimeLeft(): number {
  const now = new Date();
  return 60 - now.getMinutes();
}
