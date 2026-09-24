import React, { useState } from 'react';
import { Post } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { calculateBoostSplitPreview, formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { X, Zap, ShieldAlert, AlertTriangle } from 'lucide-react';
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

  if (!isOpen || !post) return null;

  const curators = getCuratorsForPost(post.id);
  const preview = calculateBoostSplitPreview(post, boostAmount, currentAccount.address, curators);

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
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
          maxWidth: '520px',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0d0d0d',
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
            marginBottom: '16px',
            borderBottom: '1.5px solid #ffffff',
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
                border: '1.5px solid #ffffff',
                boxShadow: '2px 2px 0px #ffffff'
              }}
            >
              <Zap size={16} color="#000000" fill="#000000" />
            </div>
            <div>
              <h3 className="text-heading" style={{ fontSize: '1.1rem', color: '#ffffff' }}>
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

        {/* Target Post Summary */}
        <div
          className="sk-well"
          style={{
            padding: '12px 14px',
            marginBottom: '18px',
            borderRadius: '0px',
            border: '1.5px solid #ffffff',
            borderLeft: '4px solid #ffffff',
            boxShadow: '2px 2px 0px #ffffff'
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '2px', color: '#ffffff' }}>
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
              marginBottom: '18px'
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
              marginBottom: '18px'
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
        <div style={{ marginBottom: '20px' }}>
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

          <div className="sk-well" style={{ display: 'flex', alignItems: 'center', padding: '2px 12px', border: '1.5px solid #ffffff', borderRadius: '0px', boxShadow: '2px 2px 0px #ffffff' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Custom:</span>
            <input
              type="number"
              step="0.1"
              min="0.01"
              className="sk-input"
              value={boostAmount}
              onChange={(e) => setBoostAmount(parseFloat(e.target.value) || 0)}
              style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>MON</span>
          </div>
        </div>

        {/* Live Payout Split Matrix */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="text-micro">Live Onchain Disbursement Preview</label>
            <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '0px', border: '1px solid #ffffff', boxShadow: '1px 1px 0px #ffffff' }}>
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
              boxShadow: '3px 3px 0px #ffffff'
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
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                +{formatMon(preview.posterCut, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>MON</span>
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
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#ffffff'
                  }}
                >
                  +{formatMon(preview.curatorCutTotal, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>MON</span>
                </div>
              </div>

              {/* Curators individual breakdown */}
              {preview.curatorBreakdown.length > 0 && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '4px',
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
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--ink-soft)'
                }}
              >
                +{formatMon(curators.length === 0 ? preview.reserveCut + preview.curatorCutTotal : preview.reserveCut, 3)}{' '}
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>MON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
  );
};

export default BoostModal;
