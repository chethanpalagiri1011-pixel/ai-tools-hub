import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Rolex-Style Full-Frame Cinematic Video Backdrop Component
 * - 100vw x 100vh fixed background matching tool theme
 * - Rolex multi-layered dark gradient overlay for crystal-clear UI readability
 * - Mute / Unmute audio control floating button
 * - Lazy loaded with 3D canvas animation fallback
 */

const TOOL_VIDEOS = {
  'image-gen': [
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
  ],
  'summarizer': [
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-text-on-a-computer-screen-43284-large.mp4',
  ],
  'captions': [
    'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-social-media-icons-floating-in-the-air-42887-large.mp4',
  ],
  'prompt-plus': [
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
  ],
};

export default function CinematicVideoBackdrop({ toolSlug = 'image-gen' }) {
  const [isMuted, setIsMuted]         = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError]   = useState(false);
  const videoRef                      = useRef(null);
  const canvasRef                     = useRef(null);

  // Sync mute state with video element
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Theme-matched Canvas 3D procedural loop renderer (Fallback if video fails or offline)
  useEffect(() => {
    if (!videoError && videoLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (toolSlug === 'image-gen') {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        for (let i = 0; i < 25; i++) {
          const progress = (frame * 0.02 + i * 0.2) % 1;
          const x = (i % 5) * (canvas.width / 5) + Math.sin(frame * 0.03 + i) * 30;
          const y = Math.floor(i / 5) * (canvas.height / 5) + Math.cos(frame * 0.03 + i) * 30;
          const size = 60 * progress;
          ctx.fillStyle = `rgba(${147 + i * 4}, 51, ${234 - i * 3}, ${0.15 + progress * 0.25})`;
          ctx.fillRect(x, y, size, size);
        }
      } else if (toolSlug === 'summarizer') {
        const collapse = (Math.sin(frame * 0.03) + 1) / 2;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        for (let i = 0; i < 6; i++) {
          const width = (canvas.width * 0.4) - (i * 30) * collapse;
          const y = (canvas.height * 0.2) + i * (50 - collapse * 15);
          ctx.fillRect(canvas.width * 0.3, y, width, 10);
        }
      } else if (toolSlug === 'captions') {
        const pop = Math.sin(frame * 0.04) * 15;
        ctx.fillStyle = 'rgba(20, 184, 166, 0.2)';
        ctx.fillRect(canvas.width * 0.2, canvas.height * 0.3 + pop, 280, 120);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('#viral #captions ✨', canvas.width * 0.22, canvas.height * 0.37 + pop);
      } else if (toolSlug === 'prompt-plus') {
        const expand = (Math.sin(frame * 0.04) + 1) / 2;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.2 + expand * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 80 + expand * 120, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [toolSlug, videoError, videoLoaded]);

  const sources = TOOL_VIDEOS[toolSlug] || TOOL_VIDEOS['image-gen'];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {/* 1. Rolex-Style Dark Backdrop Overlays for High UI Contrast */}
      <div className="absolute inset-0 bg-[#050510]/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-black/40 to-black/50 z-10 backdrop-blur-[1px]" />

      {/* 2. Full-Frame Looping Video Background */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-70 scale-105' : 'opacity-0'
          }`}
        >
          <source src={sources[0]} type="video/mp4" />
          <source src={sources[1]} type="video/mp4" />
        </video>
      )}

      {/* 3. 3D Canvas Fallback Renderer for Offline / Slow Connections */}
      {(videoError || !videoLoaded) && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />
      )}

      {/* 4. Rolex-Style Audio Mute / Unmute Control Icon Button */}
      {videoLoaded && !videoError && (
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-purple-600/40 text-white border border-white/20 hover:border-purple-500/50 backdrop-blur-xl transition-all shadow-2xl hover:scale-110 cursor-pointer group"
        >
          {isMuted ? (
            <VolumeX size={18} className="text-gray-300 group-hover:text-white" />
          ) : (
            <Volume2 size={18} className="text-purple-400 group-hover:text-white animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
}
