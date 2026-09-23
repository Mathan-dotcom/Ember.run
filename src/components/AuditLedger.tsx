import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon, formatRelativeTime } from '../utils/decay';
import { Terminal, ShieldCheck, ShieldAlert } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const { auditLogs } = useWallet();

  return (
    <section className="sk-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
      {/* Dark Glass Bar Header */}
      <div
        style={{
          background: 'rgba(12, 10, 22, 0.95)',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(131, 110, 249, 0.25)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sk-index" data-index="03" style={{ color: 'var(--cyan-accent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={17} color="#00f0ff" />
            <h2
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#ffffff'
              }}
            >
              IMMUTABLE TERMINAL AUDIT LEDGER
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="sk-badge sk-badge--inverted"
            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
          >
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-accent)' }}>STREAM: MONAD TESTNET</span>
          </div>
        </div>
      </div>

      {/* Recessed Well Ticker-Tape Content */}
      <div
        className="sk-well"
        style={{
          margin: '16px',
          padding: '12px 0',
          maxHeight: '340px',
          overflowY: 'auto',
          borderRadius: 'var(--radius-pulse-sm)',
          border: '1px solid rgba(131, 110, 249, 0.25)'
        }}
      >
        {auditLogs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
            NO ONCHAIN TRANSACTIONS RECORDED YET
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {auditLogs.map((log, index) => {
              const secondsAgo = Math.max(0, Math.floor(Date.now() / 1000) - log.timestamp);
              const isBlocked = log.status === 'BLOCKED';

              return (
                <div
                  key={log.id}
                  className="ledger-row fade-in-card"
                  style={{
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    borderBottom: '1px solid rgba(131, 110, 249, 0.1)',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Left: Index + Status Lamp + TxHash */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>
                      #{String(auditLogs.length - index).padStart(4, '0')}
                    </span>

                    {/* Status Lamp */}
                    <span
                      className={`sk-lamp ${
                        isBlocked ? 'sk-lamp-red anim-lamp-pulse-red' : 'sk-lamp-green'
                      }`}
                    />

                    <span
                      style={{
                        fontWeight: 700,
                        color: isBlocked ? '#ff0055' : '#00ff9d',
                        textShadow: isBlocked ? '0 0 8px rgba(255, 0, 85, 0.5)' : '0 0 8px rgba(0, 255, 157, 0.5)'
                      }}
                    >
                      {log.status}
                    </span>

                    <span style={{ color: 'var(--ink-soft)' }}>
                      TX:{log.txHash}
                    </span>
                  </div>

                  {/* Center: Recipient & Note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#f8f7ff' }}>
                      {log.role === 'POSTER'
                        ? `[POSTER CUT] -> ${log.recipientName}`
                        : log.role === 'CURATOR'
                        ? `[CURATOR SHARE] -> ${log.recipientName}`
                        : `[MARKET] -> ${log.note}`}
                    </span>

                    {log.amount > 0 && (
                      <span
                        style={{
                          fontWeight: 700,
                          color: isBlocked ? '#ff0055' : '#00f0ff',
                          background: 'rgba(0, 240, 255, 0.12)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          padding: '1px 8px',
                          borderRadius: '4px',
                          textShadow: '0 0 6px rgba(0, 240, 255, 0.4)'
                        }}
                      >
                        +{formatMon(log.amount, 3)} MON
                      </span>
                    )}
                  </div>

                  {/* Right: Timestamp */}
                  <div style={{ color: 'var(--ink-soft)', fontSize: '0.72rem' }}>
                    {formatRelativeTime(secondsAgo)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-Ledger Explanatory Footer */}
      <div
        style={{
          padding: '10px 20px',
          background: 'rgba(131, 110, 249, 0.05)',
          borderTop: '1px solid rgba(131, 110, 249, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--ink-soft)'
        }}
      >
        <span>EMBER.RUN // ATOMIC ONCHAIN SPLITS WITHOUT MANUAL CLAIMS</span>
        <span>ALL TRANSACTIONS BROADCAST TO MONAD TESTNET</span>
      </div>
    </section>
  );
};
