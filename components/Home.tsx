
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

      <div className="relative z-10 max-w-7xl w-full text-center my-10">
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent tracking-tight uppercase">
          IRWAN KURNIA
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Content creation suite. Professional tools for video editing, branding, and narrative production.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full mx-auto">
          
          {/* Story Board Studio Card */}
          <button 
            onClick={() => onNavigate('story-board')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-cyan-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-cyan-400/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">Story Board</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Create consistent narratives with AI characters and scene breakdown.
            </p>
            <div className="mt-auto flex items-center text-cyan-400 text-[10px] font-semibold uppercase tracking-widest">
              Open Studio <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Prompt Creator Card */}
          <button 
            onClick={() => onNavigate('prompt-creator')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-amber-400/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors uppercase tracking-tight">Prompt Creator</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Analyze video content and generate professional prompts for Veo3 or Flow.
            </p>
            <div className="mt-auto flex items-center text-amber-400 text-[10px] font-semibold uppercase tracking-widest">
              Generate <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Video Editor Card */}
          <button 
            onClick={() => onNavigate('editor')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clapperboard className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">News Editor</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Create professional 9:16 news videos with breaking news graphics.
            </p>
            <div className="mt-auto flex items-center text-blue-400 text-[10px] font-semibold uppercase tracking-widest">
              Edit Video <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Auto Splitter Card */}
          <button 
            onClick={() => onNavigate('video-splitter')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-pink-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scissors className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-500 transition-colors uppercase tracking-tight">Auto Splitter</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Automatically chop videos into 15-second vertical clips.
            </p>
            <div className="mt-auto flex items-center text-pink-500 text-[10px] font-semibold uppercase tracking-widest">
              Split Media <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Facebook Scheduler Card */}
          <button 
            onClick={() => onNavigate('fb-scheduler')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-[#1877F2] rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(24,119,242,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-blue-600/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Facebook className="w-5 h-5 text-[#1877F2]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1877F2] transition-colors uppercase tracking-tight">Reels Scheduler</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Upload and schedule Facebook Reels directly to your Pages.
            </p>
            <div className="mt-auto flex items-center text-[#1877F2] text-[10px] font-semibold uppercase tracking-widest">
              Schedule <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Graphic Studio Card */}
          <button 
            onClick={() => onNavigate('image-studio')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-indigo-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">Graphic Studio</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Produce high-quality images and add professional text overlays.
            </p>
            <div className="mt-auto flex items-center text-indigo-400 text-[10px] font-semibold uppercase tracking-widest">
              Open Studio <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Article Scraper Card */}
          <button 
            onClick={() => onNavigate('scraper')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30_rgba(34,197,94,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-green-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors uppercase tracking-tight">Article Scraper</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Extract headlines, paragraphs, and images from URLs to Excel.
            </p>
            <div className="mt-auto flex items-center text-green-400 text-[10px] font-semibold uppercase tracking-widest">
              Scrape Now <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* YouTube Downloader Card */}
          <button 
            onClick={() => onNavigate('shorts')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-red-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-red-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-500 transition-colors uppercase tracking-tight">Shorts Downloader</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Batch process and download high-quality vertical videos.
            </p>
            <div className="mt-auto flex items-center text-red-500 text-[10px] font-semibold uppercase tracking-widest">
              Download <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Frame & Brand Card */}
          <button 
            onClick={() => onNavigate('frames')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutTemplate className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">Frame & Brand</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Add custom frames and watermarks to your videos.
            </p>
            <div className="mt-auto flex items-center text-purple-400 text-[10px] font-semibold uppercase tracking-widest">
              Apply Frames <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Video Overlay Maker Card */}
          <button 
            onClick={() => onNavigate('overlay')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">Video Overlay</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Stack two videos for reaction or tutorial content.
            </p>
            <div className="mt-auto flex items-center text-emerald-500 text-[10px] font-semibold uppercase tracking-widest">
              Create Overlay <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
      
      <div className="relative lg:absolute bottom-6 text-slate-600 text-[10px] mt-10 lg:mt-0 uppercase font-black tracking-widest">
        v2.2.0 • Irwan Kurnia Tools
      </div>
    </div>
  );
};

export default Home;
