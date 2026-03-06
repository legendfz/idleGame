/**
 * v86.0: Abyss Floor Milestones
 * Rewards for reaching abyss floor thresholds
 */

export interface AbyssMilestone {
  floor: number;
  rewards: {
    lingshi?: number;
    pantao?: number;
    shards?: number;
    daoPoints?: number;
    trialTokens?: number;
    tianmingScrolls?: number;
  };
  label: string;
}

export const ABYSS_MILESTONES: AbyssMilestone[] = [
  { floor: 10, rewards: { lingshi: 50000, pantao: 100 }, label: '深渊探索者' },
  { floor: 20, rewards: { lingshi: 100000, shards: 50 }, label: '深渊行者' },
  { floor: 30, rewards: { pantao: 500, daoPoints: 10 }, label: '深渊勇士' },
  { floor: 50, rewards: { lingshi: 500000, shards: 200, daoPoints: 20 }, label: '深渊征服者' },
  { floor: 75, rewards: { pantao: 2000, tianmingScrolls: 5, trialTokens: 50 }, label: '深渊霸主' },
  { floor: 100, rewards: { lingshi: 2000000, daoPoints: 50, shards: 500 }, label: '深渊之王' },
  { floor: 150, rewards: { pantao: 10000, daoPoints: 100, tianmingScrolls: 20 }, label: '深渊传说' },
  { floor: 200, rewards: { lingshi: 10000000, daoPoints: 200, shards: 2000 }, label: '深渊神话' },
  { floor: 300, rewards: { pantao: 50000, daoPoints: 500, tianmingScrolls: 100 }, label: '深渊至尊' },
  { floor: 500, rewards: { lingshi: 100000000, daoPoints: 1000, shards: 10000 }, label: '永恒深渊' },
];
