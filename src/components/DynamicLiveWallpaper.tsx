import React, { useEffect, useRef, useState } from 'react';
import { Sliders, Activity, Eye, EyeOff, Radio, Network } from 'lucide-react';

export type AmbienceMode = 'network' | 'glow' | 'grid';

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface AmbientOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const DynamicLiveWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Professional Ambience Settings
  const [mode, setMode] = useState<AmbienceMode>('network');
  const [intensity, setIntensity] = useState<'subtle' | 'balanced' | 'elevated'>('balanced');
  const [showCursorGlow, setShowCursorGlow] = useState<boolean>(true);
  const [showNetworkMesh, setShowNetworkMesh] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);

  const nodesRef = useRef<NetworkNode[]>([]);
  const orbsRef = useRef<AmbientOrb[]>([]);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; active: boolean }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false
  });
  const animFrameRef = useRef<number>(0);

  // Initialize nodes and ambient orbs
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

    // Dynamic node count based on screen size & intensity
    const getNodeCount = () => {
      const base = width < 768 ? 32 : width < 1200 ? 50 : 70;
      if (intensity === 'subtle') return Math.floor(base * 0.6);
      if (intensity === 'elevated') return Math.floor(base * 1.3);
      return base;
    };

    // Initialize institutional ambient glowing light orbs
    orbsRef.current = [
      {
        x: width * 0.25,
        y: height * 0.2,
        vx: 0.12,
        vy: 0.08,
        radius: Math.min(width, height) * 0.45,
        color: 'rgba(131, 110, 249, 0.07)' // Monad Violet
      },
      {
        x: width * 0.75,
        y: height * 0.65,
        vx: -0.1,
        vy: -0.07,
        radius: Math.min(width, height) * 0.4,
        color: 'rgba(0, 240, 255, 0.04)' // Cyber Cyan
      },
      {
        x: width * 0.5,
        y: height * 0.85,
        vx: 0.08,
        vy: -0.11,
        radius: Math.min(width, height) * 0.35,
        color: 'rgba(99, 102, 241, 0.05)' // Electric Indigo
      }
    ];

    // Initialize clean technical network nodes
    const count = getNodeCount();
    nodesRef.current = Array.from({ length: count }, () => {
      const speed = 0.22;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 1.2 + 1.0,
        baseAlpha: Math.random() * 0.35 + 0.2,
        alpha: 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.008
      };
    });

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor lerp physics (delicate spotlight follows smoothly)
      const mouse = mouseRef.current;
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      // -----------------------------------------------------------------
      // Layer 1: Ambient Floating Light Orbs (Linear/Vercel style)
      // -----------------------------------------------------------------
      if (mode === 'network' || mode === 'glow') {
        const alphaFactor = intensity === 'subtle' ? 0.6 : intensity === 'elevated' ? 1.4 : 1.0;

        for (const orb of orbsRef.current) {
          orb.x += orb.vx;
          orb.y += orb.vy;

          // Gentle bounce off viewport edges
          if (orb.x < -orb.radius * 0.2 || orb.x > width + orb.radius * 0.2) orb.vx *= -1;
          if (orb.y < -orb.radius * 0.2 || orb.y > height + orb.radius * 0.2) orb.vy *= -1;

          const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
          grad.addColorStop(0, orb.color);
          grad.addColorStop(1, 'transparent');

          ctx.save();
          ctx.globalAlpha = alphaFactor;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // -----------------------------------------------------------------
      // Layer 2: Subtle Interactive Cursor Spotlight
      // -----------------------------------------------------------------
      if (showCursorGlow && mouse.active && mouse.x > 0) {
        const spotRadius = width < 768 ? 220 : 360;
        const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, spotRadius);
        spotGrad.addColorStop(0, 'rgba(131, 110, 249, 0.065)');
        spotGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.025)');
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // -----------------------------------------------------------------
      // Layer 3: Minimalist Technical Grid / Constellation Mesh
      // -----------------------------------------------------------------
      if (mode === 'network' || mode === 'grid') {
        const nodes = nodesRef.current;
        const maxDist = width < 768 ? 90 : 130;
        const alphaScale = intensity === 'subtle' ? 0.6 : intensity === 'elevated' ? 1.25 : 0.9;

        // Draw clean connecting filaments between neighbor nodes
        if (showNetworkMesh && mode === 'network') {
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const dist = Math.hypot(dx, dy);

              if (dist < maxDist) {
                const lineAlpha = (1 - dist / maxDist) * 0.16 * alphaScale;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = '#836ef9';
                ctx.globalAlpha = lineAlpha;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }

        // Draw and update each individual node point
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];

          // Slow drift
          n.x += n.vx;
          n.y += n.vy;

          // Wrap around edges smoothly
          if (n.x < -10) n.x = width + 10;
          if (n.x > width + 10) n.x = -10;
          if (n.y < -10) n.y = height + 10;
          if (n.y > height + 10) n.y = -10;

          // Gentle breathing pulse
          n.pulsePhase += n.pulseSpeed;
          n.alpha = (n.baseAlpha + Math.sin(n.pulsePhase) * 0.15) * alphaScale;

          // Render node
          ctx.save();
          ctx.globalAlpha = Math.max(0.08, n.alpha);
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle pin-point aura
          ctx.globalAlpha = n.alpha * 0.35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Track mouse coordinates for smooth spotlight
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, intensity, showCursorGlow, showNetworkMesh, isEnabled]);

  return (
    <>
      {/* Clean Technical Canvas Layer */}
      {isEnabled && (
        <canvas
          ref={canvasRef}
          id="ember-professional-wallpaper"
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

      {/* Sleek Professional Ambience Tuner (Pinned Bottom-Right) */}
      <aside
        aria-label="Professional Ambience Settings"
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
              background: 'rgba(14, 11, 24, 0.95)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(131, 110, 249, 0.35)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 20px rgba(131, 110, 249, 0.15)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`sk-lamp ${isEnabled ? 'sk-lamp-green' : 'sk-lamp-dim'}`} />
                <span className="text-micro" style={{ letterSpacing: '0.08em', color: '#ffffff' }}>
                  AMBIENT ENGINE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className="sk-badge"
                style={{
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(131, 110, 249, 0.3)',
                  background: isEnabled ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: isEnabled ? '#00ff9d' : 'var(--ink-soft)'
                }}
              >
                {isEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Mode Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                PRESET STYLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(
                  [
                    { id: 'network', label: 'NETWORK' },
                    { id: 'glow', label: 'GLOW' },
                    { id: 'grid', label: 'NODES' }
                  ] as const
                ).map((m) => {
                  const isCurrent = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`sk-btn ${isCurrent ? 'sk-btn-primary' : ''}`}
                      style={{
                        padding: '6px 4px',
                        fontSize: '0.68rem',
                        fontWeight: isCurrent ? 700 : 500,
                        textAlign: 'center',
                        color: isCurrent ? '#ffffff' : 'var(--ink-soft)',
                        background: isCurrent ? 'rgba(131, 110, 249, 0.25)' : 'rgba(255,255,255,0.04)',
                        border: isCurrent ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambience Intensity */}
            <div style={{ marginBottom: '12px' }}>
              <label className="text-micro" style={{ display: 'block', marginBottom: '6px' }}>
                ILLUMINATION INTENSITY
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['subtle', 'balanced', 'elevated'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className="sk-btn"
                    style={{
                      flex: 1,
                      padding: '5px',
                      fontSize: '0.68rem',
                      background: intensity === lvl ? 'rgba(131, 110, 249, 0.2)' : 'transparent',
                      border: intensity === lvl ? '1px solid var(--signal-accent)' : '1px solid rgba(255,255,255,0.08)',
                      color: intensity === lvl ? '#00f0ff' : 'var(--ink-soft)'
                    }}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCursorGlow(!showCursorGlow)}
                className="sk-badge"
                style={{
                  padding: '6px 8px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  background: showCursorGlow ? 'rgba(131, 110, 249, 0.15)' : 'transparent',
                  border: '1px solid rgba(131, 110, 249, 0.2)',
                  color: showCursorGlow ? '#ffffff' : 'var(--ink-soft)'
                }}
              >
                <span>CURSOR SPOTLIGHT</span>
                <span style={{ color: showCursorGlow ? '#00f0ff' : 'var(--ink-soft)', fontWeight: 700 }}>
                  {showCursorGlow ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowNetworkMesh(!showNetworkMesh)}
                className="sk-badge"
                style={{
                  padding: '6px 8px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  background: showNetworkMesh ? 'rgba(131, 110, 249, 0.15)' : 'transparent',
                  border: '1px solid rgba(131, 110, 249, 0.2)',
                  color: showNetworkMesh ? '#ffffff' : 'var(--ink-soft)'
                }}
              >
                <span>CONSENSUS FILAMENTS</span>
                <span style={{ color: showNetworkMesh ? '#00ff9d' : 'var(--ink-soft)', fontWeight: 700 }}>
                  {showNetworkMesh ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Pill Trigger */}
        <button
          type="button"
          onClick={() => setIsTunerOpen(!isTunerOpen)}
          className="sk-btn card-hover"
          title="Toggle Professional Ambience Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '24px',
            background: 'rgba(14, 11, 24, 0.9)',
            backdropFilter: 'blur(20px)',
            color: '#f4f1e8',
            border: '1px solid rgba(131, 110, 249, 0.35)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 10px rgba(131, 110, 249, 0.15)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}
        >
          <span className={`sk-lamp ${isEnabled ? 'sk-lamp-green' : 'sk-lamp-dim'}`} />
          <Network size={13} color="#00f0ff" />
          <span>AMBIENCE: {isEnabled ? mode.toUpperCase() : 'MUTED'}</span>
          <Sliders size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: '2px' }} />
        </button>
      </aside>
    </>
  );
};

export default DynamicLiveWallpaper;
