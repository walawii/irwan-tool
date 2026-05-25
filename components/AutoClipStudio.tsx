import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Youtube, Scissors, TrendingUp, Sparkles, 
  Download, Play, Pause, Layout, Type, Copy, FileVideo, Check, 
  Loader2, Volume2, RefreshCw, AlertTriangle, Gauge, Lightbulb, 
  Share2, Maximize, Sliders, Palette, Video, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type as GeminiType } from '@google/genai';
import { ViewState } from '../types';

interface AutoClipStudioProps {
  onBack: () => void;
}

interface SubtitleWord {
  text: string;
  start: number; // relative to clip start in seconds
  end: number;
}

interface ViralClip {
  number: number;
  clipTitle: string;
  status: 'idle' | 'analyzed' | 'downloading' | 'ready' | 'error';
  startSec: number;
  endSec: number;
  duration: number;
  viralityScore: number;
  whyViral: string;
  hook: string;
  headlines: string;
  captionText: string;
  hashtags: string[];
  subtitles: SubtitleWord[];
}

interface YouTubeAnalysis {
  videoTitle: string;
  recommendedFormat: string;
  clips: ViralClip[];
}

const COBALT_INSTANCES = [
  'https://api.cobalt.tools/api/json',
  'https://cobalt.api.ryuko.space/api/json',
  'https://api.server.cobalt.tools/api/json',
  'https://cobalt-api.kwiateusz.pl/api/json',
  'https://tools.betweenthelines.org/api/json',
  'https://api.cobalt.run/api/json'
];

const PROXIES = [
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
];

export const AutoClipStudio: React.FC<AutoClipStudioProps> = ({ onBack }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<YouTubeAnalysis | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number>(0);
  
  // Video downloader state
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [downloadedVideoUrl, setDownloadedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isUrlCached, setIsUrlCached] = useState<string | null>(null);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackVolume, setPlaybackVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true);

  // Visual customizer settings
  const [selectedLayout, setSelectedLayout] = useState<'fit' | 'fill' | 'splitscreen' | 'headline_padding'>('splitscreen');
  const [subtitleStyle, setSubtitleStyle] = useState<'beast' | 'neon' | 'aesthetic' | 'clean'>('beast');
  const [headlineText, setHeadlineText] = useState('');
  const [headlineColor, setHeadlineColor] = useState('#facc15'); // yellow-400
  const [watermarkText, setWatermarkText] = useState('@irwan_creator');
  const [showWatermark, setShowWatermark] = useState(true);
  const [satisfyingBg, setSatisfyingBg] = useState<'particles' | 'grid' | 'rainbow'>('particles');

  // Manual clip adjustments
  const [customStart, setCustomStart] = useState<number>(0);
  const [customEnd, setCustomEnd] = useState<number>(15);

  // Exporter / Recorder state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // Copyboard indicators
  const [copyCaptionSuccess, setCopyCaptionSuccess] = useState(false);
  const [copyTagsSuccess, setCopyTagsSuccess] = useState(false);

  // Refs for element interaction
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const satisfyingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  const activeClip = analysisResult?.clips[selectedClipIndex] || null;

  // Initialize custom start/end when clip selection changes
  useEffect(() => {
    if (activeClip) {
      setCustomStart(activeClip.startSec);
      setCustomEnd(activeClip.endSec);
      setHeadlineText(activeClip.headlines || activeClip.clipTitle);
    }
  }, [selectedClipIndex, activeClip]);

  // Extract YouTube ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*|.*shorts\/([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && (match[7]?.length === 11)) ? match[7] : (match && (match[8]?.length === 11)) ? match[8] : null;
  };

  // Run Cobalt Downloader to download the actual MP4
  const handleDownloadVideo = async (targetUrl: string, clipId: string) => {
    if (!targetUrl) return;
    setVideoError(null);
    setDownloadProgress('Menghubungkan ke server pengunduhan video...');

    const requestBody = {
      url: targetUrl,
      vQuality: '720',
      vCodec: 'h264',
      filenamePattern: 'classic',
      isAudioOnly: false,
      disableMetadata: true
    };

    const tryInstance = async (apiUrl: string) => {
      const methods = [
        () => fetch(apiUrl, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }),
        () => fetch(PROXIES[0](apiUrl), {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      ];

      try {
        const response = await Promise.race(methods.map(m => m().catch(() => ({ ok: false } as Response))));
        if (response && response.ok) {
          const data = await response.json();
          if (['stream', 'redirect', 'tunnel', 'picker'].includes(data.status) || data.url) {
            let directUrl = data.url;
            if (data.status === 'picker' && data.picker && data.picker.length > 0) {
              directUrl = data.picker[0].url;
            }
            return directUrl;
          }
        }
      } catch (err) {
        return null;
      }
      return null;
    };

    try {
      // Race over first 3
      const initialInstances = COBALT_INSTANCES.slice(0, 3);
      const result = await Promise.any(initialInstances.map(url => 
        tryInstance(url).then(res => {
          if (res) return res;
          throw new Error('fail');
        })
      ));

      if (result) {
        setDownloadedVideoUrl(result);
        setIsUrlCached(targetUrl);
        setDownloadProgress('');
        return;
      }
    } catch (e) {
      // Fallback sequential
      for (const apiUrl of COBALT_INSTANCES) {
        setDownloadProgress(`Mencoba jalur alternatif (${apiUrl.replace('https://', '').split('/')[0]})...`);
        const result = await tryInstance(apiUrl);
        if (result) {
          setDownloadedVideoUrl(result);
          setIsUrlCached(targetUrl);
          setDownloadProgress('');
          return;
        }
      }
    }

    setVideoError('Gagal mengunduh file video raw dari YouTube. Kami akan mensimulasikan preview berkualitas tinggi dengan Canvas Particle Studio.');
    setDownloadProgress('');
  };

  // Run Gemini Virality Analyzer
  const handleAnalyzeVirality = async () => {
    const videoId = getYouTubeId(youtubeUrl);
    if (!videoId) {
      alert('Tolong masukkan link YouTube atau YouTube Shorts yang valid.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setDownloadedVideoUrl(null);
    setVideoError(null);
    setExportedVideoUrl(null);

    // Call Cobalt download parallelly
    handleDownloadVideo(youtubeUrl, videoId);

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error('API Key tidak ditemukan. Pastikan API Key diisi di menu Settings.');
      }

      const ai = new GoogleGenAI({ apiKey });

      const promptText = `
        Analisis video YouTube berikut ini: URL=${youtubeUrl} , ID=${videoId}.
        
        Tugas Anda adalah:
        1. Temukan 3 klip terpisah berdurasi 15-30 detik yang paling viral dan memiliki momentum tinggi (Hook luar biasa, Kontroversi, Lucu, Insight terdalam, dll).
        2. Hitung statistik virality-score (skala 1-100) dan berikan analisis taktis "Kenapa viral" (whyViral) dalam Bahasa Indonesia yang persuasif.
        3. Buat naskah Subtitle dinamis per kata/per frase (synchronized subtitles) untuk bagian klip tersebut agar keren ditaruh dipalung bawah layar video 9:16.
        4. Tulis deskripsi social caption copywriting penarik engagement lengkap dengan 5 tagar modern.
        
        Skema output JSON WAJIB sesuai rancangan berikut tanpa markdown or code block formatting di luar kerangka JSON:
        {
          "videoTitle": "Judul Video Asli di sini",
          "recommendedFormat": "Format layout yang disarankan (Portrait 9:16)",
          "clips": [
            {
              "number": 1,
              "clipTitle": "Judul deskriptif klip 1 (misalnya: Kebenaran Mengejutkan tentang AI)",
              "startSec": 10,
              "endSec": 28,
              "duration": 18,
              "viralityScore": 95,
              "whyViral": "Alasan detail kenapa klip ini viral dalam Bahasa Indonesia...",
              "hook": "Kalimat pembuka hook 3 detik pertama",
              "headlines": "HEADLINE BESAR ATAS LAYAR",
              "captionText": "Copywriting caption media sosial di sini...",
              "hashtags": ["tagar1", "tagar2", "tagar3", "tagar4", "tagar5"],
              "subtitles": [
                {"text": "Apakah", "start": 0, "end": 0.8},
                {"text": "kamu tahu", "start": 0.8, "end": 1.5},
                {"text": "bahwa AI", "start": 1.5, "end": 2.2},
                {"text": "akan mengubah", "start": 2.2, "end": 3.0},
                {"text": "segalanya?", "start": 3.0, "end": 4.2}
              ]
            }
          ]
        }

        Catatan penting:
        Timestamps harus logis (misalnya mulai dari 10 detik, usahakan tidak melebihi 180 detik jika durasi panjang). Sebar 3 klip tersebut di awal, tengah, dan highlight video.
        Bila Anda tidak menemukan data video asli, Anda harus melakukan prediksi kreatif berdasarkan kata kunci yang ada di URL, judul, atau asumsikan topik berbobot tinggi.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: "user",
            parts: [
              { text: promptText }
            ]
          }
        ],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              videoTitle: { type: GeminiType.STRING },
              recommendedFormat: { type: GeminiType.STRING },
              clips: {
                type: GeminiType.ARRAY,
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    number: { type: GeminiType.INTEGER },
                    clipTitle: { type: GeminiType.STRING },
                    startSec: { type: GeminiType.INTEGER },
                    endSec: { type: GeminiType.INTEGER },
                    duration: { type: GeminiType.INTEGER },
                    viralityScore: { type: GeminiType.INTEGER },
                    whyViral: { type: GeminiType.STRING },
                    hook: { type: GeminiType.STRING },
                    headlines: { type: GeminiType.STRING },
                    captionText: { type: GeminiType.STRING },
                    hashtags: {
                      type: GeminiType.ARRAY,
                      items: { type: GeminiType.STRING }
                    },
                    subtitles: {
                      type: GeminiType.ARRAY,
                      items: {
                        type: GeminiType.OBJECT,
                        properties: {
                          text: { type: GeminiType.STRING },
                          start: { type: GeminiType.NUMBER },
                          end: { type: GeminiType.NUMBER }
                        },
                        required: ["text", "start", "end"]
                      }
                    }
                  },
                  required: ["number", "clipTitle", "startSec", "endSec", "duration", "viralityScore", "whyViral", "hook", "headlines", "captionText", "hashtags", "subtitles"]
                }
              }
            },
            required: ["videoTitle", "recommendedFormat", "clips"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error('Tidak ada respon analitik dari Gemini.');

      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: YouTubeAnalysis = JSON.parse(cleanJson);
      
      // Complete initial status on clips
      const finalClips = parsed.clips.map(c => ({
        ...c,
        status: 'analyzed' as const
      }));

      setAnalysisResult({
        ...parsed,
        clips: finalClips
      });
      setSelectedClipIndex(0);

    } catch (error: any) {
      console.error('Error analyzing YouTube virality:', error);
      alert(`Gagal menganalisis viralitas: ${error.message || 'Harap coba lagi.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Video playback range constraint & loops
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);

      // Check range clamp
      if (current < customStart) {
        video.currentTime = customStart;
      }
      if (current >= customEnd) {
        if (isLooping) {
          video.currentTime = customStart;
          video.play().catch(() => {});
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (video.currentTime < customStart) {
        video.currentTime = customStart;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [downloadedVideoUrl, customStart, customEnd, isLooping]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= customEnd || video.currentTime < customStart) {
        video.currentTime = customStart;
      }
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // satisfying background particle drawing loop when splitscreen is activated
  useEffect(() => {
    const canvas = satisfyingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 360;
    canvas.height = 640;

    let particles: Array<{ x: number; y: number; size: number; speedY: number; color: string; speedX: number }> = [];
    
    // Create random stars & flowing digital particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 1,
          speedY: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 1.5,
          color: `hsla(${Math.random() * 360}, 80%, 65%, ${Math.random() * 0.4 + 0.3})`
        });
      }
    };
    initParticles();

    // Satisfying grid loop
    let gridOffset = 0;

    const render = () => {
      ctx.fillStyle = '#090d16'; // deep dark space
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (satisfyingBg === 'particles') {
        // Draw floating dynamic loops
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < 0 || p.x > canvas.width) {
            p.speedX *= -1;
          }
        });
      } else if (satisfyingBg === 'grid') {
        // Neon synth grid lines
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)'; // pink neon
        ctx.lineWidth = 1.5;
        gridOffset = (gridOffset + 1) % 40;

        // Vertical perspective perspective
        const horizon = canvas.height * 0.3;
        for (let i = -10; i <= 20; i++) {
          const xTop = (canvas.width / 2) + (i * 10);
          const xBottom = (canvas.width / 2) + (i * 80);
          ctx.beginPath();
          ctx.moveTo(xTop, horizon);
          ctx.lineTo(xBottom, canvas.height);
          ctx.stroke();
        }

        // Horizontal scrolling lines
        for (let y = horizon; y <= canvas.height; y += 25) {
          const currentY = y + (gridOffset * 0.5);
          if (currentY <= canvas.height) {
            const opacity = ((currentY - horizon) / (canvas.height - horizon)) * 0.4;
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // blue glow
            ctx.beginPath();
            ctx.moveTo(0, currentY);
            ctx.lineTo(canvas.width, currentY);
            ctx.stroke();
          }
        }
      } else {
        // Rainbow fluid gradient rings
        const time = Date.now() * 0.001;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(time) * 50, canvas.height / 2 + Math.cos(time) * 50, 10,
          canvas.width / 2, canvas.height / 2, 200
        );
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, '#090d16');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [satisfyingBg]);

  // Sync volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = playbackVolume;
    }
  }, [playbackVolume]);

  // Determine active subtitle word based on local range timestamp offset
  const getActiveSubtitle = (): string => {
    if (!activeClip || !activeClip.subtitles) return '';
    const relTime = currentTime - customStart;
    
    // Find matching word
    const match = activeClip.subtitles.find(s => relTime >= s.start && relTime <= s.end);
    return match ? match.text : '';
  };

  // Helper to copy data
  const handleCopyCaption = () => {
    if (!activeClip) return;
    navigator.clipboard.writeText(activeClip.captionText);
    setCopyCaptionSuccess(true);
    setTimeout(() => setCopyCaptionSuccess(false), 2000);
  };

  const handleCopyTags = () => {
    if (!activeClip) return;
    const formatted = activeClip.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
    navigator.clipboard.writeText(formatted);
    setCopyTagsSuccess(true);
    setTimeout(() => setCopyTagsSuccess(false), 2000);
  };

  // Generate vertical video via browser canvas recorder
  const handleExportCompositedClip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportedVideoUrl(null);
    setExportProgress('Mempersiapkan render kanvas 9:16...');

    try {
      const renderCanvas = document.createElement('canvas');
      const renderCtx = renderCanvas.getContext('2d');
      if (!renderCtx) throw new Error('Could not create Canvas rendering context.');

      // Standard vertical video frame setup
      renderCanvas.width = 720;
      renderCanvas.height = 1280;

      const video = videoRef.current;
      const satisfyingCanvas = satisfyingCanvasRef.current;

      // Ensure sources are loaded
      if (!video) {
        throw new Error('Video raw tidak ter-load sebagai visual source.');
      }

      // Check audio elements
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const dest = audioCtx.createMediaStreamDestination();
      const videoSource = audioCtx.createMediaElementSource(video);
      videoSource.connect(dest);
      videoSource.connect(audioCtx.destination); // also monitor locally

      const videoStream = renderCanvas.captureStream(30);
      const videoTracks = videoStream.getVideoTracks();
      const audioTracks = dest.stream.getAudioTracks();

      const combinedTracks = [...videoTracks];
      if (audioTracks.length > 0) {
        combinedTracks.push(audioTracks[0]);
      }

      const combinedStream = new MediaStream(combinedTracks);
      
      const getSupportedMime = () => {
        const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
        for (const t of types) {
          if (MediaRecorder.isTypeSupported(t)) return t;
        }
        return 'video/webm';
      };

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: getSupportedMime()
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        audioCtx.close();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        setExportedVideoUrl(downloadUrl);
        setIsExporting(false);
        setExportProgress('');
      };

      // Reset to start offset before rendering
      video.currentTime = customStart;
      setIsPlaying(true);
      await video.play();
      recorder.start();

      const renderLoop = () => {
        if (video.paused || video.ended || video.currentTime >= customEnd) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          video.pause();
          setIsPlaying(false);
          return;
        }

        // Draw satisfying backdrops or full canvas
        renderCtx.fillStyle = '#060814';
        renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

        // Calculate dynamic layouts
        if (selectedLayout === 'fit') {
          // Centered horizontal video scale to fit
          const videoRatio = video.videoWidth / video.videoHeight;
          const drawW = renderCanvas.width;
          const drawH = drawW / videoRatio;
          const drawY = (renderCanvas.height - drawH) / 2;
          renderCtx.drawImage(video, 0, drawY, drawW, drawH);
        } else if (selectedLayout === 'fill') {
          // Fill layout (zoomed 9:16)
          const videoRatio = video.videoWidth / video.videoHeight;
          const targetRatio = renderCanvas.width / renderCanvas.height;
          let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;
          
          if (videoRatio > targetRatio) {
            sWidth = sHeight * targetRatio;
            sx = (video.videoWidth - sWidth) / 2;
          } else {
            sHeight = sWidth / targetRatio;
            sy = (video.videoHeight - sHeight) / 2;
          }
          renderCtx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, renderCanvas.width, renderCanvas.height);
        } else if (selectedLayout === 'splitscreen') {
          // Split Screen Layout
          // Bottom half: Satisfying interactive loop
          if (satisfyingCanvas) {
            renderCtx.drawImage(satisfyingCanvas, 0, 0, satisfyingCanvas.width, satisfyingCanvas.height, 0, renderCanvas.height / 2, renderCanvas.width, renderCanvas.height / 2);
          } else {
            renderCtx.fillStyle = '#1e1b4b';
            renderCtx.fillRect(0, renderCanvas.height / 2, renderCanvas.width, renderCanvas.height / 2);
          }

          // Top half: Video frame scaled and cropped
          const topH = renderCanvas.height / 2;
          const videoRatio = video.videoWidth / video.videoHeight;
          const targetRatio = renderCanvas.width / topH;
          let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

          if (videoRatio > targetRatio) {
            sWidth = sHeight * targetRatio;
            sx = (video.videoWidth - sWidth) / 2;
          } else {
            sHeight = sWidth / targetRatio;
            sy = (video.videoHeight - sHeight) / 2;
          }
          renderCtx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, renderCanvas.width, topH);

          // Divider bar line
          renderCtx.fillStyle = '#facc15';
          renderCtx.fillRect(0, topH - 4, renderCanvas.width, 8);
        } else if (selectedLayout === 'headline_padding') {
          // Centralized bordered box with solid padding
          renderCtx.fillStyle = '#0f172a';
          renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

          const innerH = 650;
          const innerY = (renderCanvas.height - innerH) / 2;
          
          // Draw bordered background
          renderCtx.strokeStyle = 'rgba(255,255,255,0.15)';
          renderCtx.lineWidth = 4;
          renderCtx.strokeRect(20, innerY, renderCanvas.width - 40, innerH);

          // Video
          const videoRatio = video.videoWidth / video.videoHeight;
          const drawW = renderCanvas.width - 40;
          const drawH = drawW / videoRatio;
          const drawY = innerY + (innerH - drawH) / 2;
          renderCtx.drawImage(video, 20, drawY, drawW, drawH);
        }

        // Draw top layout Headline Text Overlay
        if (headlineText) {
          renderCtx.fillStyle = headlineColor;
          renderCtx.font = 'bold 44px "Inter", "Arial Black", sans-serif';
          renderCtx.textAlign = 'center';
          renderCtx.textBaseline = 'top';
          renderCtx.shadowColor = 'rgba(0,0,0,0.8)';
          renderCtx.shadowBlur = 10;
          renderCtx.fillText(headlineText.toUpperCase(), renderCanvas.width / 2, 80);
          renderCtx.shadowBlur = 0;
        }

        // Draw synchronized glowing Subtitle overlays dipalung bawah
        const subRelTime = video.currentTime - customStart;
        let wordStr = '';
        if (activeClip?.subtitles) {
          const match = activeClip.subtitles.find(s => subRelTime >= s.start && subRelTime <= s.end);
          if (match) wordStr = match.text;
        }

        if (wordStr) {
          renderCtx.save();
          renderCtx.textAlign = 'center';
          renderCtx.textBaseline = 'middle';

          const subtitleY = renderCanvas.height - 200;

          if (subtitleStyle === 'beast') {
            // High impact yellow with heavy stroke
            renderCtx.strokeStyle = 'black';
            renderCtx.lineWidth = 14;
            renderCtx.lineJoin = 'miter';
            renderCtx.miterLimit = 2;
            renderCtx.fillStyle = '#facc15';
            renderCtx.font = '900 68px "Arial Black", sans-serif';
            
            renderCtx.shadowColor = 'rgba(0,0,0,0.6)';
            renderCtx.shadowBlur = 12;
            renderCtx.strokeText(wordStr.toUpperCase(), renderCanvas.width / 2, subtitleY);
            renderCtx.fillText(wordStr.toUpperCase(), renderCanvas.width / 2, subtitleY);
          } else if (subtitleStyle === 'neon') {
            // Cyber pink with neon glow
            renderCtx.shadowColor = '#f43f5e';
            renderCtx.shadowBlur = 25;
            renderCtx.fillStyle = '#ffffff';
            renderCtx.font = '900 64px "Impact", sans-serif';
            renderCtx.fillText(wordStr.toUpperCase(), renderCanvas.width / 2, subtitleY);
            
            renderCtx.shadowBlur = 0;
          } else if (subtitleStyle === 'aesthetic') {
            // Glassmorphic clean plate
            renderCtx.font = 'bold 38px "Inter", sans-serif';
            const textWidth = renderCtx.measureText(wordStr).width;
            
            renderCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            renderCtx.beginPath();
            renderCtx.roundRect(renderCanvas.width / 2 - textWidth / 2 - 25, subtitleY - 40, textWidth + 50, 80, 20);
            renderCtx.fill();

            renderCtx.fillStyle = '#38bdf8'; // light blue
            renderCtx.fillText(wordStr, renderCanvas.width / 2, subtitleY);
          } else {
            // Clean stark white with subtle shadow
            renderCtx.shadowColor = 'rgba(0,0,0,0.5)';
            renderCtx.shadowBlur = 6;
            renderCtx.fillStyle = '#ffffff';
            renderCtx.font = '900 48px "Inter", sans-serif';
            renderCtx.fillText(wordStr, renderCanvas.width / 2, subtitleY);
          }
          renderCtx.restore();
        }

        // Watermark placement
        if (showWatermark && watermarkText) {
          renderCtx.fillStyle = 'rgba(255,255,255,0.4)';
          renderCtx.font = '16px "Inter", monospace';
          renderCtx.textAlign = 'right';
          renderCtx.fillText(watermarkText, renderCanvas.width - 40, renderCanvas.height - 50);
        }

        // Render progress callback
        const currentSec = Math.floor(video.currentTime - customStart);
        const totalSec = Math.floor(customEnd - customStart);
        setExportProgress(`Me-render video: ${currentSec}s / ${totalSec}s (${Math.min(99, Math.floor((currentSec / totalSec) * 100))}%)...`);

        requestAnimationFrame(renderLoop);
      };

      // Start render flow recursion
      renderLoop();

    } catch (e: any) {
      console.error('Export composition failed:', e);
      alert(`Gagal me-render video: ${e.message}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter">
      {/* Header Bar */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-6 py-4 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Scissors className="w-5 h-5 text-red-500" /> Auto-Clip Creator & Virality Spotter
            </h1>
            <p className="text-xs text-slate-400">Potong klip YouTube otomatis ke 9:16 dan hitung algoritma viralitasnya.</p>
          </div>
        </div>
        <div className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full font-mono uppercase tracking-widest font-bold">
          Beta Studio • v2.0
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* URL Input & Setup Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Action Control Box */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
              <Youtube className="w-5 h-5 text-red-500" /> Analisis Link YouTube
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ketikkan atau tempel tautan video YouTube standar, video Shorts, atau podcast di bawah ini untuk memulai kurasi otomatis.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">YouTube Video Link</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Sample Quick Links */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=3S1I25f1l1Q')}
                  className="text-[10px] bg-slate-950 border border-slate-800 hover:border-red-500/30 px-2 py-1 rounded text-slate-400 hover:text-white transition-all"
                >
                  ⚡ Podcast Sample
                </button>
                <button 
                  onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                  className="text-[10px] bg-slate-950 border border-slate-800 hover:border-red-500/30 px-2 py-1 rounded text-slate-400 hover:text-white transition-all"
                >
                  ⚡ Tech Video
                </button>
              </div>

              {/* Start Button */}
              <button
                onClick={handleAnalyzeVirality}
                disabled={isAnalyzing || !youtubeUrl}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis dengan Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Analisis & Temukan Angle Viral
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Analysis Results / Clip Curations */}
          <AnimatePresence mode="wait">
            {analysisResult && (
              <motion.section 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Kurasi Klip Viral ({analysisResult.clips.length})
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">{analysisResult.videoTitle}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {analysisResult.clips.map((clip, index) => (
                    <button
                      key={clip.number}
                      onClick={() => setSelectedClipIndex(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative flex flex-col gap-2 ${
                        selectedClipIndex === index 
                          ? 'bg-slate-900 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          KLIP 0{clip.number}
                        </span>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5 text-[10px]">
                          <Gauge className="w-3 h-3 text-emerald-400" />
                          <span className="font-bold">{clip.viralityScore}% Viral</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-slate-100 group-hover:text-red-400 transition-colors line-clamp-1">
                        {clip.clipTitle}
                      </h4>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1 pt-2 border-t border-slate-850/60">
                        <span>Durasi: {clip.duration}s</span>
                        <span>Rentang: {clip.startSec}s - {clip.endSec}s</span>
                      </div>
                    </button>
                  ))}
                </div>

                {activeClip && (
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl mt-4 text-xs space-y-2">
                    <h5 className="font-bold text-amber-400 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Analisis Momentum:
                    </h5>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-medium">
                      {activeClip.whyViral}
                    </p>
                    <div className="text-[10px] mt-1 text-red-400 italic">
                      <span className="font-bold not-italic font-mono uppercase bg-red-400/10 text-red-400 border border-red-400/20 text-[9px] px-1 py-0.5 rounded mr-1">Hook awal</span>
                      "{activeClip.hook}"
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

        </div>

        {/* Live Studio Layout Preview Panel */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl p-5 relative min-h-[500px]">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Layout className="w-4 h-4 text-purple-400" /> Live Canvas Preview 9:16
            </h2>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
              WYSIWYG Viewer
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-2">
            
            {/* Download notification overlays */}
            {downloadProgress && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20 rounded-3xl">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                <p className="text-sm text-slate-200 font-bold mb-1">{downloadProgress}</p>
                <span className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Cobalt sedang memproses unduhan audio video asli untuk preview live canvas.
                </span>
              </div>
            )}

            {/* Video container framing 9:16 aspect ratio */}
            <div 
              ref={previewContainerRef}
              className="relative aspect-[9/16] bg-slate-950 w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border-2 border-slate-800/80 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center"
            >
              {/* Background gameplay/particles loop in splitscreen layout */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <canvas 
                  ref={satisfyingCanvasRef} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    selectedLayout === 'splitscreen' ? 'opacity-100' : 'opacity-0'
                  }`} 
                />
              </div>

              {/* Actual Video Player container */}
              {downloadedVideoUrl ? (
                <div className={`absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none ${
                  selectedLayout === 'fit' ? 'h-full aspect-[16/9] m-auto' :
                  selectedLayout === 'fill' ? 'w-full h-full object-cover' :
                  selectedLayout === 'splitscreen' ? 'top-0 h-1/2 w-full border-b-[4px] border-yellow-400' :
                  'h-[200px] top-[140px] w-[calc(100%-40px)] left-5 border border-white/20'
                }`}>
                  <video
                    ref={videoRef}
                    src={downloadedVideoUrl}
                    className="w-full h-full object-cover pointer-events-none"
                    playsInline
                    muted={false}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 z-10">
                  <Video className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-xs text-slate-400 leading-normal">
                    Belum ada video ter-load. Klik <b className="text-red-500">Analisis</b> untuk melakukan download instan.
                  </p>
                </div>
              )}

              {/* Interactive Subtitles / Captions sync */}
              <div className="absolute bottom-[80px] left-0 w-full text-center px-4 z-20 pointer-events-none transition-all">
                {getActiveSubtitle() ? (
                  <div className={`inline-block select-none transform transition-all scale-105 ${
                    subtitleStyle === 'beast' 
                      ? 'font-black tracking-tighter text-3xl text-yellow-400 uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] scale-110 px-2' 
                      : subtitleStyle === 'neon' 
                      ? 'font-black tracking-wider text-2xl text-white drop-shadow-[0_0_20px_#f43f5e] font-sans italic' 
                      : subtitleStyle === 'aesthetic' 
                      ? 'bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-sky-400 font-bold px-4 py-2.5 rounded-full text-base font-sans font-semibold' 
                      : 'text-white font-heavy text-xl font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                  }`}>
                    {subtitleStyle === 'beast' ? getActiveSubtitle().toUpperCase() : getActiveSubtitle()}
                  </div>
                ) : (
                  activeClip && <span className="text-[10px] text-slate-600 font-mono">menunggu transkripsi...</span>
                )}
              </div>

              {/* Dynamic Headline Header */}
              {headlineText && (
                <div className="absolute top-8 left-0 w-full text-center px-4 z-20 pointer-events-none">
                  <h4 
                    style={{ color: headlineColor }}
                    className="font-black text-sm tracking-tight leading-snug drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] uppercase text-center"
                  >
                    {headlineText}
                  </h4>
                </div>
              )}

              {/* Subtle Watermark */}
              {showWatermark && watermarkText && (
                <div className="absolute bottom-4 right-4 text-[9px] text-white/40 font-mono z-20 select-none">
                  {watermarkText}
                </div>
              )}

              {/* Frame borders and decoration */}
              <div className="absolute inset-0 border-[6px] border-slate-900 pointer-events-none z-30"></div>
            </div>

          </div>

          {/* Quick playback control buttons */}
          {downloadedVideoUrl && (
            <div className="mt-4 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between gap-4">
              <button 
                onClick={togglePlay}
                className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              
              {/* Timeline duration feedback */}
              <div className="flex-1 text-center font-mono text-[10px] text-slate-400">
                <span>Time: {currentTime.toFixed(1)}s / {duration ? duration.toFixed(1) : '0'}s</span>
                <div className="text-[9px] text-amber-500 mt-1">Capped Loop: {customStart}s - {customEnd}s</div>
              </div>

              {/* Mute controller toggle */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={playbackVolume}
                  onChange={(e) => setPlaybackVolume(parseFloat(e.target.value))}
                  className="w-14 accent-red-500 bg-slate-800 h-1 rounded-lg outline-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Video error fallback notification */}
          {videoError && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-400 flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>{videoError}</span>
            </div>
          )}

        </div>

        {/* Customization Options & Script board */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Layout customizer */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-400" /> Pengaturan Klip & Layout
            </h3>

            <div className="space-y-4">
              {/* Layout option */}
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">9:16 Framing Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSelectedLayout('splitscreen')}
                    className={`py-2 px-2 rounded-xl text-center border text-[10px] font-bold block transition-all ${
                      selectedLayout === 'splitscreen' 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-black' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    📺 ASMR Split Screen
                  </button>
                  <button 
                    onClick={() => setSelectedLayout('fill')}
                    className={`py-2 px-2 rounded-xl text-center border text-[10px] font-bold block transition-all ${
                      selectedLayout === 'fill' 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-black' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    ✂️ Full Portrait Crop
                  </button>
                  <button 
                    onClick={() => setSelectedLayout('headline_padding')}
                    className={`py-2 px-2 rounded-xl text-center border text-[10px] font-bold block transition-all ${
                      selectedLayout === 'headline_padding' 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-black' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    📰 News Frame
                  </button>
                  <button 
                    onClick={() => setSelectedLayout('fit')}
                    className={`py-2 px-2 rounded-xl text-center border text-[10px] font-bold block transition-all ${
                      selectedLayout === 'fit' 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-black' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    🔳 Letterbox Fit
                  </button>
                </div>
              </div>

              {/* Subtitle presets */}
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Aesthetic Subtitle Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSubtitleStyle('beast')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold block transition-all ${
                      subtitleStyle === 'beast' 
                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    🔥 MrBeast Slap (Bold)
                  </button>
                  <button 
                    onClick={() => setSubtitleStyle('neon')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold block transition-all ${
                      subtitleStyle === 'neon' 
                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    💖 Tokyo Neon (Glow)
                  </button>
                  <button 
                    onClick={() => setSubtitleStyle('aesthetic')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold block transition-all ${
                      subtitleStyle === 'aesthetic' 
                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    💬 Glassmorphic minimal
                  </button>
                  <button 
                    onClick={() => setSubtitleStyle('clean')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold block transition-all ${
                      subtitleStyle === 'clean' 
                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    🌿 Stark White Clean
                  </button>
                </div>
              </div>

              {/* Dynamic split screen visual theme */}
              {selectedLayout === 'splitscreen' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Satisfying Background</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['particles', 'grid', 'rainbow'].map((bg) => (
                      <button 
                        key={bg}
                        onClick={() => setSatisfyingBg(bg as any)}
                        className={`text-[9px] py-1.5 px-1 bg-slate-950 hover:bg-slate-900 border text-center rounded-lg uppercase tracking-wider font-bold block transition-all ${
                          satisfyingBg === bg ? 'border-amber-400 text-amber-400' : 'border-slate-800 text-slate-500'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Range adjustment sliders */}
              {activeClip && (
                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>Atur Manual Timestamp</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Start: {customStart}s</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max={duration ? Math.floor(duration - 1) : 100}
                        value={customStart}
                        onChange={(e) => setCustomStart(parseInt(e.target.value))}
                        className="w-full accent-red-500 h-1 bg-slate-800 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>End: {customEnd}s (Durasi : {customEnd - customStart}s)</span>
                      </div>
                      <input 
                        type="range"
                        min={customStart + 2}
                        max={duration ? Math.floor(duration) : 120}
                        value={customEnd}
                        onChange={(e) => setCustomEnd(parseInt(e.target.value))}
                        className="w-full accent-red-500 h-1 bg-slate-800 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Social Media Package & Copywriter */}
          <AnimatePresence>
            {activeClip && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" /> Viral Distribution Package
                </h3>

                <div className="space-y-4">
                  {/* Headline Customizer */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Headline Utama Video</label>
                    <input 
                      type="text"
                      value={headlineText}
                      onChange={(e) => setHeadlineText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-purple-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  {/* Copywriting */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Description / Caption</label>
                      <button 
                        onClick={handleCopyCaption}
                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 font-semibold"
                      >
                        {copyCaptionSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copyCaptionSuccess ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <textarea 
                      readOnly
                      value={activeClip.captionText}
                      className="w-full h-20 bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl p-2.5 text-xs text-slate-450 leading-relaxed outline-none resize-none font-sans"
                    />
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Hashtags Paket</label>
                      <button 
                        onClick={handleCopyTags}
                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 font-semibold"
                      >
                        {copyTagsSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copyTagsSuccess ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                      {activeClip.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-purple-400 font-mono font-bold">
                          {h.startsWith('#') ? h : `#${h}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Exporter Exporter controls */}
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    {exportedVideoUrl ? (
                      <div className="space-y-2">
                        <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>Video 9:16 berhasil di-render di browser Anda! Klik simpan di bawah untuk menyimpannya.</span>
                        </div>
                        <a 
                          href={exportedVideoUrl}
                          download={`autoclip-${selectedClipIndex+1}.webm`}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4 text-slate-900" /> Simpan Ke Perangkat (.WebM)
                        </a>
                      </div>
                    ) : (
                      <button 
                        onClick={handleExportCompositedClip}
                        disabled={isExporting || !downloadedVideoUrl}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
                        {isExporting ? 'Me-render...' : 'Render & Simpan Video 9:16'}
                      </button>
                    )}
                    {isExporting && (
                      <div className="text-[10px] font-mono text-purple-400 mt-2 text-center">
                        {exportProgress}
                      </div>
                    )}
                  </div>

                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>

      </main>
    </div>
  );
};

export default AutoClipStudio;
