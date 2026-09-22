import { Post, BoosterRecord, BoostSplitPreview } from '../types/signal';

// Default half-life is 6 hours (in seconds)
export const DEFAULT_HALF_LIFE_SECONDS = 6 * 3600;

/**
 * Computes current decayed weight of a post based on its creation time and base weight.
 * W(t) = W_0 * 2^(-dt / halfLife)
 */
export function calculateDecayedWeight(
  totalWeight: number,
  createdAtSeconds: number,
  currentTimeSeconds: number = Math.floor(Date.now() / 1000),
  halfLifeSeconds: number = DEFAULT_HALF_LIFE_SECONDS
): number {
  if (totalWeight <= 0) return 0;
  const elapsed = Math.max(0, currentTimeSeconds - createdAtSeconds);
  const exponent = -elapsed / halfLifeSeconds;
  return totalWeight * Math.pow(2, exponent);
}

/**
 * Computes the remaining percentage of the decay half-life (100% -> 0%)
 */
export function calculateDecayHealthPercent(
  createdAtSeconds: number,
  currentTimeSeconds: number = Math.floor(Date.now() / 1000),
  halfLifeSeconds: number = DEFAULT_HALF_LIFE_SECONDS
): number {
  const elapsed = Math.max(0, currentTimeSeconds - createdAtSeconds);
  const percent = Math.pow(2, -elapsed / halfLifeSeconds) * 100;
  return Math.min(100, Math.max(1, Math.round(percent)));
}

/**
 * Diminishing returns multiplier for repeated boosts from the same wallet
 * Boost 1: 100%
 * Boost 2: 66.7%
 * Boost 3: 50%
 * Boost N: 1 / (1 + 0.5 * (N - 1))
 */
export function calculateDiminishingMultiplier(currentBoostCount: number): number {
  if (currentBoostCount <= 0) return 1.0;
  return 1 / (1 + 0.5 * currentBoostCount);
}

/**
 * Previews atomic payout split for a post given prospective boost amount and booster
 */
export function calculateBoostSplitPreview(
  post: Post,
  boostAmountMon: number,
  boosterAddress: string,
  existingCurators: BoosterRecord[]
): BoostSplitPreview {
  const isSelfBoost = post.poster.toLowerCase() === boosterAddress.toLowerCase();

  const posterCut = boostAmountMon * 0.40;
  const curatorCutTotal = boostAmountMon * 0.45;
  const reserveCut = boostAmountMon * 0.15;

  const existingBooster = existingCurators.find(
    (c) => c.wallet.toLowerCase() === boosterAddress.toLowerCase()
  );
  const currentCount = existingBooster ? existingBooster.boostCount : 0;
  const multiplier = calculateDiminishingMultiplier(currentCount);
  const effectiveWeightAdded = boostAmountMon * multiplier;

  const totalCuratorWeight = existingCurators.reduce((sum, c) => sum + c.effectiveWeight, 0);

  const curatorBreakdown = existingCurators.map((c) => {
    const shareRatio = totalCuratorWeight > 0 ? c.effectiveWeight / totalCuratorWeight : 0;
    return {
      wallet: c.wallet,
      name: c.name,
      sharePercent: shareRatio * 100,
      estimatedPayout: curatorCutTotal * shareRatio
    };
  });

  return {
    posterCut,
    curatorCutTotal,
    reserveCut,
    effectiveWeightAdded,
    multiplierPercent: Math.round(multiplier * 100),
    isSelfBoost,
    curatorBreakdown
  };
}

/**
 * Formats a wallet address into a compact instrument label: "0x3f...8a12"
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats MON currency numbers to high precision display
 */
export function formatMon(amount: number, decimals: number = 3): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats relative time from timestamp
 */
export function formatRelativeTime(secondsAgo: number): string {
  if (secondsAgo < 60) return `${Math.floor(secondsAgo)}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${(secondsAgo / 3600).toFixed(1)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
}
