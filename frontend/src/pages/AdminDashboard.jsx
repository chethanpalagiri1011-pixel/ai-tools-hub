import { 
  Users, Activity, ImageIcon, FileText, MessageSquare, 
  Sparkles, ShieldCheck, Clock, TrendingUp, RefreshCw, BarChart2, ShieldAlert,
  Star, MessageSquareHeart
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const isOwner = user?.email?.toLowerCase() === 'chethanpalagiri1011@gmail.com' ||
                  user?.email?.toLowerCase().includes('chethan') || 
                  user?.email?.toLowerCase().includes('palagiri') || 
                  user?.name?.toLowerCase().includes('karthik') ||
                  user?.email?.toLowerCase().includes('karthik') || 
                  user?.is_admin === true ||
                  user?.id === 1;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      toast.error("Failed to load analytics dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchStats();
    }
  }, [isOwner]);

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <ShieldAlert size={32} className="text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm max-w-md">
          The Owner Panel is restricted exclusively to the website owner. Regular members cannot view administrative analytics.
        </p>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium">Loading Owner Analytics Dashboard...</p>
      </div>
    );
  }

  const breakdown = stats?.breakdown || { image: 0, summary: 0, caption: 0, prompt: 0 };
  const maxVal = Math.max(breakdown.image, breakdown.summary, breakdown.caption, breakdown.prompt, 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <ShieldCheck size={14} /> Owner & Admin Panel
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Owner Analytics Hub</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time insights on registered members, tool usage, and generation metrics.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-4 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Stats
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl border border-white/8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users size={18} className="text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-1">{stats?.total_users ?? 0}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp size={12} /> Active registered accounts
          </p>
        </div>

        {/* Total Generations */}
        <div className="p-5 rounded-2xl border border-white/8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Generations</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Activity size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-1">{stats?.total_generations ?? 0}</p>
          <p className="text-xs text-blue-400">Total AI content produced</p>
        </div>

        {/* Image Generations */}
        <div className="p-5 rounded-2xl border border-white/8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Photo Generations</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <ImageIcon size={18} className="text-pink-400" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-1">{breakdown.image}</p>
          <p className="text-xs text-pink-400">Visual creations generated</p>
        </div>

        {/* Text Generations */}
        <div className="p-5 rounded-2xl border border-white/8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Text & Prompt Tools</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileText size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-white mb-1">
            {breakdown.summary + breakdown.caption + breakdown.prompt}
          </p>
          <p className="text-xs text-emerald-400">Summaries, captions & prompts</p>
        </div>
      </div>

      {/* Tool Usage Breakdown Section */}
      <div className="p-6 rounded-2xl border border-white/8 space-y-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <BarChart2 size={20} className="text-purple-400" />
          <h2 className="text-white font-bold text-lg">Where Users Spend Their Time</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Generation Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <ImageIcon size={16} className="text-pink-400" /> Image Generator
              </span>
              <span className="text-white font-bold">{breakdown.image} creations</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (breakdown.image / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Summarizer Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <FileText size={16} className="text-blue-400" /> Smart Summarizer
              </span>
              <span className="text-white font-bold">{breakdown.summary} creations</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (breakdown.summary / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Caption Generator Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <MessageSquare size={16} className="text-teal-400" /> Caption Creator
              </span>
              <span className="text-white font-bold">{breakdown.caption} creations</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (breakdown.caption / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Prompt Enhancer Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" /> Prompt Enhancer
              </span>
              <span className="text-white font-bold">{breakdown.prompt} creations</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (breakdown.prompt / maxVal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Recent Members & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Users size={18} className="text-purple-400" /> Newly Joined Members
            </h3>
            <span className="text-xs text-gray-500">Latest 10</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Credits</th>
                  <th className="pb-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {stats?.recent_users?.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2">
                      <p className="font-semibold text-white truncate max-w-[120px]">{u.name}</p>
                      <p className="text-gray-500 text-[11px] truncate max-w-[120px]">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-yellow-400">{u.credits}</td>
                    <td className="py-3 text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_users || stats.recent_users.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-600">No members registered yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Clock size={18} className="text-blue-400" /> Recent User Activity
            </h3>
            <span className="text-xs text-gray-500">Live feed</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {stats?.recent_activity?.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                  act.type === 'image' ? 'bg-pink-500/10 text-pink-400' :
                  act.type === 'summary' ? 'bg-blue-500/10 text-blue-400' :
                  act.type === 'caption' ? 'bg-teal-500/10 text-teal-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {act.type === 'image' && <ImageIcon size={14} />}
                  {act.type === 'summary' && <FileText size={14} />}
                  {act.type === 'caption' && <MessageSquare size={14} />}
                  {act.type === 'prompt' && <Sparkles size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white truncate">{act.user_name}</p>
                    <span className="text-[10px] text-gray-500">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">"{act.prompt}"</p>
                </div>
              </div>
            ))}
            {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
              <div className="py-12 text-center text-gray-600 text-xs">
                No user generation activity recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Feedback & Rating Section */}
      <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <MessageSquareHeart size={18} className="text-pink-400" /> Member Ratings & Feedback
          </h3>
          <span className="text-xs text-gray-500">Collected from users after work</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.recent_feedback?.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white truncate">{fb.user_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                    {fb.tool_type}
                  </span>
                </div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                  <span className="text-xs text-gray-400 font-bold ml-1">{fb.rating}/5</span>
                </div>
                <p className="text-xs text-gray-300 italic">
                  {fb.comment ? `"${fb.comment}"` : <span className="text-gray-500 font-normal">No written comment left</span>}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 text-right">
                {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
              </p>
            </div>
          ))}
          {(!stats?.recent_feedback || stats.recent_feedback.length === 0) && (
            <div className="col-span-full py-8 text-center text-gray-600 text-xs">
              No user feedback received yet. As members use the tools, their ratings will appear here!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
