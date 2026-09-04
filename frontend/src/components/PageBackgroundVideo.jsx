import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Global Page Background Video Component
 * - Assigns a unique looping background video + 3D Canvas Fallback to EVERY page
 * - Includes dark Rolex overlays for crisp readability
 * - Audio mute control button
 */

const PAGE_VIDEO_MAP = {
  '/dashboard': [
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
  ],
  '/dashboard/grid': [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
  ],
  '/dashboard/tools': [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
  ],
  '/dashboard/tools/image-gen': [
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
  ],
  '/dashboard/tools/summarizer': [
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-text-on-a-computer-screen-43284-large.mp4',
  ],
  '/dashboard/tools/captions': [
    'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-social-media-icons-floating-in-the-air-42887-large.mp4',
  ],
  '/dashboard/tools/prompt-plus': [
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
  ],
  '/dashboard/my-images': [
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
  ],
  '/dashboard/arcade': [
    'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-social-media-icons-floating-in-the-air-42887-large.mp4',
  ],
  '/dashboard/history': [
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-text-on-a-computer-screen-43284-large.mp4',
  ],
  '/dashboard/profile': [
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
  ],
  '/dashboard/settings': [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
  ],
  '/dashboard/admin': [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
  ],
};

export default function PageBackgroundVideo() {
  const location = useLocation();
  const [isMuted, setIsMuted]         = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError]   = useState(false);
  const videoRef                      = useRef(null);
  const canvasRef                     = useRef(null);

  const pathname = location.pathname;
  const sources = PAGE_VIDEO_MAP[pathname] || PAGE_VIDEO_MAP['/dashboard/grid'];

  // Reset video load state when route changes
  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [pathname]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 3D Canvas Fallback Engine for every page
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

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * (canvas.width || 1000),
      y: Math.random() * (canvas.height || 800),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3.5 + 2,
    }));

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [pathname, videoError, videoLoaded]);

  // Don't render global video overlay on the Snap-Scroll Showcase page since it has its own sections
  if (pathname === '/dashboard') return null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {/* Dark Rolex Backdrop Overlays for Crisp Readability */}
      <div className="absolute inset-0 bg-[#050510]/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-black/40 to-black/50 z-10 backdrop-blur-[1px]" />

      {/* Full-Frame Looping Video Background per Page */}
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

      {/* 3D Canvas Fallback Engine */}
      {(videoError || !videoLoaded) && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />
      )}

      {/* Audio Mute / Unmute Floating Control */}
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
