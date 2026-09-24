import React, { useState } from 'react';
import { calculateDiminishingMultiplier } from '../utils/decay';
import { sound } from '../utils/sound';
import { AlertOctagon, TrendingDown } from 'lucide-react';

export const AntiGamingTelemetry: React.FC = () => {
  const [simulatedBoostCount, setSimulatedBoostCount] = useState<number>(1);

  const boostSteps = [1, 2, 3, 4, 5];

  return (
    <section className="sk-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="05" />
          <h2 className="text-heading">ANTI-GAMING & SYBIL DEFENSE MATRIX</h2>
          <span className="sk-badge" style={{ fontSize: '0.68rem' }}>
            ONCHAIN PROTOCOL LOGIC
          </span>
        </div>

        <div className="sk-badge sk-badge--inverted" style={{ fontSize: '0.70rem' }}>
          <span className="sk-lamp sk-lamp-green" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>RULES ARMED & ENFORCED</span>
        </div>
      </div>

      {/* Two-Column Defense Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '16px'
        }}
      >
        {/* Defense Rule 1: No Self-Boosting */}
        <div className="sk-well" style={{ padding: '18px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertOctagon size={16} color="#ffffff" />
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
              RULE 01: ZERO SELF-BOOSTING
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#d4d4d8', marginBottom: '12px', lineHeight: 1.5 }}>
            Authors cannot artificially inflate their own signals. The smart contract validates:
          </p>

          <div
            style={{
              background: '#000000',
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '12px'
            }}
          >
            require(msg.sender != post.poster, "Signal: Self-boosting prohibited");
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span>Result: Transaction immediately reverts onchain; gas wasted with 0 payout.</span>
          </div>
        </div>

        {/* Defense Rule 2: Diminishing Returns per Wallet */}
        <div className="sk-well" style={{ padding: '18px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <TrendingDown size={16} color="#ffffff" />
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
              RULE 02: DIMINISHING RETURNS MULTIPLIER
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#d4d4d8', marginBottom: '12px', lineHeight: 1.5 }}>
            Each subsequent boost from the same wallet yields an asymptotically smaller curation weight:
          </p>

          {/* Interactive Boost Step Simulator */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {boostSteps.map((step) => {
              const mult = calculateDiminishingMultiplier(step - 1);
              const isSelected = simulatedBoostCount === step;

              return (
                <button
                  key={step}
                  onClick={() => {
                    sound.playDialTick();
                    setSimulatedBoostCount(step);
                  }}
                  className={`sk-button ${isSelected ? 'sk-button-primary' : ''}`}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: '0.72rem',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)' }}>#{step}</span>
                  <span style={{ fontWeight: 700 }}>{Math.round(mult * 100)}%</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: '#000000',
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>BOOST #{simulatedBoostCount} WEIGHT:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>
              {(calculateDiminishingMultiplier(simulatedBoostCount - 1) * 100).toFixed(1)}% EFFECTIVE SHARE
            </span>
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.75rem',
          color: 'var(--ink-soft)',
          textAlign: 'center'
        }}
      >
        Combined, these two constraints make sybil attacks and self-curation mathematically negative-EV.
      </div>
    </section>
  );
};

export default AntiGamingTelemetry;
