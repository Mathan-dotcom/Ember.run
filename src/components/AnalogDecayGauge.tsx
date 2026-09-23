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

  // Cyberpunk Neon Status Palette
  const neonColor =
    healthPercent >= 70
      ? '#00ff9d' // Matrix green
      : healthPercent >= 40
      ? '#00f0ff' // Cyber cyan
      : '#ff0055'; // Neon magenta/critical

  const glowShadow =
    healthPercent >= 70
      ? '0 0 14px rgba(0, 255, 157, 0.6)'
      : healthPercent >= 40
      ? '0 0 14px rgba(0, 240, 255, 0.6)'
      : '0 0 18px rgba(255, 0, 85, 0.8)';

  const statusLabel =
    healthPercent >= 70
      ? 'PRIME'
      : healthPercent >= 40
      ? 'DECAYING'
      : 'CRITICAL';

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
      {/* Cyberpunk HUD Ring Housing */}
      <div
        style={{
          width: `${dimensions}px`,
          height: `${dimensions}px`,
          borderRadius: '50%',
          background: 'rgba(15, 13, 26, 0.9)',
          padding: '4px',
          border: `1px solid ${healthPercent < 40 ? 'rgba(255, 0, 85, 0.5)' : 'rgba(131, 110, 249, 0.35)'}`,
          boxShadow: `0 0 20px rgba(0, 0, 0, 0.8), ${glowShadow}`,
          position: 'relative'
        }}
      >
        {/* Recessed Dark Glass Dial Face */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #151226 0%, #080710 100%)',
            boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.9), inset 0 0 6px rgba(131, 110, 249, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Holographic Concentric Grid Arcs */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <defs>
              <linearGradient id="cyberGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#836ef9" />
                <stop offset="50%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor={neonColor} />
              </linearGradient>
            </defs>

            {/* Inactive Outer Track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(131, 110, 249, 0.15)"
              strokeWidth="4"
              strokeDasharray="160 80"
              strokeDashoffset="40"
              strokeLinecap="round"
            />

            {/* Active Luminous Neon Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="url(#cyberGaugeGrad)"
              strokeWidth="4"
              strokeDasharray={`${(healthPercent / 100) * 160} 240`}
              strokeDashoffset="40"
              strokeLinecap="round"
              filter="drop-shadow(0 0 4px rgba(0, 240, 255, 0.7))"
              style={{
                transition: 'stroke-dasharray 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Inner HUD Tick Ring */}
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.2"
              strokeDasharray="2 4"
            />

            {/* Autonomy Gate Target Marker (70%) */}
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="16"
              stroke="#00f0ff"
              strokeWidth="2.5"
              transform="rotate(48 50 50)"
              filter="drop-shadow(0 0 3px #00f0ff)"
            />
          </svg>

          {/* Holographic Laser Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '50%',
              left: 'calc(50% - 1px)',
              width: '2px',
              height: '40%',
              transformOrigin: '50% 100%',
              transform: `rotate(${needleAngle}deg)`,
              background: `linear-gradient(180deg, ${neonColor} 0%, rgba(131, 110, 249, 0.6) 100%)`,
              borderRadius: '2px',
              boxShadow: `0 0 8px ${neonColor}`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 3
            }}
          />

          {/* Central Holographic Hub */}
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #00f0ff 0%, #151128 80%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.7)',
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
              color: neonColor,
              textShadow: `0 0 8px ${neonColor}`,
              letterSpacing: '0.04em',
              zIndex: 2
            }}
          >
            {healthPercent}%
          </div>
        </div>
      </div>

      {/* Cyber Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(15, 12, 26, 0.85)',
          border: `1px solid ${healthPercent < 40 ? 'rgba(255, 0, 85, 0.4)' : 'rgba(131, 110, 249, 0.25)'}`
        }}
      >
        <span
          className="sk-lamp"
          style={{
            background: neonColor,
            boxShadow: `0 0 8px ${neonColor}`
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: '#e5e2fc',
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
