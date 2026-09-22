export interface Post {
  id: number;
  poster: string;
  authorName: string;
  authorHandle: string;
  title: string;
  body: string;
  tags: string[];
  linkUrl?: string;
  createdAt: number; // Unix timestamp in seconds
  totalBoosted: number; // in MON
  poolReserve: number; // in MON
  curatorCount: number;
  totalWeight: number;
  decayedWeight: number;
  velocityScore: number; // boosts per hour
  aiTrendBlurb?: string;
}

export interface BoosterRecord {
  wallet: string;
  name: string;
  boostCount: number;
  totalContributed: number;
  earnedPayouts: number;
  effectiveWeight: number;
  firstBoostTime: number;
  lastBoostTime: number;
}

export interface AuditEntry {
  id: string;
  txHash: string;
  timestamp: number;
  postId: number;
  postTitle: string;
  sender: string;
  senderName: string;
  recipient: string;
  recipientName: string;
  amount: number;
  role: 'POSTER' | 'CURATOR' | 'RESERVE';
  status: 'OK' | 'WARN' | 'BLOCKED';
  boostNumber: number;
  multiplierPercent: number;
  note?: string;
}

export interface CuratorLeader {
  rank: number;
  wallet: string;
  name: string;
  handle: string;
  totalEarned: number;
  roiPercent: number;
  totalBoosts: number;
  accuracyRate: number; // e.g. 94.2%
  earliestDiscoveryTime: string;
  isCurrentUser?: boolean;
}

export interface WalletAccount {
  id: string;
  name: string;
  handle: string;
  address: string;
  balanceMon: number;
  isPasskey: boolean;
  passkeyLabel: string;
}

export interface BoostSplitPreview {
  posterCut: number;
  curatorCutTotal: number;
  reserveCut: number;
  effectiveWeightAdded: number;
  multiplierPercent: number;
  isSelfBoost: boolean;
  curatorBreakdown: {
    wallet: string;
    name: string;
    sharePercent: number;
    estimatedPayout: number;
  }[];
}
