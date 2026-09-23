import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Sliders, Flame, Compass, Zap } from 'lucide-react';

export type WallpaperTheme = 'embers' | 'monad' | 'stealth' | 'void';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  decayRate: number;
  life: number;
  maxLife: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  isSpecial?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const THEME_PALETTES: Record<WallpaperTheme, { embers: string[]; special: string; bgTone: string; accent: string }> = {
  embers: {
    embers: ['#ff4500', '#ff7844', '#f5a623', '#ffc107', '#ff8c00', '#d9531e'],
    special: '#ffd700',
    bgTone: 'rgba(245, 166, 35, 0.03)',
    accent: '#f5a623'
  },
  monad: {
    embers: ['#836ef9', '#a78bfa', '#6366f1', '#c084fc', '#38bdf8', '#4f46e5'],
    special: '#22d3ee',
    bgTone: 'rgba(131, 110, 249, 0.04)',
    accent: '#836ef9'
  },
  stealth: {
    embers: ['#34c76f', '#22c55e', '#10b981', '#15803d', '#4ade80', '#059669'],
    special: '#86efac',
    bgTone: 'rgba(52, 199, 111, 0.03)',
    accent: '#34c76f'
  },
  void: {
    embers: ['#ff5252', '#ff7a00', '#ffbe0b', '#836ef9', '#ffffff'],
    special: '#00e5ff',
    bgTone: 'rgba(10, 9, 8, 0.45)',
    accent: '#ff7a00'
  }
};

export const DynamicLiveWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<WallpaperTheme>('embers');
  const [density, setDensity] = useState<'low' | 'balanced' | 'dense'>('balanced');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showFilaments, setShowFilaments] = useState<boolean>(true);
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);

  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);

  // Initialize and maintain particles
  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle count calculation based on density
    const getCount = () => {
      const base = width < 768 ? 45 : width < 1200 ? 75 : 110;
      if (density === 'low') return Math.floor(base * 0.55);
      if (density === 'dense') return Math.floor(base * 1.5);
      return base;
    };

    const palette = THEME_PALETTES[theme];

    const createParticle = (spawnAtBottom = false): Particle => {
      const isSpecial = Math.random() < 0.12;
      const baseColor = isSpecial
        ? palette.special
        : palette.embers[Math.floor(Math.random() * palette.embers.length)];
      const baseSize = isSpecial ? Math.random() * 2.8 + 2.0 : Math.random() * 2.2 + 1.0;

      return {
        x: Math.random() * width,
        y: spawnAtBottom ? height + Math.random() * 20 : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7 * speedMultiplier,
        vy: -(Math.random() * 0.9 + 0.35) * speedMultiplier,
        size: baseSize,
        baseSize,
        color: baseColor,
        alpha: Math.random() * 0.65 + 0.35,
        decayRate: Math.random() * 0.003 + 0.0015,
        life: Math.random() * 0.6 + 0.4,
        maxLife: 1.0,
        wobbleSpeed: Math.random() * 0.03 + 0.015,
        wobbleOffset: Math.random() * Math.PI * 2,
        isSpecial
      };
    };

    const targetCount = getCount();
    particlesRef.current = Array.from({ length: targetCount }, () => createParticle(false));

    // Periodic ambient radar wave from center
    let lastRadarTick = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Void theme subtle backdrop wash
      if (theme === 'void') {
        ctx.fillStyle = 'rgba(18, 16, 14, 0.4)';
        ctx.fillRect(0, 0, width, height);
      }

      // Radar pulse spawning
      if (showRadar && time - lastRadarTick > 6500) {
        lastRadarTick = time;
        ripplesRef.current.push({
          x: width * 0.5,
          y: height * 0.45,
          radius: 0,
          maxRadius: Math.max(width, height) * 0.85,
          alpha: 0.28,
          color: palette.accent
        });
      }

      // Draw and update Ripples (Radar Waves)
      if (showRadar) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += 1.8 * speedMultiplier;
          r.alpha = Math.max(0, 0.28 * (1 - r.radius / r.maxRadius));

          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = r.alpha;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;

          if (r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1);
          }
        }
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Draw Filaments between close embers (neural curation graph)
      if (showFilaments) {
        const maxDist = width < 768 ? 65 : 95;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxDist) {
              const filamentAlpha = (1 - dist / maxDist) * 0.15 * Math.min(particles[i].alpha, particles[j].alpha);
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = particles[i].color;
              ctx.globalAlpha = filamentAlpha;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // Update & Render each Ember
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wobble physics (simulates warm rising air currents)
        p.wobbleOffset += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobbleOffset) * 0.45;
        p.y += p.vy;

        // Mouse turbulence / thermal draft
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          const pushRadius = 140;

          if (mDist < pushRadius && mDist > 0) {
            const force = (1 - mDist / pushRadius) * 2.2;
            p.x += (mdx / mDist) * force;
            p.y += (mdy / mDist) * force - 0.6; // gentle upward updraft
          }
        }

        // Half-life decay simulation
        p.life -= p.decayRate * speedMultiplier;
        p.alpha = Math.max(0.05, Math.sin(p.life * Math.PI) * 0.85);

        // Respawn if drifted off top or died out
        if (p.y < -20 || p.life <= 0 || p.x < -30 || p.x > width + 30) {
          particles[i] = createParticle(true);
        }

        // Render Ember with glowing halo
        ctx.save();
        ctx.globalAlpha = p.alpha;

        // Soft outer glow gradient
        const glowRadius = p.size * (p.isSpecial ? 3.8 : 2.6);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hot inner ember core
        ctx.fillStyle = p.isSpecial ? '#ffffff' : '#fff5eb';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Mouse tracking for dynamic interactive thermals
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn burst of small sparks on click
      const burstCount = 8;
      for (let k = 0; k < burstCount; k++) {
        const angle = (k / burstCount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = Math.random() * 2.8 + 1.2;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          size: Math.random() * 2.2 + 1.4,
          baseSize: 2.0,
          color: palette.special,
          alpha: 0.95,
          decayRate: 0.015,
          life: 1.0,
          maxLife: 1.0,
          wobbleSpeed: 0.04,
          wobbleOffset: Math.random() * Math.PI,
          isSpecial: true
        });
      }

      // Add a click ripple
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 180,
        alpha: 0.4,
        color: palette.special
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, density, speedMultiplier, showFilaments, showRadar, isEnabled]);

  return (
    <>
      {/* Dynamic Canvas Wallpaper Layer */}
      {isEnabled && (
        <canvas
          ref={canvasRef}
          id="ember-dynamic-wallpaper"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'opacity 0.6s ease'
          }}
        />
      )}

      {/* Skeuomorphic Live Wallpaper Control Tuner (Bottom Right Corner) */}
      <aside
        aria-label="Live Wallpaper Settings"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {/* Expanded Tuner Dashboard */}
        {isTunerOpen && (
          <div
            className="sk-panel sk-fade-in"
            style={{
              width: '280px',
              padding: '16px',
              border: '2px solid #2b2824',
              boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
              position: 'relative'
            }}
          >
            {/* Rivets */}
            <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', top: '6px', right: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', bottom: '6px', left: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', bottom: '6px', right: '6px' }} className="sk-rivet" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`sk-lamp ${isEnabled ? 'sk-lamp-amber' : 'sk-lamp-red'}`} />
                <span className="text-micro" style={{ letterSpacing: '0.08em' }}>
                  AMBIENT WALLPAPER TUNER
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className="sk-badge"
                style={{
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: isEnabled ? '#34c76f' : '#888',
                  color: '#ffffff'
                }}
              >
                {isEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Theme Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                SPECTRAL PALETTE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(
                  [
                    { id: 'embers', label: 'WARM EMBERS', icon: Flame, color: '#f5a623' },
                    { id: 'monad', label: 'MONAD PLASMA', icon: Zap, color: '#836ef9' },
                    { id: 'stealth', label: 'RADAR GREEN', icon: Compass, color: '#34c76f' },
                    { id: 'void', label: 'DEEP VOID', icon: Sparkles, color: '#ff7844' }
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const isCurrent = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`sk-btn ${isCurrent ? 'sk-btn-primary' : ''}`}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.68rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: isCurrent ? 700 : 500
                      }}
                    >
                      <Icon size={12} color={isCurrent ? '#ffffff' : t.color} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Particle Density */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                EMBER DENSITY
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['low', 'balanced', 'dense'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className="sk-btn"
                    style={{
                      flex: 1,
                      padding: '5px',
                      fontSize: '0.68rem',
                      background: density === d ? '#2b2824' : undefined,
                      color: density === d ? '#ffffff' : undefined
                    }}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Drift Speed Multiplier */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="text-micro">THERMAL VELOCITY</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                  {speedMultiplier.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f5a623', cursor: 'pointer' }}
              />
            </div>

            {/* Toggles: Filaments & Radar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowFilaments(!showFilaments)}
                className="sk-badge"
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: showFilaments ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
                  color: showFilaments ? '#b86500' : 'var(--ink-soft)'
                }}
              >
                ● FILAMENTS: {showFilaments ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setShowRadar(!showRadar)}
                className="sk-badge"
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: showRadar ? 'rgba(52, 199, 111, 0.2)' : 'transparent',
                  color: showRadar ? '#279a52' : 'var(--ink-soft)'
                }}
              >
                ● RADAR: {showRadar ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}

        {/* Minimized Skeuomorphic Pill Trigger */}
        <button
          type="button"
          onClick={() => setIsTunerOpen(!isTunerOpen)}
          className="sk-btn card-hover"
          title="Toggle Dynamic Live Wallpaper Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, #2b2824 0%, #1a1815 100%)',
            color: '#f4f1e8',
            border: '1px solid #44403b',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}
        >
          <span
            className={`sk-lamp ${isEnabled ? (theme === 'monad' ? 'sk-lamp-blue' : theme === 'stealth' ? 'sk-lamp-green' : 'sk-lamp-amber') : 'sk-lamp-red'}`}
          />
          <Flame size={14} color="#f5a623" />
          <span>LIVE AMBIENCE: {isEnabled ? theme.toUpperCase() : 'OFF'}</span>
          <Sliders size={13} color="rgba(255,255,255,0.7)" style={{ marginLeft: '4px' }} />
        </button>
      </aside>
    </>
  );
};
export default DynamicLiveWallpaper;
