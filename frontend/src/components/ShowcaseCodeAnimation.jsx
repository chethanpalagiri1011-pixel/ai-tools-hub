import { useEffect, useRef } from 'react';

/**
 * 100% Code-Based Procedural Canvas & CSS Animations for Showcase Sections
 * - Zero external video/image dependencies
 * - Lightweight, 60fps animations matching each tool's color theme & concept
 * - Only renders active frame loop when section is currently visible (high performance)
 */

export default function ShowcaseCodeAnimation({ toolId, isActive }) {
  const canvasRef = useRef(null);

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

    // ── Particle Generator for Image Gen (Tool 1) ───────────────────────────
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 3.5 + 2,
      color: Math.random() > 0.5 ? 'rgba(168, 85, 247, ' : 'rgba(236, 72, 153, ',
    }));

    // Target positions for photo-frame assembly
    const frameTargets = [];
    const frameW = 280;
    const frameH = 200;
    const centerX = (canvas.width || 800) / 2;
    const centerY = (canvas.height || 600) / 2;

    for (let i = 0; i < particleCount; i++) {
      let tx, ty;
      if (i < 20) {
        // Top & Bottom border of photo frame
        tx = centerX - frameW / 2 + (i / 20) * frameW;
        ty = i % 2 === 0 ? centerY - frameH / 2 : centerY + frameH / 2;
      } else if (i < 40) {
        // Left & Right border of photo frame
        tx = (i - 20) % 2 === 0 ? centerX - frameW / 2 : centerX + frameW / 2;
        ty = centerY - frameH / 2 + ((i - 20) / 20) * frameH;
      } else {
        // Inner mountain / sun shape inside frame
        const angle = ((i - 40) / 30) * Math.PI * 2;
        tx = centerX + Math.cos(angle) * 45;
        ty = centerY - 10 + Math.sin(angle) * 45;
      }
      frameTargets.push({ x: tx, y: ty });
    }

    // ── Floating Hashtags & Chat Bubbles for Captions (Tool 3) ─────────────
    const hashtags = [
      { text: '#trending ✨', x: 0.2, y: 0.4, speed: 0.02 },
      { text: '#viral 🚀',    x: 0.75, y: 0.3, speed: 0.025 },
      { text: '#ai #creative 🎨', x: 0.25, y: 0.7, speed: 0.018 },
      { text: '#style 🔥',     x: 0.8, y: 0.65, speed: 0.022 },
    ];

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // ── 1. AI Image Generator: Particle Assembly Animation ────────────────
      if (toolId === 'image') {
        const cycle = (frame % 300) / 300; // 0 to 1 over 5 seconds
        const assemblePhase = cycle > 0.4 && cycle < 0.85;
        const phaseProgress = assemblePhase ? Math.sin(((cycle - 0.4) / 0.45) * Math.PI) : 0;

        particles.forEach((p, idx) => {
          if (assemblePhase) {
            const target = frameTargets[idx] || { x: width / 2, y: height / 2 };
            p.x += (target.x - p.x) * 0.08;
            p.y += (target.y - p.y) * 0.08;
          } else {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
          }

          const alpha = 0.25 + phaseProgress * 0.55;
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + phaseProgress * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw glowing frame connectors during assembly
        if (assemblePhase && phaseProgress > 0.3) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${phaseProgress * 0.35})`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(centerX - frameW / 2, centerY - frameH / 2, frameW, frameH);
        }

      // ── 2. Document Summarizer: Text Lines Collapsing Animation ───────────
      } else if (toolId === 'summary') {
        const collapse = (Math.sin(frame * 0.035) + 1) / 2; // 0 (expanded) to 1 (collapsed)
        const startY = height * 0.25;
        const lineSpacing = 32;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.fillRect(width * 0.2, startY - 20, width * 0.6, 260);

        // 6 Full text lines shrinking into 3 bullet points
        for (let i = 0; i < 6; i++) {
          const isBullet = i % 2 === 0;
          const targetWidth = isBullet ? width * 0.35 : width * 0.05;
          const initialWidth = (width * 0.5) - (i * 25);
          const currentWidth = initialWidth - (initialWidth - targetWidth) * collapse;

          const initialY = startY + i * lineSpacing;
          const targetY = startY + Math.floor(i / 2) * (lineSpacing * 1.5) + 20;
          const currentY = initialY + (targetY - initialY) * collapse;
          const opacity = isBullet ? (0.3 + collapse * 0.5) : (0.4 * (1 - collapse));

          if (opacity > 0.05) {
            // Bullet dot
            if (isBullet) {
              ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + collapse * 0.5})`;
              ctx.beginPath();
              ctx.arc(width * 0.25 - 15, currentY + 4, 4 + collapse * 2, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.fillRect(width * 0.25, currentY, currentWidth, 8);
          }
        }

      // ── 3. Social Caption Generator: Floating Chat Bubbles & Hashtags ──────
      } else if (toolId === 'caption') {
        hashtags.forEach((tag, idx) => {
          const floatY = (height * tag.y) + Math.sin(frame * tag.speed + idx) * 20;
          const floatX = (width * tag.x) + Math.cos(frame * tag.speed + idx) * 15;
          const alpha = 0.35 + Math.sin(frame * 0.04 + idx) * 0.25;

          // Chat bubble background box
          ctx.fillStyle = `rgba(20, 184, 166, ${alpha * 0.25})`;
          ctx.fillRect(floatX - 15, floatY - 22, 190, 42);

          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(floatX - 15, floatY - 22, 190, 42);

          // Hashtag Text
          ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(tag.text, floatX, floatY + 4);
        });

      // ── 4. AI Prompt Enhancer: Glowing Expanding Prompt Text ────────────────
      } else if (toolId === 'prompt') {
        const expand = (Math.sin(frame * 0.03) + 1) / 2; // 0 to 1
        const centerX = width / 2;
        const centerY = height / 2;

        // Expanding radial glowing rings
        const ringRadius = 40 + expand * 140;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 + (1 - expand) * 0.35})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Nodes & Connecting Lines
        const nodeCount = 8;
        for (let i = 0; i < nodeCount; i++) {
          const angle = (i / nodeCount) * Math.PI * 2 + (frame * 0.01);
          const dist = 30 + expand * 120;
          const nx = centerX + Math.cos(angle) * dist;
          const ny = centerY + Math.sin(angle) * dist;

          ctx.strokeStyle = `rgba(249, 115, 22, ${0.2 + expand * 0.4})`;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + expand * 0.5})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center glowing prompt orb
        ctx.fillStyle = `rgba(245, 158, 11, ${0.7 + expand * 0.3})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 + expand * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [toolId, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 transition-opacity duration-700"
    />
  );
}
