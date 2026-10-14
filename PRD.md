# Product Requirement Document (PRD)

# Ember.run — A Time-Decaying Curation Market

> **Hackathon:** Monad Metropolis (October 2026)  
> **Track:** Track 03 — Social, Attention & Culture  
> **Target Bounties:**  
> 1. Best Use of Envio  
> 2. Best Community Team Project  
> 3. Best Projects using Alchemy  
> 4. Privy!  
> 5. Best Mera-Powered UX on Monad  
> 6. Mera: One Passkey, Many Keys  
> 
> **Document Version:** 2.0.0 Production Specification  
> **Status:** Implemented, Deployed on Monad Testnet & Validated  
> **Repository:** [https://github.com/Mathan-dotcom/Ember.run](https://github.com/Mathan-dotcom/Ember.run)  
> **Deployed Smart Contract:** [`0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`](https://testnet.monadexplorer.com/address/0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8)  
> **Target Chain:** Monad Testnet (Chain ID `10143` / `0x279f`)  

---

## 1. Executive Summary & Product Vision

### 1.1 The Core Problem
Digital attention in contemporary social media is broken by zero-cost interactions:
- **Bot Farms & Sybil Flooding:** Free "likes", retweets, and upvotes create asymmetric incentives for automated spam and engagement manipulation.
- **Opaque Black-Box Algorithms:** Centralized platforms monopolize attention routing, privatizing advertising profits while creators and discoverers receive negligible upside.
- **Stale Viral Monopoly:** Once a post goes viral, algorithmic inertia traps it at the top of feeds indefinitely, drowning out emerging, high-signal discoveries.

### 1.2 The Ember.run Thesis
> *"Discovery is an asset class. When boosting requires real onchain capital, signal cannot be faked. When boost weight decays exponentially over time, no post dominates forever. And when downstream boosts reward earlier discoverers with instant atomic cuts, good taste becomes a provable, profitable profession."*

### 1.3 High-Level Product Overview
**Ember.run** is an onchain time-decaying curation market deployed on the **Monad Parallel EVM**. It transforms social curation from vanity clicks into a high-throughput, liquid discovery game:
1. **Curate with Capital:** Staking testnet **MON** on an ember signals conviction.
2. **Atomic Revenue Split (40 / 45 / 15):** 40% pays the creator immediately; 45% pays earlier curators who spotted the signal first; 15% reinforces the post's liquidity reserve.
3. **Continuous Exponential Decay:** Signal weight decays continuously with a 6-hour half-life ($W(t) = W_0 \cdot 2^{-\Delta t / 6\text{h}}$), forcing constant price and attention discovery.
4. **Anti-Gaming Protections:** Author self-boosting reverts onchain; diminishing returns multipliers penalize repeated wash-curation from the same wallet.
5. **Next-Gen UX (Mera & Privy):** Biometric passkey onboarding ("One Passkey, Many Keys") and 1-click social logins eliminate seed phrases and wallet extensions.
6. **Sub-Second Indexing & RPC Routing (Envio & Alchemy):** HyperIndex sub-second parallel event streaming coupled with Alchemy high-throughput RPC routing and burst gas simulation.

---

## 2. Target Hackathon Tracks & Bounties Integration Matrix

| Target Program | Category | Compliance Summary | Primary Code References |
| :--- | :---: | :--- | :--- |
| **Track 03: Social, Attention & Culture** | Track | Decentralized time-decaying curation market on Monad Testnet; solves attention manipulation via provable taste arbitrage. | [`contracts/SignalMarket.sol`](contracts/SignalMarket.sol), [`src/utils/decay.ts`](src/utils/decay.ts) |
| **Best Use of Envio** | Bounty | Envio HyperIndex sub-second event streaming captures `PostCreated`, `PostBoosted`, and `PayoutDisbursed` into GraphQL in &lt;50ms. | [`indexer/config.yaml`](indexer/config.yaml), [`indexer/schema.graphql`](indexer/schema.graphql), [`src/components/EnvioTelemetryModal.tsx`](src/components/EnvioTelemetryModal.tsx) |
| **Best Community Team Project** | Bounty | Open community curation council, decentralized moderation standards, open governance, and structured contributor framework. | [`CONTRIBUTING.md`](CONTRIBUTING.md), [`src/components/CommunityGovernanceModal.tsx`](src/components/CommunityGovernanceModal.tsx) |
| **Best Projects using Alchemy** | Bounty | High-throughput Alchemy Monad Testnet RPC routing, sub-50ms latency monitoring, failover node handling, and parallel burst gas simulation. | [`src/services/alchemy.ts`](src/services/alchemy.ts), [`src/components/AlchemyTelemetryModal.tsx`](src/components/AlchemyTelemetryModal.tsx) |
| **Privy!** | Bounty | Privy social authentication (Twitter/X, Google, Discord, Email) with auto-provisioned embedded Monad Testnet wallets. | [`src/providers/PrivyAuthProvider.tsx`](src/providers/PrivyAuthProvider.tsx), [`src/components/PasskeyAuthModal.tsx`](src/components/PasskeyAuthModal.tsx) |
| **Best Mera-Powered UX on Monad** | Bounty | Frictionless biometric passkey onboarding via Category Labs Mera SDK (`@category-labs/mera`), enabling instant mobile WebAuthn onboarding without seed phrases. | [`src/utils/mera.ts`](src/utils/mera.ts), [`src/context/WalletContext.tsx`](src/context/WalletContext.tsx) |
| **Mera: One Passkey, Many Keys** | Bounty | 1 hardware passkey PRF output deterministically derives 3 keys: Key 1 Vault Account, Key 2 Session Curation Signer, Key 3 Ed25519 Identity. | [`src/utils/mera.ts`](src/utils/mera.ts), [`src/components/PasskeyAuthModal.tsx`](src/components/PasskeyAuthModal.tsx) |

---

## 3. Mathematical & Economic Architecture

### 3.1 The 40 / 45 / 15 Atomic Boost Disbursement Engine
Every boost transaction deposited into `SignalMarket.sol::boostPost(uint256 postId)` executes an atomic onchain disbursement:

$$\text{Deposit} = \Delta B$$

1. **Author Royalty ($40\%$):**
   $$\text{Payout}_{\text{author}} = 0.40 \times \Delta B$$
   Transferred immediately via native call to `post.poster`.

2. **Downstream Curator Dividend ($45\%$):**
   $$\text{Pool}_{\text{curators}} = 0.45 \times \Delta B$$
   If no previous curators exist (Genesis Boost), this 45% is added directly to `post.poolReserve`. When previous curators exist, the payout is partitioned proportionally to their effective weight:
   $$\text{Payout}_i = \text{Pool}_{\text{curators}} \times \frac{w_i}{\sum_{k=1}^m w_k}$$

3. **Pool Liquidity Reserve ($15\%$):**
   $$\Delta \text{Reserve} = 0.15 \times \Delta B$$
   Retained within contract custody to maintain solvency and post liquidity backing.

```
       [ Curate Boost: ΔB ]
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
40% Author  45% Curators  15% Reserve
(Instant)   (Pro-Rata)    (Contract)
```

### 3.2 Exponential Time-Decay Physics
Signal weight decays continuously according to an exponential half-life model:

$$W(t) = W_0 \cdot 2^{-\frac{\Delta t}{T_{\text{half}}}}$$

- **Default Protocol Half-Life ($T_{\text{half}}$):** $6.0\text{ hours}$ ($21,600\text{ seconds}$).
- **Continuous Decay Function in Fixed-Point Math:**
  Implemented in Solidity via power-of-two approximations and in TypeScript via precision math:
  $$k = \frac{\ln(2)}{21600} \approx 0.0000320898\text{ s}^{-1}$$
  $$W(t) = W_{\text{initial}} \cdot e^{-k \cdot \Delta t}$$

### 3.3 Dynamic Radar Velocity & Re-Ranking
Feeds are ordered dynamically by **Decayed Effective Weight ($W_{\text{decayed}}$)** and **Velocity Score ($V$)**:

$$V = \frac{\text{Total Boost Volume (MON)}}{\text{Elapsed Time (Hours)} + 1}$$

$$\text{Radar Score} = W_{\text{decayed}} \times (1 + \alpha \cdot \log_{10}(V + 1))$$

This ensures that early high-velocity embers surge to the top of radar screens, while older inactive posts steadily fade off the instrument cluster.

### 3.4 Game-Theoretic Anti-Gaming Defenses
To prevent plutocratic wash-trading and self-curation loops:
1. **Strict Self-Boost Rejection:**
   ```solidity
   require(msg.sender != post.poster, "SignalMarket: cannot boost own post");
   ```
   Authors are strictly barred from curating their own creations.

2. **Diminishing Returns Multiplier on Repeat Curators:**
   When wallet $A$ boosts the same post multiple times, the effective weight added scales down deterministically:
   $$M(n) = \frac{10000}{10000 + 5000 \cdot n}$$
   - Boost 1 ($n=0$): Multiplier = $100\%$ ($1.0\times$)
   - Boost 2 ($n=1$): Multiplier = $66.7\%$ ($0.667\times$)
   - Boost 3 ($n=2$): Multiplier = $50.0\%$ ($0.5\times$)
   - Boost 4 ($n=3$): Multiplier = $40.0\%$ ($0.4\times$)

---

## 4. System Architecture & Technical Specifications

```
                       ┌──────────────────────────────────────────────┐
                       │           EMBER.RUN MISSION CONTROL          │
                       │    Meridian Skeuomorphism (React 19/Vite)    │
                       └───────┬──────────────┬──────────────┬────────┘
                               │              │              │
                ┌──────────────┘              │              └──────────────┐
                ▼                             ▼                             ▼
   ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
   │    Category Labs Mera   │   │       Privy Auth        │   │    Alchemy Monad RPC    │
   │  "One Passkey, Many"    │   │  Social Auth & Embedded │   │  Sub-50ms Routing &     │
   │  PRF Derives 3 Keys     │   │  Monad Testnet Wallets  │   │  Parallel Gas Simulator │
   └────────────┬────────────┘   └────────────┬────────────┘   └────────────┬────────────┘
                │                             │                             │
                └──────────────────────┬──────┴─────────────────────────────┘
                                       │
                                       ▼
                       ┌──────────────────────────────────────────────┐
                       │          MONAD PARALLEL EVM TESTNET          │
                       │   Chain ID: 10143 | 10,000 TPS | 1s Finality │
                       │    Contract: 0xC0121c2D11...19F1c4b8         │
                       └───────┬──────────────────────────────┬───────┘
                               │                              │
                               ▼                              ▼
                 ┌───────────────────────────┐  ┌───────────────────────────┐
                 │    SignalMarket Engine    │  │     Envio HyperIndex      │
                 │ 40/45/15 Payout Splits    │  │ Sub-second Event Stream   │
                 │ Exponential Time Decay    │  │ Live GraphQL Telemetry    │
                 └───────────────────────────┘  └───────────────────────────┘
```

### 4.1 Onchain Smart Contract Specifications (`SignalMarket.sol`)
- **Solidity Version:** `^0.8.20`
- **Security Pragma:** `ReentrancyGuard`, custom error definitions (`ZeroDeposit`, `InvalidPost`, `SelfBoostBlocked`).
- **Core State Storage:**
  - `struct Post`: Author address, content string, total boosted (in wei), pool reserve, curator count, cumulative effective weight, creation timestamp.
  - `struct Booster`: Wallet address, boost count, total contributed wei, effective weight, first boost timestamp.
  - `mapping(uint256 => Booster[]) internal _postCurators`: Ordered array of active curators.
  - `mapping(uint256 => mapping(address => uint256)) internal _curatorBoostCount`: Tracks repeat boost counts for diminishing multiplier calculations.

### 4.2 Category Labs Mera Integration ("One Passkey, Many Keys")
Implemented in [`src/utils/mera.ts`](src/utils/mera.ts) using `@category-labs/mera` (`0.2.0`):
- **WebAuthn PRF Extension:** Hardware authenticator (Touch ID, Face ID, Windows Hello) generates high-entropy PRF output.
- **Deterministic Multi-Key Derivation:**
  1. **Key 1 (Vault Account):**
     $$\text{Seed}_1 = \text{keccak256}(\text{PRF} \parallel \text{"ember-monad-vault-v1"})$$
     Derives the primary EVM holding address for testnet funds and author royalty withdrawals.
  2. **Key 2 (Session Curation Signer):**
     $$\text{Seed}_2 = \text{keccak256}(\text{PRF} \parallel \text{"ember-session-curator-v1"})$$
     Derives an ephemeral secp256k1 signing session authorizing sub-50ms instant micro-boosts with zero browser popups.
  3. **Key 3 (Decentralized Identity):**
     $$\text{Seed}_3 = \text{keccak256}(\text{PRF} \parallel \text{"ember-ed25519-identity-v1"})$$
     Derives an Ed25519 identity key for cross-chain reputation proofs and decentralized messaging.

### 4.3 Privy Social Authentication & Embedded Wallets
Implemented in [`src/providers/PrivyAuthProvider.tsx`](src/providers/PrivyAuthProvider.tsx) using `@privy-io/react-auth` (`3.49.0`):
- **Supported Login Methods:** Email, Twitter/X, Google, Discord, GitHub, and EVM External Wallets.
- **Embedded Wallet Provisioning:** Automatically provisions an embedded Monad Testnet EVM wallet (`Chain ID 10143`) on login.
- **Auto Pre-Funding:** Initialized accounts receive testnet liquidity allocations for immediate testing.

### 4.4 Alchemy High-Throughput Infrastructure Service
Implemented in [`src/services/alchemy.ts`](src/services/alchemy.ts):
- **RPC Routing:** Directs JSON-RPC requests through Alchemy's high-performance Monad Testnet infrastructure.
- **Failover Cluster:** Automatically fails over to standard Monad testnet RPC (`https://testnet-rpc.monad.xyz`) in case of network latency degradation.
- **Burst Gas Simulation:** Simulates parallel bursts of 100 to 10,000 curation transactions, calculating gas consumption and verifying throughput capacity.

### 4.5 Envio HyperIndex Sub-Second Indexing Pipeline
Configured in [`indexer/config.yaml`](indexer/config.yaml) and [`indexer/schema.graphql`](indexer/schema.graphql):
- **Indexed Contract:** `0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`
- **Indexed Events:** `PostCreated`, `PostBoosted`, `PayoutDisbursed`.
- **GraphQL Schema Entities:**
  - `Post`: id, poster, content, totalBoosted, poolReserve, curatorCount, totalWeight, payouts.
  - `Curator`: id, address, totalBoosts, totalEarnings, effectiveWeight.
  - `Payout`: id, postId, recipient, amount, role, timestamp.
- **Client Explorer:** Interactive GraphQL query runner mounted in [`src/components/EnvioTelemetryModal.tsx`](src/components/EnvioTelemetryModal.tsx).

---

## 5. UI/UX Design System: Meridian Instrument Skeuomorphism

Ember.run rejects generic flat minimalist design in favor of **Meridian Instrument-Panel Skeuomorphism (v4.0.0)**:
1. **Tactile Hardware Components:**
   - 3D physical panel bevels, CNC-machined framing, and corner rivets (`sk-rivet`).
   - Phosphor indicator lamps (`sk-lamp-green`, `sk-lamp-amber`, `sk-lamp-red`) indicating real-time consensus health.
   - Recessed sensor wells (`sk-well`) with inner shadow depths.
2. **Three.js 60 FPS Cathode Session Workstation:**
   - Mounted in [`src/components/CathodeWorkstation3D.tsx`](src/components/CathodeWorkstation3D.tsx).
   - Real-time 3D isometric CRT monitor with CRT phosphor scanlines, chromatic aberration, and particle physics.
3. **Analog Mechanical Decay Gauge:**
   - Mounted in [`src/components/AnalogDecayGauge.tsx`](src/components/AnalogDecayGauge.tsx).
   - SVG needle dial with logarithmic calibration displaying remaining half-life percentage and velocity scores.
4. **Physical Web Audio Synthesis Engine:**
   - Implemented in [`src/utils/sound.ts`](src/utils/sound.ts) using the Web Audio API.
   - Synthesizes mechanical switch clicks, disbursement chimes, and tactile alerts without static MP3 dependencies.

---

## 6. Functional Module Specifications

### 6.1 Mission Control Header Console (`HeaderConsole.tsx`)
- **Brand & Chain Status:** Displays Ember logo, network badge (`MONAD : 10143`), and live contract link.
- **Telemetry Indicators:**
  - **`ENVIO : LIVE ↗`**: Opens Envio GraphQL query modal.
  - **`ALCHEMY : <ms>ms ↗`**: Opens Alchemy RPC telemetry and gas simulation modal.
  - **`COMMUNITY`**: Opens the open governance and contributor guidelines modal.
- **Wallet Controls:** Faucet top-up button (`+5.0 MON`), Web3 wallet connect (MetaMask/Rabby), and Passkey Account Switcher.

### 6.2 Discovery Feed Radar (`FeedRadar.tsx` & `PostCard.tsx`)
- Displays live embers ordered dynamically by current decayed weight.
- Real-time ticker shows author, creation timestamp, decaying weight badge, and current curator count.
- Action triggers: Boost Ember, Inspect Onchain Details, and View Taste Arbitrage breakdown.

### 6.3 Post Dispatch Composer (`PostComposer.tsx`)
- Form inputs: Title, Body, Curation Tags, Reference URL.
- On submit: Dispatches `createPost` transaction to Monad Testnet and logs deployment to the real-time audit ledger.

### 6.4 Atomic Boost Modal (`BoostModal.tsx`)
- Live preview of the 40 / 45 / 15 distribution:
  - 40% Author Royalty calculation.
  - 45% Downstream Curator breakdown showing individual estimated payouts per curator.
  - 15% Reserve contribution.
  - Diminishing returns multiplier indicator if the curator has boosted previously.

### 6.5 Real-Time Audit Ledger (`AuditLedger.tsx`)
- Transparent transaction explorer displaying verified Monad Testnet transactions:
  - Contract deployment transaction.
  - Genesis boost transactions.
  - Payout disbursement records with role attribution (`POSTER`, `CURATOR`, `RESERVE`).

### 6.6 Guided 30-Second Demo Engine (`DemoSequenceModal.tsx`)
- Automated simulation runner that executes the end-to-end user journey in 30 seconds:
  1. Author dispatches post.
  2. First curator stakes 2.0 MON (40% author cut).
  3. Continuous decay curve recalculation.
  4. Second curator stakes 3.0 MON (earlier curator receives 45% cut).
  5. Anti-gaming enforcement: Self-boost rejected; repeat boost diminished.

---

## 7. Security, Verification & Testing Matrix

### 7.1 Automated Smart Contract Test Suite (`SignalMarket.test.js`)
All 7 unit and integration tests execute cleanly via Hardhat:

```
  SignalMarket — Time-Decaying Curation Market
    01 / Post Creation
      ✔ Should create a post and record metadata onchain
      ✔ Should reject empty post content
    02 / Boost & Atomic Payout Distribution
      ✔ Boundary Condition: First boost atomically distributes 40% to poster, retains 60% in reserve
      ✔ Cascading Curator Payouts: Curator 1 receives instant cut when Curator 2 boosts
    03 / Anti-Gaming Enforcement
      ✔ Anti-Gaming Rule 1: Self-boosting is rejected by the contract
      ✔ Anti-Gaming Rule 2: Diminishing returns penalize repeat boosts from the same wallet
    04 / Time Decay Functionality
      ✔ Calculates exponential weight decay accurately over elapsed half-lives (47ms)

  7 passing (800ms)
```

### 7.2 Security Boundaries
- **Reentrancy Protection:** All external balance transfers in `boostPost` use checks-effects-interactions and OpenZeppelin-standard reentrancy protection.
- **Integer Precision:** Fixed-point math utilizes high-precision scaling factors ($10^{18}$) to prevent roundoff truncation in fractional curator cuts.
- **Fail-Safe Fallbacks:**
  - If WebAuthn PRF is unsupported on older browsers, the system gracefully falls back to standard WebAuthn credentials.
  - If Alchemy RPC key encounters rate-limiting, the system automatically routes to public Monad nodes without client crashes.

---

## 8. Deployment & Operational Specifications

### 8.1 Network Parameters
| Parameter | Value |
| :--- | :--- |
| **Network Name** | Monad Testnet |
| **Chain ID** | `10143` (`0x279f`) |
| **RPC Endpoint (Alchemy)** | `https://monad-testnet.g.alchemy.com/v2/...` |
| **RPC Endpoint (Public)** | `https://testnet-rpc.monad.xyz` |
| **Block Explorer** | `https://testnet.monadexplorer.com` |
| **Currency Symbol** | `MON` (18 Decimals) |
| **Block Time** | ~1 second single-slot finality |
| **Target Throughput** | Up to 10,000 TPS |

### 8.2 Verified Onchain Contracts
- **SignalMarket Core Contract:** [`0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8`](https://testnet.monadexplorer.com/address/0xC0121c2D11f181B8786eCf747d579b2d19F1c4b8)
- **Deployment Transaction:** [`0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7`](https://testnet.monadexplorer.com/tx/0x121c513ec84fdb1e6ff3506e9678d7b142777b57e07539907f573670df3418e7)
- **Genesis Boost Transaction:** [`0xf313317940a3daa69e1eadbd9b42ad66cdb7cf6cd3bf4cddbaa8b2a90d949a90`](https://testnet.monadexplorer.com/tx/0xf313317940a3daa69e1eadbd9b42ad66cdb7cf6cd3bf4cddbaa8b2a90d949a90)

---

## 9. Future Roadmap: Path to Monad Mainnet

1. **Stage 1 — Hackathon & Testnet Validation (Completed):**
   - Live smart contract deployment on Monad Testnet.
   - Full integration of Envio, Alchemy, Privy, Category Labs Mera, and Community Governance.
   - Comprehensive test suite and skeuomorphic UI console.

2. **Stage 2 — Mainnet Hardening & Formal Verification:**
   - Formal audit of `SignalMarket.sol` by independent smart contract auditors.
   - Dynamic parameter governance: DAO voting on half-life durations ($T_{\text{half}}$) tailored to specific content categories (e.g., breaking news: 1h half-life; long-form essays: 24h half-life).

3. **Stage 3 — Ecosystem Expansion:**
   - Farcaster and Lens protocol integration: Curate existing decentralized social graphs via Ember boost contracts.
   - Mobile PWA application with background push notifications for curator payout disbursements.
