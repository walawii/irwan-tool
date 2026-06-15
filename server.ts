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
      const ai = new GoogleGenAI({ apiKey });

      // Truncate HTML to optimize token usage and context windows
      const truncatedHtml = html.substring(0, 30000);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
      res.status(500).json({ error: err.message || "Gagal melakukan ekstraksi AI" });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind exclusively to port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer();
