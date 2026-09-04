import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Heart, Share2, MessageCircle, Flame } from 'lucide-react';

/**
 * 100% Code-Based Device Mockup & Animated Text Reveal Component
 * - Styled Browser/Phone Frame with interactive tool preview animations
 * - Animated headline text reveal with staggered slide-in
 * - Floating blurred glowing accent orb for depth
 * - Zero external media files, lightweight 60fps CSS animations
 */

const SECTION_CONFIG = {
  image: {
    headline: 'Generate Anything, Instantly',
    badge: '4K AI Vision Engine',
    accentBlob: 'from-purple-600/30 via-pink-600/20 to-transparent',
    borderColor: 'border-purple-500/30',
    headerColor: 'bg-purple-950/40',
    titleColor: 'text-purple-300',
  },
  summary: {
    headline: 'Condense Reading in Seconds',
    badge: 'Smart Summary Engine',
    accentBlob: 'from-blue-600/30 via-cyan-600/20 to-transparent',
    borderColor: 'border-blue-500/30',
    headerColor: 'bg-blue-950/40',
    titleColor: 'text-blue-300',
  },
  caption: {
    headline: 'Viral Social Copy in 1 Click',
    badge: 'Multi-Tone Copy Engine',
    accentBlob: 'from-teal-600/30 via-emerald-600/20 to-transparent',
    borderColor: 'border-teal-500/30',
    headerColor: 'bg-teal-950/40',
    titleColor: 'text-teal-300',
  },
  prompt: {
    headline: 'Transform Ideas into Masterpieces',
    badge: 'Prompt Optimizer Engine',
    accentBlob: 'from-amber-600/30 via-orange-600/20 to-transparent',
    borderColor: 'border-amber-500/30',
    headerColor: 'bg-amber-950/40',
    titleColor: 'text-amber-300',
  },
};

export default function DeviceMockupShowcase({ toolId, isActive }) {
  const [frameStep, setFrameStep] = useState(0);
  const config = SECTION_CONFIG[toolId] || SECTION_CONFIG.image;

  // Animation step loop inside mockup frame
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFrameStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6 pointer-events-none">
      {/* 1. Floating Glowing Backdrop Blob */}
      <div
        className={`absolute -inset-10 rounded-full bg-gradient-to-r ${config.accentBlob} blur-3xl opacity-60 animate-pulse pointer-events-none transition-all duration-1000`}
      />

      {/* 2. Animated Headline Text Reveal */}
      <div
        className={`text-center space-y-2 transition-all duration-700 transform ${
          isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border ${config.borderColor} ${config.titleColor} backdrop-blur-md`}>
          <Sparkles size={12} /> {config.badge}
        </span>
        <h3 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight font-display drop-shadow-md">
          {config.headline}
        </h3>
      </div>

      {/* 3. Browser Device Mockup Frame */}
      <div
        className={`w-full max-w-xl rounded-2xl border ${config.borderColor} bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-700 transform ${
          isActive ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        {/* Browser Top Navigation Bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b border-white/10 ${config.headerColor}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <div className="px-3 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-gray-400 border border-white/5">
            ai-tools.hub/{toolId}
          </div>
          <div className="w-12" />
        </div>

        {/* Browser Body Animated Content Area */}
        <div className="p-5 min-h-[220px] flex flex-col justify-center relative bg-gradient-to-b from-white/[0.02] to-transparent">
          
          {/* Mockup Content 1: AI Image Generator */}
          {toolId === 'image' && (
            <div className="space-y-3">
              <div className="relative h-36 rounded-xl overflow-hidden border border-purple-500/20 bg-purple-950/20 flex items-center justify-center">
                {/* Shimmer Scan Line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer" />
                
                {/* Generated Artwork Preview Animation */}
                <div className={`transition-all duration-1000 ${frameStep > 0 ? 'scale-100 opacity-100 blur-0' : 'scale-90 opacity-20 blur-md'}`}>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles size={36} className="text-white animate-spin-slow" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-purple-200 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md">
                  <span>Prompt: Lord Ganesha 8K</span>
                  <span className="text-green-400 font-bold">100% Generated ✨</span>
                </div>
              </div>
            </div>
          )}

          {/* Mockup Content 2: Document Summarizer */}
          {toolId === 'summary' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-blue-300 font-semibold border-b border-blue-500/20 pb-2">
                  <span>Summary Report</span>
                  <span className="text-blue-400 font-mono">0.4s Fast</span>
                </div>
                
                {/* Collapsing Paragraph into 3 Bullet Points */}
                <div className="space-y-2">
                  {[
                    'Executive summary generated in 0.4 seconds',
                    'Key takeaways & actionable points extracted cleanly',
                    '85% document size reduction with 100% accuracy',
                  ].map((bullet, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-xs transition-all duration-500 ${
                        frameStep >= idx ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                    >
                      <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mockup Content 3: Social Caption Generator */}
          {toolId === 'caption' && (
            <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-950/20 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs">
                  AI
                </div>
                <span className="text-xs font-bold text-white">@aitoolshub</span>
              </div>

              {/* Typing Caption Effect */}
              <p className="text-xs text-gray-200 leading-relaxed font-mono">
                "Creating magic with AI Tools Hub! ✨ Multi-tone captions & viral hashtags generated in seconds."
              </p>

              {/* Popping Hashtag Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#viral', '#trending', '#aitools', '#creative'].map((tag, idx) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 border border-teal-500/40 text-teal-300 transition-all duration-300 ${
                      frameStep >= idx ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mockup Content 4: AI Prompt Enhancer */}
          {toolId === 'prompt' && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 space-y-3">
              <div className="text-[11px] text-amber-400/80 font-mono">Original: "A cat in a chair"</div>
              
              {/* Expanding Enhanced Prompt Sweep Effect */}
              <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 space-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-shimmer" />
                <div className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>Enhanced Masterpiece Prompt:</span>
                </div>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">
                  "Photorealistic cinematic portrait of a majestic cat sitting on an ornate chair, 8k resolution, volumetric studio lighting, masterpiece"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-300">
                <span>Prompt Quality Score:</span>
                <span className="font-bold text-amber-400">99 / 100 🔥</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
