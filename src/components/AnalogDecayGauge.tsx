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
  const needleAngle = -120 + (healthPercent / 100) * 240;

  // Minimalist Monochrome Palette
  const statusLabel =
    healthPercent >= 70
      ? 'PRIME'
      : healthPercent >= 40
      ? 'DECAYING'
      : 'DEPLETED';

  const dimensions = size === 'sm' ? 88 : size === 'lg' ? 144 : 112;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none'
      }}
    >
      {/* Minimalist Gauge Housing */}
      <div
        style={{
          width: `${dimensions}px`,
          height: `${dimensions}px`,
          borderRadius: '50%',
          background: '#0a0a0a',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.9)',
          position: 'relative'
        }}
      >
        {/* Recessed Black Face */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#000000',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.9)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Minimalist Concentric Arcs */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {/* Inactive Outer Track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3.5"
              strokeDasharray="160 80"
              strokeDashoffset="40"
              strokeLinecap="round"
            />

            {/* Active Luminous White Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray={`${(healthPercent / 100) * 160} 240`}
              strokeDashoffset="40"
              strokeLinecap="round"
              filter="drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))"
              style={{
                transition: 'stroke-dasharray 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Inner Tick Ring */}
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* Target 70% Marker */}
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="16"
              stroke="#ffffff"
              strokeWidth="2"
              transform="rotate(48 50 50)"
            />
          </svg>

          {/* Minimalist Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '50%',
              left: 'calc(50% - 1px)',
              width: '2px',
              height: '40%',
              transformOrigin: '50% 100%',
              transform: `rotate(${needleAngle}deg)`,
              background: '#ffffff',
              borderRadius: '1px',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.7)',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 3
            }}
          />

          {/* Center Hub */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
              zIndex: 4
            }}
          />

          {/* Digital Percentage Readout */}
          <div
            style={{
              position: 'absolute',
              bottom: size === 'sm' ? '12px' : '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: size === 'sm' ? '0.62rem' : '0.72rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.04em',
              zIndex: 2
            }}
          >
            {healthPercent}%
          </div>
        </div>
      </div>

      {/* Minimalist Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#0d0d0d',
          border: '1px solid rgba(255, 255, 255, 0.16)'
        }}
      >
        <span
          className="sk-lamp"
          style={{
            background: healthPercent >= 70 ? '#ffffff' : healthPercent >= 40 ? '#a1a1aa' : '#52525b',
            boxShadow: healthPercent >= 70 ? '0 0 6px #ffffff' : 'none'
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '0.06em'
          }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
};

export default AnalogDecayGauge;
