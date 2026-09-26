import React, { useState, useEffect } from 'react';
import { Post } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { PostCard } from './PostCard';
import { sound } from '../utils/sound';
import { SlidersHorizontal, Flame, Clock, Coins, RefreshCw, Bookmark } from 'lucide-react';
import { backendApi } from '../services/api';

interface FeedRadarProps {
  onOpenBoost: (post: Post) => void;
  onInspectPost?: (post: Post) => void;
}

export const FeedRadar: React.FC<FeedRadarProps> = ({ onOpenBoost, onInspectPost }) => {
  const { posts, refreshDecayedWeights, currentAccount } = useWallet();
  const [sortMode, setSortMode] = useState<'decay' | 'velocity' | 'capital'>('decay');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  useEffect(() => {
    backendApi.getProfile(currentAccount.address).then((profile) => {
      if (profile && profile.bookmarks) {
        setBookmarkedIds(profile.bookmarks);
      }
    });
  }, [currentAccount.address, onlyBookmarked]);

  const filteredPosts = onlyBookmarked
    ? posts.filter((p) => bookmarkedIds.includes(p.id))
    : posts;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortMode === 'decay') {
      return b.decayedWeight - a.decayedWeight;
    } else if (sortMode === 'velocity') {
      return b.velocityScore - a.velocityScore;
    } else {
      return b.totalBoosted - a.totalBoosted;
    }
  });

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="02" />
          <h2 className="text-heading">CURATION RADAR & FEED</h2>
          <span className="sk-badge" style={{ fontSize: '0.7rem' }}>
            ENVIO INDEXED
          </span>
        </div>

        {/* Sorting Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              sound.playDialTick();
              setSortMode('decay');
            }}
            className={`sk-button ${sortMode === 'decay' ? 'sk-button-primary' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Sorted strictly by Time-Decayed Weight"
          >
            <Clock size={13} />
            <span>DECAY RANK</span>
          </button>

          <button
            onClick={() => {
              sound.playDialTick();
              setSortMode('velocity');
            }}
            className={`sk-button ${sortMode === 'velocity' ? 'sk-button-primary' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Sorted by Boost Velocity (MON / hour)"
          >
            <Flame size={13} color={sortMode === 'velocity' ? '#030712' : '#ffffff'} />
            <span>VELOCITY</span>
          </button>

          <button
            onClick={() => {
              sound.playDialTick();
              setSortMode('capital');
            }}
            className={`sk-button ${sortMode === 'capital' ? 'sk-button-primary' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Sorted by Total MON Boosted"
          >
            <Coins size={13} color={sortMode === 'capital' ? '#030712' : '#ffffff'} />
            <span>TOTAL POOL</span>
          </button>

          <button
            onClick={() => {
              sound.playDialTick();
              setOnlyBookmarked(!onlyBookmarked);
            }}
            className={`sk-button ${onlyBookmarked ? 'sk-button-primary' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Show only bookmarked embers"
          >
            <Bookmark size={13} fill={onlyBookmarked ? '#030712' : 'none'} color={onlyBookmarked ? '#030712' : '#ffffff'} />
            <span>SAVED ({bookmarkedIds.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playDialTick();
              refreshDecayedWeights();
            }}
            className="sk-button"
            style={{ padding: '5px 8px' }}
            title="Refresh decay curve computation"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Live Status Bar */}
      <div
        className="sk-well"
        style={{
          padding: '8px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--ink-hard)',
          borderRadius: '0px',
          border: '1.5px solid var(--glass-border)',
          boxShadow: '3px 3px 0px var(--ember-accent)',
          background: 'rgba(4, 8, 16, 0.85)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-lamp sk-lamp-green" />
          <span>STATUS: LIVE FEED RANKED BY DECAYED ONCHAIN WEIGHT</span>
        </div>
        <div>
          HALF-LIFE CURVE: 6.0 HOURS // 40% AUTHOR / 45% CURATORS
        </div>
      </div>

      {/* Posts Stream */}
      <div>
        {sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpenBoost={onOpenBoost}
            onInspectPost={onInspectPost}
          />
        ))}
      </div>
    </section>
  );
};
