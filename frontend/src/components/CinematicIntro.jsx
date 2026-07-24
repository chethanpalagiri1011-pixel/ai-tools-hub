import { useEffect, useRef, useState } from 'react';
import { 
  ImageIcon, FileText, MessageSquareCode, Code2, 
  Mic, Video, Zap, Sparkles, Play, Volume2, VolumeX, ArrowRight
} from 'lucide-react';

export default function CinematicIntro({ onComplete, autoPlay = true }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: Init, 1: Circuits & Particles, 2: Energy Pulse & Icons, 3: Logo Materialize, 4: Tagline & Complete
  const [activeIconIndex, setActiveIconIndex] = useState(-1);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  const AI_CAPABILITIES = [
    { icon: ImageIcon,         title: 'AI Image Generator',  color: 'from-purple-500 to-pink-500', glow: '#a855f7' },
    { icon: FileText,          title: 'AI Text Generator',   color: 'from-blue-500 to-cyan-500',   glow: '#3b82f6' },
    { icon: MessageSquareCode, title: 'AI Chat',             color: 'from-teal-500 to-emerald-500',glow: '#14b8a6' },
    { icon: Code2,             title: 'AI Code Assistant',   color: 'from-indigo-500 to-purple-500',glow: '#6366f1' },
    { icon: Mic,               title: 'AI Voice',            color: 'from-amber-500 to-yellow-500',glow: '#f59e0b' },
    { icon: Video,             title: 'AI Video',            color: 'from-rose-500 to-red-500',    glow: '#f43f5e' },
    { icon: Zap,               title: 'AI Productivity',     color: 'from-cyan-500 to-blue-600',   glow: '#06b6d4' },
  ];

  // Canvas particle and circuit animation system (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle field initialization
    const particleCount = 120;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1000,
      radius: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#8b5cf6' : Math.random() > 0.5 ? '#3b82f6' : '#06b6d4',
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Circuit grid nodes
    const nodes = [];
    const gridCols = 8;
    const gridRows = 5;
    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        nodes.push({
          x: (width / (gridCols + 1)) * (i + 1),
          y: (height / (gridRows + 1)) * (j + 1),
          active: false,
          glow: 0,
        });
      }
    }

    let startTime = performance.now();

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient background
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width * 0.8
      );
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(0.5, '#0d091a');
      grad.addColorStop(1, '#05040a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating 3D Particles
      particles.forEach((p) => {
        p.pulse += 0.03;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentRadius = p.radius + Math.sin(p.pulse) * 0.8;
        const opacity = 0.3 + Math.sin(p.pulse) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.2, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Holographic Circuits & Energy Streams
      ctx.globalAlpha = Math.min(1, elapsed * 0.4);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < width * 0.18) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Energy Pulse traveling through circuits
      if (elapsed > 1.5) {
        const pulseProgress = ((elapsed - 1.5) * 0.8) % 1;
        const pulseX = width * pulseProgress;
        const pulseY = height / 2 + Math.sin(pulseProgress * Math.PI * 4) * (height * 0.2);

        const pulseGrad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 150);
        pulseGrad.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        pulseGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.4)');
        pulseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sequence Timeline Controller (7-10 Seconds)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);   // Circuits & Grid fade in
    const t2 = setTimeout(() => setPhase(2), 2200);   // Energy Pulse & Icon revelation

    // Sequentially reveal each of the 7 AI Capability icons
    const iconTimers = AI_CAPABILITIES.map((_, idx) => 
      setTimeout(() => setActiveIconIndex(idx), 2400 + idx * 350)
    );

    const t3 = setTimeout(() => setPhase(3), 5200);   // Camera zoom & Logo materialization
    const t4 = setTimeout(() => {
      setTaglineVisible(true);
      setPhase(4);
    }, 7200);                                         // Tagline fade-in "Create. Imagine. Automate."

    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 9800);                                         // Completion callback

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      iconTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black select-none font-display">
      {/* 60 FPS Canvas Particle & Energy Grid Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Futuristic Vignette & Lens Glow Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(5,4,12,0.85) 90%)'
        }}
      />

      {/* TOP HEADER CONTROLS */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 tracking-widest uppercase bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20 backdrop-blur-md">
          <Sparkles size={13} className="animate-spin text-purple-300" />
          <span>Cinematic Intro</span>
        </div>

        <button
          onClick={() => onComplete && onComplete()}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-purple-600/30 border border-white/20 hover:border-purple-400 transition-all duration-300 backdrop-blur-md hover:scale-105 shadow-lg group"
        >
          <span>Skip to Experience</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* CENTERPIECE ANIMATION CONTENT */}
      <div className="relative z-40 w-full h-full flex flex-col items-center justify-center p-6">
        
        {/* REVEALED 7 AI TOOL ICONS ORBITAL HARMONY (Phase 2 to 3) */}
        <div className={`transition-all duration-1000 ${phase >= 2 && phase < 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-4xl mb-12">
            {AI_CAPABILITIES.map((tool, idx) => {
              const isVisible = idx <= activeIconIndex;
              const IconComp = tool.icon;
              return (
                <div
                  key={tool.title}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-700 transform ${
                    isVisible 
                      ? 'opacity-100 translate-y-0 scale-100 shadow-[0_0_25px_rgba(168,85,247,0.35)]' 
                      : 'opacity-0 translate-y-8 scale-75'
                  }`}
                  style={{
                    background: isVisible ? 'rgba(18, 14, 38, 0.85)' : 'transparent',
                    borderColor: isVisible ? `${tool.glow}66` : 'transparent',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md`}>
                    <IconComp size={18} />
                  </div>
                  <span className="text-xs font-semibold text-gray-200 whitespace-nowrap">{tool.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOGO MATERIALIZATION & ZOOM EFFECT (Phase 3 & 4) */}
        <div 
          className={`flex flex-col items-center justify-center text-center transition-all duration-1000 transform ${
            phase >= 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-12'
          }`}
        >
          {/* Glassmorphism Futuristic Logo Emblem */}
          <div className="relative mb-6 group cursor-pointer">
            {/* Glowing Aura Ring */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 opacity-75 blur-2xl animate-pulse" />
            
            <div 
              className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl p-1 flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(124,58,237,0.25))' }}
            >
              <img 
                src="/logo.png" 
                alt="AI Tools Hub Logo" 
                className="w-20 h-20 md:w-28 md:h-28 object-contain filter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-float" 
              />
            </div>
          </div>

          {/* Title Branding */}
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-3 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
            AI Tools <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-500">Hub</span>
          </h1>

          {/* TAGLINE: "Create. Imagine. Automate." (Phase 4) */}
          <div className={`mt-2 transition-all duration-1000 ${taglineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-base md:text-xl font-medium tracking-[0.3em] uppercase text-cyan-300 font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              Create • Imagine • Automate
            </p>
          </div>
        </div>

        {/* BOTTOM ENTER DASHBOARD ACTION BUTTON */}
        <div className={`absolute bottom-10 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
          <button
            onClick={() => onComplete && onComplete()}
            className="btn-primary py-3.5 px-8 text-sm font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_45px_rgba(124,58,237,0.8)] transition-all duration-300 hover:scale-105"
          >
            <span>Enter AI Tools Hub</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
