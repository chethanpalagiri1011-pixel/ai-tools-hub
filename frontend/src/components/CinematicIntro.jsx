import { useEffect, useRef, useState } from 'react';
import { 
  ImageIcon, FileText, MessageSquareCode, Code2, 
  Mic, Video, Zap, Sparkles, Play, Volume2, VolumeX, ArrowRight,
  Layers, Orbit, Cpu, RefreshCw
} from 'lucide-react';

export default function CinematicIntro({ onComplete, autoPlay = true }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Intro Phases: 0: Init, 1: Grid/Stars, 2: Energy & Icons, 3: Core Materialize, 4: Tagline & Complete
  const [phase, setPhase] = useState(0); 
  const [activeIconIndex, setActiveIconIndex] = useState(-1);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [soundEnabled, setSoundEnabled]   = useState(true);

  // 3 Cinematic Animation Themes
  const [currentTheme, setCurrentTheme]   = useState('quantum'); // 'quantum', 'cosmic', 'cyber'

  const AI_CAPABILITIES = [
    { icon: ImageIcon,         title: 'AI Image Generator',  color: 'from-purple-500 to-pink-500', glow: '#a855f7', desc: '4K Visuals' },
    { icon: FileText,          title: 'AI Text Generator',   color: 'from-blue-500 to-cyan-500',   glow: '#3b82f6', desc: 'Smart Copy' },
    { icon: MessageSquareCode, title: 'AI Chat Assistant',   color: 'from-teal-500 to-emerald-500',glow: '#14b8a6', desc: 'Live Intelligence' },
    { icon: Code2,             title: 'AI Code Engine',      color: 'from-indigo-500 to-purple-500',glow: '#6366f1', desc: 'Auto-Coding' },
    { icon: Mic,               title: 'AI Voice Dictation',  color: 'from-amber-500 to-yellow-500',glow: '#f59e0b', desc: 'Real-Time Voice' },
    { icon: Video,             title: 'AI Video Studio',     color: 'from-rose-500 to-red-500',    glow: '#f43f5e', desc: '4K Animation' },
    { icon: Zap,               title: 'AI Productivity',     color: 'from-cyan-500 to-blue-600',   glow: '#06b6d4', desc: 'Automated Flow' },
  ];

  const [soundStyle, setSoundStyle] = useState('orchestra'); // 'orchestra', 'cyberpunk', 'minimal'

  // Synthesize Multi-Style Sound FX via Web Audio API
  const playSound = (type, index = 0) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'whoosh') {
        if (soundStyle === 'orchestra') {
          // Symphonic Riser
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(130.81, now); // C3
          osc2.frequency.setValueAtTime(261.63, now); // C4
          osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.6);
          osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.6);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now); osc2.start(now);
          osc1.stop(now + 0.6); osc2.stop(now + 0.6);
        } else if (soundStyle === 'cyberpunk') {
          // Cyberpunk FM Laser Sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.4);
        } else {
          // Minimal Silk Riser
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.35);
        }
      } else if (type === 'node') {
        if (soundStyle === 'orchestra') {
          // Celestial Orchestra Harp Chimes
          const harpScale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          const freq = harpScale[index % harpScale.length];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.5);
        } else if (soundStyle === 'cyberpunk') {
          // High-Tech Cyber Pulse
          const cyberScale = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
          const freq = cyberScale[index % cyberScale.length];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.25);
        } else {
          // Sleek Glass Pings
          const glassScale = [880, 1046.50, 1318.51, 1567.98, 1760];
          const freq = glassScale[index % glassScale.length];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.3);
        }
      } else if (type === 'shockwave') {
        // Deep Sub-Bass Cinematic Boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(soundStyle === 'cyberpunk' ? 120 : 90, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.0);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 1.0);
  const bgNodesRef = useRef(null);

  // Upbeat 135 BPM High-Tech Arpeggiator Music Engine
  useEffect(() => {
    if (!soundEnabled) {
      if (bgNodesRef.current) {
        clearInterval(bgNodesRef.current.intervalId);
        bgNodesRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (bgNodesRef.current) clearInterval(bgNodesRef.current.intervalId);

      // Bright Melodic Arpeggio Sequences (135 BPM)
      const arpeggioNotes = 
        soundStyle === 'orchestra'
          ? [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25] // C Major Bright Shimmer
          : soundStyle === 'cyberpunk'
          ? [440.00, 554.37, 659.25, 880.00, 659.25, 554.37] // A Major Cyber Synth
          : [587.33, 739.99, 880.00, 1174.66, 880.00, 739.99]; // D Major Crystal Chime

      let noteIdx = 0;

      const playArpeggioStep = () => {
        if (!soundEnabled || !audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        const freq = arpeggioNotes[noteIdx % arpeggioNotes.length];
        noteIdx++;

        osc.type = soundStyle === 'cyberpunk' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      };

      const intervalId = setInterval(playArpeggioStep, 220);
      bgNodesRef.current = { intervalId };

    } catch (e) {
      console.warn("Music arpeggio error:", e);
    }

    return () => {
      if (bgNodesRef.current) {
        clearInterval(bgNodesRef.current.intervalId);
        bgNodesRef.current = null;
      }
    };
  }, [soundEnabled, soundStyle]);

  // 60 FPS Canvas Engine: Particles, Vortex, Stars, Cyber Rain
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

    // Particle field initialization based on Theme
    const particleCount = currentTheme === 'cyber' ? 180 : 140;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * (currentTheme === 'cyber' ? 0.2 : 0.6),
      vy: currentTheme === 'cyber' ? Math.random() * 2 + 1 : (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 0.5,
      color: 
        currentTheme === 'quantum' 
          ? (Math.random() > 0.5 ? '#8b5cf6' : Math.random() > 0.5 ? '#3b82f6' : '#06b6d4')
          : currentTheme === 'cosmic'
          ? (Math.random() > 0.5 ? '#f59e0b' : Math.random() > 0.5 ? '#ec4899' : '#8b5cf6')
          : (Math.random() > 0.5 ? '#10b981' : Math.random() > 0.5 ? '#06b6d4' : '#6366f1'),
      pulse: Math.random() * Math.PI * 2,
    }));

    let startTime = performance.now();

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Deep Space / Cyber Background Radial Gradient
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 80,
        width / 2, height / 2, Math.max(width, height) * 0.85
      );

      if (currentTheme === 'quantum') {
        grad.addColorStop(0, '#0f0b29');
        grad.addColorStop(0.5, '#0c071e');
        grad.addColorStop(1, '#05030a');
      } else if (currentTheme === 'cosmic') {
        grad.addColorStop(0, '#1c0a2a');
        grad.addColorStop(0.5, '#12041d');
        grad.addColorStop(1, '#040108');
      } else {
        grad.addColorStop(0, '#031a19');
        grad.addColorStop(0.5, '#031014');
        grad.addColorStop(1, '#020608');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Particles / Digital Rain / Nebula Vortex
      particles.forEach((p) => {
        p.pulse += 0.03;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentRadius = p.radius + Math.sin(p.pulse) * 0.7;
        const opacity = 0.35 + Math.sin(p.pulse) * 0.35;

        ctx.beginPath();
        if (currentTheme === 'cyber') {
          // Digital rain line streaks
          ctx.rect(p.x, p.y, 1.5, p.radius * 6);
        } else {
          ctx.arc(p.x, p.y, Math.max(0.2, currentRadius), 0, Math.PI * 2);
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Central Core Laser Beams & Pulsing Energy Rings
      if (elapsed > 1.2) {
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.globalAlpha = Math.min(0.6, (elapsed - 1.2) * 0.4);
        ctx.strokeStyle = currentTheme === 'cosmic' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(139, 92, 246, 0.25)';
        ctx.lineWidth = 1.5;

        // Pulsing Orbital Concentric Rings
        for (let r = 1; r <= 3; r++) {
          const ringRadius = (120 * r) + Math.sin(elapsed * 2 + r) * 20;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Swirling Cyber Beams
        const beamAngle = elapsed * 0.8;
        for (let b = 0; b < 4; b++) {
          const angle = beamAngle + (b * Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(angle) * (width * 0.4),
            centerY + Math.sin(angle) * (height * 0.4)
          );
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentTheme]);

  // Timeline Controller: Sequentially trigger animation phases
  useEffect(() => {
    playSound('whoosh');
    const t1 = setTimeout(() => setPhase(1), 1000);   
    const t2 = setTimeout(() => setPhase(2), 2000);   

    const iconTimers = AI_CAPABILITIES.map((_, idx) => 
      setTimeout(() => {
        setActiveIconIndex(idx);
        playSound('node', idx);
      }, 2200 + idx * 300)
    );

    const t3 = setTimeout(() => {
      setPhase(3);
      playSound('shockwave');
    }, 4800);   

    const t4 = setTimeout(() => {
      setTaglineVisible(true);
      setPhase(4);
    }, 6800);   

    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 9500);   

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      iconTimers.forEach(clearTimeout);
    };
  }, [currentTheme]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black select-none font-display">
      {/* 60 FPS Canvas Cinematic Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Cinematic Dark Vignette & Lens Flare Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(4,3,10,0.92) 90%)'
        }}
      />

      {/* TOP CONTROLS: Theme Switcher, Mute & Skip */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between flex-wrap gap-3 pointer-events-auto">
        
        {/* Left: 3 Video Animation Theme Switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
          {[
            { id: 'quantum', label: 'Quantum Matrix', icon: Cpu },
            { id: 'cosmic',  label: 'Cosmic Supernova', icon: Orbit },
            { id: 'cyber',   label: 'Cyber Grid',       icon: Layers },
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => {
                setCurrentTheme(theme.id);
                setPhase(0);
                setActiveIconIndex(-1);
                setTaglineVisible(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentTheme === theme.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <theme.icon size={13} />
              <span className="hidden sm:inline">{theme.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Sound FX Style Selector, Mute & Skip Button */}
        <div className="flex items-center gap-2">
          {/* Sound FX Style Selector */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            {[
              { id: 'orchestra', label: '🎻 Orchestra' },
              { id: 'cyberpunk', label: '⚡ Cyberpunk' },
              { id: 'minimal',   label: '✨ Minimal' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => {
                  setSoundStyle(style.id);
                  playSound('whoosh');
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  soundStyle === style.id 
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all backdrop-blur-md cursor-pointer"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-gray-400" />}
          </button>

          <button
            onClick={() => onComplete && onComplete()}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-purple-600/40 border border-white/20 hover:border-purple-400 transition-all backdrop-blur-md hover:scale-105 shadow-xl group cursor-pointer"
          >
            <span>Skip Experience</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CENTERPIECE VIDEO ANIMATION CONTENT */}
      <div className="relative z-40 w-full h-full flex flex-col items-center justify-center p-6">
        
        {/* REVEALED 7 AI TOOL CAPABILITY CARDS (Phase 2 to 3) */}
        <div className={`transition-all duration-1000 ${phase >= 2 && phase < 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 max-w-5xl mb-12">
            {AI_CAPABILITIES.map((tool, idx) => {
              const isVisible = idx <= activeIconIndex;
              const IconComp = tool.icon;
              return (
                <div
                  key={tool.title}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-700 transform ${
                    isVisible 
                      ? 'opacity-100 translate-y-0 scale-100 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                      : 'opacity-0 translate-y-8 scale-75'
                  }`}
                  style={{
                    background: isVisible ? 'rgba(15, 11, 35, 0.85)' : 'transparent',
                    borderColor: isVisible ? `${tool.glow}77` : 'transparent',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg`}>
                    <IconComp size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white whitespace-nowrap">{tool.title}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{tool.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOGO MATERIALIZATION & 3D VORTEX ZOOM (Phase 3 & 4) */}
        <div 
          className={`flex flex-col items-center justify-center text-center transition-all duration-1000 transform ${
            phase >= 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-12'
          }`}
        >
          {/* Glassmorphism Emblem with Pulsing Neon Aura */}
          <div className="relative mb-6 group cursor-pointer">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 opacity-80 blur-3xl animate-pulse" />
            
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl p-2 flex items-center justify-center border border-white/30 shadow-2xl backdrop-blur-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(124,58,237,0.3))' }}
            >
              <img 
                src="/logo.png" 
                alt="AI Tools Hub Logo" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain filter drop-shadow-[0_0_25px_rgba(168,85,247,0.9)] animate-float" 
              />
            </div>
          </div>

          {/* Title Branding */}
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-3 drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
            AI Tools <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-300 to-pink-500">Hub</span>
          </h1>

          {/* TAGLINE: "CREATE • IMAGINE • AUTOMATE" */}
          <div className={`mt-3 transition-all duration-1000 ${taglineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-base md:text-xl font-bold tracking-[0.35em] uppercase text-cyan-300 font-mono drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]">
              Create • Imagine • Automate
            </p>
          </div>
        </div>

        {/* BOTTOM ENTER PLATFORM BUTTON */}
        <div className={`absolute bottom-10 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
          <button
            onClick={() => onComplete && onComplete()}
            className="btn-primary py-3.5 px-9 text-sm font-extrabold flex items-center gap-3 shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:shadow-[0_0_50px_rgba(124,58,237,0.9)] transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <span>Enter AI Tools Hub</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
