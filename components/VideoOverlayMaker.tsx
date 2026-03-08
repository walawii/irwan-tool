
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Layers, Video, Play, Pause, Download, Loader2, Move, Maximize, Smartphone, Trash2, RefreshCw, Plus, List, CheckCircle, AlertCircle, MoveHorizontal, MoveVertical, RotateCw, Sun, ChevronUp, ChevronDown, Scissors, Type, Type as TextIcon, Volume2, VolumeX, Clock } from 'lucide-react';
import { OverlayItem } from '../types';

interface VideoOverlayMakerProps {
    onBack: () => void;
}

const VideoOverlayMaker: React.FC<VideoOverlayMakerProps> = ({ onBack }) => {
    const [items, setItems] = useState<OverlayItem[]>([{
        id: Math.random().toString(36).substr(2, 9),
        bgMedia: null,
        overlayVideo: null,
        status: 'idle',
        generatedUrl: null,
        config: { 
            x: 50, 
            y: 50, 
            scale: 40, 
            opacity: 1, 
            rotation: 0,
            trimStart: 0,
            trimEnd: 0,
            topText: '',
            bottomText: '',
            fontSize: 24
        }
    }]);
    const [activeId, setActiveId] = useState<string>(items[0].id);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const activeItem = items.find(i => i.id === activeId) || items[0];

    const bgInputRef = useRef<HTMLInputElement>(null);
    const overlayInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const bgVideoEl = useRef<HTMLVideoElement>(null);
    const bgImageEl = useRef<HTMLImageElement>(null);
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

    const handleMediaUpload = (type: 'bg' | 'overlay', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'bg') {
                const isImage = file.type.startsWith('image/');
                updateActiveItem({ bgMedia: { url, file, type: isImage ? 'image' : 'video' }, generatedUrl: null });
            } else {
                const tempVideo = document.createElement('video');
                tempVideo.src = url;
                tempVideo.onloadedmetadata = () => {
                    setItems(prev => prev.map(item => {
                        if (item.id !== activeId) return item;
                        return { 
                            ...item, 
                            overlayVideo: { url, file }, 
                            generatedUrl: null,
                            config: { ...item.config, trimEnd: tempVideo.duration }
                        };
                    }));
                };
            }
            setIsPlaying(false);
        }
        e.target.value = '';
    };

    const addItem = () => {
        const newItem: OverlayItem = {
            id: Math.random().toString(36).substr(2, 9),
            bgMedia: null,
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
        updateActiveItem({ config: { 
            x: 50, 
            y: 50, 
            scale: 40, 
            opacity: 1, 
            rotation: 0,
            topText: '',
            bottomText: '',
            fontSize: 24
        } });
    };

    const togglePlay = () => {
        if (!overlayVideoEl.current) return;
        
        if (isPlaying) {
            bgVideoEl.current?.pause();
            overlayVideoEl.current.pause();
        } else {
            if (overlayVideoEl.current.ended) {
                if (bgVideoEl.current) bgVideoEl.current.currentTime = 0;
                overlayVideoEl.current.currentTime = 0;
            }
            // Sync videos
            if (bgVideoEl.current) {
                bgVideoEl.current.currentTime = overlayVideoEl.current.currentTime;
                bgVideoEl.current.play();
            }
            overlayVideoEl.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (time: number) => {
        if (bgVideoEl.current) bgVideoEl.current.currentTime = time;
        if (overlayVideoEl.current) overlayVideoEl.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const drawFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, item: OverlayItem) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw Background
        if (item.bgMedia) {
            if (item.bgMedia.type === 'video' && bgVideoEl.current && bgVideoEl.current.readyState >= 2) {
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
            } else if (item.bgMedia.type === 'image' && bgImageEl.current && bgImageEl.current.complete) {
                const img = bgImageEl.current;
                const iRatio = img.naturalWidth / img.naturalHeight;
                const cRatio = width / height;
                let dw, dh, dx, dy;

                if (iRatio > cRatio) {
                    dh = height; dw = dh * iRatio; dx = (width - dw) / 2; dy = 0;
                } else {
                    dw = width; dh = dw / iRatio; dx = 0; dy = (height - dh) / 2;
                }
                ctx.drawImage(img, dx, dy, dw, dh);
            }
        }

        // Draw Overlay Video
        if (overlayVideoEl.current && overlayVideoEl.current.readyState >= 2) {
            const v = overlayVideoEl.current;
            const vRatio = v.videoWidth / v.videoHeight;
            
            const oWidth = (width * item.config.scale) / 100;
            const oHeight = oWidth / vRatio;
            
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

        // Draw Text Overlays
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.font = `bold ${item.config.fontSize}px Inter, sans-serif`;

        if (item.config.topText) {
            ctx.strokeText(item.config.topText, width / 2, 80);
            ctx.fillText(item.config.topText, width / 2, 80);
        }

        if (item.config.bottomText) {
            ctx.strokeText(item.config.bottomText, width / 2, height - 80);
            ctx.fillText(item.config.bottomText, width / 2, height - 80);
        }
        ctx.restore();
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
        if (!item.bgMedia || !item.overlayVideo) throw new Error("Missing media");

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context error");
        canvas.width = 720;
        canvas.height = 1280;

        let bgElement: HTMLVideoElement | HTMLImageElement;
        if (item.bgMedia.type === 'video') {
            const bgV = document.createElement('video');
            bgV.src = item.bgMedia.url;
            bgV.muted = false;
            bgV.playsInline = true;
            bgElement = bgV;
        } else {
            const bgImg = new Image();
            bgImg.src = item.bgMedia.url;
            bgElement = bgImg;
        }

        const ovV = document.createElement('video');
        ovV.src = item.overlayVideo.url;
        ovV.muted = false;
        ovV.playsInline = true;

        await Promise.all([
            item.bgMedia.type === 'video' 
                ? new Promise(r => (bgElement as HTMLVideoElement).onloadedmetadata = r)
                : new Promise(r => (bgElement as HTMLImageElement).onload = r),
            new Promise(r => ovV.onloadedmetadata = r)
        ]);

        // Set start time
        ovV.currentTime = item.config.trimStart;
        if (item.bgMedia.type === 'video') (bgElement as HTMLVideoElement).currentTime = 0;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const dest = audioCtx.createMediaStreamDestination();
        
        if (item.bgMedia.type === 'video') {
            const bgSource = audioCtx.createMediaElementSource(bgElement as HTMLVideoElement);
            bgSource.connect(dest);
        }
        const ovSource = audioCtx.createMediaElementSource(ovV);
        ovSource.connect(dest);

        const videoStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
            videoStream.getVideoTracks()[0],
            dest.stream.getAudioTracks()[0]
        ]);

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
            ? 'video/webm;codecs=vp9,opus' 
            : 'video/webm';
        
        const recorder = new MediaRecorder(combinedStream, { mimeType });
        const chunks: Blob[] = [];

        return new Promise((resolve, reject) => {
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(URL.createObjectURL(blob));
                audioCtx.close();
            };

            recorder.start();
            if (item.bgMedia!.type === 'video') (bgElement as HTMLVideoElement).play();
            ovV.play();

            const renderLoop = () => {
                if (ovV.currentTime >= item.config.trimEnd || ovV.ended || ovV.paused) {
                    recorder.stop();
                    if (item.bgMedia!.type === 'video') (bgElement as HTMLVideoElement).pause();
                    ovV.pause();
                    return;
                }
                
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw Background
                if (item.bgMedia!.type === 'video') {
                    const v = bgElement as HTMLVideoElement;
                    const vRatio = v.videoWidth / v.videoHeight;
                    const cRatio = canvas.width / canvas.height;
                    let dw, dh, dx, dy;
                    if (vRatio > cRatio) {
                        dh = canvas.height; dw = dh * vRatio; dx = (canvas.width - dw) / 2; dy = 0;
                    } else {
                        dw = canvas.width; dh = dw / vRatio; dx = 0; dy = (canvas.height - dh) / 2;
                    }
                    ctx.drawImage(v, dx, dy, dw, dh);
                } else {
                    const img = bgElement as HTMLImageElement;
                    const iRatio = img.naturalWidth / img.naturalHeight;
                    const cRatio = canvas.width / canvas.height;
                    let dw, dh, dx, dy;
                    if (iRatio > cRatio) {
                        dh = canvas.height; dw = dh * iRatio; dx = (canvas.width - dw) / 2; dy = 0;
                    } else {
                        dw = canvas.width; dh = dw / iRatio; dx = 0; dy = (canvas.height - dh) / 2;
                    }
                    ctx.drawImage(img, dx, dy, dw, dh);
                }

                const ovRatio = ovV.videoWidth / ovV.videoHeight;
                const oWidth = (canvas.width * item.config.scale) / 100;
                const oHeight = oWidth / ovRatio;
                const ox = (canvas.width * item.config.x) / 100;
                const oy = (canvas.height * item.config.y) / 100;

                ctx.save();
                ctx.translate(ox, oy);
                ctx.rotate((item.config.rotation * Math.PI) / 180);
                ctx.globalAlpha = item.config.opacity;
                ctx.drawImage(ovV, -oWidth / 2, -oHeight / 2, oWidth, oHeight);
                ctx.restore();

                // Draw Text
                ctx.save();
                ctx.textAlign = 'center';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 6;
                ctx.font = `bold ${item.config.fontSize * 2}px Inter, sans-serif`;

                if (item.config.topText) {
                    ctx.strokeText(item.config.topText, canvas.width / 2, 120);
                    ctx.fillText(item.config.topText, canvas.width / 2, 120);
                }

                if (item.config.bottomText) {
                    ctx.strokeText(item.config.bottomText, canvas.width / 2, canvas.height - 120);
                    ctx.fillText(item.config.bottomText, canvas.width / 2, canvas.height - 120);
                }
                ctx.restore();

                setProgress(`Processing: ${Math.floor(ovV.currentTime - item.config.trimStart)}s / ${Math.floor(item.config.trimEnd - item.config.trimStart)}s`);
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
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full lg:overflow-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar Toggle (Mobile) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-amber-600 p-4 rounded-full shadow-2xl text-white active:scale-90 transition-transform"
            >
                {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
            </button>

            {/* Sidebar */}
            <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shadow-2xl overflow-hidden ${isSidebarOpen ? 'h-auto max-h-[60vh] lg:h-full lg:max-h-full' : 'h-0 lg:h-full'}`}>
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
                                        <span className="text-[10px] font-medium truncate text-slate-400">{item.bgMedia?.file.name || 'Empty slot'}</span>
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
                            <input type="file" accept="video/*,image/*" ref={bgInputRef} className="hidden" onChange={(e) => handleMediaUpload('bg', e)} />
                            <button onClick={() => bgInputRef.current?.click()} className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl flex items-center gap-3 transition-all ${activeItem.bgMedia ? 'border-amber-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                                <Upload className={`w-3.5 h-3.5 ${activeItem.bgMedia ? 'text-amber-500' : 'text-slate-500'}`} />
                                <span className="text-[11px] font-bold truncate flex-1 text-left">{activeItem.bgMedia?.file.name || 'Background Media'}</span>
                            </button>

                            <input type="file" accept="video/*" ref={overlayInputRef} className="hidden" onChange={(e) => handleMediaUpload('overlay', e)} />
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
                                <div>
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                        <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> Zoom (Scale)</span>
                                        <span className="text-amber-500">{activeItem.config.scale}%</span>
                                    </div>
                                    <input type="range" min="5" max="200" value={activeItem.config.scale} onChange={(e) => updateActiveItem({ config: { scale: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotation</span>
                                            <span className="text-amber-500">{activeItem.config.rotation}°</span>
                                        </div>
                                        <input type="range" min="-180" max="180" value={activeItem.config.rotation} onChange={(e) => updateActiveItem({ config: { rotation: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Opacity</span>
                                            <span className="text-amber-500">{Math.round(activeItem.config.opacity * 100)}%</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.01" value={activeItem.config.opacity} onChange={(e) => updateActiveItem({ config: { opacity: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Scissors className="w-3 h-3" /> Trim Video
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase mb-2">
                                            <span>Start (s)</span>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                min="0" 
                                                max={activeItem.config.trimEnd}
                                                value={activeItem.config.trimStart}
                                                onChange={(e) => updateActiveItem({ config: { trimStart: Math.max(0, Math.min(activeItem.config.trimEnd, Number(e.target.value))) } })}
                                                className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-amber-500 text-right focus:border-amber-500 outline-none transition-colors"
                                            />
                                        </div>
                                        <input type="range" min="0" max={activeItem.config.trimEnd} step="0.1" value={activeItem.config.trimStart} onChange={(e) => updateActiveItem({ config: { trimStart: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase mb-2">
                                            <span>End (s)</span>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                min={activeItem.config.trimStart} 
                                                max={overlayVideoEl.current?.duration || 100}
                                                value={activeItem.config.trimEnd}
                                                onChange={(e) => updateActiveItem({ config: { trimEnd: Math.max(activeItem.config.trimStart, Math.min(overlayVideoEl.current?.duration || 100, Number(e.target.value))) } })}
                                                className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-amber-500 text-right focus:border-amber-500 outline-none transition-colors"
                                            />
                                        </div>
                                        <input type="range" min={activeItem.config.trimStart} max={overlayVideoEl.current?.duration || 100} step="0.1" value={activeItem.config.trimEnd} onChange={(e) => updateActiveItem({ config: { trimEnd: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <TextIcon className="w-3 h-3" /> Text Overlay
                                </label>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Top Text" 
                                        value={activeItem.config.topText}
                                        onChange={(e) => updateActiveItem({ config: { topText: e.target.value } })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:border-amber-500 outline-none transition-colors"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Bottom Text" 
                                        value={activeItem.config.bottomText}
                                        onChange={(e) => updateActiveItem({ config: { bottomText: e.target.value } })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:border-amber-500 outline-none transition-colors"
                                    />
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2">
                                            <span>Font Size</span>
                                            <span className="text-amber-500">{activeItem.config.fontSize}px</span>
                                        </div>
                                        <input type="range" min="12" max="100" value={activeItem.config.fontSize} onChange={(e) => updateActiveItem({ config: { fontSize: Number(e.target.value) } })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 lg:p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <button 
                        disabled={isProcessing || !items.some(i => i.bgMedia && i.overlayVideo && i.status !== 'done')}
                        onClick={handleBatchExport}
                        className={`w-full py-3 lg:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl text-xs lg:text-sm ${isProcessing ? 'bg-slate-700 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-amber-900/20'}`}
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress}</> : <><Play className="w-5 h-5 fill-current" /> Batch Render ({items.filter(i => i.bgMedia && i.overlayVideo && i.status !== 'done').length})</>}
                    </button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden min-h-[500px] lg:min-h-0 lg:overflow-y-auto pb-20 lg:pb-0">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4 lg:gap-6 w-full">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                        <Smartphone className="w-3 h-3" /> Preview Slot #{items.indexOf(activeItem) + 1}
                    </div>

                    <div className="relative w-full max-w-[280px] lg:max-w-[300px] aspect-[9/16] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 lg:border-8 border-slate-800 ring-1 ring-slate-700 group">
                        <canvas ref={canvasRef} width={720} height={1280} className="w-full h-full object-cover" />
                        
                        {activeItem.bgMedia?.type === 'video' ? (
                            <video 
                                ref={bgVideoEl} 
                                src={activeItem.bgMedia.url} 
                                loop 
                                muted={isMuted} 
                                playsInline 
                                className="absolute opacity-0 pointer-events-none" 
                                onEnded={() => setIsPlaying(false)} 
                            />
                        ) : activeItem.bgMedia?.type === 'image' ? (
                            <img ref={bgImageEl} src={activeItem.bgMedia.url} className="absolute opacity-0 pointer-events-none" />
                        ) : null}
                        <video 
                            ref={overlayVideoEl} 
                            src={activeItem.overlayVideo?.url} 
                            loop 
                            muted={isMuted} 
                            playsInline 
                            className="absolute opacity-0 pointer-events-none" 
                            onEnded={() => setIsPlaying(false)} 
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        />

                        {activeItem.bgMedia && activeItem.overlayVideo && (
                            <>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={togglePlay}>
                                    <div className="p-4 lg:p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                        {isPlaying ? <Pause className="w-8 h-8 lg:w-12 lg:h-12 text-white fill-current" /> : <Play className="w-8 h-8 lg:w-12 lg:h-12 text-white fill-current" />}
                                    </div>
                                </div>

                                {/* Time Display Overlay */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-[10px] font-mono">
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>

                                {/* Volume Toggle Overlay */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                    className="absolute bottom-20 right-6 p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-all"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>

                                {/* Progress Bar Overlay */}
                                <div className="absolute bottom-8 left-6 right-6 group/progress" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={duration} 
                                        step="0.1" 
                                        value={currentTime} 
                                        onChange={(e) => handleSeek(Number(e.target.value))}
                                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
                                    />
                                    <div className="flex justify-between mt-1 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                                        <span className="text-[8px] text-white/60">{formatTime(activeItem.config.trimStart)}</span>
                                        <span className="text-[8px] text-white/60">{formatTime(activeItem.config.trimEnd)}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {!activeItem.bgMedia && !activeItem.overlayVideo && (
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
                            if (activeItem.bgMedia) updateActiveItem({ bgMedia: null, generatedUrl: null });
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
