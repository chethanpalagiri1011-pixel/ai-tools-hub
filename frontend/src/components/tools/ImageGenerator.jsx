import { useState } from 'react';
import { ImageIcon, Download, Save, RefreshCw, Wand2, CheckCircle2, MessageSquareHeart, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const { addToHistory }          = useApp();
  const { user, updateUser }      = useAuth();

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input requires Chrome, Edge, or Safari browser!');
      return;
    }

    if (isListening) {
      try { window._recognitionInstance?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let initialPrompt = prompt;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('🎙️ Microphone active! Speak to auto-type...');
      };

      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const textChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += textChunk + ' ';
          } else {
            interimText += textChunk;
          }
        }

        const fullSpokenText = (finalText + interimText).trim();
        if (fullSpokenText) {
          setPrompt(fullSpokenText);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition event:", event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission blocked in browser settings! 🎙️');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      window._recognitionInstance = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start error:", err);
      setIsListening(false);
    }
  };

  const handleVoiceOver = () => {
    if (!prompt.trim()) {
      toast.error('Type or speak a prompt first to listen!');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(prompt);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
    if ((user?.credits || 0) < 10) { toast.error('Not enough credits! Image generation costs 10 credits.'); return; }

    setLoading(true); setSaved(false); setResult(null);
    try {
      const data = await generateImage({ prompt: prompt.trim(), style, aspectRatio: ratio });
      setResult(data);
      updateUser({ credits: Math.max(0, (user?.credits || 0) - 10) });
      // Auto-save to history so it always appears in My Images gallery
      addToHistory({ type: 'image', prompt: prompt.trim(), style, ratio, url: data.url, seed: data.seed });
      toast.success('Image generated! (10 credits used) ✨');
      // Prompt user for feedback after completing work
      setTimeout(() => setShowFeedback(true), 1500);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Generation failed. Try again.');
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
          <p className="text-gray-500 text-sm">Turn your ideas into stunning visuals (10 credits)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-sm text-gray-400 font-medium">Describe your image</label>
              <div className="flex items-center gap-2">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20'
                  }`}
                  title="Speak your prompt via microphone"
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isListening ? 'Listening...' : 'Voice Input 🎙️'}</span>
                </button>

                {/* Voice Over Button */}
                <button
                  type="button"
                  onClick={handleVoiceOver}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title="Listen to voice-over"
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isSpeaking ? 'Speaking...' : 'Voice Over 🔊'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A serene Japanese garden with cherry blossoms at sunset... (or click Voice Input to speak)"
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
              <><Wand2 size={18} /><span>Generate Image (10 Credits)</span></>
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
