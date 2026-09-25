/**
 * Envio HyperIndex GraphQL Client for Ember.run on Monad Testnet
 * Sub-second parallel event indexing from Monad's parallel EVM
 */

const INDEXER_ENDPOINT = 'http://localhost:8080/v1/graphql';

export interface IndexerPost {
  id: string;
  postId: string;
  poster: string;
  content: string;
  createdAt: string;
  totalBoosted: string;
  poolReserve: string;
  curatorCount: string;
  totalWeight: string;
  payouts?: {
    recipient: string;
    amount: string;
    role: string;
    timestamp: string;
  }[];
}

export interface IndexerCurator {
  id: string;
  address: string;
  totalBoosts: string;
  totalEarnings: string;
  effectiveWeight: string;
}

export const indexerService = {
  /**
   * Probe HyperIndex GraphQL status
   */
  async checkStatus(): Promise<boolean> {
    try {
      const res = await fetch(INDEXER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ __typename }'
        }),
        signal: AbortSignal.timeout(1500)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch live indexed posts from Envio HyperIndex
   */
  async getPosts(): Promise<IndexerPost[] | null> {
    const query = `
      query GetEmberFeed {
        Post(order_by: { totalWeight: desc }, limit: 20) {
          id
          postId
          poster
          content
          createdAt
          totalBoosted
          poolReserve
          curatorCount
          totalWeight
          payouts(limit: 5, order_by: { timestamp: desc }) {
            recipient
            amount
            role
            timestamp
          }
        }
      }
    `;

    try {
      const res = await fetch(INDEXER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.Post || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch top curators from Envio HyperIndex
   */
  async getCurators(): Promise<IndexerCurator[] | null> {
    const query = `
      query TopCurators {
        Curator(order_by: { totalEarnings: desc }, limit: 10) {
          id
          address
          totalBoosts
          totalEarnings
          effectiveWeight
        }
      }
    `;

    try {
      const res = await fetch(INDEXER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.Curator || null;
    } catch {
      return null;
    }
  }
};
