import React, { useState } from 'react';
import { Post, BoosterRecord } from '../types/signal';
import { useWallet } from '../context/WalletContext';
import { calculateBoostSplitPreview, formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { X, Zap, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        particleCount: 60,
        spread: 70,
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 12, 0.7)',
        backdropFilter: 'blur(6px)',
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
        className="sk-panel-raised"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #f5a623, #c47d0f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(245, 166, 35, 0.5)'
              }}
            >
              <Zap size={16} color="#1c1a17" />
            </div>
            <div>
              <h3 className="text-heading" style={{ fontSize: '1.15rem' }}>
                Precision Boost Cockpit
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
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
            <X size={20} />
          </button>
        </div>

        {/* Target Post Summary */}
        <div
          className="sk-well"
          style={{
            padding: '12px 14px',
            marginBottom: '18px',
            borderLeft: '4px solid #3b6fd6'
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
            {post.title}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
            Author: {post.authorName} ({formatAddress(post.poster)})
          </div>
        </div>

        {/* Self-Boost Rejection Warning */}
        {preview.isSelfBoost && (
          <div
            style={{
              background: 'linear-gradient(180deg, #3d1b19 0%, #200f0e 100%)',
              border: '1px solid #e0392f',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '12px 14px',
              color: '#f8d7da',
              marginBottom: '18px',
              boxShadow: '0 0 12px rgba(224, 57, 47, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-red anim-lamp-pulse-red" />
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                ANTI-GAMING RULE 1 TRIGGERED
              </strong>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', lineHeight: 1.4 }}>
              You are the author of this post. The onchain contract strictly blocks self-boosting to ensure organic market signal.
            </p>
          </div>
        )}

        {/* Diminishing Returns Warning */}
        {!preview.isSelfBoost && preview.multiplierPercent < 100 && (
          <div
            style={{
              background: 'linear-gradient(180deg, #3a2e18 0%, #1c160a 100%)',
              border: '1px solid #f5a623',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '10px 14px',
              color: '#fff3cd',
              marginBottom: '18px',
              boxShadow: '0 0 10px rgba(245, 166, 35, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span className="sk-lamp sk-lamp-amber" />
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                ANTI-GAMING RULE 2: DIMINISHING RETURNS APPLIED
              </strong>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.76rem', lineHeight: 1.4 }}>
              Repeat boost detected from this wallet. Curation multiplier scaled to{' '}
              <strong>{preview.multiplierPercent}%</strong> effective weight to disincentivize wash-boosting.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              background: '#f8d7da',
              border: '1px solid #f5c2c7',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '10px 14px',
              color: '#842029',
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
              Available: {formatMon(currentAccount.balanceMon, 2)} MON
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  sound.playDialTick();
                  setBoostAmount(amt);
                }}
                className={`sk-button ${boostAmount === amt ? 'sk-button-primary' : ''}`}
                style={{
                  padding: '8px 0',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {amt} MON
              </button>
            ))}
          </div>

          <div className="sk-well" style={{ display: 'flex', alignItems: 'center', padding: '2px 12px' }}>
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
            <span className="sk-badge" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              ATOMIC 40 / 45 / 15
            </span>
          </div>

          <div
            className="sk-well"
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Poster 40% */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600 }}>
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
                  color: 'var(--ink-hard)'
                }}
              >
                +{formatMon(preview.posterCut, 3)} <span style={{ fontSize: '0.75rem', color: '#f5a623' }}>MON</span>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />

            {/* Earlier Curators 45% */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600 }}>
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
                    color: '#34c76f'
                  }}
                >
                  +{formatMon(preview.curatorCutTotal, 3)} <span style={{ fontSize: '0.75rem', color: '#34c76f' }}>MON</span>
                </div>
              </div>

              {/* Curators individual breakdown */}
              {preview.curatorBreakdown.length > 0 && (
                <div
                  style={{
                    background: 'rgba(0,0,0,0.04)',
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
                      <span style={{ color: 'var(--ink-hard)' }}>
                        #{idx + 1} {c.name} ({Math.round(c.sharePercent)}% weight)
                      </span>
                      <span style={{ fontWeight: 600, color: '#279a52' }}>
                        +{formatMon(c.estimatedPayout, 3)} MON
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />

            {/* Reserve 15% */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600 }}>
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
                <span style={{ fontSize: '0.75rem' }}>MON</span>
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
            padding: '14px',
            fontSize: '1rem',
            background: preview.isSelfBoost
              ? '#42201d'
              : 'linear-gradient(180deg, #322e28 0%, var(--panel-walnut) 60%, #141311 100%)'
          }}
        >
          <Zap size={18} />
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
