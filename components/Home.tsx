
import React from 'react';
import { Clapperboard, FileSpreadsheet, ArrowRight, Scissors, Sparkles, Film, Hash, Utensils, Bike } from 'lucide-react';
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
          
          {/* MiniLapse Studio AI Card (Master Storyboard ASMR Generator) */}
          <button 
            onClick={() => onNavigate('minilapse-studio')}
            className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.25)] flex flex-col min-h-[16rem] col-span-1 md:col-span-2 lg:col-span-1"
          >
            <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-cyan-400/40">
              <Film className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-cyan-400/30 tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              NEW MASTER AI
            </span>
            <h3 className="text-lg font-black text-white mb-2 group-hover:text-cyan-300 transition-colors uppercase tracking-tight flex items-center gap-2">
              MiniLapse Studio AI
            </h3>
            <p className="text-slate-300 text-[11px] mb-6 leading-relaxed font-medium">
              Generator Master Storyboard 9:16 untuk video ASMR Timelapse Miniatur (Honda PCX, Suzuki Jimny, Gundam, Diecast). Hasilkan prompt Midjourney, Veo/Luma video prompt, & JSON Flow AI!
            </p>
            <div className="mt-auto flex items-center text-cyan-300 text-[10px] font-black uppercase tracking-widest">
              Buka Studio <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1.5 transition-transform text-cyan-400" />
            </div>
          </button>

          {/* Image to Video Card */}
          <button 
            onClick={() => onNavigate('image-to-video')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-teal-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-teal-400/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors uppercase tracking-tight">Image to Video</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Animate any image with a text prompt using Google's Veo AI model.
            </p>
            <div className="mt-auto flex items-center text-teal-400 text-[10px] font-semibold uppercase tracking-widest">
              Generate Video <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Mini Cooking Video Card */}
          <button 
            onClick={() => onNavigate('mini-cooking')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-pink-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="w-5 h-5 text-pink-500" />
            </div>
            <span className="absolute top-4 right-4 bg-pink-500/10 text-pink-400 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-pink-500/20 tracking-wider">
              ASMR ACTIVE
            </span>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-500 transition-colors uppercase tracking-tight">Mini Cooking Video</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Asset generation dari gambar hingga video prompt. Buat storyboard masakan miniatur estetik & ASMR.
            </p>
            <div className="mt-auto flex items-center text-pink-500 text-[10px] font-semibold uppercase tracking-widest">
              Mulai Cooking <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Mini Toy Studio / Assembly Generator */}
          <button 
            onClick={() => onNavigate('mini-toy')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-cyan-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-cyan-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bike className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute top-4 right-4 bg-cyan-500/10 text-cyan-400 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-cyan-500/20 tracking-wider">
              NEW TOY ASMR
            </span>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">Mini Toy Studio</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Buat skenario rakitan miniatur mainan (motor Ninja H2R, robot, diecast) dengan desis oli & desing mesin ASMR garing.
            </p>
            <div className="mt-auto flex items-center text-cyan-400 text-[10px] font-semibold uppercase tracking-widest">
              Rakit Miniatur <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Auto Caption & Tagar Card */}
          <button 
            onClick={() => onNavigate('caption-generator')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-emerald-400 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] flex flex-col min-h-[16rem]"
          >
            <div className="bg-emerald-400/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Hash className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">Caption & Tagar</h3>
            <p className="text-slate-400 text-[10px] mb-6 leading-relaxed">
              Generate viral captions and trending hashtags based on your product image.
            </p>
            <div className="mt-auto flex items-center text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">
              Generate <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          

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

        </div>
      </div>
      
      <div className="relative lg:absolute bottom-6 text-slate-600 text-[10px] mt-10 lg:mt-0 uppercase font-black tracking-widest">
        v2.2.0 • Irwan Kurnia Tools
      </div>
    </div>
  );
};

export default Home;
