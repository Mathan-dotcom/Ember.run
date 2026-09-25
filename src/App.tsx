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
import { CuratorProfileModal } from './components/CuratorProfileModal';
import { PostDetailModal } from './components/PostDetailModal';
import { DynamicLiveWallpaper } from './components/DynamicLiveWallpaper';
import { Post } from './types/signal';
import { formatMon } from './utils/decay';
import { Radio, Activity, Cpu, Layers, Award } from 'lucide-react';
import { useScrollFade } from './hooks/useScrollFade';

const MissionControlContent: React.FC = () => {
  const { posts, auditLogs, isPasskeyModalOpen, setIsPasskeyModalOpen } = useWallet();
  const [activeView, setActiveView] = useState<'landing' | 'console'>('landing');
  const [activeBoostPost, setActiveBoostPost] = useState<Post | null>(null);
  const [activeDetailPost, setActiveDetailPost] = useState<Post | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [activeProfileAddress, setActiveProfileAddress] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Activate dynamic scroll fade in and fade out engine for all cards
  useScrollFade(activeView);

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

      {/* Mission Control Top Frosted Edge Fade Overlay */}
      {activeView === 'console' && (
        <div
          style={{
            position: 'sticky',
            top: '64px',
            left: 0,
            right: 0,
            height: '24px',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 100%)',
            pointerEvents: 'none',
            zIndex: 45,
            marginBottom: '-24px'
          }}
        />
      )}

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
            <section className="sk-panel telemetry-ribbon scroll-fade-card" style={{ border: '1.5px solid #ffffff', borderRadius: '0px', boxShadow: '4px 4px 0px #ffffff', marginBottom: '24px' }}>
          {/* Rivets in corners */}
          <div style={{ position: 'absolute', top: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', top: '8px', right: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px' }} className="sk-rivet" />

          {/* Metric 1: Total Curation Volume */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span className="text-micro" style={{ color: '#ffffff' }}>TOTAL CURATION VOLUME</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px'
              }}
            >
              {formatMon(totalVolume, 2)}
              <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 2: Provable Taste Arbitrage Earned */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span className="text-micro" style={{ color: '#ffffff' }}>CURATOR DISBURSEMENTS</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px'
              }}
            >
              +{formatMon(totalCuratorPayouts, 2)}
              <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 3: Active Signals on Radar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span className="text-micro" style={{ color: '#ffffff' }}>ACTIVE EMBERS ON RADAR</span>
            </div>
            <div
              className="text-display-md"
              style={{
                fontSize: '2rem',
                color: '#ffffff'
              }}
            >
              {totalPosts}{' '}
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)' }}>EMBERS</span>
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
              border: '1.5px solid #ffffff',
              borderRadius: '0px',
              boxShadow: '3px 3px 0px #ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ffffff', fontWeight: 700 }}>
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
            <FeedRadar
              onOpenBoost={(post) => setActiveBoostPost(post)}
              onInspectPost={(post) => setActiveDetailPost(post)}
            />
          </div>

          {/* Right Column: Audit Ledger, Leaderboard, & Telemetry */}
          <div style={{ minWidth: 0 }}>
            <AuditLedger />
            <CuratorLeaderboard
              onOpenProfile={(address) => {
                setActiveProfileAddress(address);
                setIsProfileModalOpen(true);
              }}
            />
            <AntiGamingTelemetry />
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer Housing */}
      <footer
        style={{
          background: '#000000',
          color: 'var(--ink-soft)',
          padding: '18px 24px',
          borderTop: '1.5px solid #ffffff',
          boxShadow: '0 -2px 0px #ffffff',
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
        <div style={{ color: '#ffffff', fontWeight: 700 }}>
          PARTIAL NEO-BRUTALIST MONOCHROME UI // MONAD HIGH-THROUGHPUT ENGINE
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

      <CuratorProfileModal
        address={activeProfileAddress}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <PostDetailModal
        post={activeDetailPost}
        isOpen={!!activeDetailPost}
        onClose={() => setActiveDetailPost(null)}
        onOpenBoost={(post) => setActiveBoostPost(post)}
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
