# Ember.run — Envio HyperIndex (Monad Testnet)

This directory contains the **Envio HyperIndex** configuration for **Ember.run**.

HyperIndex provides sub-second indexing of onchain curation events directly from Monad's Parallel EVM, exposing a blazing fast GraphQL API for leaderboards, historical curation curves, and fee disbursements without hitting RPC rate limits.

---

## ⚡ Architecture

- **Network:** Monad Testnet (`10143`)
- **RPC:** `https://testnet-rpc.monad.xyz`
- **Contract Indexed:** `SignalMarket.sol` (`0x7e8C545E5b4c483d47C88dE2d24296615bB4278F`)
- **Indexed Events:**
  - `PostCreated`
  - `Boosted`
  - `PayoutDistributed`
  - `AntiGamingDiminishingReturn`

---

## 🚀 Running HyperIndex Locally

### 1. Prerequisites
- Docker & Docker Compose
- Node.js >= 18
- Envio CLI: `npm install -g envio`

### 2. Generate Code & Start Indexer
```bash
cd indexer
envio dev
```

Once running, the GraphQL playground is available at:
`http://localhost:8080/v1/graphql`

---

## 🔍 Sample GraphQL Queries

### Query Live Feed Ranked by Total Weight
```graphql
query GetEmberFeed {
  Post(order_by: { totalWeight: desc }, limit: 20) {
    id
    poster
    content
    totalBoosted
    poolReserve
    curatorCount
    totalWeight
    payouts(limit: 5, order_by: { timestamp: desc }) {
      recipient
      amount
      role
    }
  }
}
```

### Query Top Curators by Payout Earnings
```graphql
query TopCurators {
  Curator(order_by: { totalEarnings: desc }, limit: 10) {
    id
    address
    totalBoosts
    totalEarnings
    effectiveWeight
  }
}
```
