import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { sound } from '../utils/sound';
import { formatAddress } from '../utils/decay';
import { Send, Tag, Link2, ShieldAlert, Sparkles } from 'lucide-react';

export const PostComposer: React.FC = () => {
  const { currentAccount, createPost } = useWallet();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['monad', 'curation']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const AVAILABLE_TAGS = ['monad', 'curation', 'parallel-evm', 'alpha', 'defi', 'infra', 'passkey'];

  const toggleTag = (tag: string) => {
    sound.playDialTick();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playSwitchClick();

    try {
      await createPost(title.trim(), body.trim(), selectedTags, linkUrl.trim() || undefined);
      setTitle('');
      setBody('');
      setLinkUrl('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="sk-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Console Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          paddingBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sk-index" data-index="01" />
          <h2 className="text-heading">DISPATCH CONSOLE</h2>
          <span className="sk-badge" style={{ fontSize: '0.7rem' }}>
            ONCHAIN REGISTRY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-micro">POSTER:</span>
          <span className="sk-badge sk-badge--inverted" style={{ fontSize: '0.72rem' }}>
            <span className="sk-lamp sk-lamp-green" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currentAccount.handle}</span>
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>({formatAddress(currentAccount.address)})</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Recessed Input */}
        <div style={{ marginBottom: '12px' }}>
          <div className="sk-well" style={{ padding: '2px' }}>
            <input
              type="text"
              className="sk-input"
              placeholder="Signal Title / Key Finding (e.g. Monad Fast Finality Analysis)"
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
          <div className="sk-well" style={{ padding: '2px' }}>
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
                style={{ display: 'flex', alignItems: 'center', padding: '2px 10px' }}
              >
                <Link2 size={16} color="var(--ink-soft)" style={{ marginRight: '6px' }} />
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
                        fontSize: '0.72rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected && <span className="sk-lamp sk-lamp-blue" />}
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
            borderTop: '1px solid rgba(0,0,0,0.08)',
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
              fontSize: '0.75rem',
              color: 'var(--ink-soft)'
            }}
          >
            <ShieldAlert size={14} color="#f5a623" />
            <span>Anti-Gaming: Posters cannot boost their own content. 40% of future boosts go to you.</span>
          </div>

          <button
            type="submit"
            className="sk-button-primary"
            disabled={!title.trim() || !body.trim() || isSubmitting}
            style={{ padding: '8px 20px' }}
          >
            <Send size={15} />
            <span>{isSubmitting ? 'BROADCASTING...' : 'BROADCAST TO MONAD'}</span>
          </button>
        </div>
      </form>
    </section>
  );
};
