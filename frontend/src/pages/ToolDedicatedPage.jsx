import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ImageIcon, FileText, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageGenerator from '../components/tools/ImageGenerator';
import TextSummarizer from '../components/tools/TextSummarizer';
import CaptionGenerator from '../components/tools/CaptionGenerator';
import PromptEnhancer from '../components/tools/PromptEnhancer';

const TOOL_CONFIG = {
  'image-gen':   { id: 'image',   label: 'AI Image Generator',      icon: ImageIcon,     color: 'from-purple-500 to-pink-500',   activeColor: 'text-purple-300',  component: ImageGenerator },
  'summarizer':  { id: 'summary', label: 'Document Summarizer',     icon: FileText,      color: 'from-blue-500 to-cyan-500',     activeColor: 'text-blue-300',    component: TextSummarizer },
  'captions':    { id: 'caption', label: 'Social Caption Generator', icon: MessageSquare, color: 'from-teal-500 to-green-500',    activeColor: 'text-teal-300',    component: CaptionGenerator },
  'prompt-plus': { id: 'prompt',  label: 'AI Prompt Enhancer',      icon: Sparkles,      color: 'from-yellow-500 to-orange-500', activeColor: 'text-yellow-300',  component: PromptEnhancer },
};

export default function ToolDedicatedPage({ defaultToolId }) {
  const { toolSlug } = useParams();
  const navigate = useNavigate();
  const { setActiveTool } = useApp();

  // Match current tool by route slug or default prop
  const currentSlug = toolSlug || defaultToolId || 'image-gen';
  const toolInfo = TOOL_CONFIG[currentSlug] || TOOL_CONFIG['image-gen'];
  const ToolComponent = toolInfo.component;

  const handleNavToTool = (slug) => {
    const config = TOOL_CONFIG[slug];
    if (config) {
      setActiveTool(config.id);
      navigate(`/dashboard/tools/${slug}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in transition-all duration-300">
      {/* Top Navigation & Back Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/tools')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-300 bg-white/5 hover:bg-purple-500/20 hover:text-white border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer shadow"
          >
            <ArrowLeft size={15} />
            <span>Back to AI Tools</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/dashboard/tools" className="hover:text-purple-300 transition-colors">AI Tools Hub</Link>
            <ChevronRight size={12} className="text-gray-600" />
            <span className={`font-semibold ${toolInfo.activeColor}`}>{toolInfo.label}</span>
          </div>
        </div>

        {/* Quick Tool Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {Object.entries(TOOL_CONFIG).map(([slug, cfg]) => (
            <button
              key={slug}
              onClick={() => handleNavToTool(slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentSlug === slug
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow'
                  : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/5'
              }`}
            >
              <cfg.icon size={13} />
              <span>{cfg.label.replace('AI ', '').replace(' Generator', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Full Page Tool Content */}
      <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
        <ToolComponent />
      </div>
    </div>
  );
}
