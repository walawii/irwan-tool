
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface PromptGeneratorProps {
  onBack: () => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onBack }) => {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
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

  const generatePrompt = async () => {
    if (!productName || !image) return;

    setIsGenerating(true);
    setGeneratedPrompt('');
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key tidak ditemukan. Silakan periksa pengaturan API Key di menu Settings.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = image.split(',')[1];
      
      const prompt = `
        Analisis gambar produk ini dan nama produk: "${productName}".
        Hasilkan DUA (2) prompt VIDEO GENERATION yang berbeda, masing-masing berdurasi 10 DETIK, dalam BAHASA INDONESIA yang akan digunakan di Grok (AI milik X).
        Tujuannya adalah agar kedua adegan ini dapat digabungkan menjadi video iklan berdurasi total 20 detik yang viral.
        
        Output harus menyertakan "ADEGAN 1" dan "ADEGAN 2" dengan instruksi mendetail untuk masing-masing.
        
        Persyaratan untuk setiap prompt adegan:
        1. ADEGAN 1 (10 Detik): Fokus pada HOOK yang sangat kuat di 2 detik pertama. Tampilkan produk "${productName}" dengan MODEL MANUSIA yang memberikan reaksi "WOW" atau menunjukkan masalah yang diselesaikan produk.
        2. ADEGAN 2 (10 Detik): Fokus pada DETAIL PRODUK dan REVIEW singkat. Tampilkan model sedang menggunakan produk atau menunjuk fitur unggulan, diakhiri dengan Call to Action (CTA) "cek keranjang".
        3. Tentukan gerakan kamera (misalnya: slow pan, zoom in, rotasi 360 derajat, handheld cinematic), pencahayaan (misalnya: cinematic lighting, soft studio light, golden hour glow), dan lingkungan berdasarkan gambar.
        4. Gunakan nada yang persuasif dan menarik dalam Bahasa Indonesia.
        5. Sertakan narasi monolog (script) singkat untuk masing-masing adegan yang padat dan persuasif.
        6. Minta Grok untuk menghasilkan video berkualitas tinggi (4K, photorealistic), konversi tinggi.
        7. Tentukan aspek rasio 9:16 yang cocok untuk media sosial (TikTok/Reels/X).
        
        Berikan HANYA teks prompt untuk ADEGAN 1 dan ADEGAN 2 dalam BAHASA INDONESIA, dipisahkan dengan jelas agar mudah disalin.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: mimeType } }
            ]
          }
        ]
      });

      const text = response.text || 'Failed to generate prompt.';
      setGeneratedPrompt(text);
    } catch (error: any) {
      console.error("Error generating prompt:", error);
      setGeneratedPrompt("Error: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black uppercase tracking-tighter bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Prompt Generator
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mr-3">
                  <span className="text-amber-400 text-sm">01</span>
                </span>
                Product Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Product Name
                  </label>
                  <input 
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Luxury Leather Wallet"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Product Image
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden aspect-square flex flex-col items-center justify-center group ${
                      image ? 'border-amber-400/50 bg-amber-400/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                    }`}
                  >
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold uppercase">Change Image</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Upload Image</p>
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
                  onClick={generatePrompt}
                  disabled={!productName || !image || isGenerating}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                    !productName || !image || isGenerating
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Grok Video Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mr-3">
                    <span className="text-amber-400 text-sm">02</span>
                  </span>
                  Generated Video Prompt
                </h2>
                {generatedPrompt && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto min-h-[300px] relative">
                <AnimatePresence mode="wait">
                  {generatedPrompt ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap"
                    >
                      {generatedPrompt}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                      <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                        Your generated prompt will appear here
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              
              <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center">
                Optimized for 2 Scenes (20s Total) • Includes Model, Narration & "cek keranjang" CTA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
