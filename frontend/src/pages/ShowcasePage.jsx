import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ImageIcon, FileText, MessageSquare, Sparkles, LayoutGrid, Zap } from 'lucide-react';
import CinematicVideoBackdrop from '../components/CinematicVideoBackdrop';

const SHOWCASE_SECTIONS = [
  {
    id: 1,
    slug: 'image-gen',
    title: 'AI Image Generator',
    badge: '✨ TOOL 01 OF 04',
    desc: 'Turn your wildest imagination into photorealistic 4K visuals, digital art, and anime in seconds.',
    icon: ImageIcon,
    color: 'from-purple-500 to-pink-500',
    btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30',
    stats: '1.2M+ Visuals Generated',
  },
  {
    id: 2,
    slug: 'summarizer',
    title: 'Document Summarizer',
    badge: '📄 TOOL 02 OF 04',
    desc: 'Condense multi-page articles, essays, and long reports into crisp, actionable bullet points instantly.',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30',
    stats: '420K+ Pages Condensed',
  },
  {
    id: 3,
    slug: 'captions',
    title: 'Social Caption Generator',
    badge: '💬 TOOL 03 OF 04',
    desc: 'Create viral captions, trending hashtags, and social media copy tuned to any audience or tone.',
    icon: MessageSquare,
    color: 'from-teal-500 to-green-500',
    btnColor: 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/30',
    stats: '310K+ Captions Crafted',
  },
  {
    id: 4,
    slug: 'prompt-plus',
    title: 'AI Prompt Enhancer',
    badge: '⚡ TOOL 04 OF 04',
    desc: 'Enrich basic text prompts with camera settings, cinematic lighting tags, and negative descriptors.',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    btnColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30',
    stats: '89K+ Prompts Optimized',
  },
];

export default function ShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs                   = useRef([]);
  const navigate                      = useNavigate();

  // Track scroll section index using IntersectionObserver
  useEffect(() => {
    const observers = [];
    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-[#050510]">
      {/* Top Floating Dashboard View Switcher */}
      <div className="fixed top-20 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/overview')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-200 bg-black/60 hover:bg-purple-600/40 border border-white/15 hover:border-purple-500/50 backdrop-blur-xl transition-all shadow-2xl cursor-pointer group"
        >
          <LayoutGrid size={15} className="text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>Card Grid Dashboard</span>
        </button>
      </div>

      {/* Vertical Navigation Indicator Dots (Right Side) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        {SHOWCASE_SECTIONS.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(idx)}
            title={sec.title}
            className={`group relative flex items-center justify-end p-1 transition-all cursor-pointer`}
          >
            {/* Tooltip on Hover */}
            <span className="absolute right-7 px-2.5 py-1 rounded-lg bg-black/80 border border-white/10 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md pointer-events-none">
              {sec.title}
            </span>
            {/* Dot */}
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? 'bg-purple-400 scale-125 shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/20'
                  : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* 4 Full-Viewport Snap Scroll Sections */}
      {SHOWCASE_SECTIONS.map((sec, idx) => (
        <section
          key={sec.id}
          ref={el => (sectionRefs.current[idx] = el)}
          className="relative w-full h-[calc(100vh-4rem)] md:h-screen snap-start flex items-center justify-center overflow-hidden"
        >
          {/* Rolex-Style Themed Video Backdrop for this Section */}
          <CinematicVideoBackdrop toolSlug={sec.slug} />

          {/* Section Overlay Content Card */}
          <div className="relative z-20 max-w-3xl mx-auto px-6 text-center space-y-6 animate-fade-in">
            {/* Tool Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-purple-300 text-xs font-bold tracking-wider uppercase shadow-xl">
              <sec.icon size={14} />
              <span>{sec.badge}</span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {sec.title}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed drop-shadow-md">
              {sec.desc}
            </p>

            {/* Usage Stats Tag */}
            <div className="text-xs text-purple-300/80 font-mono flex items-center justify-center gap-1.5">
              <Zap size={13} className="text-yellow-400" />
              <span>{sec.stats}</span>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate(`/dashboard/tools/${sec.slug}`)}
                className={`px-8 py-4 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center gap-3 mx-auto transition-all transform hover:scale-105 cursor-pointer shadow-2xl ${sec.btnColor}`}
              >
                <span>Try {sec.title}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Animated Scroll Down Arrow Hint on Section 1 */}
          {idx === 0 && (
            <div
              onClick={() => scrollToSection(1)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              <span className="text-[11px] font-semibold tracking-widest uppercase">Scroll to Explore</span>
              <ChevronDown size={20} className="animate-bounce text-purple-400" />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
