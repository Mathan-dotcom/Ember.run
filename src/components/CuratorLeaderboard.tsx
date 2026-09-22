import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon } from '../utils/decay';
import { Trophy, Award, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const CuratorLeaderboard: React.FC = () => {
  const { curatorLeaderboard, currentAccount } = useWallet();

  return (
    <section className="sk-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="04" />
          <h2 className="text-heading">TASTE ARBITRAGE LEADERBOARD</h2>
          <span className="sk-badge" style={{ fontSize: '0.7rem' }}>
            ONCHAIN REPUTATION
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-micro">INDEXED VIA ENVIO:</span>
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.7rem' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>PROVABLE EARNINGS</span>
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.12)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--ink-soft)'
              }}
            >
              <th style={{ padding: '8px 12px' }}>RANK</th>
              <th style={{ padding: '8px 12px' }}>CURATOR</th>
              <th style={{ padding: '8px 12px' }}>NET EARNINGS</th>
              <th style={{ padding: '8px 12px' }}>ACCURACY</th>
              <th style={{ padding: '8px 12px' }}>SIGNALS</th>
              <th style={{ padding: '8px 12px' }}>AVG DISCOVERY</th>
            </tr>
          </thead>
          <tbody>
            {curatorLeaderboard.map((leader) => {
              const isCurrent = leader.wallet.toLowerCase() === currentAccount.address.toLowerCase();

              return (
                <tr
                  key={leader.wallet}
                  className="card-hover"
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    background: isCurrent ? 'rgba(59, 111, 214, 0.08)' : 'transparent'
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: '14px 12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background:
                          leader.rank === 1
                            ? 'radial-gradient(circle at 35% 35%, #ffd700, #b8860b)'
                            : leader.rank === 2
                            ? 'radial-gradient(circle at 35% 35%, #e4e1d8, #a8a499)'
                            : 'radial-gradient(circle at 35% 35%, #cd7f32, #8b4513)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: leader.rank === 1 ? '#221f1c' : '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      {leader.rank}
                    </div>
                  </td>

                  {/* Curator Identity */}
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="sk-lamp sk-lamp-green" />
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.88rem' }}>
                          {leader.name} {isCurrent && <span style={{ color: '#3b6fd6' }}>(You)</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                          {leader.handle} • {formatAddress(leader.wallet)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Net Earnings */}
                  <td style={{ padding: '14px 12px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#279a52'
                      }}
                    >
                      +{formatMon(leader.totalEarned, 2)} <span style={{ fontSize: '0.75rem', color: '#f5a623' }}>MON</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ledger-muted)' }}>
                      ROI: {leader.roiPercent}%
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td style={{ padding: '14px 12px' }}>
                    <div className="sk-badge" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} color="#34c76f" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {leader.accuracyRate}%
                      </span>
                    </div>
                  </td>

                  {/* Signals */}
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {leader.totalBoosts}
                  </td>

                  {/* Avg Discovery */}
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                    {leader.earliestDiscoveryTime}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.03)',
          borderRadius: 'var(--radius-pulse-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.75rem',
          color: 'var(--ink-soft)'
        }}
      >
        <Sparkles size={14} color="#f5a623" />
        <span>
          <strong>How Taste Arbitrage Works:</strong> Early curators who identify high-value content before the decay cliff
          earn automatic 45% cuts on subsequent boosts. Accuracy is proven onchain, never self-reported.
        </span>
      </div>
    </section>
  );
};
