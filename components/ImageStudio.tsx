
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Type, ImageIcon, Download, Loader2, Sparkles, Trash2, Smartphone, Maximize, Palette, Move, RefreshCw, Layers, Plus, FileSpreadsheet, List, CheckCircle, Type as FontIcon, MinusCircle, PlusCircle, MoveHorizontal, MoveVertical, ZoomIn, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ImageItem } from '../types';
import * as XLSX from 'xlsx';

interface ImageStudioProps {
    onBack: () => void;
}

const FONTS = [
    { name: 'Inter', family: '"Inter", sans-serif' },
    { name: 'Oswald', family: '"Oswald", sans-serif' },
    { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif' },
    { name: 'Montserrat', family: '"Montserrat", sans-serif' }
];

const DEFAULT_ITEM: Omit<ImageItem, 'id'> = {
    baseImage: null,
    headline: 'JUDUL BERITA ANDA',
    subheadline: 'Tambahkan deskripsi singkat berita di sini agar penonton tertarik melihat konten Anda.',
    headlineSize: 80,
    subheadlineSize: 36,
    yPosition: 80,
    fontFamily: '"Bebas Neue", sans-serif',
    textColor: '#ffffff',
    textBgColor: 'rgba(0,0,0,0.85)',
    useBgBox: true,
    status: 'idle',
    imageZoom: 1,
    imageX: 0,
    imageY: 0
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

const ImageStudio: React.FC<ImageStudioProps> = ({ onBack }) => {
    const [items, setItems] = useState<ImageItem[]>([
        { ...DEFAULT_ITEM, id: Math.random().toString(36).substr(2, 9) }
    ]);
    const [activeId, setActiveId] = useState<string>(items[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('9:16');
    const [prompt, setPrompt] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const activeItem = items.find(i => i.id === activeId) || items[0];

    const updateActiveItem = (updates: Partial<ImageItem>) => {
        setItems(prev => prev.map(item => item.id === activeId ? { ...item, ...updates } : item));
    };

    const adjustValue = (key: keyof ImageItem, delta: number, min: number, max: number) => {
        const currentValue = activeItem[key] as number;
        const newValue = Math.min(max, Math.max(min, currentValue + delta));
        updateActiveItem({ [key]: newValue });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateActiveItem({ baseImage: url });
        }
        e.target.value = '';
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            
            const newItems: ImageItem[] = [];
            jsonData.forEach((row, idx) => {
                if (idx === 0 && (!row[0] || String(row[0]).toLowerCase() === 'headline')) return; 
                const h = String(row[0] || '').trim();
                const s = String(row[1] || '').trim();
                const img = String(row[2] || '').trim();
                
                if (h || s || img) {
                    newItems.push({
                        ...DEFAULT_ITEM,
                        id: Math.random().toString(36).substr(2, 9),
                        headline: h || DEFAULT_ITEM.headline,
                        subheadline: s || '',
                        baseImage: img && (img.startsWith('http') || img.startsWith('data:')) ? img : null
                    });
                }
            });

            if (newItems.length > 0) {
                setItems(prev => [...prev, ...newItems]);
                setActiveId(newItems[newItems.length - 1].id);
            }
        } catch (err) {
            alert("Gagal membaca file Excel.");
        }
        e.target.value = '';
    };

    const generateAIImage = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let contents: any;
            if (activeItem.baseImage) {
                const response = await fetch(activeItem.baseImage);
                const blob = await response.blob();
                const base64 = await new Promise<string>((r) => {
                    const reader = new FileReader();
                    reader.onloadend = () => r((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                });
                contents = { parts: [{ inlineData: { data: base64, mimeType: blob.type } }, { text: prompt }] };
            } else {
                contents = { parts: [{ text: prompt }] };
            }

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents,
                config: { imageConfig: { aspectRatio } }
            });

            for (const part of result.candidates[0].content.parts) {
                if (part.inlineData) {
                    updateActiveItem({ baseImage: `data:image/png;base64,${part.inlineData.data}` });
                    break;
                }
            }
        } catch (error) {
            alert("Gagal menghasilkan gambar AI.");
        } finally {
            setIsGenerating(false);
        }
    };

    const drawToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, item: ImageItem) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const render = async () => {
            if (item.baseImage) {
                try {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = item.baseImage;
                    await new Promise((r) => img.onload = r);
                    
                    const iRatio = img.width / img.height;
                    const cRatio = width / height;
                    let dw, dh, dx, dy;

                    // Calculate initial "Cover" dimensions
                    if (iRatio > cRatio) {
                        dh = height;
                        dw = dh * iRatio;
                    } else {
                        dw = width;
                        dh = dw / iRatio;
                    }

                    // Apply Zoom
                    dw *= item.imageZoom;
                    dh *= item.imageZoom;

                    // Centering + User Offset
                    dx = (width - dw) / 2 + (width * item.imageX) / 100;
                    dy = (height - dh) / 2 + (height * item.imageY) / 100;

                    ctx.drawImage(img, dx, dy, dw, dh);
                } catch (e) { console.warn("Image load failed"); }
            }

            const centerX = width / 2;
            const maxWidth = width * 0.9;
            let currentY = (height * item.yPosition) / 100;

            // Auto-fitting Logic: Calculate total expected height
            let hSize = item.headlineSize;
            let sSize = item.subheadlineSize;
            
            ctx.font = `900 ${hSize}px ${item.fontFamily}`;
            let hLines = wrapText(ctx, item.headline.toUpperCase(), maxWidth);
            
            ctx.font = `600 ${sSize}px ${item.fontFamily}`;
            let sLines = wrapText(ctx, item.subheadline, maxWidth);

            const totalHeight = (hLines.length * hSize * 1.1) + (sLines.length * sSize * 1.3) + 40;
            const availableHeight = height - currentY - 40;

            // Shrink fonts if they don't fit
            if (totalHeight > availableHeight && availableHeight > 100) {
                const ratio = availableHeight / totalHeight;
                hSize = Math.max(20, Math.floor(hSize * ratio));
                sSize = Math.max(12, Math.floor(sSize * ratio));
                
                // Recalculate wrapping with new sizes
                ctx.font = `900 ${hSize}px ${item.fontFamily}`;
                hLines = wrapText(ctx, item.headline.toUpperCase(), maxWidth);
                ctx.font = `600 ${sSize}px ${item.fontFamily}`;
                sLines = wrapText(ctx, item.subheadline, maxWidth);
            }

            // Draw Headline
            if (item.headline) {
                ctx.font = `900 ${hSize}px ${item.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const lineHeight = hSize * 1.1;
                const padding = hSize * 0.3;

                hLines.forEach((line, i) => {
                    const lineY = currentY + i * lineHeight;
                    const lWidth = ctx.measureText(line).width;

                    if (item.useBgBox) {
                        ctx.fillStyle = item.textBgColor;
                        ctx.fillRect(centerX - lWidth / 2 - padding, lineY - hSize/2 - padding/4, lWidth + padding * 2, hSize + padding/2);
                    }

                    ctx.fillStyle = item.textColor;
                    ctx.fillText(line, centerX, lineY);
                });

                currentY += (hLines.length * lineHeight) + (hSize * 0.3);
            }

            // Draw Subheadline
            if (item.subheadline) {
                ctx.font = `600 ${sSize}px ${item.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const lineHeight = sSize * 1.3;
                const padding = sSize * 0.4;

                sLines.forEach((line, i) => {
                    const lineY = currentY + i * lineHeight;
                    const lWidth = ctx.measureText(line).width;

                    if (item.useBgBox) {
                        ctx.fillStyle = item.textBgColor;
                        ctx.fillRect(centerX - lWidth / 2 - padding, lineY - sSize/2 - padding/4, lWidth + padding * 2, sSize + padding/2);
                    }

                    ctx.fillStyle = item.textColor;
                    ctx.fillText(line, centerX, lineY);
                });
            }
        };
        render();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (aspectRatio === '9:16') { canvas.width = 1080; canvas.height = 1920; }
        else if (aspectRatio === '16:9') { canvas.width = 1920; canvas.height = 1080; }
        else { canvas.width = 1080; canvas.height = 1080; }

        drawToCanvas(ctx, canvas.width, canvas.height, activeItem);
    }, [items, activeId, aspectRatio]);

    const downloadAll = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (aspectRatio === '9:16') { canvas.width = 1080; canvas.height = 1920; }
        else if (aspectRatio === '16:9') { canvas.width = 1920; canvas.height = 1080; }
        else { canvas.width = 1080; canvas.height = 1080; }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await new Promise((r) => {
                drawToCanvas(ctx, canvas.width, canvas.height, item);
                setTimeout(r, 400); // Wait for background and fonts
            });
            const link = document.createElement('a');
            
            // Generate sanitized filename directly from the headline as requested
            const safeHeadline = (item.headline || 'graphic').replace(/[/\\?%*:|"<>]/g, '-').trim();
            link.download = `${safeHeadline}.png`;
            
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            await new Promise(r => setTimeout(r, 1200)); 
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full lg:overflow-hidden overflow-x-hidden bg-slate-950 text-white font-inter">
            {/* Sidebar Toggle (Mobile) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 p-4 rounded-full shadow-2xl text-white active:scale-90 transition-transform"
            >
                {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
            </button>

            {/* Sidebar */}
            <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shadow-2xl overflow-hidden ${isSidebarOpen ? 'h-[70vh] lg:h-full' : 'h-0 lg:h-full'}`}>
                <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">Graphic Studio</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8 scrollbar-thin">
                    {/* Storyboard / Queue */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <List className="w-3 h-3" /> Storyboard ({items.length})
                            </label>
                            <div className="flex gap-2">
                                <input type="file" accept=".xlsx, .xls" ref={excelInputRef} className="hidden" onChange={handleExcelImport} />
                                <button onClick={() => excelInputRef.current?.click()} className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                                    <FileSpreadsheet className="w-3 h-3" /> Excel
                                </button>
                                <button onClick={() => {
                                    const newItem = { ...DEFAULT_ITEM, id: Math.random().toString(36).substr(2, 9) };
                                    setItems(p => [...p, newItem]);
                                    setActiveId(newItem.id);
                                }} className="text-[10px] text-indigo-500 hover:text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {items.map((item, idx) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setActiveId(item.id)}
                                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${activeId === item.id ? 'border-indigo-500 shadow-lg' : 'border-slate-800 grayscale hover:grayscale-0'}`}
                                >
                                    {item.baseImage ? <img src={item.baseImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600">#{idx+1}</div>}
                                    {items.length > 1 && (
                                        <button onClick={(e) => { e.stopPropagation(); setItems(p => p.filter(i => i.id !== item.id)); if(activeId === item.id) setActiveId(items[0].id); }} className="absolute top-0 right-0 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-bl-lg">
                                            <Trash2 className="w-2 h-2" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> AI Image Magic
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Prompt for background generation..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none h-16 resize-none"
                        />
                        <div className="grid grid-cols-3 gap-1">
                            {['1:1', '9:16', '16:9'].map(ratio => (
                                <button 
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio as any)}
                                    className={`py-1 text-[9px] font-bold rounded border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={generateAIImage}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 text-xs"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Process AI
                        </button>
                    </div>

                    {/* Media Transform Controls */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Media Transform
                            </label>
                            <button 
                                onClick={() => updateActiveItem({ imageZoom: 1, imageX: 0, imageY: 0 })}
                                className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider hover:text-indigo-300 transition-colors"
                            >
                                <RefreshCw className="inline w-3 h-3 mr-1" /> Reset
                            </button>
                        </div>

                        <div className="space-y-4 px-1">
                            <div>
                                <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold mb-1">
                                    <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                                    <span className="text-indigo-400">{Math.round(activeItem.imageZoom * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="4" step="0.01"
                                    value={activeItem.imageZoom}
                                    onChange={(e) => updateActiveItem({ imageZoom: Number(e.target.value) })}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold mb-1">
                                        <span className="flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> X Offset</span>
                                        <span className="text-indigo-400">{activeItem.imageX}%</span>
                                    </div>
                                    <input 
                                        type="range" min="-100" max="100" step="1"
                                        value={activeItem.imageX}
                                        onChange={(e) => updateActiveItem({ imageX: Number(e.target.value) })}
                                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold mb-1">
                                        <span className="flex items-center gap-1"><MoveVertical className="w-3 h-3" /> Y Offset</span>
                                        <span className="text-indigo-400">{activeItem.imageY}%</span>
                                    </div>
                                    <input 
                                        type="range" min="-100" max="100" step="1"
                                        value={activeItem.imageY}
                                        onChange={(e) => updateActiveItem({ imageY: Number(e.target.value) })}
                                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 transition-all flex items-center justify-center gap-2 text-xs">
                                <Upload className="w-4 h-4" /> Upload Base Image
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Type className="w-3 h-3" /> Graphic Content
                        </label>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Headline</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => adjustValue('headlineSize', -5, 20, 400)} className="text-slate-500 hover:text-white transition-colors"><MinusCircle className="w-4 h-4" /></button>
                                        <button onClick={() => adjustValue('headlineSize', 5, 20, 400)} className="text-slate-500 hover:text-white transition-colors"><PlusCircle className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <input value={activeItem.headline} onChange={(e) => updateActiveItem({ headline: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500" placeholder="HEADLINE" />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Subheadline</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => adjustValue('subheadlineSize', -2, 10, 200)} className="text-slate-500 hover:text-white transition-colors"><MinusCircle className="w-4 h-4" /></button>
                                        <button onClick={() => adjustValue('subheadlineSize', 2, 10, 200)} className="text-slate-500 hover:text-white transition-colors"><PlusCircle className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <textarea value={activeItem.subheadline} onChange={(e) => updateActiveItem({ subheadline: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none" placeholder="Description content..." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2"><FontIcon className="inline w-3 h-3 mr-1" /> Typography</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FONTS.map(font => (
                                        <button 
                                            key={font.name}
                                            onClick={() => updateActiveItem({ fontFamily: font.family })}
                                            className={`py-1.5 text-[9px] rounded border transition-all ${activeItem.fontFamily === font.family ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                            style={{ fontFamily: font.family }}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                                    <span className="flex items-center gap-1">Position Y</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => adjustValue('yPosition', -1, 0, 100)} className="text-slate-500 hover:text-white transition-colors"><MinusCircle className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => adjustValue('yPosition', 1, 0, 100)} className="text-slate-500 hover:text-white transition-colors"><PlusCircle className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <input type="range" min="5" max="95" value={activeItem.yPosition} onChange={(e) => updateActiveItem({ yPosition: Number(e.target.value) })} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <button 
                        onClick={downloadAll}
                        disabled={items.some(i => !i.baseImage)}
                        className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 text-xs"
                    >
                        <Download className="w-4 h-4" /> Download All ({items.length})
                    </button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden min-h-[500px] lg:min-h-0">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4 lg:gap-6 w-full">
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                        <Smartphone className="w-3 h-3" /> {aspectRatio} Preview Slot #{items.indexOf(activeItem) + 1}
                    </div>

                    <div 
                        className={`relative bg-slate-900 rounded-[30px] overflow-hidden shadow-2xl border-4 lg:border-8 border-slate-800 ring-1 ring-slate-700 transition-all duration-500 w-full max-w-[280px] lg:max-w-[400px] aspect-[${aspectRatio.split(':').join('/')}]`}
                        style={{ 
                            aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '16:9' ? '16/9' : '1/1'
                        }}
                    >
                        <canvas ref={canvasRef} className="w-full h-full object-contain" />
                        
                        {!activeItem.baseImage && !isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-600 bg-slate-900/50">
                                <Maximize className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Awaiting Media Asset</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Processing Graphics...</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setItems([ { ...DEFAULT_ITEM, id: Math.random().toString(36).substr(2, 9) } ])} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                            <Trash2 className="w-3 h-3" /> Reset
                        </button>
                        <button onClick={() => {
                             const canvas = canvasRef.current;
                             if (!canvas) return;
                             const ctx = canvas.getContext('2d');
                             if (ctx) drawToCanvas(ctx, canvas.width, canvas.height, activeItem);
                        }} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-400 transition-all border border-slate-700">
                            <RefreshCw className="w-3 h-3" /> Redraw
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
