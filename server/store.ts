import fs from 'fs';
import path from 'path';

export interface CuratorProfile {
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

export interface PostDraft {
  id: string;
  authorAddress: string;
  title: string;
  body: string;
  tags: string[];
  linkUrl?: string;
  createdAt: number;
}

const DATA_FILE = path.join(process.cwd(), 'server', 'data_store.json');

// Initial seed data for authentic testnet accounts
const INITIAL_PROFILES: Record<string, CuratorProfile> = {
  '0xa9c97e3d0f95be9fc990b3686997ec346d96833e': {
    address: '0xa9c97E3D0f95be9Fc990B3686997eC346D96833e',
    name: 'Ember.run Devlog',
    handle: '@ember_core',
    bio: 'Core architecture and technical release notes for Ember.run on Monad Metropolis.',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bookmarks: [1, 2],
    reputationScore: 98,
    totalEarningsMon: 0.00,
    joinedAt: 1774000000
  }
};

class BackendStore {
  private profiles: Record<string, CuratorProfile> = { ...INITIAL_PROFILES };
  private drafts: PostDraft[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.profiles) this.profiles = { ...INITIAL_PROFILES, ...parsed.profiles };
        if (parsed.drafts) this.drafts = parsed.drafts;
      }
    } catch (err) {
      console.warn('[BackendStore] Using initial in-memory state:', err);
    }
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({ profiles: this.profiles, drafts: this.drafts }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[BackendStore] Failed to persist data to disk:', err);
    }
  }

  public getProfile(address: string): CuratorProfile | null {
    const key = address.toLowerCase();
    return this.profiles[key] || null;
  }

  public updateProfile(address: string, updates: Partial<CuratorProfile>): CuratorProfile {
    const key = address.toLowerCase();
    const existing = this.profiles[key] || {
      address,
      name: `Curator ${address.slice(0, 6)}`,
      handle: `@curator_${address.slice(2, 6).toLowerCase()}`,
      bio: 'Onchain taste curator on Monad Testnet.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bookmarks: [],
      reputationScore: 50,
      totalEarningsMon: 0,
      joinedAt: Math.floor(Date.now() / 1000)
    };

    const updated = { ...existing, ...updates, address };
    this.profiles[key] = updated;
    this.saveToDisk();
    return updated;
  }

  public listProfiles(): CuratorProfile[] {
    return Object.values(this.profiles).sort((a, b) => b.totalEarningsMon - a.totalEarningsMon);
  }

  public saveDraft(draft: Omit<PostDraft, 'id' | 'createdAt'>): PostDraft {
    const newDraft: PostDraft = {
      ...draft,
      id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Math.floor(Date.now() / 1000)
    };
    this.drafts.unshift(newDraft);
    this.saveToDisk();
    return newDraft;
  }

  public listDrafts(authorAddress?: string): PostDraft[] {
    if (!authorAddress) return this.drafts;
    const authorKey = authorAddress.toLowerCase();
    return this.drafts.filter((d) => d.authorAddress.toLowerCase() === authorKey);
  }

  public deleteDraft(id: string): boolean {
    const initialLen = this.drafts.length;
    this.drafts = this.drafts.filter((d) => d.id !== id);
    if (this.drafts.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const store = new BackendStore();
