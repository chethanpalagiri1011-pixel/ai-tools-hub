import { useState } from 'react';
import { MessageSquare, Copy, Save, Wand2, CheckCircle2, Hash } from 'lucide-react';
import { generateCaptions } from '../../utils/aiService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'professional',  label: 'Professional', emoji: '💼' },
  { id: 'casual',        label: 'Casual',       emoji: '😊' },
  { id: 'funny',         label: 'Funny',        emoji: '😂' },
  { id: 'inspirational', label: 'Inspiring',    emoji: '✨' },
  { id: 'marketing',     label: 'Marketing',    emoji: '📈' },
];

export default function CaptionGenerator() {
  const [topic, setTopic]     = useState('');
  const [tone, setTone]       = useState('casual');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState(null);
  const [saved, setSaved]     = useState(false);
  const { addToHistory }      = useApp();
  const { user, updateUser }  = useAuth();

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    if ((user?.credits || 0) < 2) { toast.error('Not enough credits'); return; }

    setLoading(true); setSaved(false); setResult(null);
    try {
      const data = await generateCaptions({ topic: topic.trim(), tone, count: 4 });
      setResult(data);
      updateUser({ credits: Math.max(0, (user?.credits || 0) - 2) });
      toast.success('Captions generated! 🎉');
    } catch {
      toast.error('Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied!');
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const all = [...result.captions, '', result.hashtags.join(' ')].join('\n\n---\n\n');
    await navigator.clipboard.writeText(all);
    toast.success('All captions copied!');
  };

  const handleSave = () => {
    if (!result) return;
    addToHistory({ type: 'caption', topic, tone, captions: result.captions, hashtags: result.hashtags });
    setSaved(true);
    toast.success('Saved to history!');
  };

  const TOPICS = ['AI technology', 'Fitness journey', 'Coffee lover', 'Travel vibes', 'Startup life'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Caption Generator</h2>
          <p className="text-gray-500 text-sm">Create engaging social media captions (2 credits)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Topic / Subject</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. morning coffee, gym workout, new product launch..."
              className="input-field"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {TOPICS.map(t => (
                <button key={t}
                  onClick={() => setTopic(t)}
                  className="text-xs px-2.5 py-1 rounded-full text-gray-500 hover:text-gray-300 transition-all border border-white/5 hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map(t => (
                <button key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`py-2 px-3 rounded-xl text-center text-sm transition-all ${
                    tone === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{
                    background: tone === t.id ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.03)',
                    border: tone === t.id ? '1px solid rgba(20,184,166,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <span className="text-lg block">{t.emoji}</span>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #10b981)', boxShadow: '0 4px 20px rgba(20,184,166,0.3)' }}>
            {loading ? (
              <><div className="spinner" style={{ borderTopColor: '#14b8a6' }} /><span>Generating...</span></>
            ) : (
              <><Wand2 size={18} /><span>Generate Captions</span></>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-medium">Generated Captions</label>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleCopyAll} className="text-xs text-teal-400 hover:text-teal-300">Copy all</button>
                <button onClick={handleSave} disabled={saved}
                  className="text-xs text-gray-500 hover:text-gray-300">
                  {saved ? '✓ Saved' : 'Save all'}
                </button>
              </div>
            )}
          </div>

          {!result && !loading && (
            <div className="p-8 rounded-xl border border-white/8 text-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <MessageSquare size={36} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Captions will appear here</p>
            </div>
          )}

          {loading && (
            <div className="p-8 rounded-xl border border-white/8 text-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-10 h-10 mx-auto mb-2 rounded-full border-2 border-teal-700 border-t-teal-400 animate-spin" />
              <p className="text-gray-500 text-sm">Crafting captions...</p>
            </div>
          )}

          {result && !loading && (
            <>
              {result.captions.map((caption, i) => (
                <div key={i}
                  className="p-4 rounded-xl border border-white/8 group hover:border-teal-500/30 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-gray-200 text-sm leading-relaxed mb-2">{caption}</p>
                  <button onClick={() => handleCopy(caption, i)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-teal-400 transition-colors">
                    {copied === i
                      ? <><CheckCircle2 size={12} className="text-green-400" /> Copied!</>
                      : <><Copy size={12} /> Copy</>
                    }
                  </button>
                </div>
              ))}

              {/* Hashtags */}
              <div className="p-4 rounded-xl border border-teal-500/20"
                   style={{ background: 'rgba(20,184,166,0.08)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={14} className="text-teal-400" />
                  <span className="text-xs text-teal-400 font-medium">Suggested Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map(tag => (
                    <span key={tag}
                      className="text-xs px-2 py-1 rounded-full text-teal-300"
                      style={{ background: 'rgba(20,184,166,0.15)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
