
import React from 'react';
import { NewsOverlayState, ThemeColor } from '../types';

interface NewsOverlayProps {
  data: NewsOverlayState;
}

const NewsOverlay: React.FC<NewsOverlayProps> = ({ data }) => {
  const { headline, subheadline, theme, overlayImage, headlineSize, subheadlineSize, imageHeight } = data;

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

  // Base calculation width (virtual canvas width)
  const virtualWidth = 720;
  
  // Helper to convert pixel values from 720p design to container query units
  const toCqw = (val: number) => `${(val / virtualWidth) * 100}cqw`;
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end overflow-hidden" style={{ paddingBottom: toCqw(80) }}>
      
      {/* Main Lower Third Area */}
      <div className="w-full relative" style={{ paddingLeft: toCqw(32), paddingRight: toCqw(32) }}>
        
        {/* Animated Entrance Wrapper */}
        <div className="animate-slide-up flex flex-col items-start">
            
            {/* Overlay Image (Full Width of Container, Scaled Height) */}
            {overlayImage && (
                <div className="w-full relative animate-fade-in" style={{ marginBottom: toCqw(20) }}>
                    <div 
                        className="w-full border-white shadow-2xl overflow-hidden bg-black"
                        style={{ 
                            height: toCqw(imageHeight), 
                            borderWidth: toCqw(4),
                            // Allow width to exceed container slightly if needed for effect, but contained for now
                            width: '100%' 
                        }}
                    >
                        <img 
                            src={overlayImage} 
                            alt="News Graphic" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Breaking News Label */}
            <div className="flex items-center gap-1" style={{ marginBottom: toCqw(5) }}>
                <div 
                    className={`${colors.bgMain} text-white font-black uppercase tracking-tighter skew-x-[-10deg]`}
                    style={{
                        fontSize: toCqw(20),
                        padding: `${toCqw(4)} ${toCqw(16)}`
                    }}
                >
                    Breaking News
                </div>
                {/* Decoration Line */}
                <div className="h-0.5 bg-white/20" style={{ width: toCqw(100), height: toCqw(2) }}></div>
            </div>

            {/* Headline Box */}
            <div 
                className={`bg-white/95 backdrop-blur-sm border-l-black shadow-2xl transform skew-x-[-2deg]`}
                style={{
                    borderLeftWidth: toCqw(15),
                    padding: `${toCqw(12)} ${toCqw(24)}`,
                    marginBottom: toCqw(8)
                }}
            >
                <h1 
                    className="text-black font-black uppercase leading-none news-font transform skew-x-[2deg] drop-shadow-sm"
                    style={{ fontSize: toCqw(headlineSize) }}
                >
                    {headline || "HEADLINE TEXT HERE"}
                </h1>
            </div>

            {/* Sub-Headline Box */}
            {subheadline && (
                <div 
                    className={`inline-block ${colors.bgDark}/95 backdrop-blur-md transform skew-x-[-2deg] shadow-lg max-w-[95%]`}
                    style={{
                        padding: `${toCqw(10)} ${toCqw(20)}`
                    }}
                >
                    <h2 
                        className="text-white font-bold uppercase leading-tight news-font transform skew-x-[2deg]"
                        style={{ fontSize: toCqw(subheadlineSize) }}
                    >
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
