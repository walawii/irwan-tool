
import React from 'react';
import { Clapperboard, FileSpreadsheet, ArrowRight, Youtube, LayoutTemplate } from 'lucide-react';
import { ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent tracking-tight">
          IRWAN KURNIA
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Content creation suite. Professional tools for video editing, branding, and data scraping.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          
          {/* Video Editor Card */}
          <button 
            onClick={() => onNavigate('editor')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col h-72"
          >
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clapperboard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Video Editor</h3>
            <p className="text-slate-400 text-xs mb-auto leading-relaxed">
              Create professional 9:16 news videos with overlay graphics, images, and text.
            </p>
            <div className="flex items-center text-blue-400 text-xs font-semibold mt-4">
              Open Studio <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Frame & Watermark Card */}
          <button 
            onClick={() => onNavigate('frames')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col h-72"
          >
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LayoutTemplate className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Frame & Brand</h3>
            <p className="text-slate-400 text-xs mb-auto leading-relaxed">
              Add custom frames and transparent watermarks to your videos for consistent branding.
            </p>
            <div className="flex items-center text-purple-400 text-xs font-semibold mt-4">
              Apply Frames <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Scraper Card */}
          <button 
            onClick={() => onNavigate('scraper')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col h-72"
          >
            <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Article Scraper</h3>
            <p className="text-slate-400 text-xs mb-auto leading-relaxed">
              Extract headlines, paragraphs, and images from URLs and export directly to Excel.
            </p>
            <div className="flex items-center text-green-400 text-xs font-semibold mt-4">
              Open Tool <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* YouTube Downloader Card */}
          <button 
            onClick={() => onNavigate('shorts')}
            className="group relative bg-slate-900/50 border border-slate-700 hover:border-red-500 rounded-2xl p-6 text-left transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col h-72"
          >
            <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">Shorts Downloader</h3>
            <p className="text-slate-400 text-xs mb-auto leading-relaxed">
              Batch process YouTube Shorts links and download high-quality vertical videos.
            </p>
            <div className="flex items-center text-red-500 text-xs font-semibold mt-4">
              Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
      
      <div className="absolute bottom-6 text-slate-600 text-xs">
        v1.5.0 • Irwan Kurnia Tools
      </div>
    </div>
  );
};

export default Home;
