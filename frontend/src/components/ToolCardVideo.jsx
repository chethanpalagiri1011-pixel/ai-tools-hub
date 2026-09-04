import { useState, useEffect, useRef } from 'react';

/**
 * High-Fidelity 3D Looping Animation Component for AI Tool Cards
 * Renders crisp, glowing, theme-matched 3D visual loops (60fps)
 */
export default function ToolCardVideo({ toolId, fallbackGradient }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 300;
        canvas.height = canvas.parentElement.clientHeight || 200;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      if (toolId === 'image') {
        // Theme 1: Glowing 3D pixels/particles assembling into a sharp visual grid
        const cols = 5;
        const rows = 4;
        const cellW = (w * 0.7) / cols;
        const cellH = (h * 0.6) / rows;
        const startX = w * 0.15;
        const startY = h * 0.2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const index = r * cols + c;
            const progress = (frame * 0.02 + index * 0.15) % 1;
            const offsetX = Math.sin(frame * 0.04 + index) * (1 - progress) * 25;
            const offsetY = Math.cos(frame * 0.04 + index) * (1 - progress) * 25;
            const x = startX + c * cellW + offsetX;
            const y = startY + r * cellH + offsetY;
            const sz = cellW * 0.8 * progress;

            // Glowing 3D pixel block
            const grad = ctx.createLinearGradient(x, y, x + sz, y + sz);
            grad.addColorStop(0, `rgba(168, 85, 247, ${0.4 + progress * 0.5})`);
            grad.addColorStop(1, `rgba(236, 72, 153, ${0.4 + progress * 0.5})`);

            ctx.fillStyle = grad;
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 12 * progress;
            ctx.beginPath();
            ctx.roundRect(x, y, sz, sz, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      } else if (toolId === 'summary') {
        // Theme 2: Lines of text collapsing into bullet points
        const collapse = (Math.sin(frame * 0.03) + 1) / 2; // 0 to 1
        const startX = w * 0.15;
        const startY = h * 0.25;

        for (let i = 0; i < 4; i++) {
          const lineWidth = (w * 0.7) - (i * 25) * collapse;
          const y = startY + i * (28 - collapse * 10);

          ctx.fillStyle = `rgba(59, 130, 246, ${0.35 + i * 0.15})`;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(startX + (i * 10 * collapse), y, lineWidth, 8, 4);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Bullet dot
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(startX - 15, y + 4, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (toolId === 'caption') {
        // Theme 3: 3D Chat bubbles & popping hashtags
        const floatY = Math.sin(frame * 0.05) * 8;
        const popScale = 0.9 + Math.sin(frame * 0.08) * 0.1;

        // Glowing Chat Bubble
        ctx.fillStyle = 'rgba(20, 184, 166, 0.25)';
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(w * 0.15, h * 0.2 + floatY, w * 0.7 * popScale, h * 0.5 * popScale, 16);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Hashtag text
        ctx.fillStyle = '#6ee7b7';
        ctx.font = `bold ${Math.floor(w * 0.075)}px sans-serif`;
        ctx.fillText('#trending #viral ✨', w * 0.22, h * 0.5 + floatY);
      } else if (toolId === 'prompt') {
        // Theme 4: Simple prompt glowing and expanding into 3D detailed network nodes
        const cx = w * 0.5;
        const cy = h * 0.5;
        const expand = (Math.sin(frame * 0.04) + 1) / 2; // 0 to 1

        // Expanding outer ring
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.2 + expand * 0.6})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 25 + expand * 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Central glowing core
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Satellite node lines
        for (let i = 0; i < 4; i++) {
          const angle = (frame * 0.02) + (i * Math.PI) / 2;
          const dist = 30 + expand * 40;
          const nx = cx + Math.cos(angle) * dist;
          const ny = cy + Math.sin(angle) * dist;

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [toolId]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
      {/* Dynamic Gradient Tint Overlay */}
      <div
        className={`absolute inset-0 opacity-40 bg-gradient-to-br ${
          toolId === 'image'
            ? 'from-purple-900/30 to-pink-900/20'
            : toolId === 'summary'
            ? 'from-blue-900/30 to-cyan-900/20'
            : toolId === 'caption'
            ? 'from-teal-900/30 to-green-900/20'
            : 'from-yellow-900/30 to-orange-900/20'
        }`}
      />

      {/* 60fps Vibrant 3D Canvas Loop */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover opacity-75 mix-blend-screen"
      />
    </div>
  );
}
