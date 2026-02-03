import React, { useState, useEffect } from 'react';
// Added User to the imported icons from lucide-react
import { ArrowLeft, Film, Loader2, Download, AlertTriangle, MonitorPlay, Smartphone, Wind, ExternalLink, Zap, Timer, Layout, LogIn, Info, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TextToVideoProps {
    onBack: () => void;
}

const TextToVideo: React.FC<TextToVideoProps> = ({ onBack }) => {
    const [viewMode, setViewMode] = useState<'local' | 'workspace'>('workspace');
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [hasKey, setHasKey] = useState<boolean | null>(null);

    const FLOW_PROJECT_URL = "https://labs.google/fx/tools/flow/project/96458230-a511-4edb-a339-7dbc79f4c2b9";

    useEffect(() => {
        checkKeyStatus();
    }, []);

    const checkKeyStatus = async () => {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
    };

    const handleSignIn = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Race condition: assume success and proceed
            setHasKey(true);
            setError(null);
        } catch (e) {
            setError("Gagal melakukan login Google.");
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Ensure key is selected right before calling
        if (!(await window.aistudio.hasSelectedApiKey())) {
            await handleSignIn();
        }

        setIsGenerating(true);
        setVideoUrl(null);
        setError(null);
        setStatus('Initializing Veo 3.1 Fast...');

        try {
            // Create a new instance right before use as per instructions
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview', 
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });

            setStatus('Rendering fast preview frames...');

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
                setStatus('Generating (Fast model takes ~30-60s)...');
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                setStatus('Downloading video...');
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setStatus('Success!');
            }
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes("Requested entity was not found") || err.message?.includes("404")) {
                setError("Akun atau Project tidak ditemukan. Silakan pilih akun Google lain dengan billing aktif.");
                setHasKey(false); // Reset state to prompt for re-auth
            } else {
                setError(err.message || "Gagal menghasilkan video.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (hasKey === false) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        {/* Fix: Removed reference to missing Facebook icon, using Zap instead as suggested by internal comment */}
                        <Zap className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sign in Required</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        Aplikasi ini menggunakan Google Veo 3.1. Anda harus login dengan akun Google Cloud yang memiliki billing aktif.
                    </p>
                    
                    <button 
                        onClick={handleSignIn}
                        className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 mb-4"
                    >
                        <LogIn className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center justify-center gap-1 transition-colors"
                    >
                        <Info className="w-3 h-3" />
                        Learn about Gemini API Billing
                    </a>
                </div>
                <button onClick={onBack} className="mt-8 text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 text-white font-inter flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black text-cyan-500 uppercase tracking-tighter flex items-center gap-2">
                            <Wind className="w-4 h-4" /> VEO FLOW STUDIO
                        </h1>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setViewMode('workspace')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'workspace' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout className="w-3.5 h-3.5" /> CLOUD WORKSPACE
                    </button>
                    <button 
                        onClick={() => setViewMode('local')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'local' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Zap className="w-3.5 h-3.5" /> LOCAL GENERATOR
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Fix: Added User icon to imports to support account switching action */}
                    <button onClick={handleSignIn} className="p-2 text-slate-500 hover:text-blue-400 transition-colors" title="Ganti Akun Google">
                        <User className="w-4 h-4" />
                    </button>
                    <a href={FLOW_PROJECT_URL} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors" title="Buka di tab baru">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <div className="flex-1 relative">
                {viewMode === 'workspace' && (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col">
                        <div className="flex-1 relative bg-black">
                            <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-700 p-10 text-center">
                                <div className="max-w-md space-y-4">
                                    <AlertTriangle className="w-12 h-12 mx-auto opacity-20" />
                                    <p className="text-sm italic">Jika Anda melihat layar login di bawah dan tidak bisa diklik, silakan login ke akun Google Anda di tab browser utama terlebih dahulu, lalu refresh halaman ini.</p>
                                    <a href={FLOW_PROJECT_URL} target="_blank" className="inline-block px-6 py-2 bg-slate-800 rounded-full text-xs font-bold hover:bg-slate-700 transition-all uppercase tracking-widest">Buka di Tab Baru</a>
                                </div>
                            </div>
                            <iframe 
                                src={FLOW_PROJECT_URL} 
                                className="w-full h-full border-none"
                                title="Google Labs Flow"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {viewMode === 'local' && (
                    <div className="h-full max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto">
                        <div className="w-full lg:w-1/2 space-y-6">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Prompt</label>
                                    <textarea 
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your scene..."
                                        className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setAspectRatio('9:16')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${aspectRatio === '9:16' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-500'}`}><Smartphone className="w-5 h-5" /><span className="text-[10px] font-bold">9:16</span></button>
                                    <button onClick={() => setAspectRatio('16:9')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${aspectRatio === '16:9' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-500'}`}><MonitorPlay className="w-5 h-5" /><span className="text-[10px] font-bold">16:9</span></button>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-xs">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/20">
                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    GENERATE VEO FAST
                                </button>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl h-full min-h-[400px] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Local Result</label>
                                    {status && <span className="text-[10px] text-cyan-400 animate-pulse font-mono font-bold uppercase">{status}</span>}
                                </div>
                                <div className="flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                                    {videoUrl ? (
                                        <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center p-10 opacity-20">
                                            <Film className="w-16 h-16 mx-auto mb-4" />
                                            <p className="text-xs uppercase tracking-widest font-black">Render Preview Ready</p>
                                        </div>
                                    )}
                                </div>
                                {videoUrl && <a href={videoUrl} download="veo.mp4" className="mt-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"><Download className="w-4 h-4" /> DOWNLOAD MP4</a>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToVideo;