
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Smartphone, RefreshCw, Sparkles, User, UserCheck, ImageIcon, Loader2, Play, Video, Terminal, AlertTriangle, Zap, Crown, Type as FontIcon, Newspaper, Globe, MonitorPlay, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface NewsStudioProps {
  onBack: () => void;
}

type AIModel = 'flash' | 'pro';
type VideoModel = 'veo-fast' | 'veo-pro';

const NewsStudio: React.FC<NewsStudioProps> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // News Content
  const [headline, setHeadline] = useState('BERITA TERKINI');
  const [subheadline, setSubheadline] = useState('AI Technology terbaru memungkinkan pembuatan konten instan berkualitas tinggi');
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aiEngine, setAiEngine] = useState<AIModel>('flash');
  const [videoEngine, setVideoEngine] = useState<VideoModel>('veo-fast');
  const [suggestedJson, setSuggestedJson] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      setGeneratedImages([]);
      setVideoUrl(null);
      setSuggestedJson(null);
    }
  };

  const fileToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const generateVariation = async (ai: any, base64Data: string, scene: string) => {
    const model = aiEngine === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/png' } },
          { text: `Create a professional 9:16 vertical news background frame. 
          MANDATORY RULE: The main subject/object from the provided image must remain 100% IDENTICAL in terms of shape, colors, and textures. Do not distort it.
          CONTEXT: Place this subject in a ${scene}.
          ACTORS: Add a professional news anchor/model (male or female) who looks high-end and official.
          ENVIRONMENT: A state-of-the-art news studio with multi-layered digital displays, creative lighting, and cinematic depth of field.
          QUALITY: Photorealistic, 8k resolution, extreme detail in facial expressions and clothing textures.` },
        ],
      },
      config: { 
        imageConfig: { 
          aspectRatio: '9:16',
          ...(aiEngine === 'pro' ? { imageSize: '1K' } : {})
        } 
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  };

  const handleGenerateImages = async (customScene?: string) => {
    if (!sourceImage) return alert("Silakan unggah foto subjek referensi terlebih dahulu!");
    
    if (aiEngine === 'pro' && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setIsAiLoading(true);
    setVideoUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await fileToBase64(sourceImage);
      
      const scenes = customScene ? [customScene, `${customScene} angle variation`, `cinematic version of ${customScene}`] : 
                    ["Premium global news studio with a professional female anchor", "Cybernetic future news set with a professional male anchor", "Modern financial report studio with trading charts and a professional host"];

      const results = await Promise.all(scenes.map(s => generateVariation(ai, base64Data, s)));
      const validResults = results.filter((r): r is string => r !== null);
      setGeneratedImages(validResults);
      setSelectedIndex(0);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("404")) {
        alert("Model Pro memerlukan API Key berbayar. Silakan pilih project dengan billing aktif.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    const currentImg = generatedImages[selectedIndex];
    if (!currentImg) return;

    if (!(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setIsVideoLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImg.split(',')[1];

      // Analysis for Broadcast Video Movement
      const analysis = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Analyze this cinematic news frame and provide a professional video movement prompt in JSON. It should mimic a high-end live TV broadcast camera (orbital, pan, or subtle zoom).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cameraStyle: { type: Type.STRING },
              backgroundDynamics: { type: Type.STRING },
              aiPrompt: { type: Type.STRING }
            },
            required: ["cameraStyle", "backgroundDynamics", "aiPrompt"]
          }
        }
      });
      const jsonContent = JSON.parse(analysis.text || '{}');
      setSuggestedJson(jsonContent);

      const model = videoEngine === 'veo-pro' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
      let operation = await ai.models.generateVideos({
        model,
        prompt: jsonContent.aiPrompt || "Cinematic news broadcast camera movement, high quality textures, professional studio lighting",
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: videoEngine === 'veo-pro' ? '1080p' : '720p', aspectRatio: '9:16' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const resp = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await resp.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        alert("Video generation (Veo) memerlukan API Key dari project Google Cloud berbayar.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas || videoUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;
    ctx.clearRect(0, 0, 1080, 1920);

    const imgSource = generatedImages[selectedIndex] || sourceImage;
    if (imgSource) {
      const img = new Image();
      img.src = imgSource;
      await new Promise(r => img.onload = r);
      const ratio = img.width / img.height;
      const targetRatio = 1080/1920;
      let dw, dh, dx, dy;
      if (ratio > targetRatio) { dh = 1920; dw = dh * ratio; dx = (1080 - dw)/2; dy = 0; }
      else { dw = 1080; dh = dw/ratio; dx = 0; dy = (1920 - dh)/2; }
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0,0,1080,1920);
      ctx.fillStyle = '#334155';
      ctx.font = '900 48px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('UPLOAD FOTO SUBJEK', 540, 960);
    }

    // Dynamic Overlay Logic
    const padding = 60;
    const boxY = 1540;

    // Headline Background Plate
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding, boxY, 960, 200);

    // Sidebar Accent
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(padding, boxY, 25, 200);

    // Headline Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 78px "Oswald", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(headline.toUpperCase(), padding + 75, boxY + 125);

    // Subheadline Plate
    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.fillRect(padding, boxY + 200, 960, 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px "Inter", sans-serif';
    ctx.fillText(subheadline, padding + 40, boxY + 270);

    // Breaking Badge
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(padding, boxY - 75, 330, 75);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Oswald", sans-serif';
    ctx.fillText('BREAKING NEWS', padding + 35, boxY - 25);
    
    // Live Pulse Animation
    const time = Date.now() / 1000;
    const pulseOpacity = 0.5 + 0.5 * Math.sin(time * 5);
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
    ctx.beginPath();
    ctx.arc(padding + 295, boxY - 37, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => { 
    const interval = setInterval(drawCanvas, 100);
    return () => clearInterval(interval);
  }, [sourceImage, generatedImages, selectedIndex, videoUrl, headline, subheadline]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full lg:overflow-hidden overflow-x-hidden bg-slate-950 text-white font-inter">
      {/* Sidebar Toggle (Mobile) */}
      <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-red-600 p-4 rounded-full shadow-2xl text-white active:scale-90 transition-transform"
      >
          {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
      </button>

      {/* CONTROL SIDEBAR */}
      <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shadow-2xl overflow-hidden ${isSidebarOpen ? 'h-[70vh] lg:h-full' : 'h-0 lg:h-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">News Studio</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3" /> Step 1: Subjek Utama
            </label>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-red-500 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
              <ImageIcon className="w-4 h-4" /> {sourceImage ? 'Ganti Subjek' : 'Unggah Foto Subjek'}
            </button>
          </div>

          <div className="space-y-4 p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FontIcon className="w-3 h-3" /> Step 2: Konten Berita
            </label>
            <div className="space-y-2">
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline Utama..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none" />
              <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="Ticker Berita..." className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs h-20 resize-none outline-none focus:ring-1 focus:ring-red-500" />
            </div>
          </div>

          <div className="space-y-4 p-5 bg-slate-950/50 rounded-2xl border border-red-500/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Step 3: AI Engine
              </label>
              <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button onClick={() => setAiEngine('flash')} className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${aiEngine === 'flash' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>FLASH</button>
                <button onClick={() => setAiEngine('pro')} className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${aiEngine === 'pro' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>ULTRA</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button disabled={isAiLoading || isVideoLoading} onClick={() => handleGenerateImages("World-class high-tech news studio, professional female news anchor, bright dramatic lighting")} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold hover:bg-slate-700 transition-all flex flex-col items-center gap-2">
                <User className="w-4 h-4 text-pink-400" /> Female Anchor
              </button>
              <button disabled={isAiLoading || isVideoLoading} onClick={() => handleGenerateImages("Futuristic metropolitan news set, professional male news anchor, cinematic bokeh background")} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold hover:bg-slate-700 transition-all flex flex-col items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" /> Male Anchor
              </button>
            </div>

            <button disabled={isAiLoading || isVideoLoading || !sourceImage} onClick={() => handleGenerateImages()} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95">
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate News Options
            </button>
          </div>

          {generatedImages.length > 0 && (
            <div className="p-5 bg-blue-900/10 rounded-2xl border border-blue-500/20 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Video className="w-3 h-3" /> Step 4: Cinematic Video (Veo)
                </label>
                <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
                  <button onClick={() => setVideoEngine('veo-fast')} className={`px-2 py-0.5 text-[8px] font-black rounded ${videoEngine === 'veo-fast' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>FAST</button>
                  <button onClick={() => setVideoEngine('veo-pro')} className={`px-2 py-0.5 text-[8px] font-black rounded ${videoEngine === 'veo-pro' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>PRO</button>
                </div>
              </div>
              <button disabled={isVideoLoading || isAiLoading} onClick={handleGenerateVideo} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 shadow-blue-900/20">
                {isVideoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MonitorPlay className="w-4 h-4" />}
                RENDER 9:16 VIDEO
              </button>
            </div>
          )}

          {suggestedJson && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-40 scrollbar-thin">
              <div className="flex items-center gap-2 mb-2 text-slate-500 uppercase tracking-widest font-bold">
                <Terminal className="w-3 h-3" /> AI Broadcast Logic (JSON)
              </div>
              <pre>{JSON.stringify(suggestedJson, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <button onClick={() => {
              if (videoUrl) {
                const a = document.createElement('a'); a.href = videoUrl; a.download = 'berita-siap-siar.mp4'; a.click();
              } else {
                const canvas = canvasRef.current; if (canvas) { const a = document.createElement('a'); a.href = canvas.toDataURL(); a.download = 'berita-frame.png'; a.click(); }
              }
            }} disabled={!sourceImage || (!videoUrl && generatedImages.length === 0)} className="w-full py-4 bg-white text-slate-950 hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95">
                <Download className="w-5 h-5" /> Download Final Video
            </button>
        </div>
      </div>

      {/* PREVIEW VIEWPORT */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#020202] min-h-[500px] lg:min-h-0">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl">
            <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-5 py-2 rounded-full border border-slate-800">
                <Smartphone className="w-3 h-3" /> Vertical Monitor 9:16 {aiEngine === 'pro' && <Crown className="w-3 h-3 text-amber-500" />}
            </div>

            <div className="relative group">
                <div className={`relative bg-black rounded-[50px] overflow-hidden shadow-[0_0_150px_rgba(239,68,68,0.2)] border-[14px] border-slate-800 ring-1 ring-slate-700 transition-all duration-500 flex items-center justify-center w-[280px] h-[500px] md:w-[340px] md:h-[605px]`}>
                    {isVideoLoading && (
                        <div className="absolute inset-0 z-50 bg-black/98 flex flex-col items-center justify-center gap-6 text-center p-10">
                            <div className="relative">
                                <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                                <Sparkles className="w-8 h-8 text-blue-300 absolute -top-2 -right-2 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-xl font-black text-blue-400 uppercase tracking-tighter italic">Veo 3.1 Broadcast Engine</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed max-w-[200px] mx-auto">Membangun frame berita sinematik. Harap bersabar, butuh waktu 1-2 menit...</p>
                            </div>
                        </div>
                    )}

                    {isAiLoading && (
                        <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center gap-6 text-center p-8">
                            <Loader2 className="w-14 h-14 text-red-500 animate-spin" />
                            <p className="text-sm font-black text-red-400 uppercase tracking-widest animate-pulse">Menyiapkan Background Studio...</p>
                        </div>
                    )}
                    
                    {videoUrl ? (
                      <div className="relative w-full h-full">
                        <video src={videoUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-x-5 bottom-12 pointer-events-none space-y-2">
                           <div className="bg-red-600 text-white text-[11px] font-black px-3 py-1.5 w-fit flex items-center gap-2 shadow-lg">
                             BREAKING NEWS
                             <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                           </div>
                           <div className="bg-white text-slate-950 p-4 border-l-[10px] border-red-600 font-black text-2xl uppercase leading-none tracking-tighter shadow-2xl">{headline}</div>
                           <div className="bg-slate-950/95 text-white p-3 text-[11px] font-bold shadow-xl border-l-[10px] border-slate-700 leading-tight">{subheadline}</div>
                        </div>
                      </div>
                    ) : (
                      <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {[0, 1, 2].map((idx) => (
                    <button key={idx} disabled={isAiLoading || isVideoLoading || !generatedImages[idx]} onClick={() => { setSelectedIndex(idx); setVideoUrl(null); }} className={`relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all ${selectedIndex === idx ? 'border-red-500 ring-4 ring-red-500/20' : 'border-slate-800 hover:border-slate-600'}`}>
                        {generatedImages[idx] ? <img src={generatedImages[idx]} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-900/50 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-800" /></div>}
                        {selectedIndex === idx && <div className="absolute inset-0 bg-red-500/15" />}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsStudio;
