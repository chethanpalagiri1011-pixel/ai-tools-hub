import { useEffect, useRef } from 'react';

/**
 * Ultra-Vibrant 60FPS Procedural Animated Code Background
 * - High-energy 3D canvas physics, geometric wireframes, matrix cascades, and glowing particle fields
 * - Distinct, unmistakably dynamic background for each of the 4 AI Tools
 */

const TOOL_THEMES = {
  image: {
    blob1: 'bg-purple-600/60 blur-[90px]',
    blob2: 'bg-pink-500/50 blur-[100px]',
    blob3: 'bg-indigo-500/50 blur-[80px]',
    particleColor1: 'rgba(217, 70, 239, ', // Fuchsia
    particleColor2: 'rgba(168, 85, 247, ', // Purple
    laserColor: 'rgba(236, 72, 153, 0.8)',
  },
  summary: {
    blob1: 'bg-blue-600/60 blur-[90px]',
    blob2: 'bg-cyan-500/50 blur-[100px]',
    blob3: 'bg-indigo-600/50 blur-[80px]',
    particleColor1: 'rgba(59, 130, 246, ', // Blue
    particleColor2: 'rgba(6, 182, 212, ',  // Cyan
    laserColor: 'rgba(56, 189, 248, 0.9)',
  },
  caption: {
    blob1: 'bg-teal-500/60 blur-[90px]',
    blob2: 'bg-emerald-500/50 blur-[100px]',
    blob3: 'bg-green-600/50 blur-[80px]',
    particleColor1: 'rgba(20, 184, 166, ', // Teal
    particleColor2: 'rgba(52, 211, 153, ', // Emerald
    laserColor: 'rgba(45, 212, 191, 0.9)',
  },
  prompt: {
    blob1: 'bg-amber-500/60 blur-[90px]',
    blob2: 'bg-orange-600/50 blur-[100px]',
    blob3: 'bg-yellow-500/50 blur-[80px]',
    particleColor1: 'rgba(245, 158, 11, ', // Amber
    particleColor2: 'rgba(251, 146, 60, ', // Orange
    laserColor: 'rgba(252, 211, 77, 0.9)',
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

    // Generate 110 High-Density Dynamic Particles
    const count = 110;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      vx: (Math.random() - 0.5) * 2.8,
      vy: (Math.random() - 0.5) * 2.8,
      size: Math.random() * 4.5 + 2,
      color: Math.random() > 0.5 ? theme.particleColor1 : theme.particleColor2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Floating badges for Social Captions
    const captionBadges = [
      { text: '#viral 🚀', x: 0.15, y: 0.22, speed: 0.02 },
      { text: '#trending ✨', x: 0.8, y: 0.18, speed: 0.025 },
      { text: '#ai #creative 🎨', x: 0.12, y: 0.72, speed: 0.018 },
      { text: '#engagement 🔥', x: 0.82, y: 0.68, speed: 0.022 },
      { text: '100k Likes ❤️', x: 0.48, y: 0.85, speed: 0.028 },
    ];

    // Matrix code columns for Summarizer
    const matrixCols = Array.from({ length: 25 }, (_, i) => ({
      x: (i / 25) * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      speed: Math.random() * 3 + 2,
      chars: '01010101SUMMARIZE_KEY_POINTS_AI_DATA',
    }));

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Render Connecting Particle Network Web
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.6;
            ctx.strokeStyle = `${particles[i].color}${alpha})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Render Particle Cores with Outer Glow
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.pulse += 0.05;
        const currentSize = p.size + Math.sin(p.pulse) * 2;
        const opacity = 0.7 + Math.sin(p.pulse) * 0.3;

        // Outer Glow Aura
        ctx.fillStyle = `${p.color}${opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner Bright Core
        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Tool 1: AI Image Generator 3D Rotating Cyber Aperture & Starburst ──
      if (toolId === 'image') {
        const cx = w / 2;
        const cy = h / 2;
        const radius = 140 + Math.sin(frame * 0.03) * 35;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.02);

        // Outer Aperture Ring
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Geometric Aperture Blades
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 2;
        for (let k = 0; k < 8; k++) {
          const angle = (k * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * (radius * 0.4), Math.sin(angle) * (radius * 0.4));
          ctx.lineTo(Math.cos(angle + 0.4) * (radius * 1.1), Math.sin(angle + 0.4) * (radius * 1.1));
          ctx.stroke();
        }

        ctx.restore();

      // ── Tool 2: Document Summarizer Matrix Code Stream & Laser Sweep ──────
      } else if (toolId === 'summary') {
        // Vertical Matrix Rain
        ctx.font = 'bold 12px monospace';
        matrixCols.forEach((col) => {
          col.y += col.speed;
          if (col.y > h) col.y = 0;
          const char = col.chars[Math.floor((col.y / 20) % col.chars.length)];
          ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
          ctx.fillText(char, col.x, col.y);
        });

        // Horizontal High-Glow Laser Scanner Beam
        const scanY = (frame * 4.5) % h;
        const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.7)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY - 50, w, 100);

        // Core Glowing Laser Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

      // ── Tool 3: Social Captions 3D Levitating Hashtag & Engagement Badges ──
      } else if (toolId === 'caption') {
        captionBadges.forEach((b, idx) => {
          const bx = (w * b.x) + Math.sin(frame * b.speed + idx) * 35;
          const by = (h * b.y) + Math.cos(frame * b.speed + idx) * 30;

          // Glowing Badge Card Background
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(20, 184, 166, 0.6)';
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.rect(bx - 15, by - 22, 190, 44);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0; // Reset shadow

          // Text Content
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(b.text, bx + 5, by + 5);
        });

      // ── Tool 4: AI Prompt Enhancer Expanding Constellation Networks ───────
      } else if (toolId === 'prompt') {
        const cx = w / 2;
        const cy = h / 2;

        // Expanding Energy Shockwaves
        for (let r = 0; r < 4; r++) {
          const expand = (frame * 3 + r * 100) % 450;
          const ringAlpha = Math.max(0, (1 - expand / 450)) * 0.7;

          ctx.strokeStyle = `rgba(245, 158, 11, ${ringAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, expand, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center Pulsating Core
        ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + Math.sin(frame * 0.08) * 6, 0, Math.PI * 2);
        ctx.fill();
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
      {/* High-Visibility Ambient Glow Orbs */}
      <div className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full ${theme.blob1} animate-pulse duration-1000 scale-125`} />
      <div className={`absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full ${theme.blob2} animate-pulse duration-700 delay-300 scale-125`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${theme.blob3} opacity-70 animate-spin-slow`} />

      {/* 60FPS High-Energy Canvas Renderer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-100"
      />
    </div>
  );
}
