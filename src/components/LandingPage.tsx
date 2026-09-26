import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CathodeWorkstation3D } from './CathodeWorkstation3D';
import { AnalogDecayGauge } from './AnalogDecayGauge';
import { sound } from '../utils/sound';
import { formatMon } from '../utils/decay';
import {
  Flame,
  Zap,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  Play,
  Clock,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  Cpu,
  Monitor
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenDemo: () => void;
  onOpenPasskeyModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenDemo,
  onOpenPasskeyModal
}) => {
  const { currentAccount } = useWallet();
  const [selectedVariant, setSelectedVariant] = useState<'session' | 'wireframe'>('session');
  const [simulatedBoost, setSimulatedBoost] = useState<number>(2.0);
  const [simulatedHour, setSimulatedHour] = useState<number>(1);

  // Taste Arbitrage Calculator:
  // If boosted in hour 1 with 2 MON, and later post reaches 10 MON total boosts:
  // Expected curator share: ~45% of later boosts (8 MON * 0.45 = 3.6 MON)
  const laterBoosts = Math.max(0, 10 - simulatedBoost);
  const decayPenalty = Math.pow(2, -simulatedHour / 6);
  const estimatedEarned = Math.round(laterBoosts * 0.45 * decayPenalty * 100) / 100;
  const estimatedRoi = Math.round((estimatedEarned / simulatedBoost) * 100);

  return (
    <div className="fade-in-card" style={{ padding: '0 0 40px 0' }}>
      {/* ── Breadcrumb Tag Bar (Cathode Session Monochrome Style) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          marginBottom: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ffffff', fontWeight: 700 }}>
            EMBER.RUN
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>/</span>
          {['motion design', 'motion graphics', 'cathode', 'crt', 'workstation', 'monad'].map((tag, idx) => (
            <React.Fragment key={tag}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: idx < 2 ? '#ffffff' : '#a3a3a3',
                  letterSpacing: '0.02em'
                }}
              >
                {tag}
              </span>
              {idx < 5 && <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>·</span>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '2px 8px',
              fontWeight: 700
            }}
          >
            PRO | 60 FPS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: '#d4d4d4',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '2px 8px'
            }}
          >
            MONAD TESTNET: 10143
          </span>
        </div>
      </div>

      {/* ── Main Cathode Session Hero Section (Pure Black & White) ── */}
      <section
        className="sk-panel"
        style={{
          padding: '0',
          marginBottom: '32px',
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1.5px solid #ffffff',
          boxShadow: '6px 6px 0px #ffffff'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
            alignItems: 'stretch'
          }}
          className="mission-console-grid"
        >
          {/* ── Left Column: 60 FPS 3D Cathode Workstation Canvas ── */}
          <div
            style={{
              position: 'relative',
              minHeight: '480px',
              borderRight: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              background: 'radial-gradient(ellipse at 50% 45%, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.98) 80%)'
            }}
          >
            {/* Top HUD Overlay inside 3D Canvas */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 8px #ffffff'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#ffffff', fontWeight: 700 }}>
                CATHODE WORKSTATION // THREE.JS 3D
              </span>
            </div>

            {/* Interactive 3D Workstation Canvas */}
            <div style={{ flex: 1, position: 'relative' }}>
              <CathodeWorkstation3D variant={selectedVariant} onInteract={sound.playDialTick} />
            </div>

            {/* Bottom Controls / Status Bar */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} color="#ffffff" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#a3a3a3' }}>
                  PARALLEL EXECUTION MATRIX: 10,000 TPS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={12} color="#ffffff" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#ffffff' }}>
                  MONAD BFT: 1.0s SLOT
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Hero Headline & Action Console ── */}
          <div
            style={{
              padding: 'clamp(24px, 4vw, 44px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              background: '#050505'
            }}
          >
            {/* Header Tagline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 700
                }}
              >
                SESSION 01 // PARALLEL EVM
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff'
                }}
              >
                CURATION MARKET
              </span>
            </div>

            {/* Giant Bold Headline (Matching "Built for the Long Session") */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '18px'
              }}
            >
              Built for the <br />
              <span
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 25px rgba(255, 255, 255, 0.4)'
                }}
              >
                Long Session
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.98rem',
                lineHeight: 1.65,
                color: '#a3a3a3',
                marginBottom: '26px'
              }}
            >
              Likes and retweets cost nothing, so signals drown in noise. On <strong style={{ color: '#ffffff' }}>Ember.run</strong>,
              boosting attention requires capital on Monad parallel execution. Boost weights decay smoothly over time, and
              early curators earn automatic <strong style={{ color: '#ffffff' }}>45% atomic payouts</strong> when their taste is proven right.
            </p>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onLaunchApp();
                }}
                className="sk-button-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#000000',
                  border: '1.5px solid #ffffff',
                  boxShadow: '3px 3px 0px #737373',
                  fontWeight: 700
                }}
              >
                <Flame size={16} color="#000000" fill="#000000" />
                <span>ENTER MISSION CONTROL</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onOpenDemo();
                }}
                className="sk-button"
                style={{
                  padding: '12px 20px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid #ffffff',
                  boxShadow: '2px 2px 0px #ffffff'
                }}
              >
                <Play size={14} color="#ffffff" fill="#ffffff" />
                <span>30-SEC DEMO</span>
              </button>

              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onOpenPasskeyModal();
                }}
                className="sk-button"
                title="Create or Sign In with Windows Hello / Touch ID"
                style={{
                  padding: '12px 18px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)'
                }}
              >
                <Fingerprint size={15} color="#ffffff" />
                <span>PASSKEY</span>
              </button>
            </div>

            {/* Micro Spec Telemetry Grid (Monochrome) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                paddingTop: '18px'
              }}
            >
              {[
                { label: 'THROUGHPUT', val: '10K TPS', sub: 'Parallel EVM' },
                { label: 'HALF-LIFE', val: '6.0 HRS', sub: 'Decay Curve' },
                { label: 'DISBURSEMENT', val: '40/45/15', sub: 'Atomic Splits' },
                { label: 'AUTH', val: 'WEBAUTHN', sub: 'Zero Seed Words' }
              ].map((item) => (
                <div
                  key={item.label}
                  className="sk-well"
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.60rem', color: '#737373' }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                    {item.val}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#a3a3a3' }}>
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 VARIANTS Section (Monochrome Black & White) ── */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 6px #ffffff'
              }}
            />
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, letterSpacing: '0.04em' }}>
              2 SESSION VARIANTS // MODES
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#737373' }}>
            INTERACTIVE WORKSTATION PROTOCOL
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {/* Variant 01: Cathode Radar Session */}
          <div
            onClick={() => {
              sound.playSwitchClick();
              setSelectedVariant('session');
              onLaunchApp();
            }}
            className="sk-panel card-hover"
            style={{
              padding: '20px',
              border: selectedVariant === 'session' ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
              boxShadow: selectedVariant === 'session' ? '4px 4px 0px #ffffff' : 'none',
              background: '#0a0a0a',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Monitor size={16} color="#ffffff" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                  01 // CATHODE RADAR SESSION
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 700
                }}
              >
                ACTIVE 60 FPS
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#a3a3a3', lineHeight: 1.5, marginBottom: '14px' }}>
              Full instrument console with dynamic live video background, time-decay radar gauges, live post discovery, and real-time Monad RPC integration.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#ffffff' }}>
              <span>OPEN CONSOLE VIEW</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Variant 02: Taste Arbitrage & Curation Math */}
          <div
            onClick={() => {
              sound.playSwitchClick();
              setSelectedVariant('wireframe');
            }}
            className="sk-panel card-hover"
            style={{
              padding: '20px',
              border: selectedVariant === 'wireframe' ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
              boxShadow: selectedVariant === 'wireframe' ? '4px 4px 0px #ffffff' : 'none',
              background: '#0a0a0a',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#ffffff" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                  02 // TASTE ARBITRAGE CALCULATOR
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff'
                }}
              >
                BONDING CURVE
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#a3a3a3', lineHeight: 1.5, marginBottom: '14px' }}>
              Interactive mathematical simulator demonstrating how early conviction earns yield from subsequent community boosts before the exponential half-life cliff.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: '#ffffff' }}>
              <span>TUNE ARBITRAGE SIMULATOR</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Taste Arbitrage Calculator & Analog Gauge (Monochrome) ── */}
      <section
        className="sk-panel"
        style={{
          padding: 'clamp(20px, 3vw, 36px)',
          marginBottom: '36px',
          background: '#080808',
          border: '1.5px solid #ffffff',
          boxShadow: '4px 4px 0px #ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#ffffff" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Taste Arbitrage & Curation Math Engine
              </h3>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#737373', marginTop: '4px' }}>
              SIMULATE EARLY CONVICTION // CONTINUOUS DECAY HALF-LIFE = 6.0 HOURS
            </p>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              padding: '3px 8px',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 700
            }}
          >
            ATOMIC 40 / 45 / 15 DISTRIBUTION
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '28px', alignItems: 'center' }} className="mission-console-grid">
          {/* Controls */}
          <div>
            {/* Slider 1: Your Boost Amount */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#a3a3a3' }}>
                  YOUR INITIAL BOOST AMOUNT:
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  {simulatedBoost.toFixed(1)} MON
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={simulatedBoost}
                onChange={(e) => {
                  sound.playDialTick();
                  setSimulatedBoost(parseFloat(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#ffffff', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Discovery Timing */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#a3a3a3' }}>
                  DISCOVERY TIMING (HOURS SINCE GENESIS):
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  HOUR {simulatedHour} {simulatedHour <= 2 ? '(EARLY SIGNAL α)' : '(LATE CONVERGENCE)'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={simulatedHour}
                onChange={(e) => {
                  sound.playDialTick();
                  setSimulatedHour(parseInt(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#ffffff', cursor: 'pointer' }}
              />
            </div>

            {/* Yield Output Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="sk-well" style={{ padding: '12px', textAlign: 'center', background: '#0f0f0f', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#737373' }}>
                  DOWNSTREAM 45% POOL
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatMon(laterBoosts * 0.45, 2)} MON
                </div>
              </div>

              <div className="sk-well" style={{ padding: '12px', textAlign: 'center', background: '#0f0f0f', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#737373' }}>
                  PROJECTED EARNED
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  +{formatMon(estimatedEarned, 2)} MON
                </div>
              </div>

              <div className="sk-well" style={{ padding: '12px', textAlign: 'center', background: '#0f0f0f', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#737373' }}>
                  TASTE ROI %
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {estimatedRoi}%
                </div>
              </div>
            </div>
          </div>

          {/* Right: Analog Decay Gauge Preview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <AnalogDecayGauge
              createdAt={Math.floor(Date.now() / 1000) - simulatedHour * 3600}
              totalWeight={10.0}
              decayedWeight={Math.round(10.0 * decayPenalty * 10) / 10}
              velocityScore={Math.round((simulatedBoost * 2.2) / simulatedHour * 10) / 10}
              size="md"
            />
            <div style={{ marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#a3a3a3', textAlign: 'center' }}>
              EFFECTIVE WEIGHT REMAINING: {Math.round(decayPenalty * 100)}%
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Architecture Principles (Monochrome Wireframe Panels) ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="mission-console-grid">
        <div className="sk-panel card-hover" style={{ padding: '22px', border: '1px solid rgba(255, 255, 255, 0.2)', background: '#080808' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={16} color="#ffffff" />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
              01 // Time-Decay Physics
            </h4>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.84rem', color: '#a3a3a3', lineHeight: 1.55 }}>
            Signals decay with a 6-hour half-life curve: <code style={{ color: '#ffffff' }}>W(t) = W₀ × 2^(-Δt/6h)</code>. No post dominates forever; fresh capital and ongoing discovery continuously recalibrate the radar.
          </p>
        </div>

        <div className="sk-panel card-hover" style={{ padding: '22px', border: '1px solid rgba(255, 255, 255, 0.2)', background: '#080808' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} color="#ffffff" />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
              02 // Atomic 40/45/15 Routing
            </h4>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.84rem', color: '#a3a3a3', lineHeight: 1.55 }}>
            Every boost is split atomically: 40% immediately to author, 45% divided proportionally among earlier curators based on their effective weight, and 15% to pool reserve.
          </p>
        </div>

        <div className="sk-panel card-hover" style={{ padding: '22px', border: '1px solid rgba(255, 255, 255, 0.2)', background: '#080808' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={16} color="#ffffff" />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
              03 // Anti-Gaming Diminishing Returns
            </h4>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.84rem', color: '#a3a3a3', lineHeight: 1.55 }}>
            Self-boosting triggers an instant on-chain transaction revert. Repeated boosts from the same wallet incur a diminishing multiplier (100% → 85% → 70% → 55% → 40%).
          </p>
        </div>
      </section>
    </div>
  );
};
