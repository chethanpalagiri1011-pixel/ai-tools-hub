import { useState } from 'react';
import { Sparkles, Copy, Save, ArrowRight, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import { enhancePrompt } from '../../utils/aiService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PromptEnhancer() {
  const [prompt, setPrompt]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [saved, setSaved]     = useState(false);
  const { addToHistory }      = useApp();
  const { user, updateUser }  = useAuth();

  const handleEnhance = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt to enhance'); return; }
    if (prompt.trim().length < 5) { toast.error('Prompt is too short'); return; }
    if ((user?.credits || 0) < 1) { toast.error('Not enough credits'); return; }

    setLoading(true); setSaved(false); setResult(null);
    try {
      const data = await enhancePrompt({ prompt: prompt.trim() });
      setResult(data);
      updateUser({ credits: Math.max(0, (user?.credits || 0) - 1) });
      toast.success('Prompt enhanced! 🚀');
    } catch {
      toast.error('Enhancement failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied!');
  };

  const handleSave = () => {
    if (!result) return;
    addToHistory({ type: 'prompt', original: result.original, enhanced: result.enhanced, negativePrompt: result.negativePrompt });
    setSaved(true);
    toast.success('Saved to history!');
  };

  const EXAMPLE_PROMPTS = [
    'a cat sitting on a window',
    'mountain landscape at sunset',
    'futuristic city',
    'portrait of a woman',
  ];

  const scoreBar = (score) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{
          width: `${score}%`,
          background: score >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : score >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)'
        }} />
      </div>
      <span className="text-sm font-bold text-white w-8">{score}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Prompt Enhancer</h2>
          <p className="text-gray-500 text-sm">Supercharge your AI prompts for better results (1 credit)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Your Original Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter a basic prompt to enhance..."
              rows={5}
              className="input-field resize-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {EXAMPLE_PROMPTS.map(ex => (
                <button key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs px-2.5 py-1 rounded-full text-gray-500 hover:text-gray-300 transition-all border border-white/5 hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-yellow-500/20"
               style={{ background: 'rgba(234,179,8,0.05)' }}>
            <div className="flex items-start gap-2">
              <Lightbulb size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-yellow-400">Tip:</strong> Start with a basic description and let AI add quality modifiers, lighting details, and style tags that make image generators produce significantly better results.
              </div>
            </div>
          </div>

          <button onClick={handleEnhance} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
            {loading ? (
              <><div className="spinner" style={{ borderTopColor: '#f59e0b' }} /><span>Enhancing...</span></>
            ) : (
              <><Sparkles size={18} /><span>Enhance Prompt</span></>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="p-8 rounded-xl border border-white/8 text-center min-h-48 flex items-center justify-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <Sparkles size={36} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Enhanced prompt will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="p-8 rounded-xl border border-white/8 text-center min-h-48 flex items-center justify-center"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full border-2 border-yellow-700 border-t-yellow-400 animate-spin" />
                <p className="text-gray-500 text-sm">Analyzing and enhancing...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Quality score comparison */}
              <div className="p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <TrendingUp size={15} /> Prompt Quality Score
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Original</span><span>{result.score.original}/100</span>
                    </div>
                    {scoreBar(result.score.original)}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Enhanced</span><span>{result.score.enhanced}/100</span>
                    </div>
                    {scoreBar(result.score.enhanced)}
                  </div>
                </div>
              </div>

              {/* Enhanced prompt */}
              <div className="p-4 rounded-xl border border-yellow-500/20" style={{ background: 'rgba(234,179,8,0.05)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-yellow-400">✨ Enhanced Prompt</p>
                  <button onClick={() => handleCopy(result.enhanced, 'enhanced')}
                    className="text-xs text-gray-500 hover:text-yellow-400 flex items-center gap-1 transition-colors">
                    {copiedField === 'enhanced'
                      ? <><CheckCircle2 size={12} className="text-green-400" />Copied!</>
                      : <><Copy size={12} />Copy</>
                    }
                  </button>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{result.enhanced}</p>
              </div>

              {/* Negative prompt */}
              <div className="p-4 rounded-xl border border-red-500/20" style={{ background: 'rgba(239,68,68,0.05)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-red-400">🚫 Negative Prompt</p>
                  <button onClick={() => handleCopy(result.negativePrompt, 'negative')}
                    className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                    {copiedField === 'negative'
                      ? <><CheckCircle2 size={12} className="text-green-400" />Copied!</>
                      : <><Copy size={12} />Copy</>
                    }
                  </button>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{result.negativePrompt}</p>
              </div>

              {/* Improvements */}
              <div className="p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-medium text-gray-400 mb-2">What was improved:</p>
                <ul className="space-y-1">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 size={12} className="text-yellow-400" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={handleSave} disabled={saved}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                  saved ? 'text-green-400' : 'btn-secondary'
                }`}
                style={saved ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' } : {}}>
                {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Prompt</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
