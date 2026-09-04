import { useState, useEffect, useRef } from 'react';

/**
 * Unique Looping 3D Animated Video Component for AI Tool Cards
 * - Autoplay, loop continuously, muted
 * - Lightweight MP4 / WebM with lazy loading
 * - Canvas 3D fallback theme renderer if video fails or network is offline
 */

const VIDEO_SOURCES = {
  image: [
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
  ],
  summary: [
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-text-on-a-computer-screen-43284-large.mp4',
  ],
  caption: [
    'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-social-media-icons-floating-in-the-air-42887-large.mp4',
  ],
  prompt: [
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
  ],
};

export default function ToolCardVideo({ toolId, fallbackGradient }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError]   = useState(false);
  const [isVisible, setIsVisible]     = useState(false);
  const videoRef  = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Lazy loading observer so video only loads when card enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Theme-matched Canvas 3D procedural loop renderer (Fallback if video fails or offline)
  useEffect(() => {
    if (!videoError && videoLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (toolId === 'image') {
        // Theme 1: Particles / pixels assembling into a photo grid
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        for (let i = 0; i < 16; i++) {
          const progress = (frame * 0.03 + i * 0.4) % 1;
          const x = (i % 4) * 45 + 15 + Math.sin(frame * 0.05 + i) * (1 - progress) * 20;
          const y = Math.floor(i / 4) * 45 + 15 + Math.cos(frame * 0.05 + i) * (1 - progress) * 20;
          const size = 30 * progress;
          ctx.fillStyle = `rgba(${139 + i * 8}, 92, ${246 - i * 5}, ${0.2 + progress * 0.4})`;
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, 4);
          ctx.fill();
        }
      } else if (toolId === 'summary') {
        // Theme 2: Lines of text collapsing into bullet points
        const collapse = Math.sin(frame * 0.04) * 0.5 + 0.5; // 0 to 1
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        for (let i = 0; i < 4; i++) {
          const width = 140 - (i * 20) * collapse;
          const y = 20 + i * (25 - collapse * 10);
          ctx.beginPath();
          ctx.roundRect(20, y, width, 6, 3);
          ctx.fill();
        }
      } else if (toolId === 'caption') {
        // Theme 3: Chat bubbles & hashtags popping in
        const pop = Math.sin(frame * 0.06) * 6;
        ctx.fillStyle = 'rgba(20, 184, 166, 0.35)';
        ctx.beginPath();
        ctx.roundRect(20, 20 + pop, 110, 45, 12);
        ctx.fill();
        ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('#trending ✨', 35, 46 + pop);
      } else if (toolId === 'prompt') {
        // Theme 4: Simple prompt glowing and expanding into detailed nodes
        const expand = (Math.sin(frame * 0.05) + 1) / 2; // 0 to 1
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + expand * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(90, 60, 20 + expand * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(90, 60, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [toolId, videoError, videoLoaded]);

  const sources = VIDEO_SOURCES[toolId] || VIDEO_SOURCES.image;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
      {/* Background Static Gradient Fallback */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${fallbackGradient || 'bg-gradient-to-br from-purple-900/20 to-dark-400/80'}`}
        style={{ opacity: videoLoaded && !videoError ? 0.3 : 0.85 }}
      />

      {/* Lazy-loaded 3D Animated Video Loop */}
      {isVisible && !videoError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-35 mix-blend-screen' : 'opacity-0'}`}
        >
          <source src={sources[0]} type="video/mp4" />
          <source src={sources[1]} type="video/mp4" />
        </video>
      )}

      {/* Canvas Fallback for Offline / Failures */}
      {(!isVisible || videoError || !videoLoaded) && (
        <canvas
          ref={canvasRef}
          width={200}
          height={150}
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
      )}
    </div>
  );
}
