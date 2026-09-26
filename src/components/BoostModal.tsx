import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Post } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { calculateBoostSplitPreview, formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { X, Zap, ShieldAlert, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({ post, isOpen, onClose }) => {
  const { currentAccount, getCuratorsForPost, boostPost } = useWallet();
  const [boostAmount, setBoostAmount] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Future Inflow & Curator Yield Simulator state
  const [simulatedInflow, setSimulatedInflow] = useState<number>(5.0);
  const [showYieldSimulator, setShowYieldSimulator] = useState<boolean>(true);

  // Scroll state for dynamic fade in & fade out effect
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const progress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));

    setScrollProgress(progress);
    setCanScrollUp(scrollTop > 8);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 8);

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

  useEffect(() => {
    if (!isOpen || !post) return;
    const timer = setTimeout(updateScrollState, 80);
    return () => clearTimeout(timer);
  }, [isOpen, post, boostAmount, showYieldSimulator, updateScrollState]);

  if (!isOpen || !post) return null;

  const maskTopSize = canScrollUp ? '32px' : '0px';
  const maskBottomSize = canScrollDown ? '38px' : '0px';
  const scrollFadeMask = `linear-gradient(to bottom, transparent 0%, black ${maskTopSize}, black calc(100% - ${maskBottomSize}), transparent 100%)`;

  const curators = getCuratorsForPost(post.id);
  const preview = calculateBoostSplitPreview(post, boostAmount, currentAccount.address, curators);

  // Future Curator Yield Projection Math
  const existingBooster = curators.find(
    (c) => c.wallet.toLowerCase() === currentAccount.address.toLowerCase()
  );
  const existingUserWeight = existingBooster ? existingBooster.effectiveWeight : 0;
  const userWeightAdded = preview.effectiveWeightAdded;
  const userTotalProjectedWeight = existingUserWeight + userWeightAdded;
  const totalCurrentCuratorWeight = curators.reduce((sum, c) => sum + c.effectiveWeight, 0);
  const totalProjectedCuratorWeight = totalCurrentCuratorWeight + userWeightAdded;

  const userProjectedShareRatio = totalProjectedCuratorWeight > 0
    ? userTotalProjectedWeight / totalProjectedCuratorWeight
    : 1.0;
  const userProjectedSharePercent = userProjectedShareRatio * 100;

  // 45% of future inflow is disbursed directly to earlier curators
  const futureCuratorPool = simulatedInflow * 0.45;
  const projectedFutureDividend = futureCuratorPool * userProjectedShareRatio;
  const projectedNetProfit = projectedFutureDividend - boostAmount;
  const projectedRoiPercent = boostAmount > 0 ? (projectedFutureDividend / boostAmount) * 100 : 0;
  const breakevenInflowRequired = userProjectedShareRatio > 0 && boostAmount > 0
    ? boostAmount / (userProjectedShareRatio * 0.45)
    : 0;

  const SIMULATED_INFLOW_PRESETS = [2.0, 5.0, 10.0, 25.0];
  const PRESET_AMOUNTS = [0.5, 1.0, 2.5, 5.0];

  const handleBoost = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    sound.playSwitchClick();

    try {
      await boostPost(post.id, boostAmount);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 800);
    } catch (err: unknown) {
      setIsProcessing(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Boost failed');
      }
    }
  };

  return (
    <div
      className="modal-overlay-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 6, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 100,
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
        className="sk-panel-raised modal-box-fade"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '24px 28px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(10, 10, 10, 0.98)',
          border: '2px solid #ffffff',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px #ffffff'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            borderBottom: '1.5px solid rgba(255, 255, 255, 0.25)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #f8fafc',
                boxShadow: '2px 2px 0px #ffffff'
              }}
            >
              <Zap size={16} color="#030712" fill="#030712" />
            </div>
            <div>
              <h3 className="text-heading" style={{ fontSize: '1.1rem', color: '#f8fafc' }}>
                Precision Boost Cockpit
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
                ATOMIC DISBURSEMENT // MONAD TESTNET
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-soft)',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Container with Dynamic Edge Fade Masks */}
        <div className="scroll-fade-container" style={{ position: 'relative', flex: 1, minHeight: 0, marginBottom: '14px' }}>
          {/* Top Edge Feathering Overlay */}
          <div
            className="scroll-fade-edge-top"
            style={{
              opacity: canScrollUp ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Bottom Edge Feathering Overlay */}
          <div
            className="scroll-fade-edge-bottom"
            style={{
              opacity: canScrollDown ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Micro Scroll Direction HUD */}
          {scrollDirection && (
            <div className="scroll-direction-indicator">
              {scrollDirection === 'down' ? 'SCROLLING DOWN ↓' : 'SCROLLING UP ↑'}
            </div>
          )}

          {/* Scrollable Content Body */}
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            className="scroll-fade-content"
            style={{
              maxHeight: '56vh',
              overflowY: 'auto',
              paddingRight: '6px',
              paddingTop: '4px',
              paddingBottom: '20px',
              maskImage: scrollFadeMask,
              WebkitMaskImage: scrollFadeMask
            }}
          >
            {/* Target Post Summary */}
            <div
              className="sk-well"
              style={{
                padding: '12px 14px',
                marginBottom: '16px',
                borderRadius: '0px',
                border: '1.5px solid #ffffff',
                borderLeft: '4px solid #ffffff',
                boxShadow: '2px 2px 0px #ffffff',
                background: 'rgba(4, 8, 16, 0.85)'
              }}
            >
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px', color: '#f8fafc' }}>
                {post.title}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)' }}>
                Author: {post.authorName} ({formatAddress(post.poster)})
              </div>
            </div>

            {/* Self-Boost Rejection Warning */}
            {preview.isSelfBoost && (
              <div
                style={{
                  background: '#161616',
                  border: '1.5px solid #ffffff',
                  borderRadius: '0px',
                  boxShadow: '2px 2px 0px #ffffff',
                  padding: '12px 14px',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldAlert size={15} color="#ffffff" />
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                    ANTI-GAMING RULE 1 TRIGGERED
                  </strong>
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', lineHeight: 1.4, color: '#d4d4d8' }}>
                  You are the author of this post. The onchain contract strictly blocks self-boosting to ensure organic market signal.
                </p>
              </div>
            )}

            {/* Diminishing Returns Warning */}
            {!preview.isSelfBoost && preview.multiplierPercent < 100 && (
              <div
                style={{
                  background: '#141414',
                  border: '1.5px solid #ffffff',
                  borderRadius: '0px',
                  boxShadow: '2px 2px 0px #ffffff',
                  padding: '10px 14px',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <AlertTriangle size={14} color="#ffffff" />
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    ANTI-GAMING RULE 2: DIMINISHING RETURNS APPLIED
                  </strong>
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.76rem', lineHeight: 1.4, color: '#a1a1aa' }}>
                  Repeat boost detected from this wallet. Curation multiplier scaled to{' '}
                  <strong>{preview.multiplierPercent}%</strong> effective weight to disincentivize wash-boosting.
                </p>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div
                style={{
                  background: '#181818',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-pulse-sm)',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  marginBottom: '16px'
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Boost Amount Selector */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="text-micro">Select Boost Quantum (MON)</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                  Available: {formatMon(currentAccount.balanceMon, 2)} MON
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = boostAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        sound.playDialTick();
                        setBoostAmount(amt);
                      }}
                      className={`sk-button ${isSelected ? 'sk-button-primary' : ''}`}
                      style={{
                        padding: '8px 0',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.95rem',
                        fontWeight: 600
                      }}
                    >
                      {amt} MON
                    </button>
                  );
                })}
              </div>

              <div className="sk-well" style={{ display: 'flex', alignItems: 'center', padding: '2px 12px', border: '1.5px solid #ffffff', borderRadius: '0px', boxShadow: '2px 2px 0px #ffffff', background: 'rgba(4, 8, 16, 0.85)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Custom:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  className="sk-input"
                  value={boostAmount}
                  onChange={(e) => setBoostAmount(parseFloat(e.target.value) || 0)}
                  style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>MON</span>
              </div>
            </div>

            {/* Live Payout Split Matrix */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="text-micro">Live Onchain Disbursement Preview</label>
                <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '0px', border: '1px solid #f8fafc', boxShadow: '1px 1px 0px #ffffff' }}>
                  ATOMIC 40 / 45 / 15
                </span>
              </div>

              <div
                className="sk-well"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1.5px solid #ffffff',
                  borderRadius: '0px',
                  boxShadow: '3px 3px 0px #ffffff',
                  background: 'rgba(4, 8, 16, 0.90)'
                }}
              >
                {/* Poster 40% */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                      Original Author Cut (40%)
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
                      {formatAddress(post.poster)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}
                  >
                    +{formatMon(preview.posterCut, 3)} <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>MON</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Earlier Curators 45% */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                        Earlier Curators Share (45%)
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
                        {curators.length === 0
                          ? 'No earlier curators — retained in post reserve'
                          : `Split among ${curators.length} early taste spotters`}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#ffffff'
                      }}
                    >
                      +{formatMon(preview.curatorCutTotal, 3)} <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>MON</span>
                    </div>
                  </div>

                  {/* Curators individual breakdown */}
                  {preview.curatorBreakdown.length > 0 && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '0px',
                        padding: '6px 8px',
                        marginTop: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      {preview.curatorBreakdown.map((c, idx) => (
                        <div
                          key={c.wallet}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem'
                          }}
                        >
                          <span style={{ color: '#ffffff' }}>
                            #{idx + 1} {c.name} ({Math.round(c.sharePercent)}% weight)
                          </span>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>
                            +{formatMon(c.estimatedPayout, 3)} MON
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Reserve 15% */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                      Post Pool Reserve ({curators.length === 0 ? '60%' : '15%'})
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
                      Liquidity held in contract for future market depth
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--ink-soft)'
                    }}
                  >
                    +{formatMon(curators.length === 0 ? preview.reserveCut + preview.curatorCutTotal : preview.reserveCut, 3)}{' '}
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>MON</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Inflow & Curator Yield Simulator */}
            {!preview.isSelfBoost && (
              <div
                className="sk-panel"
                style={{
                  padding: '14px',
                  background: 'rgba(7, 14, 28, 0.90)',
                  border: '1.5px solid #ffffff',
                  boxShadow: '3px 3px 0px #ffffff',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => setShowYieldSimulator(!showYieldSimulator)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={15} color="#ffffff" />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.84rem', color: '#f8fafc' }}>
                      FUTURE CURATOR YIELD SIMULATOR
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.66rem',
                        color: projectedRoiPercent >= 100 ? '#ffffff' : 'var(--ink-soft)',
                        fontWeight: 700
                      }}
                    >
                      {projectedRoiPercent >= 100 ? `+${Math.round(projectedRoiPercent - 100)}% ROI` : `${Math.round(projectedRoiPercent)}% PAYBACK`}
                    </span>
                    <button
                      type="button"
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0 }}
                    >
                      {showYieldSimulator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {showYieldSimulator && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.74rem', color: 'var(--ink-soft)', marginBottom: '10px', lineHeight: 1.4 }}>
                      Simulate downstream dividend splits from future curators boosting after you.
                    </p>

                    {/* Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)' }}>
                        Hypothetical Inflow:
                      </span>
                      {SIMULATED_INFLOW_PRESETS.map((flow) => (
                        <button
                          key={flow}
                          type="button"
                          onClick={() => {
                            sound.playDialTick();
                            setSimulatedInflow(flow);
                          }}
                          className={`sk-button ${simulatedInflow === flow ? 'sk-button-primary' : ''}`}
                          style={{ padding: '3px 8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
                        >
                          +{flow} MON
                        </button>
                      ))}
                    </div>

                    {/* Simulation Metrics Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px',
                        background: '#030712',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-soft)' }}>
                          YOUR POOL WEIGHT SHARE
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                          {userProjectedSharePercent.toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-soft)' }}>
                          DOWNSTREAM 45% POOL
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                          {formatMon(futureCuratorPool, 2)} MON
                        </div>
                      </div>

                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-soft)' }}>
                          PROJECTED DIVIDEND
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                          +{formatMon(projectedFutureDividend, 3)} MON
                        </div>
                      </div>

                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-soft)' }}>
                          ESTIMATED NET YIELD
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#ffffff'
                          }}
                        >
                          {projectedNetProfit >= 0
                            ? `+${formatMon(projectedNetProfit, 3)} MON`
                            : `-${formatMon(Math.abs(projectedNetProfit), 3)} MON`}
                        </div>
                      </div>
                    </div>

                    {/* Breakeven Horizon Banner */}
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: '#d4d4d8',
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderLeft: '2px solid #ffffff',
                        padding: '6px 8px',
                        lineHeight: 1.4
                      }}
                    >
                      Break-even requires{' '}
                      <strong style={{ color: '#ffffff' }}>{formatMon(breakevenInflowRequired, 2)} MON</strong> total future boosts.
                      Subsequent inflows beyond that point represent recurring, pure dividend returns.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Modal Footer */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '12px' }}>
          {(canScrollUp || canScrollDown) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: '#ffffff',
                marginBottom: '8px'
              }}
            >
              <span>COCKPIT SCROLL {scrollProgress}%</span>
              {canScrollDown ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </div>
          )}

          <button
            onClick={handleBoost}
            disabled={preview.isSelfBoost || boostAmount <= 0 || isProcessing || currentAccount.balanceMon < boostAmount}
            className="sk-button-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.95rem'
            }}
          >
            <Zap size={16} />
            <span>
              {preview.isSelfBoost
                ? 'SELF-BOOST PROHIBITED'
                : isProcessing
                ? 'EXECUTING ONCHAIN SPLIT...'
                : `BOOST — ${formatMon(boostAmount, 2)} MON`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoostModal;
