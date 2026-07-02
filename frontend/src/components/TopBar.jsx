import { Menu, Bell, Search, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 flex-shrink-0"
            style={{ background: 'rgba(5,5,20,0.8)', backdropFilter: 'blur(20px)' }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all lg:hidden">
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
             style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Search size={16} />
          <span>Search tools...</span>
          <span className="ml-4 text-xs border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Credits Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
             style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
          <Zap size={12} />
          <span>{user?.credits || 0} credits</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
        </button>

        {/* Avatar */}
        <button onClick={() => navigate('/dashboard/profile')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-purple-500/50 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  );
}
