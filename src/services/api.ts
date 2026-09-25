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
      const res = await fetch(`${API_BASE}/curators/${address}/profile`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        try { localStorage.setItem(`ember_profile_${address.toLowerCase()}`, JSON.stringify(data)); } catch {}
        return data;
      }
    } catch {
      // Fallback to local storage
    }
    try {
      const local = localStorage.getItem(`ember_profile_${address.toLowerCase()}`);
      if (local) return JSON.parse(local);
    } catch {}
    return null;
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
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        try { localStorage.setItem(`ember_profile_${address.toLowerCase()}`, JSON.stringify(data.profile)); } catch {}
        return data.profile;
      }
    } catch {}
    try {
      const local = localStorage.getItem(`ember_profile_${address.toLowerCase()}`);
      const existing = local ? JSON.parse(local) : { address, bookmarks: [], reputationScore: 100, totalEarningsMon: 0, joinedAt: Math.floor(Date.now() / 1000) };
      const merged = { ...existing, ...updates };
      localStorage.setItem(`ember_profile_${address.toLowerCase()}`, JSON.stringify(merged));
      return merged;
    } catch {}
    return null;
  },

  /**
   * Toggle bookmark
   */
  async toggleBookmark(address: string, postId: number): Promise<number[] | null> {
    try {
      const res = await fetch(`${API_BASE}/curators/${address}/bookmarks/${postId}`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        try { localStorage.setItem(`ember_bookmarks_${address.toLowerCase()}`, JSON.stringify(data.bookmarks)); } catch {}
        return data.bookmarks;
      }
    } catch {}
    try {
      const local = localStorage.getItem(`ember_bookmarks_${address.toLowerCase()}`);
      let list: number[] = local ? JSON.parse(local) : [];
      if (list.includes(postId)) {
        list = list.filter((id) => id !== postId);
      } else {
        list = [...list, postId];
      }
      localStorage.setItem(`ember_bookmarks_${address.toLowerCase()}`, JSON.stringify(list));
      return list;
    } catch {}
    return null;
  },

  /**
   * List drafts for an author
   */
  async getDrafts(authorAddress?: string): Promise<PostDraftData[]> {
    try {
      const url = authorAddress ? `${API_BASE}/drafts?author=${authorAddress}` : `${API_BASE}/drafts`;
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (authorAddress) {
          try { localStorage.setItem(`ember_drafts_${authorAddress.toLowerCase()}`, JSON.stringify(data.drafts || [])); } catch {}
        }
        return data.drafts || [];
      }
    } catch {}
    if (authorAddress) {
      try {
        const local = localStorage.getItem(`ember_drafts_${authorAddress.toLowerCase()}`);
        if (local) return JSON.parse(local);
      } catch {}
    }
    return [];
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
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return data.draft;
      }
    } catch {}
    try {
      const id = 'draft_' + Date.now();
      const newDraft: PostDraftData = { ...draft, id, createdAt: Math.floor(Date.now() / 1000) };
      const author = draft.authorAddress.toLowerCase();
      const local = localStorage.getItem(`ember_drafts_${author}`);
      const list: PostDraftData[] = local ? JSON.parse(local) : [];
      list.unshift(newDraft);
      localStorage.setItem(`ember_drafts_${author}`, JSON.stringify(list));
      return newDraft;
    } catch {}
    return null;
  },

  /**
   * Delete draft
   */
  async deleteDraft(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/drafts/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return true;
    } catch {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ember_drafts_')) {
          const list: PostDraftData[] = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter((d) => d.id !== id);
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            return true;
          }
        }
      }
    } catch {}
    return false;
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
