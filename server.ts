import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 50mb payloads (useful if sending large raw HTML contents)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Server-Side Shorts Downloader (Bypasses browser CORS and Cloudflare restrictions)
  app.post("/api/shorts-download", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      console.log(`[Server Shorts Downloader] Processing: ${url}`);

      const COBALT_INSTANCES = [
        'https://api.cobalt.tools/api/json',
        'https://api.server.cobalt.tools/api/json',
        'https://cobalt.api.ryuko.space/api/json',
        'https://cobalt-api.kwiateusz.pl/api/json',
        'https://tools.betweenthelines.org/api/json',
        'https://api.cobalt.crush.sh/api/json',
        'https://cobalt.run/api/json'
      ];

      const requestBody = {
        url: url,
        vQuality: '720',
        vCodec: 'h264',
        filenamePattern: 'classic',
        isAudioOnly: false,
        disableMetadata: true,
        twitterGif: true
      };

      let successData: any = null;
      let lastError: string = "Semua server Cobalt tidak merespon";

      for (const instance of COBALT_INSTANCES) {
        try {
          console.log(`[Server Shorts Downloader] Trying instance: ${instance}`);
          const response = await fetch(instance, {
            method: 'POST',
            headers: { 
              'Accept': 'application/json', 
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(6000) // 6 seconds timeout per instance
          });

          if (response.ok) {
            const data = await response.json() as any;
            if (data && (['stream', 'redirect', 'tunnel', 'picker'].includes(data.status) || data.url)) {
              let directUrl = data.url;
              if (data.status === 'picker' && data.picker && data.picker.length > 0) {
                directUrl = data.picker[0].url;
              }
              if (directUrl) {
                successData = { url: directUrl, status: data.status };
                console.log(`[Server Shorts Downloader] Success with ${instance}`);
                break;
              }
            }
          } else {
            const errText = await response.text();
            console.warn(`[Server Shorts Downloader] Instance ${instance} returned status ${response.status}: ${errText}`);
          }
        } catch (e: any) {
          console.warn(`[Server Shorts Downloader] Instance ${instance} failed:`, e.message || e);
          lastError = e.message || String(e);
        }
      }

      if (successData) {
        return res.json(successData);
      }

      throw new Error(`Semua server Cobalt sibuk atau sedang mengalami gangguan. Silakan gunakan tombol "Unduh Manual" atau coba lagi nanti. (Error terakhir: ${lastError})`);
    } catch (err: any) {
      console.error(`[Server Shorts Downloader Error]`, err);
      res.status(500).json({ error: err.message || "Gagal mengunduh video" });
    }
  });

  // Streaming proxy to bypass any download hotlink/referer restrictions from video providers
  app.get("/api/shorts-stream", async (req, res) => {
    try {
      const videoUrl = req.query.url as string;
      const filename = (req.query.filename as string) || "shorts-video.mp4";

      if (!videoUrl) {
        return res.status(400).send("Parameter URL diperlukan");
      }

      console.log(`[Server Shorts Stream] Proxying download for: ${videoUrl}`);

      const response = await fetch(videoUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        throw new Error(`Gagal mengunduh video dari sumber: HTTP ${response.status}`);
      }

      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp4");
      
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (err: any) {
      console.error(`[Server Shorts Stream Error]`, err);
      if (!res.headersSent) {
        res.status(500).send(err.message || "Gagal menyalurkan video");
      }
    }
  });

  // Server-Side News/Article Fetcher Proxy (Bypasses browser CORS and public proxy 403 blocks)
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }

      console.log(`[Server Scraper] Fetching: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Upgrade-Insecure-Requests": "1"
        }
      });

      if (!response.ok) {
        throw new Error(`Situs tersebut mengembalikan kode status HTTP ${response.status}`);
      }

      const html = await response.text();
      res.json({ html });
    } catch (err: any) {
      console.error(`[Server Scraper Error]`, err);
      res.status(500).json({ error: err.message || "Gagal mengambil data dari situs" });
    }
  });

  // Server-Side Gemini Extraction to keep keys secure and execute consistently
  app.post("/api/gemini-extract", async (req, res) => {
    try {
      const { html, url } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Sistem belum mendeteksi kunci API (GEMINI_API_KEY). Silakan pasang di setelan aplikasi." 
        });
      }

      if (!html) {
        return res.status(400).json({ error: "Konten HTML kosong" });
      }

      // Import Google Gen AI SDK
      const { GoogleGenAI, Type: GeminiType } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Truncate HTML to optimize token usage and context windows
      const truncatedHtml = html.substring(0, 30000);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Extract news/article data from this HTML. Focus on the main article content.
                Return JSON with fields: title, firstParagraph, imageUrl.
                Do not translate the extracted text; keep it exactly in its original language.
                Ensure the imageUrl is a valid full URL if found. Do not make up a dummy image. If no valid image is found, return empty string for imageUrl.
                
                URL: ${url}
                HTML Content:
                ${truncatedHtml}`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              title: { type: GeminiType.STRING },
              firstParagraph: { type: GeminiType.STRING },
              imageUrl: { type: GeminiType.STRING }
            },
            required: ["title", "firstParagraph", "imageUrl"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Tidak ada respon teks dari Gemini AI");
      }

      const cleanJSON = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleanJSON);

      res.json(result);
    } catch (err: any) {
      console.error(`[Server Gemini Extract Error]`, err);
      let errMsg = err.message || "";
      if (typeof err === "object" && err !== null) {
        errMsg = err.message || JSON.stringify(err);
      }
      
      // Handle quota exceeded/rate limit (429) friendly error message in Indonesian
      if (
        err.status === "RESOURCE_EXHAUSTED" || 
        errMsg.includes("429") || 
        errMsg.toLowerCase().includes("quota") || 
        errMsg.toLowerCase().includes("exhausted")
      ) {
        errMsg = "Batas kuota Gemini API gratis terlampaui (maksimal 5 request per menit). Silakan tunggu sekitar 30 detik lalu coba lagi.";
      } else {
        errMsg = "Gagal melakukan ekstraksi AI dari artikel: " + errMsg;
      }

      res.status(500).json({ error: errMsg });
    }
  });

  // Serve static assets natively
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind exclusively to port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer();
