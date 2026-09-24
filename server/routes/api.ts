import { Router, Request, Response } from 'express';
import { store } from '../store';
import { MONAD_TESTNET_CONFIG } from '../../src/contracts/config';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', async (_req: Request, res: Response) => {
  let rpcHealthy = false;
  let latencyMs = 0;

  try {
    const start = Date.now();
    const rpcRes = await fetch(MONAD_TESTNET_CONFIG.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(3000)
    });
    latencyMs = Date.now() - start;
    if (rpcRes.ok) {
      rpcHealthy = true;
    }
  } catch (_e) {
    rpcHealthy = false;
  }

  res.json({
    status: 'ONLINE',
    service: 'Ember.run Offchain Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    monadTestnet: {
      chainId: MONAD_TESTNET_CONFIG.chainId,
      rpcUrl: MONAD_TESTNET_CONFIG.rpcUrl,
      contractAddress: MONAD_TESTNET_CONFIG.contractAddress,
      rpcHealthy,
      latencyMs: rpcHealthy ? `${latencyMs}ms` : 'TIMEOUT'
    }
  });
});

// Curator profile endpoint
apiRouter.get('/curators/:address/profile', (req: Request, res: Response) => {
  const { address } = req.params;
  const profile = store.getProfile(address);
  if (!profile) {
    return res.status(404).json({ error: 'Curator profile not found' });
  }
  return res.json(profile);
});

apiRouter.put('/curators/:address/profile', (req: Request, res: Response) => {
  const { address } = req.params;
  const { name, handle, bio, avatarUrl } = req.body;
  const updated = store.updateProfile(address, {
    name,
    handle,
    bio,
    avatarUrl
  });
  return res.json({ success: true, profile: updated });
});

// Curator bookmarks
apiRouter.post('/curators/:address/bookmarks/:postId', (req: Request, res: Response) => {
  const { address, postId } = req.params;
  const pId = parseInt(postId, 10);
  const profile = store.getProfile(address);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const existing = profile.bookmarks || [];
  const nextBookmarks = existing.includes(pId)
    ? existing.filter((id) => id !== pId)
    : [...existing, pId];

  const updated = store.updateProfile(address, { bookmarks: nextBookmarks });
  return res.json({ success: true, bookmarks: updated.bookmarks });
});

// Curator leaderboard
apiRouter.get('/curators/leaderboard', (_req: Request, res: Response) => {
  const profiles = store.listProfiles();
  return res.json({
    count: profiles.length,
    leaderboard: profiles.map((p, idx) => ({
      rank: idx + 1,
      address: p.address,
      name: p.name,
      handle: p.handle,
      avatarUrl: p.avatarUrl,
      reputationScore: p.reputationScore,
      totalEarningsMon: p.totalEarningsMon
    }))
  });
});

// Post Drafts (Offchain pre-dispatch staging)
apiRouter.get('/drafts', (req: Request, res: Response) => {
  const author = req.query.author as string | undefined;
  const drafts = store.listDrafts(author);
  return res.json({ drafts });
});

apiRouter.post('/drafts', (req: Request, res: Response) => {
  const { authorAddress, title, body, tags, linkUrl } = req.body;
  if (!authorAddress || !title || !body) {
    return res.status(400).json({ error: 'authorAddress, title, and body are required' });
  }
  const draft = store.saveDraft({
    authorAddress,
    title,
    body,
    tags: tags || [],
    linkUrl
  });
  return res.json({ success: true, draft });
});

apiRouter.delete('/drafts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = store.deleteDraft(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Draft not found' });
  }
  return res.json({ success: true });
});

// Protocol Analytics Summary
apiRouter.get('/analytics/protocol', (_req: Request, res: Response) => {
  const profiles = store.listProfiles();
  const totalCuratorEarnings = profiles.reduce((sum, p) => sum + p.totalEarningsMon, 0);

  return res.json({
    chain: 'Monad Testnet (10143)',
    splitRatios: {
      posterCutPercent: 40,
      curatorCutPercent: 45,
      poolReservePercent: 15
    },
    decayHalfLifeHours: 6,
    sybilProtection: {
      selfBoostProhibited: true,
      diminishingReturnFormula: '10000 / (10000 + 5000 * n)'
    },
    metrics: {
      activeCurators: profiles.length,
      estimatedTotalCuratorDisbursedMon: totalCuratorEarnings,
      networkStatus: 'OPERATIONAL',
      executionLatencyTarget: '< 1000ms'
    }
  });
});
