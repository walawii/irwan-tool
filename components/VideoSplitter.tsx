
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Scissors, Play, Download, Loader2, Video, CheckCircle, Smartphone } from 'lucide-react';

interface VideoSplitterProps {
    onBack: () => void;
}

interface SplitChunk {
    id: string;
    url: string;
    duration: number;
    part: number;
}

const VideoSplitter: React.FC<VideoSplitterProps> = ({ onBack }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [chunks, setChunks] = useState<SplitChunk[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState('');
    const [segmentDuration, setSegmentDuration] = useState(15);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setChunks([]);
        }
    };

    const processVideo = async () => {
        if (!videoFile || !videoUrl) return;

        setIsProcessing(true);
        setChunks([]);
        
        // Setup hidden elements
        const video = document.createElement('video');
        video.src = videoUrl;
        video.muted = false; // We want audio
        video.volume = 1.0;
        video.playsInline = true;

        await new Promise(r => video.onloadedmetadata = r);

        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 1280; // 9:16 Ratio
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Setup Audio Context
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);

        const totalSegments = Math.ceil(video.duration / segmentDuration);
        const generatedChunks: SplitChunk[] = [];

        for (let i = 0; i < totalSegments; i++) {
            setProgress(`Processing Part ${i + 1} of ${totalSegments}...`);
            
            const chunkStartTime = i * segmentDuration;
            const chunkEndTime = Math.min((i + 1) * segmentDuration, video.duration);
            const duration = chunkEndTime - chunkStartTime;

            // Seek
            video.currentTime = chunkStartTime;
            await new Promise(r => {
                const onSeek = () => {
                    video.removeEventListener('seeked', onSeek);
                    r(true);
                };
                video.addEventListener('seeked', onSeek);
            });

            // Stream Setup
            const videoStream = canvas.captureStream(30);
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            const dataChunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) dataChunks.push(e.data);
            };

            const chunkPromise = new Promise<string>((resolve) => {
                recorder.onstop = () => {
                    const blob = new Blob(dataChunks, { type: 'video/webm' });
                    resolve(URL.createObjectURL(blob));
                };
            });

            recorder.start();
            video.play();

            // Render Loop for this segment
            const stopTime = chunkEndTime;
            
            await new Promise((resolveRender) => {
                const draw = () => {
                    if (video.currentTime >= stopTime || video.ended) {
                        recorder.stop();
                        video.pause();
                        resolveRender(true);
                        return;
                    }

                    // 9:16 Crop Logic (Center Cover)
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    const vRatio = video.videoWidth / video.videoHeight;
                    const cRatio = canvas.width / canvas.height;
                    let dw, dh, dx, dy;

                    if (vRatio > cRatio) {
                        // Video is wider (landscape or wider portrait) -> Crop sides
                        dh = canvas.height;
                        dw = dh * vRatio;
                        dx = (canvas.width - dw) / 2;
                        dy = 0;
                    } else {
                        // Video is taller -> Crop top/bottom
                        dw = canvas.width;
                        dh = dw / vRatio;
                        dx = 0;
                        dy = (canvas.height - dh) / 2;
                    }
                    ctx.drawImage(video, dx, dy, dw, dh);

                    requestAnimationFrame(draw);
                };
                draw();
            });

            const chunkUrl = await chunkPromise;
            generatedChunks.push({
                id: Math.random().toString(),
                url: chunkUrl,
                duration: duration,
                part: i + 1
            });
            setChunks([...generatedChunks]); // Update UI incrementally
        }

        audioCtx.close();
        setIsProcessing(false);
        setProgress('Done!');
    };

    const downloadChunk = (chunk: SplitChunk) => {
        const a = document.createElement('a');
        a.href = chunk.url;
        a.download = `part-${chunk.part}-video.webm`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col">
            {/* Header */}
            <div className="bg-pink-600/10 border-b border-pink-500/20 p-4 sticky top-0 z-20 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Scissors className="w-6 h-6 text-pink-500" />
                        Auto Video Splitter
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
                
                {/* Input Section */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Video Upload */}
                        <div className="flex-1 space-y-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">Upload Video</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-video w-full bg-slate-950 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${videoUrl ? 'border-pink-500/50' : 'border-slate-700 hover:border-pink-500/50'}`}
                            >
                                <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                {videoUrl ? (
                                    <video src={videoUrl} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-center p-6 text-slate-500 group-hover:text-pink-400 transition-colors">
                                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">Click to upload video</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Config & Action */}
                        <div className="w-full md:w-80 space-y-6 flex flex-col justify-center">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Segment Duration (Sec)</label>
                                <input 
                                    type="number" 
                                    value={segmentDuration}
                                    onChange={(e) => setSegmentDuration(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-center focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>

                            <div className="p-4 bg-pink-900/10 border border-pink-500/20 rounded-xl">
                                <p className="text-xs text-pink-300 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> Output Format: <strong>9:16 (Vertical)</strong>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1 pl-6">
                                    Video will be automatically center-cropped to fit vertical screens.
                                </p>
                            </div>

                            <button 
                                onClick={processVideo}
                                disabled={!videoUrl || isProcessing}
                                className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-pink-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                {isProcessing ? 'Processing...' : 'Start Splitting'}
                            </button>
                            
                            {isProcessing && (
                                <p className="text-xs text-center text-pink-400 animate-pulse font-mono">{progress}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {chunks.length > 0 && (
                    <div className="space-y-4 pb-20">
                        <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" /> Generated Segments ({chunks.length})
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {chunks.map((chunk) => (
                                <div key={chunk.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="aspect-[9/16] bg-black relative">
                                        <video src={chunk.url} className="w-full h-full object-cover" controls />
                                    </div>
                                    <div className="p-3">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-white">Part {chunk.part}</span>
                                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{chunk.duration.toFixed(1)}s</span>
                                        </div>
                                        <button 
                                            onClick={() => downloadChunk(chunk)}
                                            className="w-full py-2 bg-slate-800 hover:bg-green-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-3 h-3" /> Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoSplitter;
