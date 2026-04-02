
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
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";

      const base64Data = image.split(',')[1];
      
      const prompt = `
        Analyze this product image and the product name: "${productName}".
        Generate a highly detailed, professional, and persuasive VIDEO GENERATION prompt in INDONESIAN LANGUAGE that will be used in Grok (X's AI).
        The goal is to create a viral-style video advertisement for this product.
        
        The output should be a single, long, detailed prompt in INDONESIAN that I can copy and paste into Grok's video generation tool to get a perfect result.
        
        Requirements for the generated prompt:
        1. It must describe a cinematic video scene featuring the product "${productName}".
        2. It must specify camera movements (e.g., slow pan, zoom in, 360 rotation), lighting (e.g., cinematic, soft studio light), and environment based on the image.
        3. It must use a persuasive and engaging tone in Indonesian.
        4. It must describe the product's visual features accurately based on the image.
        5. It must include a default Call to Action (CTA) in the video's text overlay or ending: "cek keranjang".
        6. The prompt should ask Grok to generate a high-quality, high-converting video with a strong hook.
        
        Output ONLY the prompt text itself in INDONESIAN, ready to be used for video generation.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ]
      });

      setGeneratedPrompt(response.text || 'Failed to generate prompt.');
    } catch (error) {
      console.error("Error generating prompt:", error);
      setGeneratedPrompt("Error: " + (error instanceof Error ? error.message : "Unknown error"));
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
                Optimized for Grok Video Generation • Includes "cek keranjang" CTA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
