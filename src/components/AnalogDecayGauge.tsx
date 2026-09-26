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

  // Neo-Brutalist Status Label
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
      {/* Neo-Brutalist Gauge Housing */}
      <div
        style={{
          width: `${dimensions}px`,
          height: `${dimensions}px`,
          borderRadius: '0px',
          background: '#0a0a0a',
          padding: '4px',
          border: '1.5px solid #ffffff',
          boxShadow: '3px 3px 0px #ffffff',
          position: 'relative'
        }}
      >
        {/* Recessed Obsidian Face */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            background: '#000000',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Concentric Arcs */}
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
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="4"
              strokeDasharray="160 80"
              strokeDashoffset="40"
              strokeLinecap="square"
            />

            {/* Active Luminous White Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray={`${(healthPercent / 100) * 160} 240`}
              strokeDashoffset="40"
              strokeLinecap="square"
              style={{
                transition: 'stroke-dasharray 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Target 70% Marker */}
            <line
              x1="50"
              y1="8"
              x2="50"
              y2="15"
              stroke="#a3a3a3"
              strokeWidth="2.5"
              transform="rotate(48 50 50)"
            />
          </svg>

          {/* Minimalist Radiant Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '50%',
              left: 'calc(50% - 1.5px)',
              width: '3px',
              height: '40%',
              transformOrigin: '50% 100%',
              transform: `rotate(${needleAngle}deg)`,
              background: '#ffffff',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 3
            }}
          />

          {/* Center Hub */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '0px',
              background: '#ffffff',
              border: '2px solid #000000',
              zIndex: 4
            }}
          />

          {/* Digital Percentage Readout */}
          <div
            style={{
              position: 'absolute',
              bottom: size === 'sm' ? '10px' : '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '0.04em',
              zIndex: 2
            }}
          >
            {healthPercent}%
          </div>
        </div>
      </div>

      {/* Brutalist Status Badge */}
      <div
        className="sk-badge"
        style={{
          padding: '2px 8px',
          boxShadow: '2px 2px 0px #ffffff'
        }}
      >
        <span
          className="sk-lamp"
          style={{
            background: '#ffffff'
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '0.08em'
          }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
};

export default AnalogDecayGauge;
