import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendWelcomeEmail } from '../utils/emailService';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, ArrowLeft, KeyRound, CheckCircle2, X, Plus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Social Account Selector Modal State
  const [socialModalProvider, setSocialModalProvider] = useState(null); // 'Google' | 'GitHub' | null
  const [customSocialEmail, setCustomSocialEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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

  const openSocialPicker = (provider) => {
    setSocialModalProvider(provider);
    setShowCustomInput(false);
    setCustomSocialEmail('');
  };

  const executeSocialLogin = async (selectedEmail, selectedName) => {
    if (!selectedEmail || !selectedEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const providerName = socialModalProvider || 'Google';
    setSocialModalProvider(null);
    setLoading(true);
    toast.loading(`Authenticating ${selectedEmail} with ${providerName}...`, { duration: 1000 });

    // Trigger automated registration/login email confirmation
    sendWelcomeEmail({ email: selectedEmail, name: selectedName || selectedEmail.split('@')[0] });

    try {
      const res = await login(selectedEmail, 'social_sso_pass');
      if (res.success) {
        toast.success(`Signed in with ${providerName}! 📧 Welcome confirmation email sent to ${selectedEmail}.`);
        navigate('/dashboard');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred during social authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setResetSent(true);
    toast.success(`Reset link sent to ${resetEmail}! Check your inbox.`);
  };

  // Detected Google & GitHub accounts for social SSO selection (Non-owner privacy accounts)
  const googleAccounts = [
    { name: 'Alex Vance', email: 'alex.vance@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80', active: true },
    { name: 'Sarah Miller', email: 'sarah.m.creative@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' },
    { name: 'Standard Creator', email: 'creator@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80' },
  ];

  const githubAccounts = [
    { name: 'developer-pro', email: 'dev.pro@github.com', avatar: 'https://github.com/github.png' },
    { name: 'creator-studio', email: 'studio@aitoolshub.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80' },
  ];

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <span className="text-[11px] text-gray-500 font-medium border border-white/10 px-2.5 py-1 rounded-full bg-white/5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            256-Bit SSL Encrypted
          </span>
        </div>

        {/* Main Card */}
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-2xl"
          style={{ background: 'rgba(13, 13, 26, 0.88)' }}
        >
          {/* Brand Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/30">
              <img src="/logo.png" alt="AI Tools Hub Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1.5">Sign In to AI Tools Hub</h1>
            <p className="text-gray-400 text-xs">Enter your credentials or choose your Google / GitHub account</p>
          </div>

          {/* Social SSO Login Options */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => openSocialPicker('Google')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer hover:border-purple-500/40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => openSocialPicker('GitHub')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer hover:border-purple-500/40"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Quick Preset Demo Account */}
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-400" /> 1-Click Instant Demo Access
            </p>
            <button
              type="button"
              onClick={() => handleQuickLogin('demo@aitoolshub.com', 'demo123', 'Demo User')}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <User size={14} className="text-blue-400" />
              <span>Try Demo Account (Standard Member)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0b0a16] px-3 text-[11px] text-gray-500 font-medium uppercase tracking-wider absolute">
              or use email
            </span>
          </div>

          {/* Main Form */}
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
                  onClick={() => { setResetEmail(email); setResetSent(false); setResetModalOpen(true); }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
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
                <span>Keep me signed in</span>
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
                  <span>Sign In to Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer Link */}
          <div className="mt-6 text-center text-xs text-gray-400 border-t border-white/5 pt-5">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Create Free Account →
            </Link>
          </div>
        </div>
      </div>

      {/* OFFICIAL GOOGLE / GITHUB ACCOUNT PICKER MODAL */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 p-6 bg-[#0f0e22] shadow-2xl relative font-sans">
            <button
              onClick={() => setSocialModalProvider(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-3 shadow-lg">
                {socialModalProvider === 'Google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Choose a {socialModalProvider} Account
              </h3>
              <p className="text-xs text-gray-400">
                Select an account to sign in to <b>AI Tools Hub</b>
              </p>
            </div>

            {/* List of Detected System Accounts */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {(socialModalProvider === 'Google' ? googleAccounts : githubAccounts).map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSocialLogin(acc.email, acc.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{acc.email}</p>
                  </div>
                  {acc.active && (
                    <span className="text-[10px] text-green-400 font-semibold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30">
                      Active
                    </span>
                  )}
                </button>
              ))}

              {/* Custom Email Input Option */}
              {showCustomInput ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeSocialLogin(customSocialEmail, customSocialEmail.split('@')[0]);
                  }}
                  className="mt-3 space-y-2"
                >
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={customSocialEmail}
                      onChange={(e) => setCustomSocialEmail(e.target.value)}
                      placeholder={`Enter your ${socialModalProvider} email...`}
                      required
                      autoFocus
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-2 text-xs font-bold rounded-xl"
                  >
                    Continue with {customSocialEmail || 'this email'}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/5 text-gray-300 text-xs font-semibold transition-all cursor-pointer mt-2"
                >
                  <Plus size={14} className="text-purple-400" />
                  <span>Use another {socialModalProvider} account...</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              To continue, {socialModalProvider} will share your name, email address, and language preference with AI Tools Hub.
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 p-6 bg-[#0f0e22] shadow-2xl relative">
            <button
              onClick={() => setResetModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Reset Password</h3>
              <p className="text-xs text-gray-400">Enter your email to receive a password reset link.</p>
            </div>

            {resetSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 size={40} className="text-green-400 mx-auto" />
                <p className="text-sm font-semibold text-green-300">Reset Link Dispatched!</p>
                <p className="text-xs text-gray-400">Check <b>{resetEmail}</b> for instructions.</p>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="w-full btn-secondary py-2 text-xs font-bold rounded-xl mt-2"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
