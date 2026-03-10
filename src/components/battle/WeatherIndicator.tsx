import { getCurrentWeather, getWeatherTimeLeft } from '../../data/weather';

export function WeatherIndicator() {
  const w = getCurrentWeather();
  const tl = getWeatherTimeLeft();
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, padding:'2px 0', color: w.color }}>
      <span>{w.emoji} {w.name}</span>
      <span style={{ fontSize:9, color:'#888' }}>({Object.entries(w.buffs).map(([k,v]) => {
        const names: Record<string,string> = {atkMul:'攻击',hpMul:'生命',expMul:'经验',goldMul:'灵石',dropMul:'掉率',critRate:'暴击'};
        return `${names[k]??k}+${Math.round((v as number)*100)}%`;
      }).join(' ')} · {tl}m)</span>
    </div>
  );
}
