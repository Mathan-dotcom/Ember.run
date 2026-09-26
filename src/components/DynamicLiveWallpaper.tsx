import React, { useEffect, useRef, useState } from 'react';
import { Sliders, Network } from 'lucide-react';

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

  const [mode, setMode] = useState<AmbienceMode>('network');
  const [intensity, setIntensity] = useState<'subtle' | 'balanced' | 'elevated'>('balanced');
  const [showCursorGlow, setShowCursorGlow] = useState<boolean>(true);
  const [showNetworkMesh, setShowNetworkMesh] = useState<boolean>(true);
  const [showVideoBackdrop, setShowVideoBackdrop] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  // Auto-play video on mount and resume if paused
  useEffect(() => {
    if (showVideoBackdrop && isEnabled && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy handled silently
      });
    }
  }, [showVideoBackdrop, isEnabled]);

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
      const base = width < 768 ? 30 : width < 1200 ? 46 : 64;
      if (intensity === 'subtle') return Math.floor(base * 0.6);
      if (intensity === 'elevated') return Math.floor(base * 1.3);
      return base;
    };

    // Initialize ambient light orbs aligned with the stars space video palette
    orbsRef.current = [
      {
        x: width * 0.25,
        y: height * 0.2,
        vx: 0.1,
        vy: 0.07,
        radius: Math.min(width, height) * 0.45,
        color: 'rgba(255, 255, 255, 0.04)'
      },
      {
        x: width * 0.75,
        y: height * 0.65,
        vx: -0.09,
        vy: -0.06,
        radius: Math.min(width, height) * 0.4,
        color: 'rgba(255, 255, 255, 0.03)'
      },
      {
        x: width * 0.5,
        y: height * 0.85,
        vx: 0.07,
        vy: -0.1,
        radius: Math.min(width, height) * 0.35,
        color: 'rgba(240, 240, 240, 0.035)'
      }
    ];

    // Initialize cosmic starlight network nodes
    const count = getNodeCount();
    nodesRef.current = Array.from({ length: count }, () => {
      const speed = 0.2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 1.1 + 0.9,
        baseAlpha: Math.random() * 0.3 + 0.15,
        alpha: 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.006
      };
    });

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor lerp physics (delicate white spotlight)
      const mouse = mouseRef.current;
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      // -----------------------------------------------------------------
      // Layer 1: Minimalist Ambient Floating White Light Orbs
      // -----------------------------------------------------------------
      if (mode === 'network' || mode === 'glow') {
        const alphaFactor = intensity === 'subtle' ? 0.6 : intensity === 'elevated' ? 1.4 : 1.0;

        for (const orb of orbsRef.current) {
          orb.x += orb.vx;
          orb.y += orb.vy;

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
      // Layer 2: Subtle Starlight Cyan Cursor Spotlight
      // -----------------------------------------------------------------
      if (showCursorGlow && mouse.active && mouse.x > 0) {
        const spotRadius = width < 768 ? 200 : 340;
        const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, spotRadius);
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // -----------------------------------------------------------------
      // Layer 3: Celestial Starlight Technical Network Mesh
      // -----------------------------------------------------------------
      if (mode === 'network' || mode === 'grid') {
        const nodes = nodesRef.current;
        const maxDist = width < 768 ? 85 : 125;
        const alphaScale = intensity === 'subtle' ? 0.6 : intensity === 'elevated' ? 1.25 : 0.85;

        // Draw clean hairline filaments in celestial starlight cyan
        if (showNetworkMesh && mode === 'network') {
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const dist = Math.hypot(dx, dy);

              if (dist < maxDist) {
                const lineAlpha = (1 - dist / maxDist) * 0.18 * alphaScale;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = '#ffffff';
                ctx.globalAlpha = lineAlpha;
                ctx.lineWidth = 0.75;
                ctx.stroke();
              }
            }
          }
        }

        // Draw and update each individual node point in starlight silver
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];

          n.x += n.vx;
          n.y += n.vy;

          if (n.x < -10) n.x = width + 10;
          if (n.x > width + 10) n.x = -10;
          if (n.y < -10) n.y = height + 10;
          if (n.y > height + 10) n.y = -10;

          n.pulsePhase += n.pulseSpeed;
          n.alpha = (n.baseAlpha + Math.sin(n.pulsePhase) * 0.12) * alphaScale;

          // Render node point (starlight diamond core)
          ctx.save();
          ctx.globalAlpha = Math.max(0.1, n.alpha);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();

          // Radiant starlight cyan pin-point aura
          ctx.globalAlpha = n.alpha * 0.4;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Mouse Tracking with smooth lerp target
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isEnabled, mode, intensity, showCursorGlow, showNetworkMesh]);

  const videoOpacityValue = !isEnabled || !showVideoBackdrop
    ? 0
    : intensity === 'subtle'
    ? 0.45
    : intensity === 'balanced'
    ? 0.70
    : 0.90;

  return (
    <>
      {/* Looped Background Video Layer (True Ember Video Palette) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          overflow: 'hidden',
          pointerEvents: 'none',
          backgroundColor: '#030712'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: videoOpacityValue,
            filter: 'contrast(120%) brightness(0.95)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <source src="/videos/stars-bg.mp4" type="video/mp4" />
          <source src="/videos/ember-bg.webm" type="video/webm" />
        </video>

        {/* Ambient Dark Scrim / Vignette to ensure maximum content readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(3, 7, 18, 0.25) 0%, rgba(3, 7, 18, 0.65) 75%, #030712 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Background HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          opacity: isEnabled ? 1 : 0,
          transition: 'opacity 0.6s ease'
        }}
      />

      {/* Subtle Micro-Noise Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #ffffff 0.5px, transparent 0.5px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Floating Minimalist Ambience Controller (Bottom Right) */}
      <aside
        aria-label="Wallpaper controls"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 40,
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
              background: 'rgba(7, 14, 28, 0.96)',
              backdropFilter: 'blur(16px)',
              borderRadius: '0px',
              border: '2px solid #ffffff',
              boxShadow: '6px 6px 0px #ffffff',
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
                  border: '1px solid rgba(255, 255, 255, )',
                  background: isEnabled ? '#ffffff' : 'transparent',
                  color: isEnabled ? '#030712' : 'var(--ink-soft)',
                  fontWeight: 700
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
                      className={`sk-button ${isCurrent ? 'sk-button-primary' : ''}`}
                      style={{
                        padding: '6px 4px',
                        fontSize: '0.68rem',
                        fontWeight: isCurrent ? 700 : 500,
                        textAlign: 'center',
                        color: isCurrent ? '#030712' : 'var(--ink-hard)',
                        background: isCurrent ? '#ffffff' : '#070e1b',
                        border: isCurrent ? '1px solid #f8fafc' : '1px solid rgba(255, 255, 255, )'
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
                {(['subtle', 'balanced', 'elevated'] as const).map((lvl) => {
                  const isCurrent = intensity === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`sk-button ${isCurrent ? 'sk-button-primary' : ''}`}
                      style={{
                        flex: 1,
                        padding: '5px',
                        fontSize: '0.68rem',
                        background: isCurrent ? '#ffffff' : 'transparent',
                        border: isCurrent ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                        color: isCurrent ? '#000000' : 'var(--ink-soft)'
                      }}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  );
                })}
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
                  background: showCursorGlow ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: showCursorGlow ? '#ffffff' : 'var(--ink-soft)'
                }}
              >
                <span>CURSOR SPOTLIGHT</span>
                <span style={{ color: showCursorGlow ? '#ffffff' : 'var(--ink-muted)', fontWeight: 700 }}>
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
                  background: showNetworkMesh ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: showNetworkMesh ? '#ffffff' : 'var(--ink-soft)'
                }}
              >
                <span>CONSENSUS FILAMENTS</span>
                <span style={{ color: showNetworkMesh ? '#ffffff' : 'var(--ink-muted)', fontWeight: 700 }}>
                  {showNetworkMesh ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowVideoBackdrop(!showVideoBackdrop)}
                className="sk-badge"
                style={{
                  padding: '6px 8px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  background: showVideoBackdrop ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: showVideoBackdrop ? '#ffffff' : 'var(--ink-soft)'
                }}
              >
                <span>VIDEO AMBIENCE LOOP</span>
                <span style={{ color: showVideoBackdrop ? '#ffffff' : 'var(--ink-muted)', fontWeight: 700 }}>
                  {showVideoBackdrop ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Cosmic Starlight Pill Trigger */}
        <button
          type="button"
          onClick={() => setIsTunerOpen(!isTunerOpen)}
          className="sk-button card-hover"
          title="Toggle Ambient Engine Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '0px',
            background: '#070e1b',
            color: '#f8fafc',
            border: '1.5px solid #ffffff',
            boxShadow: '3px 3px 0px #ffffff',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700
          }}
        >
          <span className={`sk-lamp ${isEnabled ? 'sk-lamp-green' : 'sk-lamp-dim'}`} />
          <Network size={13} color="#ffffff" />
          <span>AMBIENCE: {isEnabled ? mode.toUpperCase() : 'MUTED'}</span>
          <Sliders size={12} color="#ffffff" style={{ marginLeft: '2px' }} />
        </button>
      </aside>
    </>
  );
};

export default DynamicLiveWallpaper;
