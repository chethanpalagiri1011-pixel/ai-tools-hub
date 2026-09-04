import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ImageIcon, FileText, MessageSquare, Sparkles, LayoutGrid, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShowcaseCodeAnimation from '../components/ShowcaseCodeAnimation';
import DeviceMockupShowcase from '../components/DeviceMockupShowcase';

/**
 * Snap-Scrolling Showcase Page (Post-Login Hero Showcase)
 * - 4 Full-viewport (100vh) snap-scroll sections for the 4 AI Tools
 * - Full-frame cinematic looping videos
 * - Side indicator dots & scroll down guidance arrow
 * - Direct navigation to dedicated tool workspaces
 */

const SHOWCASE_SECTIONS = [
  {
    id: 'image',
    slug: 'image-gen',
    title: 'AI Image Generator',
    tagline: 'Turn your imagination into stunning 4K photorealistic visuals',
    icon: ImageIcon,
    accent: 'from-purple-500 to-pink-500',
    colorText: 'text-purple-400',
    btnBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',
    videoSources: [
      'https://cdn.pixabay.com/video/2021/04/12/70868-536480579_tiny.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4',
    ],
  },
  {
    id: 'summary',
    slug: 'summarizer',
    title: 'Document Summarizer',
    tagline: 'Instantly condense long articles & documents into key takeaways',
    icon: FileText,
    accent: 'from-blue-500 to-cyan-500',
    colorText: 'text-blue-400',
    btnBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
    videoSources: [
      'https://cdn.pixabay.com/video/2020/05/25/40149-425170366_tiny.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-text-on-a-computer-screen-43284-large.mp4',
    ],
  },
  {
    id: 'caption',
    slug: 'captions',
    title: 'Social Caption Generator',
    tagline: 'Craft viral social media copy with curated hashtag packages',
    icon: MessageSquare,
    accent: 'from-teal-500 to-green-500',
    colorText: 'text-teal-400',
    btnBg: 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/25',
    videoSources: [
      'https://cdn.pixabay.com/video/2023/04/18/159493-819198642_tiny.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-social-media-icons-floating-in-the-air-42887-large.mp4',
    ],
  },
  {
    id: 'prompt',
    slug: 'prompt-plus',
    title: 'AI Prompt Enhancer',
    tagline: 'Enrich simple prompts with professional camera & resolution tags',
    icon: Sparkles,
    accent: 'from-yellow-500 to-orange-500',
    colorText: 'text-yellow-400',
    btnBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25',
    videoSources: [
      'https://cdn.pixabay.com/video/2022/11/07/138122-768560124_tiny.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-digital-nodes-connecting-in-a-network-41551-large.mp4',
    ],
  },
];

export default function ShowcasePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const containerRef              = useRef(null);
  const sectionRefs               = useRef([]);

  // Track active scroll section for indicator dots
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPos = containerRef.current.scrollTop;
      const height = window.innerHeight;
      const index = Math.round(scrollPos / height);
      if (index >= 0 && index < SHOWCASE_SECTIONS.length) {
        setActiveIdx(index);
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (idx) => {
    if (sectionRefs.current[idx]) {
      sectionRefs.current[idx].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050510]">
      {/* Top Header Controls Overlay */}
      <div className="fixed top-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-black/40 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-xs font-semibold text-white">
            {user?.credits ?? 100} Credits Remaining
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => navigate('/dashboard/grid')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-200 bg-black/50 hover:bg-purple-600/40 hover:text-white border border-white/15 backdrop-blur-xl transition-all cursor-pointer shadow-lg"
          >
            <LayoutGrid size={15} />
            <span>Dashboard View</span>
          </button>
        </div>
      </div>

      {/* Side Navigation Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        {SHOWCASE_SECTIONS.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(idx)}
            title={sec.title}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              activeIdx === idx
                ? 'bg-purple-400 scale-125 ring-4 ring-purple-500/30'
                : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Snap Scroll Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {SHOWCASE_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          const isCurrent = activeIdx === idx;
          const isNext = activeIdx + 1 === idx;
          const shouldLoad = isCurrent || isNext;

          return (
            <div
              key={sec.id}
              ref={(el) => (sectionRefs.current[idx] = el)}
              className="w-screen h-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
            >
              {/* Background Rolex Dark Overlays */}
              <div className="absolute inset-0 bg-[#050510]/60 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-black/40 to-black/60 z-10 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050510]/40 to-[#050510] z-10" />
              {/* 100% Code-Based Procedural Animated Background */}
              <ShowcaseCodeAnimation toolId={sec.id} isActive={isCurrent} />

              {/* Section Content Overlay */}
              <div className="relative z-20 text-center max-w-4xl px-6 space-y-6 animate-fade-in flex flex-col items-center">
                {/* 100% Code-Based Device Mockup Frame & Animated Text Reveal */}
                <DeviceMockupShowcase toolId={sec.id} isActive={isCurrent} />

                <div className="space-y-2 pt-2">
                  <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    {sec.tagline}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => navigate(`/dashboard/tools/${sec.slug}`)}
                    className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm md:text-base flex items-center gap-3 mx-auto transition-all transform hover:scale-105 cursor-pointer shadow-2xl ${sec.btnBg}`}
                  >
                    <span>Try {sec.title}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* First Section Scroll Down Hint */}
              {idx === 0 && (
                <button
                  onClick={() => scrollToSection(1)}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-all cursor-pointer animate-bounce"
                >
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Scroll Down</span>
                  <ChevronDown size={20} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
