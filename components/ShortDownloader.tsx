import React, { useState } from 'react';
import { ArrowLeft, Youtube, Download, Trash2, Copy, Plus, List, Play, Loader2, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface YouTubeVideo {
    id: string;
    url: string;
    thumbnail: string;
    status: 'idle' | 'processing' | 'done' | 'error';
    error?: string;
    downloadUrl?: string;
}

interface ShortDownloaderProps {
  onBack: () => void;
}

// Daftar instansi Cobalt yang diperbarui dan lebih stabil
const COBALT_INSTANCES = [
    'https://api.cobalt.tools/api/json',
    'https://cobalt.api.ryuko.space/api/json',
    'https://api.v7.cobalt.tools/api/json',
    'https://cobalt-api.kwiateusz.pl/api/json'
];

const ShortDownloader: React.FC<ShortDownloaderProps> = ({ onBack }) => {
  const [urlInput, setUrlInput] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*|.*shorts\/([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && (match[7]?.length === 11)) ? match[7] : (match && (match[8]?.length === 11)) ? match[8] : null;
  };

  const handleProcessLinks = () => {
    setIsProcessing(true);
    const lines = urlInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newVideos: YouTubeVideo[] = [];

    lines.forEach(line => {
        const id = extractVideoId(line);
        if (id && !videos.find(v => v.id === id)) {
            newVideos.push({
                id,
                url: line.startsWith('http') ? line : `https://youtube.com/shorts/${id}`,
                thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                status: 'idle'
            });
        }
    });

    setVideos(prev => [...newVideos, ...prev]);
    setUrlInput('');
    setIsProcessing(false);
  };

  const handleCopyLinks = () => {
    const links = videos.map(v => v.url).join('\n');
    navigator.clipboard.writeText(links).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const clearAll = () => {
      if(window.confirm('Hapus semua daftar antrean?')) {
          setVideos([]);
      }
  };

  const downloadFileInternal = async (video: YouTubeVideo): Promise<boolean> => {
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'processing', error: undefined } : v));

    const requestBody = {
        url: video.url,
        videoQuality: '720',
        vCodec: 'h264',
        isAudioOnly: false,
        removePlayer: true
    };

    // Mencoba beberapa instansi API dan beberapa proxy
    for (const apiUrl of COBALT_INSTANCES) {
        try {
            // Kita coba fetch langsung dulu, beberapa instansi mengizinkan CORS
            let response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }).catch(() => null);

            // Jika gagal langsung, coba pakai corsproxy.io
            if (!response || !response.ok) {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
                response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                }).catch(() => null);
            }

            if (response && response.ok) {
                const data = await response.json();
                if (data.status === 'stream' || data.status === 'redirect' || data.url) {
                    const directUrl = data.url;
                    
                    // Simpan URL unduhan agar bisa diakses jika download otomatis gagal
                    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'done', downloadUrl: directUrl } : v));

                    // Memicu pengunduhan browser
                    const link = document.createElement('a');
                    link.href = directUrl;
                    link.setAttribute('download', `shorts-${video.id}.mp4`);
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    return true; 
                }
            }
        } catch (err: any) {
            console.warn(`Instansi ${apiUrl} gagal atau diblokir CORS:`, err.message);
        }
    }

    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'error', error: 'Gagal mengambil video otomatis. Server sedang sibuk atau link tidak valid.' } : v));
    return false;
  };

  const handleDownloadAll = async () => {
      if (videos.length === 0 || isBatchRunning) return;
      
      const toProcess = videos.filter(v => v.status !== 'done');
      if (toProcess.length === 0) {
          alert("Semua video dalam antrean sudah selesai.");
          return;
      }

      setIsBatchRunning(true);
      
      for (const video of toProcess) {
          await downloadFileInternal(video);
          // Jeda agar tidak dianggap bot oleh server API
          await new Promise(r => setTimeout(r, 2500));
      }
      
      setIsBatchRunning(false);
  };

  const openManualDownloader = (videoUrl: string) => {
      // Buka downloader eksternal sebagai fallback terakhir
      window.open(`https://ssyoutube.com/watch?v=${extractVideoId(videoUrl)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Youtube className="w-6 h-6 text-red-600" />
              Shorts Downloader
            </h1>
        </div>
        {videos.length > 0 && (
            <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadAll} 
                  disabled={isBatchRunning}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-lg shadow-red-900/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  {isBatchRunning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Mengunduh Antrean...</>
                  ) : (
                      <><Download className="w-4 h-4" /> Download Semua</>
                  )}
                </button>
                <button 
                  onClick={clearAll} 
                  className="text-slate-400 hover:text-red-400 text-xs px-3 py-2 rounded-lg font-medium border border-transparent hover:border-red-500/20 flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Daftar
                </button>
            </div>
        )}
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6">
        {/* Help Info Box */}
        <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
                <p className="font-bold mb-1">Tips Mengatasi Gagal Ambil Video:</p>
                <ul className="list-disc ml-4 space-y-1">
                    <li>Beberapa server Cobalt sering mengalami rate-limit. Sistem akan mencoba instansi lain secara otomatis.</li>
                    <li>Jika tetap gagal, gunakan tombol <strong>"Manual"</strong> yang muncul pada kartu video untuk mengunduh lewat web bantuan.</li>
                    <li>Pastikan link yang dimasukkan adalah link valid <strong>YouTube Shorts</strong>.</li>
                </ul>
            </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                      <List className="w-4 h-4 text-red-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Input Batch Link Shorts</h2>
                </div>
                {videos.length > 0 && (
                    <button 
                      onClick={handleCopyLinks} 
                      className="text-[10px] text-slate-400 hover:text-white uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors"
                    >
                        <Copy className="w-3 h-3" /> {copyFeedback ? 'Disalin!' : 'Salin Semua Link'}
                    </button>
                )}
            </div>
            <textarea 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Tempel link Shorts di sini (satu baris satu link)..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none resize-none font-mono text-sm mb-4 transition-all"
            />
            <button 
              onClick={handleProcessLinks} 
              disabled={!urlInput.trim() || isProcessing} 
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Tambahkan ke Daftar
            </button>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                  Antrean Download <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{videos.length}</span>
                </h2>
                {isBatchRunning && (
                    <span className="text-xs text-blue-400 animate-pulse font-medium italic">Sedang memproses, mohon tunggu...</span>
                )}
            </div>
            
            {videos.length === 0 ? (
                <div className="text-center py-20 text-slate-700 border-2 border-dashed border-slate-800 rounded-2xl">
                    <Youtube className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Antrean Kosong</p>
                    <p className="text-sm opacity-60">Masukkan link Shorts di atas untuk memulai batch download.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <div key={video.id} className={`bg-slate-900 border rounded-2xl overflow-hidden group transition-all animate-slide-up ${video.status === 'done' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : video.status === 'error' ? 'border-red-500/50' : video.status === 'processing' ? 'border-blue-500/50' : 'border-slate-800 hover:border-red-600/50'}`}>
                            <div className="aspect-[9/16] relative bg-black">
                                <img 
                                  src={video.thumbnail} 
                                  className={`w-full h-full object-cover transition-all duration-500 ${video.status === 'done' ? 'opacity-40 grayscale' : 'opacity-80 group-hover:opacity-100'}`} 
                                  onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`; }} 
                                  alt="Preview"
                                />
                                
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {video.status === 'processing' && (
                                        <div className="bg-black/60 backdrop-blur-sm p-4 rounded-full border border-blue-500/50 shadow-xl">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                    {video.status === 'done' && (
                                        <div className="bg-green-500/20 backdrop-blur-sm p-4 rounded-full">
                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                        </div>
                                    )}
                                    {video.status === 'error' && (
                                        <div className="bg-red-500/20 backdrop-blur-sm p-4 rounded-full">
                                            <AlertCircle className="w-8 h-8 text-red-500" />
                                        </div>
                                    )}
                                    {video.status === 'idle' && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all">
                                                <Play className="w-6 h-6 fill-white text-white" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <button 
                                  onClick={() => removeVideo(video.id)} 
                                  className="absolute top-2 right-2 p-2 bg-slate-950/80 hover:bg-red-600 text-white rounded-lg transition-colors z-10"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-900">
                                <div className="text-[10px] text-slate-500 mb-2 truncate font-mono uppercase tracking-wider">ID: {video.id}</div>
                                
                                {video.status === 'error' && (
                                    <p className="text-[10px] text-red-400 mb-3 italic leading-tight">{video.error}</p>
                                )}

                                <div className="flex gap-2">
                                    <button 
                                      onClick={() => downloadFileInternal(video)} 
                                      disabled={video.status === 'processing' || video.status === 'done'}
                                      className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border shadow-md active:scale-95
                                        ${video.status === 'done' 
                                            ? 'bg-green-600/10 border-green-500/30 text-green-500' 
                                            : video.status === 'processing'
                                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-slate-800 hover:bg-red-600 text-white border-slate-700 hover:border-red-500'
                                        }
                                      `}
                                    >
                                        {video.status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : video.status === 'error' ? <RefreshCw className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                        {video.status === 'done' ? 'Tersimpan' : video.status === 'processing' ? 'Proses...' : 'Unduh'}
                                    </button>
                                    
                                    {(video.status === 'error' || video.status === 'done') && (
                                        <button 
                                            onClick={() => openManualDownloader(video.url)}
                                            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all shadow-md active:scale-95"
                                            title="Download Manual (Layanan Luar)"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      <style>{`
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.4s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default ShortDownloader;