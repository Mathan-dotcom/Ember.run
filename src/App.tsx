import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { HeaderConsole } from './components/HeaderConsole';
import { PostComposer } from './components/PostComposer';
import { FeedRadar } from './components/FeedRadar';
import { BoostModal } from './components/BoostModal';
import { AuditLedger } from './components/AuditLedger';
import { CuratorLeaderboard } from './components/CuratorLeaderboard';
import { AntiGamingTelemetry } from './components/AntiGamingTelemetry';
import { PasskeyAuthModal } from './components/PasskeyAuthModal';
import { DemoSequenceModal } from './components/DemoSequenceModal';
import { Post } from './types/signal';
import { formatMon } from './utils/decay';
import { Radio, Activity, Cpu, Layers, Award } from 'lucide-react';

const MissionControlContent: React.FC = () => {
  const { posts, auditLogs, isPasskeyModalOpen, setIsPasskeyModalOpen } = useWallet();
  const [activeBoostPost, setActiveBoostPost] = useState<Post | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Compute aggregate metrics
  const totalVolume = posts.reduce((sum, p) => sum + p.totalBoosted, 0);
  const totalCuratorPayouts = auditLogs
    .filter((l) => l.role === 'CURATOR')
    .reduce((sum, l) => sum + l.amount, 0);
  const totalPosts = posts.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Instrument Console Header */}
      <HeaderConsole
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenPasskeyModal={() => setIsPasskeyModalOpen(true)}
      />

      {/* Main Mission Control Console Body */}
      <main style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {/* Physical Instrument Telemetry Ribbon */}
        <section
          className="sk-panel"
          style={{
            padding: '16px 24px',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          {/* Rivets in corners */}
          <div style={{ position: 'absolute', top: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', top: '8px', right: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px' }} className="sk-rivet" />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px' }} className="sk-rivet" />

          {/* Metric 1: Total Curation Volume */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-amber" />
              <span className="text-micro">TOTAL CURATION VOLUME</span>
            </div>
            <div
              className="text-display-md"
              style={{ fontSize: '2rem', color: 'var(--ink-hard)', display: 'flex', alignItems: 'baseline', gap: '6px' }}
            >
              {formatMon(totalVolume, 2)}
              <span style={{ fontSize: '0.9rem', color: '#f5a623', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 2: Provable Taste Arbitrage Earned */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span className="text-micro">CURATOR DISBURSEMENTS</span>
            </div>
            <div
              className="text-display-md"
              style={{ fontSize: '2rem', color: '#279a52', display: 'flex', alignItems: 'baseline', gap: '6px' }}
            >
              +{formatMon(totalCuratorPayouts, 2)}
              <span style={{ fontSize: '0.9rem', color: '#34c76f', fontFamily: 'var(--font-mono)' }}>MON</span>
            </div>
          </div>

          {/* Metric 3: Active Signals on Radar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sk-lamp sk-lamp-blue" />
              <span className="text-micro">ACTIVE EMBERS ON RADAR</span>
            </div>
            <div className="text-display-md" style={{ fontSize: '2rem', color: 'var(--ink-hard)' }}>
              {totalPosts}{' '}
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>EMBERS</span>
            </div>
          </div>

          {/* Metric 4: Monad Consensus Status */}
          <div
            className="sk-well"
            style={{
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                MONAD PARALLEL PIPELINE
              </span>
              <span className="sk-lamp sk-lamp-green" />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
              10,000 TPS // 1-SEC FINALITY
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ledger-muted)' }}>
              CHAIN ID: 10143 (MONAD TESTNET)
            </div>
          </div>
        </section>

        {/* Console Grid Layout: 2 Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '28px',
            alignItems: 'start'
          }}
        >
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
      </main>

      {/* Footer Housing */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #2b2824 0%, var(--panel-walnut) 70%, #131210 100%)',
          color: 'var(--panel-alu)',
          padding: '18px 24px',
          borderTop: '1px solid rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sk-lamp sk-lamp-green" />
          <span>EMBER.RUN // MONAD METROPOLIS — TRACK 03: SOCIAL, ATTENTION & CULTURE</span>
        </div>
        <div style={{ color: 'var(--ledger-muted)' }}>
          MERIDIAN DESIGN SYSTEM 4.0.0 // INSTRUMENT-PANEL SKEUOMORPHISM
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
