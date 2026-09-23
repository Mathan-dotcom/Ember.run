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
      className="sk-panel card-hover"
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
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Post Monospace Index */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: 'var(--ink-soft)',
              textShadow: '0 1px 0 var(--bevel-light)'
            }}
          >
            #{String(post.id).padStart(4, '0')}
          </span>

          {/* Author Badge */}
          <div className="sk-badge" style={{ padding: '3px 10px' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontWeight: 600 }}>{post.authorName}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', fontSize: '0.7rem' }}>
              ({formatAddress(post.poster)})
            </span>
          </div>

          {isAuthor && (
            <span
              className="sk-badge sk-badge--inverted"
              style={{ fontSize: '0.68rem', padding: '2px 8px' }}
            >
              <UserCheck size={12} color="#34c76f" />
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
              color: 'var(--ledger-muted)'
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
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--ink-hard)',
              lineHeight: 1.3,
              marginBottom: '10px'
            }}
          >
            {post.title}
          </h3>

          <p
            className="text-body"
            style={{
              color: '#34312d',
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
                color: '#2a5bb5',
                textDecoration: 'none',
                marginBottom: '12px'
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
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.1)'
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

      {/* AI Trend Blurb (PRD Section 5.6: Kimi / Qwen style velocity intelligence) */}
      {post.aiTrendBlurb && (
        <div
          className="sk-well"
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(90deg, rgba(59, 111, 214, 0.08) 0%, rgba(207, 204, 194, 0.4) 100%)',
            borderLeft: '3px solid #3b6fd6'
          }}
        >
          <Sparkles size={16} color="#3b6fd6" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              color: 'var(--ink-hard)',
              lineHeight: 1.4
            }}
          >
            <strong>Curation Intelligence:</strong> {post.aiTrendBlurb}
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
          borderTop: '1px solid rgba(0,0,0,0.08)',
          paddingTop: '14px'
        }}
      >
        {/* Onchain Financial Statistics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Decayed Weight Score */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
              DECAYED WEIGHT
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#1b356b',
                lineHeight: 1
              }}
            >
              {formatMon(post.decayedWeight, 2)} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>SCORE</span>
            </div>
          </div>

          {/* Total Boosted MON */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
              TOTAL POOL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--ink-hard)',
                lineHeight: 1
              }}
            >
              {formatMon(post.totalBoosted, 2)} <span style={{ fontSize: '0.75rem', color: '#f5a623' }}>MON</span>
            </div>
          </div>

          {/* Curators Count */}
          <div>
            <div className="text-micro" style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
              EARLY CURATORS
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--ink-hard)',
                lineHeight: 1
              }}
            >
              {post.curatorCount} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>WALLETS</span>
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
                fontSize: '0.85rem'
              }}
            >
              <ShieldAlert size={14} color="#e0392f" />
              <span>SELF-BOOST BLOCKED</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playSwitchClick();
                onOpenBoost(post);
              }}
              className="sk-button-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Zap size={15} color="#f5a623" />
              <span>BOOST EMBER</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
