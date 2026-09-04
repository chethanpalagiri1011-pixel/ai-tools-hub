import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Luxury 3D Product Showcase Component (Matched to User's Reference Layout)
 * - 2-Column Split: Bold Luxury Typography (Left) + Floating 3D Hero Object (Right)
 * - Floating 3D Levitation Motion (`animate-float`)
 * - High-contrast glassmorphism card with dynamic tool output preview
 */

const SECTION_DATA = {
  image: {
    badge: '4K AI VISION ENGINE',
    headline: 'Elevate Your Visuals.',
    sub: 'Turn your imagination into stunning 4K photorealistic artwork, digital paintings, and sketches in seconds.',
    slug: 'image-gen',
    title: 'AI Image Generator',
    btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30',
    accentOrb: 'from-purple-500/40 via-pink-500/20 to-transparent',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-300',
  },
  summary: {
    badge: 'DOCUMENT INTELLIGENCE',
    headline: 'Master Information Fast.',
    sub: 'Instantly condense long articles, financial reports, and complex documents into key bullet-point takeaways.',
    slug: 'summarizer',
    title: 'Document Summarizer',
    btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30',
    accentOrb: 'from-blue-500/40 via-cyan-500/20 to-transparent',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-300',
  },
  caption: {
    badge: 'VIRAL COPY ENGINE',
    headline: 'Craft Viral Social Copy.',
    sub: 'Generate engaging social media copy and curated hashtag packages for Instagram, X, TikTok, and LinkedIn.',
    slug: 'captions',
    title: 'Social Caption Generator',
    btnColor: 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/30',
    accentOrb: 'from-teal-500/40 via-emerald-500/20 to-transparent',
    borderColor: 'border-teal-500/30',
    textColor: 'text-teal-300',
  },
  prompt: {
    badge: 'PROMPT OPTIMIZER ENGINE',
    headline: 'Supercharge Your Prompts.',
    sub: 'Enrich simple text ideas with high-resolution lighting tags, camera settings, and negative prompts.',
    slug: 'prompt-plus',
    title: 'AI Prompt Enhancer',
    btnColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30',
    accentOrb: 'from-amber-500/40 via-orange-500/20 to-transparent',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-300',
  },
};

export default function DeviceMockupShowcase({ toolId = 'image', isActive = true }) {
  const [frameStep, setFrameStep] = useState(0);
  const navigate = useNavigate();
  const data = SECTION_DATA[toolId] || SECTION_DATA.image;

  // Frame animation loop inside 3D hero object
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFrameStep((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-6 lg:gap-10 items-center min-h-[70vh]">
      
      {/* LEFT COLUMN: Bold Luxury Typography & CTA Button */}
      <div className={`lg:col-span-6 space-y-5 text-left transition-all duration-700 transform ${
        isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Sparkles size={14} className={data.textColor} />
          <span className={`text-xs font-bold uppercase tracking-wider ${data.textColor}`}>
            {data.badge}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display leading-[1.1]">
          {data.headline}
        </h1>

        <p className="text-gray-300 text-sm sm:text-base max-w-md leading-relaxed font-normal">
          {data.sub}
        </p>

        <div className="pt-2 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate(`/dashboard/tools/${data.slug}`)}
            className={`px-7 py-3.5 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center gap-3 transition-all transform hover:scale-105 cursor-pointer shadow-2xl ${data.btnColor}`}
          >
            <span>Try {data.title}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Sleek 3D Levitating Glassmorphic Device Frame */}
      <div className={`lg:col-span-6 flex justify-center relative transition-all duration-1000 transform ${
        isActive ? 'scale-100 opacity-100 translate-x-0' : 'scale-90 opacity-0 translate-x-8'
      }`}>
        {/* Floating Accent Radial Aura Orb behind object */}
        <div className={`absolute -inset-10 rounded-full bg-gradient-to-tr ${data.accentOrb} blur-3xl opacity-70 animate-pulse pointer-events-none`} />

        {/* 3D Floating Glassmorphism Tablet/Smartphone Frame Container */}
        <div className="relative w-full max-w-sm sm:max-w-md rounded-[28px] border-2 border-white/20 bg-gradient-to-b from-white/10 via-black/85 to-black/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),_0_0_30px_rgba(139,92,246,0.25)] overflow-hidden transition-all duration-500 hover:rotate-1 animate-float">
          
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block shadow" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block shadow" />
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-3 py-0.5 rounded-full border border-white/5">
              ai-tools.hub/{data.slug}
            </span>
          </div>

          {/* Interactive Tool Preview Content */}
          <div className="p-6 min-h-[260px] flex flex-col justify-center relative">
            
            {/* Tool 1 Preview: AI Image Generator */}
            {toolId === 'image' && (
              <div className="space-y-4">
                <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-500/30 bg-purple-950/30 flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer" />
                  
                  <div className={`transition-all duration-1000 ${frameStep > 0 ? 'scale-100 opacity-100 blur-0' : 'scale-90 opacity-20 blur-md'}`}>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                      <Sparkles size={44} className="text-white animate-spin-slow" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-purple-200 bg-black/70 px-3.5 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                    <span>Prompt: Lord Ganesha 8K</span>
                    <span className="text-green-400 font-bold">100% Generated ✨</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tool 2 Preview: Document Summarizer */}
            {toolId === 'summary' && (
              <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-950/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold border-b border-blue-500/20 pb-2">
                  <span>Executive Summary</span>
                  <span className="text-cyan-400 font-mono">0.4s AI Fast</span>
                </div>
                
                <div className="space-y-2.5 pt-1">
                  {[
                    'Executive summary generated in 0.4 seconds',
                    'Key takeaways & actionable insights extracted',
                    '85% text size reduction with 100% accuracy',
                  ].map((bullet, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 text-xs transition-all duration-500 ${
                        frameStep >= idx ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                    >
                      <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 font-medium">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool 3 Preview: Social Caption Generator */}
            {toolId === 'caption' && (
              <div className="p-5 rounded-2xl border border-teal-500/30 bg-teal-950/30 space-y-3.5 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs shadow">
                    AI
                  </div>
                  <span className="text-xs font-bold text-white">@aitoolshub</span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed font-mono bg-black/30 p-3 rounded-xl border border-white/5">
                  "Creating magic with AI Tools Hub! ✨ Multi-tone captions & viral hashtags generated in seconds."
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {['#viral', '#trending', '#aitools', '#creative'].map((tag, idx) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 border border-teal-500/40 text-teal-300 transition-all duration-300 ${
                        frameStep >= idx ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tool 4 Preview: AI Prompt Enhancer */}
            {toolId === 'prompt' && (
              <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/30 space-y-3 shadow-inner">
                <div className="text-xs text-amber-400/80 font-mono">Input: "A cat in a chair"</div>
                
                <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/40 space-y-1.5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-shimmer" />
                  <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    <Flame size={15} className="text-amber-400" />
                    <span>Enhanced Masterpiece Prompt:</span>
                  </div>
                  <p className="text-xs text-gray-200 font-mono leading-relaxed">
                    "Photorealistic cinematic portrait of a majestic cat sitting on an ornate chair, 8k resolution, volumetric studio lighting, masterpiece"
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
                  <span>Quality Score:</span>
                  <span className="font-bold text-amber-400">99 / 100 🔥</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
