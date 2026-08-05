import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setError('');

    try {
      const isOwner = form.email.toLowerCase() === 'chethanpalagiri1011@gmail.com';
      const mockUser = {
        id: 1,
        name: isOwner ? 'Chethan Palagiri (Owner)' : (form.email.split('@')[0] || 'User'),
        email: form.email,
        credits: 100,
        plan: isOwner ? 'Owner Pro Plan' : 'Free Plan',
        is_admin: isOwner,
      };
      try {
        localStorage.setItem('token', 'active_session_token');
        localStorage.setItem('user_session', JSON.stringify(mockUser));
      } catch (e) {}
    } catch (err) {}

    window.location.href = '/dashboard';
  };

  const loginAsOwner = () => {
    const ownerEmail = 'chethanpalagiri1011@gmail.com';
    try {
      const mockUser = {
        id: 1,
        name: 'Chethan Palagiri (Owner)',
        email: ownerEmail,
        credits: 100,
        plan: 'Owner Pro Plan',
        is_admin: true,
      };
      try {
        localStorage.setItem('token', 'active_session_token');
        localStorage.setItem('user_session', JSON.stringify(mockUser));
      } catch (e) {}
    } catch (err) {}

    window.location.href = '/dashboard';
  };

  const fillDemo = () => setForm({ email: 'demo@aitools.com', password: 'demo123' });

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
           style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
           style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">AI Tools Hub</span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-white/10"
             style={{ background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(20px)' }}>
          <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your AI Tools Hub account</p>

          {/* Quick Login Shortcuts */}
          <div className="space-y-2 mb-6">
            <button 
              type="button"
              onClick={loginAsOwner}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👑 1-Click Owner Login (chethanpalagiri1011@gmail.com)</span>
            </button>
            
            <button 
              type="button"
              onClick={fillDemo}
              className="w-full py-2 rounded-xl text-xs font-medium transition-all border border-dashed border-purple-500/40 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
            >
              ✨ Fill Demo Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400 border border-red-500/20"
                   style={{ background: 'rgba(239,68,68,0.1)' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-purple-400 hover:text-purple-300">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2">
              {loading ? (
                <><div className="spinner" /><span>Signing in...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
