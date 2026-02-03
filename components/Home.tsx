
import React from 'react';
import { Clapperboard, FileSpreadsheet, ArrowRight, Youtube, LayoutTemplate, Layers, ImageIcon, Facebook, Scissors, Sparkles, Film } from 'lucide-react';
import { ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-x-hidden font-inter">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full text-center my-10 lg:my-0">
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent tracking-tight uppercase">
          IRWAN KURNIA
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Content creation suite. Professional tools for video editing, branding, and narrative production.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          
          {/* Story Board Studio Card */}
          <button 
            onClick={() => onNavigate('story-board')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-cyan-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-cyan-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">Story Board Studio</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Create consistent narratives. Input your idea and character details to generate professional scenes and AI prompts.
            </p>
            <div className="mt-auto flex items-center text-cyan-400 text-xs font-semibold">
              Create Storyboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Prompt Creator Card */}
          <button 
            onClick={() => onNavigate('prompt-creator')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-amber-400/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors uppercase tracking-tight">Prompt Creator</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Analyze video content and generate professional JSON prompts for Veo3, Flow, or Midjourney.
            </p>
            <div className="mt-auto flex items-center text-amber-400 text-xs font-semibold">
              Generate Prompts <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Video Editor Card */}
          <button 
            onClick={() => onNavigate('editor')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clapperboard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">News Editor</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Create professional 9:16 news videos with breaking news graphics and text overlays.
            </p>
            <div className="mt-auto flex items-center text-blue-400 text-xs font-semibold">
              Open Editor <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Auto Splitter Card */}
          <button 
            onClick={() => onNavigate('video-splitter')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-pink-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Scissors className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-500 transition-colors uppercase tracking-tight">Auto Splitter</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Automatically chop videos into 15-second clips. Converts any video to 9:16 vertical format.
            </p>
            <div className="mt-auto flex items-center text-pink-500 text-xs font-semibold">
              Split Video <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Facebook Scheduler Card */}
          <button 
            onClick={() => onNavigate('fb-scheduler')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-[#1877F2] rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(24,119,242,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-blue-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Facebook className="w-6 h-6 text-[#1877F2]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#1877F2] transition-colors uppercase tracking-tight">Reels Scheduler</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Upload and schedule Facebook Reels directly to your Pages with Meta Business integration.
            </p>
            <div className="mt-auto flex items-center text-[#1877F2] text-xs font-semibold">
              Open Scheduler <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Image Production Card */}
          <button 
            onClick={() => onNavigate('image-studio')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col min-h-[18rem] h-auto"
          >
            <div className="bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">Graphic Studio</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Produce high-quality images using AI and add professional text overlays for social media or news.
            </p>
            <div className="mt-auto flex items-center text-indigo-400 text-xs font-semibold">
              Create Graphics <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
      
      <div className="relative lg:absolute bottom-6 text-slate-600 text-xs mt-10 lg:mt-0 uppercase font-black tracking-widest">
        v2.1.0 • Irwan Kurnia Tools
      </div>
    </div>
  );
};

export default Home;
