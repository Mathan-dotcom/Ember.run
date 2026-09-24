// Envio HyperIndex Event Handlers for Ember.run (SignalMarket on Monad Testnet)

export interface HandlerContext {
  Post: any;
  Curator: any;
  Boost: any;
  Payout: any;
  AntiGamingLog: any;
  ProtocolStats: any;
  log: any;
}

export const STATS_SINGLETON_ID = "protocol-stats";

/**
 * Handle PostCreated event
 */
export async function handlePostCreated({ event, context }: { event: any; context: HandlerContext }) {
  const { postId, poster, content, createdAt } = event.params;

  const postEntity = {
    id: postId.toString(),
    postId: BigInt(postId.toString()),
    poster: poster.toLowerCase(),
    content: content,
    createdAt: BigInt(createdAt.toString()),
    totalBoosted: 0n,
    poolReserve: 0n,
    curatorCount: 0n,
    totalWeight: 0n
  };

  context.Post.set(postEntity);

  // Update Protocol Stats
  let stats = await context.ProtocolStats.get(STATS_SINGLETON_ID);
  if (!stats) {
    stats = {
      id: STATS_SINGLETON_ID,
      totalPosts: 1n,
      totalVolumeBoosted: 0n,
      totalDistributedPoster: 0n,
      totalDistributedCurator: 0n,
      totalPoolReserves: 0n
    };
  } else {
    stats.totalPosts = stats.totalPosts + 1n;
  }
  context.ProtocolStats.set(stats);
}

/**
 * Handle Boosted event
 */
export async function handleBoosted({ event, context }: { event: any; context: HandlerContext }) {
  const { postId, booster, amount, effectiveWeightAdded, boostNumber, timestamp } = event.params;
  const boosterAddr = booster.toLowerCase();
  const postIdStr = postId.toString();

  // 1. Fetch or create Curator entity
  let curator = await context.Curator.get(boosterAddr);
  if (!curator) {
    curator = {
      id: boosterAddr,
      address: boosterAddr,
      totalBoosts: 1n,
      totalContributed: BigInt(amount.toString()),
      totalEarnings: 0n,
      effectiveWeight: BigInt(effectiveWeightAdded.toString()),
      firstBoostTime: BigInt(timestamp.toString()),
      lastBoostTime: BigInt(timestamp.toString())
    };
  } else {
    curator.totalBoosts = curator.totalBoosts + 1n;
    curator.totalContributed = curator.totalContributed + BigInt(amount.toString());
    curator.effectiveWeight = curator.effectiveWeight + BigInt(effectiveWeightAdded.toString());
    curator.lastBoostTime = BigInt(timestamp.toString());
  }
  context.Curator.set(curator);

  // 2. Update Post entity
  const post = await context.Post.get(postIdStr);
  if (post) {
    post.totalBoosted = post.totalBoosted + BigInt(amount.toString());
    post.totalWeight = post.totalWeight + BigInt(effectiveWeightAdded.toString());
    if (boostNumber === 1n || boostNumber === 1) {
      post.curatorCount = post.curatorCount + 1n;
    }
    context.Post.set(post);
  }

  // 3. Record Boost Event
  const boostId = `${event.transactionHash}-${event.logIndex}`;
  context.Boost.set({
    id: boostId,
    post_id: postIdStr,
    booster_id: boosterAddr,
    amount: BigInt(amount.toString()),
    effectiveWeightAdded: BigInt(effectiveWeightAdded.toString()),
    boostNumber: BigInt(boostNumber.toString()),
    timestamp: BigInt(timestamp.toString()),
    txHash: event.transactionHash
  });

  // 4. Update Protocol Stats
  let stats = await context.ProtocolStats.get(STATS_SINGLETON_ID);
  if (stats) {
    stats.totalVolumeBoosted = stats.totalVolumeBoosted + BigInt(amount.toString());
    context.ProtocolStats.set(stats);
  }
}

/**
 * Handle PayoutDistributed event
 */
export async function handlePayoutDistributed({ event, context }: { event: any; context: HandlerContext }) {
  const { postId, recipient, amount, role } = event.params;
  const recipientAddr = recipient.toLowerCase();
  const payoutAmount = BigInt(amount.toString());

  const payoutId = `${event.transactionHash}-${event.logIndex}`;
  context.Payout.set({
    id: payoutId,
    post_id: postId.toString(),
    recipient: recipientAddr,
    amount: payoutAmount,
    role: role,
    timestamp: BigInt(event.blockTimestamp || Math.floor(Date.now() / 1000)),
    txHash: event.transactionHash
  });

  // If role is CURATOR, update curator's total earnings
  if (role === "CURATOR") {
    let curator = await context.Curator.get(recipientAddr);
    if (curator) {
      curator.totalEarnings = curator.totalEarnings + payoutAmount;
      context.Curator.set(curator);
    }
  }

  // Update Protocol Stats
  let stats = await context.ProtocolStats.get(STATS_SINGLETON_ID);
  if (stats) {
    if (role === "POSTER") {
      stats.totalDistributedPoster = stats.totalDistributedPoster + payoutAmount;
    } else if (role === "CURATOR") {
      stats.totalDistributedCurator = stats.totalDistributedCurator + payoutAmount;
    }
    context.ProtocolStats.set(stats);
  }
}

/**
 * Handle AntiGamingDiminishingReturn event
 */
export async function handleAntiGaming({ event, context }: { event: any; context: HandlerContext }) {
  const { postId, booster, boostNumber, effectiveMultiplierBps } = event.params;

  const logId = `${event.transactionHash}-${event.logIndex}`;
  context.AntiGamingLog.set({
    id: logId,
    post_id: postId.toString(),
    booster: booster.toLowerCase(),
    boostNumber: BigInt(boostNumber.toString()),
    multiplierBps: BigInt(effectiveMultiplierBps.toString()),
    timestamp: BigInt(event.blockTimestamp || Math.floor(Date.now() / 1000))
  });
}
