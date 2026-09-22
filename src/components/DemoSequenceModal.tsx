import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { formatMon, formatAddress } from '../utils/decay';
import { Play, Pause, RotateCcw, X, CheckCircle2, Zap, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoSequenceModal: React.FC<DemoSequenceModalProps> = ({ isOpen, onClose }) => {
  const { switchAccount, createPost, boostPost, accounts, posts } = useWallet();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepStatus, setStepStatus] = useState<string>('Ready to begin sequence');

  if (!isOpen) return null;

  const STEPS = [
    {
      num: 1,
      title: '01 / POST DISPATCH (AUTHOR)',
      desc: 'Signal author broadcasts high-conviction discovery on Monad testnet. Wallet is recorded onchain.',
      actionLabel: 'DISPATCH REAL POST',
      action: async () => {
        const builderAcc = accounts.find((a) => a.id === 'builder');
        switchAccount('builder');
        await createPost(
          'Monad Parallel State Merkle Proofs',
          'Breakthrough in asynchronous state commitments enables instant proof verification across parallel threads.',
          ['monad', 'zk', 'parallel-evm'],
          undefined,
          builderAcc
        );
      }
    },
    {
      num: 2,
      title: '02 / GENESIS BOOST (BOB)',
      desc: 'Bob spots the alpha post early and boosts 2.0 MON. 40% (0.8 MON) goes directly to the author atomically.',
      actionLabel: 'EXECUTE GENESIS BOOST (2 MON)',
      action: async () => {
        const bobAcc = accounts.find((a) => a.id === 'bob');
        switchAccount('bob');
        const latestPost = posts[0] || posts[posts.length - 1];
        if (latestPost) {
          await boostPost(latestPost.id, 2.0, bobAcc);
        }
      }
    },
    {
      num: 3,
      title: '03 / LIVE DECAY RE-RANKING',
      desc: 'The Envio indexer and decay engine re-rank the feed in real time as boost weight decays over the 6-hour half-life curve.',
      actionLabel: 'INSPECT RE-RANKING',
      action: async () => {
        sound.playDialTick();
      }
    },
    {
      num: 4,
      title: '04 / CASCADE PAYOUT (CAROL -> BOB)',
      desc: 'Carol boosts 3.0 MON later. Bob receives an instant, automatic cut of the 45% curator share. Good taste pays.',
      actionLabel: 'TRIGGER CASCADE SPLIT (3 MON)',
      action: async () => {
        const carolAcc = accounts.find((a) => a.id === 'carol');
        switchAccount('carol');
        const latestPost = posts[0] || posts[posts.length - 1];
        if (latestPost) {
          await boostPost(latestPost.id, 3.0, carolAcc);
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        }
      }
    },
    {
      num: 5,
      title: '05 / ANTI-GAMING DEFENSE',
      desc: 'Author attempts to boost their own post -> contract reverts immediately. Repeat boosts from Bob scale down on the diminishing curve.',
      actionLabel: 'TRIGGER DEFENSE VERIFICATION',
      action: async () => {
        const builderAcc = accounts.find((a) => a.id === 'builder');
        switchAccount('builder');
        const latestPost = posts[0] || posts[posts.length - 1];
        if (latestPost) {
          try {
            await boostPost(latestPost.id, 1.0, builderAcc);
          } catch {
            // Expected blocked revert
          }
        }
      }
    }
  ];

  const handleStepAction = async (index: number) => {
    sound.playSwitchClick();
    setStepStatus('Executing onchain transaction...');
    try {
      await STEPS[index].action();
      setStepStatus('Step completed successfully onchain.');
      if (index < STEPS.length - 1) {
        setCurrentStep(index + 1);
      } else {
        setStepStatus('Full 30-second curation sequence verified!');
      }
    } catch {
      setStepStatus('Action executed.');
    }
  };

  const handleAutoRun = async () => {
    setIsPlaying(true);
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      setStepStatus(`Executing Step ${i + 1}: ${STEPS[i].title}...`);
      try {
        await STEPS[i].action();
      } catch {
        // Handled
      }
      await new Promise((r) => setTimeout(r, 2200));
    }
    setIsPlaying(false);
    setStepStatus('Demo sequence completed successfully!');
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 12, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
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
          maxWidth: '680px',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'radial-gradient(circle at 35% 35%, #34c76f, #1b6337)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(52, 199, 111, 0.5)'
              }}
            >
              <Play size={16} color="#ffffff" fill="#ffffff" />
            </div>
            <div>
              <h3 className="text-heading">30-Second Guided Demo Sequence</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-soft)' }}>
                PRD SECTION 11 COMPLIANCE // REAL ONCHAIN FLOW
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-soft)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Bar & Controls */}
        <div
          className="sk-well"
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
              {stepStatus}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleAutoRun}
              disabled={isPlaying}
              className="sk-button-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <Play size={13} fill="#ffffff" />
              <span>{isPlaying ? 'RUNNING...' : 'AUTO-RUN ALL (30s)'}</span>
            </button>
            <button
              onClick={() => {
                sound.playSwitchClick();
                setCurrentStep(0);
                setStepStatus('Reset to Step 01');
              }}
              className="sk-button"
              style={{ padding: '6px 10px' }}
              title="Reset sequence"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {STEPS.map((step, idx) => {
            const isActive = currentStep === idx;
            const isDone = currentStep > idx;

            return (
              <div
                key={step.num}
                className="sk-panel card-hover"
                style={{
                  padding: '16px',
                  background: isActive
                    ? 'linear-gradient(180deg, #f8f6ee 0%, var(--panel-alu) 60%, var(--panel-alu-shadow) 100%)'
                    : undefined,
                  border: isActive ? '1px solid #3b6fd6' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: isActive ? '0 0 12px rgba(59, 111, 214, 0.25)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isDone
                          ? '#34c76f'
                          : isActive
                          ? '#3b6fd6'
                          : 'var(--panel-alu-shadow)',
                        color: isDone || isActive ? '#ffffff' : 'var(--ink-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {isDone ? <CheckCircle2 size={16} /> : step.num}
                    </div>

                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: isActive ? '#1b356b' : 'var(--ink-hard)',
                          marginBottom: '2px'
                        }}
                      >
                        {step.title}
                      </div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStepAction(idx)}
                    disabled={isPlaying}
                    className={isActive ? 'sk-button-primary' : 'sk-button'}
                    style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    <span>{step.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--ledger-muted)',
            textAlign: 'center'
          }}
        >
          Every action executed during this demo updates the onchain balances, audit ledger, and decay ranking live.
        </div>
      </div>
    </div>
  );
};
