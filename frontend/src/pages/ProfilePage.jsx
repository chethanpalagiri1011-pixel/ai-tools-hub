import { useState, useRef } from 'react';
import { User, Mail, Camera, Save, CheckCircle2, Shield, Award, Phone, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { history } = useApp();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState(() => {
    return user?.avatar || localStorage.getItem(`user_avatar_${user?.id || 'default'}`) || null;
  });

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setAvatar(base64);
        localStorage.setItem(`user_avatar_${user?.id || 'default'}`, base64);
        updateUser({ avatar: base64 });
        toast.success('Profile picture updated! 📸');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    localStorage.removeItem(`user_avatar_${user?.id || 'default'}`);
    updateUser({ avatar: null });
    toast.success('Profile picture removed');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      await api.put('/api/users/me', { name: form.name.trim(), phone: form.phone.trim() });
      updateUser({ name: form.name.trim(), phone: form.phone.trim() });
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Total Generations', value: history.length },
    { label: 'Images Created',    value: history.filter(h => h.type === 'image').length },
    { label: 'Texts Summarized',  value: history.filter(h => h.type === 'summary').length },
    { label: 'Captions Made',     value: history.filter(h => h.type === 'caption').length },
  ];

  const achievements = [
    { icon: '🚀', label: 'First Generation', unlocked: history.length >= 1 },
    { icon: '🎨', label: 'Creative Soul',    unlocked: history.filter(h => h.type === 'image').length >= 5 },
    { icon: '📝', label: 'Word Wizard',      unlocked: history.filter(h => h.type === 'summary').length >= 3 },
    { icon: '⚡', label: 'Power User',       unlocked: history.length >= 10 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-gray-500 text-sm">Manage your account information</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Avatar & Plan */}
        <div className="p-6 rounded-2xl border border-white/8 text-center"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Hidden File Input for Avatar Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
          />

          <div className="relative inline-block mb-4 group cursor-pointer" onClick={handleCameraClick}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto overflow-hidden shadow-lg border border-white/10"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCameraClick(); }}
              title="Upload your photo"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 text-white transition-all hover:scale-110 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Camera size={14} />
            </button>
          </div>

          {avatar && (
            <button 
              onClick={handleRemovePhoto} 
              className="text-[11px] text-gray-500 hover:text-red-400 flex items-center justify-center gap-1 mx-auto mb-2 transition-colors">
              <Trash2 size={11} /> Remove photo
            </button>
          )}
          <h3 className="text-white font-semibold">{user?.name}</h3>
          <p className="text-gray-500 text-sm truncate">{user?.email}</p>
          {user?.phone && (
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Phone size={12} /> {user.phone}
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
               style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa' }}>
            <Award size={12} />
            {user?.plan} Plan
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-yellow-400 text-2xl font-bold">{user?.credits}</p>
            <p className="text-gray-600 text-xs">credits remaining</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-white/8"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <User size={16} className="text-purple-400" /> Personal Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="input-field pl-10" />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={form.email} disabled
                  className="input-field pl-10 opacity-50 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Email address cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Optional — used for account recovery</p>
            </div>

            <button type="submit" disabled={saving}
              className={`btn-primary flex items-center gap-2 py-2.5 px-5 text-sm ${saved ? '!bg-green-600' : ''}`}>
              {saving ? <><div className="spinner" />Saving...</> :
               saved  ? <><CheckCircle2 size={15} />Saved!</> :
               <><Save size={15} />Save Changes</>}
            </button>
          </form>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={16} className="text-blue-400" /> Contact Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Mail size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="text-white text-sm font-medium">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Phone size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Phone</p>
              <p className={`text-sm font-medium ${user?.phone ? 'text-white' : 'text-gray-600 italic'}`}>
                {user?.phone || 'Not added yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h3 className="font-semibold text-white mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl border border-white/5"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-3xl font-bold font-display gradient-text-purple">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h3 className="font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map(a => (
            <div key={a.label}
              className={`p-4 rounded-xl border text-center transition-all ${
                a.unlocked ? 'border-purple-500/30' : 'border-white/5 opacity-40'
              }`}
              style={{ background: a.unlocked ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)' }}>
              <span className="text-3xl block mb-2">{a.icon}</span>
              <p className="text-xs font-medium text-gray-300">{a.label}</p>
              {a.unlocked && <p className="text-xs text-purple-400 mt-1">Unlocked!</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
