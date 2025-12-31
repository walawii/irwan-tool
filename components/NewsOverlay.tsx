import React from 'react';
import { NewsOverlayState, ThemeColor } from '../types';

interface NewsOverlayProps {
  data: NewsOverlayState;
}

const NewsOverlay: React.FC<NewsOverlayProps> = ({ data }) => {
  const { headline, subheadline, theme, overlayImage } = data;

  const getColorClasses = () => {
    switch (theme) {
      case ThemeColor.BLUE:
        return {
          bgMain: 'bg-blue-700',
          bgDark: 'bg-blue-900',
          textAccent: 'text-blue-400',
          border: 'border-blue-500'
        };
      case ThemeColor.PURPLE:
        return {
          bgMain: 'bg-purple-700',
          bgDark: 'bg-purple-900',
          textAccent: 'text-purple-400',
          border: 'border-purple-500'
        };
      case ThemeColor.RED:
      default:
        return {
          bgMain: 'bg-red-700',
          bgDark: 'bg-red-900',
          textAccent: 'text-red-400',
          border: 'border-red-500'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-12 overflow-hidden">
      
      {/* Main Lower Third Area */}
      <div className="w-full relative px-4 mb-4">
        
        {/* Animated Entrance Wrapper */}
        <div className="animate-slide-up flex flex-col items-start">
            
            {/* Overlay Image (Full Width) */}
            {overlayImage && (
                <div className="w-[calc(100%+2rem)] -ml-4 mb-4 relative animate-fade-in">
                     {/* Height kept as is (h-64/h-80), Width fills frame */}
                    <div className="w-full h-64 md:h-80 border-4 border-white shadow-2xl overflow-hidden bg-black">
                        <img 
                            src={overlayImage} 
                            alt="News Graphic" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Breaking News Label */}
            <div className="flex items-center gap-2 mb-1">
                <div className={`${colors.bgMain} text-white text-xs font-black uppercase px-2 py-0.5 tracking-tighter skew-x-[-10deg]`}>
                    Breaking News
                </div>
                <div className="flex-1 h-0.5 bg-white/20"></div>
            </div>

            {/* Headline Box */}
            <div className="bg-white/95 backdrop-blur-sm border-l-8 border-l-black shadow-2xl p-4 transform skew-x-[-2deg] mb-1">
                <h1 className="text-black font-black text-3xl uppercase leading-none news-font transform skew-x-[2deg] drop-shadow-sm max-w-[280px]">
                    {headline || "HEADLINE TEXT HERE"}
                </h1>
            </div>

            {/* Sub-Headline Box */}
            {subheadline && (
                <div className={`inline-block ${colors.bgDark}/90 backdrop-blur-md px-4 py-2 transform skew-x-[-2deg] shadow-lg max-w-[90%]`}>
                    <h2 className="text-white font-bold text-lg uppercase leading-tight news-font transform skew-x-[2deg]">
                        {subheadline}
                    </h2>
                </div>
            )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out 0.2s forwards;
            opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default NewsOverlay;