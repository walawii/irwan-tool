
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Type, ImageIcon, Download, Loader2, Sparkles, Trash2, Smartphone, Maximize, Palette, Move, RefreshCw, Layers } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ImageStudioProps {
    onBack: () => void;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ onBack }) => {
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [headline, setHeadline] = useState('DESIGN TITLE');
    const [subheadline, setSubheadline] = useState('Subtitle or description goes here');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('9:16');
    
    // Design config
    const [config, setConfig] = useState({
        headlineSize: 60,
        subheadlineSize: 32,
        yPosition: 80, // Percent from top
        textColor: '#ffffff',
        textBgColor: 'rgba(0,0,0,0.6)',
        useBgBox: true
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBaseImage(url);
        }
    };

    const generateAIImage = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let contents: any;
            if (baseImage) {
                // Image-to-image/Edit
                const response = await fetch(baseImage);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                });

                contents = {
                    parts: [
                        { inlineData: { data: base64, mimeType: blob.type } },
                        { text: prompt }
                    ]
                };
            } else {
                // Text-to-image
                contents = { parts: [{ text: prompt }] };
            }

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents,
                config: {
                    imageConfig: { aspectRatio }
                }
            });

            for (const part of result.candidates[0].content.parts) {
                if (part.inlineData) {
                    setBaseImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Gagal menghasilkan gambar. Silakan cek prompt atau koneksi.");
        } finally {
            setIsGenerating(false);
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Determine canvas size based on aspect ratio
        if (aspectRatio === '9:16') { canvas.width = 720; canvas.height = 1280; }
        else if (aspectRatio === '16:9') { canvas.width = 1280; canvas.height = 720; }
        else { canvas.width = 1000; canvas.height = 1000; }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContent = async () => {
            if (baseImage) {
                const img = new Image();
                img.src = baseImage;
                await new Promise((r) => img.onload = r);
                
                const iRatio = img.width / img.height;
                const cRatio = canvas.width / canvas.height;
                let dw, dh, dx, dy;

                if (iRatio > cRatio) {
                    dh = canvas.height; dw = dh * iRatio; dx = (canvas.width - dw) / 2; dy = 0;
                } else {
                    dw = canvas.width; dh = dw / iRatio; dx = 0; dy = (canvas.height - dh) / 2;
                }
                ctx.drawImage(img, dx, dy, dw, dh);
            }

            // Draw Text Overlays
            const centerX = canvas.width / 2;
            const targetY = (canvas.height * config.yPosition) / 100;

            if (headline) {
                ctx.font = `900 ${config.headlineSize}px "Inter", sans-serif`;
                const hWidth = ctx.measureText(headline.toUpperCase()).width;
                const padding = 20;

                if (config.useBgBox) {
                    ctx.fillStyle = config.textBgColor;
                    ctx.fillRect(centerX - hWidth / 2 - padding, targetY - config.headlineSize, hWidth + padding * 2, config.headlineSize + padding);
                }

                ctx.fillStyle = config.textColor;
                ctx.textAlign = 'center';
                ctx.fillText(headline.toUpperCase(), centerX, targetY);
            }

            if (subheadline) {
                ctx.font = `600 ${config.subheadlineSize}px "Inter", sans-serif`;
                const sY = targetY + config.headlineSize * 0.8;
                const sWidth = ctx.measureText(subheadline).width;
                const padding = 15;

                if (config.useBgBox) {
                    ctx.fillStyle = config.textBgColor;
                    ctx.fillRect(centerX - sWidth / 2 - padding, sY - config.subheadlineSize * 0.8, sWidth + padding * 2, config.subheadlineSize * 1.4);
                }

                ctx.fillStyle = config.textColor;
                ctx.textAlign = 'center';
                ctx.fillText(subheadline, centerX, sY + config.subheadlineSize / 2);
            }
        };

        renderContent();
    };

    useEffect(() => {
        drawCanvas();
    }, [baseImage, headline, subheadline, config, aspectRatio]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `irwan-studio-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar */}
            <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">Graphic Studio</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> AI Image Generator
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe what you want to create or edit..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            {['1:1', '9:16', '16:9'].map(ratio => (
                                <button 
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio as any)}
                                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={generateAIImage}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {baseImage ? 'Refine with AI' : 'Generate with AI'}
                        </button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-3 h-3" /> Manual Input
                        </label>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 transition-all flex items-center justify-center gap-2 text-sm">
                            <Upload className="w-4 h-4" /> {baseImage ? 'Change Image' : 'Upload Base Image'}
                        </button>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Type className="w-3 h-3" /> Text Overlays
                        </label>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Headline</span>
                                <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" placeholder="HEADLINE" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Subheadline</span>
                                <input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Subheadline" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                                    <span>Vertical Position</span>
                                    <span className="text-indigo-400">{config.yPosition}%</span>
                                </div>
                                <input type="range" min="5" max="95" value={config.yPosition} onChange={(e) => setConfig(prev => ({ ...prev, yPosition: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                                    <span>Font Size</span>
                                    <span className="text-indigo-400">{config.headlineSize}px</span>
                                </div>
                                <input type="range" min="20" max="150" value={config.headlineSize} onChange={(e) => setConfig(prev => ({ ...prev, headlineSize: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Text Color</label>
                                <div className="flex gap-2">
                                    {['#ffffff', '#facc15', '#ef4444', '#4ade80'].map(color => (
                                        <button key={color} onClick={() => setConfig(prev => ({ ...prev, textColor: color }))} className={`w-6 h-6 rounded-full border ${config.textColor === color ? 'border-white ring-2 ring-indigo-500' : 'border-slate-700'}`} style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Styles</label>
                                <button onClick={() => setConfig(prev => ({ ...prev, useBgBox: !prev.useBgBox }))} className={`w-full py-1 text-[9px] font-black rounded border ${config.useBgBox ? 'bg-slate-700 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                    BACKGROUND BOX
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <button 
                        onClick={handleDownload}
                        disabled={!baseImage}
                        className="w-full py-4 bg-white text-slate-950 hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Download Image
                    </button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                        <Smartphone className="w-3 h-3" /> Canvas Preview ({aspectRatio})
                    </div>

                    <div 
                        className={`relative bg-slate-900 rounded-[30px] overflow-hidden shadow-2xl border-8 border-slate-800 ring-1 ring-slate-700 transition-all duration-500`}
                        style={{ 
                            width: aspectRatio === '16:9' ? '560px' : aspectRatio === '9:16' ? '300px' : '400px',
                            height: aspectRatio === '16:9' ? '315px' : aspectRatio === '9:16' ? '533px' : '400px'
                        }}
                    >
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />
                        
                        {!baseImage && !isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-600 bg-slate-900/50">
                                <ImageIcon className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest">Start generating or upload base image</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Dreaming up your image...</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => { setBaseImage(null); setHeadline(''); setSubheadline(''); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                            <Trash2 className="w-3 h-3" /> Clear Canvas
                        </button>
                        <button onClick={drawCanvas} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-400 transition-all border border-slate-700">
                            <RefreshCw className="w-3 h-3" /> Refresh Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
