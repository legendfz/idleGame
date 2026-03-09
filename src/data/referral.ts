// v179.0: Referral/invite bonus system
// URL param ?ref=1 grants new players a starter bonus

const REFERRAL_KEY = 'referralClaimed';

export interface ReferralReward {
  lingshi: number;
  pantao: number;
  hongmengShards: number;
  tianmingScrolls: number;
}

export const REFERRAL_REWARD: ReferralReward = {
  lingshi: 5000,
  pantao: 10,
  hongmengShards: 5,
  tianmingScrolls: 2,
};

/** Check if user arrived via referral link */
export function hasReferralParam(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('ref');
  } catch { return false; }
}

/** Check if referral was already claimed */
export function isReferralClaimed(): boolean {
  return localStorage.getItem(REFERRAL_KEY) === '1';
}

/** Mark referral as claimed */
export function markReferralClaimed(): void {
  localStorage.setItem(REFERRAL_KEY, '1');
}

/** Get the referral invite URL */
export function getReferralUrl(): string {
  return 'https://legendfz.github.io/idleGame/?ref=1';
}
