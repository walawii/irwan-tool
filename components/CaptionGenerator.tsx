
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, Copy, Check, Image as ImageIcon, Loader2, Hash, Type } from 'lucide-react';
import { GoogleGenAI, Type as GeminiType } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface CaptionGeneratorProps {
  onBack: () => void;
}

const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ onBack }) => {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ caption: string; hashtags: string[]; voiceover: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [voiceoverCopied, setVoiceoverCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaption = async () => {
    if (!productName || !image) return;

    setIsGenerating(true);
    setResult(null); // Reset previous result
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key tidak ditemukan. Silakan periksa pengaturan API Key di menu Settings.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];
      
      const prompt = `
        Analisis gambar produk ini dan nama produk: "${productName}".
        Hasilkan:
        1. Caption media sosial yang menarik (copywriting) dalam Bahasa Indonesia.
        2. 5-10 tagar yang relevan dan sedang tren dalam Bahasa Indonesia.
        3. Narasi Voice Over (naskah) yang persuasif dan natural untuk video promosi pendek dengan durasi MAKSIMAL 15 DETIK (sekitar 30-40 kata) dalam Bahasa Indonesia.
        
        WAJIB kembalikan hasil dalam format JSON VALID tanpa teks tambahan dengan struktur:
        {
          "caption": "teks caption di sini",
          "hashtags": ["tagar1", "tagar2", ...],
          "voiceover": "teks narasi voice over di sini"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              caption: { type: GeminiType.STRING },
              hashtags: { 
                type: GeminiType.ARRAY,
                items: { type: GeminiType.STRING }
              },
              voiceover: { type: GeminiType.STRING }
            },
            required: ["caption", "hashtags", "voiceover"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Tidak ada respon dari AI");
      
      // Clean potential markdown blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (!parsed.caption || !parsed.hashtags) {
          throw new Error("Format data yang diterima tidak lengkap.");
      }
      
      setResult(parsed);
    } catch (error: any) {
      console.error("Error generating caption:", error);
      alert(`Gagal: ${error.message || "Silakan coba lagi."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `CAPTION:\n${result.caption}\n\nTAGAR:\n${result.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}\n\nVOICE OVER:\n${result.voiceover}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVoiceover = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.voiceover);
    setVoiceoverCopied(true);
    setTimeout(() => setVoiceoverCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </button>
          <div className="flex items-center space-x-2">
            <Hash className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Auto Caption & Tagar
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center mr-3">
                  <span className="text-emerald-400 text-sm">01</span>
                </span>
                Input Data Produk
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Nama Produk
                  </label>
                  <input 
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Sepatu Lari Pro X1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Foto Produk
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden aspect-video flex flex-col items-center justify-center group ${
                      image ? 'border-emerald-400/50 bg-emerald-400/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                    }`}
                  >
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold uppercase">Ganti Gambar</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Upload Gambar Produk</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <button
                  onClick={generateCaption}
                  disabled={!productName || !image || isGenerating}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                    !productName || !image || isGenerating
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Caption & Tagar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center mr-3">
                    <span className="text-emerald-400 text-sm">02</span>
                  </span>
                  Hasil Generasi
                </h2>
                {result && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 px-3 py-1.5 rounded-lg"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 mr-1" /> Tersalin</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" /> Salin Semua</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-grow space-y-6">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Caption</label>
                        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                          {result.caption}
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narasi Voice Over</label>
                          <button 
                            onClick={copyVoiceover}
                            className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {voiceoverCopied ? 'Tersalin' : 'Salin Narasi'}
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed text-emerald-400/90 italic whitespace-pre-wrap">
                          "{result.voiceover}"
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tagar Populer</label>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-medium"
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-600 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 opacity-20">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                        Hasil caption dan tagar akan muncul di sini
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center">
                  Didukung oleh Gemini AI • Dioptimalkan untuk Media Sosial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
