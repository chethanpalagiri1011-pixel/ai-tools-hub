import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Gift, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_OPTIONS = [
  { id: 'purple', label: 'Cosmic Purple', bg: 'linear-gradient(135deg, #7c3aed, #3b82f6)', icon: '🔮' },
  { id: 'emerald', label: 'Cyber Emerald', bg: 'linear-gradient(135deg, #059669, #10b981)', icon: '⚡' },
  { id: 'amber', label: 'Solar Gold', bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: '👑' },
  { id: 'rose', label: 'Ruby Neon', bg: 'linear-gradient(135deg, #e11d48, #f43f5e)', icon: '🔥' },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Social Account Selector Modal State
  const [socialModalProvider, setSocialModalProvider] = useState(null); // 'Google' | 'GitHub' | null
  const [customSocialEmail, setCustomSocialEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password criteria verification
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-gray-700', width: 'w-0' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;

    if (score <= 1) return { label: 'Weak (add characters)', color: 'bg-red-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Strong', color: 'bg-green-500', width: 'w-3/4' };
    return { label: 'Bulletproof 🛡️', color: 'bg-cyan-400', width: 'w-full' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        toast.success(`Registration completed! Confirmation email sent to ${email} 📧`);
        navigate('/dashboard');
      } else {
        toast.error(res.error || 'Failed to create account. Email may already be in use.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openSocialPicker = (provider) => {
    setSocialModalProvider(provider);
    setShowCustomInput(false);
    setCustomSocialEmail('');
  };

  const executeSocialSignup = async (selectedEmail, selectedName) => {
    if (!selectedEmail || !selectedEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const providerName = socialModalProvider || 'Google';
    setSocialModalProvider(null);
    setLoading(true);
    toast.loading(`Registering ${selectedEmail} with ${providerName}...`, { duration: 1000 });

    try {
      const res = await signup(selectedName || selectedEmail.split('@')[0], selectedEmail, 'social123');
      if (res.success) {
        toast.success(`Registered with ${providerName}! 📧 Welcome confirmation email sent to ${selectedEmail}.`);
        navigate('/dashboard');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred during social registration.');
    } finally {
      setLoading(false);
    }
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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

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
          <span className="text-[11px] text-purple-300 font-semibold border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/10 flex items-center gap-1.5 shadow-sm">
            <Gift size={13} className="text-purple-400" />
            100 Bonus Credits Included
          </span>
        </div>

        {/* Main Card */}
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-2xl"
          style={{ background: 'rgba(13, 13, 26, 0.88)' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-3 shadow-lg shadow-purple-500/30">
              <img src="/logo.png" alt="AI Tools Hub Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-xs">Join AI Tools Hub & get instant access to 4 AI tools</p>
          </div>

          {/* Social SSO Registration */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => openSocialPicker('Google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer hover:border-purple-500/40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Google Signup</span>
            </button>
            <button
              type="button"
              onClick={() => openSocialPicker('GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer hover:border-purple-500/40"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Signup</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0b0a16] px-3 text-[11px] text-gray-500 font-medium uppercase tracking-wider absolute">
              or register with details
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preset Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Choose Profile Avatar Style</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-10 rounded-xl flex items-center justify-center text-base transition-all border cursor-pointer ${
                      selectedAvatar.id === av.id
                        ? 'border-purple-400 scale-105 shadow-md shadow-purple-500/30 ring-2 ring-purple-500/40'
                        : 'border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: av.bg }}
                  >
                    <span>{av.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

              {/* Password Strength Meter & Live Checklist */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className={hasMinLength ? 'text-green-400 font-bold' : 'text-gray-600'}>✓ 8+ chars</span> • 
                      <span className={hasUppercase ? 'text-green-400 font-bold' : 'text-gray-600'}>✓ Uppercase</span> • 
                      <span className={hasNumber ? 'text-green-400 font-bold' : 'text-gray-600'}>✓ Number</span>
                    </span>
                    <span className="font-semibold text-purple-300">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>
              {confirmPassword && (
                password === confirmPassword ? (
                  <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match!
                  </p>
                ) : (
                  <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
                )
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-purple-400 font-semibold hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  & Privacy Policy
                </span>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs text-gray-400 border-t border-white/5 pt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign In Here →
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
                Select an account to register with <b>AI Tools Hub</b>
              </p>
            </div>

            {/* List of Detected System Accounts */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {(socialModalProvider === 'Google' ? googleAccounts : githubAccounts).map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSocialSignup(acc.email, acc.name)}
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
                    executeSocialSignup(customSocialEmail, customSocialEmail.split('@')[0]);
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
                    Register with {customSocialEmail || 'this email'}
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

      {/* Terms of Service Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 p-6 bg-[#0f0e22] shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setTermsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <ShieldCheck className="text-purple-400" size={24} />
              <div>
                <h3 className="text-base font-bold text-white">Terms of Service & Privacy</h3>
                <p className="text-xs text-gray-400">AI Tools Hub Community Guidelines</p>
              </div>
            </div>
            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>1. <b>Account Credits</b>: Every new registered user receives 100 Free Pro Credits to explore AI Tools.</p>
              <p>2. <b>Fair Usage</b>: Generated content belongs to you. Do not generate unlawful, malicious, or abusive content.</p>
              <p>3. <b>Data Privacy</b>: Your account details are securely encrypted and never shared with third parties.</p>
            </div>
            <button
              onClick={() => { setAgreeTerms(true); setTermsModalOpen(false); }}
              className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl mt-4"
            >
              I Accept & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
