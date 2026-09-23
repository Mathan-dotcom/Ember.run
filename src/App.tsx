import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { HeaderConsole } from './components/HeaderConsole';
import { LandingPage } from './components/LandingPage';
import { PostComposer } from './components/PostComposer';
import { FeedRadar } from './components/FeedRadar';
import { BoostModal } from './components/BoostModal';
import { AuditLedger } from './components/AuditLedger';
import { CuratorLeaderboard } from './components/CuratorLeaderboard';
import { AntiGamingTelemetry } from './components/AntiGamingTelemetry';
import { PasskeyAuthModal } from './components/PasskeyAuthModal';
import { DemoSequenceModal } from './components/DemoSequenceModal';
import { DynamicLiveWallpaper } from './components/DynamicLiveWallpaper';
import { Post } from './types/signal';
import { formatMon } from './utils/decay';
import { Radio, Activity, Cpu, Layers, Award } from 'lucide-react';

const MissionControlContent: React.FC = () => {
  const { posts, auditLogs, isPasskeyModalOpen, setIsPasskeyModalOpen } = useWallet();
  const [activeView, setActiveView] = useState<'landing' | 'console'>('landing');
  const [activeBoostPost, setActiveBoostPost] = useState<Post | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Compute aggregate metrics
  const totalVolume = posts.reduce((sum, p) => sum + p.totalBoosted, 0);
  const totalCuratorPayouts = auditLogs
    .filter((l) => l.role === 'CURATOR')
    .reduce((sum, l) => sum + l.amount, 0);
  const totalPosts = posts.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient Dynamic Live Wallpaper */}
      <DynamicLiveWallpaper />

      {/* Instrument Console Header */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <HeaderConsole
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenPasskeyModal={() => setIsPasskeyModalOpen(true)}
        />
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1, position: 'relative', zIndex: 1 }}>
        {activeView === 'landing' ? (
          <LandingPage
            onLaunchApp={() => setActiveView('console')}
            onOpenDemo={() => setIsDemoModalOpen(true)}
            onOpenPasskeyModal={() => setIsPasskeyModalOpen(true)}
          />
        ) : (
          <>
            {/* Physical Instrument Telemetry Ribbon */}
            <section className="sk-panel telemetry-ribbon">
          {/* Rivets in corners */}
          <div style={{ position: 'absolute', top: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', top: '8px', right: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px' }} className="sk-rivet" />

          {/* Metric 1: Total Curation Volume */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-blue" />
              <span className="text-micro" style={{ color: 'var(--cyan-accent)' }}>TOTAL CURATION VOLUME</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                textShadow: '0 0 16px rgba(0, 240, 255, 0.4)'
              }}
            >
              {formatMon(totalVolume, 2)}
              <span style={{ fontSize: '0.9rem', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 2: Provable Taste Arbitrage Earned */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span className="text-micro" style={{ color: '#00ff9d' }}>CURATOR DISBURSEMENTS</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#00ff9d',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                textShadow: '0 0 16px rgba(0, 255, 157, 0.5)'
              }}
            >
              +{formatMon(totalCuratorPayouts, 2)}
              <span style={{ fontSize: '0.9rem', color: '#00ff9d', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 3: Active Signals on Radar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-blue" />
              <span className="text-micro" style={{ color: '#836ef9' }}>ACTIVE EMBERS ON RADAR</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#ffffff',
                textShadow: '0 0 16px rgba(131, 110, 249, 0.4)'
              }}
            >
              {totalPosts}{' '}
              <span style={{ fontSize: '0.85rem', color: '#836ef9', fontFamily: 'var(--font-mono)' }}>EMBERS</span>
            </div>
          </div>

          {/* Metric 4: Monad Consensus Status */}
          <div
            className="sk-well"
            style={{
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan-accent)' }}>
                MONAD PARALLEL PIPELINE
              </span>
              <span className="sk-lamp sk-lamp-green" />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              10,000 TPS // 1-SEC FINALITY
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
              CHAIN ID: 10143 (MONAD TESTNET)
            </div>
          </div>
        </section>

        {/* Console Grid Layout: Responsive 2-Columns */}
        <div className="mission-console-grid">
          {/* Left Column: Post Composer & Live Decay Feed */}
          <div style={{ minWidth: 0 }}>
            <PostComposer />
            <FeedRadar onOpenBoost={(post) => setActiveBoostPost(post)} />
          </div>

          {/* Right Column: Audit Ledger, Leaderboard, & Telemetry */}
          <div style={{ minWidth: 0 }}>
            <AuditLedger />
            <CuratorLeaderboard />
            <AntiGamingTelemetry />
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer Housing */}
      <footer
        style={{
          background: 'rgba(9, 7, 16, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'var(--ink-soft)',
          padding: '18px 24px',
          borderTop: '1px solid rgba(131, 110, 249, 0.25)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sk-lamp sk-lamp-green" />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            EMBER.RUN // MONAD METROPOLIS — TRACK 03: SOCIAL, ATTENTION & CULTURE
          </span>
        </div>
        <div style={{ color: 'var(--cyan-accent)', textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}>
          CYBERPUNK NEO-BRUTALIST DARK GLASS UI // MONAD HIGH-THROUGHPUT ENGINE
        </div>
      </footer>

      {/* Modals */}
      <BoostModal
        post={activeBoostPost}
        isOpen={!!activeBoostPost}
        onClose={() => setActiveBoostPost(null)}
      />

      <PasskeyAuthModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
      />

      <DemoSequenceModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <MissionControlContent />
    </WalletProvider>
  );
};

export default App;
