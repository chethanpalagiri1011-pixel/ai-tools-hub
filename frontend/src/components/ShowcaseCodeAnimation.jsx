import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Real GPU-Rendered Three.js Particle Background Component
 * 1. AI Image Generator: Orange & Pink particle swarm converging into a photo-frame silhouette
 * 2. Document Summarizer: Blue-toned particle streams flowing horizontally and compressing
 * 3. Social Caption Generator: Green-toned particle pops/bursts
 * 4. AI Prompt Enhancer: Purple/violet particle swarm brightening & expanding outward
 */

const TOOL_THEMES = {
  image: {
    blob1: 'bg-orange-600/50 blur-[100px]',
    blob2: 'bg-pink-600/50 blur-[120px]',
    blob3: 'bg-amber-600/40 blur-[90px]',
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

// Create soft glow particle texture via Canvas 2D
function createGlowParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
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
    const velocities = new Float32Array(particleCount * 3);
    const burstPhases = new Float32Array(particleCount);

    // Color definitions
    const colorOrange = new THREE.Color('#f97316');
    const colorPink = new THREE.Color('#ec4899');
    const colorBlue = new THREE.Color('#3b82f6');
    const colorCyan = new THREE.Color('#06b6d4');
    const colorEmerald = new THREE.Color('#10b981');
    const colorMint = new THREE.Color('#34d399');
    const colorViolet = new THREE.Color('#8b5cf6');
    const colorPurple = new THREE.Color('#a855f7');
    const colorFuchsia = new THREE.Color('#d946ef');

    // Initialize positions and velocities
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      // Base random positions
      const rx = (Math.random() - 0.5) * 22;
      const ry = (Math.random() - 0.5) * 14;
      const rz = (Math.random() - 0.5) * 8;

      positions[idx] = rx;
      positions[idx + 1] = ry;
      positions[idx + 2] = rz;

      basePositions[idx] = rx;
      basePositions[idx + 1] = ry;
      basePositions[idx + 2] = rz;

      velocities[idx] = (Math.random() - 0.5) * 0.02;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.02;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.02;

      burstPhases[i] = Math.random() * Math.PI * 2;

      // ── Tool 1: Photo-Frame Silhouette Positions (First 500 particles form frame) ──
      if (i < 500) {
        const side = i % 4;
        const progress = (Math.floor(i / 4) / 125) - 0.5; // -0.5 to 0.5
        const frameW = 6.5;
        const frameH = 4.2;

        if (side === 0) {
          // Top edge
          framePositions[idx] = progress * frameW * 2;
          framePositions[idx + 1] = frameH;
        } else if (side === 1) {
          // Bottom edge
          framePositions[idx] = progress * frameW * 2;
          framePositions[idx + 1] = -frameH;
        } else if (side === 2) {
          // Left edge
          framePositions[idx] = -frameW;
          framePositions[idx + 1] = progress * frameH * 2;
        } else {
          // Right edge
          framePositions[idx] = frameW;
          framePositions[idx + 1] = progress * frameH * 2;
        }
        framePositions[idx + 2] = 0;
      } else {
        framePositions[idx] = rx;
        framePositions[idx + 1] = ry;
        framePositions[idx + 2] = rz;
      }

      // Initialize Colors based on toolId
      let col = new THREE.Color();
      if (toolId === 'image') {
        col = Math.random() > 0.4 ? colorOrange : colorPink;
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

    // Particle Shader / Points Material with Soft Glow Bloom
    const material = new THREE.PointsMaterial({
      size: toolId === 'image' ? 0.35 : 0.32,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesSystem = new THREE.Points(geometry, material);
    scene.add(particlesSystem);

    // 3. Animation Loop & Real-Time GPU Physics
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const posAttr = geometry.attributes.position;
      const posArr = posAttr.array;
      const colAttr = geometry.attributes.color;
      const colArr = colAttr.array;

      // ── Tool 1: AI Image Generator ─────────────────────────────────────────
      // Orange & Pink swarm converging into a photo-frame silhouette before dispersing
      if (toolId === 'image') {
        // Frame convergence cycle (oscillates between 0 disperse & 1 frame assemble)
        const frameCycle = (Math.sin(elapsedTime * 0.9) + 1) / 2; // 0 to 1
        const convergeFactor = Math.pow(frameCycle, 3); // Smooth ease-in curve

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;

          if (i < 500) {
            // Lerp between base random position and photo-frame silhouette
            const targetX = THREE.MathUtils.lerp(basePositions[idx], framePositions[idx], convergeFactor);
            const targetY = THREE.MathUtils.lerp(basePositions[idx + 1], framePositions[idx + 1], convergeFactor);
            const targetZ = THREE.MathUtils.lerp(basePositions[idx + 2], framePositions[idx + 2], convergeFactor);

            posArr[idx] += (targetX - posArr[idx]) * 0.08;
            posArr[idx + 1] += (targetY - posArr[idx + 1]) * 0.08;
            posArr[idx + 2] += (targetZ - posArr[idx + 2]) * 0.08;
          } else {
            // Swarm particles float gently with noise
            posArr[idx] += Math.sin(elapsedTime + i) * 0.01;
            posArr[idx + 1] += Math.cos(elapsedTime + i * 0.5) * 0.01;
          }
        }
      }

      // ── Tool 2: Document Summarizer ────────────────────────────────────────
      // Blue-toned streams flowing horizontally & compressing into bullet points
      else if (toolId === 'summary') {
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;

          // Flow rightwards
          posArr[idx] += 0.08 + (i % 3) * 0.02;
          if (posArr[idx] > 12) {
            posArr[idx] = -12;
            posArr[idx + 1] = basePositions[idx + 1];
          }

          // Compress towards 3 horizontal keypoint lines as x approaches center (x between -6 and +6)
          const distFromCenter = Math.abs(posArr[idx]);
          const compression = Math.max(0, 1 - distFromCenter / 7);

          // Assign to 1 of 3 target Y lines: -2, 0, +2
          const targetYLine = ((i % 3) - 1) * 2;
          posArr[idx + 1] = THREE.MathUtils.lerp(basePositions[idx + 1], targetYLine, compression * 0.85);
        }
      }

      // ── Tool 3: Social Caption Generator ──────────────────────────────────
      // Green-toned particles forming small pops & bursts
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

            // Brighten green tint on burst pop
            const opacity = Math.max(0, 1 - (burstTime / (Math.PI * 2)));
            colArr[idx] = colorEmerald.r * opacity;
            colArr[idx + 1] = (colorEmerald.g + 0.3) * opacity;
            colArr[idx + 2] = colorMint.b * opacity;
          }
        }
        colAttr.needsUpdate = true;
      }

      // ── Tool 4: AI Prompt Enhancer ─────────────────────────────────────────
      // Purple/violet particle swarm gradually brightening & expanding outward
      else if (toolId === 'prompt') {
        const pulseCycle = (Math.sin(elapsedTime * 0.9) + 1) / 2; // 0 to 1 expansion cycle
        const expansionRadius = 1 + pulseCycle * 4.5;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const dirX = basePositions[idx];
          const dirY = basePositions[idx + 1];
          const dirZ = basePositions[idx + 2];

          // Expand outward from origin
          posArr[idx] = dirX * (0.3 + pulseCycle * 0.8);
          posArr[idx + 1] = dirY * (0.3 + pulseCycle * 0.8);
          posArr[idx + 2] = dirZ * (0.3 + pulseCycle * 0.8);

          // Brighten color as expansion grows
          colArr[idx] = colorViolet.r + pulseCycle * 0.3;
          colArr[idx + 1] = colorViolet.g + pulseCycle * 0.2;
          colArr[idx + 2] = colorFuchsia.b;
        }
        colAttr.needsUpdate = true;
      }

      posAttr.needsUpdate = true;
      particlesSystem.rotation.y = elapsedTime * 0.05;
      particlesSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 4. Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount or inactive
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
