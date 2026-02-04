
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Film, Loader2, Download, AlertTriangle, MonitorPlay, Smartphone, Zap, Info, LogIn, Upload, ImageIcon, User, KeyRound } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ImageToVideoProps {
    onBack: () => void;
}

const ImageToVideo: React.FC<ImageToVideoProps> = ({ onBack }) => {
    const [apiKey, setApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [sourceImage, setSourceImage] = useState<{ file: File, url: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!sourceImage || !prompt.trim() || !apiKey) {
            setError("API Key is required to generate video.");
            setIsKeySaved(false);
            return;
        }

        setIsGenerating(true);
        setGeneratedVideoUrl(null);
        setError(null);
        setStatusMessage('Initializing Veo model...');

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const base64Data = await fileToBase64(sourceImage.file);
            
            const imagePart = {
                imageBytes: base64Data,
                mimeType: sourceImage.file.type,
            };

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: imagePart,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });

            setStatusMessage('Rendering video... (this can take a few minutes)');

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 8000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            setStatusMessage('Finalizing and downloading video...');
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${apiKey}`);
                const blob = await response.blob();
                setGeneratedVideoUrl(URL.createObjectURL(blob));
                setStatusMessage('Video generated successfully!');
            } else {
                throw new Error("No video URI returned from operation.");
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "An unknown error occurred.";
            if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("PERMISSION_DENIED")) {
                setError("API key not valid. Please check your key and try again.");
                setIsKeySaved(false);
            } else if (msg.includes("Requested entity was not found")) {
                setError("Project/Key not found. Ensure the key is from a Google Cloud project with billing enabled.");
                setIsKeySaved(false);
            } else {
                setError(msg);
            }
        } finally {
            setIsGenerating(false);
            setStatusMessage('');
        }
    };

    // Authentication Screen
    if (!isKeySaved) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-teal-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <KeyRound className="w-10 h-10 text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Enter Google AI API Key</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        This feature uses Google's Veo model, which requires a paid API key. Please enter your key from a Google Cloud project with active billing.
                    </p>
                    
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Google AI API Key"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white mb-4 text-center focus:ring-2 focus:ring-teal-500 outline-none"
                    />

                    <button 
                        onClick={() => setIsKeySaved(true)}
                        disabled={!apiKey.trim()}
                        className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 mb-4 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        <LogIn className="w-5 h-5" />
                        Save & Continue
                    </button>

                    {error && <p className="text-red-400 text-xs mt-4">{error}</p>}

                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-teal-400 flex items-center justify-center gap-1 transition-colors mt-4">
                        <Info className="w-3 h-3" />
                        Learn about Gemini API Billing
                    </a>
                </div>
                <button onClick={onBack} className="mt-8 text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
            </div>
        );
    }

    // Main Generator Screen
    return (
        <div className="h-screen bg-slate-950 text-white font-inter flex flex-col overflow-hidden">
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-sm font-black text-teal-400 uppercase tracking-tighter flex items-center gap-2">
                        <Film className="w-4 h-4" /> Image to Video (Veo)
                    </h1>
                </div>
                <button onClick={() => setIsKeySaved(false)} className="p-2 text-slate-500 hover:text-teal-400 transition-colors" title="Change API Key">
                    <KeyRound className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 overflow-y-auto">
                {/* Left Panel: Controls */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Upload Image</label>
                        <div onClick={() => fileInputRef.current?.click()} className={`aspect-square w-full bg-slate-900 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${sourceImage ? 'border-teal-500/50' : 'border-slate-700 hover:border-teal-500/50'}`}>
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setSourceImage({ file, url: URL.createObjectURL(file) });
                                    setGeneratedVideoUrl(null);
                                }
                            }} />
                            {sourceImage ? (
                                <img src={sourceImage.url} alt="Source Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6 text-slate-500 group-hover:text-teal-400 transition-colors">
                                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Click or Drag Image</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Describe Animation</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., cinematic drone shot flying forward, golden hour lighting, hyperrealistic..."
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                        />
                    </div>
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">3. Select Format</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setAspectRatio('9:16')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${aspectRatio === '9:16' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><Smartphone className="w-5 h-5" /><span className="text-[10px] font-bold">9:16</span></button>
                            <button onClick={() => setAspectRatio('16:9')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${aspectRatio === '16:9' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><MonitorPlay className="w-5 h-5" /><span className="text-[10px] font-bold">16:9</span></button>
                        </div>
                    </div>
                     {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-xs">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    <button onClick={handleGenerate} disabled={!sourceImage || !prompt.trim() || isGenerating} className="w-full py-4 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-teal-900/20 disabled:bg-slate-800 disabled:text-slate-500">
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        GENERATE VIDEO
                    </button>
                </div>
                {/* Right Panel: Result */}
                <div className="w-full lg:w-2/3 flex flex-col">
                     <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Result</label>
                            {isGenerating && <span className="text-[10px] text-teal-400 animate-pulse font-mono font-bold">{statusMessage}</span>}
                        </div>
                        <div className="flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 relative">
                             {generatedVideoUrl ? (
                                <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-10 opacity-10">
                                    <Film className="w-24 h-24 mx-auto mb-4" />
                                    <p className="text-sm uppercase tracking-widest font-black">Video preview will appear here</p>
                                </div>
                            )}
                            {isGenerating && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 max-w-xs text-center">{statusMessage}</p>
                                </div>
                            )}
                        </div>
                        {generatedVideoUrl && <a href={generatedVideoUrl} download="image-to-video.mp4" className="mt-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"><Download className="w-4 h-4" /> DOWNLOAD MP4</a>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageToVideo;
