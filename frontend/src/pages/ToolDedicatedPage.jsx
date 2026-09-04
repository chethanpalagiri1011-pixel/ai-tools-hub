import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ImageIcon, FileText, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageGenerator from '../components/tools/ImageGenerator';
import TextSummarizer from '../components/tools/TextSummarizer';
import CaptionGenerator from '../components/tools/CaptionGenerator';
import PromptEnhancer from '../components/tools/PromptEnhancer';
import CinematicVideoBackdrop from '../components/CinematicVideoBackdrop';

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
    <div className="relative min-h-screen">
      {/* Rolex-Style Full-Frame Cinematic Video Backdrop */}
      <CinematicVideoBackdrop toolSlug={currentSlug} />

      {/* Main UI Overlaid on Top of Video */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 animate-fade-in transition-all duration-300 py-2">
        {/* Top Navigation & Back Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/tools')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-200 bg-white/10 hover:bg-purple-600/30 hover:text-white border border-white/15 hover:border-purple-500/40 transition-all cursor-pointer shadow-lg backdrop-blur-md"
            >
              <ArrowLeft size={15} />
              <span>Back to AI Tools</span>
            </button>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300">
              <Link to="/dashboard/tools" className="hover:text-purple-300 transition-colors font-medium">AI Tools Hub</Link>
              <ChevronRight size={12} className="text-gray-500" />
              <span className={`font-bold ${toolInfo.activeColor}`}>{toolInfo.label}</span>
            </div>
          </div>

          {/* Quick Tool Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {Object.entries(TOOL_CONFIG).map(([slug, cfg]) => (
              <button
                key={slug}
                onClick={() => handleNavToTool(slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer backdrop-blur-md ${
                  currentSlug === slug
                    ? 'bg-purple-600/40 text-white border border-purple-500/60 shadow-lg shadow-purple-500/20'
                    : 'bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:bg-white/15'
                }`}
              >
                <cfg.icon size={13} />
                <span>{cfg.label.replace('AI ', '').replace(' Generator', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Tool UI Box Overlaid on Video */}
        <div className="p-6 rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl">
          <ToolComponent />
        </div>
      </div>
    </div>
  );
}
