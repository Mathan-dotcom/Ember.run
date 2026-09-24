import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon, formatRelativeTime } from '../utils/decay';
import { Terminal } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const { auditLogs } = useWallet();

  return (
    <section className="sk-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
      {/* Dark Bar Header */}
      <div
        style={{
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sk-index" data-index="03" style={{ color: '#ffffff' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="#ffffff" />
            <h2
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
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
            style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '0px', border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff' }}
          >
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', color: '#000000', fontWeight: 700 }}>STREAM: MONAD TESTNET</span>
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
          borderRadius: '0px',
          border: '1.5px solid #ffffff',
          boxShadow: '3px 3px 0px #ffffff'
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
                    fontSize: '0.76rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
                        color: isBlocked ? '#d4d4d8' : '#ffffff'
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
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>
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
                          color: '#ffffff',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '1px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        +{formatMon(log.amount, 3)} MON
                      </span>
                    )}
                  </div>

                  {/* Right: Timestamp */}
                  <div style={{ color: 'var(--ink-soft)', fontSize: '0.70rem' }}>
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
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--ink-soft)'
        }}
      >
        <span>EMBER.RUN // ATOMIC ONCHAIN SPLITS WITHOUT MANUAL CLAIMS</span>
        <span>ALL TRANSACTIONS BROADCAST TO MONAD TESTNET</span>
      </div>
    </section>
  );
};

export default AuditLedger;
