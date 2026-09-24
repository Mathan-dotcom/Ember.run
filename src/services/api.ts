/**
 * Frontend client service for Ember.run Offchain Backend API
 */

const API_BASE = 'http://localhost:3001/api';

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  monadTestnet: {
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
    rpcHealthy: boolean;
    latencyMs: string;
  };
}

export interface CuratorProfileData {
  address: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  bookmarks: number[];
  reputationScore: number;
  totalEarningsMon: number;
  joinedAt: number;
}

export interface PostDraftData {
  id: string;
  authorAddress: string;
  title: string;
  body: string;
  tags: string[];
  linkUrl?: string;
  createdAt: number;
}

export const backendApi = {
  /**
   * Check backend server & Monad RPC health
   */
  async checkHealth(): Promise<BackendHealth | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Get curator profile by address
   */
  async getProfile(address: string): Promise<CuratorProfileData | null> {
    try {
      const res = await fetch(`${API_BASE}/curators/${address}/profile`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Update curator profile
   */
  async updateProfile(address: string, updates: Partial<CuratorProfileData>): Promise<CuratorProfileData | null> {
    try {
      const res = await fetch(`${API_BASE}/curators/${address}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.profile;
    } catch {
      return null;
    }
  },

  /**
   * Toggle bookmark
   */
  async toggleBookmark(address: string, postId: number): Promise<number[] | null> {
    try {
      const res = await fetch(`${API_BASE}/curators/${address}/bookmarks/${postId}`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.bookmarks;
    } catch {
      return null;
    }
  },

  /**
   * List drafts for an author
   */
  async getDrafts(authorAddress?: string): Promise<PostDraftData[]> {
    try {
      const url = authorAddress ? `${API_BASE}/drafts?author=${authorAddress}` : `${API_BASE}/drafts`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return [];
      const data = await res.json();
      return data.drafts || [];
    } catch {
      return [];
    }
  },

  /**
   * Save draft
   */
  async saveDraft(draft: Omit<PostDraftData, 'id' | 'createdAt'>): Promise<PostDraftData | null> {
    try {
      const res = await fetch(`${API_BASE}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.draft;
    } catch {
      return null;
    }
  },

  /**
   * Delete draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/drafts/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get protocol analytics summary
   */
  async getAnalytics(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/analytics/protocol`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};
