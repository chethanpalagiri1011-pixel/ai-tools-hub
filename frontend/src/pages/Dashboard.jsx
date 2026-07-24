import { useNavigate } from 'react-router-dom';
import {
  ImageIcon, FileText, MessageSquare, Sparkles,
  Zap, TrendingUp, Clock, Star, ArrowRight, Activity, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import CinematicIntro from '../components/CinematicIntro';

const TOOLS = [
  { id: 'image',   icon: ImageIcon,     label: 'Image Generator', desc: 'Text to image',       color: 'from-purple-500 to-pink-500',   count: '1.2M' },
  { id: 'summary', icon: FileText,      label: 'Text Summarizer',  desc: 'Smart condensing',    color: 'from-blue-500 to-cyan-500',     count: '420K' },
  { id: 'caption', icon: MessageSquare, label: 'Caption Generator', desc: 'Engaging copy',      color: 'from-teal-500 to-green-500',    count: '310K' },
  { id: 'prompt',  icon: Sparkles,      label: 'Prompt Enhancer',  desc: 'Better AI results',  color: 'from-yellow-500 to-orange-500', count: '89K' },
];

const QUICK_STATS = [
  { icon: Zap,       label: 'Credits Left',    key: 'credits',     suffix: '',  color: 'text-yellow-400' },
  { icon: Activity,  label: 'Generations',     static: 0,          suffix: '',  color: 'text-purple-400' },
  { icon: Star,      label: 'Saved Items',     static: 0,          suffix: '',  color: 'text-blue-400' },
  { icon: TrendingUp,label: 'This Week',       static: 0,          suffix: '',  color: 'text-green-400' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { history, setActiveTool } = useApp();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);

  const recentHistory = history.slice(0, 4);

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);
    navigate('/dashboard/tools');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (showIntro) {
    return <CinematicIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative p-6 rounded-2xl overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(139,92,246,0.3)' }}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl -translate-y-1/2 translate-x-1/4"
             style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-purple-300 text-sm mb-1">{greeting} 👋</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              You have <span className="text-purple-300 font-semibold">{user?.credits} credits</span> remaining
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowIntro(true)} 
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-lg cursor-pointer">
              <Play size={14} className="fill-purple-300" /> Watch Intro (7s)
            </button>
            <button onClick={() => navigate('/dashboard/tools')}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
              Start Creating
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Credits Left',  value: user?.credits,    icon: Zap,        color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
          { label: 'Generations',   value: history.length,   icon: Activity,   color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Saved Items',   value: history.filter(h=>h.saved).length, icon: Star, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
          { label: 'This Week',     value: history.filter(h => {
              const d = new Date(h.createdAt);
              const now = new Date();
              return (now - d) < 7 * 24 * 60 * 60 * 1000;
            }).length,              icon: TrendingUp, color: 'text-green-400', bg: 'rgba(16,185,129,0.1)' },
        ].map(stat => (
          <div key={stat.label}
            className="p-4 rounded-2xl border border-white/8 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: stat.bg }}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-white">{stat.value ?? 0}</p>
              <p className="text-gray-500 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">AI Tools</h2>
          <button onClick={() => navigate('/dashboard/tools')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <button key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="p-5 rounded-2xl border border-white/8 text-left group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon size={18} className="text-white" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">{tool.label}</p>
              <p className="text-gray-500 text-xs">{tool.desc}</p>
              <p className="text-gray-600 text-xs mt-3 flex items-center gap-1">
                <Clock size={10} /> {tool.count} uses
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white">Recent Activity</h2>
            <button onClick={() => navigate('/dashboard/history')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View history <ArrowRight size={12} />
            </button>
          </div>
          {recentHistory.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/8 text-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Activity size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No generations yet</p>
              <p className="text-gray-600 text-xs mt-1">Start creating with our AI tools</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.map(item => (
                <div key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: 'rgba(139,92,246,0.15)' }}>
                    {item.type === 'image'   ? <ImageIcon size={14} className="text-purple-400" /> :
                     item.type === 'summary' ? <FileText size={14} className="text-blue-400" /> :
                     item.type === 'caption' ? <MessageSquare size={14} className="text-teal-400" /> :
                     <Sparkles size={14} className="text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.prompt || item.text?.slice(0,40) || item.topic || 'Generation'}</p>
                    <p className="text-gray-600 text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Info */}
        <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="font-display text-lg font-semibold text-white mb-4">Your Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold font-display gradient-text">{user?.plan || 'Free'}</p>
              <p className="text-gray-500 text-sm">Current plan</p>
            </div>
            <button onClick={() => navigate('/dashboard/settings')}
              className="btn-secondary text-xs py-1.5 px-3">Upgrade</button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Credits used</span>
              <span>{Math.max(0, (user?.plan === 'Pro' ? 500 : 50) - (user?.credits || 0))} / {user?.plan === 'Pro' ? 500 : 50}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full transition-all"
                   style={{
                     width: `${Math.min(100, Math.max(0, ((user?.plan === 'Pro' ? 500 : 50) - (user?.credits || 0)) / (user?.plan === 'Pro' ? 500 : 50) * 100))}%`,
                     background: 'linear-gradient(90deg, #7c3aed, #3b82f6)'
                   }} />
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Credits reset monthly. <span className="text-purple-400 cursor-pointer">View usage →</span>
          </p>
        </div>
      </div>
    </div>
  );
}
