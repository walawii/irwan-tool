
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Layers, Video, Play, Pause, Download, Loader2, Move, Maximize, Smartphone, Trash2, RefreshCw, Plus, List, CheckCircle, AlertCircle, MoveHorizontal, MoveVertical, RotateCw, Sun, ChevronUp, ChevronDown, Scissors, Type, Type as TextIcon, Volume2, VolumeX, Clock } from 'lucide-react';
import { OverlayItem } from '../types';

interface VideoOverlayMakerProps {
    onBack: () => void;
}

// Dynamic generators for default background media options matching user-uploaded aesthetics
const generateActionMoviePreset = (): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 720;
    tempCanvas.height = 1280;
    const ctx = tempCanvas.getContext('2d')!;

    // 1. Dark backdrop radial gradient
    const grad = ctx.createRadialGradient(360, 640, 100, 360, 640, 720);
    grad.addColorStop(0, '#0a0101');
    grad.addColorStop(1, '#1b0103');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // 2. Concentric rings tunnel
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.lineWidth = 2;
    for (let r = 80; r < 580; r += 32) {
        ctx.beginPath();
        ctx.arc(360, 640, r, 0, Math.PI * 2);
        ctx.setLineDash([4, 12]);
        ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash

    // 3. Curved red waves (swooshes) on sides - simulating action layout
    // Left curve 1
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.bezierCurveTo(240, 300, 340, 600, 0, 1100);
    ctx.lineTo(0, 150);
    ctx.closePath();
    ctx.fill();

    // Left curve 2 (brighter foreground swoosh)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.bezierCurveTo(180, 320, 260, 580, 0, 1000);
    ctx.lineTo(0, 200);
    ctx.closePath();
    ctx.fill();

    // Right curve 1
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(720, 150);
    ctx.bezierCurveTo(480, 300, 380, 600, 720, 1100);
    ctx.lineTo(720, 150);
    ctx.closePath();
    ctx.fill();

    // Right curve 2 (brighter)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(720, 200);
    ctx.bezierCurveTo(540, 320, 460, 580, 720, 1000);
    ctx.lineTo(720, 200);
    ctx.closePath();
    ctx.fill();

    // 4. Dot Matrix Grid Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const drawDotGrid = (startX: number, startY: number, cols: number, rows: number) => {
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                ctx.beginPath();
                ctx.arc(startX + c * 18, startY + r * 18, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };
    drawDotGrid(60, 120, 5, 4); // top-left
    drawDotGrid(580, 260, 4, 6); // top-right
    drawDotGrid(60, 940, 4, 6); // bottom-left
    drawDotGrid(540, 1080, 5, 4); // bottom-right

    // 5. Heavy display-oriented texts ("ACTION SCENE" & "DAILY ACTION MOVIE")
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    
    // ACTION SCENE text (top portion of background)
    ctx.fillStyle = '#febb30';
    ctx.font = '900 68px "Montserrat", "Arial Black", sans-serif';
    ctx.fillText('ACTION SCENE', 360, 220);

    // DAILY ACTION MOVIE text (bottom portion of background)
    ctx.fillStyle = '#ea580c';
    ctx.font = '900 48px "Montserrat", "Arial Black", sans-serif';
    ctx.fillText('DAILY ACTION MOVIE', 360, 1060);

    ctx.shadowBlur = 0; // Reset shadow

    return tempCanvas.toDataURL('image/png');
};

const generateComedyShowPreset = (): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 720;
    tempCanvas.height = 1280;
    const ctx = tempCanvas.getContext('2d')!;

    // 1. Vibrant retro stage background (gradient red/orange/yellow)
    const grad = ctx.createRadialGradient(360, 640, 80, 360, 640, 800);
    grad.addColorStop(0, '#fef08a'); // central stage light glow
    grad.addColorStop(0.35, '#f97316'); // bright comedy orange
    grad.addColorStop(0.7, '#dc2626'); // red contrast ring
    grad.addColorStop(1, '#450a0a'); // dark framing borders
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // Spotlights
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    ctx.beginPath();
    ctx.moveTo(100, 0); ctx.lineTo(150, 1280); ctx.lineTo(350, 1280); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(620, 0); ctx.lineTo(570, 1280); ctx.lineTo(370, 1280); ctx.closePath(); ctx.fill();

    // 2. Sparkles
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    const drawStar = (cx: number, cy: number, spikes: number, outerRad: number, innerRad: number) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRad);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRad;
            y = cy + Math.sin(rot) * outerRad;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRad;
            y = cy + Math.sin(rot) * innerRad;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRad);
        ctx.closePath();
        ctx.fill();
    };
    drawStar(100, 300, 4, 18, 7);
    drawStar(600, 200, 4, 25, 10);
    drawStar(90, 880, 4, 15, 6);
    drawStar(630, 940, 4, 20, 8);

    // 3. Comedy Mic Backdrop Illustration
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    
    // Iconic Comic Spotlight outline box
    ctx.strokeStyle = '#fee2e2';
    ctx.lineWidth = 12;
    ctx.strokeRect(100, 340, 520, 600);
    // Draw golden inner line
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(106, 346, 508, 588);

    // Microphone Stand
    ctx.translate(360, 640);
    // Mic Stand
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-5, 40, 10, 140);
    // Mic Joint
    ctx.fillStyle = '#475569';
    ctx.fillRect(-12, 20, 24, 22);
    // Mic body
    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(8, 20);
    ctx.lineTo(16, -20);
    ctx.closePath();
    ctx.fill();
    // Mic head
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, -32, 26, 0, Math.PI * 2);
    ctx.fill();
    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-26, -32); ctx.lineTo(26, -32);
    ctx.moveTo(0, -58); ctx.lineTo(0, -6);
    ctx.stroke();
    ctx.restore();

    // 4. Heavy Comic Title / Bottom Copy match
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 14;
    ctx.textAlign = 'center';

    // Top: TERTAWALAH using comic yellow palette
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 10;
    ctx.font = '900 70px "Arial Black", "Montserrat", sans-serif';
    ctx.strokeText('TERTAWALAH', 360, 200);
    ctx.fillText('TERTAWALAH', 360, 200);

    // Bottom: SEBELUM TERTAWA ITU DILARANG in italicized display layout
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 8;
    ctx.font = 'bold italic 34px "Arial Black", "Montserrat", sans-serif';
    ctx.strokeText('SEBELUM TERTAWA', 360, 1040);
    ctx.fillText('SEBELUM TERTAWA', 360, 1040);

    ctx.strokeText('ITU DILARANG', 360, 1090);
    ctx.fillText('ITU DILARANG', 360, 1090);

    ctx.shadowBlur = 0; // Reset

    return tempCanvas.toDataURL('image/png');
};

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

    const handleSelectPreset = (presetId: 'action-movie' | 'comedy-show') => {
        const url = presetId === 'action-movie' ? generateActionMoviePreset() : generateComedyShowPreset();
        
        // Convert base64 dataURL to Blob & File
        const byteString = atob(url.split(',')[1]);
        const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const name = presetId === 'action-movie' ? 'Daily-Action-Movie-Preset.png' : 'Sebelum-Tertawa-Itu-Dilarang-Preset.png';
        const file = new File([blob], name, { type: 'image/png' });

        updateActiveItem({ 
            bgMedia: { url, file, type: 'image' }, 
            generatedUrl: null 
        });
        setIsPlaying(false);
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
            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                resolve(URL.createObjectURL(blob));
                audioCtx.close();
            };
            recorder.onerror = (err) => reject(err);

            recorder.start();
            
            const startPlayback = async () => {
                try {
                    if (item.bgMedia!.type === 'video') await (bgElement as HTMLVideoElement).play();
                    await ovV.play();
                } catch (err) {
                    console.warn("Playback failed, but continuing capture:", err);
                }
            };
            startPlayback();

            const renderLoop = () => {
                // Check if we reached the end
                const isEnded = ovV.currentTime >= item.config.trimEnd || ovV.ended;
                
                if (isEnded) {
                    recorder.stop();
                    if (item.bgMedia!.type === 'video') (bgElement as HTMLVideoElement).pause();
                    ovV.pause();
                    return;
                }
                
                // If paused unexpectedly, try to resume
                if (ovV.paused && !isEnded) {
                    ovV.play().catch(() => {});
                    if (item.bgMedia!.type === 'video') (bgElement as HTMLVideoElement).play().catch(() => {});
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
        const validItems = items.filter(i => i.bgMedia && i.overlayVideo && i.status !== 'done');
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
                
                // Small delay between items
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error("Export error for item", item.id, err);
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

                        {/* Preset Background templates */}
                        <div className="space-y-2 pt-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">Template Background Default</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSelectPreset('action-movie')}
                                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all text-xs relative overflow-hidden group/preset ${
                                        activeItem.bgMedia?.file.name === 'Daily-Action-Movie-Preset.png'
                                            ? 'bg-amber-500/10 border-amber-500/60'
                                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-red-650/10 via-transparent to-transparent opacity-0 group-hover/preset:opacity-100 transition-all pointer-events-none" />
                                    <span className="font-extrabold text-amber-500 flex items-center gap-1">🎥 Action Movie</span>
                                    <span className="text-[9px] text-slate-400 leading-normal">Tema Aksi Red Curves</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSelectPreset('comedy-show')}
                                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all text-xs relative overflow-hidden group/preset ${
                                        activeItem.bgMedia?.file.name === 'Sebelum-Tertawa-Itu-Dilarang-Preset.png'
                                            ? 'bg-amber-500/10 border-amber-500/60'
                                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-650/10 via-transparent to-transparent opacity-0 group-hover/preset:opacity-100 transition-all pointer-events-none" />
                                    <span className="font-extrabold text-amber-500 flex items-center gap-1">🎭 Comedy Show</span>
                                    <span className="text-[9px] text-slate-400 leading-normal">Tema Komedi Stage</span>
                                </button>
                            </div>
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
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TextIcon className="w-3 h-3" /> Text Overlay
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const title = prompt("Masukkan Judul Bagian Atas Video:");
                                            if (title !== null) {
                                                updateActiveItem({ config: { topText: title } });
                                            }
                                        }}
                                        className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
                                    >
                                        <Plus className="w-2.5 h-2.5" /> Tambah Judul Atas
                                    </button>
                                </div>
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

                                {/* Interactive Title / Top Text Overlay Button */}
                                {!activeItem.config.topText ? (
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const txt = prompt("Masukkan Judul Bagian Atas Video:");
                                            if (txt !== null) {
                                                updateActiveItem({ config: { topText: txt } });
                                            }
                                        }}
                                        className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/70 hover:bg-amber-500 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-lg z-30 select-none cursor-pointer animate-fade-in"
                                    >
                                        <Plus className="w-3 h-3" /> Tambah Judul Atas
                                    </button>
                                ) : (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 border border-slate-700 rounded-full px-2.5 py-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const txt = prompt("Ubah Judul Bagian Atas Video:", activeItem.config.topText);
                                                if (txt !== null) {
                                                    updateActiveItem({ config: { topText: txt } });
                                                }
                                            }}
                                            className="text-[9px] hover:text-amber-500 font-bold px-1.5 text-slate-200"
                                            title="Edit Judul"
                                        >
                                            Edit Judul
                                        </button>
                                        <span className="text-slate-600">|</span>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateActiveItem({ config: { topText: '' } });
                                            }}
                                            className="text-[9px] hover:text-red-400 text-slate-400 font-bold px-1.5"
                                            title="Hapus"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}

                                {/* Volume Toggle Overlay */}
                                <div className="absolute bottom-20 right-6 flex flex-col gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                        className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-all shadow-lg"
                                        title="Toggle Mute"
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateActiveItem({ config: { trimStart: currentTime } }); }}
                                        className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-amber-500 hover:bg-white/20 transition-all shadow-lg"
                                        title="Set Current as Start"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Scissors className="w-4 h-4" />
                                            <span className="text-[6px] font-bold mt-0.5">START</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateActiveItem({ config: { trimEnd: currentTime } }); }}
                                        className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-amber-500 hover:bg-white/20 transition-all shadow-lg"
                                        title="Set Current as End"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Scissors className="w-4 h-4" />
                                            <span className="text-[6px] font-bold mt-0.5">END</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Progress Bar Overlay */}
                                <div className="absolute bottom-8 left-6 right-6 group/progress" onClick={(e) => e.stopPropagation()}>
                                    <div className="relative h-1 w-full bg-white/20 rounded-lg overflow-hidden mb-1">
                                        {/* Trim Range Highlight */}
                                        <div 
                                            className="absolute h-full bg-amber-500/30 border-x border-amber-500/50"
                                            style={{
                                                left: `${(activeItem.config.trimStart / duration) * 100}%`,
                                                width: `${((activeItem.config.trimEnd - activeItem.config.trimStart) / duration) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={duration} 
                                        step="0.1" 
                                        value={currentTime} 
                                        onChange={(e) => handleSeek(Number(e.target.value))}
                                        className="absolute top-0 left-0 w-full h-1 bg-transparent appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all z-10"
                                    />
                                    <div className="flex justify-between mt-2 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                                        <span className={`text-[8px] font-bold ${currentTime >= activeItem.config.trimStart && currentTime <= activeItem.config.trimEnd ? 'text-amber-500' : 'text-white/60'}`}>
                                            {formatTime(activeItem.config.trimStart)}
                                        </span>
                                        <span className={`text-[8px] font-bold ${currentTime >= activeItem.config.trimStart && currentTime <= activeItem.config.trimEnd ? 'text-amber-500' : 'text-white/60'}`}>
                                            {formatTime(activeItem.config.trimEnd)}
                                        </span>
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
