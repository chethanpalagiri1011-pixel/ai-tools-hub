import { useState } from 'react';
import { Film, Play, Sparkles, Loader2, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function VideoGenerator() {
  const { user, updateUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a video prompt");
      return;
    }
    if (user.credits < 15) {
      toast.error("Not enough credits! HD Video costs 15 credits.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/api/tools/video', {
        prompt,
        aspect_ratio: aspectRatio,
      });
      
      setResult(res.data);
      updateUser({ credits: user.credits - 15 });
      toast.success("Video generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Film className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">HD Video Generator</h2>
          <p className="text-sm text-gray-400">Generate stunning realistic videos from text (Costs 15 Credits)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic tracking shot of a glowing neon jellyfish floating through a futuristic cyberpunk city street, 8k resolution, photorealistic..."
              className="w-full h-32 px-4 py-3 bg-dark-300/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-3">
              {['16:9', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    aspectRatio === ratio
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-dark-300/30 border-white/5 text-gray-400 hover:bg-dark-300/50 hover:border-white/10'
                  }`}
                >
                  {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Video (15 Credits)</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <div className="w-full h-full min-h-[300px] lg:min-h-[400px] rounded-2xl bg-dark-400/50 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <p className="text-indigo-400 font-medium animate-pulse">Rendering Video Frame by Frame...</p>
                <p className="text-gray-500 text-sm">This usually takes about 30-60 seconds.</p>
              </div>
            ) : result ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <video 
                  src={result.video_url} 
                  autoPlay 
                  controls 
                  loop 
                  className="w-full h-full object-contain"
                />
                <a
                  href={result.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                >
                  <Download size={20} />
                </a>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-dark-300/50 flex items-center justify-center mx-auto mb-2">
                  <Play size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">Your video will appear here</p>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  Enter a detailed prompt and select an aspect ratio to generate a high-quality video.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
