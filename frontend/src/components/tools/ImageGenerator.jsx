import { useState } from 'react';
import { ImageIcon, Download, Save, RefreshCw, Wand2, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { generateImage } from '../../utils/aiService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from '../FeedbackModal';
import toast from 'react-hot-toast';

const STYLES = [
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'digital-art',    label: 'Digital Art' },
  { id: 'anime',          label: 'Anime' },
  { id: 'painting',       label: 'Oil Painting' },
  { id: 'sketch',         label: 'Sketch' },
];

const RATIOS = [
  { id: '16:9', label: '16:9', icon: '▬' },
  { id: '1:1',  label: '1:1',  icon: '■' },
  { id: '9:16', label: '9:16', icon: '▮' },
];

export default function ImageGenerator() {
  const [prompt, setPrompt]       = useState('');
  const [style, setStyle]         = useState('photorealistic');
  const [ratio, setRatio]         = useState('16:9');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [saved, setSaved]         = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addToHistory }          = useApp();
  const { user, updateUser }      = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }

    setLoading(true); setSaved(false); setResult(null);
    try {
      const data = await generateImage({ prompt: prompt.trim(), style, aspectRatio: ratio });
      setResult(data);
      // Auto-save to history so it always appears in My Images gallery
      addToHistory({ type: 'image', prompt: prompt.trim(), style, ratio, url: data.url, seed: data.seed });
      toast.success('Image generated! ✨');
      // Prompt user for feedback after completing work
      setTimeout(() => setShowFeedback(true), 1500);
    } catch (e) {
      toast.error('Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    addToHistory({ type: 'image', prompt, style, ratio, url: result.url, seed: result.seed });
    setSaved(true);
    toast.success('Saved to history!');
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `ai-image-${Date.now()}.jpg`;
    a.target = '_blank';
    a.click();
    toast.success('Download started!');
  };

  const EXAMPLE_PROMPTS = [
    'Futuristic city at night with neon lights',
    'Majestic dragon in a fantasy forest',
    'Abstract geometric patterns in purple and gold',
    'Astronaut floating in colorful nebula',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <ImageIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">AI Image Generator</h2>
          <p className="text-gray-500 text-sm">Turn your ideas into stunning visuals (5 credits)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Prompt */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Describe your image</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A serene Japanese garden with cherry blossoms at sunset..."
              rows={4}
              className="input-field resize-none leading-relaxed"
            />
            {/* Examples */}
            <div className="flex flex-wrap gap-2 mt-2">
              {EXAMPLE_PROMPTS.map(ex => (
                <button key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs px-2.5 py-1 rounded-full text-gray-500 hover:text-gray-300 transition-all border border-white/5 hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {ex.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Art Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    style === s.id
                      ? 'text-white border-purple-500/50'
                      : 'text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
                  }`}
                  style={{
                    background: style === s.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                    border: style === s.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Aspect Ratio</label>
            <div className="flex gap-2">
              {RATIOS.map(r => (
                <button key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    ratio === r.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{
                    background: ratio === r.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                    border: ratio === r.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <span className="block text-lg">{r.icon}</span>
                  <span className="text-xs">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {loading ? (
              <><div className="spinner" /><span>Generating...</span></>
            ) : (
              <><Wand2 size={18} /><span>Generate Image</span></>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Preview</label>
          <div className="relative rounded-xl overflow-hidden border border-white/8 min-h-64 flex items-center justify-center"
               style={{ background: 'rgba(255,255,255,0.02)', aspectRatio: ratio === '9:16' ? '9/16' : ratio === '1:1' ? '1/1' : '16/9' }}>
            {loading && (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-purple-700 border-t-purple-400 animate-spin" />
                <p className="text-gray-500 text-sm">Generating your image...</p>
                <p className="text-gray-700 text-xs mt-1">This takes a few seconds</p>
              </div>
            )}
            {!loading && !result && (
              <div className="text-center p-8">
                <ImageIcon size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Your image will appear here</p>
              </div>
            )}
            {result && !loading && (
              <img src={result.url} alt={prompt} className="w-full h-full object-cover" />
            )}
          </div>

          {result && !loading && (
            <div className="flex gap-2 mt-3">
              <button onClick={handleDownload}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
                <Download size={15} /> Download
              </button>
              <button onClick={handleSave} disabled={saved}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                  saved ? 'text-green-400 border border-green-500/30' : 'btn-secondary'
                }`}
                style={saved ? { background: 'rgba(16,185,129,0.1)' } : {}}>
                {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save</>}
              </button>
              <button onClick={handleGenerate}
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 px-4 text-sm">
                <RefreshCw size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal Popup */}
      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
        toolType="image" 
        toolName="Image Generator" 
      />
    </div>
  );
}
