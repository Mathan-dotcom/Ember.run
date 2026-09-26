import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { formatAddress } from '../utils/decay';
import { Send, Tag, Link2, ShieldAlert, FileText, Save, Trash2, Check } from 'lucide-react';
import { backendApi, PostDraftData } from '../services/api';

export const PostComposer: React.FC = () => {
  const { currentAccount, createPost } = useWallet();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['monad', 'curation']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [drafts, setDrafts] = useState<PostDraftData[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedNotice, setDraftSavedNotice] = useState(false);

  const AVAILABLE_TAGS = ['monad', 'curation', 'parallel-evm', 'alpha', 'defi', 'infra', 'passkey'];

  // Load drafts for active account
  useEffect(() => {
    backendApi.getDrafts(currentAccount.address).then((loaded) => {
      setDrafts(loaded || []);
    });
  }, [currentAccount.address]);

  const toggleTag = (tag: string) => {
    sound.playDialTick();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !body.trim()) return;
    setIsSavingDraft(true);
    sound.playSwitchClick();
    try {
      const saved = await backendApi.saveDraft({
        authorAddress: currentAccount.address,
        title: title.trim() || 'Untitled Draft',
        body: body.trim() || '',
        tags: selectedTags,
        linkUrl: linkUrl.trim() || undefined
      });
      if (saved) {
        setCurrentDraftId(saved.id);
        const updated = await backendApi.getDrafts(currentAccount.address);
        setDrafts(updated || []);
        setDraftSavedNotice(true);
        setTimeout(() => setDraftSavedNotice(false), 2500);
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleRestoreDraft = (draft: PostDraftData) => {
    sound.playSwitchClick();
    setTitle(draft.title);
    setBody(draft.body);
    setLinkUrl(draft.linkUrl || '');
    if (draft.tags && draft.tags.length > 0) {
      setSelectedTags(draft.tags);
    }
    setCurrentDraftId(draft.id);
    setIsExpanded(true);
    setShowDrafts(false);
  };

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playDialTick();
    await backendApi.deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (currentDraftId === id) setCurrentDraftId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playSwitchClick();

    try {
      await createPost(title.trim(), body.trim(), selectedTags, linkUrl.trim() || undefined);
      if (currentDraftId) {
        await backendApi.deleteDraft(currentDraftId);
        setDrafts((prev) => prev.filter((d) => d.id !== currentDraftId));
        setCurrentDraftId(null);
      }
      setTitle('');
      setBody('');
      setLinkUrl('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="sk-panel scroll-fade-card" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Console Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="01" />
          <h2 className="text-heading">DISPATCH CONSOLE</h2>
          <span className="sk-badge" style={{ fontSize: '0.68rem' }}>
            ONCHAIN REGISTRY
          </span>
          {drafts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDrafts(!showDrafts)}
              className="sk-badge"
              style={{
                cursor: 'pointer',
                background: showDrafts ? '#ffffff' : '#070e1b',
                color: showDrafts ? '#030712' : '#f8fafc',
                border: '1.5px solid #ffffff',
                boxShadow: '1px 1px 0px #ffffff',
                fontSize: '0.68rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={11} />
              <span>DRAFTS ({drafts.length})</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-micro">POSTER:</span>
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.70rem' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currentAccount.handle}</span>
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>({formatAddress(currentAccount.address)})</span>
          </span>
        </div>
      </div>

      {/* Offchain Drafts Drawer */}
      {showDrafts && drafts.length > 0 && (
        <div
          style={{
            background: 'rgba(7, 14, 28, 0.95)',
            border: '1.5px solid #ffffff',
            boxShadow: '3px 3px 0px #ffffff',
            padding: '12px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.70rem',
              color: 'var(--ink-soft)',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}
          >
            Saved Offchain Drafts ({drafts.length}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {drafts.map((d) => (
              <div
                key={d.id}
                onClick={() => handleRestoreDraft(d)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#050910',
                  padding: '8px 12px',
                  border: '1px solid rgba(223, 156, 50, 0.25)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600, color: '#fdfaf2' }}>
                    {d.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
                    {d.tags?.map((t) => `#${t}`).join(' ')} // {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDraft(d.id, e)}
                    title="Delete Draft"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-soft)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={13} color="#ff5555" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title Recessed Input */}
        <div style={{ marginBottom: '12px' }}>
          <div className="sk-well" style={{ padding: '2px', border: '1.5px solid #ffffff', boxShadow: '3px 3px 0px rgba(255, 255, 255, 0.3)', borderRadius: '0px' }}>
            <input
              type="text"
              className="sk-input"
              placeholder="Ember Title / Key Finding (e.g. Monad Parallel State Proofs)"
              value={title}
              onFocus={() => setIsExpanded(true)}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontWeight: 600 }}
              required
            />
          </div>
        </div>

        {/* Content Recessed Well */}
        <div style={{ marginBottom: '12px' }}>
          <div className="sk-well" style={{ padding: '2px', border: '1.5px solid #ffffff', boxShadow: '3px 3px 0px rgba(255, 255, 255, 0.3)', borderRadius: '0px' }}>
            <textarea
              className="sk-input"
              placeholder="Describe your thesis, alpha discovery, or technical review..."
              value={body}
              onFocus={() => setIsExpanded(true)}
              onChange={(e) => setBody(e.target.value)}
              rows={isExpanded ? 3 : 2}
              style={{ resize: 'vertical' }}
              required
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Optional Reference Link */}
            <div style={{ marginBottom: '14px' }}>
              <div
                className="sk-well"
                style={{ display: 'flex', alignItems: 'center', padding: '2px 10px', border: '1.5px solid #ffffff', boxShadow: '3px 3px 0px rgba(255, 255, 255, 0.3)', borderRadius: '0px' }}
              >
                <Link2 size={15} color="#ffffff" style={{ marginRight: '6px' }} />
                <input
                  type="url"
                  className="sk-input"
                  placeholder="Reference URL (Docs, GitHub, or Research Link)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ padding: '8px 0', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Tag Filter Chips */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap'
                }}
              >
                <span className="text-micro" style={{ marginRight: '4px' }}>
                  <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> TAGS:
                </span>
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`sk-badge ${isSelected ? 'sk-badge--inverted' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '3px 10px',
                        fontSize: '0.70rem',
                        transition: 'all 0.15s ease',
                        borderRadius: '0px',
                        border: '1.5px solid #ffffff',
                        boxShadow: isSelected ? '2px 2px 0px #f8fafc' : '1px 1px 0px rgba(255, 255, 255, )',
                        background: isSelected ? '#ffffff' : '#070e1b',
                        color: isSelected ? '#030712' : '#f8fafc'
                      }}
                    >
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer / Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderTop: '1px solid rgba(223, 156, 50, 0.25)',
            paddingTop: '12px'
          }}
        >
          {/* Anti-gaming rule notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.74rem',
              color: 'var(--ink-soft)'
            }}
          >
            <ShieldAlert size={14} color="#f59e0b" />
            <span>Anti-Gaming: Posters cannot boost their own content. 40% of future boosts go to you.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={(!title.trim() && !body.trim()) || isSavingDraft}
              className="sk-button"
              title="Save draft to offchain cache"
              style={{
                padding: '8px 14px',
                fontSize: '0.80rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {draftSavedNotice ? <Check size={13} color="#34c76f" /> : <Save size={13} color="#ffffff" />}
              <span>{isSavingDraft ? 'SAVING...' : draftSavedNotice ? 'SAVED' : 'SAVE DRAFT'}</span>
            </button>

            <button
              type="submit"
              className="sk-button-primary"
              disabled={!title.trim() || !body.trim() || isSubmitting}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'DISPATCHING...' : 'DISPATCH EMBER'}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default PostComposer;
