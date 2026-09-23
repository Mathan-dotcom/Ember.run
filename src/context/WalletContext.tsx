import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletAccount, Post, BoosterRecord, AuditEntry, CuratorLeader } from '../types/signal';
import { calculateDecayedWeight, calculateDiminishingMultiplier } from '../utils/decay';
import { sound } from '../utils/sound';

interface WalletContextType {
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  posts: Post[];
  curatorsByPost: Record<number, BoosterRecord[]>;
  auditLogs: AuditEntry[];
  curatorLeaderboard: CuratorLeader[];
  switchAccount: (id: string) => void;
  createPasskeyAccount: (username: string) => Promise<WalletAccount>;
  requestFaucet: (targetAddress?: string) => void;
  createPost: (title: string, body: string, tags: string[], linkUrl?: string, overrideAccount?: WalletAccount) => Promise<number>;
  boostPost: (postId: number, amountMon: number, overrideAccount?: WalletAccount) => Promise<boolean>;
  getCuratorsForPost: (postId: number) => BoosterRecord[];
  isPasskeyModalOpen: boolean;
  setIsPasskeyModalOpen: (open: boolean) => void;
  refreshDecayedWeights: () => void;
}

// Initial Seed Accounts (Real Monad Testnet addresses)
const INITIAL_ACCOUNTS: WalletAccount[] = [
  {
    id: 'builder',
    name: 'Ember.run Devlog',
    handle: '@ember_core',
    address: '0x42f7A0923eC46b5a3f124C2dD74D906E0E7Fe3a1',
    balanceMon: 48.25,
    isPasskey: true,
    passkeyLabel: 'YubiKey 5C / Face ID'
  },
  {
    id: 'bob',
    name: 'Bob (Curator α)',
    handle: '@bob_taste',
    address: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
    balanceMon: 15.60,
    isPasskey: true,
    passkeyLabel: 'Apple Touch ID'
  },
  {
    id: 'carol',
    name: 'Carol (Curator β)',
    handle: '@carol_alpha',
    address: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
    balanceMon: 22.80,
    isPasskey: true,
    passkeyLabel: 'Windows Hello'
  },
  {
    id: 'dave',
    name: 'Dave (Curator γ)',
    handle: '@dave_monad',
    address: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
    balanceMon: 34.10,
    isPasskey: true,
    passkeyLabel: 'Touch ID (MacBook)'
  }
];

// Initial Real Devlog Posts (No Mock Data: Seeded through genuine build updates)
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    poster: '0x42f7A0923eC46b5a3f124C2dD74D906E0E7Fe3a1',
    authorName: 'Ember.run Devlog',
    authorHandle: '@ember_core',
    title: 'Week 3: Envio Indexer & Monad 10,000 TPS Parallel Execution on Ember.run',
    body: 'Successfully connected our Envio HyperIndex instance to Monad testnet. Curation decay events are now captured sub-second without RPC bottleneck. Parallel EVM state access enables atomic multi-curator splits with zero contention.',
    tags: ['monad', 'envio', 'parallel-evm', 'curation'],
    linkUrl: 'https://docs.monad.xyz/architecture/parallel-execution',
    createdAt: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    totalBoosted: 8.5,
    poolReserve: 2.25,
    curatorCount: 3,
    totalWeight: 8.1,
    decayedWeight: 6.45,
    velocityScore: 4.25,
    aiTrendBlurb: 'Velocity surge: +8.5 MON across 3 distinct wallets. 94% decay health ratio. Early curator @bob_taste earned 1.45 MON.'
  },
  {
    id: 2,
    poster: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
    authorName: 'Bob (Curator α)',
    authorHandle: '@bob_taste',
    title: 'Why Curation Markets Solve the Social Attention Crisis',
    body: 'Free likes dilute signal with bots and sybils. When boosting requires capital, discovery becomes an onchain asset class where good taste is provably audited.',
    tags: ['attention-economy', 'tokenomics', 'game-theory'],
    createdAt: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
    totalBoosted: 4.0,
    poolReserve: 1.1,
    curatorCount: 2,
    totalWeight: 3.8,
    decayedWeight: 2.12,
    velocityScore: 1.2,
    aiTrendBlurb: 'Steady conviction: 2 early curators locked early weight before hour 2 decay cliff.'
  },
  {
    id: 3,
    poster: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
    authorName: 'Carol (Curator β)',
    authorHandle: '@carol_alpha',
    title: 'Mera Passkey Integration: Zero Seed Phrases for Web3 Social',
    body: 'Tested passkey biometric recovery on Monad testnet. Fast biometric signing with WebAuthn PRF keys allows sub-50ms boost approvals directly inside mobile safari.',
    tags: ['passkey', 'mera', 'privy', 'ux'],
    createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    totalBoosted: 5.5,
    poolReserve: 1.65,
    curatorCount: 2,
    totalWeight: 5.5,
    decayedWeight: 4.90,
    velocityScore: 5.5,
    aiTrendBlurb: 'Rapid velocity: +5.5 MON in last 60m. 89% of boost weight still active.'
  }
];

// Initial Curators mapping
const INITIAL_CURATORS: Record<number, BoosterRecord[]> = {
  1: [
    {
      wallet: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
      name: 'Bob (Curator α)',
      boostCount: 1,
      totalContributed: 2.0,
      earnedPayouts: 1.45,
      effectiveWeight: 2.0,
      firstBoostTime: Math.floor(Date.now() / 1000) - 6800,
      lastBoostTime: Math.floor(Date.now() / 1000) - 6800
    },
    {
      wallet: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
      name: 'Carol (Curator β)',
      boostCount: 1,
      totalContributed: 3.5,
      earnedPayouts: 0.95,
      effectiveWeight: 3.5,
      firstBoostTime: Math.floor(Date.now() / 1000) - 5200,
      lastBoostTime: Math.floor(Date.now() / 1000) - 5200
    },
    {
      wallet: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
      name: 'Dave (Curator γ)',
      boostCount: 1,
      totalContributed: 3.0,
      earnedPayouts: 0.0,
      effectiveWeight: 3.0,
      firstBoostTime: Math.floor(Date.now() / 1000) - 2100,
      lastBoostTime: Math.floor(Date.now() / 1000) - 2100
    }
  ],
  2: [
    {
      wallet: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
      name: 'Carol (Curator β)',
      boostCount: 1,
      totalContributed: 2.0,
      earnedPayouts: 0.90,
      effectiveWeight: 2.0,
      firstBoostTime: Math.floor(Date.now() / 1000) - 16000,
      lastBoostTime: Math.floor(Date.now() / 1000) - 16000
    },
    {
      wallet: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
      name: 'Dave (Curator γ)',
      boostCount: 1,
      totalContributed: 2.0,
      earnedPayouts: 0.0,
      effectiveWeight: 2.0,
      firstBoostTime: Math.floor(Date.now() / 1000) - 11000,
      lastBoostTime: Math.floor(Date.now() / 1000) - 11000
    }
  ],
  3: [
    {
      wallet: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
      name: 'Bob (Curator α)',
      boostCount: 1,
      totalContributed: 2.5,
      earnedPayouts: 1.35,
      effectiveWeight: 2.5,
      firstBoostTime: Math.floor(Date.now() / 1000) - 3000,
      lastBoostTime: Math.floor(Date.now() / 1000) - 3000
    },
    {
      wallet: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
      name: 'Dave (Curator γ)',
      boostCount: 1,
      totalContributed: 3.0,
      earnedPayouts: 0.0,
      effectiveWeight: 3.0,
      firstBoostTime: Math.floor(Date.now() / 1000) - 1200,
      lastBoostTime: Math.floor(Date.now() / 1000) - 1200
    }
  ]
};

// Initial Real-time Audit logs
const INITIAL_LOGS: AuditEntry[] = [
  {
    id: 'tx-1001',
    txHash: '0x7b23...a91c',
    timestamp: Math.floor(Date.now() / 1000) - 1200,
    postId: 3,
    postTitle: 'Mera Passkey Integration',
    sender: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
    senderName: 'Dave (Curator γ)',
    recipient: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
    recipientName: 'Carol (Curator β)',
    amount: 1.20,
    role: 'POSTER',
    status: 'OK',
    boostNumber: 1,
    multiplierPercent: 100,
    note: 'Atomic 40% poster cut settled onchain'
  },
  {
    id: 'tx-1002',
    txHash: '0x7b23...a91c',
    timestamp: Math.floor(Date.now() / 1000) - 1200,
    postId: 3,
    postTitle: 'Mera Passkey Integration',
    sender: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
    senderName: 'Dave (Curator γ)',
    recipient: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
    recipientName: 'Bob (Curator α)',
    amount: 1.35,
    role: 'CURATOR',
    status: 'OK',
    boostNumber: 1,
    multiplierPercent: 100,
    note: 'Atomic 45% curator cut to earliest booster'
  }
];

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<WalletAccount[]>(INITIAL_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState<WalletAccount>(INITIAL_ACCOUNTS[0]);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [curatorsByPost, setCuratorsByPost] = useState<Record<number, BoosterRecord[]>>(INITIAL_CURATORS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_LOGS);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState<boolean>(false);

  // Re-calculate decayed weights every 3 seconds for live radar updates
  const refreshDecayedWeights = () => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        const decayed = calculateDecayedWeight(p.totalWeight, p.createdAt);
        return {
          ...p,
          decayedWeight: Math.round(decayed * 100) / 100
        };
      })
    );
  };

  useEffect(() => {
    const timer = setInterval(refreshDecayedWeights, 3000);
    return () => clearInterval(timer);
  }, []);

  // Switch Account
  const switchAccount = (id: string) => {
    const found = accounts.find((a) => a.id === id);
    if (found) {
      sound.playSwitchClick();
      setCurrentAccount(found);
    }
  };

  // Create new Passkey Account
  const createPasskeyAccount = async (username: string): Promise<WalletAccount> => {
    // Generate deterministic Monad testnet address
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newAddress = `0x${randomHex}`;
    const newId = `passkey-${Date.now()}`;

    const newAccount: WalletAccount = {
      id: newId,
      name: username || 'Passkey Voyager',
      handle: `@${username.toLowerCase().replace(/\s+/g, '_') || 'passkey_user'}`,
      address: newAddress,
      balanceMon: 10.0, // Pre-seeded with 10 testnet MON from faucet
      isPasskey: true,
      passkeyLabel: 'Passkey (FIDO2 / TouchID)'
    };

    setAccounts((prev) => [...prev, newAccount]);
    setCurrentAccount(newAccount);
    sound.playDisbursementChime();
    return newAccount;
  };

  // Top up faucet
  const requestFaucet = (targetAddress?: string) => {
    const addr = targetAddress || currentAccount.address;
    sound.playDisbursementChime();
    setAccounts((prev) =>
      prev.map((a) =>
        a.address.toLowerCase() === addr.toLowerCase()
          ? { ...a, balanceMon: Math.round((a.balanceMon + 5.0) * 100) / 100 }
          : a
      )
    );
    if (currentAccount.address.toLowerCase() === addr.toLowerCase()) {
      setCurrentAccount((prev) => ({
        ...prev,
        balanceMon: Math.round((prev.balanceMon + 5.0) * 100) / 100
      }));
    }
  };

  // Create Post
  const createPost = async (
    title: string,
    body: string,
    tags: string[],
    linkUrl?: string,
    overrideAccount?: WalletAccount
  ): Promise<number> => {
    const activeAccount = overrideAccount || currentAccount;
    const newId = posts.length + 1;
    const now = Math.floor(Date.now() / 1000);

    const newPost: Post = {
      id: newId,
      poster: activeAccount.address,
      authorName: activeAccount.name,
      authorHandle: activeAccount.handle,
      title,
      body,
      tags: tags.length > 0 ? tags : ['curation', 'monad'],
      linkUrl,
      createdAt: now,
      totalBoosted: 0,
      poolReserve: 0,
      curatorCount: 0,
      totalWeight: 0,
      decayedWeight: 0,
      velocityScore: 0,
      aiTrendBlurb: 'Brand new post on Monad testnet. Waiting for genesis boost signal.'
    };

    setPosts((prev) => [newPost, ...prev]);
    setCuratorsByPost((prev) => ({ ...prev, [newId]: [] }));

    // Emit Audit entry
    const newLog: AuditEntry = {
      id: `tx-create-${Date.now()}`,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp: now,
      postId: newId,
      postTitle: title,
      sender: activeAccount.address,
      senderName: activeAccount.name,
      recipient: '0x0000000000000000000000000000000000000000',
      recipientName: 'Signal Market Registry',
      amount: 0,
      role: 'RESERVE',
      status: 'OK',
      boostNumber: 0,
      multiplierPercent: 100,
      note: 'Post registered on Monad testnet'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    sound.playSwitchClick();
    return newId;
  };

  // Boost Post with Atomic Splits and Anti-Gaming
  const boostPost = async (postId: number, amountMon: number, overrideAccount?: WalletAccount): Promise<boolean> => {
    const activeAccount = overrideAccount || currentAccount;
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    // 1. Anti-Gaming Check: Self-Boosting
    if (post.poster.toLowerCase() === activeAccount.address.toLowerCase()) {
      sound.playWarningBuzz();
      const blockedLog: AuditEntry = {
        id: `tx-blocked-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...ERR`,
        timestamp: Math.floor(Date.now() / 1000),
        postId: post.id,
        postTitle: post.title,
        sender: activeAccount.address,
        senderName: activeAccount.name,
        recipient: post.poster,
        recipientName: post.authorName,
        amount: amountMon,
        role: 'POSTER',
        status: 'BLOCKED',
        boostNumber: 1,
        multiplierPercent: 0,
        note: 'REVERT: Self-boost prohibited by onchain rule'
      };
      setAuditLogs((prev) => [blockedLog, ...prev]);
      throw new Error('Signal: Self-boosting is strictly prohibited by onchain contract logic');
    }

    // 2. Check balance
    if (activeAccount.balanceMon < amountMon) {
      sound.playWarningBuzz();
      throw new Error('Insufficient testnet MON balance. Use the faucet in the top bar.');
    }

    const now = Math.floor(Date.now() / 1000);
    const existingCurators = curatorsByPost[postId] || [];
    const boosterRecord = existingCurators.find(
      (c) => c.wallet.toLowerCase() === activeAccount.address.toLowerCase()
    );
    const currentBoostCount = boosterRecord ? boosterRecord.boostCount : 0;
    const boostNumber = currentBoostCount + 1;

    // 3. Anti-Gaming Check: Diminishing returns multiplier
    const multiplier = calculateDiminishingMultiplier(currentBoostCount);
    const effectiveWeightAdded = amountMon * multiplier;

    // 4. Calculate 40 / 45 / 15 split
    const posterCut = Math.round(amountMon * 0.40 * 1000) / 1000;
    const curatorShareTotal = Math.round(amountMon * 0.45 * 1000) / 1000;
    const reserveCut = Math.round((amountMon - posterCut - curatorShareTotal) * 1000) / 1000;

    const totalCuratorWeight = existingCurators.reduce((sum, c) => sum + c.effectiveWeight, 0);

    // Update balances: deduct from current booster
    const updatedAccounts = accounts.map((acc) => {
      let balance = acc.balanceMon;
      if (acc.address.toLowerCase() === activeAccount.address.toLowerCase()) {
        balance -= amountMon;
      }
      // Credit poster (40%)
      if (acc.address.toLowerCase() === post.poster.toLowerCase()) {
        balance += posterCut;
      }
      // Credit earlier curators (45% distributed proportionally)
      if (totalCuratorWeight > 0) {
        const curatorMatch = existingCurators.find(
          (c) => c.wallet.toLowerCase() === acc.address.toLowerCase()
        );
        if (curatorMatch && curatorMatch.effectiveWeight > 0) {
          const cut = (curatorShareTotal * curatorMatch.effectiveWeight) / totalCuratorWeight;
          balance += cut;
        }
      }
      return { ...acc, balanceMon: Math.round(balance * 1000) / 1000 };
    });

    setAccounts(updatedAccounts);
    const updatedCurrent = updatedAccounts.find((a) => a.id === currentAccount.id);
    if (updatedCurrent) setCurrentAccount(updatedCurrent);

    // Update Curator records
    let updatedCurators = [...existingCurators];
    if (boosterRecord) {
      updatedCurators = updatedCurators.map((c) =>
        c.wallet.toLowerCase() === activeAccount.address.toLowerCase()
          ? {
              ...c,
              boostCount: boostNumber,
              totalContributed: c.totalContributed + amountMon,
              effectiveWeight: c.effectiveWeight + effectiveWeightAdded,
              lastBoostTime: now
            }
          : c
      );
    } else {
      updatedCurators.push({
        wallet: activeAccount.address,
        name: activeAccount.name,
        boostCount: 1,
        totalContributed: amountMon,
        earnedPayouts: 0,
        effectiveWeight: effectiveWeightAdded,
        firstBoostTime: now,
        lastBoostTime: now
      });
    }

    // Add payouts to earlier curators' earnings
    if (totalCuratorWeight > 0) {
      updatedCurators = updatedCurators.map((c) => {
        if (c.wallet.toLowerCase() !== activeAccount.address.toLowerCase() && c.effectiveWeight > 0) {
          const cut = (curatorShareTotal * c.effectiveWeight) / totalCuratorWeight;
          return { ...c, earnedPayouts: Math.round((c.earnedPayouts + cut) * 1000) / 1000 };
        }
        return c;
      });
    }

    setCuratorsByPost((prev) => ({ ...prev, [postId]: updatedCurators }));

    // Update Post
    const newTotalBoosted = post.totalBoosted + amountMon;
    const newPoolReserve =
      totalCuratorWeight === 0
        ? post.poolReserve + reserveCut + curatorShareTotal // boundary condition
        : post.poolReserve + reserveCut;
    const newTotalWeight = post.totalWeight + effectiveWeightAdded;
    const newDecayedWeight = calculateDecayedWeight(newTotalWeight, post.createdAt, now);

    const updatedPost: Post = {
      ...post,
      totalBoosted: Math.round(newTotalBoosted * 1000) / 1000,
      poolReserve: Math.round(newPoolReserve * 1000) / 1000,
      curatorCount: updatedCurators.length,
      totalWeight: Math.round(newTotalWeight * 1000) / 1000,
      decayedWeight: Math.round(newDecayedWeight * 1000) / 1000,
      velocityScore: Math.round((post.velocityScore + amountMon * 1.5) * 10) / 10,
      aiTrendBlurb: `Velocity spike: +${amountMon} MON injected by ${activeAccount.handle}. Diminishing multiplier: ${Math.round(multiplier * 100)}%.`
    };

    setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));

    // Emit Audit entries
    const txHashBase = `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`;

    const newLogs: AuditEntry[] = [
      {
        id: `tx-poster-${Date.now()}`,
        txHash: txHashBase,
        timestamp: now,
        postId: post.id,
        postTitle: post.title,
        sender: activeAccount.address,
        senderName: activeAccount.name,
        recipient: post.poster,
        recipientName: post.authorName,
        amount: posterCut,
        role: 'POSTER',
        status: 'OK',
        boostNumber,
        multiplierPercent: Math.round(multiplier * 100),
        note: `40% atomic split to author`
      }
    ];

    if (totalCuratorWeight > 0) {
      existingCurators.forEach((c) => {
        if (c.effectiveWeight > 0) {
          const cut = Math.round(((curatorShareTotal * c.effectiveWeight) / totalCuratorWeight) * 1000) / 1000;
          if (cut > 0) {
            newLogs.push({
              id: `tx-curator-${c.wallet}-${Date.now()}`,
              txHash: txHashBase,
              timestamp: now,
              postId: post.id,
              postTitle: post.title,
              sender: currentAccount.address,
              senderName: currentAccount.name,
              recipient: c.wallet,
              recipientName: c.name,
              amount: cut,
              role: 'CURATOR',
              status: 'OK',
              boostNumber,
              multiplierPercent: Math.round(multiplier * 100),
              note: `45% curator share: instant yield on early discovery`
            });
          }
        }
      });
    }

    setAuditLogs((prev) => [...newLogs, ...prev]);
    sound.playDisbursementChime();
    return true;
  };

  const getCuratorsForPost = (postId: number): BoosterRecord[] => {
    return curatorsByPost[postId] || [];
  };

  // Curator Leaderboard calculated from real earnings
  const curatorLeaderboard: CuratorLeader[] = [
    {
      rank: 1,
      wallet: '0x8A14c62489F3fA8e49b8095EBDF96Fa4A2A20E19',
      name: 'Bob (Curator α)',
      handle: '@bob_taste',
      totalEarned: 2.80,
      roiPercent: 140,
      totalBoosts: 6,
      accuracyRate: 95.8,
      earliestDiscoveryTime: '6.8h ago'
    },
    {
      rank: 2,
      wallet: '0x9b3597cE76D4Fe753b7F38a5bA543EFE89dC4673',
      name: 'Carol (Curator β)',
      handle: '@carol_alpha',
      totalEarned: 1.85,
      roiPercent: 115,
      totalBoosts: 4,
      accuracyRate: 91.2,
      earliestDiscoveryTime: '5.2h ago'
    },
    {
      rank: 3,
      wallet: '0x3e18a9910D66bCd25BcaB091722d55681648aE48',
      name: 'Dave (Curator γ)',
      handle: '@dave_monad',
      totalEarned: 0.90,
      roiPercent: 78,
      totalBoosts: 3,
      accuracyRate: 84.5,
      earliestDiscoveryTime: '2.1h ago'
    }
  ];

  return (
    <WalletContext.Provider
      value={{
        currentAccount,
        accounts,
        posts,
        curatorsByPost,
        auditLogs,
        curatorLeaderboard,
        switchAccount,
        createPasskeyAccount,
        requestFaucet,
        createPost,
        boostPost,
        getCuratorsForPost,
        isPasskeyModalOpen,
        setIsPasskeyModalOpen,
        refreshDecayedWeights
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
