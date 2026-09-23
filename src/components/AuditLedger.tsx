import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon, formatRelativeTime } from '../utils/decay';
import { Terminal, ShieldCheck, ShieldAlert } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const { auditLogs } = useWallet();

  return (
    <section className="sk-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
      {/* Walnut Casing Bar Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #2b2824 0%, var(--panel-walnut) 70%, #131210 100%)',
          color: 'var(--panel-alu)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.5)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sk-index" data-index="03" style={{ color: '#d4cfc2' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={17} color="#34c76f" />
            <h2
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#f4f1e8'
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
            <span style={{ fontFamily: 'var(--font-mono)' }}>STREAM: MONAD TESTNET</span>
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
          border: '1px solid rgba(0,0,0,0.22)'
        }}
      >
        {auditLogs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ledger-muted)', fontFamily: 'var(--font-mono)' }}>
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
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Left: Index + Status Lamp + TxHash */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--ledger-muted)', fontWeight: 700 }}>
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
                        color: isBlocked ? '#e0392f' : '#279a52'
                      }}
                    >
                      {log.status}
                    </span>

                    <span style={{ color: 'var(--ledger-muted)' }}>
                      TX:{log.txHash}
                    </span>
                  </div>

                  {/* Center: Recipient & Note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-hard)' }}>
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
                          color: isBlocked ? '#e0392f' : '#1b356b',
                          background: 'rgba(255,255,255,0.4)',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        +{formatMon(log.amount, 3)} MON
                      </span>
                    )}
                  </div>

                  {/* Right: Timestamp */}
                  <div style={{ color: 'var(--ledger-muted)', fontSize: '0.72rem' }}>
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
          background: 'rgba(0,0,0,0.03)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--ledger-muted)'
        }}
      >
        <span>EMBER.RUN // ATOMIC ONCHAIN SPLITS WITHOUT MANUAL CLAIMS</span>
        <span>ALL TRANSACTIONS BROADCAST TO MONAD TESTNET</span>
      </div>
    </section>
  );
};
