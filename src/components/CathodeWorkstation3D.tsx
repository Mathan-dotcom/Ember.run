import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CathodeWorkstation3DProps {
  onInteract?: () => void;
  variant?: 'session' | 'wireframe';
}

export const CathodeWorkstation3D: React.FC<CathodeWorkstation3DProps> = ({
  onInteract,
  variant = 'session'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState<number>(60);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    // 1. Scene & Camera (Isometric Orthographic style perspective)
    const scene = new THREE.Scene();
    scene.background = null; // transparent to show cosmic background

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Isometric angle: elevated, angled from front-right
    camera.position.set(4.2, 3.8, 5.2);
    camera.lookAt(0, 0.4, 0);

    // 2. WebGL Renderer with High-DPI and Performance Optimization
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Materials System (Cathode Dark Slate + Wireframe Edges + Cyan Phosphor Glow)
    const chassisColor = new THREE.Color('#0c1017');
    const accentLineColor = new THREE.Color('#38bdf8');
    const faintLineColor = new THREE.Color('#1e293b');
    const keyCapDark = new THREE.Color('#131a26');
    const keyCapActive = new THREE.Color('#7dd3fc');

    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: chassisColor,
      roughness: 0.65,
      metalness: 0.25
    });

    const screenBezelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#080c12'),
      roughness: 0.8,
      metalness: 0.1
    });

    // Dynamic 2D Canvas for CRT Screen Terminal Display
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 384;
    const ctx = screenCanvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false
    });

    // 4. Build Workstation Group
    const workstation = new THREE.Group();
    scene.add(workstation);

    // A. Base Desk / Plinth (Subtle wireframe edge pedestal)
    const plinthGeo = new THREE.BoxGeometry(4.8, 0.12, 3.8);
    const plinth = new THREE.Mesh(plinthGeo, chassisMaterial);
    plinth.position.set(0, -0.06, 0);
    plinth.receiveShadow = true;
    workstation.add(plinth);

    const plinthEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(plinthGeo),
      new THREE.LineBasicMaterial({ color: faintLineColor, linewidth: 1 })
    );
    plinth.add(plinthEdges);

    // B. CRT Monitor Housing (Curved retro cube)
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.35, 1.2, -0.4);
    workstation.add(monitorGroup);

    // Main CRT Chassis
    const monitorGeo = new THREE.BoxGeometry(2.0, 1.6, 1.4);
    const monitorMesh = new THREE.Mesh(monitorGeo, chassisMaterial);
    monitorMesh.castShadow = true;
    monitorMesh.receiveShadow = true;
    monitorGroup.add(monitorMesh);

    const monitorEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(monitorGeo),
      new THREE.LineBasicMaterial({ color: accentLineColor, linewidth: 1.5 })
    );
    monitorMesh.add(monitorEdges);

    // Tapered back of CRT monitor
    const crtBackGeo = new THREE.BoxGeometry(1.4, 1.1, 0.9);
    const crtBack = new THREE.Mesh(crtBackGeo, chassisMaterial);
    crtBack.position.set(0, 0, -0.9);
    monitorGroup.add(crtBack);

    const crtBackEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(crtBackGeo),
      new THREE.LineBasicMaterial({ color: faintLineColor })
    );
    crtBack.add(crtBackEdges);

    // Monitor Front Bezel
    const bezelGeo = new THREE.BoxGeometry(1.82, 1.42, 0.1);
    const bezel = new THREE.Mesh(bezelGeo, screenBezelMaterial);
    bezel.position.set(0, 0.04, 0.72);
    monitorGroup.add(bezel);

    // CRT Screen Glass (Curved surface facing user)
    const screenGeo = new THREE.PlaneGeometry(1.6, 1.2, 16, 12);
    // Slight spherical bulge on the CRT glass
    const posAttr = screenGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const distFromCenter = Math.sqrt(x * x + y * y);
      posAttr.setZ(i, Math.max(0, 0.08 - distFromCenter * 0.06));
    }
    screenGeo.computeVertexNormals();

    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, 0.05, 0.78);
    monitorGroup.add(screenMesh);

    // Monitor Stand / Neck & Base
    const standNeckGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.4, 16);
    const standNeck = new THREE.Mesh(standNeckGeo, chassisMaterial);
    standNeck.position.set(0, -0.9, 0);
    monitorGroup.add(standNeck);

    const standBaseGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.08, 24);
    const standBase = new THREE.Mesh(standBaseGeo, chassisMaterial);
    standBase.position.set(0, -1.08, 0);
    monitorGroup.add(standBase);

    const standBaseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(standBaseGeo),
      new THREE.LineBasicMaterial({ color: faintLineColor })
    );
    standBase.add(standBaseEdges);

    // Floppy drive slot on monitor chin
    const slotGeo = new THREE.BoxGeometry(0.5, 0.03, 0.02);
    const slot = new THREE.Mesh(
      slotGeo,
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#38bdf8') })
    );
    slot.position.set(0.45, -0.62, 0.78);
    monitorGroup.add(slot);

    // C. CPU Monolith Tower Unit (Standing beside the CRT)
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(-1.85, 0.95, -0.3);
    workstation.add(cpuGroup);

    const cpuGeo = new THREE.BoxGeometry(0.7, 1.9, 1.8);
    const cpuMesh = new THREE.Mesh(cpuGeo, chassisMaterial);
    cpuMesh.castShadow = true;
    cpuGroup.add(cpuMesh);

    const cpuEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cpuGeo),
      new THREE.LineBasicMaterial({ color: faintLineColor })
    );
    cpuMesh.add(cpuEdges);

    // Drive bays & Status LEDs on CPU
    for (let i = 0; i < 3; i++) {
      const bayGeo = new THREE.BoxGeometry(0.55, 0.12, 0.02);
      const bay = new THREE.Mesh(bayGeo, screenBezelMaterial);
      bay.position.set(0, 0.6 - i * 0.22, 0.91);
      cpuGroup.add(bay);
    }

    const ledGeo = new THREE.BoxGeometry(0.04, 0.04, 0.02);
    const ledMat1 = new THREE.MeshBasicMaterial({ color: new THREE.Color('#38bdf8') });
    const ledMat2 = new THREE.MeshBasicMaterial({ color: new THREE.Color('#34d399') });
    const led1 = new THREE.Mesh(ledGeo, ledMat1);
    led1.position.set(-0.2, 0.82, 0.91);
    const led2 = new THREE.Mesh(ledGeo, ledMat2);
    led2.position.set(-0.1, 0.82, 0.91);
    cpuGroup.add(led1);
    cpuGroup.add(led2);

    // D. Retro Isometric Mechanical Keyboard with Individually Illuminated Keycaps
    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(0.3, 0.14, 0.95);
    keyboardGroup.rotation.y = -Math.PI * 0.08; // slightly angled
    keyboardGroup.rotation.x = Math.PI * 0.04; // slight ergonomic incline
    workstation.add(keyboardGroup);

    const kbBodyGeo = new THREE.BoxGeometry(2.3, 0.16, 0.95);
    const kbBody = new THREE.Mesh(kbBodyGeo, chassisMaterial);
    kbBody.castShadow = true;
    keyboardGroup.add(kbBody);

    const kbEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(kbBodyGeo),
      new THREE.LineBasicMaterial({ color: accentLineColor, linewidth: 1.2 })
    );
    kbBody.add(kbEdges);

    // Keycaps Grid Matrix (5 rows x 14 columns = ~70 interactive keycaps)
    const keyRows = 5;
    const keyCols = 13;
    const keycapMeshes: {
      mesh: THREE.Mesh;
      origY: number;
      row: number;
      col: number;
      mat: THREE.MeshStandardMaterial;
    }[] = [];

    const keyGeo = new THREE.BoxGeometry(0.12, 0.07, 0.12);

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const keyMat = new THREE.MeshStandardMaterial({
          color: keyCapDark,
          roughness: 0.4,
          metalness: 0.3,
          emissive: new THREE.Color('#000000'),
          emissiveIntensity: 0
        });

        const keyMesh = new THREE.Mesh(keyGeo, keyMat);
        const kx = (c - keyCols / 2 + 0.5) * 0.16;
        const kz = (r - keyRows / 2 + 0.5) * 0.15;
        const ky = 0.12;

        keyMesh.position.set(kx, ky, kz);
        keyboardGroup.add(keyMesh);

        keycapMeshes.push({
          mesh: keyMesh,
          origY: ky,
          row: r,
          col: c,
          mat: keyMat
        });
      }
    }

    // E. Retro Ergonomic Mouse with Glowing Cord
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(1.75, 0.12, 1.05);
    workstation.add(mouseGroup);

    const mouseGeo = new THREE.BoxGeometry(0.38, 0.12, 0.6);
    const mouseMesh = new THREE.Mesh(mouseGeo, chassisMaterial);
    mouseMesh.castShadow = true;
    mouseGroup.add(mouseMesh);

    const mouseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mouseGeo),
      new THREE.LineBasicMaterial({ color: accentLineColor })
    );
    mouseMesh.add(mouseEdges);

    // Mouse Button Split
    const mSplitGeo = new THREE.BoxGeometry(0.015, 0.02, 0.28);
    const mSplit = new THREE.Mesh(mSplitGeo, new THREE.MeshBasicMaterial({ color: accentLineColor }));
    mSplit.position.set(0, 0.065, -0.15);
    mouseGroup.add(mSplit);

    // Mouse Cable (Curved line to keyboard/CPU)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.75, 0.08, 0.75),
      new THREE.Vector3(1.5, 0.06, 0.4),
      new THREE.Vector3(1.1, 0.06, 0.1),
      new THREE.Vector3(0.4, 0.06, -0.3)
    ]);
    const cableGeo = new THREE.TubeGeometry(curve, 32, 0.015, 8, false);
    const cableMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#38bdf8') });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    workstation.add(cable);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0c121e, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.8);
    keyLight.position.set(6, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x2563eb, 3.0, 10);
    bottomGlow.position.set(0, -0.5, 2);
    scene.add(bottomGlow);

    // CRT Screen Glow Light (casts phosphor cyan onto keyboard)
    const crtScreenLight = new THREE.PointLight(0x38bdf8, 2.5, 4.5);
    crtScreenLight.position.set(-0.35, 1.25, 0.5);
    scene.add(crtScreenLight);

    // 6. Interactive Mouse Parallax Tracking
    const mousePos = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.x = nx;
      mousePos.y = ny;
      targetRotation.y = nx * 0.28; // tilt around Y axis
      targetRotation.x = ny * 0.16; // tilt around X axis
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', () => setIsHovered(true));
    container.addEventListener('mouseleave', () => {
      setIsHovered(false);
      targetRotation.x = 0;
      targetRotation.y = 0;
    });

    // 7. 60 FPS Render & Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let terminalScrollOffset = 0;

    const terminalLines = [
      'SYSTEM // EMBER.RUN v1.0.4',
      'KERNEL: MONAD PARALLEL EVM (10,000 TPS)',
      'STATUS: CONSENSUS MONAD BFT // ACTIVE',
      'EPOCH #41454 // BLOCK TIME: 1.00s',
      '──────────────────────────────',
      'SIGNAL RADAR: 6 ACTIVE EMBERS',
      'DECAY HALF-LIFE: 6.00 HOURS',
      'ATOMIC SPLITS: 40% / 45% / 15%',
      'WEBAUTHN FIDO2 PRF: READY',
      'SUBSCRIBER YIELD: +4.25 MON'
    ];

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // FPS Counter calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Smooth Workstation Parallax Tilt (Damping / Lerp)
      workstation.rotation.y += (targetRotation.y - workstation.rotation.y) * 0.06;
      workstation.rotation.x += (targetRotation.x - workstation.rotation.x) * 0.06;

      // Subtle Idle Floating Breathing Motion
      const breathing = Math.sin(time * 1.5) * 0.035;
      workstation.position.y = breathing;

      // Subtle Monitor Ambient Head Tilt
      monitorGroup.rotation.y = Math.sin(time * 0.8) * 0.025;

      // ── Animate Keyboard Keycaps Illumination Wave (as seen in Cathode Session video) ──
      keycapMeshes.forEach((k) => {
        // Wave equation radiating diagonally across key matrix
        const wave = Math.sin(time * 3.8 - (k.col * 0.45 + k.row * 0.65));
        const isActive = wave > 0.55;

        if (isActive) {
          const intensity = (wave - 0.55) / 0.45;
          k.mat.emissive.copy(keyCapActive);
          k.mat.emissiveIntensity = intensity * 1.6;
          k.mesh.position.y = k.origY + intensity * 0.02;
        } else {
          k.mat.emissive.copy(chassisColor);
          k.mat.emissiveIntensity = 0;
          k.mesh.position.y = k.origY;
        }
      });

      // ── Animate CRT Screen Canvas (Scanlines + Blinking Cursor + Rolling Text) ──
      if (ctx) {
        ctx.fillStyle = '#050a12';
        ctx.fillRect(0, 0, 512, 384);

        // Subtle Phosphor Green / Starlight Cyan Glow Vignette
        const gradient = ctx.createRadialGradient(256, 192, 40, 256, 192, 280);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 384);

        // Scanlines overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        for (let y = 0; y < 384; y += 4) {
          ctx.fillRect(0, y, 512, 2);
        }

        // Animated Scanline Sweep Bar
        const scanY = (time * 120) % 400;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(0, scanY, 512, 20);

        // Terminal Header HUD
        ctx.font = 'bold 15px "Courier New", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('⚡ CATHODE SESSION // EMBER.RUN', 28, 42);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(28, 54);
        ctx.lineTo(484, 54);
        ctx.stroke();

        // Terminal Log Lines with Rolling Ticker
        ctx.font = '13px "Courier New", monospace';
        terminalLines.forEach((line, idx) => {
          const lineY = 82 + idx * 24;
          if (line.includes('MONAD') || line.includes('STATUS')) {
            ctx.fillStyle = '#34d399'; // Emerald active
          } else if (line.includes('ATOMIC') || line.includes('DECAY')) {
            ctx.fillStyle = '#7dd3fc'; // Electric cyan
          } else {
            ctx.fillStyle = '#cbd5e1'; // Starlight slate
          }
          ctx.fillText(`> ${line}`, 28, lineY);
        });

        // Blinking Phosphor Cursor
        const cursorBlink = Math.floor(time * 3) % 2 === 0;
        if (cursorBlink) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(28, 82 + terminalLines.length * 24 - 10, 10, 14);
        }

        screenTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    render();

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 640;
      const newHeight = container.clientHeight || 480;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      onClick={onInteract}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      {/* 60 FPS Telemetry Badge in bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: '#7dd3fc',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: fps >= 55 ? '#34d399' : '#f59e0b',
            boxShadow: `0 0 8px ${fps >= 55 ? '#34d399' : '#f59e0b'}`
          }}
        />
        <span>60 FPS MOTION ENGINE // CATHODE 3D</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
        <span style={{ color: '#ffffff', fontWeight: 700 }}>{fps} FPS</span>
      </div>

      {/* Interactive Drag Hint */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)',
          background: 'rgba(5, 10, 20, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          zIndex: 10,
          transition: 'color 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        <span>PARALLAX: 3D PARALLEL SESSION</span>
      </div>
    </div>
  );
};
