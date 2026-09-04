import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import ShowcaseCodeAnimation from './ShowcaseCodeAnimation';

/**
 * Full-Frame Cinematic Video & Three.js Particle Backdrop Component
 */

const TOOL_VIDEOS = {
  'image-gen': [
    '/videos/tool-showcase.mp4',
    '/videos/image-gen.mp4',
    'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
  ],
  'summarizer': [
    '/videos/tool-showcase.mp4',
    '/videos/summarizer.mp4',
    'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
  ],
  'captions': [
    '/videos/tool-showcase.mp4',
    '/videos/captions.mp4',
    'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
  ],
  'prompt-plus': [
    '/videos/tool-showcase.mp4',
    '/videos/prompt-plus.mp4',
    'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
  ],
};

const SLUG_MAP = {
  'image-gen': 'image',
  'summarizer': 'summary',
  'captions': 'caption',
  'prompt-plus': 'prompt',
};

export default function CinematicVideoBackdrop({ toolSlug = 'image-gen' }) {
  const [isMuted, setIsMuted]         = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError]   = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const videoRef                      = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const sources = TOOL_VIDEOS[toolSlug] || TOOL_VIDEOS['image-gen'];
  const animToolId = SLUG_MAP[toolSlug] || 'image';

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {/* 1. Backdrop Overlays for Crisp Readability */}
      <div className="absolute inset-0 bg-[#050510]/50 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/70 via-transparent to-[#050510]/50 z-10" />

      {/* 2. Three.js Real GPU Particle Animation Background */}
      <ShowcaseCodeAnimation toolId={animToolId} isActive={true} />

      {/* 3. Full-Frame Looping Video Background (If Video File Provided) */}
      {!isMobile && !videoError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-40 mix-blend-screen scale-105' : 'opacity-0'
          }`}
        >
          {sources.map((src, i) => (
            <source key={i} src={src} type="video/mp4" />
          ))}
        </video>
      )}

      {/* 4. Mute / Unmute Floating Control Icon */}
      {!isMobile && videoLoaded && !videoError && (
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
