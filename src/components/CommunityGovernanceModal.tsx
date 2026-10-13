import React from 'react';
import { X, Users, GitPullRequest, ShieldCheck, Award, ExternalLink, BookOpen, MessageSquare } from 'lucide-react';

interface CommunityGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityGovernanceModal: React.FC<CommunityGovernanceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sk-panel-raised"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0d0d',
          border: '2px solid #a855f7',
          boxShadow: '8px 8px 0px #7e22ce',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1.5px solid #a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1a1025'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="#a855f7" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                COMMUNITY TEAM &amp; CURATION GOVERNANCE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#d8b4fe' }}>
                Best Community Team Project // Open Source Decentralized Curation
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mission */}
          <div
            style={{
              background: '#171022',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Award size={15} color="#c084fc" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, color: '#c084fc' }}>
                OPEN COMMUNITY COURIER // SOCIAL ATTENTION &amp; CULTURE
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#e9d5ff', margin: 0, lineHeight: 1.5 }}>
              Ember.run transforms social discovery from black-box corporate algorithmic feeds into an open, community-governed curation market. Every post is curated transparently on Monad Testnet, with community members receiving real-time rewards for identifying high-signal ideas first.
            </p>
          </div>

          {/* Core Pillars Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Pillar 1 */}
            <div style={{ background: '#120d1c', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldCheck size={14} color="#4ade80" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>
                  Decentralized Moderation
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.70rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Anti-gaming rules (diminishing returns, self-boost blocking, 6h half-life decay) prevent plutocratic manipulation.
              </p>
            </div>

            {/* Pillar 2 */}
            <div style={{ background: '#120d1c', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <GitPullRequest size={14} color="#38bdf8" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>
                  Open Source Codebase
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.70rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Fully open repository under MIT/ISC license. Community PRs welcomed via structured contribution guidelines.
              </p>
            </div>

            {/* Pillar 3 */}
            <div style={{ background: '#120d1c', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Users size={14} color="#f472b6" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>
                  Community Team Roles
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.70rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Core Architects, Curator Guild Leads, Telemetry Stewards, and Smart Contract Auditing contributors.
              </p>
            </div>
          </div>

          {/* Contributing Links Banner */}
          <div
            style={{
              background: '#0a0a0a',
              border: '1.5px solid #a855f7',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, color: '#ffffff' }}>
                WANT TO CONTRIBUTE TO EMBER.RUN?
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.70rem', color: '#a1a1aa', marginTop: '2px' }}>
                Check out our <code style={{ color: '#d8b4fe' }}>CONTRIBUTING.md</code> guide for PR workflow and style standards.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="https://github.com/Mathan-dotcom/Ember.run/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#a855f7',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={12} />
                <span>CONTRIBUTING GUIDE</span>
              </a>
              <a
                href="https://github.com/Mathan-dotcom/Ember.run"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#222',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={12} />
                <span>GITHUB REPO</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
