import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, Download, Trash2, ExternalLink, FileSpreadsheet, Plus, Globe, Loader2, StopCircle, Layers, Image as ImageIcon, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { ScrapedArticle } from '../types';
import * as XLSX from 'xlsx';

interface ScraperProps {
  onBack: () => void;
}

const Scraper: React.FC<ScraperProps> = ({ onBack }) => {
  const [urlInput, setUrlInput] = useState('');
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Ref to control stopping the loop
  const abortScanRef = useRef<boolean>(false);

  // Helper with timeout to fail fast if proxy hangs
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(id);
          return response;
      } catch (e) {
          clearTimeout(id);
          throw e;
      }
  };

    const fetchHtmlContent = async (url: string): Promise<{ html: string, proxy: string }> => {
        let targetUrl = url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            const response = await fetchWithTimeout('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: targetUrl })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Situs tersebut mengembalikan kode status ${response.status}`);
            }

            const data = await response.json();
            if (!data.html || data.html.length < 100) {
                throw new Error('Konten html dari situs tersebut kosong atau tidak valid.');
            }

            const text = data.html;
            const lowerText = text.toLowerCase();
            const isErrorPage = 
                (lowerText.includes('403 forbidden') && lowerText.length < 2000) || 
                (lowerText.includes('access denied') && lowerText.length < 2000) ||
                (lowerText.includes('cloudflare') && (lowerText.includes('error') || lowerText.includes('blocked'))) ||
                lowerText.includes('captcha-delivery') ||
                lowerText.includes('ddos-protection') ||
                lowerText.includes('security check');

            if (isErrorPage) {
                throw new Error('Situs ini dilindungi oleh proteksi keamanan tingkat tinggi (Cloudflare/DDoS). Silakan coba dengan tautan alternatif.');
            }

            return { html: text, proxy: 'Server Scraping Engine' };
        } catch (e: any) {
            console.error('Server side scraping failed, attempting direct fetch fallback...', e);
            throw new Error(e.message || 'Situs dilindungi oleh proteksi keamanan (Cloudflare/403). Gunakan URL lain atau coba lagi nanti.');
        }
    };

  const resolveUrl = (baseUrl: string, relativeUrl: string): string => {
      if (!relativeUrl) return '';
      if (relativeUrl.startsWith('data:')) return relativeUrl; // Keep base64
      
      try {
          return new URL(relativeUrl, baseUrl).href;
      } catch (e) {
          return relativeUrl;
      }
  };

  const extractWithAI = async (html: string, url: string): Promise<ScrapedArticle | null> => {
      try {
          const response = await fetchWithTimeout('/api/gemini-extract', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ html, url })
          });

          if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              console.warn("AI extraction response error", errData.error);
              return null;
          }

          const result = await response.json();
          
          if (result.title) {
              return {
                  id: Date.now().toString() + Math.random().toString().slice(2, 5),
                  url: url,
                  title: result.title,
                  firstParagraph: result.firstParagraph,
                  imageUrl: result.imageUrl ? resolveUrl(url, result.imageUrl) : '',
                  isAiImproved: true
              };
          }
      } catch (e) {
          console.error("AI Extraction failed, falling back to manual DOM parse", e);
      }
      return null;
  };

  const extractArticleData = (htmlContent: string, pageUrl: string): ScrapedArticle => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const cleanText = (text: string) => text.replace(/\s+/g, ' ').trim();

      // 1. Title Extraction (Enhanced)
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const h1 = doc.querySelector('h1')?.innerText;
      const title = cleanText(ogTitle || twitterTitle || h1 || doc.title || 'No Title Found');

      // 2. Description / Content Extraction (Enhanced Indonesian Selectors)
      let finalDescription = '';
      
      // Indonesian News Sites Selectors
      const mainContent = doc.querySelector('.detail__body-text, .read__content, .entry-content, .article__content, .content-article, #detikdetailtext, .post-content');
      if (mainContent) {
          const p = mainContent.querySelector('p');
          if (p) finalDescription = cleanText(p.innerText);
      }

      if (!finalDescription) {
          const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
          finalDescription = cleanText(ogDesc || metaDesc || '');
      }

      // Strategy: Fallback to first long paragraph
      if (!finalDescription) {
          const paragraphs = Array.from(doc.querySelectorAll('p'));
          for (const p of paragraphs) {
              const text = cleanText(p.innerText);
              if (text.length > 50) {
                  finalDescription = text;
                  break;
              }
          }
      }

      if (!finalDescription) finalDescription = "No description found";

      // 3. Image (Enhanced Logic)
      let imgUrl = '';
      const metaImage = 
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

      if (metaImage) {
          imgUrl = metaImage;
      } else {
          const images = Array.from(doc.querySelectorAll('img'));
          for (const img of images) {
              const src = img.getAttribute('src');
              if (src && !src.includes('logo') && !src.includes('icon') && src.length > 10) {
                  imgUrl = src;
                  break;
              }
          }
      }

      if (imgUrl) imgUrl = resolveUrl(pageUrl, imgUrl);

      return {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        url: pageUrl,
        title: title,
        firstParagraph: finalDescription,
        imageUrl: imgUrl
      };
  };

  // Helper for Parallel Processing
  const processUrlQueue = async (urls: string[], concurrency: number) => {
      let currentIndex = 0;
      let completed = 0;
      const total = urls.length;

      const worker = async () => {
          while (currentIndex < total && !abortScanRef.current) {
              const index = currentIndex++;
              const url = urls[index];
              setScanProgress(`Memproses ${completed + 1}/${total}...`);
              
              try {
                  const { html } = await fetchHtmlContent(url);
                  
                  // Try AI Extraction first for better quality
                  let article = await extractWithAI(html, url);
                  
                  // Fallback to manual if AI fails or key missing
                  if (!article) {
                      article = extractArticleData(html, url);
                  }
                  
                  if (article.title && article.title !== 'No Title Found') {
                      setArticles(prev => {
                          const filtered = prev.filter(a => a.url !== url || !a.isError);
                          return [article!, ...filtered];
                      });
                  } else {
                      throw new Error('Data tidak lengkap');
                  }
              } catch (err: any) {
                  const errorArticle: ScrapedArticle = {
                      id: Date.now().toString() + Math.random().toString().slice(2, 5),
                      url: url,
                      title: 'Gagal Scraping',
                      firstParagraph: err.message || 'Akses Ditolak atau Timeout',
                      imageUrl: '',
                      isError: true,
                      errorMsg: err.message
                  };
                  setArticles(prev => {
                      if (prev.some(a => a.url === url && a.isError)) return prev;
                      return [errorArticle, ...prev];
                  });
              } finally {
                  completed++;
              }
          }
      };

      const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
      await Promise.all(workers);
      setScanProgress('Selesai');
  };

  const handleBatchScrape = async () => {
    const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    abortScanRef.current = false;

    // Run in parallel
    await processUrlQueue(urls, 3);

    setIsLoading(false);
    setScanProgress('');
    if (!abortScanRef.current) {
        setUrlInput(''); 
    }
  };

  const handleHomeScan = async () => {
      const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      if (urls.length === 0) return;
      const baseUrlInput = urls[0];
      
      abortScanRef.current = false;
      setIsLoading(true);
      setError(null);
      setScanProgress('Mencari link di homepage...');

      try {
          let baseUrl = baseUrlInput;
          if (!/^https?:\/\//i.test(baseUrl)) baseUrl = 'https://' + baseUrl;
          
          const { html } = await fetchHtmlContent(baseUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const anchorTags = Array.from(doc.querySelectorAll('a'));
          const origin = new URL(baseUrl).origin;
          
          const foundUrls = new Set<string>();
          anchorTags.forEach(a => {
              try {
                  const href = a.getAttribute('href');
                  if (!href) return;
                  if (href.startsWith('#') || href.startsWith('javascript:')) return;

                  const fullUrl = resolveUrl(baseUrl, href);
                  
                  if (fullUrl.startsWith(origin) && 
                      fullUrl !== baseUrl && 
                      fullUrl !== baseUrl + '/' &&
                      !fullUrl.match(/\.(pdf|zip|png|jpg|jpeg|gif|css|js)$/i)) {
                      foundUrls.add(fullUrl);
                  }
              } catch (e) { }
          });

          const linksToScrape = Array.from(foundUrls);
          
          if (linksToScrape.length === 0) {
              setError('Tidak ada link internal yang ditemukan.');
              setIsLoading(false);
              return;
          }

          const maxLimit = 15; 
          const limitedLinks = linksToScrape.slice(0, maxLimit);

          await processUrlQueue(limitedLinks, 3);

      } catch (err: any) {
          setError(err.message || 'Gagal scan homepage.');
      } finally {
          setIsLoading(false);
          setScanProgress('');
      }
  };

  const stopScan = () => {
      abortScanRef.current = true;
      setScanProgress('Menghentikan...');
  };

  const handleExportExcel = () => {
    if (articles.length === 0) return;
    const headers = ["Judul", "Paragraf Pertama", "URL Gambar", "URL Artikel", "Metode"];
    const rows = [...articles].reverse().map(item => [
        item.title, 
        item.firstParagraph, 
        item.imageUrl, 
        item.url,
        item.isAiImproved ? 'AI Gemini' : 'Manual DOM'
    ]);
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 50 }, { wch: 100 }, { wch: 50 }, { wch: 50 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Data");
    XLSX.writeFile(wb, `scraped_articles_${Date.now()}.xlsx`);
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleRetryScrape = async (article: ScrapedArticle) => {
      if (isLoading) return;
      
      setIsLoading(true);
      setError(null);
      setScanProgress(`Mencoba ulang ${article.url}...`);
      
      try {
          const { html } = await fetchHtmlContent(article.url);
          
          let newArticle = await extractWithAI(html, article.url);
          if (!newArticle) {
              newArticle = extractArticleData(html, article.url);
          }
          
          if (newArticle.title && newArticle.title !== 'No Title Found') {
              setArticles(prev => prev.map(a => a.id === article.id ? newArticle! : a));
          } else {
              throw new Error('Ekstraksi data masih gagal');
          }
      } catch (err: any) {
          setArticles(prev => prev.map(a => a.id === article.id ? {
              ...a,
              errorMsg: err.message || 'Gagal lagi'
          } : a));
      } finally {
          setIsLoading(false);
          setScanProgress('');
      }
  };

  const getDisplayImage = (url: string) => {
      if (!url) return null;
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter">
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-green-500" />
                Article Scraper <span className="text-[10px] bg-green-900/50 px-2 py-0.5 rounded text-green-300">AI Powered</span>
            </h1>
        </div>
        
        {articles.length > 0 && (
            <button 
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all shadow-lg shadow-green-900/20"
            >
                <Download className="w-4 h-4" />
                Export Excel ({articles.length})
            </button>
        )}
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6">
        
        {/* Banner */}
        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
            <div>
                <h3 className="text-sm font-bold text-emerald-400">Pembaruan: AI Powered Extraction</h3>
                <p className="text-xs text-slate-400 mt-1">Kami sekarang menggunakan Gemini AI untuk mengekstrak data artikel dengan lebih akurat. Jika situs terblokir, coba gunakan URL dari penyedia berita yang berbeda.</p>
            </div>
        </div>
        
        {/* Input Area */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
            <label className="block text-sm font-medium text-slate-400 mb-2">Daftar URL Artikel (Satu per baris)</label>
            <div className="flex flex-col md:flex-row gap-3">
                <textarea 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://news.detik.com/berita/...&#10;https://www.kompas.com/global/read/..."
                    rows={3}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder:text-slate-600 resize-none font-mono text-sm transition-all shadow-inner"
                />
                
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    {isLoading ? (
                        <button 
                            onClick={stopScan}
                            className="h-full bg-red-900/50 border border-red-500 text-red-200 hover:bg-red-900 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <StopCircle className="w-5 h-5 animate-pulse" />
                            Stop
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleBatchScrape}
                                disabled={!urlInput.trim()}
                                title="Scrape URL yang tertulis"
                                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700 whitespace-nowrap"
                            >
                                <Layers className="w-5 h-5 flex-shrink-0" />
                                Add List
                            </button>
                            <button 
                                onClick={handleHomeScan}
                                disabled={!urlInput.trim()}
                                title="Scan halaman depan situs"
                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 whitespace-nowrap"
                            >
                                <Globe className="w-5 h-5 flex-shrink-0" />
                                Scan Home
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Status Messages */}
            {isLoading && scanProgress && (
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {scanProgress}
                </div>
            )}
            
            {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-1">⚠️ {error}</p>}
        </div>

        {/* Results List */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                    Hasil Scraping
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{articles.length}</span>
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total: {articles.length} Artikel</p>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-balance px-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 opacity-50">
                        <Search className="w-8 h-8" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-xs">Belum ada artikel yang di-scrape</p>
                    <p className="text-[10px] mt-2 max-w-xs mx-auto opacity-60">Masukkan URL berita atau artikel di atas untuk mulai mengambil data secara otomatis dengan bantuan AI.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {articles.map((item) => {
                        const displayImg = getDisplayImage(item.imageUrl);
                        return (
                        <div key={item.id} className={`bg-slate-900/50 border ${item.isError ? 'border-red-900/50 bg-red-950/10' : 'border-slate-800 shadow-sm'} rounded-xl p-4 flex gap-4 group hover:border-slate-700 transition-all hover:bg-slate-900 animate-slide-up`}>
                            {/* Image Thumbnail */}
                            <div className="w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden border border-slate-800 relative shadow-inner">
                                {item.isError ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-red-500/50 text-[10px] gap-1 bg-red-950/20">
                                        <AlertCircle className="w-6 h-6" />
                                        Error
                                    </div>
                                ) : displayImg ? (
                                    <img 
                                        src={displayImg} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            if (item.imageUrl && e.currentTarget.src !== item.imageUrl) {
                                                e.currentTarget.src = item.imageUrl;
                                            } else {
                                                e.currentTarget.style.display = 'none';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 text-xs gap-1">
                                        <ImageIcon className="w-6 h-6 opacity-30" />
                                        No Image
                                    </div>
                                )}
                                {item.isAiImproved && !item.isError && (
                                    <div className="absolute top-1 right-1 bg-blue-500 p-1 rounded shadow-lg" title="Ekstraksi ditingkatkan oleh AI">
                                        <Sparkles className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${item.isError ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {item.isError ? 'Failed' : 'Success'}
                                    </span>
                                    {item.isAiImproved && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter bg-blue-500/20 text-blue-400">
                                            Gemini AI
                                        </span>
                                    )}
                                </div>
                                <h3 className={`font-bold ${item.isError ? 'text-red-400' : 'text-white'} text-base leading-tight mb-2 line-clamp-2`}>
                                    {item.title}
                                </h3>
                                <p className={`${item.isError ? 'text-red-300/60' : 'text-slate-400'} text-xs line-clamp-2 mb-3 leading-relaxed`}>
                                    {item.firstParagraph}
                                </p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors flex items-center gap-1 font-medium truncate max-w-sm">
                                    <ExternalLink className="w-3 h-3" /> {item.url}
                                </a>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                {item.isError && (
                                    <button 
                                        onClick={() => handleRetryScrape(item)}
                                        disabled={isLoading}
                                        className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-green-500/20 bg-slate-900 shadow-sm"
                                        title="Coba Lagi"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => removeArticle(item.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 bg-slate-900 shadow-sm"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
      </div>
      <style>{`
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default Scraper;
