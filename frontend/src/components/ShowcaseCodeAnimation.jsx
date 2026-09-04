import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Real GPU-Rendered Three.js Particle Background Component
 * - Organic, continuous floating drift physics for every particle (no static particles)
 * - Soft cinematic glowing & pulsing size/opacity cycle
 * - Zero change to colors, layout, browser mockup, headline text, or buttons
 */

const TOOL_THEMES = {
  image: {
    blob1: 'bg-orange-600/50 blur-[100px]',
    blob2: 'bg-pink-600/50 blur-[120px]',
    blob3: 'bg-purple-600/40 blur-[90px]',
  },
  summary: {
    blob1: 'bg-blue-600/50 blur-[100px]',
    blob2: 'bg-cyan-500/50 blur-[120px]',
    blob3: 'bg-indigo-600/40 blur-[90px]',
  },
  caption: {
    blob1: 'bg-emerald-600/50 blur-[100px]',
    blob2: 'bg-teal-500/50 blur-[120px]',
    blob3: 'bg-green-600/40 blur-[90px]',
  },
  prompt: {
    blob1: 'bg-purple-600/50 blur-[100px]',
    blob2: 'bg-violet-600/50 blur-[120px]',
    blob3: 'bg-fuchsia-600/40 blur-[90px]',
  },
};

// Create soft glow particle sprite texture via Canvas 2D
function createGlowParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function ShowcaseCodeAnimation({ toolId = 'image', isActive = true }) {
  const containerRef = useRef(null);
  const theme = TOOL_THEMES[toolId] || TOOL_THEMES.image;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Three.js Scene, Camera, & WebGL Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Glow Texture
    const particleTexture = createGlowParticleTexture();

    // 2. Particle Geometry Setup
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const framePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const burstPhases = new Float32Array(particleCount);

    // Color Palette Definitions (Pink/Orange/Purple glow for Image Gen)
    const colorOrange = new THREE.Color('#f97316');
    const colorPink = new THREE.Color('#ec4899');
    const colorPurple = new THREE.Color('#a855f7');
    const colorRose = new THREE.Color('#f43f5e');

    const colorBlue = new THREE.Color('#3b82f6');
    const colorCyan = new THREE.Color('#06b6d4');
    const colorEmerald = new THREE.Color('#10b981');
    const colorMint = new THREE.Color('#34d399');
    const colorViolet = new THREE.Color('#8b5cf6');
    const colorFuchsia = new THREE.Color('#d946ef');

    // Initialize Particle Coordinates
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      // Base random distribution across 3D viewport
      const rx = (Math.random() - 0.5) * 24;
      const ry = (Math.random() - 0.5) * 15;
      const rz = (Math.random() - 0.5) * 9;

      positions[idx] = rx;
      positions[idx + 1] = ry;
      positions[idx + 2] = rz;

      basePositions[idx] = rx;
      basePositions[idx + 1] = ry;
      basePositions[idx + 2] = rz;

      burstPhases[i] = Math.random() * Math.PI * 2;

      // Photo-Frame Silhouette Target Positions (First 500 particles for Image Gen)
      if (i < 500) {
        const side = i % 4;
        const progress = (Math.floor(i / 4) / 125) - 0.5;
        const frameW = 6.8;
        const frameH = 4.4;

        if (side === 0) {
          framePositions[idx] = progress * frameW * 2;
          framePositions[idx + 1] = frameH;
        } else if (side === 1) {
          framePositions[idx] = progress * frameW * 2;
          framePositions[idx + 1] = -frameH;
        } else if (side === 2) {
          framePositions[idx] = -frameW;
          framePositions[idx + 1] = progress * frameH * 2;
        } else {
          framePositions[idx] = frameW;
          framePositions[idx + 1] = progress * frameH * 2;
        }
        framePositions[idx + 2] = 0;
      } else {
        framePositions[idx] = rx;
        framePositions[idx + 1] = ry;
        framePositions[idx + 2] = rz;
      }

      // Initialize Palette Colors
      let col = new THREE.Color();
      if (toolId === 'image') {
        const rand = Math.random();
        col = rand < 0.35 ? colorOrange : (rand < 0.7 ? colorPink : (rand < 0.88 ? colorPurple : colorRose));
      } else if (toolId === 'summary') {
        col = Math.random() > 0.4 ? colorCyan : colorBlue;
      } else if (toolId === 'caption') {
        col = Math.random() > 0.4 ? colorEmerald : colorMint;
      } else if (toolId === 'prompt') {
        col = Math.random() > 0.3 ? colorViolet : (Math.random() > 0.5 ? colorPurple : colorFuchsia);
      }

      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Points Material with Additive Glow Blending
    const material = new THREE.PointsMaterial({
      size: toolId === 'image' ? 0.38 : 0.34,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesSystem = new THREE.Points(geometry, material);
    scene.add(particlesSystem);

    // 3. 60FPS Smooth Animation Loop (Continuous Drift + Soft Glow Pulse)
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const posAttr = geometry.attributes.position;
      const posArr = posAttr.array;
      const colAttr = geometry.attributes.color;
      const colArr = colAttr.array;

      // Global slow breathing glow pulse
      material.size = (toolId === 'image' ? 0.38 : 0.34) + Math.sin(elapsedTime * 1.2) * 0.04;
      material.opacity = 0.85 + Math.sin(elapsedTime * 0.8) * 0.12;

      // ── Tool 1: AI Image Generator ─────────────────────────────────────────
      if (toolId === 'image') {
        const frameCycle = (Math.sin(elapsedTime * 0.7) + 1) / 2;
        const convergeFactor = Math.pow(frameCycle, 2.5);

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;

          // Multi-frequency trigonometric continuous organic drift
          const floatX = Math.sin(elapsedTime * 0.5 + i * 0.1) * 0.4 + Math.cos(elapsedTime * 0.3 + i * 0.2) * 0.25;
          const floatY = Math.cos(elapsedTime * 0.4 + i * 0.15) * 0.4 + Math.sin(elapsedTime * 0.25 + i * 0.1) * 0.25;
          const floatZ = Math.sin(elapsedTime * 0.3 + i * 0.3) * 0.2;

          if (i < 500) {
            const targetX = THREE.MathUtils.lerp(basePositions[idx], framePositions[idx], convergeFactor);
            const targetY = THREE.MathUtils.lerp(basePositions[idx + 1], framePositions[idx + 1], convergeFactor);
            const targetZ = THREE.MathUtils.lerp(basePositions[idx + 2], framePositions[idx + 2], convergeFactor);

            posArr[idx] = targetX + floatX;
            posArr[idx + 1] = targetY + floatY;
            posArr[idx + 2] = targetZ + floatZ;
          } else {
            posArr[idx] = basePositions[idx] + floatX;
            posArr[idx + 1] = basePositions[idx + 1] + floatY;
            posArr[idx + 2] = basePositions[idx + 2] + floatZ;
          }
        }
      }

      // ── Tool 2: Document Summarizer ────────────────────────────────────────
      else if (toolId === 'summary') {
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const floatY = Math.sin(elapsedTime * 0.4 + i) * 0.15;

          posArr[idx] += 0.08 + (i % 3) * 0.02;
          if (posArr[idx] > 12) {
            posArr[idx] = -12;
            posArr[idx + 1] = basePositions[idx + 1];
          }

          const distFromCenter = Math.abs(posArr[idx]);
          const compression = Math.max(0, 1 - distFromCenter / 7);
          const targetYLine = ((i % 3) - 1) * 2;
          posArr[idx + 1] = THREE.MathUtils.lerp(basePositions[idx + 1], targetYLine, compression * 0.85) + floatY;
        }
      }

      // ── Tool 3: Social Caption Generator ──────────────────────────────────
      else if (toolId === 'caption') {
        const numBursts = 10;
        const particlesPerBurst = Math.floor(particleCount / numBursts);

        for (let b = 0; b < numBursts; b++) {
          const burstTime = (elapsedTime * 1.2 + b * 0.7) % (Math.PI * 2);
          const radius = Math.sin(burstTime * 0.5) * 3.5;
          const burstX = (b % 4 - 1.5) * 5;
          const burstY = (Math.floor(b / 4) - 1) * 4;

          for (let p = 0; p < particlesPerBurst; p++) {
            const i = b * particlesPerBurst + p;
            const idx = i * 3;
            const angle = (p / particlesPerBurst) * Math.PI * 2;

            posArr[idx] = burstX + Math.cos(angle) * radius;
            posArr[idx + 1] = burstY + Math.sin(angle) * radius + (burstTime * 0.3);
            posArr[idx + 2] = Math.sin(angle * 2) * 0.5;

            const opacity = Math.max(0, 1 - (burstTime / (Math.PI * 2)));
            colArr[idx] = colorEmerald.r * opacity;
            colArr[idx + 1] = (colorEmerald.g + 0.3) * opacity;
            colArr[idx + 2] = colorMint.b * opacity;
          }
        }
        colAttr.needsUpdate = true;
      }

      // ── Tool 4: AI Prompt Enhancer ─────────────────────────────────────────
      else if (toolId === 'prompt') {
        const pulseCycle = (Math.sin(elapsedTime * 0.9) + 1) / 2;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const floatX = Math.sin(elapsedTime * 0.4 + i) * 0.2;
          const floatY = Math.cos(elapsedTime * 0.3 + i) * 0.2;

          const dirX = basePositions[idx];
          const dirY = basePositions[idx + 1];
          const dirZ = basePositions[idx + 2];

          posArr[idx] = dirX * (0.3 + pulseCycle * 0.8) + floatX;
          posArr[idx + 1] = dirY * (0.3 + pulseCycle * 0.8) + floatY;
          posArr[idx + 2] = dirZ * (0.3 + pulseCycle * 0.8);

          colArr[idx] = colorViolet.r + pulseCycle * 0.3;
          colArr[idx + 1] = colorViolet.g + pulseCycle * 0.2;
          colArr[idx + 2] = colorFuchsia.b;
        }
        colAttr.needsUpdate = true;
      }

      posAttr.needsUpdate = true;
      particlesSystem.rotation.y = elapsedTime * 0.025;
      particlesSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 4. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [toolId, isActive]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* High-Visibility Ambient Glow Mesh Orbs */}
      <div className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full ${theme.blob1} animate-pulse duration-1000 scale-125 pointer-events-none`} />
      <div className={`absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full ${theme.blob2} animate-pulse duration-700 delay-300 scale-125 pointer-events-none`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${theme.blob3} opacity-60 animate-spin-slow pointer-events-none`} />

      {/* GPU Three.js WebGL Particle Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
