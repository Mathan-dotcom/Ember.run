import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { Fingerprint, ShieldCheck, KeyRound, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasskeyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasskeyAuthModal: React.FC<PasskeyAuthModalProps> = ({ isOpen, onClose }) => {
  const { createPasskeyAccount, currentAccount } = useWallet();
  const [username, setUsername] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsAuthenticating(true);
    sound.playSwitchClick();

    // Simulate WebAuthn Biometric Prompt (TouchID / FaceID)
    setTimeout(async () => {
      await createPasskeyAccount(username.trim());
      setIsAuthenticating(false);
      setSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div
      className="modal-overlay-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 5, 12, 0.85)',
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
          maxWidth: '460px',
          padding: '28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #836ef9, #00f0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(131, 110, 249, 0.7)'
              }}
            >
              <Fingerprint size={19} color="#ffffff" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#ffffff'
                }}
              >
                Passkey Mission Control
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--cyan-accent)' }}>
                ONE PASSKEY, ZERO SEED PHRASES
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSwitchClick();
              onClose();
            }}
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

        {/* Biometric Scanner Visualizer */}
        <div
          style={{
            background: 'rgba(8, 7, 16, 0.95)',
            borderRadius: 'var(--radius-pulse-sm)',
            border: '1px solid rgba(131, 110, 249, 0.35)',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.9), 0 0 16px rgba(131, 110, 249, 0.15)',
            padding: '24px 16px',
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              background: isAuthenticating
                ? 'radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 70%)'
                : success
                ? 'radial-gradient(circle, rgba(0, 255, 157, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(131, 110, 249, 0.15) 0%, transparent 70%)',
              border: `2px solid ${
                isAuthenticating ? '#00f0ff' : success ? '#00ff9d' : 'rgba(131, 110, 249, 0.4)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAuthenticating
                ? '0 0 20px rgba(0, 240, 255, 0.7)'
                : success
                ? '0 0 20px rgba(0, 255, 157, 0.8)'
                : '0 0 10px rgba(131, 110, 249, 0.25)',
              transition: 'all 0.3s ease'
            }}
          >
            {success ? (
              <CheckCircle2 size={34} color="#00ff9d" />
            ) : (
              <Fingerprint
                size={34}
                color={isAuthenticating ? '#00f0ff' : '#836ef9'}
                className={isAuthenticating ? 'anim-lamp-pulse-blue' : ''}
              />
            )}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}
          >
            {isAuthenticating
              ? 'TOUCH SENSOR // VERIFYING BIOMETRICS...'
              : success
              ? 'PASSKEY GENERATED & MONAD WALLET ARMED'
              : 'WEBAUTHN HARDWARE CREDENTIAL'}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--ink-soft)',
              marginTop: '6px'
            }}
          >
            Privy / Mera specification: Embedded wallet derived via device secure enclave.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreatePasskey}>
          <div style={{ marginBottom: '16px' }}>
            <label
              className="text-micro"
              style={{ display: 'block', marginBottom: '6px', color: 'var(--ink-soft)' }}
            >
              Curator Identity / Username
            </label>
            <div className="sk-well" style={{ padding: '2px' }}>
              <input
                type="text"
                className="sk-input"
                placeholder="e.g. Satoshi_Alpha"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isAuthenticating || success}
                autoFocus
              />
            </div>
          </div>

          {/* Security Features Checklist */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '22px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--ink-soft)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span>No seed phrases or private keys ever exposed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="sk-lamp sk-lamp-green" />
              <span>Pre-funded with +10.0 testnet MON upon initialization</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="sk-lamp sk-lamp-blue" />
              <span>Permanent session tied to device biometric authentication</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="sk-button-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            disabled={!username.trim() || isAuthenticating || success}
          >
            <KeyRound size={16} />
            <span>
              {isAuthenticating
                ? 'INITIALIZING PASSKEY...'
                : success
                ? 'CONFIRMED'
                : 'CREATE BIOMETRIC WALLET'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
