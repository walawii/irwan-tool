
import React, { useState } from 'react';
import { ArrowLeft, Facebook, Download, Trash2, Plus, List, Loader2, CheckCircle, AlertCircle, RefreshCw, ImageIcon, Search, ExternalLink } from 'lucide-react';

interface FBPhoto {
    id: string;
    url: string;
    imageUrl: string | null;
    status: 'idle' | 'processing' | 'done' | 'error';
    error?: string;
}

interface FacebookDownloaderProps {
  onBack: () => void;
}

const FacebookDownloader: React.FC<FacebookDownloaderProps> = ({ onBack }) => {
  const [urlInput, setUrlInput] = useState('');
  const [photos, setPhotos] = useState<FBPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const cleanUrl = (url: string) => {
      try {
          const u = new URL(url.trim());
          u.searchParams.delete('fbclid');
          u.searchParams.delete('extid');
          u.searchParams.delete('ref');
          // Standardize mobile vs desktop links
          let finalUrl = u.toString();
          if (finalUrl.includes('m.facebook.com')) {
              finalUrl = finalUrl.replace('m.facebook.com', 'www.facebook.com');
          }
          return finalUrl;
      } catch (e) {
          return url.trim();
      }
  };

  const fetchHtml = async (url: string): Promise<string> => {
    // List of proxies to try in sequence
    // Use AllOrigins with raw=true as the primary since it's most robust
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    for (const proxyUrl of proxies) {
        try {
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const text = await response.text();
                // Facebook HTML usually contains 'fb_logo' or 'fbcdn'
                if (text && (text.includes('facebook.com') || text.includes('fbcdn') || text.includes('fb_logo'))) {
                    return text;
                }
            }
        } catch (e) {
            console.warn(`Proxy failed: ${proxyUrl}`, e);
        }
    }

    throw new Error('Gagal terhubung ke Facebook. Coba gunakan link versi Desktop (www.facebook.com) dan pastikan postingan Publik.');
  };

  const extractImage = (html: string): string | null => {
      const decodeFBUrl = (url: string) => {
          return url
            .replace(/\\/g, '')
            .replace(/&amp;/g, '&')
            .replace(/u0025/g, '%')
            .replace(/\\u003d/g, '=')
            .replace(/\\u0026/g, '&');
      };

      // 1. Try OG Meta Tags (Metadata standard)
      const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || 
                      html.match(/content="([^"]+)"\s+property="og:image"/i);
      if (ogMatch && ogMatch[1]) return decodeFBUrl(ogMatch[1]);

      // 2. Try patterns common in Facebook's modern React/Relay/GraphQL data structures
      const jsonPatterns = [
          // Preferred High Res patterns
          /"highest_res_image":\s*{\s*"uri":\s*"([^"]+)"/i,
          /"image":\s*{\s*"uri":\s*"([^"]+)"/i,
          /"browser_native_hd_url":\s*"([^"]+)"/i,
          /"browser_native_sd_url":\s*"([^"]+)"/i,
          /"display_url":\s*"([^"]+)"/i,
          /"thumbnail_url":\s*"([^"]+)"/i,
          /"url":\s*"([^"]+fbcdn[^"]+)"/i
      ];

      for (const pattern of jsonPatterns) {
          const match = html.match(pattern);
          if (match && match[1] && match[1].includes('fbcdn')) {
              return decodeFBUrl(match[1]);
          }
      }

      // 3. Regex search for any fbcdn image URL in script tags or strings
      // This is the "brute force" method to find the main photo
      const fbcdnRegex = /(https?:\/\/[^"'\s]+?fbcdn[^"'\s]+?\.jpg[^"'\s]*)/g;
      let match;
      const candidates: string[] = [];
      while ((match = fbcdnRegex.exec(html)) !== null) {
          const candidate = decodeFBUrl(match[1]);
          // Prioritize URLs that look like actual full-size images (t-folders like t39)
          if (candidate.includes('/v/t') || candidate.includes('/t39.') || candidate.includes('/t1.')) {
              candidates.push(candidate);
          }
      }

      if (candidates.length > 0) {
          // Sort by length or keywords to find the most likely 'full' version
          // Often the longest URL contains more parameters for high res
          candidates.sort((a, b) => b.length - a.length);
          return candidates[0];
      }

      // 4. Fallback for older mobile patterns
      const legacyMatch = html.match(/data-full-size-image-url="([^"]+)"/i);
      if (legacyMatch && legacyMatch[1]) return decodeFBUrl(legacyMatch[1]);

      return null;
  };

  const handleAddLinks = () => {
    const lines = urlInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newPhotos: FBPhoto[] = [];

    lines.forEach(line => {
        if (line.includes('facebook.com') || line.includes('fb.watch') || line.includes('fb.com')) {
            const id = Math.random().toString(36).substr(2, 9);
            newPhotos.push({
                id,
                url: cleanUrl(line),
                imageUrl: null,
                status: 'idle'
            });
        }
    });

    if (newPhotos.length > 0) {
        setPhotos(prev => [...newPhotos, ...prev]);
        setUrlInput('');
    } else {
        alert("Mohon masukkan link Facebook yang valid.");
    }
  };

  const processPhoto = async (photo: FBPhoto) => {
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'processing', error: undefined } : p));
    
    try {
        const html = await fetchHtml(photo.url);
        const imgUrl = extractImage(html);
        
        if (imgUrl) {
            setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'done', imageUrl: imgUrl } : p));
        } else {
            throw new Error('Gambar tidak ditemukan. Facebook mungkin menyembunyikan konten ini atau link bukan postingan foto tunggal.');
        }
    } catch (err: any) {
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'error', error: err.message } : p));
    }
  };

  const handleProcessAll = async () => {
    const toProcess = photos.filter(p => p.status === 'idle' || p.status === 'error');
    if (toProcess.length === 0) return;

    setIsProcessing(true);
    for (let i = 0; i < toProcess.length; i++) {
        setProgress(`Mengambil ${i + 1}/${toProcess.length}...`);
        await processPhoto(toProcess[i]);
        // Delay to prevent getting blocked
        if (i < toProcess.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    setIsProcessing(false);
    setProgress('');
  };

  const handleDownloadSingle = (imageUrl: string, id: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `fb-photo-${id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const ready = photos.filter(p => p.status === 'done' && p.imageUrl);
    ready.forEach((p, idx) => {
        setTimeout(() => handleDownloadSingle(p.imageUrl!, p.id), idx * 800);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Facebook className="w-6 h-6 text-blue-500" />
                    FB Photo Bulk
                </h1>
                <span className="text-[10px] text-slate-500 font-medium">v2.1.0 • High-Res Downloader</span>
            </div>
        </div>
        
        {photos.length > 0 && (
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleDownloadAll}
                    disabled={isProcessing || photos.filter(p => p.status === 'done').length === 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all shadow-lg active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Simpan Semua
                </button>
                <button 
                    onClick={() => { if(window.confirm('Bersihkan antrean?')) setPhotos([])}}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Input Area */}
        <div className="bg-slate-900 rounded-2xl p-4 lg:p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Search className="w-4 h-4" />
                    <h2>Masukkan Link Facebook</h2>
                </div>
                <div className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">PUBLIC ONLY</div>
            </div>
            <textarea 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Tempel link Facebook (www.facebook.com/...) di sini, satu link per baris..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-700 resize-none font-mono text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-2">
                <button 
                    onClick={handleAddLinks}
                    disabled={!urlInput.trim()}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Link
                </button>
                <button 
                    onClick={handleProcessAll}
                    disabled={isProcessing || photos.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    {isProcessing ? progress : 'Ambil Gambar'}
                </button>
            </div>
        </div>

        {/* Info Tip */}
        <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-3 flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-200/70 leading-relaxed">
                <span className="font-bold text-amber-400">TIPS:</span> Pastikan link mengarah ke postingan foto tunggal. Jika link berasal dari album, klik pada foto spesifik terlebih dahulu untuk mendapatkan URL yang benar. Link privat atau dalam grup tertutup tidak akan terdeteksi.
            </p>
        </div>

        {/* Results Area */}
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <List className="w-3 h-3" /> Antrean ({photos.length})
                </h2>
            </div>

            {photos.length === 0 ? (
                <div className="text-center py-20 text-slate-700 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium uppercase tracking-widest opacity-40">Antrean Kosong</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col transition-all duration-300 group ${photo.status === 'done' ? 'border-blue-500/30 shadow-lg shadow-blue-900/10' : photo.status === 'error' ? 'border-red-500/30' : 'border-slate-800'}`}>
                            {/* Preview */}
                            <div className="aspect-square relative bg-black flex items-center justify-center overflow-hidden">
                                {photo.imageUrl ? (
                                    <img src={photo.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        {photo.status === 'processing' ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        ) : photo.status === 'error' ? (
                                            <AlertCircle className="w-8 h-8 text-red-500" />
                                        ) : (
                                            <Facebook className="w-8 h-8 opacity-10" />
                                        )}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition-all shadow-lg"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                {photo.status === 'done' && photo.imageUrl && (
                                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <button 
                                            onClick={() => handleDownloadSingle(photo.imageUrl!, photo.id)}
                                            className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-xl active:scale-95 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                        >
                                            Download
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-2 space-y-1 bg-slate-900">
                                <div className="text-[9px] text-slate-500 truncate font-mono opacity-50 flex items-center gap-1">
                                    <ExternalLink className="w-2 h-2" />
                                    {photo.url}
                                </div>
                                {photo.status === 'error' && (
                                    <p className="text-[9px] text-red-400 font-medium leading-tight line-clamp-2 italic">{photo.error}</p>
                                )}
                                {photo.status === 'done' && (
                                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                                        <CheckCircle className="w-3 h-3" /> Berhasil
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FacebookDownloader;
