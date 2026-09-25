import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { backendApi, CuratorProfileData } from '../services/api';
import { formatAddress, formatMon } from '../utils/decay';
import { sound } from '../utils/sound';
import { X, User, Edit3, Check, Award, Bookmark, Flame, ExternalLink } from 'lucide-react';

interface CuratorProfileModalProps {
  address: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CuratorProfileModal: React.FC<CuratorProfileModalProps> = ({ address, isOpen, onClose }) => {
  const { currentAccount } = useWallet();
  const [profile, setProfile] = useState<CuratorProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const targetAddress = address || currentAccount.address;
  const isOwner = targetAddress.toLowerCase() === currentAccount.address.toLowerCase();

  useEffect(() => {
    if (!isOpen || !targetAddress) return;
    setIsEditing(false);
    backendApi.getProfile(targetAddress).then((data) => {
      if (data) {
        setProfile(data);
        setName(data.name);
        setHandle(data.handle);
        setBio(data.bio);
        setAvatarUrl(data.avatarUrl);
      } else {
        // Fallback default profile if not in backend store
        const fallback: CuratorProfileData = {
          address: targetAddress,
          name: isOwner ? currentAccount.name : 'Monad Curator',
          handle: isOwner ? currentAccount.handle : `@curator_${targetAddress.slice(2, 6)}`,
          bio: 'Autonomous curator tracking alpha signals on Monad Testnet.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          bookmarks: [],
          reputationScore: 85,
          totalEarningsMon: isOwner ? currentAccount.balanceMon : 0,
          joinedAt: Math.floor(Date.now() / 1000) - 86400 * 3
        };
        setProfile(fallback);
        setName(fallback.name);
        setHandle(fallback.handle);
        setBio(fallback.bio);
        setAvatarUrl(fallback.avatarUrl);
      }
    });
  }, [isOpen, targetAddress, currentAccount.address, currentAccount.name, currentAccount.handle, currentAccount.balanceMon, isOwner]);

  if (!isOpen || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    sound.playSwitchClick();
    try {
      const updated = await backendApi.updateProfile(targetAddress, {
        name,
        handle,
        bio,
        avatarUrl
      });
      if (updated) {
        setProfile(updated);
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
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
        zIndex: 110,
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
          maxWidth: '520px',
          padding: '28px',
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
            marginBottom: '20px',
            borderBottom: '1.5px solid #ffffff',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ffffff',
                boxShadow: '2px 2px 0px #ffffff'
              }}
            >
              <User size={16} color="#000000" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                CURATOR DOSSIER
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                OFFCHAIN CACHED PROFILE & STATS
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playDialTick();
              onClose();
            }}
            className="sk-button"
            style={{ padding: '6px', background: 'none', border: '1.5px solid #ffffff', cursor: 'pointer' }}
          >
            <X size={15} color="#ffffff" />
          </button>
        </div>

        {/* Profile Card View */}
        {!isEditing ? (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                style={{
                  width: '64px',
                  height: '64px',
                  border: '2px solid #ffffff',
                  boxShadow: '3px 3px 0px #ffffff',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {profile.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#a1a1aa' }}>
                  {profile.handle} // {formatAddress(profile.address)}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                    padding: '2px 8px',
                    background: '#000000',
                    border: '1px solid #ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#ffffff'
                  }}
                >
                  <Award size={12} color="#ffffff" />
                  <span>REPUTATION: {profile.reputationScore} / 100</span>
                </div>
              </div>
            </div>

            {/* Bio Box */}
            <div
              className="sk-well"
              style={{
                padding: '12px 14px',
                marginBottom: '20px',
                border: '1.5px solid #ffffff',
                boxShadow: '3px 3px 0px rgba(255,255,255,0.2)',
                borderRadius: '0px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                CURATOR THESIS & BIO:
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.4 }}>
                {profile.bio || 'No thesis provided.'}
              </p>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  background: '#141414',
                  border: '1.5px solid #ffffff',
                  padding: '10px 12px',
                  boxShadow: '2px 2px 0px #ffffff'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                  HISTORICAL EARNINGS
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  +{formatMon(profile.totalEarningsMon, 2)} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>MON</span>
                </div>
              </div>

              <div
                style={{
                  background: '#141414',
                  border: '1.5px solid #ffffff',
                  padding: '10px 12px',
                  boxShadow: '2px 2px 0px #ffffff'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                  ACTIVE BOOKMARKS
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {profile.bookmarks ? profile.bookmarks.length : 0} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>EMBERS</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={`https://testnet.monadexplorer.com/address/${profile.address}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--ink-soft)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem'
                }}
              >
                <ExternalLink size={12} />
                <span>VIEW ON MONAD EXPLORER</span>
              </a>

              {isOwner && (
                <button
                  onClick={() => {
                    sound.playSwitchClick();
                    setIsEditing(true);
                  }}
                  className="sk-button-primary"
                  style={{ padding: '8px 16px', fontSize: '0.80rem' }}
                >
                  <Edit3 size={13} />
                  <span>EDIT PROFILE</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                DISPLAY NAME
              </label>
              <input
                type="text"
                className="sk-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff', borderRadius: '0px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                HANDLE
              </label>
              <input
                type="text"
                className="sk-input"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                style={{ border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff', borderRadius: '0px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                AVATAR IMAGE URL
              </label>
              <input
                type="url"
                className="sk-input"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{ border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff', borderRadius: '0px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                BIO & CURATION THESIS
              </label>
              <textarea
                className="sk-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ border: '1.5px solid #ffffff', boxShadow: '2px 2px 0px #ffffff', borderRadius: '0px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="sk-button"
                style={{ padding: '8px 14px', fontSize: '0.80rem' }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="sk-button-primary"
                style={{ padding: '8px 18px', fontSize: '0.80rem' }}
              >
                <Check size={14} />
                <span>{isSaving ? 'SAVING...' : 'SAVE DOSSIER'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
