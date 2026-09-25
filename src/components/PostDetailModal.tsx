import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, BoosterRecord } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon, formatRelativeTime, calculateDecayedWeight } from '../utils/decay';
import { sound } from '../utils/sound';
import { X, ExternalLink, Zap, Clock, Users, ArrowDown, ArrowUp } from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBoost: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenBoost
}) => {
  const { getCuratorsForPost } = useWallet();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll state for dynamic fade in & fade out effect
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Update scroll boundaries & compute fade strength
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const progress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));

    setScrollProgress(progress);
    setCanScrollUp(scrollTop > 8);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 8);

    // Detect direction
    const delta = scrollTop - lastScrollTopRef.current;
    if (Math.abs(delta) > 3) {
      const dir = delta > 0 ? 'down' : 'up';
      setScrollDirection(dir);

      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setScrollDirection(null);
      }, 700);
    }
    lastScrollTopRef.current = scrollTop;
  }, []);

  // Initialize and check dimensions on open
  useEffect(() => {
    if (!isOpen || !post) return;
    const timer = setTimeout(updateScrollState, 80);
    return () => clearTimeout(timer);
  }, [isOpen, post, updateScrollState]);

  if (!isOpen || !post) return null;

  const curators: BoosterRecord[] = getCuratorsForPost(post.id);
  const secondsAgo = Math.max(0, Math.floor(Date.now() / 1000) - post.createdAt);
  const decayedWeight = calculateDecayedWeight(post.totalWeight, post.createdAt);
  const decayPercent = post.totalWeight > 0 ? Math.round((decayedWeight / post.totalWeight) * 100) : 0;

  // Dynamic CSS linear gradient mask: fades in/out at the active scroll edges
  const maskTopSize = canScrollUp ? '38px' : '0px';
  const maskBottomSize = canScrollDown ? '44px' : '0px';
  const scrollFadeMask = `linear-gradient(to bottom, transparent 0%, black ${maskTopSize}, black calc(100% - ${maskBottomSize}), transparent 100%)`;

  return (
    <div
      className="modal-overlay-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 105,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sk-panel-raised modal-box-fade scroll-fade-container"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0d0d',
          border: '2px solid #ffffff',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px #ffffff',
          position: 'relative'
        }}
      >
        {/* Fixed Pinned Header */}
        <div
          style={{
            padding: '20px 24px 14px 24px',
            borderBottom: '1.5px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d0d0d',
            zIndex: 15,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#000000',
                background: '#ffffff',
                padding: '2px 8px',
                border: '1.5px solid #ffffff',
                boxShadow: '2px 2px 0px #ffffff'
              }}
            >
              #{String(post.id).padStart(4, '0')}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: '1.10rem', color: '#ffffff' }}>
                SIGNAL TIMELINE & DECAY TELEMETRY
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                DISPATCHED BY {post.authorName} ({formatAddress(post.poster)}) // {formatRelativeTime(secondsAgo)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Scroll Indicator Badge */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                padding: '3px 8px',
                background: '#161616',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#a1a1aa',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Clock size={11} />
              <span>{scrollProgress}% SCROLLED</span>
            </div>

            <button
              onClick={() => {
                sound.playDialTick();
                onClose();
              }}
              className="sk-button"
              style={{ padding: '6px', background: 'none', border: '1.5px solid #ffffff', cursor: 'pointer' }}
            >
              <X size={15} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Scroll Progress Line */}
        <div style={{ width: '100%', height: '2px', background: '#222222', position: 'relative', zIndex: 16 }}>
          <div
            style={{
              width: `${scrollProgress}%`,
              height: '100%',
              background: '#ffffff',
              transition: 'width 0.1s linear'
            }}
          />
        </div>

        {/* Scrollable Container with Fade-In / Fade-Out Edges */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Top Ambient Fade Overlay */}
          <div
            className="scroll-fade-edge-top"
            style={{
              opacity: canScrollUp ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Bottom Ambient Fade Overlay */}
          <div
            className="scroll-fade-edge-bottom"
            style={{
              opacity: canScrollDown ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Active Scroll Direction Pill (Pops in while scrolling up or down) */}
          <div
            className="scroll-direction-indicator"
            style={{
              opacity: scrollDirection ? 1 : 0,
              transform: scrollDirection === 'down' ? 'translateY(0)' : 'translateY(-2px)'
            }}
          >
            {scrollDirection === 'down' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <ArrowDown size={10} /> SCROLLING DOWN
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <ArrowUp size={10} /> SCROLLING UP
              </span>
            )}
          </div>

          {/* Main Scrollable Content */}
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            className="scroll-fade-content"
            style={{
              height: '100%',
              maxHeight: '62vh',
              overflowY: 'auto',
              padding: '24px 28px',
              maskImage: scrollFadeMask,
              WebkitMaskImage: scrollFadeMask
            }}
          >
            {/* Post Title & Content */}
            <div className="scroll-item-fade" style={{ marginBottom: '22px' }}>
              <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                {post.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: '#e0e0e0', lineHeight: 1.5, marginBottom: '14px' }}>
                {post.body}
              </p>

              {post.linkUrl && (
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    marginBottom: '12px'
                  }}
                >
                  <ExternalLink size={12} />
                  <span>REFERENCE INTEL: {post.linkUrl}</span>
                </a>
              )}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {post.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      background: '#000000',
                      color: '#ffffff',
                      border: '1px solid #ffffff'
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Decay & Yield Telemetry Grid */}
            <div
              className="scroll-item-fade"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '22px'
              }}
            >
              <div style={{ background: '#141414', border: '1.5px solid #ffffff', padding: '10px', boxShadow: '2px 2px 0px #ffffff' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-soft)' }}>
                  DECAYED WEIGHT
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatMon(decayedWeight, 2)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#a1a1aa' }}>
                  {decayPercent}% remaining
                </div>
              </div>

              <div style={{ background: '#141414', border: '1.5px solid #ffffff', padding: '10px', boxShadow: '2px 2px 0px #ffffff' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-soft)' }}>
                  TOTAL BOOSTED
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatMon(post.totalBoosted, 2)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#a1a1aa' }}>
                  MON injected
                </div>
              </div>

              <div style={{ background: '#141414', border: '1.5px solid #ffffff', padding: '10px', boxShadow: '2px 2px 0px #ffffff' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-soft)' }}>
                  POOL RESERVE
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatMon(post.poolReserve, 2)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#a1a1aa' }}>
                  15% retained
                </div>
              </div>

              <div style={{ background: '#141414', border: '1.5px solid #ffffff', padding: '10px', boxShadow: '2px 2px 0px #ffffff' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-soft)' }}>
                  VELOCITY SCORE
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {post.velocityScore}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#a1a1aa' }}>
                  surge index
                </div>
              </div>
            </div>

            {/* Chronological Curator Timeline */}
            <div className="scroll-item-fade" style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  paddingBottom: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="#ffffff" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                    Curator Discovery Waterfall ({curators.length} wallets)
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                  ATOMIC 45% CASCADE
                </span>
              </div>

              {curators.length === 0 ? (
                <div
                  className="sk-well"
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--ink-soft)',
                    border: '1.5px dashed rgba(255,255,255,0.3)',
                    borderRadius: '0px'
                  }}
                >
                  No curators have boosted this ember yet. Be the Genesis Curator to secure maximum 45% downstream cut!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {curators.map((c, idx) => (
                    <div
                      key={c.wallet}
                      style={{
                        background: '#141414',
                        border: '1.5px solid #ffffff',
                        boxShadow: '2px 2px 0px #ffffff',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        transition: 'transform 0.15s ease, background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            background: idx === 0 ? '#ffffff' : '#000000',
                            color: idx === 0 ? '#000000' : '#ffffff',
                            border: '1px solid #ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                            {c.name} {idx === 0 && <span style={{ color: '#34c76f', fontSize: '0.68rem' }}>[GENESIS CURATOR]</span>}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
                            {formatAddress(c.wallet)} // Boost #{c.boostCount}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#34c76f' }}>
                          +{formatMon(c.earnedPayouts, 3)} MON
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-soft)' }}>
                          Injected: {formatMon(c.totalContributed, 2)} MON // Weight: {formatMon(c.effectiveWeight, 2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Pinned Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1.5px solid #ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0d0d0d',
            zIndex: 15,
            position: 'relative'
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
            SCROLL UP & DOWN TO AUDIT // MONAD METROPOLIS
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                sound.playDialTick();
                onClose();
              }}
              className="sk-button"
              style={{ padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              CLOSE
            </button>
            <button
              onClick={() => {
                sound.playSwitchClick();
                onClose();
                onOpenBoost(post);
              }}
              className="sk-button-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <Zap size={14} />
              <span>BOOST THIS EMBER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
