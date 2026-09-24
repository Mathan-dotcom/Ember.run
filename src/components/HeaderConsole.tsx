import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { Fingerprint, Coins, Play, ChevronDown, Flame, Zap, Server } from 'lucide-react';
import { backendApi, BackendHealth } from '../services/api';

interface HeaderConsoleProps {
  activeView: 'landing' | 'console';
  onChangeView: (view: 'landing' | 'console') => void;
  onOpenDemo: () => void;
  onOpenPasskeyModal: () => void;
}

export const HeaderConsole: React.FC<HeaderConsoleProps> = ({
  activeView,
  onChangeView,
  onOpenDemo,
  onOpenPasskeyModal
}) => {
  const { currentAccount, accounts, switchAccount, requestFaucet } = useWallet();
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);

  useEffect(() => {
    let mounted = true;
    backendApi.checkHealth().then((health) => {
      if (mounted) setBackendHealth(health);
    });
    const interval = setInterval(() => {
      backendApi.checkHealth().then((health) => {
        if (mounted) setBackendHealth(health);
      });
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)',
        padding: '12px 24px',
        color: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Left: Minimalist Brand Identity & Network Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ffffff'
              }}
            >
              <Flame size={18} color="#000000" fill="#000000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#ffffff'
                  }}
                >
                  EMBER.RUN
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontWeight: 700
                  }}
                >
                  MONAD // T03
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--ink-soft)',
                  marginTop: '-2px',
                  letterSpacing: '0.04em'
                }}
              >
                TIME-DECAYING CURATION MARKET
              </p>
            </div>
          </div>

          {/* Network Indicator Lamp */}
          <div
            className="sk-badge sk-badge--inverted"
            title="Monad Testnet RPC Connected (Chain ID: 10143)"
            style={{ fontSize: '0.70rem', padding: '5px 10px' }}
          >
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              MONAD : 10143
            </span>
          </div>

          {/* Offchain API HUD */}
          <div
            className="sk-badge sk-badge--inverted"
            title={backendHealth ? `Ember Offchain Service Online (${backendHealth.monadTestnet.latencyMs})` : 'Offchain Indexer & Profile Cache Standby'}
            style={{
              fontSize: '0.70rem',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Server size={11} color="#ffffff" />
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: backendHealth ? '#ffffff' : '#666',
                boxShadow: backendHealth ? '0 0 6px #ffffff' : 'none'
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', color: backendHealth ? '#ffffff' : 'var(--ink-soft)' }}>
              {backendHealth ? 'API : ACTIVE' : 'API : STANDBY'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs: Overview vs Mission Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#0d0d0d',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <button
            onClick={() => {
              sound.playSwitchClick();
              onChangeView('landing');
            }}
            className={`sk-button ${activeView === 'landing' ? 'sk-button-primary' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              borderRadius: '4px',
              border: activeView === 'landing' ? '1px solid #ffffff' : 'none',
              background: activeView === 'landing' ? '#ffffff' : 'transparent',
              color: activeView === 'landing' ? '#000000' : 'var(--ink-soft)',
              boxShadow: 'none'
            }}
          >
            <span>OVERVIEW</span>
          </button>

          <button
            onClick={() => {
              sound.playSwitchClick();
              onChangeView('console');
            }}
            className={`sk-button ${activeView === 'console' ? 'sk-button-primary' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              borderRadius: '4px',
              border: activeView === 'console' ? '1px solid #ffffff' : 'none',
              background: activeView === 'console' ? '#ffffff' : 'transparent',
              color: activeView === 'console' ? '#000000' : 'var(--ink-soft)',
              boxShadow: 'none'
            }}
          >
            <Zap size={12} color={activeView === 'console' ? '#000000' : 'var(--ink-soft)'} />
            <span>MISSION CONTROL</span>
          </button>
        </div>

        {/* Center/Right: Actions & Passkey Wallet Mission Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* 30-Second Guided Demo Button */}
          <button
            onClick={() => {
              sound.playSwitchClick();
              onOpenDemo();
            }}
            className="sk-button-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem'
            }}
          >
            <Play size={12} color="#000000" fill="#000000" />
            <span>30-SEC DEMO</span>
          </button>

          {/* Testnet Faucet Button */}
          <button
            onClick={() => requestFaucet()}
            className="sk-button"
            title="Request 5.0 testnet MON from the faucet"
            style={{
              padding: '6px 12px',
              fontSize: '0.76rem'
            }}
          >
            <Coins size={13} color="#ffffff" />
            <span>+5.0 MON FAUCET</span>
          </button>

          {/* Passkey Identity Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0d0d0d',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '4px 6px 4px 12px',
              gap: '10px',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)'
            }}
          >
            {/* Balance in MON */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.0rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1
                }}
              >
                {formatMon(currentAccount.balanceMon, 2)}{' '}
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)' }}>
                  MON
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: 'var(--ink-soft)'
                }}
              >
                TESTNET LIQUIDITY
              </div>
            </div>

            {/* Account Switcher / Passkey Badge */}
            <div style={{ position: 'relative' }}>
              <select
                className="header-account-select"
                value={currentAccount.id}
                onChange={(e) => {
                  if (e.target.value === 'new_passkey') {
                    onOpenPasskeyModal();
                  } else {
                    switchAccount(e.target.value);
                  }
                }}
                style={{
                  appearance: 'none',
                  background: '#161616',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '5px 26px 5px 8px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <optgroup label="Simulated Seed Wallets (Real Tx)">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} style={{ background: '#111111', color: '#ffffff' }}>
                      {acc.name} ({formatAddress(acc.address)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Biometric Passkey (No Seed Phrase)">
                  <option value="new_passkey" style={{ background: '#111111', color: '#ffffff' }}>
                    + Create Passkey Wallet...
                  </option>
                </optgroup>
              </select>
              <ChevronDown
                size={13}
                style={{
                  position: 'absolute',
                  right: '7px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#ffffff'
                }}
              />
            </div>

            {/* Passkey Icon indicator */}
            <button
              onClick={onOpenPasskeyModal}
              title="Passkey Security Console"
              className="sk-button"
              style={{
                borderRadius: '4px',
                padding: '5px 8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <Fingerprint size={15} color="#ffffff" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderConsole;
