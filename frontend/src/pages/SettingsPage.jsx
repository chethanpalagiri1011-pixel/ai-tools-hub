import { useState } from 'react';
import {
  Bell, Shield, Moon, Globe, Trash2, Eye, EyeOff, Key,
  CheckCircle2, ChevronRight, Zap, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({ email: true, usage: true, news: false });
  const [privacy, setPrivacy] = useState({ saveHistory: true, analytics: true });
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSaveNotifs = () => {
    toast.success('Notification preferences saved!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw) { toast.error('Please fill all fields'); return; }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    await new Promise(r => setTimeout(r, 800));
    toast.success('Password updated successfully!');
    setCurrentPw(''); setNewPw('');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      toast.error('Account deletion requested');
      setTimeout(() => { logout(); navigate('/'); }, 1500);
    }
  };


  const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 rounded-full transition-all duration-200"
      style={{ background: checked ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'rgba(255,255,255,0.1)' }}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <h3 className="font-semibold text-white mb-5">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your preferences and account</p>
      </div>

      {/* Arcade / Credits */}
      <Section title="🎮 Earn Free Credits">
        <div className="flex items-center justify-between p-5 rounded-xl border border-white/8 hover:border-purple-500/30 transition-all"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <p className="font-medium text-white text-lg">AI Arcade</p>
            <p className="text-gray-400 text-sm mt-1">
              Running low on credits? Play simple mini-games to instantly earn more credits for free!
            </p>
          </div>
          <button onClick={() => navigate('/dashboard/arcade')}
            className="btn-primary py-2 px-5 text-sm whitespace-nowrap ml-4">
            Play to Earn
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="🔔 Notifications">
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'usage', label: 'Usage alerts',        desc: 'Get notified when credits are low' },
            { key: 'news',  label: 'Product news',        desc: 'New features and announcements' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium">{item.label}</p>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
              <Toggle checked={notifs[item.key]} onChange={(v) => setNotifs({ ...notifs, [item.key]: v })} />
            </div>
          ))}
        </div>
        <button onClick={handleSaveNotifs}
          className="mt-5 btn-primary py-2 px-4 text-sm">
          Save Preferences
        </button>
      </Section>

      {/* Privacy */}
      <Section title="🔒 Privacy">
        <div className="space-y-4">
          {[
            { key: 'saveHistory', label: 'Save generation history', desc: 'Store your AI generations locally' },
            { key: 'analytics',   label: 'Usage analytics',          desc: 'Help improve the platform' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium">{item.label}</p>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
              <Toggle checked={privacy[item.key]} onChange={(v) => setPrivacy({ ...privacy, [item.key]: v })} />
            </div>
          ))}
        </div>
      </Section>

      {/* Change Password */}
      <Section title="🔑 Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPw ? 'text' : 'password'} value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <input type={showPw ? 'text' : 'password'} value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="New password (min. 6 chars)"
              className="input-field" />
          </div>
          <button type="submit" className="btn-secondary py-2.5 px-5 text-sm">
            Update Password
          </button>
        </form>
      </Section>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-red-500/20"
           style={{ background: 'rgba(239,68,68,0.03)' }}>
        <h3 className="font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium">Delete Account</p>
            <p className="text-gray-600 text-xs">This action is permanent and cannot be reversed</p>
          </div>
          <button onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 transition-all">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
