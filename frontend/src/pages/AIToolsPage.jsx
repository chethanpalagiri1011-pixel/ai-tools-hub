import { useNavigate } from 'react-router-dom';
import { ImageIcon, FileText, MessageSquare, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Tilt3DCard from '../components/Tilt3DCard';
import ToolCardVideo from '../components/ToolCardVideo';

const TOOLS = [
  { id: 'image',   slug: 'image-gen',   label: 'AI Image Generator',      desc: 'Turn ideas into stunning 4K visuals',           icon: ImageIcon,     color: 'from-purple-500 to-pink-500',   activeColor: 'text-purple-300', count: '1.2M uses' },
  { id: 'summary', slug: 'summarizer',  label: 'Document Summarizer',     desc: 'Condense long articles & docs into bullets',    icon: FileText,      color: 'from-blue-500 to-cyan-500',     activeColor: 'text-blue-300',   count: '420K uses' },
  { id: 'caption', slug: 'captions',    label: 'Social Caption Generator', desc: 'Create engaging copy & viral hashtags',        icon: MessageSquare, color: 'from-teal-500 to-green-500',    activeColor: 'text-teal-300',   count: '310K uses' },
  { id: 'prompt',  slug: 'prompt-plus', label: 'AI Prompt Enhancer',      desc: 'Enrich simple prompts for maximum quality',     icon: Sparkles,      color: 'from-yellow-500 to-orange-500', activeColor: 'text-yellow-300', count: '89K uses' },
];

export default function AIToolsPage() {
  const navigate = useNavigate();
  const { setActiveTool } = useApp();

  const handleOpenToolPage = (tool) => {
    setActiveTool(tool.id);
    navigate(`/dashboard/tools/${tool.slug}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">AI Creation Suite</h1>
        <p className="text-gray-400 text-sm">Select a tool to open its full dedicated workspace</p>
      </div>

      {/* 4 Dedicated Tool Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {TOOLS.map(tool => (
          <Tilt3DCard key={tool.id}
            onClick={() => handleOpenToolPage(tool)}
            className="p-6 rounded-2xl border border-white/8 text-left group hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden bg-white/[0.02] shadow-xl"
          >
            {/* Unique 3D Looping Video Animation */}
            <ToolCardVideo toolId={tool.id} />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <tool.icon size={22} className="text-white" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all flex items-center gap-1">
                  Open Tool <ArrowRight size={12} />
                </span>
              </div>

              <div>
                <h3 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors mb-1">{tool.label}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{tool.desc}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {tool.count}</span>
                <span className="text-purple-400/80 font-medium">Dedicated Workspace →</span>
              </div>
            </div>
          </Tilt3DCard>
        ))}
      </div>
    </div>
  );
}
