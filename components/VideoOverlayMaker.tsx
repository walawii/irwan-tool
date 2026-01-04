
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Layers, Video, Play, Pause, Download, Loader2, Move, Maximize, Smartphone, Trash2, RefreshCw } from 'lucide-react';

interface VideoOverlayMakerProps {
    onBack: () => void;
}

const VideoOverlayMaker: React.FC<VideoOverlayMakerProps> = ({ onBack }) => {
    const [bgVideo, setBgVideo] = useState<{ url: string; file: File } | null>(null);
    const [overlayVideo, setOverlayVideo] = useState<{ url: string; file: File } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    // Overlay Controls
    const [overlayPos, setOverlayPos] = useState({ x: 50, y: 50 }); // Percentage
    const [overlayScale, setOverlayScale] = useState(30); // Percentage
    const [overlayOpacity, setOverlayOpacity] = useState(1);

    const bgInputRef = useRef<HTMLInputElement>(null);
    const overlayInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const bgVideoEl = useRef<HTMLVideoElement>(null);
    const overlayVideoEl = useRef<HTMLVideoElement>(null);

    const handleVideoUpload = (type: 'bg' | 'overlay', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'bg') setBgVideo({ url, file });
            else setOverlayVideo({ url, file });
            setGeneratedUrl(null);
            setIsPlaying(false);
        }
        e.target.value = '';
    };

    const togglePlay = () => {
        if (!bgVideoEl.current || !overlayVideoEl.current) return;
        
        if (isPlaying) {
            bgVideoEl.current.pause();
            overlayVideoEl.current.pause();
        } else {
            // Reset to beginning if either ended
            if (overlayVideoEl.current.ended) {
                bgVideoEl.current.currentTime = 0;
                overlayVideoEl.current.currentTime = 0;
            }
            bgVideoEl.current.play();
            overlayVideoEl.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const drawFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw Background Video
        if (bgVideoEl.current && bgVideoEl.current.readyState >= 2) {
            const v = bgVideoEl.current;
            const vRatio = v.videoWidth / v.videoHeight;
            const cRatio = width / height;
            let dw, dh, dx, dy;

            if (vRatio > cRatio) {
                dh = height; dw = dh * vRatio; dx = (width - dw) / 2; dy = 0;
            } else {
                dw = width; dh = dw / vRatio; dx = 0; dy = (height - dh) / 2;
            }
            ctx.drawImage(v, dx, dy, dw, dh);
        }

        // Draw Overlay Video
        if (overlayVideoEl.current && overlayVideoEl.current.readyState >= 2) {
            const v = overlayVideoEl.current;
            const vRatio = v.videoWidth / v.videoHeight;
            
            const oWidth = (width * overlayScale) / 100;
            const oHeight = oWidth / vRatio;
            
            const ox = (width * overlayPos.x) / 100 - oWidth / 2;
            const oy = (height * overlayPos.y) / 100 - oHeight / 2;

            ctx.save();
            ctx.globalAlpha = overlayOpacity;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.drawImage(v, ox, oy, oWidth, oHeight);
            ctx.restore();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const render = () => {
            drawFrame(ctx, canvas.width, canvas.height);
            animationFrame = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [bgVideo, overlayVideo, overlayPos, overlayScale, overlayOpacity]);

    const handleExport = async () => {
        if (!bgVideo || !overlayVideo) return;
        setIsProcessing(true);
        setProgress('Preparing export...');
        setIsPlaying(false);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 720;
        canvas.height = 1280;

        const bgV = document.createElement('video');
        bgV.src = bgVideo.url;
        bgV.muted = false;
        bgV.playsInline = true;

        const ovV = document.createElement('video');
        ovV.src = overlayVideo.url;
        ovV.muted = false;
        ovV.playsInline = true;

        await Promise.all([
            new Promise(r => bgV.onloadedmetadata = r),
            new Promise(r => ovV.onloadedmetadata = r)
        ]);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        
        const bgSource = audioCtx.createMediaElementSource(bgV);
        const ovSource = audioCtx.createMediaElementSource(ovV);
        
        bgSource.connect(dest);
        ovSource.connect(dest);

        const videoStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
            videoStream.getVideoTracks()[0],
            dest.stream.getAudioTracks()[0]
        ]);

        const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setGeneratedUrl(URL.createObjectURL(blob));
            setIsProcessing(false);
            setProgress('');
            audioCtx.close();
        };

        recorder.start();
        bgV.play();
        ovV.play();

        const processFrame = () => {
            // Master clock is the overlay video
            if (ovV.ended || ovV.paused) {
                recorder.stop();
                bgV.pause();
                return;
            }
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Background
            const vRatio = bgV.videoWidth / bgV.videoHeight;
            const cRatio = canvas.width / canvas.height;
            let dw, dh, dx, dy;
            if (vRatio > cRatio) {
                dh = canvas.height; dw = dh * vRatio; dx = (canvas.width - dw) / 2; dy = 0;
            } else {
                dw = canvas.width; dh = dw / vRatio; dx = 0; dy = (canvas.height - dh) / 2;
            }
            ctx.drawImage(bgV, dx, dy, dw, dh);

            // Draw Overlay
            const ovRatio = ovV.videoWidth / ovV.videoHeight;
            const oWidth = (canvas.width * overlayScale) / 100;
            const oHeight = oWidth / ovRatio;
            const ox = (canvas.width * overlayPos.x) / 100 - oWidth / 2;
            const oy = (canvas.height * overlayPos.y) / 100 - oHeight / 2;

            ctx.save();
            ctx.globalAlpha = overlayOpacity;
            ctx.drawImage(ovV, ox, oy, oWidth, oHeight);
            ctx.restore();

            setProgress(`Exporting: ${Math.floor(ovV.currentTime)}s / ${Math.floor(ovV.duration)}s`);
            requestAnimationFrame(processFrame);
        };
        processFrame();
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar */}
            <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-auto lg:h-full z-20 shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Overlay Maker</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Video className="w-3 h-3" /> Step 1: Media
                        </label>
                        
                        <div className="space-y-3">
                            <input type="file" accept="video/*" ref={bgInputRef} className="hidden" onChange={(e) => handleVideoUpload('bg', e)} />
                            <button onClick={() => bgInputRef.current?.click()} className={`w-full py-4 px-4 bg-slate-800 border rounded-xl flex flex-col items-center gap-1 transition-all ${bgVideo ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
                                <Upload className={`w-5 h-5 ${bgVideo ? 'text-amber-500' : 'text-slate-500'}`} />
                                <span className="text-xs font-bold uppercase tracking-tighter">Background Video</span>
                                {bgVideo && <span className="text-[10px] text-slate-400 truncate w-full px-4">{bgVideo.file.name}</span>}
                            </button>

                            <input type="file" accept="video/*" ref={overlayInputRef} className="hidden" onChange={(e) => handleVideoUpload('overlay', e)} />
                            <button onClick={() => overlayInputRef.current?.click()} className={`w-full py-4 px-4 bg-slate-800 border rounded-xl flex flex-col items-center gap-1 transition-all ${overlayVideo ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
                                <Layers className={`w-5 h-5 ${overlayVideo ? 'text-blue-500' : 'text-slate-500'}`} />
                                <span className="text-xs font-bold uppercase tracking-tighter">Layer Atas (Overlay)</span>
                                {overlayVideo && <span className="text-[10px] text-slate-400 truncate w-full px-4">{overlayVideo.file.name}</span>}
                            </button>
                        </div>
                    </div>

                    {overlayVideo && (
                        <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Move className="w-3 h-3" /> Step 2: Controls
                            </label>

                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-2">
                                        <span>Scale</span>
                                        <span className="text-amber-500">{overlayScale}%</span>
                                    </div>
                                    <input type="range" min="10" max="100" value={overlayScale} onChange={(e) => setOverlayScale(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-2">
                                        <span>Position X</span>
                                        <span className="text-amber-500">{overlayPos.x}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={overlayPos.x} onChange={(e) => setOverlayPos(prev => ({ ...prev, x: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-2">
                                        <span>Position Y</span>
                                        <span className="text-amber-500">{overlayPos.y}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={overlayPos.y} onChange={(e) => setOverlayPos(prev => ({ ...prev, y: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    {generatedUrl ? (
                        <div className="space-y-2">
                            <button onClick={() => { const a = document.createElement('a'); a.href = generatedUrl; a.download = 'composited-video.webm'; a.click(); }} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 active:scale-95 transition-all">
                                <Download className="w-5 h-5" /> Download Hasil
                            </button>
                            <button onClick={() => setGeneratedUrl(null)} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:text-white transition-all">
                                <RefreshCw className="w-3 h-3 inline mr-1" /> Buat Ulang
                            </button>
                        </div>
                    ) : (
                        <button 
                            disabled={!bgVideo || !overlayVideo || isProcessing}
                            onClick={handleExport}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${isProcessing ? 'bg-slate-700 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-amber-900/20'}`}
                        >
                            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress}</> : <><Play className="w-5 h-5 fill-current" /> Render Video</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                        <Smartphone className="w-3 h-3" /> Preview Area 9:16
                    </div>

                    <div className="relative w-[300px] h-[533px] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-slate-800 ring-1 ring-slate-700 group">
                        <canvas ref={canvasRef} width={720} height={1280} className="w-full h-full object-cover" />
                        
                        {/* Hidden Video Elements for rendering */}
                        <video 
                            ref={bgVideoEl} 
                            src={bgVideo?.url} 
                            loop 
                            muted 
                            playsInline 
                            className="hidden" 
                            onEnded={() => setIsPlaying(false)}
                        />
                        <video 
                            ref={overlayVideoEl} 
                            src={overlayVideo?.url} 
                            loop 
                            muted 
                            playsInline 
                            className="hidden" 
                            onEnded={() => setIsPlaying(false)}
                        />

                        {bgVideo && overlayVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={togglePlay}>
                                <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    {isPlaying ? <Pause className="w-12 h-12 text-white fill-current" /> : <Play className="w-12 h-12 text-white fill-current" />}
                                </div>
                            </div>
                        )}

                        {!bgVideo && !overlayVideo && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-600">
                                <Maximize className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest">Silakan Unggah Video</p>
                            </div>
                        )}
                    </div>

                    {(bgVideo || overlayVideo) && (
                        <div className="flex gap-4">
                            {bgVideo && (
                                <button onClick={() => { setBgVideo(null); setIsPlaying(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-bold hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                                    <Trash2 className="w-3 h-3" /> Hapus BG
                                </button>
                            )}
                            {overlayVideo && (
                                <button onClick={() => { setOverlayVideo(null); setIsPlaying(false); }} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-bold hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                                    <Trash2 className="w-3 h-3" /> Hapus Overlay
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoOverlayMaker;
