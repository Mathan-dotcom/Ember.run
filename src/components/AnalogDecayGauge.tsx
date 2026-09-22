import React from 'react';
import { calculateDecayHealthPercent } from '../utils/decay';

interface AnalogDecayGaugeProps {
  createdAt: number;
  totalWeight: number;
  decayedWeight: number;
  velocityScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AnalogDecayGauge: React.FC<AnalogDecayGaugeProps> = ({
  createdAt,
  totalWeight,
  decayedWeight,
  velocityScore = 0,
  size = 'md'
}) => {
  const healthPercent = calculateDecayHealthPercent(createdAt);

  // Needle angle: -120 deg (0%) to +120 deg (100%)
  // Range is 240 degrees total
  const needleAngle = -120 + (healthPercent / 100) * 240;

  // Lamp state based on health
  const lampClass =
    healthPercent >= 70
      ? 'sk-lamp-green'
      : healthPercent >= 40
      ? 'sk-lamp-amber'
      : 'sk-lamp-red anim-lamp-pulse-red';

  const lampLabel =
    healthPercent >= 70
      ? 'PRIME'
      : healthPercent >= 40
      ? 'DECAYING'
      : 'CRITICAL';

  const dimensions = size === 'sm' ? 84 : size === 'lg' ? 140 : 108;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none'
      }}
    >
      {/* Physical Bezel & Dial Housing */}
      <div
        style={{
          width: `${dimensions}px`,
          height: `${dimensions}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f4f1e8 0%, #cfccc2 50%, #9e9a8f 100%)',
          padding: '4px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 4px 10px rgba(0,0,0,0.22)',
          position: 'relative'
        }}
      >
        {/* Recessed Dial Face with Glass Reflection */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 45%, #221f1c 0%, #161513 100%)',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(255,255,255,0.15)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Subtle Glass Specular Arc */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '48%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.01) 100%)',
              borderTopLeftRadius: '100px',
              borderTopRightRadius: '100px',
              pointerEvents: 'none'
            }}
          />

          {/* SVG Dial Ticks and Scale */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3a3732"
              strokeWidth="3.5"
              strokeDasharray="160 80"
              strokeDashoffset="40"
              strokeLinecap="round"
            />
            {/* Active Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke={healthPercent >= 70 ? '#34c76f' : healthPercent >= 40 ? '#f5a623' : '#e0392f'}
              strokeWidth="3.5"
              strokeDasharray={`${(healthPercent / 100) * 160} 240`}
              strokeDashoffset="40"
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease'
              }}
            />

            {/* Autonomy Gate Tick at 70% */}
            <line
              x1="50"
              y1="12"
              x2="50"
              y2="17"
              stroke="#3b6fd6"
              strokeWidth="2.5"
              transform="rotate(48 50 50)"
            />
          </svg>

          {/* Swept Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '50%',
              left: 'calc(50% - 1.5px)',
              width: '3px',
              height: '38%',
              transformOrigin: '50% 100%',
              transform: `rotate(${needleAngle}deg)`,
              background: 'linear-gradient(180deg, #e0392f 0%, #cfccc2 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 4px rgba(0,0,0,0.9)',
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 3
            }}
          />

          {/* Center Riveted Cap */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #b5b0a3 70%, #5e594f 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.9)',
              zIndex: 4,
              position: 'relative'
            }}
          />

          {/* Health Percentage Display */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
              fontWeight: 700,
              color: '#d4cfc2',
              letterSpacing: '0.04em'
            }}
          >
            {healthPercent}%
          </div>
        </div>
      </div>

      {/* Sub-Dial Readout & Indicator Lamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span className={`sk-lamp ${lampClass}`} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'var(--ink-soft)'
          }}
        >
          {lampLabel}
        </span>
      </div>
    </div>
  );
};
