
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Layers, Video, Play, Pause, Download, Loader2, Move, Maximize, Smartphone, Trash2, RefreshCw, Plus, List, CheckCircle, AlertCircle, MoveHorizontal, MoveVertical, RotateCw, Sun, ChevronUp, ChevronDown } from 'lucide-react';
import { OverlayItem } from '../types';

interface VideoOverlayMakerProps {
    onBack: () => void;
}

const VideoOverlayMaker: React.FC<VideoOverlayMakerProps> = ({ onBack }) => {
    const [items, setItems] = useState<OverlayItem[]>([{
        id: Math.random().toString(36).substr(2, 9),
        bgVideo: null,
        overlayVideo: null,
        status: 'idle',
        generatedUrl: null,
        config: { x: 50, y: 50, width: 40, height: 40, opacity: 1, rotation: 0 }
    }]);
    const [activeId, setActiveId] = useState<string>(items[0].id);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const activeItem = items.find(i => i.id === activeId) || items[0];

    const bgInputRef = useRef<HTMLInputElement>(null);
    const overlayInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const bgVideoEl = useRef<HTMLVideoElement>(null);
    const overlayVideoEl = useRef<HTMLVideoElement>(null);

    const updateActiveItem = (updates: Partial<OverlayItem> | { config: Partial<OverlayItem['config']> }) => {
        setItems(prev => prev.map(item => {
            if (item.id !== activeId) return item;
            if ('config' in updates) {
                return { ...item, config: { ...item.config, ...updates.config } };
            }
            return { ...item, ...updates };
        }));
    };

    const handleVideoUpload = (type: 'bg' | 'overlay', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'bg') updateActiveItem({ bgVideo: { url, file }, generatedUrl: null });
            else {
                // When uploading overlay, try to set a default height that maintains aspect ratio
                const tempVideo = document.createElement('video');
                tempVideo.src = url;
                tempVideo.onloadedmetadata = () => {
                    const ratio = tempVideo.videoWidth / tempVideo.videoHeight;
                    // For a 9:16 canvas (720x1280), if width is 40% (288px), 
                    // height should be (288 / ratio) which is (0.4 * 720 / ratio) / 1280 of canvas height
                    const hPercent = (0.4 * 720 / ratio) / 1280 * 100;
                    updateActiveItem({ 
                        overlayVideo: { url, file }, 
                        generatedUrl: null,
                        config: { ...activeItem.config, height: Math.round(hPercent) }
                    });
                };
            }
            setIsPlaying(false);
        }
        e.target.value = '';
    };

    const addItem = () => {
        const newItem: OverlayItem = {
            id: Math.random().toString(36).substr(2, 9),
            bgVideo: null,
            overlayVideo: activeItem.overlayVideo, // Preserve overlay by default
            status: 'idle',
            generatedUrl: null,
            config: { ...activeItem.config }
        };
        setItems(prev => [...prev, newItem]);
        setActiveId(newItem.id);
    };

    const removeItem = (id: string) => {
        if (items.length <= 1) return;
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        if (activeId === id) setActiveId(newItems[0].id);
    };

    const resetTransform = () => {
        updateActiveItem({ config: { x: 50, y: 50, width: 40, height: 40, opacity: 1, rotation: 0 } });
    };

    const togglePlay = () => {
        if (!bgVideoEl.current || !overlayVideoEl.current) return;
        
        if (isPlaying) {
            bgVideoEl.current.pause();
            overlayVideoEl.current.pause();
        } else {
            if (overlayVideoEl.current.ended) {
                bgVideoEl.current.currentTime = 0;
                overlayVideoEl.current.currentTime = 0;
            }
            bgVideoEl.current.play();
            overlayVideoEl.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const drawFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, item: OverlayItem) => {
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
            
            const oWidth = (width * item.config.width) / 100;
            const oHeight = (height * item.config.height) / 100;
            
            const ox = (width * item.config.x) / 100;
            const oy = (height * item.config.y) / 100;

            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate((item.config.rotation * Math.PI) / 180);
            ctx.globalAlpha = item.config.opacity;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            // Draw centered
            ctx.drawImage(v, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
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
            drawFrame(ctx, canvas.width, canvas.height, activeItem);
            animationFrame = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [activeId, items, isPlaying]);

    const processSingleExport = async (item: OverlayItem): Promise<string> => {
        if (!item.bgVideo || !item.overlayVideo) throw new Error("Missing media");

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context error");
        canvas.width = 720;
        canvas.height = 1280;

        const bgV = document.createElement('video');
        bgV.src = item.bgVideo.url;
        bgV.muted = false;
        bgV.playsInline = true;

        const ovV = document.createElement('video');
        ovV.src = item.overlayVideo.url;
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

        return new Promise((resolve, reject) => {
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(URL.createObjectURL(blob));
                audioCtx.close();
            };

            recorder.start();
            bgV.play();
            ovV.play();

            const renderLoop = () => {
                if (ovV.ended || ovV.paused) {
                    recorder.stop();
                    bgV.pause();
                    return;
                }
                
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const vRatio = bgV.videoWidth / bgV.videoHeight;
                const cRatio = canvas.width / canvas.height;
                let dw, dh, dx, dy;
                if (vRatio > cRatio) {
                    dh = canvas.height; dw = dh * vRatio; dx = (canvas.width - dw) / 2; dy = 0;
                } else {
                    dw = canvas.width; dh = dw / vRatio; dx = 0; dy = (canvas.height - dh) / 2;
                }
                ctx.drawImage(bgV, dx, dy, dw, dh);

                const oWidth = (canvas.width * item.config.width) / 100;
                const oHeight = (canvas.height * item.config.height) / 100;
                const ox = (canvas.width * item.config.x) / 100;
                const oy = (canvas.height * item.config.y) / 100;

                ctx.save();
                ctx.translate(ox, oy);
                ctx.rotate((item.config.rotation * Math.PI) / 180);
                ctx.globalAlpha = item.config.opacity;
                ctx.drawImage(ovV, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
                ctx.restore();

                setProgress(`Processing: ${Math.floor(ovV.currentTime)}s / ${Math.floor(ovV.duration)}s`);
                requestAnimationFrame(renderLoop);
            };
            renderLoop();
        });
    };

    const triggerDownload = (url: string, originalName: string) => {
        const a = document.createElement('a');
        a.href = url;
        const lastDotIndex = originalName.lastIndexOf('.');
        const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
        const safeName = baseName.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'video';
        a.download = `${safeName}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleBatchExport = async () => {
        const validItems = items.filter(i => i.bgVideo && i.overlayVideo && i.status !== 'done');
        if (validItems.length === 0) return;

        setIsProcessing(true);
        setIsPlaying(false);

        for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];
            setItems(prev => prev.map(v => v.id === item.id ? { ...v, status: 'processing' } : v));
            setProgress(`Exporting item ${i + 1}/${validItems.length}...`);

            try {
                const url = await processSingleExport(item);
                setItems(prev => prev.map(v => v.id === item.id ? { ...v, status: 'done', generatedUrl: url } : v));
                
                if (item.overlayVideo) {
                    triggerDownload(url, item.overlayVideo.file.name);
                }
            } catch (err) {
                console.error(err);
                setItems(prev => prev.map(v => v.id === item.id ? { ...v, status: 'error' } : v));
            }
        }

        setIsProcessing(false);
        setProgress('');
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full lg:overflow-hidden overflow-x-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar Toggle (Mobile) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-amber-600 p-4 rounded-full shadow-2xl text-white active:scale-90 transition-transform"
            >
                {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
            </button>

            {/* Sidebar */}
            <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shadow-2xl overflow-hidden ${isSidebarOpen ? 'h-[70vh] lg:h-full' : 'h-0 lg:h-full'}`}>
                <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Overlay Maker</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8 scrollbar-thin">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <List className="w-3 h-3" /> Queue ({items.length})
                            </label>
                            <button onClick={addItem} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
                            {items.map((item, idx) => (
                                <div 
                                    key={item.id}
                                    onClick={() => { setActiveId(item.id); setIsPlaying(false); }}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${activeId === item.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {item.status === 'processing' ? <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> :
                                         item.status === 'done' ? <CheckCircle className="w-3 h-3 text-green-500" /> :
                                         <span className="text-[10px] font-bold text-slate-600">#{idx + 1}</span>}
                                        <span className="text-[10px] font-medium truncate text-slate-400">{item.bgVideo?.file.name || 'Empty slot'}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-all">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-800 pt-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Video className="w-3 h-3" /> Active Media
                        </label>
                        
                        <div className="space-y-2">
                            <input type="file" accept="video/*" ref={bgInputRef} className="hidden" onChange={(e) => handleVideoUpload('bg', e)} />
                            <button onClick={() => bgInputRef.current?.click()} className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl flex items-center gap-3 transition-all ${activeItem.bgVideo ? 'border-amber-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                                <Upload className={`w-3.5 h-3.5 ${activeItem.bgVideo ? 'text-amber-500' : 'text-slate-500'}`} />
                                <span className="text-[11px] font-bold truncate flex-1 text-left">{activeItem.bgVideo?.file.name || 'Background Video'}</span>
                            </button>

                            <input type="file" accept="video/*" ref={overlayInputRef} className="hidden" onChange={(e) => handleVideoUpload('overlay', e)} />
                            <button onClick={() => overlayInputRef.current?.click()} className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl flex items-center gap-3 transition-all ${activeItem.overlayVideo ? 'border-blue-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                                <Layers className={`w-3.5 h-3.5 ${activeItem.overlayVideo ? 'text-blue-500' : 'text-slate-500'}`} />
                                <span className="text-[11px] font-bold truncate flex-1 text-left">{activeItem.overlayVideo?.file.name || 'Overlay Video'}</span>
                            </button>
                        </div>
                    </div>

                    {activeItem.overlayVideo && (
                        <div className="space-y-6 pt-2 border-t border-slate-800 pt-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Move className="w-3 h-3" /> Transformations
                                </label>
                                <button onClick={resetTransform} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span className="flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> Width</span>
                                            <span className="text-amber-500">{activeItem.config.width}%</span>
                                        </div>
                                        <input type="range" min="5" max="150" value={activeItem.config.width} onChange={(e) => updateActiveItem({ config: { width: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span className="flex items-center gap-1"><MoveVertical className="w-3 h-3" /> Height</span>
                                            <span className="text-amber-500">{activeItem.config.height}%</span>
                                        </div>
                                        <input type="range" min="5" max="150" value={activeItem.config.height} onChange={(e) => updateActiveItem({ config: { height: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span>Pos X</span>
                                            <span className="text-amber-500">{activeItem.config.x}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" value={activeItem.config.x} onChange={(e) => updateActiveItem({ config: { x: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span>Pos Y</span>
                                            <span className="text-amber-500">{activeItem.config.y}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" value={activeItem.config.y} onChange={(e) => updateActiveItem({ config: { y: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 lg:p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <button 
                        disabled={isProcessing || !items.some(i => i.bgVideo && i.overlayVideo && i.status !== 'done')}
                        onClick={handleBatchExport}
                        className={`w-full py-3 lg:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl text-xs lg:text-sm ${isProcessing ? 'bg-slate-700 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-amber-900/20'}`}
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress}</> : <><Play className="w-5 h-5 fill-current" /> Batch Render ({items.filter(i => i.bgVideo && i.overlayVideo && i.status !== 'done').length})</>}
                    </button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden min-h-[500px] lg:min-h-0">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4 lg:gap-6 w-full">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                        <Smartphone className="w-3 h-3" /> Preview Slot #{items.indexOf(activeItem) + 1}
                    </div>

                    <div className="relative w-full max-w-[280px] lg:max-w-[300px] aspect-[9/16] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 lg:border-8 border-slate-800 ring-1 ring-slate-700 group">
                        <canvas ref={canvasRef} width={720} height={1280} className="w-full h-full object-cover" />
                        
                        <video ref={bgVideoEl} src={activeItem.bgVideo?.url} loop muted playsInline className="hidden" onEnded={() => setIsPlaying(false)} />
                        <video ref={overlayVideoEl} src={activeItem.overlayVideo?.url} loop muted playsInline className="hidden" onEnded={() => setIsPlaying(false)} />

                        {activeItem.bgVideo && activeItem.overlayVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={togglePlay}>
                                <div className="p-4 lg:p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    {isPlaying ? <Pause className="w-8 h-8 lg:w-12 lg:h-12 text-white fill-current" /> : <Play className="w-8 h-8 lg:w-12 lg:h-12 text-white fill-current" />}
                                </div>
                            </div>
                        )}

                        {!activeItem.bgVideo && !activeItem.overlayVideo && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-600">
                                <Maximize className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest">Select Slot & Upload</p>
                            </div>
                        )}

                        {activeItem.generatedUrl && (
                             <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                                 <div className="bg-green-500 p-2 rounded-full shadow-lg">
                                     <CheckCircle className="w-6 h-6 text-white" />
                                 </div>
                             </div>
                        )}
                    </div>

                    <div className="flex gap-2 lg:gap-3">
                        {activeItem.generatedUrl && activeItem.overlayVideo && (
                             <button onClick={() => triggerDownload(activeItem.generatedUrl!, activeItem.overlayVideo!.file.name)} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-xs font-bold text-white shadow-lg active:scale-95 transition-all">
                                <Download className="w-4 h-4" /> Download
                            </button>
                        )}
                        <button onClick={() => {
                            if (activeItem.bgVideo) updateActiveItem({ bgVideo: null, generatedUrl: null });
                            if (activeItem.overlayVideo) updateActiveItem({ overlayVideo: null, generatedUrl: null });
                            setIsPlaying(false);
                        }} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoOverlayMaker;
