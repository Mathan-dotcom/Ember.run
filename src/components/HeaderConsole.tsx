import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { Fingerprint, Coins, Play, ChevronDown, Flame, Zap } from 'lucide-react';

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

  return (
    <header
      style={{
        background: 'rgba(9, 7, 16, 0.85)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        borderBottom: '1px solid rgba(131, 110, 249, 0.28)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(131, 110, 249, 0.1)',
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
        {/* Left: Cyber Brand Identity & Network HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #836ef9 0%, #ff5722 100%)',
                boxShadow: '0 0 16px rgba(131, 110, 249, 0.7), 0 0 8px rgba(255, 87, 34, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <Flame size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#ffffff',
                    textShadow: '0 0 16px rgba(131, 110, 249, 0.6), 0 0 30px rgba(0, 240, 255, 0.3)'
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
                    background: 'rgba(131, 110, 249, 0.15)',
                    color: '#00f0ff',
                    border: '1px solid rgba(0, 240, 255, 0.35)',
                    textShadow: '0 0 8px rgba(0, 240, 255, 0.6)',
                    fontWeight: 700
                  }}
                >
                  MONAD // T03
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
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
            style={{ fontSize: '0.72rem', padding: '5px 12px' }}
          >
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              MONAD TESTNET : 10143
            </span>
          </div>
        </div>

        {/* Navigation Tabs: Overview vs Mission Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(15, 12, 26, 0.8)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(131, 110, 249, 0.25)'
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
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: activeView === 'landing' ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
              background: activeView === 'landing' ? undefined : 'transparent',
              boxShadow: activeView === 'landing' ? undefined : 'none'
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
              fontSize: '0.78rem',
              borderRadius: '6px',
              border: activeView === 'console' ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
              background: activeView === 'console' ? undefined : 'transparent',
              boxShadow: activeView === 'console' ? undefined : 'none'
            }}
          >
            <Zap size={13} color={activeView === 'console' ? '#00f0ff' : '#a5a0cc'} />
            <span>MISSION CONTROL</span>
          </button>
        </div>

        {/* Center/Right: Actions & Passkey Wallet Mission Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* 30-Second Guided Demo Button */}
          <button
            onClick={() => {
              sound.playSwitchClick();
              onOpenDemo();
            }}
            className="sk-button"
            style={{
              background: 'rgba(25, 20, 42, 0.9)',
              color: '#ffffff',
              border: '1px solid rgba(0, 255, 157, 0.4)',
              boxShadow: '0 0 15px rgba(0, 255, 157, 0.25)',
              padding: '6px 14px',
              fontSize: '0.8rem'
            }}
          >
            <Play size={13} color="#00ff9d" fill="#00ff9d" />
            <span style={{ fontWeight: 700 }}>30-SEC DEMO</span>
          </button>

          {/* Testnet Faucet Button */}
          <button
            onClick={() => requestFaucet()}
            className="sk-button"
            title="Request 5.0 testnet MON from the faucet"
            style={{
              background: 'rgba(28, 23, 48, 0.85)',
              color: '#f8f7ff',
              borderColor: 'rgba(131, 110, 249, 0.4)',
              padding: '6px 12px',
              fontSize: '0.78rem'
            }}
          >
            <Coins size={14} color="#00f0ff" />
            <span>+5.0 MON FAUCET</span>
          </button>

          {/* Passkey Identity Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(14, 11, 24, 0.95)',
              border: '1px solid rgba(131, 110, 249, 0.35)',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '4px 6px 4px 14px',
              gap: '12px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(131, 110, 249, 0.15)'
            }}
          >
            {/* Balance in MON */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1
                }}
              >
                {formatMon(currentAccount.balanceMon, 2)}{' '}
                <span style={{ fontSize: '0.75rem', color: '#00f0ff', fontFamily: 'var(--font-mono)' }}>
                  MON
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
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
                  background: 'rgba(24, 20, 42, 0.95)',
                  border: '1px solid rgba(131, 110, 249, 0.4)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '6px 28px 6px 10px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <optgroup label="Simulated Seed Wallets (Real Tx)">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} style={{ background: '#141124', color: '#ffffff' }}>
                      {acc.name} ({formatAddress(acc.address)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Biometric Passkey (No Seed Phrase)">
                  <option value="new_passkey" style={{ background: '#141124', color: '#00f0ff' }}>
                    + Create Passkey Wallet...
                  </option>
                </optgroup>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#00f0ff'
                }}
              />
            </div>

            {/* Passkey Icon indicator */}
            <button
              onClick={onOpenPasskeyModal}
              title="Passkey Security Console"
              style={{
                background: 'rgba(131, 110, 249, 0.25)',
                border: '1px solid rgba(131, 110, 249, 0.5)',
                borderRadius: '6px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(131, 110, 249, 0.3)'
              }}
            >
              <Fingerprint size={16} color="#00f0ff" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderConsole;
