const getInitialContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ember_contract_address');
    if (saved && saved.startsWith('0x') && saved.length === 42) {
      return saved;
    }
  }
  return '0x7E8c545E5B4c483D47C88DE2d24296615Bb4278f';
};

export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainIdHex: '0x279f',
  chainName: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  currency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  blockExplorerUrl: 'https://testnet.monadexplorer.com',
  faucetUrl: 'https://testnet.monad.xyz',
  contractAddress: getInitialContractAddress(),
};

export const setStoredContractAddress = (address: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ember_contract_address', address);
  }
  MONAD_TESTNET_CONFIG.contractAddress = address;
};

export const SIGNAL_MARKET_ABI = [
  "constructor(uint256 _decayHalfLife)",
  "function postCount() view returns (uint256)",
  "function decayHalfLife() view returns (uint256)",
  "function createPost(string content) returns (uint256)",
  "function boost(uint256 postId) payable",
  "function getPost(uint256 postId) view returns (uint256 id, address poster, string content, uint256 createdAt, uint256 totalBoosted, uint256 poolReserve, uint256 curatorCount, uint256 totalWeight, uint256 decayedWeight)",
  "function getDecayedWeight(uint256 postId) view returns (uint256)",
  "function getPostCurators(uint256 postId) view returns (address[])",
  "function previewBoost(uint256 postId, uint256 amount, address prospectiveBooster) view returns (uint256 posterCut, uint256 curatorCutTotal, uint256 reserveCut, uint256 effectiveWeightAdded, uint256 multiplierBps, bool isSelfBoost)",
  "event PostCreated(uint256 indexed postId, address indexed poster, string content, uint256 createdAt)",
  "event Boosted(uint256 indexed postId, address indexed booster, uint256 amount, uint256 effectiveWeightAdded, uint256 boostNumber, uint256 timestamp)",
  "event PayoutDistributed(uint256 indexed postId, address indexed recipient, uint256 amount, string role)",
  "event AntiGamingDiminishingReturn(uint256 indexed postId, address indexed booster, uint256 boostNumber, uint256 effectiveMultiplierBps)"
];
