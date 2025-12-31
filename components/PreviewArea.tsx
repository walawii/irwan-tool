import React, { useRef, useEffect } from 'react';
import { NewsItem, GlobalState } from '../types';
import NewsOverlay from './NewsOverlay';
import { Film } from 'lucide-react';

interface PreviewAreaProps {
  activeItem: NewsItem;
  globalState: GlobalState;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ activeItem, globalState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync audio with video play/pause
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (audio.src !== globalState.audioUrl && globalState.audioUrl) {
        audio.load();
    }

    const onPlay = () => audio.play().catch(() => {});
    const onPause = () => audio.pause();
    const onSeek = () => { audio.currentTime = video.currentTime; };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeking', onSeek);
    
    return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('seeking', onSeek);
    };
  }, [globalState.audioUrl, activeItem.videoUrl]); 

  return (
    <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">
                Live Preview (Muted)
            </h2>
            
            <div className="relative w-[360px] h-[640px] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700">
                {activeItem.videoUrl ? (
                    <video 
                        key={activeItem.videoUrl} 
                        ref={videoRef}
                        src={activeItem.videoUrl} 
                        autoPlay 
                        loop 
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-600 p-8 text-center">
                        <Film className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-sm">No video uploaded.</p>
                        <p className="text-xs mt-2 opacity-60">Upload a background video in the sidebar.</p>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
                    </div>
                )}

                {globalState.audioUrl && (
                    <audio ref={audioRef} src={globalState.audioUrl} loop muted />
                )}

                <NewsOverlay data={activeItem} />

            </div>
            
            <p className="text-xs text-slate-500 mt-4 max-w-sm text-center">
                Previewing Clip: {activeItem.headline}
            </p>
        </div>
    </div>
  );
};

export default PreviewArea;