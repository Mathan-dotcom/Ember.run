import React from 'react';
import { Post } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { AnalogDecayGauge } from './AnalogDecayGauge';
import { formatAddress, formatMon, formatRelativeTime } from '../utils/decay';
import { sound } from '../utils/sound';
import { Zap, ExternalLink, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenBoost: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenBoost }) => {
  const { currentAccount } = useWallet();
  const isAuthor = currentAccount.address.toLowerCase() === post.poster.toLowerCase();
  const secondsAgo = Math.max(0, Math.floor(Date.now() / 1000) - post.createdAt);

  return (
    <article
      className="sk-panel card-hover fade-in-card"
      style={{
        padding: '24px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top Bar: Author, Index & Timestamp */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Post Monospace Index */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.80rem',
              color: '#ffffff'
            }}
          >
            #{String(post.id).padStart(4, '0')}
          </span>

          {/* Author Badge */}
          <div className="sk-badge" style={{ padding: '3px 10px' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontWeight: 600, color: '#ffffff' }}>{post.authorName}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', fontSize: '0.7rem' }}>
              ({formatAddress(post.poster)})
            </span>
          </div>

          {isAuthor && (
            <span
              className="sk-badge sk-badge--inverted"
              style={{ fontSize: '0.68rem', padding: '2px 8px' }}
            >
              <UserCheck size={12} color="#ffffff" />
              <span>YOUR POST</span>
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--ink-soft)'
            }}
          >
            {formatRelativeTime(secondsAgo)}
          </span>
        </div>
      </div>

      {/* Main Content Area: Body & Decay Instrument Gauge */}
      <div className="postcard-grid">
        {/* Left: Content & Tags */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.20rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              marginBottom: '10px'
            }}
          >
            {post.title}
          </h3>

          <p
            className="text-body"
            style={{
              color: '#d4d4d8',
              marginBottom: '14px',
              whiteSpace: 'pre-line'
            }}
          >
            {post.body}
          </p>

          {/* External Link if present */}
          {post.linkUrl && (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#ffffff',
                textDecoration: 'none',
                marginBottom: '12px',
                opacity: 0.85
              }}
            >
              <ExternalLink size={13} />
              <span>{post.linkUrl}</span>
            </a>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="sk-badge"
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  background: '#000000',
                  border: '1.5px solid #ffffff',
                  boxShadow: '2px 2px 0px #ffffff',
                  borderRadius: '0px',
                  color: '#ffffff'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Analog Decay Gauge Meter */}
        <div className="postcard-gauge-container">
          <AnalogDecayGauge
            createdAt={post.createdAt}
            totalWeight={post.totalWeight}
            decayedWeight={post.decayedWeight}
            velocityScore={post.velocityScore}
            size="md"
          />
        </div>
      </div>

      {/* AI Trend Blurb */}
      {post.aiTrendBlurb && (
        <div
          className="sk-well"
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0a0a0a',
            border: '1.5px solid #ffffff',
            borderLeft: '4px solid #ffffff',
            boxShadow: '2px 2px 0px #ffffff',
            borderRadius: '0px'
          }}
        >
          <Sparkles size={15} color="#ffffff" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              color: '#d4d4d8',
              lineHeight: 1.4
            }}
          >
            <strong style={{ color: '#ffffff' }}>[AI // INTEL]:</strong> {post.aiTrendBlurb}
          </span>
        </div>
      )}

      {/* Financial Matrix & Boost Interaction */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '14px'
        }}
      >
        {/* Onchain Financial Statistics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Decayed Weight Score */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
              DECAYED WEIGHT
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1
              }}
            >
              {formatMon(post.decayedWeight, 2)} <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>SCORE</span>
            </div>
          </div>

          {/* Total Boosted MON */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
              TOTAL POOL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1
              }}
            >
              {formatMon(post.totalBoosted, 2)} <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Curators Count */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
              EARLY CURATORS
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1
              }}
            >
              {post.curatorCount} <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>WALLETS</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isAuthor ? (
            <button
              disabled
              className="sk-button"
              title="Anti-gaming rule: You cannot boost your own post"
              style={{
                opacity: 0.6,
                cursor: 'not-allowed',
                padding: '8px 16px',
                fontSize: '0.82rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#a1a1aa'
              }}
            >
              <ShieldAlert size={14} color="#a1a1aa" />
              <span>SELF-BOOST BLOCKED</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playSwitchClick();
                onOpenBoost(post);
              }}
              className="sk-button-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Zap size={14} color="#000000" />
              <span>BOOST EMBER</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
