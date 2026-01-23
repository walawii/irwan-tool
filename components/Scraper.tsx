
import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, Download, Trash2, ExternalLink, FileSpreadsheet, Plus, Globe, Loader2, StopCircle, Layers, Image as ImageIcon } from 'lucide-react';
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

  const resolveUrl = (baseUrl: string, relativeUrl: string): string => {
      if (!relativeUrl) return '';
      if (relativeUrl.startsWith('data:')) return relativeUrl; // Keep base64
      
      try {
          return new URL(relativeUrl, baseUrl).href;
      } catch (e) {
          return relativeUrl;
      }
  };

  const extractArticleData = (htmlContent: string, pageUrl: string): ScrapedArticle => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const cleanText = (text: string) => text.replace(/\s+/g, ' ').trim();

      // 1. Title Extraction
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const h1 = doc.querySelector('h1')?.innerText;
      const title = cleanText(ogTitle || twitterTitle || h1 || doc.title || 'No Title Found');

      // 2. Description / Content Extraction
      let finalDescription = '';
      
      // Strategy A: JSON-LD (Structured Data)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      for (const script of jsonLdScripts) {
          try {
              const json = JSON.parse(script.textContent || '{}');
              const obj = Array.isArray(json) ? json[0] : json;
              if (obj && (obj['@type'] === 'NewsArticle' || obj['@type'] === 'Article' || obj['@type'] === 'BlogPosting')) {
                  if (obj.description) {
                      finalDescription = cleanText(obj.description);
                  } else if (obj.articleBody) {
                      finalDescription = cleanText(obj.articleBody.substring(0, 300)) + '...';
                  }
                  if (finalDescription) break;
              }
          } catch (e) { /* ignore */ }
      }

      // Strategy B: Text Scraper (Prioritize Body Text over Meta Description if possible)
      if (!finalDescription) {
          // Find the most likely content container
          const candidates = Array.from(doc.querySelectorAll('article, [role="main"], .post-content, .entry-content, .article-body, #content, main'));
          let contentContainer = candidates.length > 0 ? candidates[0] : doc.body;
          
          // If body is fallback, try to filter out header/footer
          // Better: Look for paragraph with substantial text
          const paragraphs = Array.from(contentContainer.querySelectorAll('p'));
          
          for (const p of paragraphs) {
              const text = cleanText(p.innerText);
              // Filter logic:
              // - Must be reasonably long (>40 chars)
              // - Shouldn't look like a menu item (no high density of links, simplistic check here)
              // - Shouldn't be copyright footer
              if (text.length > 50 && !text.toLowerCase().includes('copyright') && !text.toLowerCase().includes('all rights reserved')) {
                  finalDescription = text;
                  break;
              }
          }
      }

      // Strategy C: Meta Description Fallback
      if (!finalDescription) {
          const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
          const twitterDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
          finalDescription = cleanText(ogDesc || twitterDesc || metaDesc || '');
      }

      if (!finalDescription) finalDescription = "No description found";

      // 3. Image (Enhanced Logic)
      let imgUrl = '';

      // Priority A: Meta Tags (Best Quality)
      const metaImage = 
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          doc.querySelector('link[rel="image_src"]')?.getAttribute('href');

      if (metaImage) {
          imgUrl = metaImage;
      } else {
          // Priority B: Find largest image in article body
          const images = Array.from(doc.querySelectorAll('img'));
          let maxScore = 0;

          for (const img of images) {
              // Get the real source (handle lazy loading)
              const src = img.getAttribute('src') || 
                          img.getAttribute('data-src') || 
                          img.getAttribute('data-original') ||
                          img.getAttribute('data-url');
              
              if (!src || src.startsWith('data:')) continue;
              
              // Skip SVG icons or small UI elements
              if (src.endsWith('.svg') || src.includes('icon') || src.includes('logo')) continue;

              // Check dimensions if available
              const width = parseFloat(img.getAttribute('width') || '0');
              const height = parseFloat(img.getAttribute('height') || '0');
              
              // Simple scoring: width * height, or rudimentary check if no dimensions
              let score = width * height;
              if (width === 0) score = 100; // Give benefit of doubt if no size attr

              if (score > maxScore) {
                  maxScore = score;
                  imgUrl = src;
              }
          }
      }

      // Final cleanup: Resolve relative URLs
      if (imgUrl) {
          imgUrl = resolveUrl(pageUrl, imgUrl);
      }

      return {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        url: pageUrl,
        title: title,
        firstParagraph: finalDescription,
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
                  const fullUrl = resolveUrl(baseUrl, href);
                  
                  // Rule: Must be same domain, not the homepage itself, and not a file
                  if (fullUrl.startsWith(origin) && 
                      fullUrl !== baseUrl && 
                      fullUrl !== baseUrl + '/' &&
                      !fullUrl.match(/\.(pdf|zip|png|jpg|jpeg|gif)$/i)) {
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
          const maxLimit = 10; // Limit auto-scan to 10 to avoid huge waits
          const limitedLinks = linksToScrape.slice(0, maxLimit);

          for (const link of limitedLinks) {
              if (abortScanRef.current) break;

              setScanProgress(`Scraping ${processedCount + 1}/${limitedLinks.length}: ${link.slice(0, 40)}...`);
              
              try {
                  const html = await fetchHtmlContent(link);
                  const article = extractArticleData(html, link);
                  
                  // Only add if it looks like an article (has a title and some text)
                  if (article.title && article.title !== 'No Title Found' && article.firstParagraph !== 'No description found') {
                      setArticles(prev => [article, ...prev]);
                  }
              } catch (e) {
                  console.warn(`Failed to scrape ${link}`, e);
              }

              processedCount++;
              await new Promise(r => setTimeout(r, 800));
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
    
    const rows = [...articles].reverse().map(item => [
        item.title,
        item.firstParagraph,
        item.imageUrl
    ]);
    
    const data = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 50 }, { wch: 100 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Data");
    
    XLSX.writeFile(wb, `scraped_articles_${Date.now()}.xlsx`);
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // Helper to ensure image loads via proxy if needed
  const getDisplayImage = (url: string) => {
      if (!url) return null;
      // Use wsrv.nl as a reliable image proxy to bypass CORS/Hotlink protection
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover`;
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
                    {articles.map((item) => {
                        const displayImg = getDisplayImage(item.imageUrl);
                        return (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 group hover:border-slate-700 transition-colors animate-slide-up">
                            {/* Image Thumbnail with Proxy */}
                            <div className="w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
                                {displayImg ? (
                                    <img 
                                        src={displayImg} 
                                        alt="" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            // Fallback if proxy fails, show original (might fail CORS) or placeholder
                                            if (item.imageUrl && e.currentTarget.src !== item.imageUrl) {
                                                e.currentTarget.src = item.imageUrl;
                                            } else {
                                                e.currentTarget.style.display = 'none';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 text-xs gap-1">
                                        <ImageIcon className="w-6 h-6 opacity-50" />
                                        No Img
                                    </div>
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
