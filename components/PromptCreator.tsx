
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, Loader2, Copy, Video, CheckCircle, AlertTriangle, FileJson, Image as ImageIcon, Download } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface PromptCreatorProps {
    onBack: () => void;
}

const PromptCreator: React.FC<PromptCreatorProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultJson, setResultJson] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [productName, setProductName] = useState('');

    // Image Mixer State
    const [productImage, setProductImage] = useState<string | null>(null);
    const [mixerPrompt, setMixerPrompt] = useState('');
    const [isMixing, setIsMixing] = useState(false);
    const [mixedImage, setMixedImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const productImageRef = useRef<HTMLInputElement>(null);

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

    const MASTER_PROMPT_FLOW = "Selalu gunakan Bahasa Indonesia yang persuasif, natural, dan profesional dalam setiap narasi video. Pastikan intonasi dan pilihan kata sesuai dengan target audiens Indonesia, menggunakan hook yang kuat dan Call to Action yang jelas.";

    const generatePrompt = async () => {
        if (!videoFile) return;

        setIsProcessing(true);
        setError(null);
        setResultJson(null);

        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API Key tidak ditemukan. Silakan periksa pengaturan API Key di menu Settings.");
            }
            const ai = new GoogleGenAI({ apiKey });
            const base64Data = await fileToBase64(videoFile);

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: videoFile.type } },
                        { text: `Analisis konten visual video ini secara mendalam. Saya ingin membuat ulang video serupa menggunakan AI seperti Google Veo atau Flow.
                        ${productName ? `Produk yang ada dalam video ini adalah: "${productName}". Pastikan nama produk ini disertakan atau menjadi referensi utama dalam prompt dan narasi.` : ''}
                        
                        Hasilkan DUA (2) prompt video terpisah (ADEGAN 1 dan ADEGAN 2), masing-masing untuk durasi 8 DETIK.
                        Seluruh output, termasuk PROMPT VISUAL dan NARASI, harus dalam BAHASA INDONESIA agar hasil videonya memiliki konteks dan teks Indonesia yang kuat.
                        
                        Gunakan panduan Master Prompt berikut untuk narasi: "${MASTER_PROMPT_FLOW}"
                        
                        Tambahkan juga:
                        1. AUTO CAPTION: Caption media sosial yang menarik (copywriting) dalam Bahasa Indonesia.
                        2. 5 HASHTAGS: 5 tagar yang sedang tren dan sangat relevan dengan isi video.
                        
                        Ekstrak elemen kunci:
                        1. Subjek utama dan aksinya.
                        2. Gerakan kamera (pan, tilt, zoom, static, handheld, cinematic, dll).
                        3. Pencahayaan (natural, studio, cinematic, moody, dll).
                        4. Lingkungan/latar belakang.
                        5. Kualitas teknis (4k, photorealistic, dll).
                        
                        Kembalikan dalam format JSON sesuai skema yang ditentukan.` }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            master_prompt_flow: { type: Type.STRING, description: "Master prompt untuk alat Flow" },
                            auto_caption: { type: Type.STRING, description: "Caption media sosial dalam Bahasa Indonesia" },
                            hashtags: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                description: "5 tagar yang tren dan relevan"
                            },
                            adegan_1: {
                                type: Type.OBJECT,
                                description: "Detail untuk Adegan 1 (8 Detik)",
                                properties: {
                                    visual_prompt: { type: Type.STRING, description: "Prompt visual lengkap dalam Bahasa Indonesia untuk AI video generation" },
                                    narasi_indonesia: { type: Type.STRING, description: "Skrip narasi dalam Bahasa Indonesia" }
                                },
                                required: ["visual_prompt", "narasi_indonesia"]
                            },
                            adegan_2: {
                                type: Type.OBJECT,
                                description: "Detail untuk Adegan 2 (8 Detik)",
                                properties: {
                                    visual_prompt: { type: Type.STRING, description: "Prompt visual lengkap dalam Bahasa Indonesia untuk AI video generation" },
                                    narasi_indonesia: { type: Type.STRING, description: "Skrip narasi dalam Bahasa Indonesia" }
                                },
                                required: ["visual_prompt", "narasi_indonesia"]
                            },
                            negative_prompt: { type: Type.STRING, description: "Hal yang harus dihindari dalam video" }
                        },
                        required: ["adegan_1", "adegan_2", "master_prompt_flow", "auto_caption", "hashtags"]
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
                const textToCopy = `ADEGAN 1:\n${parsed.adegan_1.visual_prompt}\n\nADEGAN 2:\n${parsed.adegan_2.visual_prompt}`;
                navigator.clipboard.writeText(textToCopy);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                copyToClipboard();
            }
        }
    };

    const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProductImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const generateMixedImage = async () => {
        if (!productImage || !mixerPrompt) return;
        setIsMixing(true);
        setError(null);
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            const ai = new GoogleGenAI({ apiKey: apiKey! });
            
            const base64Data = productImage.split(',')[1];
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
                        { text: `Buatlah foto produk yang sangat realistis dan profesional. Gabungkan produk dalam gambar ini dengan seorang model manusia (pria/wanita sesuai konteks produk). 
                        
                        Instruksi tambahan: ${mixerPrompt}
                        
                        Pastikan pencahayaan, bayangan, dan integrasi produk dengan model terlihat sangat nyata (photorealistic). Model harus terlihat sedang berinteraksi secara natural dengan produk tersebut.` }
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
                    setMixedImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        } catch (err: any) {
            console.error(err);
            setError("Gagal menggabungkan foto. Pastikan deskripsi dan gambar produk sudah sesuai.");
        } finally {
            setIsMixing(false);
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

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => setActiveTab('video')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                        Video Analyzer
                    </button>
                    <button 
                        onClick={() => setActiveTab('image')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'image' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                        Model & Product Mixer
                    </button>
                </div>
            </div>

            {activeTab === 'video' ? (
                <div className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
                    {/* ... existing video content ... */}
                
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

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">2. Nama Produk (Opsional)</label>
                            <input 
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Masukkan nama produk Anda..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                            />
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

                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Master Prompt for Flow
                            </h3>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(MASTER_PROMPT_FLOW);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-2 py-1 rounded transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy Master'}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            "{MASTER_PROMPT_FLOW}"
                        </p>
                        <p className="text-[9px] text-slate-500">
                            *Gunakan ini sebagai System Prompt di Flow untuk hasil narasi Indonesia yang konsisten.
                        </p>
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
                                <div className="space-y-6">
                                    <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                                        {resultJson}
                                    </pre>
                                    
                                    {/* Visual Display of Caption & Hashtags */}
                                    <div className="border-t border-slate-800 pt-6 space-y-4 font-sans">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">Auto Caption</h4>
                                                <button 
                                                    onClick={() => {
                                                        const caption = JSON.parse(resultJson).auto_caption;
                                                        const tags = JSON.parse(resultJson).hashtags.map((t: string) => t.startsWith('#') ? t : `#${t}`).join(' ');
                                                        navigator.clipboard.writeText(`${caption}\n\n${tags}`);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className="text-[9px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-400 hover:text-white transition-colors"
                                                >
                                                    Copy Caption & Tags
                                                </button>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                {JSON.parse(resultJson).auto_caption}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                            <h4 className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2">Trending Hashtags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {JSON.parse(resultJson).hashtags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-blue-400 text-sm font-medium">
                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
            ) : (
                <div className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
                    {/* Left: Mixer Input */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">1. Upload Product Image</label>
                                <div 
                                    onClick={() => productImageRef.current?.click()}
                                    className={`aspect-square w-full bg-slate-950 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${productImage ? 'border-amber-500/50' : 'border-slate-700 hover:border-amber-500/50'}`}
                                >
                                    <input type="file" accept="image/*" ref={productImageRef} className="hidden" onChange={handleProductUpload} />
                                    {productImage ? (
                                        <img src={productImage} className="w-full h-full object-contain p-4" />
                                    ) : (
                                        <div className="text-center p-6 text-slate-500 group-hover:text-amber-400 transition-colors">
                                            <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm font-medium">Click to upload product photo</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">2. Describe Scene & Model</label>
                                <textarea 
                                    value={mixerPrompt}
                                    onChange={(e) => setMixerPrompt(e.target.value)}
                                    placeholder="Contoh: Seorang wanita muda cantik sedang memegang produk ini di sebuah kafe modern dengan pencahayaan hangat..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none h-32 resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button 
                                onClick={generateMixedImage}
                                disabled={!productImage || !mixerPrompt || isMixing}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isMixing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isMixing ? 'Mixing Photos...' : 'Generate Realistic Photo'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Mixer Output */}
                    <div className="w-full lg:w-1/2 flex flex-col h-full min-h-[500px]">
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Result Preview
                                </label>
                                {mixedImage && (
                                    <a 
                                        href={mixedImage} 
                                        download="mixed-product-photo.png"
                                        className="text-[10px] font-bold bg-amber-500 text-slate-950 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                                    >
                                        <Download className="w-3 h-3" /> Download Result
                                    </a>
                                )}
                            </div>

                            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden relative flex items-center justify-center">
                                {mixedImage ? (
                                    <img src={mixedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-600 text-center p-8">
                                        {isMixing ? (
                                            <>
                                                <Loader2 className="w-12 h-12 animate-spin mb-4 text-amber-500/50" />
                                                <p className="text-sm font-medium">Gemini sedang menggabungkan foto...</p>
                                                <p className="text-xs opacity-50 mt-2">Ini mungkin memakan waktu beberapa detik</p>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                                                <p className="text-sm font-medium">Hasil foto akan muncul di sini</p>
                                                <p className="text-xs opacity-50 mt-2">Upload foto produk dan berikan deskripsi untuk memulai</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptCreator;