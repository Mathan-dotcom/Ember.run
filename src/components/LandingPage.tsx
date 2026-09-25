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
  ArrowRight,
  Play,
  Clock,
  CheckCircle2
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
        {/* Minimalist Corner Markers */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.70rem' }}>
                <span className="sk-lamp sk-lamp-green" />
                <span style={{ fontFamily: 'var(--font-mono)' }}>MONAD METROPOLIS // TRACK 03</span>
              </span>
              <span className="sk-badge" style={{ fontSize: '0.70rem' }}>
                <span className="sk-lamp sk-lamp-amber" />
                <span>TIME-DECAYING CURATION MARKET</span>
              </span>
            </div>

            {/* Giant Minimalist Headline */}
            <h1
              className="text-display-xl"
              style={{
                marginBottom: '16px',
                color: '#ffffff',
                lineHeight: 1.02
              }}
            >
              Good taste, provably paid.
            </h1>

            {/* Sub-headline */}
            <p
              className="text-body"
              style={{
                fontSize: '1.0rem',
                lineHeight: 1.65,
                color: '#d4d4d8',
                marginBottom: '28px',
                maxWidth: '56ch'
              }}
            >
              Likes and retweets cost nothing, so signals drown in noise. On <strong>Ember.run</strong>, boosting content
              costs real <strong>MON</strong>. Boost weights decay continuously over time, and early curators earn automatic onchain payouts
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
                  padding: '11px 22px',
                  fontSize: '0.92rem'
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
                style={{ padding: '11px 20px', fontSize: '0.88rem' }}
              >
                <Play size={14} color="#ffffff" fill="#ffffff" />
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
                color: 'var(--ink-soft)'
              }}
            >
              <CheckCircle2 size={13} color="#ffffff" />
              <span>100% REAL TRANSACTIONS // ZERO MOCK DATA POLICY // MONAD TESTNET</span>
            </div>
          </div>

          {/* Right Hero Column: Instrument Card */}
          <div
            className="sk-panel-walnut card-hover"
            style={{
              padding: '24px',
              borderRadius: '0px',
              border: '1.5px solid #38bdf8',
              boxShadow: '5px 5px 0px #38bdf8',
              background: 'rgba(11, 21, 40, 0.92)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid rgba(56, 189, 248, 0.35)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sk-lamp sk-lamp-green" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#fdfaf2', fontWeight: 700 }}>
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
                fontSize: '0.76rem',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '2px 2px 0px #38bdf8',
                background: 'rgba(4, 8, 16, 0.92)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>PROTOCOL SPLIT:</span>
                <span style={{ color: '#fdfaf2', fontWeight: 700 }}>40% AUTHOR / 45% CURATORS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>DISBURSEMENT:</span>
                <span style={{ color: '#f3d38c', fontWeight: 700 }}>ATOMIC ONCHAIN (NO CLAIMS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>ANTI-GAMING:</span>
                <span style={{ color: '#fdfaf2', fontWeight: 700 }}>SELF-BOOST REVERT ARMED</span>
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
                  fontSize: '0.78rem',
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
          {/* Card 1: Traditional Social Likes */}
          <div className="sk-panel card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="sk-lamp" style={{ background: '#71717a' }} />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.02rem', fontWeight: 700, color: '#ffffff' }}>
                Traditional Social Likes = $0
              </h3>
            </div>
            <p className="text-body" style={{ fontSize: '0.88rem', color: '#d4d4d8', lineHeight: 1.6 }}>
              On Twitter and Farcaster, likes cost nothing. There is zero separation between genuine early discovery
              and algorithmic noise. Curators who spot great creators or alpha signals months in advance get the exact
              same reward as someone who likes a post after it has already gone viral: <strong>nothing</strong>.
            </p>
          </div>

          {/* Card 2: Ember.run Curation Markets */}
          <div className="sk-panel card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.02rem', fontWeight: 700, color: '#ffffff' }}>
                Ember.run = Paid Taste Arbitrage
              </h3>
            </div>
            <p className="text-body" style={{ fontSize: '0.88rem', color: '#d4d4d8', lineHeight: 1.6 }}>
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
                width: '34px',
                height: '34px',
                borderRadius: '0px',
                background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: '1.5px solid #f8fafc',
                boxShadow: '2px 2px 0px #38bdf8'
              }}
            >
              <Zap size={16} color="#030712" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.02rem', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              Atomic 40 / 45 / 15 Splits
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Smart contract distributes payouts in the exact same transaction. 40% goes directly to the author, 45% is
              streamed proportionally to earlier curators, and 15% is retained in the post's pool reserve. No manual claiming
              portals or lockup periods.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="sk-panel card-hover" style={{ padding: '22px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '0px',
                background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: '1.5px solid #f8fafc',
                boxShadow: '2px 2px 0px #38bdf8'
              }}
            >
              <Clock size={16} color="#030712" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.02rem', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              Continuous Half-Life Decay
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Boost weight decays continuously on an exponential half-life curve (W(t) = W₀ · 2^(-Δt / 6h)).
              The feed is ranked live by current active weight — old posts decay off the radar unless stoked by sustained
              interest.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="sk-panel card-hover" style={{ padding: '22px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '0px',
                background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: '1.5px solid #f8fafc',
                boxShadow: '2px 2px 0px #38bdf8'
              }}
            >
              <ShieldCheck size={16} color="#030712" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.02rem', fontWeight: 700, marginBottom: '8px', color: '#f8fafc' }}>
              Anti-Gaming Protocol Shields
            </h3>
            <p className="text-body" style={{ fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.55 }}>
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
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.70rem' }}>
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
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>{simulatedBoost.toFixed(1)} MON</span>
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
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-micro">DISCOVERY TIMING (HOURS AFTER POSTING)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7dd3fc' }}>Hour {simulatedHour}</span>
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
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
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
                  color: '#ffffff',
                  fontSize: '2.2rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px'
                }}
              >
                +{formatMon(estimatedEarned, 2)}
                <span style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>MON</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Estimated Net ROI:</span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>
                {estimatedRoi}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Decay Multiplier:</span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>{Math.round(decayPenalty * 100)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section
        className="sk-panel-walnut"
        style={{
          padding: '36px',
          textAlign: 'center',
          borderRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          border: '2px solid #38bdf8',
          boxShadow: '6px 6px 0px #38bdf8',
          background: 'rgba(11, 21, 40, 0.94)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '0px',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #f8fafc',
            boxShadow: '3px 3px 0px #38bdf8'
          }}
        >
          <Flame size={22} color="#030712" fill="#030712" />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            color: '#ffffff',
            maxWidth: '40ch'
          }}
        >
          Ready to turn your taste into an onchain asset class?
        </h2>

        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', color: '#d4d4d8', maxWidth: '52ch' }}>
          Connect seamlessly using Passkey biometric authentication. No seed phrases, instant Monad testnet transactions.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => {
              sound.playSwitchClick();
              onLaunchApp();
            }}
            className="sk-button-primary"
            style={{ padding: '11px 26px', fontSize: '0.9rem' }}
          >
            <span>LAUNCH EMBER.RUN FEED</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => {
              sound.playSwitchClick();
              onOpenPasskeyModal();
            }}
            className="sk-button"
            style={{
              padding: '11px 20px',
              fontSize: '0.88rem'
            }}
          >
            <Fingerprint size={15} color="#ffffff" />
            <span>CREATE PASSKEY WALLET</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
