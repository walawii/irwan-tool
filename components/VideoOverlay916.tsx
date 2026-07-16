import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, Download, Upload, Loader2, Play, Pause, Trash2, Smartphone, Sparkles, Type, UserPlus, MessageSquare, Check, RefreshCw, Smile, ArrowUpRight, History } from 'lucide-react';

interface VideoOverlay916Props {
    onBack: () => void;
}

interface OverlayConfig {
    // Top Text
    topText: string;
    topTextSize: number;
    topTextColor: string;
    topBgColor: string;
    topY: number;
    
    // Follow Widget
    username: string;
    followBtnText: string;
    followBgColor: string;
    followTextColor: string;
    followY: number;
    showFollowIcon: boolean;
    avatarEmoji: string;
    showFollowWidget: boolean;

    // Comment CTA Widget
    commentText: string;
    commentCtaWord: string; // e.g. "MAU" or "INFO"
    commentBgColor: string;
    commentTextColor: string;
    commentY: number;
    pulseAnimation: boolean;
    showCommentWidget: boolean;

    // Arrow Indicator Widget
    showArrow: boolean;
    arrowX: number;
    arrowY: number;
    arrowText: string;
    arrowTextColor: string;
    arrowTextSize: number;
    arrowColor: string;
    arrowScale: number;
    arrowRotation: number;
}

export const VideoOverlay916: React.FC<VideoOverlay916Props> = ({ onBack }) => {
    // State for media
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    
    // Selected motion background if no video is uploaded
    const [bgColorPreset, setBgColorPreset] = useState<string>('cosmic-dark'); 
    
    // Config states
    const [config, setConfig] = useState<OverlayConfig>({
        topText: 'CARA MUDAH MEMBUAT VIDEO OVERLAY VIRAL 🚀',
        topTextSize: 28,
        topTextColor: '#ffffff',
        topBgColor: 'rgba(15, 23, 42, 0.85)',
        topY: 120,

        username: 'irwankurnia.id',
        followBtnText: 'IKUTI',
        followBgColor: '#e11d48', // rose-600
        followTextColor: '#ffffff',
        followY: 540,
        showFollowIcon: true,
        avatarEmoji: '👨‍💻',
        showFollowWidget: false,

        commentText: 'Komen kata di bawah untuk saya kirimkan link rahasianya langsung ke DM Anda!',
        commentCtaWord: 'MAU',
        commentBgColor: '#eab308', // amber-500
        commentTextColor: '#0f172a', // slate-900
        commentY: 960,
        pulseAnimation: true,
        showCommentWidget: false,

        showArrow: false,
        arrowX: 360,
        arrowY: 850,
        arrowText: 'KLIK DI SINI!',
        arrowTextColor: '#ffffff',
        arrowTextSize: 18,
        arrowColor: '#f43f5e',
        arrowScale: 1.2,
        arrowRotation: 270 // Pointing up
    });

    // Control/UI states
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordProgress, setRecordProgress] = useState(0);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [historyVideos, setHistoryVideos] = useState<{ id: string, url: string, timestamp: number, title: string }[]>([]);
    const [activeTab, setActiveTab] = useState<'video' | 'text' | 'follow' | 'comment' | 'arrow'>('video');

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // Pre-defined animated gradient background parameters
    const gradientRef = useRef({ phase: 0 });

    // Handle play/pause
    useEffect(() => {
        if (previewVideoRef.current) {
            if (isPlaying) {
                previewVideoRef.current.play().catch(() => {});
            } else {
                previewVideoRef.current.pause();
            }
        }
    }, [isPlaying, videoUrl]);

    // Handle source changes
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setGeneratedVideoUrl(null);
            setIsPlaying(true);
        }
    };

    const handleRemoveVideo = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoFile(null);
        setVideoUrl(null);
        setGeneratedVideoUrl(null);
    };

    // Canvas drawing loop for the live preview screen
    useEffect(() => {
        let active = true;
        
        const drawFrame = () => {
            if (!active) return;
            
            const canvas = previewCanvasRef.current;
            if (!canvas) {
                requestAnimationFrame(drawFrame);
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                requestAnimationFrame(drawFrame);
                return;
            }

            // 1. Clear background & draw source
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const video = previewVideoRef.current;
            if (videoUrl && video && video.readyState >= 2) {
                // Cover video inside 9:16 frame
                const vRatio = video.videoWidth / video.videoHeight;
                const cRatio = canvas.width / canvas.height;
                let dw, dh, dx, dy;

                if (vRatio > cRatio) {
                    dh = canvas.height;
                    dw = dh * vRatio;
                    dx = (canvas.width - dw) / 2;
                    dy = 0;
                } else {
                    dw = canvas.width;
                    dh = dw / vRatio;
                    dx = 0;
                    dy = (canvas.height - dh) / 2;
                }
                ctx.drawImage(video, dx, dy, dw, dh);
            } else {
                // Generate a rich animated motion background if no video is provided
                gradientRef.current.phase += 0.015;
                const p = gradientRef.current.phase;
                
                if (bgColorPreset === 'cosmic-dark') {
                    const g = ctx.createRadialGradient(
                        canvas.width / 2 + Math.cos(p) * 150, 
                        canvas.height / 2 + Math.sin(p * 0.8) * 200, 
                        100,
                        canvas.width / 2, 
                        canvas.height / 2, 
                        800
                    );
                    g.addColorStop(0, '#1e1b4b'); // deep indigo
                    g.addColorStop(0.5, '#0f172a'); // dark slate
                    g.addColorStop(1, '#020617'); // black
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Abstract glowing circles
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'; // purple
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2 + Math.sin(p) * 200, canvas.height * 0.3 + Math.cos(p) * 100, 150, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(236, 72, 153, 0.1)'; // pink
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2 - Math.cos(p * 1.2) * 180, canvas.height * 0.7 + Math.sin(p) * 150, 180, 0, Math.PI * 2);
                    ctx.fill();
                } else if (bgColorPreset === 'vibrant-sunset') {
                    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    const stop1 = Math.sin(p) * 0.2 + 0.2;
                    const stop2 = Math.cos(p * 0.8) * 0.2 + 0.8;
                    g.addColorStop(0, '#701a75'); // fuchsia-900
                    g.addColorStop(Math.max(0.1, Math.min(0.9, stop1)), '#db2777'); // pink-600
                    g.addColorStop(Math.max(0.1, Math.min(0.9, stop2)), '#f97316'); // orange-500
                    g.addColorStop(1, '#7c2d12'); // orange-900
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (bgColorPreset === 'matrix-neon') {
                    ctx.fillStyle = '#022c22'; // emerald-950
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // Draw futuristic vertical neon lines
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
                    ctx.lineWidth = 4;
                    for (let x = 80; x < canvas.width; x += 120) {
                        const offset = Math.sin(p + x) * 150;
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x + offset / 2, canvas.height);
                        ctx.stroke();
                    }
                } else {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            // 2. Draw Text Overlay on top
            if (config.topText.trim()) {
                ctx.save();
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Header style parameters
                const paddingX = 40;
                const paddingY = 24;
                const maxWidth = canvas.width - 80;
                
                // Split long text into lines
                const words = config.topText.split(' ');
                const lines: string[] = [];
                let currentLine = '';
                
                ctx.font = `bold ${config.topTextSize}px "Inter", "system-ui", sans-serif`;
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = currentLine + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(currentLine.trim());
                        currentLine = words[n] + ' ';
                    } else {
                        currentLine = testLine;
                    }
                }
                lines.push(currentLine.trim());

                const lineHeight = config.topTextSize * 1.35;
                const totalHeight = lines.length * lineHeight;
                
                // Draw background box for text
                ctx.fillStyle = config.topBgColor;
                const boxW = canvas.width - 40;
                const boxH = totalHeight + paddingY * 2;
                const boxX = 20;
                const boxY = config.topY - boxH / 2;
                
                // Rounded rectangle for box
                ctx.beginPath();
                const radius = 16;
                ctx.roundRect?.(boxX, boxY, boxW, boxH, radius);
                ctx.fill();

                // Draw thin outer gold border to accent
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'; // Amber gold stroke
                ctx.lineWidth = 2;
                ctx.stroke();

                // Render each line of text
                ctx.fillStyle = config.topTextColor;
                lines.forEach((line, index) => {
                    const textY = boxY + paddingY + (index * lineHeight) + lineHeight / 2;
                    ctx.fillText(line, canvas.width / 2, textY);
                });

                ctx.restore();
            }

            // 3. Draw Follow Overlay Widget
            if (config.showFollowWidget && config.username) {
                ctx.save();
                
                const widgetW = canvas.width - 60;
                const widgetH = 76;
                const widgetX = 30;
                const widgetY = config.followY - widgetH / 2;
                
                // Frosted glass background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.beginPath();
                ctx.roundRect?.(widgetX, widgetY, widgetW, widgetH, 20);
                ctx.fill();

                // Smooth highlight border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Avatar bubble
                const avatarRadius = 24;
                const avatarX = widgetX + 16 + avatarRadius;
                const avatarY = widgetY + widgetH / 2;
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw avatar ring
                ctx.strokeStyle = config.followBgColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Avatar emoji text
                ctx.font = '24px "Inter"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(config.avatarEmoji || '👨', avatarX, avatarY);

                // Username handle
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 22px "Inter", sans-serif';
                ctx.fillText(`@${config.username}`, avatarX + 36, widgetY + widgetH / 2);

                // "Follow" Action Button
                const btnW = 110;
                const btnH = 42;
                const btnX = widgetX + widgetW - btnW - 16;
                const btnY = widgetY + (widgetH - btnH) / 2;

                // Pulsing glow for Follow Button
                let scale = 1.0;
                if (config.pulseAnimation) {
                    scale = 1.0 + Math.sin(Date.now() / 150) * 0.04;
                }

                ctx.save();
                ctx.translate(btnX + btnW / 2, btnY + btnH / 2);
                ctx.scale(scale, scale);

                ctx.fillStyle = config.followBgColor;
                ctx.beginPath();
                ctx.roundRect?.(-btnW / 2, -btnH / 2, btnW, btnH, 12);
                ctx.fill();

                // Button Text
                ctx.fillStyle = config.followTextColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '900 15px "Inter", sans-serif';
                ctx.fillText(config.followBtnText, 0, 0);

                ctx.restore();
                ctx.restore();
            }

            // 4. Draw Comment Call to Action Box
            if (config.showCommentWidget && config.commentText.trim()) {
                ctx.save();

                const boxW = canvas.width - 60;
                // Measure size
                ctx.font = '20px "Inter", sans-serif';
                const words = config.commentText.split(' ');
                const lines: string[] = [];
                let currentLine = '';
                const maxWidth = boxW - 60;
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = currentLine + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(currentLine.trim());
                        currentLine = words[n] + ' ';
                    } else {
                        currentLine = testLine;
                    }
                }
                lines.push(currentLine.trim());

                const textLineHeight = 28;
                const textTotalH = lines.length * textLineHeight;
                
                // Add height for the comment keyword block below
                const keywordAreaH = 64;
                const paddingY = 24;
                const boxH = textTotalH + keywordAreaH + paddingY * 2;
                const boxX = 30;
                const boxY = config.commentY - boxH / 2;

                // Render main background frame
                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                ctx.beginPath();
                ctx.roundRect?.(boxX, boxY, boxW, boxH, 24);
                ctx.fill();

                // Colored glow border around CTA card
                ctx.strokeStyle = config.commentBgColor;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Render lines of description
                ctx.fillStyle = '#cbd5e1'; // light gray
                ctx.font = '500 18px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                
                lines.forEach((line, index) => {
                    ctx.fillText(line, canvas.width / 2, boxY + paddingY + (index * textLineHeight));
                });

                // CTA Word / Code Badge Area
                const ctaBlockY = boxY + paddingY + textTotalH + 16;
                const keywordText = `KOMEN KATA: "${config.commentCtaWord}"`;
                
                // Draw flashing badge
                let pulseAlpha = 0.85;
                if (config.pulseAnimation) {
                    pulseAlpha = 0.7 + Math.sin(Date.now() / 200) * 0.25;
                }

                ctx.fillStyle = config.commentBgColor;
                ctx.save();
                ctx.globalAlpha = pulseAlpha;
                
                const badgeW = boxW - 80;
                const badgeH = 50;
                const badgeX = canvas.width / 2 - badgeW / 2;
                ctx.beginPath();
                ctx.roundRect?.(badgeX, ctaBlockY, badgeW, badgeH, 14);
                ctx.fill();
                ctx.restore();

                // Text over CTA badge
                ctx.fillStyle = config.commentTextColor;
                ctx.font = '900 20px "Inter", "Arial Black", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(keywordText, canvas.width / 2, ctaBlockY + badgeH / 2);

                ctx.restore();
            }

            // 5. Draw Arrow Pointer Overlay Widget
            if (config.showArrow) {
                ctx.save();
                
                // Move to arrow coordinates
                ctx.translate(config.arrowX, config.arrowY);
                ctx.rotate((config.arrowRotation * Math.PI) / 180);
                
                // Scale
                ctx.scale(config.arrowScale, config.arrowScale);
                
                // Draw Arrow Body
                ctx.fillStyle = config.arrowColor;
                ctx.strokeStyle = config.arrowColor;
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                // A thick line from (-50, 0) to (0, 0)
                ctx.beginPath();
                ctx.moveTo(-50, 0);
                ctx.lineTo(0, 0);
                ctx.stroke();
                
                // Arrow head pointing right (at 0, 0)
                ctx.beginPath();
                ctx.moveTo(-16, -14);
                ctx.lineTo(4, 0);
                ctx.lineTo(-16, 14);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
                
                // Draw Text Label above or near the arrow
                if (config.arrowText.trim()) {
                    ctx.save();
                    ctx.translate(config.arrowX, config.arrowY);
                    
                    ctx.font = `bold ${config.arrowTextSize}px "Inter", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const textWidth = ctx.measureText(config.arrowText).width;
                    const paddingX = 14;
                    const paddingY = 8;
                    const textHeight = config.arrowTextSize;
                    
                    // We place the text label above the arrow point
                    const textYOffset = -45;
                    
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                    ctx.strokeStyle = config.arrowColor;
                    ctx.lineWidth = 1.5;
                    
                    ctx.beginPath();
                    ctx.roundRect?.(
                        -textWidth / 2 - paddingX,
                        textYOffset - textHeight / 2 - paddingY,
                        textWidth + paddingX * 2,
                        textHeight + paddingY * 2,
                        10
                    );
                    ctx.fill();
                    ctx.stroke();
                    
                    ctx.fillStyle = config.arrowTextColor;
                    ctx.fillText(config.arrowText, 0, textYOffset);
                    ctx.restore();
                }
            }

            requestAnimationFrame(drawFrame);
        };

        drawFrame();

        return () => {
            active = false;
        };
    }, [config, videoUrl, bgColorPreset]);

    // Media Generation & Recording Pipeline
    const handleGenerateVideo = async () => {
        if (isRecording) return;
        
        setIsRecording(true);
        setRecordProgress(0);
        setGeneratedVideoUrl(null);

        try {
            const canvas = previewCanvasRef.current;
            if (!canvas) throw new Error("Canvas preview tidak siap");

            const video = previewVideoRef.current;
            const hasVideo = !!videoUrl && !!video;

            // Setup audio nodes from original video if present
            let streamDest: MediaStreamAudioDestinationNode | null = null;
            let audioContext: AudioContext | null = null;
            
            if (hasVideo && video) {
                try {
                    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }
                    const source = audioContext.createMediaElementSource(video);
                    streamDest = audioContext.createMediaStreamDestination();
                    source.connect(streamDest);
                    source.connect(audioContext.destination); // Also send to audio speakers
                } catch (e) {
                    console.warn("Audio Context setup skipped or already used.", e);
                }
            }

            // Duration calculation
            const maxDuration = hasVideo && video ? video.duration : 10; // Default to 10s if motion bg
            const targetTime = Math.min(maxDuration, 15); // Cap recording to 15 seconds max

            // Position video to start
            if (hasVideo && video) {
                video.currentTime = 0;
                video.muted = false;
                await new Promise((r) => {
                    const onSeek = () => {
                        video.removeEventListener('seeked', onSeek);
                        r(true);
                    };
                    video.addEventListener('seeked', onSeek);
                });
            }

            // Capture video frame tracks from Canvas
            const videoStream = canvas.captureStream(30);
            
            // Mix audio track if video exists and audio node is ready
            let tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
            if (streamDest) {
                tracks = [...tracks, ...streamDest.stream.getAudioTracks()];
            }

            const combinedStream = new MediaStream(tracks);
            const recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            const dataChunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) dataChunks.push(e.data);
            };

            const recordPromise = new Promise<string>((resolve, reject) => {
                recorder.onstop = () => {
                    const blob = new Blob(dataChunks, { type: 'video/webm' });
                    resolve(URL.createObjectURL(blob));
                };
                recorder.onerror = (e) => reject(e);
            });

            recorder.start();
            if (hasVideo && video) {
                video.play().catch(() => {});
            }

            // Track recording timer
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                const p = Math.min(100, Math.floor((elapsed / targetTime) * 100));
                setRecordProgress(p);

                if (elapsed >= targetTime || (hasVideo && video && video.ended)) {
                    clearInterval(interval);
                    recorder.stop();
                    if (hasVideo && video) {
                        video.pause();
                    }
                    if (audioContext) {
                        audioContext.close();
                    }
                }
            }, 100);

            const outputUrl = await recordPromise;
            setGeneratedVideoUrl(outputUrl);
            
            // Add to history list to allow multiple outputs
            const newHistoryItem = {
                id: `video-${Date.now()}`,
                url: outputUrl,
                timestamp: Date.now(),
                title: `Overlay Video #${historyVideos.length + 1} (${config.topText.trim() ? config.topText.substring(0, 16) : 'Untitled'}...)`
            };
            setHistoryVideos(prev => [newHistoryItem, ...prev]);

            setIsRecording(false);
            setRecordProgress(100);
        } catch (err: any) {
            console.error("Gagal merekam video:", err);
            alert(`Gagal membuat video: ${err.message || err}`);
            setIsRecording(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-inter">
            {/* Header Area */}
            <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-rose-500" />
                            9:16 FOLLOW & CTA MAKER
                        </h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pembuat Video 9:16 Dengan Overlay Interaktif & CTA</p>
                    </div>
                </div>
                
                {/* Export CTA Button */}
                <button
                    disabled={isRecording}
                    onClick={handleGenerateVideo}
                    className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isRecording ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Merekam {recordProgress}%
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Render & Simpan Video
                        </>
                    )}
                </button>
            </div>

            {/* Editor Workspace Layout */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden h-[calc(100vh-73px)]">
                
                {/* 1. Left Sidebar Panels: Controls & Design Settings (Col 5) */}
                <div className="xl:col-span-5 border-r border-slate-800 bg-slate-900/40 overflow-y-auto p-6 space-y-6">
                    
                    {/* Control Tabs */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'video' ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700/80' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Video className="w-3.5 h-3.5 mx-auto mb-1" />
                            MEDIA
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'text' ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700/80' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Type className="w-3.5 h-3.5 mx-auto mb-1" />
                            TEXT
                        </button>
                        <button
                            onClick={() => setActiveTab('follow')}
                            className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'follow' ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700/80' : 'text-slate-400 hover:text-white'}`}
                        >
                            <UserPlus className="w-3.5 h-3.5 mx-auto mb-1" />
                            FOLLOW
                        </button>
                        <button
                            onClick={() => setActiveTab('comment')}
                            className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'comment' ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700/80' : 'text-slate-400 hover:text-white'}`}
                        >
                            <MessageSquare className="w-3.5 h-3.5 mx-auto mb-1" />
                            KOMEN
                        </button>
                        <button
                            onClick={() => setActiveTab('arrow')}
                            className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${activeTab === 'arrow' ? 'bg-slate-800 text-rose-400 shadow-sm border border-slate-700/80' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ArrowUpRight className="w-3.5 h-3.5 mx-auto mb-1" />
                            PANAH
                        </button>
                    </div>

                    {/* Tab 1: Video File & Motion Presets */}
                    {activeTab === 'video' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2 text-rose-400">
                                    <Video className="w-4 h-4" /> 1. SUMBER VIDEO LATAR BELAKANG
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                    Unggah video 9:16 Anda atau pilih preset motion background cantik kami untuk langsung membuat aset konversi video.
                                </p>
                                
                                {videoUrl ? (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-rose-500/10 p-2.5 rounded-lg">
                                                <Video className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold truncate text-slate-200">{videoFile?.name || 'Video Terunggah'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Siap untuk overlay</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveVideo}
                                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all border border-rose-500/20"
                                            title="Hapus Video"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-800 hover:border-rose-500 bg-slate-950/50 hover:bg-slate-900/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                                    >
                                        <Upload className="w-10 h-10 text-slate-500 group-hover:text-rose-500 mx-auto mb-3 transition-transform group-hover:-translate-y-1" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-300">PILIH ATAU TARIK VIDEO 9:16</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase">Format MP4 / WebM maksimal 50MB</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            {!videoUrl && (
                                <div className="border-t border-slate-800/80 pt-4">
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" /> ATAU GUNAKAN PRESET MOTION BG:
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { id: 'cosmic-dark', name: 'Cosmic Dark', bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black', text: 'text-indigo-400' },
                                            { id: 'vibrant-sunset', name: 'Sunset Glow', bg: 'bg-gradient-to-br from-purple-800 via-pink-600 to-orange-500', text: 'text-rose-400' },
                                            { id: 'matrix-neon', name: 'Matrix Emerald', bg: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-black', text: 'text-emerald-400' }
                                        ].map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setBgColorPreset(preset.id)}
                                                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${bgColorPreset === preset.id ? 'border-amber-400 bg-slate-900 shadow-md ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700'}`}
                                            >
                                                <div className={`w-6 h-6 rounded ${preset.bg}`} />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Header Text Overlay Settings */}
                    {activeTab === 'text' && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-rose-400">
                                <Type className="w-4 h-4" /> 2. PENGATURAN TEXT BAGIAN ATAS
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Isi Teks Headline</label>
                                <textarea
                                    value={config.topText}
                                    onChange={(e) => setConfig({ ...config, topText: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none h-24"
                                    placeholder="Tulis headline video di sini..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Ukuran Font</label>
                                    <input
                                        type="range"
                                        min="16"
                                        max="42"
                                        value={config.topTextSize}
                                        onChange={(e) => setConfig({ ...config, topTextSize: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 mt-1 block text-right">{config.topTextSize}px</span>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Posisi Tinggi (Y)</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="350"
                                        value={config.topY}
                                        onChange={(e) => setConfig({ ...config, topY: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 mt-1 block text-right">Y: {config.topY}px</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Warna Teks</label>
                                    <div className="flex gap-2 items-center bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                                        <input
                                            type="color"
                                            value={config.topTextColor}
                                            onChange={(e) => setConfig({ ...config, topTextColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <span className="text-xs font-mono">{config.topTextColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Warna Latar Kotak</label>
                                    <div className="flex gap-2 items-center bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                                        <input
                                            type="color"
                                            value={config.topBgColor.startsWith('rgba') ? '#0f172a' : config.topBgColor}
                                            onChange={(e) => setConfig({ ...config, topBgColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <span className="text-xs font-mono">{config.topBgColor.substring(0, 7).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Follow Widget Settings */}
                    {activeTab === 'follow' && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-rose-400">
                                <UserPlus className="w-4 h-4" /> 3. PENGATURAN OVERLAY FOLLOW
                            </h3>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-rose-500" />
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">Aktifkan Follow Widget</p>
                                        <p className="text-[9px] text-slate-400">Tampilkan widget ikuti akun di video</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.showFollowWidget} 
                                        onChange={(e) => setConfig({ ...config, showFollowWidget: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Username Akun</label>
                                    <input
                                        type="text"
                                        value={config.username}
                                        onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        placeholder="handle.anda"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pilihan Emoji Avatar</label>
                                    <select
                                        value={config.avatarEmoji}
                                        onChange={(e) => setConfig({ ...config, avatarEmoji: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 h-[38px]"
                                    >
                                        <option value="👨‍💻">👨‍💻 Tech Guy</option>
                                        <option value="👩‍💼">👩‍💼 Biz Girl</option>
                                        <option value="💡">💡 Idea Bulb</option>
                                        <option value="🔥">🔥 Hot Fire</option>
                                        <option value="📢">📢 Loud Speaker</option>
                                        <option value="🚀">🚀 Rocket Speed</option>
                                        <option value="💰">💰 Money Bag</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tombol Teks</label>
                                    <input
                                        type="text"
                                        value={config.followBtnText}
                                        onChange={(e) => setConfig({ ...config, followBtnText: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tinggi Widget (Y)</label>
                                    <input
                                        type="range"
                                        min="350"
                                        max="750"
                                        value={config.followY}
                                        onChange={(e) => setConfig({ ...config, followY: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2 mt-3"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">Y: {config.followY}px</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Warna Tombol</label>
                                    <div className="flex gap-2 items-center bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                                        <input
                                            type="color"
                                            value={config.followBgColor}
                                            onChange={(e) => setConfig({ ...config, followBgColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <span className="text-xs font-mono">{config.followBgColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end pb-1.5">
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 border border-slate-800/80 px-3.5 py-3 rounded-xl hover:bg-slate-900/60 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={config.pulseAnimation}
                                            onChange={(e) => setConfig({ ...config, pulseAnimation: e.target.checked })}
                                            className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-950"
                                        />
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">Animasi Berdenyut</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Comment CTA Settings */}
                    {activeTab === 'comment' && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-rose-400">
                                <MessageSquare className="w-4 h-4" /> 4. PENGATURAN CTA KOMEN
                            </h3>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-rose-500" />
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">Aktifkan CTA Komen</p>
                                        <p className="text-[9px] text-slate-400">Tampilkan kotak ajakan komen di video</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.showCommentWidget} 
                                        onChange={(e) => setConfig({ ...config, showCommentWidget: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                                </label>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Teks Ajakan (CTA)</label>
                                <textarea
                                    value={config.commentText}
                                    onChange={(e) => setConfig({ ...config, commentText: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Kata Kunci Komen</label>
                                    <input
                                        type="text"
                                        value={config.commentCtaWord}
                                        onChange={(e) => setConfig({ ...config, commentCtaWord: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 uppercase focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        placeholder="INFO"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tinggi Kotak (Y)</label>
                                    <input
                                        type="range"
                                        min="750"
                                        max="1150"
                                        value={config.commentY}
                                        onChange={(e) => setConfig({ ...config, commentY: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2 mt-3"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">Y: {config.commentY}px</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Warna Badge Kata</label>
                                    <div className="flex gap-2 items-center bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                                        <input
                                            type="color"
                                            value={config.commentBgColor}
                                            onChange={(e) => setConfig({ ...config, commentBgColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <span className="text-xs font-mono">{config.commentBgColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Warna Teks Badge</label>
                                    <div className="flex gap-2 items-center bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                                        <input
                                            type="color"
                                            value={config.commentTextColor}
                                            onChange={(e) => setConfig({ ...config, commentTextColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <span className="text-xs font-mono">{config.commentTextColor.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Arrow Settings */}
                    {activeTab === 'arrow' && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-rose-400">
                                <ArrowUpRight className="w-4 h-4" /> 5. PENGATURAN PANAH & LABEL TEXT
                            </h3>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight className="w-4 h-4 text-rose-500" />
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">Aktifkan Panah Indikator</p>
                                        <p className="text-[9px] text-slate-400">Tampilkan penunjuk panah manual dengan teks</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.showArrow} 
                                        onChange={(e) => setConfig({ ...config, showArrow: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Teks Label Panah</label>
                                <input
                                    type="text"
                                    value={config.arrowText}
                                    onChange={(e) => setConfig({ ...config, arrowText: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    placeholder="KLIK DI SINI!"
                                />
                            </div>

                            {/* Coordinates Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Posisi Horisontal (X)</label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="700"
                                        value={config.arrowX}
                                        onChange={(e) => setConfig({ ...config, arrowX: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">X: {config.arrowX}px</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Posisi Vertikal (Y)</label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="1260"
                                        value={config.arrowY}
                                        onChange={(e) => setConfig({ ...config, arrowY: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">Y: {config.arrowY}px</span>
                                </div>
                            </div>

                            {/* Rotation and Scale */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Rotasi (Derajat)</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={config.arrowRotation}
                                        onChange={(e) => setConfig({ ...config, arrowRotation: parseInt(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">{config.arrowRotation}°</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Ukuran Panah (Skala)</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.5"
                                        step="0.1"
                                        value={config.arrowScale}
                                        onChange={(e) => setConfig({ ...config, arrowScale: parseFloat(e.target.value) })}
                                        className="w-full accent-rose-600 bg-slate-950 rounded-lg h-2"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500 text-right block">{config.arrowScale}x</span>
                                </div>
                            </div>

                            {/* Colors and font size */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Ukuran Font</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="40"
                                        value={config.arrowTextSize}
                                        onChange={(e) => setConfig({ ...config, arrowTextSize: parseInt(e.target.value) || 16 })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-white"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Warna Panah</label>
                                    <input
                                        type="color"
                                        value={config.arrowColor}
                                        onChange={(e) => setConfig({ ...config, arrowColor: e.target.value })}
                                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Warna Teks</label>
                                    <input
                                        type="color"
                                        value={config.arrowTextColor}
                                        onChange={(e) => setConfig({ ...config, arrowTextColor: e.target.value })}
                                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pre-rendered Download Card after build completes */}
                    {generatedVideoUrl && (
                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-500/10 p-2 rounded-lg">
                                    <Check className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-tight">VIDEO BERHASIL DIBUAT!</h4>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Aset 9:16 siap untuk diunduh</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={generatedVideoUrl}
                                    download={`irwan-kurnia-916-cta-${Date.now()}.webm`}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider py-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Unduh Hasil Video
                                </a>
                                <button
                                    onClick={() => setGeneratedVideoUrl(null)}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-400 hover:text-white transition-all"
                                    title="Ulangi Pembuatan"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Render History List Section (Multiple Outputs support) */}
                    <div className="border-t border-slate-800/80 pt-5 mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                <History className="w-4 h-4 text-rose-500" />
                                RIWAYAT HASIL RENDER ({historyVideos.length})
                            </h4>
                            {historyVideos.length > 0 && (
                                <button
                                    onClick={() => {
                                        setHistoryVideos([]);
                                        setGeneratedVideoUrl(null);
                                    }}
                                    className="text-[9px] uppercase font-bold text-rose-500/80 hover:text-rose-400 transition-all"
                                >
                                    Hapus Semua
                                </button>
                            )}
                        </div>

                        {historyVideos.length === 0 ? (
                            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-6 text-center text-slate-500">
                                <Video className="w-8 h-8 mx-auto opacity-30 mb-2" />
                                <p className="text-[10px] uppercase tracking-wider font-bold">Belum ada video yang dirender</p>
                                <p className="text-[9px] mt-0.5 text-slate-600">Klik 'Render & Simpan Video' untuk mulai merekam</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {historyVideos.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-all group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-rose-400 transition-colors">
                                                {item.title}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Preview play button */}
                                            <button
                                                onClick={() => setGeneratedVideoUrl(item.url)}
                                                className="p-1.5 bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-all"
                                                title="Tampilkan di Pemutar"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                            {/* Download link */}
                                            <a
                                                href={item.url}
                                                download={`overlay-916-render-${index+1}.webm`}
                                                className="p-1.5 bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-400 border border-slate-800 hover:border-emerald-500/20 rounded-lg transition-all"
                                                title="Unduh Video"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                            {/* Delete item */}
                                            <button
                                                onClick={() => {
                                                    setHistoryVideos(prev => prev.filter(v => v.id !== item.id));
                                                    if (generatedVideoUrl === item.url) setGeneratedVideoUrl(null);
                                                }}
                                                className="p-1.5 bg-slate-900 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* 2. Middle Panel: Live Preview Arena in Portrait Frame (Col 7) */}
                <div className="xl:col-span-7 bg-slate-950 overflow-y-auto p-6 flex flex-col items-center justify-center relative">
                    
                    {/* Floating controls */}
                    <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
                        <span className="bg-slate-900 border border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            Canvas Preview
                        </span>
                        {videoUrl && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`px-2.5 py-1 text-[9px] uppercase font-bold rounded border ${isMuted ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                            >
                                {isMuted ? '🔊 Matikan Mute' : '🔇 Mute'}
                            </button>
                        )}
                    </div>

                    {/* 9:16 Simulated Mobile Mockup Card */}
                    <div className="relative aspect-[9/16] w-full max-w-[340px] md:max-w-[380px] bg-slate-900 rounded-[40px] p-3 border-[6px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden group">
                        
                        {/* Hidden Source Video Tag to stream buffer */}
                        {videoUrl && (
                            <video
                                ref={previewVideoRef}
                                src={videoUrl}
                                loop
                                muted={isMuted}
                                playsInline
                                className="hidden"
                                onLoadedMetadata={() => {
                                    if (previewVideoRef.current) {
                                        previewVideoRef.current.play().catch(() => {});
                                    }
                                }}
                            />
                        )}

                        {/* Interactive Render Canvas */}
                        <canvas
                            id="render-viewport"
                            ref={previewCanvasRef}
                            width={720}
                            height={1280}
                            className="w-full h-full rounded-[30px] object-cover bg-slate-950"
                        />

                        {/* Play/Pause Hover Indicator Overlay */}
                        <div 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer rounded-[30px]"
                        >
                            <div className="bg-slate-950/80 p-4 rounded-full border border-slate-800 scale-90 group-hover:scale-100 transition-transform">
                                {isPlaying ? (
                                    <Pause className="w-8 h-8 text-white" />
                                ) : (
                                    <Play className="w-8 h-8 text-white fill-white" />
                                )}
                            </div>
                        </div>

                        {/* Top Speaker Notch decoration */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-full z-30" />
                        
                        {/* Bottom Home Indicator decoration */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-700 rounded-full z-30" />
                    </div>

                    {/* Status Info under frame */}
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 font-bold">
                        <Smile className="w-3.5 h-3.5" /> Klik frame video untuk putar / jeda preview
                    </p>

                </div>

            </div>
        </div>
    );
};

export default VideoOverlay916;
