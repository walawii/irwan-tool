import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, LayoutTemplate, ShieldCheck, Download, Upload, Loader2, Play, Trash2, Maximize, Move, FileVideo, CheckCircle, AlertCircle, List, Plus, Music, Pause, Volume2, VolumeX, Scissors, Type as IconType, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { FrameSettings, WatermarkPosition, FrameVideoItem, Caption } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface FrameEditorProps {
    onBack: () => void;
}

interface VisualizerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    isMuted: boolean;
    volume: number;
}

const WaveformVisualizer: React.FC<VisualizerProps> = ({ videoRef, isActive, isMuted, volume }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isActive || !videoRef.current) return;

        const video = videoRef.current;
        
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        
        if (!analyserRef.current) {
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 128;
        }

        if (!gainNodeRef.current) {
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.connect(ctx.destination);
        }

        const analyser = analyserRef.current;
        const gainNode = gainNodeRef.current;

        try {
            if (!sourceRef.current) {
                sourceRef.current = ctx.createMediaElementSource(video);
                sourceRef.current.connect(analyser);
                analyser.connect(gainNode);
            }
        } catch (e) {
            console.warn("Audio source already connected or blocked", e);
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) return;

            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)'); 
                gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)'); 

                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth;
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive, videoRef.current?.src]);

    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            gainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : volume, audioContextRef.current.currentTime, 0.02);
        }
    }, [isMuted, volume]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute bottom-24 left-0 w-full h-12 pointer-events-none z-30 opacity-60" 
            width={320} 
            height={60} 
        />
    );
};

const FrameEditor: React.FC<FrameEditorProps> = ({ onBack }) => {
    const [settings, setSettings] = useState<FrameSettings>({
        frameImageUrl: null,
        watermarkUrl: null,
        watermarkOpacity: 0.8,
        watermarkPosition: WatermarkPosition.BOTTOM_RIGHT,
        watermarkSize: 15,
        videos: []
    });

    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [isPreviewPaused, setIsPreviewPaused] = useState(false);
    const [isPreviewMuted, setIsPreviewMuted] = useState(true);
    const [previewVolume, setPreviewVolume] = useState(0.8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
    const [progress, setProgress] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const frameInputRef = useRef<HTMLInputElement>(null);
    const watermarkInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const activeVideo = settings.videos.find(v => v.id === activeVideoId) || settings.videos[0];

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !activeVideo) return;

        const checkTrim = () => {
            if (video.currentTime >= activeVideo.trimRange.end) {
                video.currentTime = activeVideo.trimRange.start;
            }
        };

        video.addEventListener('timeupdate', checkTrim);
        return () => video.removeEventListener('timeupdate', checkTrim);
    }, [activeVideo?.trimRange, activeVideoId]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPreviewPaused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
        setIsPreviewPaused(!isPreviewPaused);
    };

    const handleFileUpload = (type: 'video' | 'frame' | 'watermark', e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (type === 'video') {
            Array.from(files).forEach((file: File) => {
                const url = URL.createObjectURL(file);
                const tempVideo = document.createElement('video');
                tempVideo.src = url;
                tempVideo.onloadedmetadata = () => {
                    const newVideo: FrameVideoItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        url: url,
                        file: file,
                        name: file.name,
                        status: 'idle',
                        generatedUrl: null,
                        trimRange: { start: 0, end: tempVideo.duration },
                        duration: tempVideo.duration,
                        captions: []
                    };
                    setSettings(prev => ({ ...prev, videos: [...prev.videos, newVideo] }));
                    if (!activeVideoId) setActiveVideoId(newVideo.id);
                };
            });
        } else {
            const file = files[0];
            const url = URL.createObjectURL(file);
            if (type === 'frame') setSettings(prev => ({ ...prev, frameImageUrl: url }));
            if (type === 'watermark') setSettings(prev => ({ ...prev, watermarkUrl: url }));
        }
        e.target.value = '';
    };

    const removeVideo = (id: string) => {
        setSettings(prev => {
            const filtered = prev.videos.filter(v => v.id !== id);
            if (activeVideoId === id) {
                setActiveVideoId(filtered.length > 0 ? filtered[0].id : null);
            }
            return { ...prev, videos: filtered };
        });
    };

    const updateTrim = (id: string, start: number, end: number) => {
        setSettings(prev => ({
            ...prev,
            videos: prev.videos.map(v => v.id === id ? { ...v, trimRange: { start, end } } : v)
        }));
    };

    const generateCaptions = async () => {
        if (!activeVideo) return;
        setIsGeneratingCaptions(true);
        setProgress('AI is listening to your video...');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const file = activeVideo.file;
            const reader = new FileReader();
            
            const base64Data = await new Promise<string>((resolve) => {
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            // Fix: Use 'Type' directly instead of 'SchemaType' and use 'contents: { parts: [...] }' structure
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: file.type } },
                        { text: "Tolong transkrip video ini menjadi subtitle dalam format JSON. Hasilnya harus berupa array objek dengan properti 'text', 'start' (detik), dan 'end' (detik). Gunakan Bahasa Indonesia." }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                start: { type: Type.NUMBER },
                                end: { type: Type.NUMBER }
                            },
                            required: ['text', 'start', 'end']
                        }
                    }
                }
            });

            const caps = JSON.parse(response.text || '[]') as Caption[];
            setSettings(prev => ({
                ...prev,
                videos: prev.videos.map(v => v.id === activeVideo.id ? { ...v, captions: caps } : v)
            }));
            setProgress('Captions generated!');
        } catch (err) {
            console.error("Caption generation failed", err);
            alert("Gagal membuat caption otomatis. Pastikan API Key valid.");
        } finally {
            setIsGeneratingCaptions(false);
            setTimeout(() => setProgress(''), 3000);
        }
    };

    const processSingleVideo = async (videoItem: FrameVideoItem): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");

                canvas.width = 720;
                canvas.height = 1280;

                const video = document.createElement('video');
                video.src = videoItem.url;
                video.crossOrigin = 'anonymous';
                video.muted = false; 
                video.volume = 1.0;
                
                await new Promise((r) => video.onloadedmetadata = r);

                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }

                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);

                let frameImg = null;
                if (settings.frameImageUrl) {
                    frameImg = new Image();
                    frameImg.src = settings.frameImageUrl;
                    await new Promise((r) => frameImg!.onload = r);
                }

                let watermarkImg = null;
                if (settings.watermarkUrl) {
                    watermarkImg = new Image();
                    watermarkImg.src = settings.watermarkUrl;
                    await new Promise((r) => watermarkImg!.onload = r);
                }

                const videoStream = canvas.captureStream(30);
                const videoTrack = videoStream.getVideoTracks()[0];
                const audioTracks = dest.stream.getAudioTracks();
                
                const combinedStream = new MediaStream();
                combinedStream.addTrack(videoTrack);
                if (audioTracks.length > 0) {
                    combinedStream.addTrack(audioTracks[0]);
                }

                const recorder = new MediaRecorder(combinedStream, { 
                    mimeType: 'video/webm;codecs=vp9,opus' 
                });

                const chunks: Blob[] = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };
                
                recorder.onstop = () => {
                    audioCtx.close();
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };

                recorder.start();
                video.currentTime = videoItem.trimRange.start;
                video.play();

                const draw = () => {
                    if (video.paused || video.ended || video.currentTime >= videoItem.trimRange.end) {
                        if (recorder.state === 'recording') recorder.stop();
                        return;
                    }

                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    const vRatio = video.videoWidth / video.videoHeight;
                    const cRatio = canvas.width / canvas.height;let dw, dh, sx, sy;
                    if (vRatio > cRatio) {
                        dh = canvas.height; dw = dh * vRatio; sx = (canvas.width - dw) / 2; sy = 0;
                    } else {
                        dw = canvas.width; dh = dw / vRatio; sx = 0; sy = (canvas.height - dh) / 2;
                    }
                    ctx.drawImage(video, sx, sy, dw, dh);

                    // Frame
                    if (frameImg) {
                        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
                    }

                    // Captions
                    if (videoItem.captions.length > 0) {
                        const currentCap = videoItem.captions.find(c => video.currentTime >= c.start && video.currentTime <= c.end);
                        if (currentCap) {
                            ctx.save();
                            ctx.font = 'bold 36px "Inter", sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            const lines = currentCap.text.split('\n');
                            const yBase = canvas.height - 180;
                            
                            ctx.fillStyle = 'rgba(0,0,0,0.6)';
                            const textWidth = ctx.measureText(currentCap.text).width + 40;
                            ctx.fillRect(canvas.width/2 - textWidth/2, yBase - 30, textWidth, 60);

                            ctx.fillStyle = 'white';
                            ctx.strokeStyle = 'black';
                            ctx.lineWidth = 4;
                            ctx.strokeText(currentCap.text, canvas.width/2, yBase);
                            ctx.fillText(currentCap.text, canvas.width/2, yBase);
                            ctx.restore();
                        }
                    }

                    // Watermark
                    if (watermarkImg) {
                        ctx.save();
                        ctx.globalAlpha = settings.watermarkOpacity;
                        const wSize = (canvas.width * settings.watermarkSize) / 100;
                        const wAspect = watermarkImg.width / watermarkImg.height;
                        const wWidth = wSize;
                        const wHeight = wSize / wAspect;
                        const padding = 40;
                        let wx, wy;
                        switch (settings.watermarkPosition) {
                            case WatermarkPosition.TOP_LEFT: wx = padding; wy = padding; break;
                            case WatermarkPosition.TOP_RIGHT: wx = canvas.width - wWidth - padding; wy = padding; break;
                            case WatermarkPosition.BOTTOM_LEFT: wx = padding; wy = canvas.height - wHeight - padding; break;
                            case WatermarkPosition.BOTTOM_RIGHT: 
                            default: wx = canvas.width - wWidth - padding; wy = canvas.height - wHeight - padding; break;
                        }
                        ctx.drawImage(watermarkImg, wx, wy, wWidth, wHeight);
                        ctx.restore();
                    }
                    requestAnimationFrame(draw);
                };
                draw();
            } catch (err) {
                reject(err);
            }
        });
    };

    const processAllVideos = async () => {
        if (settings.videos.length === 0) return;
        setIsProcessing(true);
        const videosToProcess = settings.videos.filter(v => v.status !== 'done');
        for (let i = 0; i < videosToProcess.length; i++) {
            const video = videosToProcess[i];
            setSettings(prev => ({
                ...prev,
                videos: prev.videos.map(v => v.id === video.id ? { ...v, status: 'processing' } : v)
            }));
            setProgress(`Processing ${i + 1}/${videosToProcess.length}: ${video.name}`);
            try {
                const resultUrl = await processSingleVideo(video);
                setSettings(prev => ({
                    ...prev,
                    videos: prev.videos.map(v => v.id === video.id ? { ...v, status: 'done', generatedUrl: resultUrl } : v)
                }));
            } catch (err) {
                console.error("Batch processing error:", err);
                setSettings(prev => ({
                    ...prev,
                    videos: prev.videos.map(v => v.id === video.id ? { ...v, status: 'error', error: 'Failed' } : v)
                }));
            }
        }
        setIsProcessing(false);
        setProgress('');
    };

    const downloadAll = () => {
        const doneVideos = settings.videos.filter(v => v.status === 'done' && v.generatedUrl);
        if (doneVideos.length === 0) return;
        doneVideos.forEach((v, i) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = v.generatedUrl!;
                a.download = v.name;
                a.click();
            }, i * 1200); 
        });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full lg:overflow-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar Toggle (Mobile) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-purple-600 p-4 rounded-full shadow-2xl text-white active:scale-90 transition-transform"
            >
                {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
            </button>

            {/* Sidebar */}
            <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shadow-2xl overflow-hidden ${isSidebarOpen ? 'h-auto max-h-[60vh] lg:h-full lg:max-h-full' : 'h-0 lg:h-full'}`}>
                <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Frame & Brand</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8 scrollbar-thin">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <List className="w-3 h-3" /> Media Queue ({settings.videos.length})
                            </label>
                            <input type="file" accept="video/*" multiple ref={videoInputRef} className="hidden" onChange={(e) => handleFileUpload('video', e)} />
                            <button onClick={() => videoInputRef.current?.click()} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                                <Plus className="w-3 h-3" /> Add Clips
                            </button>
                        </div>

                        {settings.videos.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 lg:p-8 text-center bg-slate-950/50">
                                <Video className="w-8 h-8 mx-auto mb-3 text-slate-700 opacity-20" />
                                <p className="text-xs text-slate-600">No videos uploaded</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                {settings.videos.map((v) => (
                                    <div 
                                        key={v.id}
                                        onClick={() => {
                                            setActiveVideoId(v.id);
                                            setIsPreviewPaused(false);
                                        }}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                                            v.id === activeVideoId ? 'bg-purple-600/10 border-purple-500/50 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {v.status === 'processing' ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" /> : 
                                             v.status === 'done' ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
                                             v.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> :
                                             <FileVideo className="w-4 h-4 text-slate-500 shrink-0" />}
                                            <span className="text-[10px] truncate text-slate-300 font-medium">{v.name}</span>
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }} 
                                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {activeVideo && (
                        <div className="space-y-6 pt-2 border-t border-slate-800 pt-6 animate-in fade-in duration-500">
                             <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Scissors className="w-3 h-3" /> Video Trimmer
                                </label>
                                <div className="space-y-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-400 uppercase mb-1">
                                            <span>Start Time</span>
                                            <span>{activeVideo.trimRange.start.toFixed(1)}s</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max={activeVideo.duration} step="0.1"
                                            value={activeVideo.trimRange.start}
                                            onChange={(e) => updateTrim(activeVideo.id, Math.min(Number(e.target.value), activeVideo.trimRange.end - 0.5), activeVideo.trimRange.end)}
                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] text-slate-400 uppercase mb-1">
                                            <span>End Time</span>
                                            <span>{activeVideo.trimRange.end.toFixed(1)}s</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max={activeVideo.duration} step="0.1"
                                            value={activeVideo.trimRange.end}
                                            onChange={(e) => updateTrim(activeVideo.id, activeVideo.trimRange.start, Math.max(Number(e.target.value), activeVideo.trimRange.start + 0.5))}
                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <IconType className="w-3 h-3" /> Auto Captions
                                </label>
                                <button 
                                    onClick={generateCaptions}
                                    disabled={isGeneratingCaptions}
                                    className={`w-full py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-xs font-bold ${isGeneratingCaptions ? 'opacity-50' : ''}`}
                                >
                                    {isGeneratingCaptions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                                    {activeVideo.captions.length > 0 ? 'Regenerate Captions' : 'Auto Generate Captions'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 pt-2 border-t border-slate-800 pt-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <LayoutTemplate className="w-3 h-3" /> Frame Overlay (PNG)
                            </label>
                            <input type="file" accept="image/png" ref={frameInputRef} className="hidden" onChange={(e) => handleFileUpload('frame', e)} />
                            <button onClick={() => frameInputRef.current?.click()} className="w-full py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-sm">
                                <Upload className="w-4 h-4" /> {settings.frameImageUrl ? 'Change Frame' : 'Upload Frame'}
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-3 h-3" /> Watermark Logo
                            </label>
                            <input type="file" accept="image/*" ref={watermarkInputRef} className="hidden" onChange={(e) => handleFileUpload('watermark', e)} />
                            <button onClick={() => watermarkInputRef.current?.click()} className="w-full py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4" /> {settings.watermarkUrl ? 'Change Watermark' : 'Upload Watermark'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 p-4 lg:p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md space-y-3">
                    <button 
                        onClick={processAllVideos}
                        disabled={isProcessing || settings.videos.length === 0}
                        className={`w-full py-3 lg:py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-purple-600 hover:bg-purple-500 active:scale-95 text-white'}`}
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Play className="w-5 h-5 fill-current" /> Batch Process ({settings.videos.length})</>}
                    </button>
                    {progress && <p className="text-[10px] text-center text-purple-300 animate-pulse">{progress}</p>}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden min-h-[500px] lg:min-h-0 lg:overflow-y-auto pb-20 lg:pb-0">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4 lg:gap-6 w-full max-w-2xl">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                        <Maximize className="w-3 h-3" /> {activeVideo ? `Preview: ${activeVideo.name}` : 'Branding Preview'}
                    </div>

                    <div className="relative w-full max-w-[280px] lg:max-w-[320px] aspect-[9/16] bg-black rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.15)] border-4 lg:border-[8px] border-slate-800 ring-1 ring-slate-700 group/preview">
                        {activeVideo ? (
                            <video 
                                key={activeVideo.id} 
                                ref={videoRef} 
                                src={activeVideo.url} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-8 text-center bg-slate-900">
                                <Video className="w-16 h-16 mb-4 opacity-10" />
                                <p className="text-sm font-medium">Add clips to start</p>
                            </div>
                        )}

                        <WaveformVisualizer 
                            videoRef={videoRef} 
                            isActive={!!activeVideo} 
                            isMuted={isPreviewMuted}
                            volume={previewVolume}
                        />

                        {activeVideo && activeVideo.captions.length > 0 && (
                            <div className="absolute bottom-32 inset-x-4 z-40 text-center pointer-events-none transition-all duration-300">
                                {activeVideo.captions.map((c, i) => {
                                    const isActive = videoRef.current ? (videoRef.current.currentTime >= c.start && videoRef.current.currentTime <= c.end) : false;
                                    if (!isActive) return null;
                                    return (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <span className="inline-block bg-black/60 backdrop-blur-sm text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-xl shadow-black/40">
                                                {c.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeVideo && (
                            <div className="absolute inset-x-0 bottom-4 px-4 z-40 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300">
                                <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2 lg:p-3 flex items-center gap-3 shadow-2xl">
                                    <button 
                                        onClick={togglePlay}
                                        className="p-1.5 lg:p-2 hover:bg-slate-800 rounded-full text-white transition-colors"
                                    >
                                        {isPreviewPaused ? <Play className="w-3 h-3 lg:w-4 lg:h-4 fill-current" /> : <Pause className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />}
                                    </button>
                                    
                                    <div className="flex items-center gap-2 flex-1">
                                        <button 
                                            onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                                            className="p-1.5 lg:p-2 hover:bg-slate-800 rounded-full text-white transition-colors"
                                        >
                                            {isPreviewMuted || previewVolume === 0 ? <VolumeX className="w-3 h-3 lg:w-4 lg:h-4" /> : <Volume2 className="w-3 h-3 lg:w-4 lg:h-4" />}
                                        </button>
                                        <input 
                                            type="range" min="0" max="1" step="0.01"
                                            value={previewVolume}
                                            onChange={(e) => {
                                                setPreviewVolume(Number(e.target.value));
                                                if (Number(e.target.value) > 0) setIsPreviewMuted(false);
                                            }}
                                            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {settings.frameImageUrl && (
                            <img src={settings.frameImageUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10" alt="Frame" />
                        )}
                    </div>

                    {activeVideo?.generatedUrl && (
                        <button 
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = activeVideo.generatedUrl!;
                                a.download = activeVideo.name;
                                a.click();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 text-xs"
                        >
                            <Download className="w-4 h-4" /> Download Branded Clip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FrameEditor;