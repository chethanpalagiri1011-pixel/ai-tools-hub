import { useState } from 'react';
import { FileText, Copy, Save, Wand2, CheckCircle2, BarChart2 } from 'lucide-react';
import { summarizeText } from '../../utils/aiService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LENGTH_OPTIONS = [
  { id: 'short',  label: 'Short',  desc: '~10% of original' },
  { id: 'medium', label: 'Medium', desc: '~25% of original' },
  { id: 'long',   label: 'Long',   desc: '~40% of original' },
];

const SAMPLE_TEXT = `Artificial intelligence (AI) is transforming virtually every industry and aspect of modern life. From healthcare diagnostics that can detect diseases with superhuman accuracy, to autonomous vehicles navigating complex urban environments, AI systems are becoming increasingly capable and pervasive. The technology relies on machine learning algorithms that improve through exposure to vast amounts of data, enabling computers to recognize patterns, make decisions, and even generate creative content. Natural language processing allows AI to understand and generate human language, powering everything from virtual assistants to content generation tools. Computer vision enables machines to interpret visual information from images and video. Reinforcement learning allows AI agents to learn optimal behaviors through trial and error in simulated environments. Despite remarkable advances, significant challenges remain including ensuring AI systems are safe, fair, transparent, and aligned with human values. Researchers are actively working on techniques to make AI more interpretable, robust, and beneficial to society as a whole.`;

export default function TextSummarizer() {
  const [text, setText]       = useState('');
  const [length, setLength]   = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const { addToHistory }      = useApp();
  const { user, updateUser }  = useAuth();

  const handleSummarize = async () => {
    const trimmed = text.trim();
    if (!trimmed) { toast.error('Please enter some text to summarize'); return; }
    if (trimmed.split(/\s+/).length < 20) { toast.error('Text must be at least 20 words'); return; }
    if ((user?.credits || 0) < 2) { toast.error('Not enough credits'); return; }

    setLoading(true); setSaved(false); setResult(null);
    try {
      const data = await summarizeText({ text: trimmed, length });
      setResult(data);
      updateUser({ credits: Math.max(0, (user?.credits || 0) - 2) });
      toast.success('Text summarized! ✨');
    } catch {
      toast.error('Summarization failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleSave = () => {
    if (!result) return;
    addToHistory({ type: 'summary', text: text.slice(0, 100), summary: result.summary, length, reduction: result.reduction });
    setSaved(true);
    toast.success('Saved to history!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Text Summarizer</h2>
          <p className="text-gray-500 text-sm">Condense any text into key insights (2 credits)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400 font-medium">Input Text</label>
              <button onClick={() => setText(SAMPLE_TEXT)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Load sample
              </button>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your article, document, or any long text here..."
              rows={8}
              className="input-field resize-none leading-relaxed"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{text.split(/\s+/).filter(Boolean).length} words</span>
              <span>{text.length} characters</span>
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Summary Length</label>
            <div className="grid grid-cols-3 gap-2">
              {LENGTH_OPTIONS.map(opt => (
                <button key={opt.id}
                  onClick={() => setLength(opt.id)}
                  className={`py-2 px-3 rounded-xl text-center transition-all ${
                    length === opt.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{
                    background: length === opt.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                    border: length === opt.id ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs opacity-60">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSummarize} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            {loading ? (
              <><div className="spinner" style={{ borderTopColor: '#3b82f6' }} /><span>Summarizing...</span></>
            ) : (
              <><Wand2 size={18} /><span>Summarize Text</span></>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Summary</label>
            <div className="min-h-48 p-4 rounded-xl border border-white/8 relative"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full border-2 border-blue-700 border-t-blue-400 animate-spin" />
                    <p className="text-gray-500 text-sm">Analyzing text...</p>
                  </div>
                </div>
              )}
              {!loading && !result && (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <FileText size={36} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Summary will appear here</p>
                  </div>
                </div>
              )}
              {result && !loading && (
                <p className="text-gray-200 text-sm leading-relaxed">{result.summary}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          {result && !loading && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Original', value: `${result.originalWords}w` },
                  { label: 'Summary',  value: `${result.summaryWords}w` },
                  { label: 'Reduced',  value: `${result.reduction}%` },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center border border-white/5"
                       style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <p className="text-white font-bold text-lg">{s.value}</p>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Key Points */}
              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Key Points</p>
                <ul className="space-y-2">
                  {result.keyPoints.map((kp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400 mt-0.5"
                            style={{ background: 'rgba(59,130,246,0.15)' }}>{i+1}</span>
                      {kp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
                  {copied ? <><CheckCircle2 size={15} className="text-green-400" /> Copied!</> : <><Copy size={15} /> Copy</>}
                </button>
                <button onClick={handleSave} disabled={saved}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                    saved ? 'text-green-400' : 'btn-secondary'
                  }`}
                  style={saved ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' } : {}}>
                  {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
