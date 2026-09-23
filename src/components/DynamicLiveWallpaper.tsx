import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Sliders, Flame, Sun, Droplets, Moon, Wind } from 'lucide-react';

export type AuroraMood = 'solar' | 'monad' | 'neon' | 'twilight';

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  decayRate: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  sparkle: boolean;
}

interface CausticRay {
  xRatio: number;
  widthRatio: number;
  angle: number;
  baseAlpha: number;
  speed: number;
  phase: number;
}

interface SplashWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const MOOD_CONFIG: Record<
  AuroraMood,
  {
    label: string;
    icon: typeof Flame;
    primaryColor: string;
    waveGradients: [string, string, string][];
    rayColor: string;
    emberColors: string[];
    sparkleColor: string;
  }
> = {
  solar: {
    label: 'SOLAR EMBER',
    icon: Flame,
    primaryColor: '#f5a623',
    waveGradients: [
      ['rgba(255, 90, 20, 0.22)', 'rgba(245, 166, 35, 0.18)', 'rgba(255, 200, 55, 0.0)'],
      ['rgba(217, 83, 30, 0.18)', 'rgba(255, 140, 0, 0.15)', 'rgba(255, 230, 100, 0.0)'],
      ['rgba(245, 166, 35, 0.14)', 'rgba(255, 110, 40, 0.12)', 'rgba(255, 180, 50, 0.0)'],
      ['rgba(180, 40, 10, 0.10)', 'rgba(230, 100, 20, 0.08)', 'rgba(255, 160, 40, 0.0)']
    ],
    rayColor: 'rgba(255, 210, 130, 0.07)',
    emberColors: ['#ff4500', '#ff7844', '#f5a623', '#ffc107', '#ff8c00', '#ffd700'],
    sparkleColor: '#fff5eb'
  },
  monad: {
    label: 'MONAD AURORA',
    icon: Droplets,
    primaryColor: '#836ef9',
    waveGradients: [
      ['rgba(131, 110, 249, 0.24)', 'rgba(99, 102, 241, 0.18)', 'rgba(56, 189, 248, 0.0)'],
      ['rgba(168, 85, 247, 0.18)', 'rgba(131, 110, 249, 0.15)', 'rgba(192, 132, 252, 0.0)'],
      ['rgba(56, 189, 248, 0.15)', 'rgba(99, 102, 241, 0.12)', 'rgba(131, 110, 249, 0.0)'],
      ['rgba(79, 70, 229, 0.12)', 'rgba(147, 51, 234, 0.09)', 'rgba(34, 211, 238, 0.0)']
    ],
    rayColor: 'rgba(167, 139, 250, 0.08)',
    emberColors: ['#836ef9', '#a78bfa', '#38bdf8', '#c084fc', '#22d3ee', '#6366f1'],
    sparkleColor: '#f0f9ff'
  },
  neon: {
    label: 'NEON PHOSPHOR',
    icon: Sun,
    primaryColor: '#34c76f',
    waveGradients: [
      ['rgba(52, 199, 111, 0.20)', 'rgba(16, 185, 129, 0.16)', 'rgba(74, 222, 128, 0.0)'],
      ['rgba(34, 197, 94, 0.16)', 'rgba(5, 150, 105, 0.13)', 'rgba(134, 239, 172, 0.0)'],
      ['rgba(74, 222, 128, 0.14)', 'rgba(16, 185, 129, 0.10)', 'rgba(52, 199, 111, 0.0)'],
      ['rgba(6, 95, 70, 0.10)', 'rgba(16, 185, 129, 0.07)', 'rgba(34, 197, 94, 0.0)']
    ],
    rayColor: 'rgba(110, 231, 183, 0.07)',
    emberColors: ['#34c76f', '#22c55e', '#10b981', '#4ade80', '#86efac', '#a7f3d0'],
    sparkleColor: '#f0fdf4'
  },
  twilight: {
    label: 'DEEP TWILIGHT',
    icon: Moon,
    primaryColor: '#e11d48',
    waveGradients: [
      ['rgba(225, 29, 72, 0.22)', 'rgba(147, 51, 234, 0.17)', 'rgba(245, 158, 11, 0.0)'],
      ['rgba(131, 24, 67, 0.18)', 'rgba(190, 24, 93, 0.14)', 'rgba(251, 146, 60, 0.0)'],
      ['rgba(88, 28, 135, 0.15)', 'rgba(126, 34, 206, 0.11)', 'rgba(236, 72, 153, 0.0)'],
      ['rgba(67, 56, 202, 0.12)', 'rgba(217, 70, 239, 0.08)', 'rgba(244, 63, 94, 0.0)']
    ],
    rayColor: 'rgba(244, 114, 182, 0.07)',
    emberColors: ['#f43f5e', '#fb923c', '#fbbf24', '#c084fc', '#e11d48', '#fda4af'],
    sparkleColor: '#fff1f2'
  }
};

export const DynamicLiveWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tuner state
  const [mood, setMood] = useState<AuroraMood>('solar');
  const [flowSpeed, setFlowSpeed] = useState<number>(1.0);
  const [waveAmplitude, setWaveAmplitude] = useState<number>(1.0);
  const [showRays, setShowRays] = useState<boolean>(true);
  const [emberDensity, setEmberDensity] = useState<'off' | 'subtle' | 'rich'>('rich');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);

  const embersRef = useRef<Ember[]>([]);
  const raysRef = useRef<CausticRay[]>([]);
  const splashesRef = useRef<SplashWave[]>([]);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number; active: boolean }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastX: -1000,
    lastY: -1000,
    active: false
  });
  const animFrameRef = useRef<number>(0);

  // Initialize rays
  useEffect(() => {
    raysRef.current = [
      { xRatio: 0.15, widthRatio: 0.22, angle: -0.25, baseAlpha: 0.7, speed: 0.0008, phase: 0 },
      { xRatio: 0.38, widthRatio: 0.28, angle: -0.18, baseAlpha: 0.85, speed: 0.0011, phase: 1.5 },
      { xRatio: 0.65, widthRatio: 0.25, angle: -0.22, baseAlpha: 0.65, speed: 0.0009, phase: 3.2 },
      { xRatio: 0.85, widthRatio: 0.30, angle: -0.15, baseAlpha: 0.75, speed: 0.0012, phase: 4.8 }
    ];
  }, []);

  // Main rendering engine
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

    const currentMoodConfig = MOOD_CONFIG[mood];

    // Seed embers based on density setting
    const getEmberCount = () => {
      if (emberDensity === 'off') return 0;
      if (emberDensity === 'subtle') return width < 768 ? 20 : 35;
      return width < 768 ? 40 : 70;
    };

    const createEmber = (bottomSpawn = false): Ember => {
      const sparkle = Math.random() < 0.2;
      const baseColor = sparkle
        ? currentMoodConfig.sparkleColor
        : currentMoodConfig.emberColors[Math.floor(Math.random() * currentMoodConfig.emberColors.length)];

      return {
        x: Math.random() * width,
        y: bottomSpawn ? height + Math.random() * 30 : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6 * flowSpeed,
        vy: -(Math.random() * 0.7 + 0.3) * flowSpeed,
        size: sparkle ? Math.random() * 2.8 + 1.8 : Math.random() * 2.2 + 1.0,
        color: baseColor,
        alpha: Math.random() * 0.6 + 0.35,
        life: Math.random() * 0.6 + 0.4,
        maxLife: 1.0,
        decayRate: Math.random() * 0.0025 + 0.0012,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleOffset: Math.random() * Math.PI * 2,
        sparkle
      };
    };

    embersRef.current = Array.from({ length: getEmberCount() }, () => createEmber(false));

    let time = 0;

    const render = () => {
      time += 0.008 * flowSpeed;

      // Clear canvas cleanly
      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------------
      // Layer 1: Volumetric Caustic Light Rays (Filtered through liquid)
      // -----------------------------------------------------------------
      if (showRays) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (const ray of raysRef.current) {
          const rayPhase = Math.sin(time * 0.5 + ray.phase);
          const currentAlpha = ray.baseAlpha * (0.65 + 0.35 * rayPhase);
          const originX = width * (ray.xRatio + Math.sin(time * 0.3 + ray.phase) * 0.05);
          const rayWidth = width * ray.widthRatio;

          const grad = ctx.createLinearGradient(
            originX,
            0,
            originX + Math.sin(ray.angle) * height,
            height
          );
          grad.addColorStop(0, currentMoodConfig.rayColor);
          grad.addColorStop(0.4, currentMoodConfig.rayColor);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(originX - rayWidth * 0.4, 0);
          ctx.lineTo(originX + rayWidth * 0.4, 0);
          ctx.lineTo(originX + Math.sin(ray.angle) * height + rayWidth * 0.8, height);
          ctx.lineTo(originX + Math.sin(ray.angle) * height - rayWidth * 0.8, height);
          ctx.closePath();
          ctx.globalAlpha = currentAlpha;
          ctx.fill();
        }
        ctx.restore();
      }

      // -----------------------------------------------------------------
      // Layer 2: Liquid Chromatic Aurora Wave Ribbons (Smooth Bezier Waves)
      // -----------------------------------------------------------------
      const mouse = mouseRef.current;
      const waveCount = currentMoodConfig.waveGradients.length;

      ctx.save();
      // We use smooth blending so waves stack like liquid silk
      ctx.globalCompositeOperation = 'screen';

      for (let w = 0; w < waveCount; w++) {
        const stops = currentMoodConfig.waveGradients[w];
        const waveBaseY = height * (0.28 + w * 0.16);
        const waveFreq = 0.0018 + w * 0.0006;
        const waveSpeedFactor = 0.7 + w * 0.25;
        const amplitude = (55 + w * 18) * waveAmplitude;

        // Wave gradient
        const waveGrad = ctx.createLinearGradient(0, waveBaseY - amplitude * 1.5, width, waveBaseY + amplitude * 2.2);
        waveGrad.addColorStop(0, stops[0]);
        waveGrad.addColorStop(0.55, stops[1]);
        waveGrad.addColorStop(1, stops[2]);

        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, waveBaseY);

        const step = 28; // Step size for smooth curves
        for (let x = 0; x <= width + step; x += step) {
          // Harmonic wave equation
          const wave1 = Math.sin(x * waveFreq + time * waveSpeedFactor) * amplitude;
          const wave2 = Math.cos(x * waveFreq * 0.7 - time * 0.4 + w) * (amplitude * 0.45);
          const wave3 = Math.sin(x * waveFreq * 1.6 + time * 0.8) * (amplitude * 0.2);

          // Mouse fluid depression/displacement
          let mouseDisplacement = 0;
          if (mouse.active) {
            const mDist = Math.abs(x - mouse.x);
            if (mDist < 220) {
              const mForce = (1 - mDist / 220);
              mouseDisplacement = Math.sin(mForce * Math.PI) * 45 * Math.sign(mouse.vy || 1);
            }
          }

          const currentY = waveBaseY + wave1 + wave2 + wave3 + mouseDisplacement;
          ctx.lineTo(x, currentY);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // -----------------------------------------------------------------
      // Layer 3: Interactive Splash Waves (Click Ripples)
      // -----------------------------------------------------------------
      for (let s = splashesRef.current.length - 1; s >= 0; s--) {
        const sp = splashesRef.current[s];
        sp.radius += 3.2 * flowSpeed;
        sp.alpha = Math.max(0, 0.4 * (1 - sp.radius / sp.maxRadius));

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Secondary soft inner halo
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius * 0.65, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = sp.alpha * 0.6;
        ctx.stroke();
        ctx.restore();

        if (sp.radius >= sp.maxRadius) {
          splashesRef.current.splice(s, 1);
        }
      }

      // -----------------------------------------------------------------
      // Layer 4: Glowing Embers & Micro-Sparks
      // -----------------------------------------------------------------
      const embers = embersRef.current;
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];

        // Wobble physics
        p.wobbleOffset += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobbleOffset) * 0.55;
        p.y += p.vy;

        // Mouse turbulence & thermal eddy
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          const pushRadius = 160;

          if (mDist < pushRadius && mDist > 0) {
            const force = (1 - mDist / pushRadius) * 2.8;
            p.x += (mdx / mDist) * force;
            p.y += (mdy / mDist) * force - 0.8; // gentle thermal lift
          }
        }

        // Half-life decay
        p.life -= p.decayRate * flowSpeed;
        p.alpha = Math.max(0.04, Math.sin(p.life * Math.PI) * 0.85);

        // Respawn if out of viewport or dead
        if (p.y < -30 || p.life <= 0 || p.x < -30 || p.x > width + 30) {
          embers[i] = createEmber(true);
        }

        // Render Ember
        ctx.save();
        ctx.globalAlpha = p.alpha;

        // Outer glow
        const glowRadius = p.size * (p.sparkle ? 3.5 : 2.4);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hot inner spark
        ctx.fillStyle = p.sparkle ? '#ffffff' : '#fff7ed';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Mouse velocity & position tracking
    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mouseRef.current.x;
      const prevY = mouseRef.current.y;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: e.clientX - prevX,
        vy: e.clientY - prevY,
        lastX: prevX,
        lastY: prevY,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      // Create splash ripple
      splashesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 220,
        alpha: 0.5,
        color: currentMoodConfig.primaryColor
      });

      // Erupt mini burst of glowing sparks
      const burst = 10;
      for (let b = 0; b < burst; b++) {
        const angle = (b / burst) * Math.PI * 2 + Math.random() * 0.5;
        const speed = Math.random() * 3.2 + 1.2;
        embersRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 2.5 + 1.5,
          color: currentMoodConfig.primaryColor,
          alpha: 0.95,
          life: 1.0,
          maxLife: 1.0,
          decayRate: 0.016,
          wobbleSpeed: 0.04,
          wobbleOffset: Math.random() * Math.PI,
          sparkle: true
        });
      }
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
  }, [mood, flowSpeed, waveAmplitude, showRays, emberDensity, isEnabled]);

  return (
    <>
      {/* Liquid Chromatic Aurora & Embers Canvas */}
      {isEnabled && (
        <canvas
          ref={canvasRef}
          id="ember-chromatic-aurora"
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

      {/* Meridian Skeuomorphic Ambience Tuner (Pinned Bottom Right) */}
      <aside
        aria-label="Liquid Aurora Live Wallpaper Tuner"
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
        {/* Expanded Tuner Console */}
        {isTunerOpen && (
          <div
            className="sk-panel sk-fade-in"
            style={{
              width: '290px',
              padding: '16px',
              border: '2px solid #2b2824',
              boxShadow: '0 14px 32px rgba(0,0,0,0.38)',
              position: 'relative'
            }}
          >
            {/* Rivets */}
            <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', top: '6px', right: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', bottom: '6px', left: '6px' }} className="sk-rivet" />
            <div style={{ position: 'absolute', bottom: '6px', right: '6px' }} className="sk-rivet" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`sk-lamp ${isEnabled ? 'sk-lamp-amber' : 'sk-lamp-red'}`} />
                <span className="text-micro" style={{ letterSpacing: '0.08em' }}>
                  LIQUID AURORA TUNER
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
                  background: isEnabled ? '#34c76f' : '#777',
                  color: '#ffffff'
                }}
              >
                {isEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Mood / Palette Presets */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                CHROMATIC MOOD
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(Object.keys(MOOD_CONFIG) as AuroraMood[]).map((m) => {
                  const cfg = MOOD_CONFIG[m];
                  const Icon = cfg.icon;
                  const isCurrent = mood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`sk-btn ${isCurrent ? 'sk-btn-primary' : ''}`}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.68rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: isCurrent ? 700 : 500
                      }}
                    >
                      <Icon size={12} color={isCurrent ? '#ffffff' : cfg.primaryColor} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flow Speed Multiplier */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="text-micro">FLUID FLOW VELOCITY</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                  {flowSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.1"
                value={flowSpeed}
                onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f5a623', cursor: 'pointer' }}
              />
            </div>

            {/* Wave Amplitude */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="text-micro">WAVE SWELL INTENSITY</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                  {waveAmplitude.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={waveAmplitude}
                onChange={(e) => setWaveAmplitude(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f5a623', cursor: 'pointer' }}
              />
            </div>

            {/* Ember Density */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                EMBER SPARKS
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['off', 'subtle', 'rich'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setEmberDensity(d)}
                    className="sk-btn"
                    style={{
                      flex: 1,
                      padding: '5px',
                      fontSize: '0.68rem',
                      background: emberDensity === d ? '#2b2824' : undefined,
                      color: emberDensity === d ? '#ffffff' : undefined
                    }}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Caustic Light Rays Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowRays(!showRays)}
                className="sk-badge"
                style={{
                  width: '100%',
                  padding: '7px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: showRays ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
                  color: showRays ? '#b86500' : 'var(--ink-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sun size={12} />
                <span>CAUSTIC LIGHT SHAFTS: {showRays ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimized Pill Button */}
        <button
          type="button"
          onClick={() => setIsTunerOpen(!isTunerOpen)}
          className="sk-btn card-hover"
          title="Toggle Liquid Aurora Live Wallpaper Settings"
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
            className={`sk-lamp ${
              isEnabled
                ? mood === 'monad'
                  ? 'sk-lamp-blue'
                  : mood === 'neon'
                  ? 'sk-lamp-green'
                  : 'sk-lamp-amber'
                : 'sk-lamp-red'
            }`}
          />
          <Droplets size={14} color={MOOD_CONFIG[mood].primaryColor} />
          <span>AURORA: {isEnabled ? MOOD_CONFIG[mood].label : 'OFF'}</span>
          <Sliders size={13} color="rgba(255,255,255,0.7)" style={{ marginLeft: '4px' }} />
        </button>
      </aside>
    </>
  );
};

export default DynamicLiveWallpaper;
