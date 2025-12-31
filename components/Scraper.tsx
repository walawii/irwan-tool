import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, Download, Trash2, ExternalLink, FileSpreadsheet, Plus, Globe, Loader2, StopCircle, Layers } from 'lucide-react';
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

  const fetchHtmlContent = async (url: string): Promise<string> => {
    // 1. Normalize URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    // 2. Try CorsProxy.io (Fast & Reliable for many 403 sites)
    try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
            return await response.text();
        }
    } catch (e) {
        console.warn("CorsProxy.io failed:", e);
    }

    // 3. Try Primary Proxy (AllOrigins)
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.contents) return data.contents;
        }
    } catch (e) {
        console.warn("Primary proxy (AllOrigins) failed:", e);
    }

    // 4. Try Secondary Proxy (CodeTabs)
    try {
        const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
            return await response.text();
        }
    } catch (e) {
        console.warn("Secondary proxy (CodeTabs) failed:", e);
    }

    throw new Error('Could not fetch website content. The site may strictly block proxies (403) or is unreachable.');
  };

  const extractArticleData = (htmlContent: string, pageUrl: string): ScrapedArticle => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Extraction Logic
      // 1. Title
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const h1 = doc.querySelector('h1')?.innerText;
      const title = ogTitle || h1 || doc.title || 'No Title Found';

      // 2. First Paragraph
      const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      let firstP = '';
      const paragraphs = doc.querySelectorAll('p');
      for (const p of paragraphs) {
        const text = p.innerText.trim();
        // Filter out short menu/copyright text
        if (text.length > 50) {
            firstP = text;
            break;
        }
      }
      const description = firstP || ogDesc || 'No description found';

      // 3. Image
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      let imgUrl = ogImage || '';
      
      if (!imgUrl) {
          const imgs = doc.querySelectorAll('img');
          for(const img of imgs) {
              if (img.src && !img.src.startsWith('data:') && img.width > 100) {
                  imgUrl = img.src;
                  break;
              }
          }
      }

      // Resolve relative image URLs
      if (imgUrl && !/^https?:\/\//i.test(imgUrl)) {
        try {
            // Need a base for relative URLs
            const urlObj = new URL(pageUrl);
            // Handle absolute path /img.jpg vs relative path img.jpg
            if (imgUrl.startsWith('/')) {
                imgUrl = `${urlObj.origin}${imgUrl}`;
            } else {
                imgUrl = new URL(imgUrl, pageUrl).href;
            }
        } catch (e) {
            console.warn("Could not resolve relative image URL", e);
        }
      }

      return {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        url: pageUrl,
        title: title.trim(),
        firstParagraph: description.trim(),
        imageUrl: imgUrl
      };
  };

  const handleBatchScrape = async () => {
    // Split by newline and filter empty lines
    const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    
    if (urls.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setScanProgress('');
    abortScanRef.current = false;

    let processedCount = 0;

    for (const url of urls) {
        if (abortScanRef.current) break;

        setScanProgress(`Processing ${processedCount + 1}/${urls.length}: ${url.slice(0, 30)}...`);

        try {
            // Normalize input for the ID/URL
            let targetUrl = url;
            if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

            const htmlContent = await fetchHtmlContent(targetUrl);
            const article = extractArticleData(htmlContent, targetUrl);
            
            setArticles(prev => [article, ...prev]);

        } catch (err: any) {
            console.error(`Failed to scrape ${url}`, err);
            // We don't stop the whole batch, just log error in console or maybe add a "failed" notification
            // Optionally set error state but that might overwrite previous success messages
        }
        
        processedCount++;
        // Small delay to prevent rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    setIsLoading(false);
    setScanProgress('');
    if (!abortScanRef.current) {
        setUrlInput(''); // Clear input only if fully completed
    }
  };

  const handleHomeScan = async () => {
      // Use the first non-empty line as the homepage URL
      const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      if (urls.length === 0) return;
      const baseUrlInput = urls[0];
      
      abortScanRef.current = false;
      setIsLoading(true);
      setError(null);
      setScanProgress('Fetching homepage...');

      try {
          // 1. Fetch Homepage
          let baseUrl = baseUrlInput;
          if (!/^https?:\/\//i.test(baseUrl)) baseUrl = 'https://' + baseUrl;
          
          const homeHtml = await fetchHtmlContent(baseUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(homeHtml, 'text/html');
          
          // 2. Extract Links
          const anchorTags = Array.from(doc.querySelectorAll('a'));
          const origin = new URL(baseUrl).origin;
          
          // Filter unique and valid internal links
          const foundUrls = new Set<string>();
          anchorTags.forEach(a => {
              try {
                  const href = a.getAttribute('href');
                  if (!href) return;
                  if (href.startsWith('#') || href.startsWith('javascript:')) return;

                  // Resolve absolute URL
                  const fullUrl = new URL(href, baseUrl).href;
                  
                  // Rule: Must be same domain, not the homepage itself, and not a file
                  if (fullUrl.startsWith(origin) && 
                      fullUrl !== baseUrl && 
                      fullUrl !== baseUrl + '/' &&
                      !fullUrl.match(/\.(pdf|zip|png|jpg)$/i)) {
                      foundUrls.add(fullUrl);
                  }
              } catch (e) {
                  // invalid url
              }
          });

          const linksToScrape = Array.from(foundUrls);
          
          if (linksToScrape.length === 0) {
              setError('No valid internal links found on this page.');
              setIsLoading(false);
              return;
          }

          // 3. Process Links Sequentially
          let processedCount = 0;
          for (const link of linksToScrape) {
              if (abortScanRef.current) break;

              setScanProgress(`Scraping ${processedCount + 1}/${linksToScrape.length}: ${link.slice(0, 40)}...`);
              
              try {
                  const html = await fetchHtmlContent(link);
                  const article = extractArticleData(html, link);
                  
                  // Only add if it looks like an article (has a title and some text)
                  if (article.title && article.title !== 'No Title Found' && article.firstParagraph) {
                      setArticles(prev => [article, ...prev]);
                  }
              } catch (e) {
                  console.warn(`Failed to scrape ${link}`, e);
              }

              processedCount++;
              // Small delay to be nice to the proxy/server
              await new Promise(r => setTimeout(r, 500));
          }

      } catch (err: any) {
          setError(err.message || 'Failed to scan homepage.');
      } finally {
          setIsLoading(false);
          setScanProgress('');
      }
  };

  const stopScan = () => {
      abortScanRef.current = true;
      setScanProgress('Stopping...');
  };

  const handleExportExcel = () => {
    if (articles.length === 0) return;

    // Create array of arrays for exact column mapping
    const headers = ["Judul", "Paragraf Pertama", "URL Gambar"];
    
    // We reverse the articles array so the exported list follows the order 
    // from 'First Scraped' (Oldest in state) to 'Last Scraped' (Newest in state).
    // State is [Newest, ..., Oldest]. Reverse -> [Oldest, ..., Newest].
    const rows = [...articles].reverse().map(item => [
        item.title,
        item.firstParagraph,
        item.imageUrl
    ]);
    
    // Combine headers and rows
    const data = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Set column widths for better visibility
    ws['!cols'] = [{ wch: 50 }, { wch: 100 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Data");
    
    XLSX.writeFile(wb, `scraped_articles_${Date.now()}.xlsx`);
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-green-500" />
                Article Scraper
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
        
        {/* Input Area */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
            <label className="block text-sm font-medium text-slate-400 mb-2">Article URLs (One per line)</label>
            <div className="flex flex-col md:flex-row gap-3">
                <textarea 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/article-1&#10;https://example.com/article-2"
                    rows={3}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none placeholder:text-slate-600 resize-none font-mono text-sm"
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
                                title="Scrape URLs listed"
                                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700 whitespace-nowrap"
                            >
                                <Layers className="w-5 h-5" />
                                Add List
                            </button>
                            <button 
                                onClick={handleHomeScan}
                                disabled={!urlInput.trim()}
                                title="Scan the first URL as a homepage"
                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 whitespace-nowrap"
                            >
                                <Globe className="w-5 h-5" />
                                Scan Home
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Status Messages */}
            {isLoading && scanProgress && (
                <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {scanProgress}
                </div>
            )}
            
            {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-1">⚠️ {error}</p>}
        </div>

        {/* Results List */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                Scraped Items 
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{articles.length}</span>
            </h2>

            {articles.length === 0 ? (
                <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No articles scraped yet.</p>
                    <p className="text-sm">Enter URLs above to extract data.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {articles.map((item) => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 group hover:border-slate-700 transition-colors animate-slide-up">
                            {/* Image Thumbnail */}
                            <div className="w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden border border-slate-800">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display='none')}/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">No Img</div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-lg leading-tight mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{item.firstParagraph}</p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> {item.url}
                                </a>
                            </div>

                            {/* Actions */}
                            <button 
                                onClick={() => removeArticle(item.id)}
                                className="self-start p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remove"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
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