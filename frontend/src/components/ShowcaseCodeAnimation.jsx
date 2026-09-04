import { useEffect, useRef } from 'react';

/**
 * High-Visibility 100% Code-Based Procedural Animated Background Renderer
 * - Vibrant floating gradient mesh orbs + high-density 60fps canvas particles
 * - Zero external assets or video files
 * - Visually striking, high contrast, and smooth
 */

const TOOL_THEMES = {
  image: {
    blob1: 'bg-purple-600/50 blur-[120px]',
    blob2: 'bg-pink-600/40 blur-[140px]',
    blob3: 'bg-indigo-600/40 blur-[100px]',
    particleColor1: 'rgba(168, 85, 247, ',
    particleColor2: 'rgba(236, 72, 153, ',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  summary: {
    blob1: 'bg-blue-600/50 blur-[120px]',
    blob2: 'bg-cyan-500/40 blur-[140px]',
    blob3: 'bg-indigo-600/40 blur-[100px]',
    particleColor1: 'rgba(59, 130, 246, ',
    particleColor2: 'rgba(6, 182, 212, ',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  caption: {
    blob1: 'bg-teal-500/50 blur-[120px]',
    blob2: 'bg-emerald-500/40 blur-[140px]',
    blob3: 'bg-cyan-600/40 blur-[100px]',
    particleColor1: 'rgba(20, 184, 166, ',
    particleColor2: 'rgba(16, 185, 129, ',
    glowColor: 'rgba(20, 184, 166, 0.4)',
  },
  prompt: {
    blob1: 'bg-amber-500/50 blur-[120px]',
    blob2: 'bg-orange-600/40 blur-[140px]',
    blob3: 'bg-yellow-500/40 blur-[100px]',
    particleColor1: 'rgba(245, 158, 11, ',
    particleColor2: 'rgba(249, 115, 22, ',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
};

export default function ShowcaseCodeAnimation({ toolId = 'image', isActive = true }) {
  const canvasRef = useRef(null);
  const theme = TOOL_THEMES[toolId] || TOOL_THEMES.image;

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 100 Particle Simulation
    const count = 90;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? theme.particleColor1 : theme.particleColor2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Floating badges for caption section
    const captionBadges = [
      { text: '#viral 🚀', x: 0.15, y: 0.25, speed: 0.02 },
      { text: '#trending ✨', x: 0.8, y: 0.2, speed: 0.025 },
      { text: '#ai #creative 🎨', x: 0.12, y: 0.75, speed: 0.018 },
      { text: '#engagement 🔥', x: 0.82, y: 0.7, speed: 0.022 },
    ];

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Render Floating Connecting Network Lines
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.45;
            ctx.strokeStyle = `${particles[i].color}${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render Animated Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.pulse += 0.04;
        const currentSize = p.size + Math.sin(p.pulse) * 1.5;
        const opacity = 0.6 + Math.sin(p.pulse) * 0.35;

        // Outer Glow Aura
        ctx.fillStyle = `${p.color}${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core Particle
        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Tool 1: AI Image Generator Photorealistic Aperture & Aurora Waves ───
      if (toolId === 'image') {
        const cx = w / 2;
        const cy = h / 2;
        const apertureRadius = 120 + Math.sin(frame * 0.03) * 25;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.015);
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k * Math.PI) / 3;
          ctx.moveTo(Math.cos(angle) * apertureRadius, Math.sin(angle) * apertureRadius);
          ctx.lineTo(Math.cos(angle + 0.5) * (apertureRadius + 60), Math.sin(angle + 0.5) * (apertureRadius + 60));
        }
        ctx.stroke();
        ctx.restore();

      // ── Tool 2: Document Summarizer Scanning Lasers & Matrix Code Cascade ──
      } else if (toolId === 'summary') {
        const scanY = (frame * 4) % h;
        const gradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.6)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY - 40, w, 80);

        // Laser Beam Accent Line
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

      // ── Tool 3: Social Caption Floating 3D Badges & Hashtags ─────────────
      } else if (toolId === 'caption') {
        captionBadges.forEach((b, idx) => {
          const bx = (w * b.x) + Math.sin(frame * b.speed + idx) * 30;
          const by = (h * b.y) + Math.cos(frame * b.speed + idx) * 25;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.fillRect(bx - 12, by - 20, 180, 40);
          ctx.strokeRect(bx - 12, by - 20, 180, 40);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(b.text, bx + 6, by + 5);
        });

      // ── Tool 4: Prompt Enhancer Golden Neural Rings & Constellations ───────
      } else if (toolId === 'prompt') {
        for (let r = 0; r < 3; r++) {
          const expand = (frame * 2.5 + r * 120) % 400;
          const ringAlpha = Math.max(0, (1 - expand / 400)) * 0.55;

          ctx.strokeStyle = `rgba(245, 158, 11, ${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, expand, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [toolId, isActive, theme]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Dynamic Animated Glowing Gradient Mesh Orbs */}
      <div className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full ${theme.blob1} animate-pulse duration-1000 scale-125`} />
      <div className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full ${theme.blob2} animate-pulse duration-700 delay-300 scale-125`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full ${theme.blob3} opacity-60 animate-spin-slow`} />

      {/* 60FPS High-Visibility Canvas Particles & Geometric Wave Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90"
      />
    </div>
  );
}
