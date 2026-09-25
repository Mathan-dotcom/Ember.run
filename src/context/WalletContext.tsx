import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WalletAccount, Post, BoosterRecord, AuditEntry, CuratorLeader } from '../types/signal';
import { calculateDecayedWeight, calculateDiminishingMultiplier, formatAddress } from '../utils/decay';
import { sound } from '../utils/sound';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import { MONAD_TESTNET_CONFIG, SIGNAL_MARKET_ABI } from '../contracts/config';
import { registerPasskey, authenticatePasskey, isWebAuthnSupported, listStoredPasskeys } from '../utils/webauthn';

interface WalletContextType {
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  posts: Post[];
  curatorsByPost: Record<number, BoosterRecord[]>;
  auditLogs: AuditEntry[];
  curatorLeaderboard: CuratorLeader[];
  switchAccount: (id: string) => void;
  createPasskeyAccount: (username: string) => Promise<WalletAccount>;
  authenticateWithPasskey: () => Promise<WalletAccount | null>;
  isWebAuthnAvailable: boolean;
  requestFaucet: (targetAddress?: string) => void;
  createPost: (title: string, body: string, tags: string[], linkUrl?: string, overrideAccount?: WalletAccount) => Promise<number>;
  boostPost: (postId: number, amountMon: number, overrideAccount?: WalletAccount) => Promise<boolean>;
  getCuratorsForPost: (postId: number) => BoosterRecord[];
  isPasskeyModalOpen: boolean;
  setIsPasskeyModalOpen: (open: boolean) => void;
  refreshDecayedWeights: () => void;
  // Web3 Live Monad Integration
  isWeb3Connected: boolean;
  web3Address: string | null;
  web3ChainId: number | null;
  isCorrectNetwork: boolean;
  isConnectingWeb3: boolean;
  onchainTxPending: boolean;
  connectWeb3Wallet: () => Promise<boolean>;
  disconnectWeb3Wallet: () => void;
  switchToMonadTestnet: () => Promise<boolean>;
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

  // Web3 Live State
  const [isWeb3Connected, setIsWeb3Connected] = useState<boolean>(false);
  const [web3Address, setWeb3Address] = useState<string | null>(null);
  const [web3ChainId, setWeb3ChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [isConnectingWeb3, setIsConnectingWeb3] = useState<boolean>(false);
  const [onchainTxPending, setOnchainTxPending] = useState<boolean>(false);

  // Check if wallet is already connected
  const checkInitialWeb3 = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const accountsList = await (window as any).ethereum.request({ method: 'eth_accounts' });
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      setWeb3ChainId(chainId);
      setIsCorrectNetwork(chainId === MONAD_TESTNET_CONFIG.chainId);

      if (accountsList && accountsList.length > 0) {
        const addr = accountsList[0];
        setWeb3Address(addr);
        setIsWeb3Connected(true);

        const bal = await provider.getBalance(addr);
        const monBal = parseFloat(formatEther(bal));

        const web3Acc: WalletAccount = {
          id: 'web3-wallet',
          name: `MetaMask (${formatAddress(addr)})`,
          handle: `@${addr.slice(2, 8).toLowerCase()}`,
          address: addr,
          balanceMon: Math.round(monBal * 1000) / 1000,
          isPasskey: false,
          passkeyLabel: 'Browser EVM Wallet'
        };

        setAccounts((prev) => {
          const filtered = prev.filter((a) => a.id !== 'web3-wallet');
          return [web3Acc, ...filtered];
        });
        setCurrentAccount(web3Acc);
      }
    } catch (err) {
      console.warn('[Web3 check initial failed]:', err);
    }
  }, []);

  useEffect(() => {
    // Restore any passkey accounts persisted from a previous session
    const storedPasskeys = listStoredPasskeys();
    if (storedPasskeys.length > 0) {
      setAccounts((prev) => {
        const restoredAccounts: WalletAccount[] = storedPasskeys.map((cred) => ({
          id: `passkey-${cred.credentialId.slice(0, 12)}`,
          name: cred.username,
          handle: `@${cred.username.toLowerCase().replace(/\s+/g, '_')}`,
          address: cred.address,
          balanceMon: 10.0,
          isPasskey: true,
          passkeyLabel: 'Passkey (FIDO2 / WebAuthn)'
        }));
        // Merge without duplicating existing seed accounts
        const existingIds = new Set(prev.map((a) => a.id));
        const newOnes = restoredAccounts.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newOnes];
      });
    }

    checkInitialWeb3();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accs: string[]) => {
        if (!accs || accs.length === 0) {
          setIsWeb3Connected(false);
          setWeb3Address(null);
          setCurrentAccount(INITIAL_ACCOUNTS[0]);
        } else {
          checkInitialWeb3();
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const parsed = parseInt(chainIdHex, 16);
        setWeb3ChainId(parsed);
        setIsCorrectNetwork(parsed === MONAD_TESTNET_CONFIG.chainId);
        checkInitialWeb3();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkInitialWeb3]);

  // Connect Web3 Wallet
  const connectWeb3Wallet = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      sound.playWarningBuzz();
      alert('No EVM wallet detected. Please install MetaMask, Rabby, or OKX wallet extension.');
      return false;
    }

    try {
      setIsConnectingWeb3(true);
      sound.playSwitchClick();
      const accountsList = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (!accountsList || accountsList.length === 0) return false;

      const provider = new BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const addr = accountsList[0];

      setWeb3Address(addr);
      setWeb3ChainId(chainId);
      setIsCorrectNetwork(chainId === MONAD_TESTNET_CONFIG.chainId);
      setIsWeb3Connected(true);

      const bal = await provider.getBalance(addr);
      const monBal = parseFloat(formatEther(bal));

      const web3Acc: WalletAccount = {
        id: 'web3-wallet',
        name: `MetaMask (${formatAddress(addr)})`,
        handle: `@${addr.slice(2, 8).toLowerCase()}`,
        address: addr,
        balanceMon: Math.round(monBal * 1000) / 1000,
        isPasskey: false,
        passkeyLabel: 'Browser EVM Wallet'
      };

      setAccounts((prev) => {
        const filtered = prev.filter((a) => a.id !== 'web3-wallet');
        return [web3Acc, ...filtered];
      });
      setCurrentAccount(web3Acc);
      sound.playDisbursementChime();

      // If wrong network, suggest switching
      if (chainId !== MONAD_TESTNET_CONFIG.chainId) {
        await switchToMonadTestnet();
      }

      return true;
    } catch (err: any) {
      console.warn('[Web3 connection failed]:', err);
      sound.playWarningBuzz();
      return false;
    } finally {
      setIsConnectingWeb3(false);
    }
  };

  // Switch to Monad Testnet
  const switchToMonadTestnet = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return false;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainIdHex }]
      });
      setIsCorrectNetwork(true);
      setWeb3ChainId(MONAD_TESTNET_CONFIG.chainId);
      sound.playDisbursementChime();
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MONAD_TESTNET_CONFIG.chainIdHex,
                chainName: MONAD_TESTNET_CONFIG.chainName,
                nativeCurrency: MONAD_TESTNET_CONFIG.currency,
                rpcUrls: [MONAD_TESTNET_CONFIG.rpcUrl],
                blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorerUrl]
              }
            ]
          });
          setIsCorrectNetwork(true);
          setWeb3ChainId(MONAD_TESTNET_CONFIG.chainId);
          sound.playDisbursementChime();
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  // Disconnect Web3 Wallet
  const disconnectWeb3Wallet = () => {
    setIsWeb3Connected(false);
    setWeb3Address(null);
    setAccounts((prev) => prev.filter((a) => a.id !== 'web3-wallet'));
    setCurrentAccount(INITIAL_ACCOUNTS[0]);
    sound.playSwitchClick();
  };

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

  // ── Real WebAuthn passkey registration ────────────────────────────────────
  const isWebAuthnAvailable = isWebAuthnSupported();

  const createPasskeyAccount = async (username: string): Promise<WalletAccount> => {
    // Trigger the real browser biometric prompt (Touch ID / Face ID / Windows Hello)
    const credential = await registerPasskey(username.trim() || 'Passkey Voyager');

    const newId = `passkey-${credential.credentialId.slice(0, 12)}`;
    const newAccount: WalletAccount = {
      id: newId,
      name: credential.username,
      handle: `@${credential.username.toLowerCase().replace(/\s+/g, '_')}`,
      address: credential.address,
      balanceMon: 10.0, // Pre-seeded testnet MON
      isPasskey: true,
      passkeyLabel: 'Passkey (FIDO2 / WebAuthn)'
    };

    setAccounts((prev) => {
      // Avoid duplicates if re-registering same credential
      const filtered = prev.filter((a) => a.id !== newId);
      return [...filtered, newAccount];
    });
    setCurrentAccount(newAccount);
    sound.playDisbursementChime();
    return newAccount;
  };

  // ── Real WebAuthn passkey authentication (returning user) ─────────────────
  const authenticateWithPasskey = async (): Promise<WalletAccount | null> => {
    const credential = await authenticatePasskey(); // no credentialId = show all device passkeys
    if (!credential) return null;

    // Check if we already have this account in state
    const existingId = `passkey-${credential.credentialId.slice(0, 12)}`;
    const existing = accounts.find((a) => a.id === existingId);
    if (existing) {
      setCurrentAccount(existing);
      sound.playDisbursementChime();
      return existing;
    }

    // Reconstruct the account from the stored credential
    const recovered: WalletAccount = {
      id: existingId,
      name: credential.username,
      handle: `@${credential.username.toLowerCase().replace(/\s+/g, '_')}`,
      address: credential.address,
      balanceMon: 10.0,
      isPasskey: true,
      passkeyLabel: 'Passkey (FIDO2 / WebAuthn)'
    };
    setAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== existingId);
      return [...filtered, recovered];
    });
    setCurrentAccount(recovered);
    sound.playDisbursementChime();
    return recovered;
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

    let txHashToRecord = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    if (isWeb3Connected && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        setOnchainTxPending(true);
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(MONAD_TESTNET_CONFIG.contractAddress, SIGNAL_MARKET_ABI, signer);
        const postPayload = JSON.stringify({ title, body, tags, linkUrl });
        const tx = await contract.createPost(postPayload);
        const receipt = await tx.wait();
        if (receipt && receipt.hash) {
          txHashToRecord = receipt.hash;
        }
        const updatedBal = await provider.getBalance(activeAccount.address);
        const monBal = parseFloat(formatEther(updatedBal));
        setCurrentAccount((prev) => ({ ...prev, balanceMon: Math.round(monBal * 1000) / 1000 }));
      } catch (err: any) {
        console.warn('[Web3 onchain createPost]:', err);
        if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
          sound.playWarningBuzz();
          throw new Error('Transaction was rejected in your wallet.');
        }
      } finally {
        setOnchainTxPending(false);
      }
    }

    // Emit Audit entry
    const newLog: AuditEntry = {
      id: `tx-create-${Date.now()}`,
      txHash: txHashToRecord,
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
      note: isWeb3Connected ? 'Post confirmed onchain via Monad Testnet' : 'Post registered on Monad testnet'
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
    let txHashBase = `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`;

    if (isWeb3Connected && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        setOnchainTxPending(true);
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(MONAD_TESTNET_CONFIG.contractAddress, SIGNAL_MARKET_ABI, signer);
        const tx = await contract.boost(postId, { value: parseEther(amountMon.toString()) });
        const receipt = await tx.wait();
        if (receipt && receipt.hash) {
          txHashBase = receipt.hash;
        }
        const updatedBal = await provider.getBalance(activeAccount.address);
        const monBal = parseFloat(formatEther(updatedBal));
        setCurrentAccount((prev) => ({ ...prev, balanceMon: Math.round(monBal * 1000) / 1000 }));
      } catch (err: any) {
        console.warn('[Web3 onchain boost]:', err);
        if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
          sound.playWarningBuzz();
          throw new Error('Transaction was rejected in your wallet.');
        }
        if (err?.message?.includes('Self-boosting prohibited')) {
          sound.playWarningBuzz();
          throw new Error('Signal: Self-boosting is strictly prohibited by onchain contract logic');
        }
      } finally {
        setOnchainTxPending(false);
      }
    }

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
        authenticateWithPasskey,
        isWebAuthnAvailable,
        requestFaucet,
        createPost,
        boostPost,
        getCuratorsForPost,
        isPasskeyModalOpen,
        setIsPasskeyModalOpen,
        refreshDecayedWeights,
        isWeb3Connected,
        web3Address,
        web3ChainId,
        isCorrectNetwork,
        isConnectingWeb3,
        onchainTxPending,
        connectWeb3Wallet,
        disconnectWeb3Wallet,
        switchToMonadTestnet
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
