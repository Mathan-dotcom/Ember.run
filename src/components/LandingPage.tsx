import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { AnalogDecayGauge } from './AnalogDecayGauge';
import { sound } from '../utils/sound';
import { formatMon } from '../utils/decay';
import {
  Flame,
  Zap,
  ShieldCheck,
  Fingerprint,
  TrendingUp,
  ArrowRight,
  Play,
  Layers,
  Sparkles,
  Cpu,
  Clock,
  Coins,
  CheckCircle2,
  ChevronRight
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
  const { posts, currentAccount, requestFaucet } = useWallet();
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
    <div className="fade-in-card" style={{ padding: '10px 0 40px 0' }}>
      {/* Hero Section */}
      <section
        className="sk-panel"
        style={{
          padding: 'clamp(28px, 6vw, 64px) clamp(20px, 5vw, 48px)',
          marginBottom: '36px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Rivets */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }} className="sk-rivet" />
        <div style={{ position: 'absolute', top: '10px', right: '10px' }} className="sk-rivet" />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }} className="sk-rivet" />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }} className="sk-rivet" />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)',
            gap: '36px',
            alignItems: 'center'
          }}
          className="mission-console-grid"
        >
          {/* Left Hero Column */}
          <div>
            {/* Status Lamps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.72rem' }}>
                <span className="sk-lamp sk-lamp-green" />
                <span style={{ fontFamily: 'var(--font-mono)' }}>MONAD METROPOLIS // TRACK 03</span>
              </span>
              <span className="sk-badge" style={{ fontSize: '0.72rem' }}>
                <span className="sk-lamp sk-lamp-amber" />
                <span>TIME-DECAYING CURATION MARKET</span>
              </span>
            </div>

            {/* Giant Engraved Fraunces Headline */}
            <h1
              className="text-display-xl"
              style={{
                marginBottom: '16px',
                color: 'var(--ink-hard)',
                lineHeight: 1.05
              }}
            >
              Good taste, provably paid.
            </h1>

            {/* Sub-headline */}
            <p
              className="text-body"
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: '#38342f',
                marginBottom: '28px',
                maxWidth: '56ch'
              }}
            >
              Likes and retweets cost nothing, so signals drown in noise. On <strong>Ember.run</strong>, boosting content
              costs real <strong>MON</strong>. Boost weights decay over time, and early curators earn automatic onchain payouts
              when their taste is proven right first.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onLaunchApp();
                }}
                className="sk-button-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  boxShadow: '0 0 16px rgba(59, 111, 214, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                }}
              >
                <Flame size={18} color="#f5a623" />
                <span>ENTER MISSION CONTROL</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onOpenDemo();
                }}
                className="sk-button"
                style={{ padding: '12px 20px', fontSize: '0.9rem' }}
              >
                <Play size={15} color="#34c76f" fill="#34c76f" />
                <span>WATCH 30-SEC DEMO</span>
              </button>
            </div>

            {/* Verification Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '22px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--ledger-muted)'
              }}
            >
              <CheckCircle2 size={14} color="#34c76f" />
              <span>100% REAL TRANSACTIONS // ZERO MOCK DATA POLICY // MONAD TESTNET</span>
            </div>
          </div>

          {/* Right Hero Column: Machined Interactive Instrument Mock */}
          <div
            className="sk-panel-walnut card-hover"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-pulse)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sk-lamp sk-lamp-green" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#cfccc2', fontWeight: 700 }}>
                  TELEMETRY // GAUGE #001
                </span>
              </div>
              <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.65rem' }}>
                LIVE DECAY DIAL
              </span>
            </div>

            {/* Gauge Presentation */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 16px 0' }}>
              <AnalogDecayGauge
                createdAt={Math.floor(Date.now() / 1000) - 3600}
                totalWeight={10.0}
                decayedWeight={8.9}
                velocityScore={4.5}
                size="lg"
              />
            </div>

            {/* Console Readout Matrix */}
            <div
              className="sk-well-dark"
              style={{
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ledger-muted)' }}>PROTOCOL SPLIT:</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>40% AUTHOR / 45% CURATORS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ledger-muted)' }}>DISBURSEMENT:</span>
                <span style={{ color: '#34c76f', fontWeight: 700 }}>ATOMIC ONCHAIN (NO CLAIMS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ledger-muted)' }}>ANTI-GAMING:</span>
                <span style={{ color: '#f5a623', fontWeight: 700 }}>SELF-BOOST REVERT ARMED</span>
              </div>
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  sound.playSwitchClick();
                  onLaunchApp();
                }}
                className="sk-button"
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, #3d3932, #24221e)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  padding: '8px'
                }}
              >
                <span>OPEN FEED & TEST ONCHAIN</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: The Attention Crisis vs The Curation Market */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="sk-index" data-index="01" />
          <h2 className="text-heading">THE ATTENTION CRISIS & THE SOLUTION</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Card 1: The Broken State */}
          <div className="sk-panel card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="sk-lamp sk-lamp-red" />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.05rem', fontWeight: 700 }}>
                Traditional Social Likes = $0
              </h3>
            </div>
            <p className="text-body" style={{ fontSize: '0.88rem', color: '#44403b', lineHeight: 1.6 }}>
              On Twitter and Farcaster, likes cost nothing. There is zero separation between genuine early discovery
              and algorithmic noise. Curators who spot great creators or alpha signals months in advance get the exact
              same reward as someone who likes a post after it has already gone viral: <strong>nothing</strong>.
            </p>
          </div>

          {/* Card 2: Ember.run Curation Markets */}
          <div className="sk-panel card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.05rem', fontWeight: 700 }}>
                Ember.run = Paid Taste Arbitrage
              </h3>
            </div>
            <p className="text-body" style={{ fontSize: '0.88rem', color: '#44403b', lineHeight: 1.6 }}>
              When boosting requires real capital, curation transforms into an onchain asset class. Every boost is split
              atomically: 40% to the creator and 45% distributed proportionally to earlier curators. If you identify a gem
              early, your taste becomes provably recorded and automatically compensated.
            </p>
          </div>
        </div>
      </section>

      {/* Section 02: Core Protocol Mechanics */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="sk-index" data-index="02" />
          <h2 className="text-heading">THREE CORE PROTOCOL PILLARS</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Pillar 1 */}
          <div className="sk-panel card-hover" style={{ padding: '22px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #3b6fd6, #1d3557)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 0 10px rgba(59, 111, 214, 0.4)'
              }}
            >
              <Zap size={18} color="#ffffff" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
              Atomic 40 / 45 / 15 Splits
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: '#44403b', lineHeight: 1.55 }}>
              Smart contract distributes payouts in the exact same transaction. 40% goes directly to the author, 45% is
              streamed proportionally to earlier curators, and 15% is retained in the post's pool reserve. No manual claiming
              portals or lockup periods.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="sk-panel card-hover" style={{ padding: '22px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #f5a623, #a46d0a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 0 10px rgba(245, 166, 35, 0.4)'
              }}
            >
              <Clock size={18} color="#ffffff" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
              Continuous Half-Life Decay
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: '#44403b', lineHeight: 1.55 }}>
              Boost weight decays continuously on an exponential half-life curve (W(t) = W₀ · 2^(-Δt / 6h)).
              The feed is ranked live by current active weight — old posts decay off the radar unless stoked by sustained
              interest.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="sk-panel card-hover" style={{ padding: '22px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #34c76f, #1b6337)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 0 10px rgba(52, 199, 111, 0.4)'
              }}
            >
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
              Anti-Gaming Protocol Shields
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: '#44403b', lineHeight: 1.55 }}>
              Onchain rule 1 strictly rejects self-boosting. Onchain rule 2 applies diminishing returns multipliers to repeat
              boosts from the same wallet (10000 / (10000 + 5000 · n)), making wash-curation via alt accounts
              mathematically negative-EV.
            </p>
          </div>
        </div>
      </section>

      {/* Section 03: Interactive Taste Arbitrage Calculator */}
      <section className="sk-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sk-index" data-index="03" />
            <h2 className="text-heading">TASTE ARBITRAGE CALCULATOR</h2>
          </div>
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.72rem' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span>ESTIMATED ONCHAIN YIELD</span>
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: '28px',
            alignItems: 'center'
          }}
          className="mission-console-grid"
        >
          {/* Controls */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-micro">YOUR BOOST QUANTUM</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{simulatedBoost.toFixed(1)} MON</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={simulatedBoost}
                onChange={(e) => {
                  sound.playDialTick();
                  setSimulatedBoost(parseFloat(e.target.value));
                }}
                style={{ width: '100%', accentColor: '#3b6fd6', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-micro">DISCOVERY TIMING (HOURS AFTER POSTING)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Hour {simulatedHour}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={simulatedHour}
                onChange={(e) => {
                  sound.playDialTick();
                  setSimulatedHour(parseInt(e.target.value, 10));
                }}
                style={{ width: '100%', accentColor: '#f5a623', cursor: 'pointer' }}
              />
            </div>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--ink-soft)', lineHeight: 1.4 }}>
              Earlier discovery captures maximum curator weight before the 6-hour decay half-life takes effect.
            </p>
          </div>

          {/* Calculator Output Readout */}
          <div
            className="sk-well"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div>
              <div className="text-micro" style={{ color: 'var(--ink-soft)' }}>
                PROJECTED ATOMIC RETURN
              </div>
              <div
                className="text-display-md"
                style={{
                  color: '#279a52',
                  fontSize: '2.2rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px'
                }}
              >
                +{formatMon(estimatedEarned, 2)}
                <span style={{ fontSize: '1rem', color: '#f5a623', fontFamily: 'var(--font-mono)' }}>MON</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Estimated Net ROI:</span>
              <span style={{ fontWeight: 700, color: estimatedRoi >= 100 ? '#279a52' : '#f5a623' }}>
                {estimatedRoi}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Decay Multiplier:</span>
              <span style={{ fontWeight: 700 }}>{Math.round(decayPenalty * 100)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section
        className="sk-panel-walnut"
        style={{
          padding: '32px',
          textAlign: 'center',
          borderRadius: 'var(--radius-pulse)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f5a623, #e0392f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(245, 166, 35, 0.6)'
          }}
        >
          <Flame size={22} color="#ffffff" />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            color: '#f4f1e8',
            maxWidth: '40ch'
          }}
        >
          Ready to turn your taste into an onchain asset class?
        </h2>

        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: '#cfccc2', maxWidth: '52ch' }}>
          Connect seamlessly using Passkey biometric authentication. No seed phrases, instant Monad testnet transactions.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => {
              sound.playSwitchClick();
              onLaunchApp();
            }}
            className="sk-button-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            <span>LAUNCH EMBER.RUN FEED</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => {
              sound.playSwitchClick();
              onOpenPasskeyModal();
            }}
            className="sk-button"
            style={{
              background: 'linear-gradient(180deg, #3d3932, #201e1a)',
              color: '#ffffff',
              padding: '12px 20px',
              fontSize: '0.9rem'
            }}
          >
            <Fingerprint size={16} color="#3b6fd6" />
            <span>CREATE PASSKEY WALLET</span>
          </button>
        </div>
      </section>
    </div>
  );
};
