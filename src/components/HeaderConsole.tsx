import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon } from '../utils/decay';
import { MONAD_TESTNET_CONFIG } from '../contracts/config';
import { sound } from '../utils/sound';
import { Shield, Fingerprint, Coins, Play, ChevronDown, Radio } from 'lucide-react';

interface HeaderConsoleProps {
  onOpenDemo: () => void;
  onOpenPasskeyModal: () => void;
}

export const HeaderConsole: React.FC<HeaderConsoleProps> = ({
  onOpenDemo,
  onOpenPasskeyModal
}) => {
  const { currentAccount, accounts, switchAccount, requestFaucet } = useWallet();

  return (
    <header
      style={{
        background: 'linear-gradient(180deg, #2e2a25 0%, var(--panel-walnut) 60%, #131210 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.7)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset',
        padding: '12px 24px',
        color: 'var(--panel-alu)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Left: Brand Identity & Hardware Lamps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #3b6fd6 0%, #1d3557 100%)',
                boxShadow: '0 0 10px rgba(59, 111, 214, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              <Radio size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#f2eee3',
                    textShadow: '0 1px 0 rgba(0,0,0,0.8), 0 0 12px rgba(255,255,255,0.15)'
                  }}
                >
                  SIGNAL
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#cfccc2',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  METROPOLIS // T03
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--ledger-muted)',
                  marginTop: '-2px'
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
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
          >
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>MONAD TESTNET : 10143</span>
          </div>
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
              background: 'linear-gradient(180deg, #3d3932 0%, #22201c 100%)',
              color: '#f4f1e8',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 10px rgba(59, 111, 214, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              padding: '6px 14px',
              fontSize: '0.8rem'
            }}
          >
            <Play size={14} color="#34c76f" fill="#34c76f" />
            <span>30-SEC DEMO</span>
          </button>

          {/* Testnet Faucet Button */}
          <button
            onClick={() => requestFaucet()}
            className="sk-button"
            title="Request 5.0 testnet MON from the faucet"
            style={{
              background: 'linear-gradient(180deg, #322e28 0%, #1e1c19 100%)',
              color: '#cfccc2',
              borderColor: 'rgba(255,255,255,0.15)',
              padding: '6px 12px',
              fontSize: '0.78rem'
            }}
          >
            <Coins size={14} color="#f5a623" />
            <span>+5.0 MON FAUCET</span>
          </button>

          {/* Passkey Identity Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#181614',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-pulse-sm)',
              padding: '4px 6px 4px 12px',
              gap: '12px',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6)'
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
                {formatMon(currentAccount.balanceMon, 2)} <span style={{ fontSize: '0.75rem', color: '#f5a623' }}>MON</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--ledger-muted)'
                }}
              >
                TESTNET LIQUIDITY
              </div>
            </div>

            {/* Account Switcher / Passkey Badge */}
            <div style={{ position: 'relative' }}>
              <select
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
                  background: 'linear-gradient(180deg, #2c2823, #1e1c19)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#f0ece1',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '5px 28px 5px 10px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <optgroup label="Simulated Seed Wallets (Real Tx)">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatAddress(acc.address)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Biometric Passkey (No Seed Phrase)">
                  <option value="new_passkey">+ Create Passkey Wallet...</option>
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
                  color: '#aaa'
                }}
              />
            </div>

            {/* Passkey Icon indicator */}
            <button
              onClick={onOpenPasskeyModal}
              title="Passkey Security Console"
              style={{
                background: 'rgba(59, 111, 214, 0.2)',
                border: '1px solid rgba(59, 111, 214, 0.4)',
                borderRadius: '6px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <Fingerprint size={16} color="#3b6fd6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
