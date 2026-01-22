
import { NewsItem, ThemeColor } from "../types";

const getThemeColors = (theme: ThemeColor) => {
  switch (theme) {
    case ThemeColor.BLUE:
      return { main: '#1d4ed8', dark: '#1e3a8a' }; 
    case ThemeColor.PURPLE:
      return { main: '#7e22ce', dark: '#581c87' }; 
    case ThemeColor.RED:
    default:
      return { main: '#b91c1c', dark: '#7f1d1d' }; 
  }
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const loadImageWithFallback = async (url: string): Promise<HTMLImageElement | null> => {
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Critical for canvas export
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
    });

    // 1. Local Blobs or Data URLs (Always try these directly first)
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        try {
            return await load(url);
        } catch (e) {
            console.warn("Local image load failed", e);
            return null;
        }
    }

    // 2. WSRV.NL - Excellent image proxy that handles CORS and format conversion (output=png)
    try {
        return await load(`https://wsrv.nl/?url=${encodeURIComponent(url)}&output=png`);
    } catch (e) {
        console.warn("WSRV proxy failed, trying next...", e);
    }

    // 3. AllOrigins - Raw proxy
    try {
        return await load(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    } catch (e) {
        console.warn("AllOrigins proxy failed, trying next...", e);
    }

    // 4. CorsProxy.io
    try {
        return await load(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    } catch (e) {
        console.warn("CorsProxy failed, trying direct...", e);
    }

    // 5. Direct Load (Last resort - likely to fail CORS on canvas if others failed, but worth a try)
    try {
        return await load(url);
    } catch (e) {
        console.error("All image load attempts failed for:", url);
        return null;
    }
};

const getSupportedMimeType = () => {
    const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
};

export const exportCompositedVideo = async (
  item: NewsItem,
  audioUrl: string | null,
  onProgress: (msg: string) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!item.videoUrl) throw new Error("No video URL provided");

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = 720;
      canvas.height = 1280;

      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = item.videoUrl;
      video.muted = false; 
      video.volume = 1.0;
      video.playsInline = true;

      await new Promise((r, rej) => {
        video.onloadedmetadata = r;
        video.onerror = () => rej(new Error("Failed to load video metadata"));
      });

      let overlayImg: HTMLImageElement | null = null;
      if (item.overlayImage) {
        onProgress("Loading image assets...");
        overlayImg = await loadImageWithFallback(item.overlayImage);
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
      }

      const dest = audioCtx.createMediaStreamDestination();
      
      const videoAudioSource = audioCtx.createMediaElementSource(video);
      videoAudioSource.connect(dest);

      let musicSourceNode: AudioBufferSourceNode | null = null;
      if (audioUrl) {
        try {
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            musicSourceNode = audioCtx.createBufferSource();
            musicSourceNode.buffer = audioBuffer;
            musicSourceNode.loop = true;
            musicSourceNode.connect(dest);
            musicSourceNode.start(0);
        } catch (e) {
            console.warn("Failed to load music, proceeding with original audio only.", e);
        }
      }

      const colors = getThemeColors(item.theme);
      const sidePadding = 32;
      const bottomSafeZone = 80; 
      const anchorX = sidePadding;
      
      let subLayout = null;
      if (item.subheadline) {
          ctx.font = `700 ${item.subheadlineSize}px "Oswald", "Arial", sans-serif`;
          const maxSubWidth = canvas.width - (sidePadding * 2);
          const lines = wrapText(ctx, item.subheadline, maxSubWidth);
          const lineHeight = item.subheadlineSize * 1.375; // Approx 44 for 32px
          const paddingY = 24; 
          const boxHeight = (lines.length * lineHeight) + paddingY;
          
          let maxLineWidth = 0;
          lines.forEach(l => {
              const w = ctx.measureText(l).width;
              if (w > maxLineWidth) maxLineWidth = w;
          });

          subLayout = {
              lines,
              lineHeight,
              boxHeight,
              boxWidth: maxLineWidth + 40, 
          };
      }

      ctx.font = `900 ${item.headlineSize}px "Oswald", "Arial Black", sans-serif`;
      const maxHeadWidth = canvas.width - (sidePadding * 2) - 20; 
      const headLines = wrapText(ctx, item.headline || "HEADLINE", maxHeadWidth);
      const headLineHeight = item.headlineSize * 1.166; // Approx 70 for 60px
      const headPaddingY = 30;
      const headBoxHeight = (headLines.length * headLineHeight) + headPaddingY;
      
      let maxHeadLineWidth = 0;
      headLines.forEach(l => {
          const w = ctx.measureText(l).width;
          if (w > maxHeadLineWidth) maxHeadLineWidth = w;
      });

      const headLayout = {
          lines: headLines,
          lineHeight: headLineHeight,
          boxHeight: headBoxHeight,
          boxWidth: maxHeadLineWidth + 50, 
      };

      let currentY = canvas.height - bottomSafeZone;

      let subY = 0;
      if (subLayout) {
          subY = currentY - subLayout.boxHeight;
          currentY = subY - 10; 
      }

      const headY = currentY - headLayout.boxHeight;
      currentY = headY - 10; 

      const badgeHeight = 32;
      const badgeY = currentY - badgeHeight;
      currentY = badgeY - 20; 

      const imgHeight = item.imageHeight || 630;
      const imgWidth = canvas.width; 
      const imgY = currentY - imgHeight;

      const videoStream = canvas.captureStream(30);
      const tracks = [...videoStream.getVideoTracks()];
      
      const audioTracks = dest.stream.getAudioTracks();
      if (audioTracks.length > 0) {
          tracks.push(audioTracks[0]);
      }

      const combinedStream = new MediaStream(tracks);
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: getSupportedMimeType()
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (musicSourceNode) musicSourceNode.stop();
        audioCtx.close();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      recorder.start();
      
      try {
        await video.play();
      } catch (e) {
          console.error("Video play failed", e);
          reject(e);
          return;
      }

      const drawFrame = () => {
        if (video.paused || video.ended) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, startX, startY;

        if (videoRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * videoRatio;
            startX = (canvas.width - drawWidth) / 2;
            startY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / videoRatio;
            startX = 0;
            startY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(video, startX, startY, drawWidth, drawHeight);

        if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 20;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 12; 
            
            const imgRatio = overlayImg.width / overlayImg.height;
            const targetRatio = imgWidth / imgHeight;
            let sx, sy, sWidth, sHeight;
            
            if (imgRatio > targetRatio) {
                sHeight = overlayImg.height;
                sWidth = sHeight * targetRatio;
                sy = 0;
                sx = (overlayImg.width - sWidth) / 2;
            } else {
                sWidth = overlayImg.width;
                sHeight = sWidth / targetRatio;
                sx = 0;
                sy = (overlayImg.height - sHeight) / 2;
            }

            try {
                ctx.drawImage(overlayImg, sx, sy, sWidth, sHeight, 0, imgY, imgWidth, imgHeight);
                ctx.strokeRect(0, imgY, imgWidth, imgHeight); 
            } catch (err) {
                console.warn("Error drawing image frame", err);
            }
            ctx.restore();
        }

        ctx.save();
        ctx.translate(anchorX, badgeY);
        ctx.transform(1, 0, -0.2, 1, 0, 0); 
        
        ctx.fillStyle = colors.main;
        ctx.fillRect(0, 0, 220, badgeHeight);
        
        ctx.transform(1, 0, 0.2, 1, 0, 0); 
        ctx.fillStyle = 'white';
        ctx.font = '900 20px "Oswald", "Arial Black", sans-serif'; 
        ctx.textBaseline = 'middle';
        ctx.fillText('BREAKING NEWS', 15, badgeHeight / 2 + 2);
        ctx.restore();

        ctx.save();
        ctx.translate(anchorX, headY);
        ctx.transform(1, 0, -0.035, 1, 0, 0); 
        
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(0, 0, headLayout.boxWidth, headLayout.boxHeight);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 15, headLayout.boxHeight);

        ctx.fillStyle = 'black';
        ctx.font = `900 ${item.headlineSize}px "Oswald", "Arial Black", sans-serif`;
        ctx.transform(1, 0, 0.035, 1, 0, 0); 
        
        headLayout.lines.forEach((line, i) => {
            const lineY = (i * headLayout.lineHeight) + (item.headlineSize * 0.8) + 20; 
            ctx.fillText(line, 25, lineY);
        });
        ctx.restore();

        if (subLayout && item.subheadline) {
            ctx.save();
            ctx.translate(anchorX, subY);
            ctx.transform(1, 0, -0.035, 1, 0, 0); 

            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 10;

            ctx.fillStyle = colors.dark;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(0, 0, subLayout.boxWidth, subLayout.boxHeight);
            
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'white';
            ctx.font = `700 ${item.subheadlineSize}px "Oswald", "Arial", sans-serif`;
            ctx.transform(1, 0, 0.035, 1, 0, 0); 
            
            subLayout.lines.forEach((line, i) => {
                 const lineY = (i * subLayout.lineHeight) + (item.subheadlineSize * 0.75) + 15;
                 ctx.fillText(line, 20, lineY);
            });
            ctx.restore();
        }

        onProgress(`Processing: ${Math.floor(video.currentTime)}s / ${Math.floor(video.duration)}s`);
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

    } catch (e: any) {
      reject(e);
    }
  });
};
