# Contributing to Ember.run

Thank you for your interest in contributing to **Ember.run** — built for **Monad Metropolis (Track 03: Social, Attention & Culture)**!

Ember.run turns content curation into a provable, onchain financial asset class. We welcome community builders, smart contract auditors, frontend engineers, and taste arbitrageurs.

---

## 🏛️ Community Vision & Governance

In Web2 social media, user attention is monetized through opaque black-box ad algorithms. Ember.run returns sovereign power to the community:
1. **Decentralized Attention Discovery:** The community collectively decides what surfaces to the top of the feed through real capital conviction.
2. **Fair Curator Splits:** Curators receive an instant, atomic 45% cut when newer curators boost the same ember downstream.
3. **Open Participation:** Anyone can run an Envio HyperIndex node, deploy curation analytics, or contribute client features.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **MetaMask / EVM Wallet:** Configured for Monad Testnet (`Chain ID: 10143`)
- **Docker:** (Optional, for running local Envio HyperIndex)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Smart Contract Tests
Ensure all Hardhat tests pass before opening a Pull Request:
```bash
npm test
```
All 7 unit tests must pass green:
- Post creation & onchain metadata verification
- Boundary conditions for genesis boost
- Cascading atomic 40/45/15 payouts
- Anti-gaming self-boost reverts
- Anti-gaming diminishing returns multipliers
- Continuous 6-hour exponential half-life decay calculation

### 4. Run Development Console
```bash
npm run dev
```
Navigate to `http://localhost:5173/`.

### 5. Run Envio HyperIndex (Optional)
```bash
cd indexer
envio dev
```

---

## 📜 Code Style & Architecture Guidelines

- **Smart Contracts:** Solidity `^0.8.24` targeting Monad's Parallel EVM. All financial math must use basis points (`BPS_DENOMINATOR = 10000`) and safe atomic transfer patterns (`.call{value: ...}("")`).
- **Design System:** Meridian Instrument-Panel Skeuomorphism (v4.0.0). Follow [`STYLEGUIDE-Skeuomorphism.md`](./STYLEGUIDE-Skeuomorphism.md).
- **Authentication:** Must support both native Web3 (MetaMask/EVM) and zero-seed-phrase Passkeys via **Mera** (`@category-labs/mera`) and **Privy**.

---

## 🤝 How to Submit a Contribution

1. Fork the repository on GitHub: [`https://github.com/Mathan-dotcom/Ember.run`](https://github.com/Mathan-dotcom/Ember.run)
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes with clear semantic commit messages: `git commit -m "feat(ui): add new curation radar widget"`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request against `main`.

---

## 💬 Community Channels
- **GitHub Discussions / Issues:** [Mathan-dotcom/Ember.run/issues](https://github.com/Mathan-dotcom/Ember.run/issues)
- **Monad Metropolis Track:** Track 03 — Social, Attention & Culture
- **Monad Discord:** `#monad-metropolis`
