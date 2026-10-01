import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Helper function to handle Gemini calls with automatic retry and model fallbacks for 503 High Demand, 429 Rate Limit, or 404 Not Found
async function generateContentWithRetry(aiClient: any, params: any) {
  const preferredModel = params.model || "gemini-3.8-flash";
  const candidateModels = [
    preferredModel,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview"
  ];

  const uniqueModels: string[] = [];
  for (const m of candidateModels) {
    if (!uniqueModels.includes(m)) uniqueModels.push(m);
  }

  let lastError: any = null;

  for (const modelName of uniqueModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Executing request with model: ${modelName} (Attempt ${attempt})`);
        const response = await aiClient.models.generateContent({
          ...params,
          model: modelName
        });
        return response;
      } catch (err: any) {
        lastError = err;
        let errStr = "";
        if (typeof err === "string") errStr = err;
        else if (err?.message) errStr = err.message;
        else errStr = JSON.stringify(err);

        const is503 = err?.code === 503 || err?.status === 503 || errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.toLowerCase().includes("high demand");
        const is429 = err?.status === "RESOURCE_EXHAUSTED" || errStr.includes("429") || errStr.toLowerCase().includes("quota") || errStr.toLowerCase().includes("exhausted");
        const is404 = err?.status === "NOT_FOUND" || err?.code === 404 || errStr.includes("404") || errStr.includes("NOT_FOUND");

        console.warn(`[Gemini API Warning] Model ${modelName} (Attempt ${attempt}) failed: ${errStr}`);

        if (is503 || is429) {
          const delayMs = attempt * 1200;
          console.log(`[Gemini API Retry] Waiting ${delayMs}ms before retrying / falling back...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (is404) {
          console.warn(`[Gemini API 404 Fallback] Model ${modelName} not found, falling back to next candidate model...`);
          break; // break inner attempt loop to try next model in uniqueModels
        }

        throw err;
      }
    }
  }

  throw lastError;
}

function formatGeminiError(err: any, contextLabel: string): string {
  let errStr = "";
  if (typeof err === "string") {
    errStr = err;
  } else if (err?.message) {
    errStr = err.message;
  } else if (typeof err === "object") {
    try {
      errStr = JSON.stringify(err);
    } catch {
      errStr = String(err);
    }
  } else {
    errStr = String(err);
  }

  if (errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.toLowerCase().includes("high demand")) {
    return `${contextLabel}: Server Gemini AI saat ini sedang dipadati lalu lintas tinggi (High Demand 503). Silakan tunggu beberapa detik dan tekan tombol sekali lagi.`;
  }

  if (err?.status === "RESOURCE_EXHAUSTED" || errStr.includes("429") || errStr.toLowerCase().includes("quota") || errStr.toLowerCase().includes("exhausted")) {
    return `${contextLabel}: Batas kuota Gemini API gratis terlampaui. Silakan tunggu sekitar 15-30 detik lalu coba lagi.`;
  }

  if (err?.status === "NOT_FOUND" || err?.code === 404 || errStr.includes("404") || errStr.includes("NOT_FOUND")) {
    return `${contextLabel}: Model Gemini AI yang diminta tidak ditemukan atau sedang tidak tersedia (404 Not Found).`;
  }

  let cleanMsg = errStr;
  if (cleanMsg.startsWith('{') && cleanMsg.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleanMsg);
      if (parsed.error?.message) cleanMsg = parsed.error.message;
      else if (parsed.message) cleanMsg = parsed.message;
    } catch {
      // keep raw if parse fails
    }
  }

  return `${contextLabel}: ${cleanMsg}`;
}

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

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.8-flash",
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
      res.status(500).json({ error: formatGeminiError(err, "Gagal melakukan ekstraksi AI dari artikel") });
    }
  });

  // Server-Side Storyboard Creator for miniature unboxing videos
  app.post("/api/gemini-storyboard", async (req, res) => {
    try {
      const { itemName, style, frameCount = 9 } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Sistem belum mendeteksi kunci API (GEMINI_API_KEY). Silakan pasang di setelan aplikasi." 
        });
      }

      if (!itemName) {
        return res.status(400).json({ error: "Nama barang tidak boleh kosong" });
      }

      const limit = parseInt(frameCount as string) || 9;

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

      const promptText = `Anda adalah seorang ahli sutradara konten video unboxing UGC (User Generated Content) dan ASMR kreatif kelas dunia, khususnya unboxing barang-barang miniatur (mini/micro items) untuk platform vertical (Shorts/Reels/TikTok).
      
      **TUGAS UTAMA:**
      Buatlah rancangan storyboard video unboxing UGC barang mini berikut berformat VERTICAL 9:16:
      - Nama Barang Mini: "${itemName}"
      - Style Video: "${style || 'Aesthetic Satisfying ASMR'}"
      - Jumlah Prompt per Bagian: ${limit} prompt

      **PENTING - REALISME FUNGSI BARANG:**
      Anda wajib melakukan analisis mendalam terhadap "${itemName}". 
      Seluruh tahapan unboxing, cara memegang, dan demonstrasi fungsi barang pada storyboard harus disesuaikan secara REALISTIS dan SPESIFIK dengan fungsi nyata barang tersebut!
      - JANGAN menggunakan contoh generik atau fiktif (seperti "melipat kabel" atau "menekan tombol pompa") jika barang tersebut bukanlah kabel lipat atau pembuat kopi.
      - Jika barang tersebut adalah charger, demonstrasikan fungsionalitas pengisian daya, suara colokan (clicky plug), dan indikator lampu.
      - Jika barang tersebut adalah speaker mini, demonstrasikan penekanan tombol power, suara ketukan grill speaker, getaran bass mikro, dan koneksi bluetooth.
      - Jika barang tersebut adalah miniatur pisau/alat lipat, demonstrasikan mekanisme penguncian, suara gesekan bilah logam, dan fungsinya memotong benda kecil secara presisi.
      - Pastikan setiap langkah fungsionalitas mempraktekkan cara kerja asli dan kegunaan utama dari barang "${itemName}" tersebut dengan masuk akal dan memuaskan secara visual/audio!

      **STRUKTUR WAKTU DAN DURASI (Setiap 1 Prompt adalah 10 Detik):**
      Sesuai permintaan pengguna, 1 prompt JSON digunakan HANYA untuk 10 detik video (1 prompt = 10s). 
      - Anda harus mengisi nilai parameter "time_range" di setiap frame dengan nilai persis "10.0s" (tidak dibagi-bagi lagi).
      - Setiap frame/prompt yang Anda hasilkan melambangkan satu klip video utuh sepanjang 10 detik yang estetik.

      **TANPA NARASI ATAU VOICE OVER (ASMR & MUSIK SAJA):**
      JANGAN membuat narasi verbal atau pengisi suara (Voiceover) di dalam rancangan video ini. 
      - Bagian isi suara/audio ("voiceover_or_audio") harus berisi kombinasi detail resep suara ASMR murni yang memuaskan (seperti suara garukan kuku pada kemasan, robekan selotip, ketukan plastik, suara klik tombol mekanis fungsional asli barang tersebut) AND rekomendasi jenis musik latar yang disarankan (misalnya: Lo-Fi beats, Acoustic indie vibe, Soft Chillhop, Minimalist Ambient).
      - Contoh format isi "voiceover_or_audio": "[ASMR: Tapping lembut permukaan kemasan kotak karton + Gesekan kuku estetik] [Musik: Cozy acoustic guitar background, tempo lambat]"

      **SURGICAL LOGIC 8 BARIS (LOGIKA BEDAH MENGUNCI AI 0% -> 100%):**
      Anda WAJIB dan HARUS menyusun alur adegan perakitan secara berurutan kronologis dari 0% hingga 100% mengikuti 8 fasa berikut tanpa ada langkah yang melompat:
      1. [0% UNBOXING & POTONG SEGEL]: Memotong segel plastik kemasan boks dengan cutter presisi mikro, membuka penutup boks utama.
      2. [15% UNTRAY & PENATAAN PART]: Mengeluarkan seluruh komponen micro part & menata di atas tray/mat studio secara sistematis.
      3. [30% SASIS & STRUKTUR INTI]: Merakit sasis tubular / ladder frame / rangka utama hingga berdiri kokoh.
      4. [45% MESIN MIKRO & SUSPENSI]: Memasang unit mesin mikro (eSP+/1.5L/reactor) & mekanisme suspensi ke sasis.
      5. [60% RODA, REM & KNALPOT]: Memasang roda alloy, ban karet, piringan rem, & knalpot racing stainless.
      6. [75% BODI FAIRING & PANEL]: Mengunci bodi fairing luar, tangki bensin, jok, dan panel bodi hingga flush presisi.
      7. [90% STIKER DECAL & EMBLEM]: Penempelan stiker decal emblem, badging logo mikro, dan polishing bodi dengan kain mikrofiber.
      8. [100% ENGINE START & SPITFIRE]: Unit 100% jadi bertumpu di paddock stand/display base, tombol starter ditekan, mesin idle, gas diputar hingga knalpot berapi/spit fire, dilengkapi Watermark Transparan "Irwan Kurnia".

      Rancang juga 4 keunggulan utama (benefits) yang khas dan fungsional dari produk miniatur ini yang akan dicantumkan di bagian footer storyboard lengkap dengan deskripsi pendeknya.
      Tentukan juga metadata model yang cocok (misal: gender "Wanita", kelompok usia "Young Adult", lokasi "Indonesia").
      Buatlah CAPTION media sosial dan HASHTAGS dalam BAHASA INGGRIS (English) yang estetik, memuaskan, dan siap viral.
      **SANGAT PENTING - ATURAN SINGLE FULL-FRAME VIDEO (TANPA SPLIT-SCREEN / MULTI-PANEL / COLLAGE):**
      Setiap adegan ('visual_prompt') WAJIB mendeskripsikan SATU TAMPILAN KAMERA UTUH PENUH (Single Continuous Full-Screen 9:16 Vertical Shot).
      - DILARANG KERAS menggunakan kata 'grid', 'collage', 'split-screen', 'split view', 'multi-panel', 'stacked panels', 'multiple angles in one image', 'triptych', atau 'storyboard layout in one image'.
      - Pastikan hasil video/gambar adalah SATU TAMPILAN TUNGGAL PENUH TANPA TERBAGI dlm beberapa panel horizontal/vertikal.
      - Sertakan frasa spesifik: "single continuous full-frame 9:16 vertical video shot, unified single camera view, strictly no split screen, no multi-panel, no collage, no stacked frames" di dalam setiap prompt visual.

      Prompt visual di setiap frame harus ditulis dalam BAHASA INGGRIS karena model generator gambar bekerja optimal dengan bahasa Inggris. Pastikan untuk mencantumkan frasa spesifik "9:16 aspect ratio, vertical video shot, single continuous full-frame view, close up, detailed textures, soft lighting, asian model, strictly no split screen" di dalam prompt visualnya.
      Sedangkan deskripsi judul adegan (action_title), detail suara ASMR & musik ("voiceover_or_audio"), dan key_point boleh ditulis dalam Bahasa Indonesia untuk membantu pengguna memahaminya.

      Hasilkan output dalam format JSON sesuai dengan skema yang diberikan.`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              prompt_part_1: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 1 (10 seconds, vertical 9:16 aspect ratio). Describe the first half of unboxing - box presentation, touch tapping, opening micro seal with realistic satisfying vertical shot." 
              },
              prompt_part_2: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 2 (10 seconds, vertical 9:16 aspect ratio). Describe the second half of unboxing - extracting the micro item, demonstrating its detail/functionality under extreme macro focus, vertical 9:16 format." 
              },
              metadata: {
                type: GeminiType.OBJECT,
                properties: {
                  model_gender: { type: GeminiType.STRING, description: "Gender model, e.g., 'Wanita' or 'Pria'" },
                  model_age_group: { type: GeminiType.STRING, description: "Age group, e.g., 'Young Adult' or 'Gen Z'" },
                  location: { type: GeminiType.STRING, description: "Location, default 'Indonesia'" }
                },
                required: ["model_gender", "model_age_group", "location"]
              },
              part_1_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential 10-second prompt frames for Part 1, matching the requested frameCount. Each prompt is exactly 10 seconds.",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Must be exactly '10.0s' representing a full 10-second clip" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Extreme detailed vertical 9:16 portrait visual prompt in English for drawing" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "Detailed ASMR sounds & background music suggestion in Indonesian (no spoken narration)" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              part_2_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential 10-second prompt frames for Part 2, matching the requested frameCount. Each prompt is exactly 10 seconds.",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Must be exactly '10.0s' representing a full 10-second clip" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Extreme detailed vertical 9:16 portrait visual prompt in English for drawing" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "Detailed ASMR sounds & background music suggestion in Indonesian (no spoken narration)" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              benefits: {
                type: GeminiType.ARRAY,
                description: "4 main selling points of this product",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    title: { type: GeminiType.STRING },
                    description: { type: GeminiType.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              caption: { 
                type: GeminiType.STRING, 
                description: "Satisfying and engaging social media copywriting caption in English. Perfect for Shorts/Reels/TikTok." 
              },
              hashtags: { 
                type: GeminiType.ARRAY, 
                items: { type: GeminiType.STRING },
                description: "Minimal 5 popular unboxing ASMR and miniature hashtags in English (e.g., #miniatureunboxing, #satisfyingasmr)." 
              }
            },
            required: ["prompt_part_1", "prompt_part_2", "metadata", "part_1_frames", "part_2_frames", "benefits", "caption", "hashtags"]
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
      console.error(`[Server Gemini Storyboard Error]`, err);
      res.status(500).json({ error: formatGeminiError(err, "Gagal membuat storyboard unboxing") });
    }
  });

  // Server-Side Mini Cooking Video Storyboard and ASMR Generator
  app.post("/api/gemini-mini-cooking", async (req, res) => {
    try {
      const { menuName, duration, theme, handType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Sistem belum mendeteksi kunci API (GEMINI_API_KEY). Silakan pasang di setelan aplikasi." 
        });
      }

      if (!menuName) {
        return res.status(400).json({ error: "Nama masakan tidak boleh kosong" });
      }

      const activeDuration = parseInt(duration as string) || 20;

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

      const promptText = `Anda adalah seorang ahli sutradara konten video memasak miniatur (mini/micro cooking) UGC (User Generated Content) dan ASMR kreatif kelas dunia, khususnya untuk platform vertical (Shorts/Reels/TikTok).
      
      **TUGAS UTAMA:**
      Buatlah rancangan storyboard video memasak miniatur berikut berformat VERTICAL 9:16:
      - Nama Menu Masakan Miniatur: "${menuName}"
      - Tema Dapur: "${theme || 'Japandi Modern'}"
      - Tampilan Tangan (POV 9:16): "${handType || 'Wanita'}"
      - Durasi Total: ${activeDuration} detik

      **PENTING - REALISME MASAKAN MINIATUR:**
      Anda wajib melakukan analisis mendalam terhadap resep asli "${menuName}".
      Seluruh tahapan memasak, cara memegang bahan berukuran mikro dengan pinset/jari, serta proses memasak (misal: memotong daging berukuran 1cm, mengoles telur dengan kuas lukis, menggoreng di wajan sebesar koin, membakar kue sus mikro dengan lilin pembakar) harus disesuaikan secara REALISTIS, SPESIFIK, dan SANGAT DETIL.
      - Bagian isi suara/audio ("voiceover_or_audio") harus berisi kombinasi detail resep suara ASMR murni yang memuaskan (seperti: ketukan pisau mikro pada talenan kayu, desis minyak panas saat bahan masuk wajan, letupan bumbu, gemerisik kulit bawang mikro, suara pisau membelah makanan kering yang garing).
      - Contoh format isi "voiceover_or_audio": "[ASMR: Desis kencang minyak mendidih saat adonan masuk wajan koin + bunyi adukan sendok mini] [Musik: Chill lofi jazz, tempo santai]"

      **STRUKTUR BAGIAN STORYBOARD:**
      Setiap bagian (Part) merepresentasikan 10 detik video dan berisi 4 frame berurutan (masing-masing frame berdurasi 2.5 detik).
      - Part 1 (Detik 0-10): Tahap Persiapan & Potong Bahan (Preparation & Chopping). Fokus pada memotong bahan-bahan mikro (bawang, daging, sayuran) dengan pisau mini, menyiapkan alat masak mini, menyalakan kompor lilin/kompor gas mikro.
      - Part 2 (Detik 10-20): Tahap Memasak & Membumbui (Cooking & Seasoning). Fokus pada memasak bahan, mengaduk dengan spatula mini, menaburkan garam/bumbu mikro menggunakan pinset, melihat perubahan warna makanan di wajan mini.
      - Part 3 (Detik 20-30): Tahap Penyajian & Santap Garing (Plating & Crispy Bite). Fokus pada meletakkan makanan di piring mikro seukuran kancing, menambahkan hiasan mikro, dan suara garing saat pisau/garpu membelah masakan atau model menyantapnya secara memuaskan.

      Harap rancang 4 keunggulan utama (benefits) dari resep atau pengalaman memasak miniatur menu "${menuName}" ini.
      Metadata model diisi sesuai setelan (Wanita/Pria).
      Buatlah CAPTION media sosial lengkap dengan HASHTAGS viral dalam BAHASA INGGRIS (English only) yang siap disalin. Seluruh caption dan hashtags wajib ditulis murni dalam Bahasa Inggris.
      Prompt visual di setiap frame harus ditulis dalam BAHASA INGGRIS (English) yang estetik, sangat detil, dan siap pakai untuk generator gambar (seperti Luma, Midjourney, dll). Sertakan instruksi format: "9:16 aspect ratio, vertical portrait shot, macro close-up, extreme detail, soft kitchen lighting, miniature cooking world".
      Sedangkan action_title, voiceover_or_audio, dan key_point ditulis dalam Bahasa Indonesia agar mudah dipahami.
      
      Harap isi part_1_frames, part_2_frames, dan part_3_frames masing-masing dengan tepat 4 adegan detail sesuai pembagian di atas.`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              prompt_part_1: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 1 (Preparation & Chopping, vertical 9:16 aspect ratio)." 
              },
              prompt_part_2: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 2 (Cooking & Seasoning, vertical 9:16 aspect ratio)." 
              },
              prompt_part_3: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 3 (Plating & Serving, vertical 9:16 aspect ratio)." 
              },
              metadata: {
                type: GeminiType.OBJECT,
                properties: {
                  model_gender: { type: GeminiType.STRING, description: "Gender, e.g., 'Wanita' or 'Pria'" },
                  model_age_group: { type: GeminiType.STRING, description: "Age group, e.g., 'Young Adult' or 'Gen Z'" },
                  location: { type: GeminiType.STRING, description: "Location, default 'Dapur Miniatur, Indonesia'" }
                },
                required: ["model_gender", "model_age_group", "location"]
              },
              part_1_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 1 (4 frames, 0-10s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '0.0s - 2.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              part_2_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 2 (4 frames, 10-20s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '10.0s - 12.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              part_3_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 3 (4 frames, 20-30s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '20.0s - 22.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              benefits: {
                type: GeminiType.ARRAY,
                description: "4 main selling points of this product",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    title: { type: GeminiType.STRING },
                    description: { type: GeminiType.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              caption: { 
                type: GeminiType.STRING, 
                description: "Satisfying and engaging social media copywriting caption with hashtags, strictly written in English only." 
              },
              hashtags: { 
                type: GeminiType.ARRAY, 
                items: { type: GeminiType.STRING },
                description: "Unboxing ASMR, mini cooking and miniature hashtags, strictly written in English only." 
              }
            },
            required: ["prompt_part_1", "prompt_part_2", "prompt_part_3", "metadata", "part_1_frames", "part_2_frames", "part_3_frames", "benefits", "caption", "hashtags"]
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
      console.error(`[Server Gemini Mini Cooking Error]`, err);
      res.status(500).json({ error: formatGeminiError(err, "Gagal membuat storyboard mini cooking") });
    }
  });

  // Server-Side Mini Toy Assembly Storyboard and ASMR Generator
  app.post("/api/gemini-mini-toy", async (req, res) => {
    try {
      const { toyName, duration, backgroundStyle, handType, referenceImage } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Sistem belum mendeteksi kunci API (GEMINI_API_KEY). Silakan pasang di setelan aplikasi." 
        });
      }

      if (!toyName) {
        return res.status(400).json({ error: "Nama mainan/model tidak boleh kosong" });
      }

      const activeDuration = parseInt(duration as string) || 10;

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

      const promptText = `Anda adalah seorang ahli sutradara konten video unboxing, rakitan, dan review mainan miniatur/diecast (miniature toy assembly) UGC dan ASMR kreatif kelas dunia, khususnya untuk platform vertical (Shorts/Reels/TikTok).
      
      **TUGAS UTAMA:**
      Buatlah rancangan storyboard video unboxing & perakitan miniatur mainan berikut berformat VERTICAL 9:16 dengan durasi UTAMA 10 DETIK yang padat, cepat (fast-paced/time-lapse), dan kaya efek ASMR:
      - Nama Mainan/Model Miniatur: "${toyName}"
      - Gaya Latar Belakang Studio: "${backgroundStyle || 'Modern Studio dengan Lampu Neon LED'}"
      - Tampilan Tangan (POV 9:16): "${handType || 'Pria (Sarung Tangan Hitam)'}"
      - Durasi Total: ${activeDuration} detik (Video 10 detik berkecepatan tinggi / fast-forwarded motion)

      **SURGICAL LOGIC 8 BARIS (LOGIKA BEDAH MENGUNCI AI 0% -> 100%):**
      Setiap adegan/frame WAJIB mengikuti alur perakitan berurutan secara ketat dari 0% sampai 100%:
      1. [0% UNBOXING & POTONG SEGEL]: Fast unboxing & penyobekan segel plastik boks miniatur ${toyName} dengan pisau cutter mikro.
      2. [15% UNTRAY & PENATAAN PART]: Mengeluarkan komponen mikro (sasis, ban, mesin, baut, knalpot) dan menatanya rapi di atas tray/mat.
      3. [30% SASIS & STRUKTUR INTI]: Merakit sasis tubular / ladder frame / rangka utama hingga kokoh.
      4. [45% MESIN MIKRO & SUSPENSI]: Memasang mesin mikro, suspensi, dan transmisi ke sasis utama.
      5. [60% RODA, REM & KNALPOT]: Memasang roda alloy, ban karet, piringan rem, dan knalpot racing stainless.
      6. [75% BODI FAIRING & PANEL]: Mengunci bodi fairing luar, tangki bensin, jok, dan panel bodi hingga flush presisi.
      7. [90% STIKER DECAL & EMBLEM]: Penempelan stiker decal emblem, badging logo mikro, dan polishing bodi dengan kain mikrofiber.
      8. [100% ENGINE START & SPITFIRE]: Unit 100% jadi bertumpu di paddock stand/display base, tombol starter ditekan, mesin idle, gas diputar hingga knalpot berapi/spit fire.

      - Prompt visual di setiap frame harus ditulis dalam BAHASA INGGRIS (English) yang padat, sangat estetik, dan siap pakai untuk generator AI video (seperti Google Veo, Luma Dream Machine, Midjourney, dll).
      - Sertakan instruksi format pada prompt visual: "9:16 aspect ratio, vertical portrait shot, single continuous full-frame view, macro close-up, extreme detail, fast-paced timelapse assembly, fiery exhaust flames backfire, roaring engine ASMR, futuristic neon studio lighting, miniature toy world, strictly no split screen, no multi-panel, no collage. NEGATIVE PROMPT: watermark, text, signature, logo, brand name, overlay text, typography, writing, split-screen, collage, multi-panel, grid, border, frame, low quality, blur, distortion."
      - Bagian "voiceover_or_audio" berisi kombinasi efek suara ASMR garing (bunyi segel kancing, klik presisi, deru mesin garing gahar "VROOOOOM!", dan letupan api knalpot "POP POP POP!") serta backsound energik.
      - Sedangkan action_title, voiceover_or_audio, dan key_point ditulis dalam Bahasa Indonesia agar mudah dipahami.`;

      const requestParts: any[] = [];

      if (referenceImage && typeof referenceImage === 'string' && referenceImage.includes('base64,')) {
        const matches = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          requestParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }

      if (requestParts.length > 0) {
        requestParts.push({
          text: promptText + `\n\n**SYARAT MUTLAK REFERENCE PHOTO MODE (EXACT MATCH SHAPE & COLOR + SINGLE FULL-FRAME):**
          Gambar/foto referensi telah dilampirkan oleh pengguna. 
          1. Anda WAJIB menganalisis secara mendalam dan mengekstrak BENTUK FISIK, SILUET, LEKUKAN BODI, FAIRING, SKEMA WARNA UTAMA, SKEMA WARNA SEKUNDER, STRIPING/DECAL, BENTUK VELG/BAN, DAN BENTUK KNALPOT dari foto referensi ini secara 100% AKURAT DAN PRESISI.
          2. Seluruh 'visual_prompt' pada SEMUA frame HARUS secara spesifik dan teliti mendeskripsikan bentuk fisik dan perpaduan warna yang PERSIS SAMA DENGAN FOTO REFERENSI INPUT (EXACT PHYSICAL SHAPE & COLOR SCHEME MATCH).
          3. SETIAP FRAME HARUS BERUPA SATU TAMPILAN KAMERA UTUH PENUH (SINGLE CONTINUOUS FULL-FRAME SHOT) TANPA TERBAGI SPLIT-SCREEN / MULTI-PANEL / COLLAGE / STACKED PANELS.
          4. Di akhir setiap 'visual_prompt', WAJIB tambahkan klausa pengunci AI: "SINGLE CONTINUOUS FULL-FRAME SHOT: Unified single 9:16 vertical camera view, strictly no split screen, no multi-panel, no collage. EXACT REFERENCE MATCH: The physical shape, body curves, silhouette, color scheme, livery, exhaust design, and decals MUST BE IDENTICAL to the provided reference input photo." agar hasil video/gambar AI presisi, tidak melenceng, dan tidak terbagi dlm panel/split screen!`
        });
      } else {
        requestParts.push({ text: promptText });
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: requestParts
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              prompt_part_1: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 1 (Unboxing & Sorting, vertical 9:16 aspect ratio)." 
              },
              prompt_part_2: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 2 (Precision Assembly, vertical 9:16 aspect ratio)." 
              },
              prompt_part_3: { 
                type: GeminiType.STRING, 
                description: "Detailed visual prompt in English for Part 3 (Testing & Action Showcase, vertical 9:16 aspect ratio)." 
              },
              metadata: {
                type: GeminiType.OBJECT,
                properties: {
                  model_gender: { type: GeminiType.STRING, description: "Gender, e.g., 'Wanita' or 'Pria'" },
                  model_age_group: { type: GeminiType.STRING, description: "Age group, e.g., 'Young Adult' or 'Gen Z'" },
                  location: { type: GeminiType.STRING, description: "Location, default 'Studio Mainan Miniatur'" }
                },
                required: ["model_gender", "model_age_group", "location"]
              },
              part_1_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 1 (4 frames, 0-10s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '0.0s - 2.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              part_2_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 2 (4 frames, 10-20s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '10.0s - 12.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              part_3_frames: {
                type: GeminiType.ARRAY,
                description: "Sequential frames for Part 3 (4 frames, 20-30s)",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    frame_number: { type: GeminiType.INTEGER },
                    time_range: { type: GeminiType.STRING, description: "Time range, e.g., '20.0s - 22.5s'" },
                    action_title: { type: GeminiType.STRING, description: "Action title in Indonesian" },
                    visual_prompt: { type: GeminiType.STRING, description: "Detailed portrait visual prompt in English" },
                    voiceover_or_audio: { type: GeminiType.STRING, description: "ASMR sounds & music in Indonesian" },
                    key_point: { type: GeminiType.STRING, description: "Key point in Indonesian" }
                  },
                  required: ["frame_number", "time_range", "action_title", "visual_prompt", "voiceover_or_audio", "key_point"]
                }
              },
              benefits: {
                type: GeminiType.ARRAY,
                description: "4 main selling points of this product",
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    title: { type: GeminiType.STRING },
                    description: { type: GeminiType.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              caption: { 
                type: GeminiType.STRING, 
                description: "Satisfying and engaging social media copywriting caption with hashtags, strictly written in English only." 
              },
              hashtags: { 
                type: GeminiType.ARRAY, 
                items: { type: GeminiType.STRING },
                description: "Unboxing ASMR, miniature toy assembly and diecast hashtags, strictly written in English only." 
              }
            },
            required: ["prompt_part_1", "prompt_part_2", "prompt_part_3", "metadata", "part_1_frames", "part_2_frames", "part_3_frames", "benefits", "caption", "hashtags"]
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
      console.error(`[Server Gemini Mini Toy Error]`, err);
      res.status(500).json({ error: formatGeminiError(err, "Gagal membuat storyboard unboxing mainan") });
    }
  });

  // Server-Side Image Generator using gemini-3.1-flash-lite-image with fallback
  app.post("/api/gemini-generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: "Sistem belum mendeteksi kunci API (GEMINI_API_KEY). Silakan pasang di setelan aplikasi." 
        });
      }

      if (!prompt) {
        return res.status(400).json({ error: "Prompt gambar tidak boleh kosong" });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log(`[Server Image Gen] Generating with aspect ratio: ${aspectRatio || "9:16"}`);
      const imageModels = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"];
      let lastErr: any = null;
      let generatedImageBase64: string | null = null;

      for (const imgModel of imageModels) {
        try {
          console.log(`[Server Image Gen] Trying model: ${imgModel}`);
          const response = await ai.models.generateContent({
            model: imgModel,
            contents: {
              parts: [{ text: prompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio || "9:16"
              }
            }
          });

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (generatedImageBase64) break;
        } catch (err: any) {
          console.warn(`[Server Image Gen] Model ${imgModel} failed:`, err);
          lastErr = err;
        }
      }

      if (generatedImageBase64) {
        return res.json({ image: generatedImageBase64 });
      }

      if (lastErr) throw lastErr;
      throw new Error("Gemini AI tidak mengembalikan data gambar.");
    } catch (err: any) {
      console.error(`[Server Image Gen Error]`, err);
      res.status(500).json({ error: formatGeminiError(err, "Gagal membuat gambar AI") });
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
