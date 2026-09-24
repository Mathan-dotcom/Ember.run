import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { Fingerprint, KeyRound, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasskeyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasskeyAuthModal: React.FC<PasskeyAuthModalProps> = ({ isOpen, onClose }) => {
  const { createPasskeyAccount } = useWallet();
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
          maxWidth: '460px',
          padding: '28px',
          background: '#0d0d0d',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Fingerprint size={18} color="#000000" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.20rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                Passkey Mission Control
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-soft)' }}>
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
            <X size={18} />
          </button>
        </div>

        {/* Biometric Scanner Visualizer */}
        <div
          style={{
            background: '#050505',
            borderRadius: 'var(--radius-pulse-sm)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '24px 16px',
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              background: '#141414',
              border: `2px solid ${isAuthenticating || success ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAuthenticating || success ? '0 0 16px rgba(255, 255, 255, 0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {success ? (
              <CheckCircle2 size={32} color="#ffffff" />
            ) : (
              <Fingerprint
                size={32}
                color="#ffffff"
              />
            )}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
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
              fontSize: '0.74rem',
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
            <div className="sk-well" style={{ padding: '2px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
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
              fontSize: '0.74rem',
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
              <span className="sk-lamp sk-lamp-green" />
              <span>Permanent session tied to device biometric authentication</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="sk-button-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.90rem' }}
            disabled={!username.trim() || isAuthenticating || success}
          >
            <KeyRound size={15} />
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

export default PasskeyAuthModal;
