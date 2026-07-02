import { useState } from 'react';
import {
  ImageIcon, FileText, MessageSquare, Sparkles, Trash2,
  Search, Filter, Download, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  image:   { icon: ImageIcon,     color: 'text-purple-400', bg: 'rgba(139,92,246,0.15)',   label: 'Image' },
  summary: { icon: FileText,      color: 'text-blue-400',   bg: 'rgba(59,130,246,0.15)',   label: 'Summary' },
  caption: { icon: MessageSquare, color: 'text-teal-400',   bg: 'rgba(20,184,166,0.15)',   label: 'Caption' },
  prompt:  { icon: Sparkles,      color: 'text-yellow-400', bg: 'rgba(234,179,8,0.15)',    label: 'Prompt' },
};

const FILTERS = ['all', 'image', 'summary', 'caption', 'prompt'];

export default function HistoryPage() {
  const { history, deleteFromHistory, clearHistory } = useApp();
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const filtered = history.filter(h => {
    const matchFilter = filter === 'all' || h.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (
      (h.prompt || '').toLowerCase().includes(q) ||
      (h.text || '').toLowerCase().includes(q) ||
      (h.topic || '').toLowerCase().includes(q) ||
      (h.original || '').toLowerCase().includes(q)
    );
    return matchFilter && matchSearch;
  });

  const handleDelete = (id) => {
    deleteFromHistory(id);
    toast.success('Deleted from history');
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const getPreviewText = (item) => {
    if (item.type === 'image')   return item.prompt || 'Image generation';
    if (item.type === 'summary') return item.text || item.summary?.slice(0, 60) || 'Text summary';
    if (item.type === 'caption') return item.topic || 'Caption generation';
    if (item.type === 'prompt')  return item.original || 'Prompt enhancement';
    return 'Generation';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">History</h1>
          <p className="text-gray-500 text-sm">{history.length} total generations</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <Trash2 size={15} /> Clear All
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search history..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              style={{
                background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                border: filter === f ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="p-16 rounded-2xl border border-white/8 text-center"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          <Clock size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-1">
            {history.length === 0 ? 'No generations yet' : 'No results found'}
          </p>
          <p className="text-gray-600 text-sm">
            {history.length === 0
              ? 'Start using AI tools to see your history here'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const typeInfo = TYPE_ICONS[item.type] || TYPE_ICONS.image;
            const Icon = typeInfo.icon;
            return (
              <div key={item.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-all group"
                style={{ background: 'rgba(255,255,255,0.02)' }}>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: typeInfo.bg }}>
                  <Icon size={18} className={typeInfo.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}
                          style={{ background: typeInfo.bg }}>
                      {typeInfo.label}
                    </span>
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{getPreviewText(item)}</p>

                  {/* Type-specific detail */}
                  {item.type === 'image' && item.style && (
                    <p className="text-gray-600 text-xs mt-1">Style: {item.style} • {item.ratio}</p>
                  )}
                  {item.type === 'summary' && item.reduction && (
                    <p className="text-gray-600 text-xs mt-1">Reduced by {item.reduction}% • {item.length}</p>
                  )}
                  {item.type === 'caption' && item.tone && (
                    <p className="text-gray-600 text-xs mt-1">Tone: {item.tone}</p>
                  )}

                  {/* Image preview */}
                  {item.type === 'image' && item.url && (
                    <img src={item.url} alt="preview"
                      className="mt-2 w-20 h-14 object-cover rounded-lg border border-white/10" />
                  )}
                </div>

                {/* Actions */}
                <button onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
