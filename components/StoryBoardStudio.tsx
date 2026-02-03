import React, { useState, useRef } from 'react';
import { ArrowLeft, Film, Loader2, Download, AlertTriangle, MonitorPlay, Smartphone, Wind, ExternalLink, Zap, Timer, Layout, Copy, CheckCircle, Sparkles, Plus, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Scene {
    id: string;
    number: number;
    title: string;
    description: string;
    aiPrompt: string;
    imageUrl: string | null;
    isGeneratingImage: boolean;
}

interface StoryBoardStudioProps {
    onBack: () => void;
}

const StoryBoardStudio: React.FC<StoryBoardStudioProps> = ({ onBack }) => {
    const [viewMode, setViewMode] = useState<'local' | 'workspace'>('local');
    const [storyIdea, setStoryIdea] = useState('');
    const [characterDetails, setCharacterDetails] = useState('');
    const [characterImages, setCharacterImages] = useState<string[]>([]);
    const [sceneCount, setSceneCount] = useState(3);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const FLOW_PROJECT_URL = "https://labs.google/fx/tools/flow/project/96458230-a511-4edb-a339-7dbc79f4c2b9";

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = [...characterImages];
        // Fixed: Explicitly typed 'file' as 'File' to resolve 'unknown' type error in URL.createObjectURL
        Array.from(files).forEach((file: File) => {
            if (newImages.length < 2) {
                const url = URL.createObjectURL(file);
                newImages.push(url);
            }
        });
        setCharacterImages(newImages);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeCharacterImage = (index: number) => {
        const newImages = characterImages.filter((_, i) => i !== index);
        setCharacterImages(newImages);
    };

    const getBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
        });
    };

    const handleGenerateStoryboard = async () => {
        if (!storyIdea.trim()) return;

        setIsGenerating(true);
        setError(null);
        setScenes([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imageParts = await Promise.all(characterImages.map(async (url) => {
                const base64 = await getBase64(url);
                return { inlineData: { data: base64, mimeType: 'image/png' } };
            }));

            const textPart = { text: `Create a professional storyboard for a vertical 9:16 video. 
                STORY IDEA: ${storyIdea}
                CHARACTER DETAILS: ${characterDetails}
                SCENE COUNT: ${sceneCount}

                ${characterImages.length > 0 ? "Use the provided images to understand the character's appearance." : ""}

                Return exactly ${sceneCount} scenes in a valid JSON array format. 
                Each object must have: 
                "title": A short name for the scene.
                "description": A narrative visual description of what happens.
                "aiPrompt": A highly detailed AI image generation prompt (English) that incorporates the character details and visual features from the reference images to ensure consistency across scenes. Mention the vertical 9:16 aspect ratio requirement in the style.` };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [...imageParts, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                aiPrompt: { type: Type.STRING }
                            },
                            required: ["title", "description", "aiPrompt"]
                        }
                    }
                }
            });

            const data = JSON.parse(response.text || '[]');
            const parsedScenes = data.map((s: any, idx: number) => ({
                id: Math.random().toString(36).substr(2, 9),
                number: idx + 1,
                title: s.title,
                description: s.description,
                aiPrompt: s.aiPrompt,
                imageUrl: null,
                isGeneratingImage: false
            }));

            setScenes(parsedScenes);
        } catch (err: any) {
            setError(err.message || "Failed to generate storyboard.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSceneImage = async (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;

        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: true } : s));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const refImageParts = await Promise.all(characterImages.map(async (url) => {
                const base64 = await getBase64(url);
                return { inlineData: { data: base64, mimeType: 'image/png' } };
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        ...refImageParts,
                        { text: scene.aiPrompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "9:16"
                    }
                }
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const url = `data:image/png;base64,${part.inlineData.data}`;
                    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl: url, isGeneratingImage: false } : s));
                    break;
                }
            }
        } catch (err) {
            console.error(err);
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingImage: false } : s));
        }
    };

    const copyPrompt = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

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
                            <Wind className="w-4 h-4" /> STORY BOARD STUDIO
                        </h1>
                    </div>
                </div>

                {/* Workspace Switcher */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setViewMode('local')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'local' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Film className="w-3.5 h-3.5" /> STUDIO BUILDER
                    </button>
                    <button 
                        onClick={() => setViewMode('workspace')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'workspace' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout className="w-3.5 h-3.5" /> CLOUD FLOW
                    </button>
                </div>

                <a href={FLOW_PROJECT_URL} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors" title="Buka di tab baru">
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {/* Embedded Workspace Mode */}
                {viewMode === 'workspace' && (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col">
                        <div className="flex-1 relative bg-black">
                            <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-700 p-10 text-center">
                                <div className="max-w-md space-y-4">
                                    <AlertTriangle className="w-12 h-12 mx-auto opacity-20" />
                                    <p className="text-sm italic">Jika halaman Flow tidak muncul, silakan login ke Google di tab browser utama terlebih dahulu.</p>
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

                {/* Local Builder Mode */}
                {viewMode === 'local' && (
                    <div className="h-full flex flex-col lg:flex-row">
                        {/* Input Panel */}
                        <div className="w-full lg:w-[400px] bg-slate-900/50 border-r border-slate-800 p-6 overflow-y-auto shrink-0 scrollbar-thin">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Narrative Input
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Story Idea / Scenario</label>
                                    <textarea 
                                        value={storyIdea}
                                        onChange={(e) => setStoryIdea(e.target.value)}
                                        placeholder="E.g. A cyberpunk samurai searching for a lost digital soul in a neon rainy city..."
                                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none resize-none transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-cyan-500 flex items-center justify-between">
                                        Character References
                                        <span className="text-[8px] opacity-50 font-medium">Max 2 images</span>
                                    </label>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {characterImages.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-slate-950 rounded-xl border border-slate-800 relative group overflow-hidden">
                                                <img src={img} className="w-full h-full object-cover" alt="Ref" />
                                                <button 
                                                    onClick={() => removeCharacterImage(idx)}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {characterImages.length < 2 && (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                                            >
                                                <Upload className="w-4 h-4 text-slate-600 group-hover:text-cyan-500" />
                                                <span className="text-[8px] font-black uppercase text-slate-600 group-hover:text-cyan-500">Upload</span>
                                            </button>
                                        )}
                                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                                    </div>

                                    <textarea 
                                        value={characterDetails}
                                        onChange={(e) => setCharacterDetails(e.target.value)}
                                        placeholder="Additional character details (personality, specific clothes, etc.)..."
                                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none resize-none transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scene Count</label>
                                        <span className="text-cyan-500 font-mono text-xs">{sceneCount}</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="8" step="1"
                                        value={sceneCount}
                                        onChange={(e) => setSceneCount(Number(e.target.value))}
                                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-xs">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button 
                                    onClick={handleGenerateStoryboard}
                                    disabled={!storyIdea.trim() || isGenerating}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/10"
                                >
                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    GENERATE STORYBOARD
                                </button>
                            </div>
                        </div>

                        {/* Visual Board Panel */}
                        <div className="flex-1 bg-slate-950 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
                            {scenes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-800 border-2 border-dashed border-slate-900 rounded-3xl p-10 text-center">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                                    <h3 className="text-sm font-black uppercase tracking-widest opacity-20">Visual Board Waiting</h3>
                                    <p className="text-xs max-w-xs mt-2 opacity-10">Generate a storyboard on the left to see visual scene cards and prompts.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {scenes.map((scene) => (
                                        <div 
                                            key={scene.id}
                                            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all hover:border-cyan-500/30 group animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        >
                                            {/* Preview Image */}
                                            <div className="aspect-[9/16] bg-black relative group/img cursor-pointer" onClick={() => handleGenerateSceneImage(scene.id)}>
                                                {scene.imageUrl ? (
                                                    <img src={scene.imageUrl} className="w-full h-full object-cover" alt={scene.title} />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                        {scene.isGeneratingImage ? (
                                                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="w-10 h-10 text-slate-800 group-hover/img:text-cyan-500 transition-colors" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 group-hover/img:text-cyan-500">Render Frame</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/10 z-10">
                                                    SCENE {scene.number}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-1">{scene.title}</h4>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-3">"{scene.description}"</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">AI Generation Prompt</label>
                                                        <button 
                                                            onClick={() => copyPrompt(scene.id, scene.aiPrompt)}
                                                            className="text-slate-500 hover:text-white transition-colors"
                                                            title="Copy Prompt"
                                                        >
                                                            {copiedId === scene.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[9px] text-slate-500 max-h-24 overflow-y-auto scrollbar-thin">
                                                        {scene.aiPrompt}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleGenerateSceneImage(scene.id)}
                                                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Re-Render
                                                    </button>
                                                    {scene.imageUrl && (
                                                        <a 
                                                            href={scene.imageUrl} 
                                                            download={`scene-${scene.number}.png`}
                                                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryBoardStudio;