# Ember.run — A Time-Decaying Curation Market
> **Built for Monad Metropolis Hackathon**  
> **Track:** Social, Attention & Culture  
> **Design Direction:** Meridian Instrument-Panel Skeuomorphism (v4.0.0)

Ember.run transforms social curation into a provable, onchain financial asset class. Boosting an ember stakes real **MON** on Monad Testnet. Boost weight decays exponentially over time, and earlier curators automatically earn an instant 45% cut when an ember is boosted downstream. Discovery is no longer dictated by closed black-box algorithms, but by decentralized taste arbitrage.

---

## 🏆 Hackathon Tracks & Bounties Integration Matrix

| Track / Bounty | Status | Target Technology | Key Implementation Files |
| :--- | :---: | :--- | :--- |
| **Track: Social, Attention & Culture** | ✅ LIVE | Time-Decaying Curation Market on Monad | [`contracts/SignalMarket.sol`](contracts/SignalMarket.sol), [`src/utils/decay.ts`](src/utils/decay.ts) |
| **Bounty: Best Use of Envio** | ✅ LIVE | Envio HyperIndex Sub-second Parallel Stream | [`indexer/config.yaml`](indexer/config.yaml), [`indexer/schema.graphql`](indexer/schema.graphql), [`src/components/EnvioTelemetryModal.tsx`](src/components/EnvioTelemetryModal.tsx) |
| **Bounty: Best Community Team Project** | ✅ LIVE | Open Source Curation Governance & Guild | [`CONTRIBUTING.md`](CONTRIBUTING.md), [`src/components/CommunityGovernanceModal.tsx`](src/components/CommunityGovernanceModal.tsx) |
| **Bounty: Best Projects using Alchemy** | ✅ LIVE | Alchemy Monad RPC Routing & Gas Sim | [`src/services/alchemy.ts`](src/services/alchemy.ts), [`src/components/AlchemyTelemetryModal.tsx`](src/components/AlchemyTelemetryModal.tsx) |
| **Bounty: Privy!** | ✅ LIVE | Social Auth & Embedded Monad Wallets | [`src/providers/PrivyAuthProvider.tsx`](src/providers/PrivyAuthProvider.tsx), [`src/components/PasskeyAuthModal.tsx`](src/components/PasskeyAuthModal.tsx) |
| **Bounty: Best Mera-Powered UX on Monad** | ✅ LIVE | Biometric WebAuthn Passkey Onboarding | [`src/utils/mera.ts`](src/utils/mera.ts), [`src/context/WalletContext.tsx`](src/context/WalletContext.tsx) |
| **Bounty: Mera: One Passkey, Many Keys** | ✅ LIVE | PRF Derives Vault + Session + Identity | [`src/utils/mera.ts`](src/utils/mera.ts), [`src/components/PasskeyAuthModal.tsx`](src/components/PasskeyAuthModal.tsx) |

---

## 🔍 Detailed Bounty Implementation Breakdown

### 1. Track: Social, Attention & Culture
- **Monad Testnet Contract:** [`0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`](https://testnet.monadexplorer.com/address/0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8)
- **Deployment Transaction:** [`0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7`](https://testnet.monadexplorer.com/tx/0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7)
- **Live Onchain Boost Transaction:** [`0xf313317940a3daa69e1eadbd9b42ad66cdb7cf6cd3bf4cddbaa8b2a90d949a90`](https://testnet.monadexplorer.com/tx/0xf313317940a3daa69e1eadbd9b42ad66cdb7cf6cd3bf4cddbaa8b2a90d949a90)
- **Exponential Half-Life Physics:** Every boost decays using $W(t) = W_0 \cdot 2^{-\Delta t / 6h}$. The feed updates dynamically every 3 seconds to guarantee signal freshness.
- **Anti-Gaming Game Theory:** 
  1. `require(msg.sender != post.poster)` prevents authors from boosting their own posts.
  2. Diminishing returns formula $\frac{10000}{10000 + 5000 \cdot n}$ punishes repeated wash-curation from the same wallet.

### 2. Bounty: Best Use of Envio
- **HyperIndex Architecture:** Parallel EVM event streaming for Monad Testnet (Chain ID `10143`).
- **Configuration:** [`indexer/config.yaml`](indexer/config.yaml) tracks `PostCreated`, `PostBoosted`, and `PayoutDisbursed` events directly from contract `0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`.
- **GraphQL Schema:** [`indexer/schema.graphql`](indexer/schema.graphql) defines entities `Post`, `Curator`, and `Payout` with sub-second latency.
- **Interactive UI Console:** Click the **`ENVIO : LIVE`** badge in the header console to open the **Envio Telemetry Modal** and run live queries directly.

### 3. Bounty: Best Community Team Project
- **Open Contribution Guide:** [`CONTRIBUTING.md`](CONTRIBUTING.md) specifies open PR workflows, architectural rules, code style guidelines, and community governance.
- **Community Curation Council:** Curators earn provable onchain reputation for discovering high-signal content early.
- **Governance Console:** Click the **`COMMUNITY`** button in the header console or landing page to inspect curation standards, decentralized moderation rules, and contributor roles.

### 4. Bounty: Best Projects using Alchemy
- **High-Performance RPC Service:** [`src/services/alchemy.ts`](src/services/alchemy.ts) implements an Alchemy Monad Testnet routing service.
- **Failover Node Management:** Automatically routes traffic to Alchemy's high-throughput infrastructure with fallback failover to `https://testnet-rpc.monad.xyz`.
- **Parallel Gas Simulation:** Interactive simulator estimates gas consumption and execution latency for bursts of 100 to 10,000 parallel transactions.
- **Interactive UI Console:** Click the **`ALCHEMY : MONAD`** badge in the header console to view real-time latency (sub-50ms), latest block height, and run simulations.

### 5. Bounty: Privy!
- **Privy React Auth Provider:** [`src/providers/PrivyAuthProvider.tsx`](src/providers/PrivyAuthProvider.tsx) configures `@privy-io/react-auth` for Monad Testnet (Chain ID `10143`).
- **Social Login:** Supports 1-click social sign-in via Twitter/X, Google, Discord, and Email.
- **Embedded Monad Wallets:** Automatically creates an embedded EVM wallet for users without browser extensions, instantly pre-funding and arming their curation session.
- **Access Point:** Click **`Create Passkey Wallet`** in the account dropdown and select the **`★ PRIVY SOCIAL`** tab.

### 6. Bounty: Best Mera-Powered UX on Monad
- **Frictionless Biometric Onboarding:** Uses `@category-labs/mera` (`0.2.0`) to unlock Touch ID, Face ID, or Windows Hello onboarding in under 1 second without seed phrases.
- **Zero Extension Requirement:** Mobile Safari and Chrome users can curate instantly with hardware-backed secure enclave keys.

### 7. Bounty: Mera: One Passkey, Many Keys
- **Deterministic PRF Derivation:** [`src/utils/mera.ts`](src/utils/mera.ts) invokes `createPasskeyWithPrfOutput()` to obtain high-entropy PRF bytes from a single biometric touch.
- **Three Keys Derived from One Passkey:**
  1. **Key 1 (Vault Account):** Primary EVM wallet address on Monad Testnet for custody and claiming author earnings.
  2. **Key 2 (Session Curation Signer):** Ephemeral pre-authorized secp256k1 key for zero-prompt micro-curation without popups.
  3. **Key 3 (Decentralized Identity):** Ed25519 identity key for cross-chain reputation proofs.
- **Live Visualizer:** Displayed directly in the **Passkey Mission Control** modal upon registration.

---

## 🎛️ Network & Smart Contract Specifications

- **Target Network:** Monad Testnet
- **Chain ID:** `10143` (`0x279f`)
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Native Currency:** `MON` (18 decimals)
- **Explorer:** `https://testnet.monadexplorer.com`
- **Contract Source:** [`contracts/SignalMarket.sol`](contracts/SignalMarket.sol)
- **Deployed Contract Address:** [`0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`](https://testnet.monadexplorer.com/address/0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8)
- **Deployment Tx:** [`0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7`](https://testnet.monadexplorer.com/tx/0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Smart Contract Tests
```bash
npm test
```
*Executes all 7 contract tests verifying post creation, 40/45/15 atomic splits, boundary conditions, self-boost reverts, diminishing returns, and exponential time decay.*

### 3. Build & Validate Client
```bash
npm run build
```

### 4. Start Development Console
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

---

## 🎬 30-Second Guided Demo Flow
Click the **"30-SEC DEMO"** button in the header bar and click **"AUTO-RUN ALL (30s)"**:
1. **Post Dispatch:** Author registers post on Monad testnet.
2. **Genesis Boost:** Curation of 2.0 MON; 40% (0.8 MON) goes instantly to author.
3. **Live Decay Re-Ranking:** Feed re-ranks live as weight decays.
4. **Cascade Payout:** Downstream curator boosts 3.0 MON; earlier curator receives instant 45% cut.
5. **Anti-Gaming Defense:** Self-boosting is rejected onchain; diminishing returns scale repeat boosts.
