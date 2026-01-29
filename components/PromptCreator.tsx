
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, Loader2, Copy, Video, CheckCircle, AlertTriangle, FileJson } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface PromptCreatorProps {
    onBack: () => void;
}

const PromptCreator: React.FC<PromptCreatorProps> = ({ onBack }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultJson, setResultJson] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) { // 20MB Limit warning for browser base64
                setError("Ukuran video terlalu besar. Gunakan klip pendek (< 20MB) untuk hasil terbaik.");
                return;
            }
            setError(null);
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setResultJson(null);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g. "data:video/mp4;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const generatePrompt = async () => {
        if (!videoFile) return;

        setIsProcessing(true);
        setError(null);
        setResultJson(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(videoFile);

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', // High speed, good vision capabilities
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: videoFile.type } },
                        { text: `Analyze the visual content of this video clip meticulously. 
                        I need to recreate a similar video using generative AI tools like Google Veo or Flow.
                        
                        Extract the key elements:
                        1. The main subject and their action.
                        2. The camera movement (pan, tilt, zoom, static, handheld, cinematic, etc.).
                        3. The lighting (natural, studio, cinematic, moody, etc.).
                        4. The environment/background.
                        5. Technical quality keywords (4k, 8k, photorealistic, etc.).
                        
                        Return ONLY a valid JSON object with the following schema.` }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject_description: { type: Type.STRING, description: "Detailed description of the main subject and their clothing/appearance" },
                            action_description: { type: Type.STRING, description: "What the subject is doing" },
                            environment: { type: Type.STRING, description: "Description of the setting/background" },
                            lighting_atmosphere: { type: Type.STRING, description: "Lighting style and mood" },
                            camera_movement: { type: Type.STRING, description: "Specific camera techniques used" },
                            technical_quality: { type: Type.STRING, description: "Quality keywords like 4k, hdr, blur, depth of field" },
                            full_positive_prompt: { type: Type.STRING, description: "A combined, comma-separated comprehensive prompt ready for AI generation" },
                            negative_prompt: { type: Type.STRING, description: "What to avoid (e.g. bad quality, distortion, cartoon)" }
                        },
                        required: ["full_positive_prompt", "camera_movement", "subject_description", "environment", "lighting_atmosphere"]
                    }
                }
            });

            if (response.text) {
                setResultJson(response.text);
            } else {
                setError("Gagal menghasilkan prompt. Silakan coba lagi.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat memproses video.");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        if (resultJson) {
            navigator.clipboard.writeText(resultJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyPromptOnly = () => {
        if (resultJson) {
            try {
                const parsed = JSON.parse(resultJson);
                navigator.clipboard.writeText(parsed.full_positive_prompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                copyToClipboard();
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col">
            {/* Header */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 sticky top-0 z-20 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        AI Prompt Creator
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
                
                {/* Left: Input & Preview */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">1. Upload Reference Video</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-video w-full bg-slate-950 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${videoUrl ? 'border-amber-500/50' : 'border-slate-700 hover:border-amber-500/50'}`}
                            >
                                <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                {videoUrl ? (
                                    <video src={videoUrl} className="w-full h-full object-contain" controls />
                                ) : (
                                    <div className="text-center p-6 text-slate-500 group-hover:text-amber-400 transition-colors">
                                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">Click to upload video</p>
                                        <p className="text-xs opacity-50 mt-1">Max 20MB for best performance</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button 
                            onClick={generatePrompt}
                            disabled={!videoFile || isProcessing}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isProcessing ? 'Analyzing Video...' : 'Generate JSON Prompt'}
                        </button>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                        <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" /> Compatible With
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            <span className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">Google Veo</span>
                            <span className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">Flow</span>
                            <span className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">Runway Gen-3</span>
                            <span className="bg-slate-900 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700">Luma Dream Machine</span>
                        </div>
                    </div>
                </div>

                {/* Right: Output */}
                <div className="w-full lg:w-1/2 flex flex-col h-full min-h-[400px]">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileJson className="w-4 h-4" /> Generated Output
                            </label>
                            {resultJson && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={copyPromptOnly}
                                        className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Copy Prompt Only
                                    </button>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="text-[10px] font-bold bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy JSON'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-auto relative">
                            {resultJson ? (
                                <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                                    {resultJson}
                                </pre>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-10 h-10 animate-spin mb-3 text-amber-500/50" />
                                            <p>Gemini is watching your video...</p>
                                        </>
                                    ) : (
                                        <>
                                            <FileJson className="w-10 h-10 mb-3 opacity-20" />
                                            <p>Result will appear here</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PromptCreator;