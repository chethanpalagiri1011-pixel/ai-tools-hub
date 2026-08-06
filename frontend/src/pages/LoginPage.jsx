import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, User, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back! Signed in successfully ✨');
        navigate('/dashboard');
      } else {
        toast.error(res.error || 'Failed to sign in. Check your credentials.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword, label) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setLoading(true);
    const res = await login(quickEmail, quickPassword);
    setLoading(false);
    if (res.success) {
      toast.success(`Signed in as ${label}! 🚀`);
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = () => {
    toast((t) => (
      <div className="space-y-2">
        <p className="font-bold text-white text-sm">🔒 Password Reset</p>
        <p className="text-xs text-gray-300">
          Enter your email on the login screen and click below to send a instant reset link. Or use <b>Quick Demo Login</b> for instant access!
        </p>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            if (email.trim()) {
              toast.success(`Reset instructions sent to ${email}! Check your inbox.`);
            } else {
              toast.error('Please type your email address first!');
            }
          }}
          className="w-full text-xs font-bold py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          Send Reset Link
        </button>
      </div>
    ), { duration: 6000 });
  };

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main Card */}
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-2xl"
          style={{ background: 'rgba(13, 13, 26, 0.85)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/30">
              <img src="/logo.png" alt="AI Tools Hub Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to access your AI toolkit & credits</p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" /> Quick 1-Click Login
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('chethanpalagiri1011@gmail.com', 'owner123', 'Owner Pro')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Shield size={14} />
                <span>Owner Pro</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('demo@aitoolshub.com', 'demo123', 'Demo User')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <User size={14} />
                <span>Demo User</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0d0d1a] px-3 text-xs text-gray-500 font-medium uppercase tracking-wider absolute">
              or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-purple-500/25 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-xs text-gray-400 border-t border-white/5 pt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Create Account Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
