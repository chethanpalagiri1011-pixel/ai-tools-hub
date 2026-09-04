import { useEffect, useRef } from 'react';

/**
 * Image-Focused & Tool-Themed 60FPS Animated Code Background Renderer
 * - AI Image Generator: Floating AI Artwork Gallery, Camera Focus HUD, RGB Color Palette, & Shutter Aperture
 * - Document Summarizer: Text Scanning Lasers & Key Point Extraction Cascades
 * - Social Captions: Floating 3D Post Cards, Viral Badges, & Engagement Emojis
 * - AI Prompt Enhancer: 3D Constellation Neural Network & Prompt Expansion Rings
 */

const TOOL_THEMES = {
  image: {
    blob1: 'bg-purple-600/70 blur-[90px]',
    blob2: 'bg-pink-500/60 blur-[100px]',
    blob3: 'bg-indigo-600/60 blur-[80px]',
    particleColor1: 'rgba(236, 72, 153, ',  // Pink
    particleColor2: 'rgba(168, 85, 247, ', // Purple
  },
  summary: {
    blob1: 'bg-blue-600/70 blur-[90px]',
    blob2: 'bg-cyan-500/60 blur-[100px]',
    blob3: 'bg-indigo-600/60 blur-[80px]',
    particleColor1: 'rgba(59, 130, 246, ', // Blue
    particleColor2: 'rgba(6, 182, 212, ',  // Cyan
  },
  caption: {
    blob1: 'bg-teal-500/70 blur-[90px]',
    blob2: 'bg-emerald-500/60 blur-[100px]',
    blob3: 'bg-green-600/60 blur-[80px]',
    particleColor1: 'rgba(20, 184, 166, ', // Teal
    particleColor2: 'rgba(52, 211, 153, ', // Emerald
  },
  prompt: {
    blob1: 'bg-amber-500/70 blur-[90px]',
    blob2: 'bg-orange-600/60 blur-[100px]',
    blob3: 'bg-yellow-500/60 blur-[80px]',
    particleColor1: 'rgba(245, 158, 11, ', // Amber
    particleColor2: 'rgba(251, 146, 60, ', // Orange
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

    // 1. Generate RGB & Spectral Dust Particles
    const count = 100;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      vx: (Math.random() - 0.5) * 2.4,
      vy: (Math.random() - 0.5) * 2.4,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? theme.particleColor1 : theme.particleColor2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // 2. Image Generator Floating Artwork Cards Data
    const imageCards = [
      { title: '🎨 Cyberpunk Portrait', tag: '4K AI Vision', x: 0.12, y: 0.2, width: 220, height: 130, speed: 0.015, color: '#ec4899' },
      { title: '🌄 Neon Mountain 8K', tag: 'Photorealistic', x: 0.78, y: 0.18, width: 230, height: 135, speed: 0.02, color: '#a855f7' },
      { title: '✨ Abstract 3D Sculpture', tag: 'Rendered 60fps', x: 0.1, y: 0.7, width: 210, height: 125, speed: 0.018, color: '#8b5cf6' },
      { title: '🌌 Deep Space Galaxy', tag: '8K HDR Raw', x: 0.82, y: 0.68, width: 220, height: 130, speed: 0.022, color: '#d946ef' },
    ];

    // 3. Social Captions Badges Data
    const captionBadges = [
      { text: '#viral 🚀', x: 0.15, y: 0.22, speed: 0.02 },
      { text: '#trending ✨', x: 0.8, y: 0.18, speed: 0.025 },
      { text: '#ai #creative 🎨', x: 0.12, y: 0.72, speed: 0.018 },
      { text: '#engagement 🔥', x: 0.82, y: 0.68, speed: 0.022 },
    ];

    // 4. Summarizer Matrix Code Data
    const matrixCols = Array.from({ length: 22 }, (_, i) => ({
      x: (i / 22) * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      speed: Math.random() * 3 + 2,
      chars: '01010101SUMMARIZE_KEY_POINTS_AI_DATA',
    }));

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ── Background Particle Mesh Lines ──────────────────────────────────────
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.5;
            ctx.strokeStyle = `${particles[i].color}${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.pulse += 0.04;
        const currentSize = p.size + Math.sin(p.pulse) * 1.5;
        const opacity = 0.7 + Math.sin(p.pulse) * 0.3;

        ctx.fillStyle = `${p.color}${opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Tool 1: AI Image Generator (Artwork Cards + Camera Viewfinder HUD) ─
      if (toolId === 'image') {
        // A. Camera Focus Crosshair HUD
        const cx = w / 2;
        const cy = h / 2;

        ctx.save();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.lineWidth = 1.5;

        // Camera Rule-of-Thirds Grid Lines
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(w * 0.33, 0); ctx.lineTo(w * 0.33, h);
        ctx.moveTo(w * 0.66, 0); ctx.lineTo(w * 0.66, h);
        ctx.moveTo(0, h * 0.33); ctx.lineTo(w, h * 0.33);
        ctx.moveTo(0, h * 0.66); ctx.lineTo(w, h * 0.66);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Center Lens Focus Brackets [ + ]
        const bracketSize = 35;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.lineWidth = 2.5;

        // Top-Left Corner
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy - 60 + bracketSize);
        ctx.lineTo(cx - 60, cy - 60);
        ctx.lineTo(cx - 60 + bracketSize, cy - 60);
        ctx.stroke();

        // Top-Right Corner
        ctx.beginPath();
        ctx.moveTo(cx + 60 - bracketSize, cy - 60);
        ctx.lineTo(cx + 60, cy - 60);
        ctx.lineTo(cx + 60, cy - 60 + bracketSize);
        ctx.stroke();

        // Bottom-Left Corner
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy + 60 - bracketSize);
        ctx.lineTo(cx - 60, cy + 60);
        ctx.lineTo(cx - 60 + bracketSize, cy + 60);
        ctx.stroke();

        // Bottom-Right Corner
        ctx.beginPath();
        ctx.moveTo(cx + 60 - bracketSize, cy + 60);
        ctx.lineTo(cx + 60, cy + 60);
        ctx.lineTo(cx + 60, cy + 60 - bracketSize);
        ctx.stroke();

        // Camera Spec HUD Text
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('• 4K AI VISION ENGINE | ISO 100 | RAW 8K | F/1.4', cx - 140, cy + 90);

        ctx.restore();

        // B. Floating Glassmorphic AI Artwork Cards
        imageCards.forEach((card, idx) => {
          const cardX = (w * card.x) + Math.sin(frame * card.speed + idx) * 25;
          const cardY = (h * card.y) + Math.cos(frame * card.speed + idx) * 20;

          // Card Backdrop
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = card.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = card.color;
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.rect(cardX, cardY, card.width, card.height);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0; // Reset shadow

          // Image Placeholder Canvas Inside Card
          const imgGradient = ctx.createLinearGradient(cardX, cardY, cardX + card.width, cardY + card.height);
          imgGradient.addColorStop(0, `${card.color}40`);
          imgGradient.addColorStop(0.5, '#1e1b4b');
          imgGradient.addColorStop(1, '#0f172a');
          ctx.fillStyle = imgGradient;
          ctx.fillRect(cardX + 10, cardY + 10, card.width - 20, card.height - 45);

          // Artwork Title & Tag
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(card.title, cardX + 10, cardY + card.height - 18);

          ctx.fillStyle = card.color;
          ctx.font = 'bold 10px monospace';
          ctx.fillText(card.tag, cardX + card.width - 85, cardY + card.height - 18);
        });

      // ── Tool 2: Document Summarizer (Text Collapse & Scan Beam) ───────────
      } else if (toolId === 'summary') {
        // Vertical Matrix Text Cascade
        ctx.font = 'bold 12px monospace';
        matrixCols.forEach((col) => {
          col.y += col.speed;
          if (col.y > h) col.y = 0;
          const char = col.chars[Math.floor((col.y / 20) % col.chars.length)];
          ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
          ctx.fillText(char, col.x, col.y);
        });

        // Horizontal Laser Scanner Beam
        const scanY = (frame * 4.5) % h;
        const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.7)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY - 50, w, 100);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

      // ── Tool 3: Social Caption Generator (Floating Badges & Posts) ─────────
      } else if (toolId === 'caption') {
        captionBadges.forEach((b, idx) => {
          const bx = (w * b.x) + Math.sin(frame * b.speed + idx) * 35;
          const by = (h * b.y) + Math.cos(frame * b.speed + idx) * 30;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(20, 184, 166, 0.6)';
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.rect(bx - 15, by - 22, 190, 44);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(b.text, bx + 5, by + 5);
        });

      // ── Tool 4: AI Prompt Enhancer (Neural Network Node Web) ─────────────
      } else if (toolId === 'prompt') {
        const cx = w / 2;
        const cy = h / 2;

        for (let r = 0; r < 4; r++) {
          const expand = (frame * 3 + r * 100) % 450;
          const ringAlpha = Math.max(0, (1 - expand / 450)) * 0.7;

          ctx.strokeStyle = `rgba(245, 158, 11, ${ringAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, expand, 0, Math.PI * 2);
          ctx.stroke();
        }

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
