import React from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, formatMon } from '../utils/decay';
import { Sparkles, CheckCircle2, User } from 'lucide-react';
import { sound } from '../utils/sound';

interface CuratorLeaderboardProps {
  onOpenProfile?: (address: string) => void;
}

export const CuratorLeaderboard: React.FC<CuratorLeaderboardProps> = ({ onOpenProfile }) => {
  const { curatorLeaderboard, currentAccount } = useWallet();

  return (
    <section className="sk-panel scroll-fade-card" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="04" />
          <h2 className="text-heading">TASTE ARBITRAGE LEADERBOARD</h2>
          <span className="sk-badge" style={{ fontSize: '0.68rem' }}>
            ONCHAIN REPUTATION
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-micro">INDEXED VIA ENVIO:</span>
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.68rem' }}>
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.70rem',
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
                  onClick={() => {
                    sound.playDialTick();
                    onOpenProfile?.(leader.wallet);
                  }}
                  className="card-hover"
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: isCurrent ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  title="Click to inspect curator dossier"
                >
                  {/* Rank */}
                  <td style={{ padding: '14px 12px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '0px',
                        background: leader.rank === 1 ? '#ffffff' : '#070e1b',
                        color: leader.rank === 1 ? '#030712' : '#f8fafc',
                        border: '1.5px solid #ffffff',
                        boxShadow: '2px 2px 0px #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.78rem'
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
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.88rem', color: '#fdfaf2' }}>
                          {leader.name} {isCurrent && <span style={{ color: 'var(--ink-soft)' }}>(You)</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)' }}>
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
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#fdfaf2'
                      }}
                    >
                      +{formatMon(leader.totalEarned, 2)} <span style={{ fontSize: '0.75rem', color: '#f3d38c' }}>MON</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
                      ROI: {leader.roiPercent}%
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td style={{ padding: '14px 12px' }}>
                    <div className="sk-badge" style={{ padding: '3px 8px', fontSize: '0.70rem', borderRadius: '0px', border: '1.5px solid #df9c32', boxShadow: '2px 2px 0px #df9c32' }}>
                      <CheckCircle2 size={11} color="#34d399" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fdfaf2' }}>
                        {leader.accuracyRate}%
                      </span>
                    </div>
                  </td>

                  {/* Signals */}
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: '#fdfaf2' }}>
                    {leader.totalBoosts}
                  </td>

                  {/* Avg Discovery */}
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
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
          background: 'rgba(5, 9, 16, 0.90)',
          border: '1.5px solid #df9c32',
          borderRadius: '0px',
          boxShadow: '3px 3px 0px #ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.75rem',
          color: 'var(--ink-soft)'
        }}
      >
        <Sparkles size={13} color="#ffffff" />
        <span>
          <strong style={{ color: '#ffffff' }}>How Taste Arbitrage Works:</strong> Early curators who identify high-value content before the decay cliff
          earn automatic 45% cuts on subsequent boosts. Accuracy is proven onchain, never self-reported.
        </span>
      </div>
    </section>
  );
};

export default CuratorLeaderboard;
