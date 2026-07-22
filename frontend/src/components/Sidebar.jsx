import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wand2, History, User, Settings,
  Zap, X, ImageIcon, FileText, MessageSquare, Sparkles, Images, Gamepad2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/dashboard/tools',        icon: Wand2,            label: 'AI Tools' },
  { to: '/dashboard/my-images',    icon: Images,           label: 'My Images 🖼️' },
  { to: '/dashboard/arcade',       icon: Gamepad2,         label: '🎮 Earn Credits' },
  { to: '/dashboard/admin',        icon: ShieldCheck,      label: '👑 Owner Panel' },
  { to: '/dashboard/history',      icon: History,          label: 'History' },
  { to: '/dashboard/profile',      icon: User,             label: 'Profile' },
  { to: '/dashboard/settings',     icon: Settings,         label: 'Settings' },
];

const tools = [
  { id: 'image',   icon: ImageIcon,     label: 'Image Gen',    color: 'text-purple-400' },
  { id: 'summary', icon: FileText,      label: 'Summarizer',   color: 'text-blue-400' },
  { id: 'caption', icon: MessageSquare, label: 'Captions',     color: 'text-teal-400' },
  { id: 'prompt',  icon: Sparkles,      label: 'Prompt Boost', color: 'text-yellow-400' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { setActiveTool } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-64 flex flex-col
      transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      border-r border-white/5
    `} style={{ background: 'rgba(5,5,20,0.95)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AI Tools Hub" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-white text-lg">AI Tools Hub</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
               ${isActive
                 ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
               }`
            }
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {/* Quick Tool Access */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs text-gray-600 uppercase tracking-wider mb-2">Quick Tools</p>
          {tools.map(({ id, icon: Icon, label, color }) => (
            <NavLink key={label} to="/dashboard/tools"
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
              onClick={() => {
                setActiveTool(id);
                if (window.innerWidth < 1024) onClose();
              }}
            >
              <Icon size={16} className={color} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Card */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.plan} Plan</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="mt-2 w-full text-xs text-gray-600 hover:text-red-400 transition-colors py-1 text-center">
          Sign out
        </button>
      </div>
    </aside>
  );
}
