import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Star, ImageIcon, FileText, MessageSquare,
  Sparkles, Shield, Globe, BarChart3, CheckCircle2, ChevronRight,
  Menu, X
} from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: ImageIcon,
    title: 'AI Image Generator',
    desc: 'Transform text into stunning visuals with our advanced image generation engine.',
    color: 'from-purple-500 to-pink-500',
    tag: 'Most Popular'
  },
  {
    icon: FileText,
    title: 'Smart Summarizer',
    desc: 'Condense long documents into key insights in seconds with AI precision.',
    color: 'from-blue-500 to-cyan-500',
    tag: ''
  },
  {
    icon: MessageSquare,
    title: 'Caption Generator',
    desc: 'Create engaging captions for any platform — tailored to your brand voice.',
    color: 'from-teal-500 to-green-500',
    tag: ''
  },
  {
    icon: Sparkles,
    title: 'Prompt Enhancer',
    desc: 'Supercharge your AI prompts for better, more consistent results every time.',
    color: 'from-yellow-500 to-orange-500',
    tag: 'New'
  },
];



const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for exploring',
    features: ['50 AI generations/month', '3 tools access', 'Standard quality', 'Community support'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For power users',
    features: ['500 AI generations/month', 'All 4 tools', 'HD quality output', 'Priority support', 'History & exports', 'API access'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: 'For growing teams',
    features: ['Unlimited generations', 'All Pro features', 'Team workspace', 'Custom branding', 'Analytics dashboard', 'Dedicated support'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-400 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
             style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-8 blur-3xl"
             style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute inset-0 bg-grid" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
           style={{ background: 'rgba(5,5,20,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0 }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AI Tools Hub" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-white text-lg">AI Tools Hub</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features"  className="hover:text-white transition-colors">Features</a>
          <a href="#pricing"   className="hover:text-white transition-colors">Pricing</a>
          <a href="#about"     className="hover:text-white transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <button onClick={() => navigate('/signup')}
            className="btn-primary py-2 px-5 text-sm">
            Get Started Free
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 px-6 pb-6 flex flex-col gap-4"
             style={{ background: 'rgba(5,5,20,0.98)', backdropFilter: 'blur(20px)' }}>
          <a href="#features" className="py-3 border-b border-white/5 text-gray-300" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing"  className="py-3 border-b border-white/5 text-gray-300" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <Link to="/login"  className="py-3 border-b border-white/5 text-gray-300" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
          <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
            className="btn-primary w-full mt-2">Get Started Free</button>
        </div>
      )}

      {/* HERO */}
      <section className="relative pt-24 pb-20 px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-in"
             style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc' }}>
          <Sparkles size={12} />
          Powered by Advanced AI Models
          <span className="w-1 h-1 rounded-full bg-purple-400" />
          v2.0 Now Live
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
          The AI Toolkit for{' '}
          <span className="gradient-text">Creative Minds</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
          Generate images, summarize documents, craft captions, and enhance prompts —
          all in one beautiful platform built for the modern creator.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
          <button onClick={() => navigate('/signup')}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center">
            Start Creating Free
            <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')}
            className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5 w-full sm:w-auto justify-center">
            See Demo
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-10 text-xs text-gray-600 animate-fade-in-up delay-300">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> No credit card</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> 50 free credits</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Cancel anytime</span>
        </div>

        {/* Hero Image mockup */}
        <div className="mt-16 max-w-4xl mx-auto relative animate-fade-in-up delay-400">
          <div className="absolute inset-0 rounded-2xl blur-3xl opacity-20"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }} />
          <div className="relative rounded-2xl overflow-hidden border border-white/10"
               style={{ background: 'rgba(13,13,26,0.9)' }}>
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 rounded px-3 py-1 text-xs text-gray-600 text-left"
                   style={{ background: 'rgba(255,255,255,0.03)' }}>
                app.aitoolshub.com/dashboard
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <div key={f.title}
                  className="p-4 rounded-xl border border-white/5 text-left"
                  style={{ background: 'rgba(255,255,255,0.03)', animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                    <f.icon size={16} className="text-white" />
                  </div>
                  <p className="text-white text-xs font-semibold">{f.title}</p>
                  <p className="text-gray-600 text-xs mt-1 hidden md:block">AI-powered</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">create</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Four powerful AI tools in one platform — no switching between apps, no subscriptions juggling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="relative p-6 rounded-2xl border border-white/8 group hover:border-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(59,130,246,0.05))' }} />

                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <f.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                      {f.tag && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}>
                          {f.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>

                <div className="relative mt-4 flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:gap-2 transition-all">
                  <span>Try it free</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="about" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Why <span className="gradient-text">AI Tools Hub</span>?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield,   title: 'Secure & Private',    desc: 'Your data is encrypted and never used to train models. Full GDPR compliance.' },
              { icon: Globe,    title: 'Global CDN',           desc: 'Lightning-fast responses worldwide with 99.9% uptime SLA guaranteed.' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track your usage, favorite tools, and generation history in one place.' },
            ].map(item => (
              <div key={item.title}
                className="p-6 rounded-2xl border border-white/8 text-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                     style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <item.icon size={22} className="text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="text-gray-400">Start for free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name}
                className={`relative p-6 rounded-2xl border transition-all duration-300
                  ${plan.highlight
                    ? 'border-purple-500/50 shadow-glow-purple'
                    : 'border-white/8 hover:border-white/15'
                  }`}
                style={{ background: plan.highlight ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)' }}>

                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                       style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.desc}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-bold font-display text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
                    ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build something <span className="gradient-text">amazing</span>?
            </h2>
            <p className="text-gray-400 mb-8">Join 50,000+ creators already using AI Tools Hub.</p>
            <button onClick={() => navigate('/signup')}
              className="btn-primary flex items-center gap-2 mx-auto">
              Get Started — It's Free
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AI Tools Hub" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-white font-semibold text-sm">AI Tools Hub</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 AI Tools Hub. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-600">
            {/* Social icons removed due to missing lucide-react exports */}
          </div>
        </div>
      </footer>
    </div>
  );
}
