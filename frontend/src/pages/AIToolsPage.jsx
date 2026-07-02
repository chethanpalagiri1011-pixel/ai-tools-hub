import { ImageIcon, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageGenerator  from '../components/tools/ImageGenerator';
import TextSummarizer  from '../components/tools/TextSummarizer';
import CaptionGenerator from '../components/tools/CaptionGenerator';
import PromptEnhancer  from '../components/tools/PromptEnhancer';

const TABS = [
  { id: 'image',   label: 'Image Gen',  icon: ImageIcon,     color: 'from-purple-500 to-pink-500',   activeColor: 'text-purple-300',  borderColor: 'border-purple-500' },
  { id: 'summary', label: 'Summarizer', icon: FileText,      color: 'from-blue-500 to-cyan-500',     activeColor: 'text-blue-300',    borderColor: 'border-blue-500' },
  { id: 'caption', label: 'Captions',   icon: MessageSquare, color: 'from-teal-500 to-green-500',    activeColor: 'text-teal-300',    borderColor: 'border-teal-500' },
  { id: 'prompt',  label: 'Prompt+',    icon: Sparkles,      color: 'from-yellow-500 to-orange-500', activeColor: 'text-yellow-300',  borderColor: 'border-yellow-500' },
];

export default function AIToolsPage() {
  const { activeTool, setActiveTool } = useApp();

  const renderTool = () => {
    switch(activeTool) {
      case 'image':   return <ImageGenerator />;
      case 'summary': return <TextSummarizer />;
      case 'caption': return <CaptionGenerator />;
      case 'prompt':  return <PromptEnhancer />;
      default:        return <ImageGenerator />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">AI Tools</h1>
        <p className="text-gray-500 text-sm">Choose a tool to start creating</p>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTool(tab.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
              activeTool === tab.id
                ? `border-white/20 ${tab.activeColor}`
                : 'border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15'
            }`}
            style={{
              background: activeTool === tab.id
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.02)',
            }}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tab.color} flex items-center justify-center mb-3`}>
              <tab.icon size={16} className="text-white" />
            </div>
            <p className={`text-sm font-semibold ${activeTool === tab.id ? '' : 'text-gray-400'}`}>{tab.label}</p>
            {activeTool === tab.id && (
              <div className={`mt-2 h-0.5 w-8 rounded-full bg-gradient-to-r ${tab.color}`} />
            )}
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="p-6 rounded-2xl border border-white/8"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        {renderTool()}
      </div>
    </div>
  );
}
