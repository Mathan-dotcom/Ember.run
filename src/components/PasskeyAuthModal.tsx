import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { Fingerprint, KeyRound, X, CheckCircle2, LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasskeyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'register' | 'signin';
type Phase = 'idle' | 'waiting' | 'success' | 'error';

export const PasskeyAuthModal: React.FC<PasskeyAuthModalProps> = ({ isOpen, onClose }) => {
  const { createPasskeyAccount, authenticateWithPasskey, isWebAuthnAvailable } = useWallet();

  const [tab, setTab] = useState<Tab>('register');
  const [username, setUsername] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setPhase('idle');
    setErrorMsg('');
  };

  // ── Register new passkey ──────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || phase !== 'idle') return;

    setPhase('waiting');
    setErrorMsg('');
    sound.playSwitchClick();

    try {
      await createPasskeyAccount(username.trim());
      setPhase('success');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        reset();
        onClose();
      }, 1600);
    } catch (err: any) {
      setPhase('error');
      setErrorMsg(err.message || 'Passkey registration failed.');
      sound.playWarningBuzz();
    }
  };

  // ── Sign in with existing passkey ─────────────────────────────────────────
  const handleSignIn = async () => {
    if (phase !== 'idle') return;

    setPhase('waiting');
    setErrorMsg('');
    sound.playSwitchClick();

    try {
      const account = await authenticateWithPasskey();
      if (!account) {
        setPhase('error');
        setErrorMsg('No matching passkey found. Please register first.');
        return;
      }
      setPhase('success');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        reset();
        onClose();
      }, 1600);
    } catch (err: any) {
      setPhase('error');
      setErrorMsg(err.message || 'Passkey authentication failed.');
      sound.playWarningBuzz();
    }
  };

  // ── Status label ──────────────────────────────────────────────────────────
  const statusLabel =
    phase === 'waiting'
      ? tab === 'register'
        ? 'TOUCH SENSOR // REGISTERING CREDENTIAL...'
        : 'TOUCH SENSOR // AUTHENTICATING...'
      : phase === 'success'
      ? 'PASSKEY VERIFIED — MONAD WALLET ARMED'
      : phase === 'error'
      ? 'CREDENTIAL ERROR'
      : isWebAuthnAvailable
      ? 'WEBAUTHN HARDWARE CREDENTIAL READY'
      : 'WEBAUTHN NOT SUPPORTED IN THIS BROWSER';

  const iconColor =
    phase === 'success' ? '#4ade80' : phase === 'error' ? '#f87171' : '#ffffff';

  return (
    <div
      className="modal-overlay-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.90)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose(); } }}
    >
      <div
        className="sk-panel-raised modal-box-fade"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          background: 'rgba(7, 14, 28, 0.97)',
          border: '2px solid #ffffff',
          borderRadius: '0px',
          boxShadow: '8px 8px 0px #ffffff'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1.5px solid rgba(255, 255, 255, 0.25)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff' }}>
              <Fingerprint size={18} color="#000" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#e0f2fe' }}>
                Passkey Mission Control
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                ONE PASSKEY, ZERO SEED PHRASES
              </p>
            </div>
          </div>
          <button
            onClick={() => { sound.playSwitchClick(); reset(); onClose(); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0px', marginBottom: '20px', border: '1.5px solid rgba(255, 255, 255, 0.25)' }}>
          {(['register', 'signin'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { reset(); setTab(t); }}
              style={{
                flex: 1,
                padding: '9px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                border: 'none',
                background: tab === t ? '#ffffff' : 'transparent',
                color: tab === t ? '#000' : 'var(--ink-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              {t === 'register' ? '▶ NEW PASSKEY' : '⬡ SIGN IN'}
            </button>
          ))}
        </div>

        {/* Biometric scanner visualizer */}
        <div
          style={{
            background: 'rgba(3, 7, 18, 0.8)',
            border: `1.5px solid ${phase === 'error' ? '#f87171' : phase === 'success' ? '#4ade80' : 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: `4px 4px 0px ${phase === 'error' ? '#f87171' : phase === 'success' ? '#4ade80' : '#ffffff'}`,
            padding: '20px 16px',
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Scan line animation */}
          {phase === 'waiting' && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
              animation: 'scan-line 1.4s linear infinite'
            }} />
          )}

          <div style={{
            width: '64px', height: '64px',
            margin: '0 auto 12px auto',
            background: 'rgba(255, 255, 255, 0.25)',
            border: `2px solid ${iconColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${iconColor}40`,
            transition: 'all 0.3s ease'
          }}>
            {phase === 'success' ? (
              <CheckCircle2 size={32} color="#4ade80" />
            ) : phase === 'error' ? (
              <AlertTriangle size={32} color="#f87171" />
            ) : (
              <Fingerprint
                size={32}
                color={iconColor}
                style={{ animation: phase === 'waiting' ? 'pulse 1s ease-in-out infinite' : 'none' }}
              />
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: iconColor, letterSpacing: '0.04em' }}>
            {statusLabel}
          </div>

          {phase === 'error' && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#fca5a5', marginTop: '6px', lineHeight: 1.5 }}>
              {errorMsg}
            </p>
          )}

          {phase === 'idle' && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '6px' }}>
              {isWebAuthnAvailable
                ? 'Uses your device secure enclave — Touch ID, Face ID, or Windows Hello.'
                : 'Try Chrome, Safari, or Edge on a modern device to use passkeys.'}
            </p>
          )}
        </div>

        {/* Register tab */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px', color: 'var(--ink-soft)' }}>
                Curator Identity / Username
              </label>
              <div className="sk-well" style={{ padding: '2px', border: '1.5px solid rgba(255, 255, 255, 0.25)', borderRadius: '0px', boxShadow: '2px 2px 0px #ffffff' }}>
                <input
                  type="text"
                  className="sk-input"
                  placeholder="e.g. Satoshi_Alpha"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (phase === 'error') reset(); }}
                  disabled={phase === 'waiting' || phase === 'success'}
                  autoFocus
                />
              </div>
            </div>

            {/* Security checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="#4ade80" />
                <span>Private key never leaves your device's secure enclave</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="#4ade80" />
                <span>Address deterministically derived from FIDO2 credential ID</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="#4ade80" />
                <span>Pre-funded with +10.0 testnet MON on initialization</span>
              </div>
            </div>

            <button
              type="submit"
              className="sk-button-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.88rem', opacity: (!username.trim() || !isWebAuthnAvailable || phase === 'waiting' || phase === 'success') ? 0.5 : 1 }}
              disabled={!username.trim() || !isWebAuthnAvailable || phase === 'waiting' || phase === 'success'}
            >
              <KeyRound size={15} />
              <span>
                {phase === 'waiting' ? 'AWAITING BIOMETRIC...' : phase === 'success' ? '✓ CONFIRMED' : 'CREATE BIOMETRIC WALLET'}
              </span>
            </button>

            {phase === 'error' && (
              <button type="button" onClick={reset} style={{ width: '100%', marginTop: '8px', padding: '9px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ffffff', cursor: 'pointer' }}>
                TRY AGAIN
              </button>
            )}
          </form>
        )}

        {/* Sign-in tab */}
        {tab === 'signin' && (
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '20px', lineHeight: 1.6 }}>
              Already registered a passkey on this device? Authenticate with your biometric to restore your wallet session.
            </p>

            <button
              onClick={handleSignIn}
              className="sk-button-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.88rem', opacity: (!isWebAuthnAvailable || phase === 'waiting' || phase === 'success') ? 0.5 : 1, marginBottom: '8px' }}
              disabled={!isWebAuthnAvailable || phase === 'waiting' || phase === 'success'}
            >
              <LogIn size={15} />
              <span>
                {phase === 'waiting' ? 'AWAITING BIOMETRIC...' : phase === 'success' ? '✓ AUTHENTICATED' : 'SIGN IN WITH PASSKEY'}
              </span>
            </button>

            {phase === 'error' && (
              <button onClick={reset} style={{ width: '100%', padding: '9px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ffffff', cursor: 'pointer' }}>
                TRY AGAIN
              </button>
            )}

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.70rem', color: 'var(--ink-faint)', marginTop: '16px', textAlign: 'center' }}>
              No passkey yet?{' '}
              <button onClick={() => { reset(); setTab('register'); }} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.70rem', textDecoration: 'underline' }}>
                Register one first
              </button>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default PasskeyAuthModal;
