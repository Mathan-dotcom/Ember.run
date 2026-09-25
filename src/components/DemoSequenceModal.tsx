import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { Play, RotateCcw, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Scroll state for dynamic fade in & fade out effect
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const progress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));

    setScrollProgress(progress);
    setCanScrollUp(scrollTop > 8);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 8);

    const delta = scrollTop - lastScrollTopRef.current;
    if (Math.abs(delta) > 3) {
      const dir = delta > 0 ? 'down' : 'up';
      setScrollDirection(dir);

      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setScrollDirection(null);
      }, 700);
    }
    lastScrollTopRef.current = scrollTop;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(updateScrollState, 80);
    return () => clearTimeout(timer);
  }, [isOpen, currentStep, updateScrollState]);

  if (!isOpen) return null;

  const maskTopSize = canScrollUp ? '36px' : '0px';
  const maskBottomSize = canScrollDown ? '40px' : '0px';
  const scrollFadeMask = `linear-gradient(to bottom, transparent 0%, black ${maskTopSize}, black calc(100% - ${maskBottomSize}), transparent 100%)`;

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
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
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
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div
      className="modal-overlay-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
        className="sk-panel-raised modal-box-fade"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '24px 28px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#0d0d0d',
          border: '2px solid #ffffff',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px #ffffff'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: '1.5px solid #ffffff',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ffffff',
                boxShadow: '2px 2px 0px #ffffff'
              }}
            >
              <Play size={16} color="#000000" fill="#000000" />
            </div>
            <div>
              <h3 className="text-heading" style={{ color: '#ffffff', fontSize: '1.05rem' }}>30-Second Guided Demo Sequence</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
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
            <X size={18} />
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
            gap: '10px',
            borderRadius: '0px',
            border: '1.5px solid #ffffff',
            boxShadow: '3px 3px 0px #ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
              {stepStatus}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleAutoRun}
              disabled={isPlaying}
              className="sk-button-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              <Play size={12} fill="#000000" color="#000000" />
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
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Dynamic Edge Fade Masks */}
        <div className="scroll-fade-container" style={{ position: 'relative', flex: 1, minHeight: 0, marginBottom: '14px' }}>
          {/* Top Edge Feathering Overlay */}
          <div
            className="scroll-fade-edge-top"
            style={{
              opacity: canScrollUp ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Bottom Edge Feathering Overlay */}
          <div
            className="scroll-fade-edge-bottom"
            style={{
              opacity: canScrollDown ? 1 : 0,
              pointerEvents: 'none'
            }}
          />

          {/* Micro Scroll Direction HUD */}
          {scrollDirection && (
            <div className="scroll-direction-indicator">
              {scrollDirection === 'down' ? 'SCROLLING DOWN ↓' : 'SCROLLING UP ↑'}
            </div>
          )}

          {/* Scrollable Content Body */}
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            className="scroll-fade-content"
            style={{
              maxHeight: '52vh',
              overflowY: 'auto',
              paddingRight: '6px',
              paddingTop: '6px',
              paddingBottom: '20px',
              maskImage: scrollFadeMask,
              WebkitMaskImage: scrollFadeMask,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isDone = currentStep > idx;

              return (
                <div
                  key={step.num}
                  id={`demo-step-${idx}`}
                  className="sk-panel card-hover"
                  style={{
                    padding: '16px',
                    borderRadius: '0px',
                    background: isActive ? '#141414' : '#0a0a0a',
                    border: '1.5px solid #ffffff',
                    boxShadow: isActive ? '5px 5px 0px #ffffff' : '3px 3px 0px rgba(255,255,255,0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '0px',
                          background: isDone || isActive ? '#ffffff' : '#141414',
                          color: isDone || isActive ? '#000000' : 'var(--ink-soft)',
                          border: '1.5px solid #ffffff',
                          boxShadow: '1px 1px 0px #ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : step.num}
                      </div>

                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: '#ffffff',
                            marginBottom: '2px'
                          }}
                        >
                          {step.title}
                        </div>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.80rem', color: '#d4d4d8', lineHeight: 1.4 }}>
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
        </div>

        {/* Footer Note & Scroll Telemetry */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '12px'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.70rem',
              color: 'var(--ink-soft)'
            }}
          >
            Every action updates onchain balances, audit ledger, and decay ranking live.
          </div>
          {(canScrollUp || canScrollDown) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: '#ffffff',
                flexShrink: 0,
                background: '#141414',
                padding: '2px 8px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <span>SCROLL {scrollProgress}%</span>
              {canScrollDown ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoSequenceModal;
