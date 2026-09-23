# Ember.run — A Time-Decaying Curation Market
> **Built for Monad Metropolis — Track 03: Social, Attention & Culture**  
> **Design Direction:** Meridian Instrument-Panel Skeuomorphism (v4.0.0)

Ember.run turns content curation into a provable, onchain financial asset class. Boosting an ember costs real **MON** on Monad Testnet. Boost weight decays continuously over time, and earlier curators automatically earn an instant 45% cut when an ember gets boosted again later.

---

## 🎛️ Network & Smart Contract Specifications

- **Target Network:** Monad Testnet
- **Chain ID:** `10143` (`0x279f`)
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Native Currency:** `MON` (18 decimals)
- **Explorer:** `https://testnet.monadexplorer.com`
- **Contract:** [`contracts/SignalMarket.sol`](file:///d:/Mathan%20Files/Projects/Ember.run/contracts/SignalMarket.sol)

### Core Mechanics:
1. **Atomic Payout Split (40 / 45 / 15):**
   - **40%** to the original author.
   - **45%** distributed atomically across earlier curators in proportion to their effective decayed weight.
   - **15%** retained in the post's pool reserve.
2. **Time-Decay Half-Life Curve:**
   - Boost weight decays continuously: $W(t) = W_0 \cdot 2^{-\Delta t / T_{half}}$ (6-hour half-life).
   - Feed is ranked dynamically by current decayed weight, not raw likes or total volume.
3. **Anti-Gaming Protections:**
   - **Self-Boost Rejection:** `require(msg.sender != post.poster)` reverts immediately onchain.
   - **Diminishing Returns Multiplier:** Subsequent boosts from the same wallet on the same post scale down effective curation weight ($\frac{10000}{10000 + 5000 \cdot n}$), blunting wash-curation via alt accounts.
4. **Passkey Embedded Auth (Privy / Mera Spec):**
   - Biometric sign-up (Touch ID, Face ID, Windows Hello) derives an invisible testnet wallet without seed phrases.

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

### 3. Start Development Console
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

---

## 🎬 30-Second Guided Demo Flow
Click the **"30-SEC DEMO"** button in the header bar and click **"AUTO-RUN ALL (30s)"**:
1. **Post Dispatch:** Author registers post on Monad testnet.
2. **Genesis Boost:** Bob boosts 2.0 MON; 40% (0.8 MON) goes instantly to author.
3. **Live Decay Re-Ranking:** Feed re-ranks live as weight decays.
4. **Cascade Payout:** Carol boosts 3.0 MON; Bob receives instant 45% curator cut.
5. **Anti-Gaming Defense:** Author attempt to self-boost reverts onchain; diminishing returns scale Bob's repeat boosts.
