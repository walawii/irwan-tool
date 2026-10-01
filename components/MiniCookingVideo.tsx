import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Copy, Check, Info, FileText, Music, Hash, Radio, 
  Heart, HelpCircle, Eye, FileJson, Download, ImageIcon, RefreshCw, LayoutGrid, 
  CheckCircle2, Sliders, User, MapPin, Zap, Shield, Activity, ChevronRight, Play,
  ChevronLeft, Pause, Volume2, Utensils, Flame, Scissors, Share2
} from 'lucide-react';

interface FrameDetail {
  frame_number: number;
  time_range: string;
  action_title: string;
  visual_prompt: string;
  voiceover_or_audio: string;
  key_point: string;
}

interface StoryboardData {
  prompt_part_1: string;
  prompt_part_2: string;
  prompt_part_3: string;
  metadata: {
    model_gender: string;
    model_age_group: string;
    location: string;
  };
  part_1_frames: FrameDetail[];
  part_2_frames: FrameDetail[];
  part_3_frames: FrameDetail[];
  benefits: Array<{ title: string; description: string }>;
  caption: string;
  hashtags: string[];
}

interface MiniCookingVideoProps {
  onBack: () => void;
}

// Preset High-Fidelity Data for "Beef Wellington (Tiny version)" to match the video
const BEEF_WELLINGTON_PRESET: StoryboardData = {
  prompt_part_1: "Aesthetic 9:16 close up vertical video of a miniature kitchen setting with luxury glamour style. Soft ambient lighting, white marble countertop, mini wooden cutting board. Delicate female hands wearing elegant white lace apron sleeves carefully washing and chopping a microscopic 1cm cube of fresh beef tenderloin with a tiny 2cm metal knife. Extremely detailed textures, macro lens focus.",
  prompt_part_2: "Satisfying 9:16 vertical video. Searing the tiny 1cm beef cube inside a microscopic golden coin-sized copper frying pan on a candle-heated mini stove. The tiny beef sizzling with real oil bubbles. Elegant female hands using a pair of microscopic silver tweezers to turn the beef over. Sprinkling tiny grains of salt onto the beef, glamour aesthetic.",
  prompt_part_3: "Extreme close up 9:16 vertical macro shot. Wrapping the cooked micro beef tenderloin inside a miniature golden-brown puff pastry sheet on a tiny slate plate. Brushing it with a micro egg wash using a tiny artist paint brush. Cutting the finished tiny beef wellington open with a miniature knife to reveal a perfectly pink medium-rare center. Luxury plate presentation with micro herbs.",
  metadata: {
    model_gender: "Wanita",
    model_age_group: "Young Adult",
    location: "Dapur Miniatur Luxury Glamour, Indonesia"
  },
  part_1_frames: [
    {
      frame_number: 1,
      time_range: "0.0s - 2.5s",
      action_title: "Menyiapkan Daging Mini",
      visual_prompt: "Extreme close up vertical 9:16 portrait. Delicate female hands laying a microscopic 1cm raw beef tenderloin cube onto a tiny wooden cutting board. Luxurious gold and marble kitchen background, soft warm lighting.",
      voiceover_or_audio: "[ASMR: Bunyi gesekan halus talenan kayu + letupan kuku mengetuk wadah kecil secara berirama] [Musik: Chill lofi beats]",
      key_point: "Persiapan bahan utama mikro"
    },
    {
      frame_number: 2,
      time_range: "2.5s - 5.0s",
      action_title: "Mengiris Daging Presisi",
      visual_prompt: "Macro close-up portrait 9:16. Female hand holding a microscopic 2cm razor-sharp silver chef's knife, carefully scoring fine lines on the tiny raw beef cube. Extremely detailed meat grain textures.",
      voiceover_or_audio: "[ASMR: Suara renyah pisau mikro mengiris serat daging secara presisi] [Musik: Chill lofi beats]",
      key_point: "Pengirisan daging mikro"
    },
    {
      frame_number: 3,
      time_range: "5.0s - 7.5s",
      action_title: "Mencincang Jamur Mikro",
      visual_prompt: "Macro vertical 9:16. Using silver tweezers to place a miniature half-centimeter mushroom on the tiny cutting board, then slicing it into micro bits with the tiny knife. Luxury marble backdrop.",
      voiceover_or_audio: "[ASMR: Tapping garing beruntun pisau pada talenan kayu seukuran koin] [Musik: Cozy acoustic chord]",
      key_point: "Pencincangan bumbu jamur"
    },
    {
      frame_number: 4,
      time_range: "7.5s - 10.0s",
      action_title: "Mencampur Bumbu Halus",
      visual_prompt: "Vertical 9:16 macro focus. Female fingertip delicately stirring a microscopic drop of olive oil and tiny micro-speck of black pepper into the chopped mushroom paste inside a tiny golden dish.",
      voiceover_or_audio: "[ASMR: Gesekan lembut spatula mini pada piring keramik mini] [Musik: Soft acoustic guitar]",
      key_point: "Pencampuran bumbu paste"
    }
  ],
  part_2_frames: [
    {
      frame_number: 1,
      time_range: "10.0s - 12.5s",
      action_title: "Menyalakan Kompor Lilin",
      visual_prompt: "Macro portrait 9:16 vertical. Female hand lighting a tiny decorative candle underneath a copper-grated mini stove. The tiny orange flame flickers softly, casting a warm cozy glow on the marble countertop.",
      voiceover_or_audio: "[ASMR: Bunyi garing gesekan korek api kayu + hembusan napas pelan] [Musik: Slow ambient jazz]",
      key_point: "Pemanasan kompor mikro"
    },
    {
      frame_number: 2,
      time_range: "12.5s - 15.0s",
      action_title: "Menumis Bumbu & Searing",
      visual_prompt: "Macro 9:16 vertical shot. A microscopic copper pan sears the 1cm beef tenderloin. Tiny bubbles of butter and cooking oil sizzling around the beef. Tweezers flipping the beef to sear all sides.",
      voiceover_or_audio: "[ASMR: Bunyi desis nyaring mentega meleleh dan daging menempel pada pan panas] [Musik: Slow ambient jazz]",
      key_point: "Proses searing daging"
    },
    {
      frame_number: 3,
      time_range: "15.0s - 17.5s",
      action_title: "Menggulung di Puff Pastry",
      visual_prompt: "Extreme close up 9:16 vertical. Spreading micro mushroom paste on a miniature puff pastry sheet, placing the seared micro beef on top, and folding it beautifully using elegant micro fingers.",
      voiceover_or_audio: "[ASMR: Bunyi lipatan adonan lembut + gesekan sarung tangan plastik tipis] [Musik: Lofi background]",
      key_point: "Pembungkusan adonan pastry"
    },
    {
      frame_number: 4,
      time_range: "17.5s - 20.0s",
      action_title: "Mengoles Telur Mini",
      visual_prompt: "Close up portrait 9:16. Using a microscopic fine artist brush to glaze the wrapped mini pastry with a golden yellow egg wash. Scoring microscopic lattice patterns on top of the pastry.",
      voiceover_or_audio: "[ASMR: Swishing halus bulu kuas mini di atas adonan pastry gembung] [Musik: Chillout guitar solo]",
      key_point: "Finishing olesan luar"
    }
  ],
  part_3_frames: [
    {
      frame_number: 1,
      time_range: "20.0s - 22.5s",
      action_title: "Memasukkan ke Oven Lilin",
      visual_prompt: "Macro 9:16 vertical shot. Sliding the glazed mini puff pastry on a tiny baking tray into a dollhouse-sized functional mini oven heated by burning candles inside. Cozy smoke rising.",
      voiceover_or_audio: "[ASMR: Bunyi klik pintu besi mini ditutup + letupan api lilin] [Musik: Cozy warm jazz]",
      key_point: "Pemanggangan dalam oven"
    },
    {
      frame_number: 2,
      time_range: "22.5s - 25.0s",
      action_title: "Mengangkat Kue Matang",
      visual_prompt: "Macro 9:16. Opening the micro oven door to reveal the golden-brown puffed crispy miniature Beef Wellington. Smoke rising. Tweezers pulling out the baking tray carefully.",
      voiceover_or_audio: "[ASMR: Keriuk renyah kulit pastry mengembang di suhu panas] [Musik: Satisfying ambient chord]",
      key_point: "Pematangan pastry emas"
    },
    {
      frame_number: 3,
      time_range: "25.0s - 27.5s",
      action_title: "Irisan Sempurna",
      visual_prompt: "Extreme vertical close up 9:16. Slicing the miniature puff pastry Wellington with a tiny sharp knife. Flakes of crispy pastry falling. Inside shows a perfect juicy medium-rare pink center.",
      voiceover_or_audio: "[ASMR: Suara super renyah garing 'Krrrzzzt' kulit pastry dibelah pisau tajam] [Musik: Warm acoustic outro]",
      key_point: "Pemotongan cross-section"
    },
    {
      frame_number: 4,
      time_range: "27.5s - 30.0s",
      action_title: "Penyajian & Platting",
      visual_prompt: "Macro 9:16 vertical. Placing the sliced micro Beef Wellington on a tiny ceramic white plate seukuran koin, garnish with a single micro herb leaf. Aesthetic modern kitchen background.",
      voiceover_or_audio: "[ASMR: Ketukan piring porselen mini di meja + desah kagum puas] [Musik: Dreamy lofi fade-out]",
      key_point: "Plating estetik final"
    }
  ],
  benefits: [
    { title: "Visual Menghipnotis", description: "Bahan dan alat mikro di bawah lensa makro 9:16 membuat audiens betah menonton tanpa berpaling." },
    { title: "ASMR Audio Alami", description: "Sinyal desisan minyak, gesekan pisau mikro, dan suara garing pastry menghasilkan stimulasi ASMR yang adiktif." },
    { title: "Sangat Viralable", description: "Format konten yang sangat disukai algoritma Reels, Shorts, dan TikTok karena Retensi Penonton (AVD) yang tinggi." },
    { title: "Dapur Estetik Serbaguna", description: "Mengatur tata letak dapur minimalis mewah yang memperkuat kredibilitas akun kreator memasak." }
  ],
  caption: "The art of tiny baking! 🥐 Tiny Beef Wellington made with love in my microscopic luxury kitchen. Every detail is functional, fully baked, and incredibly satisfying. Can you hear that crispy pastry crunch? Absolute ASMR bliss. Double tap if you would try a micro bite! ✨\n\n#minicooking #miniaturecooking #tinyfood #asmrcooking #satisfyingfood #miniatureworld #luxuryfood #unboxingmini",
  hashtags: ["minicooking", "miniaturecooking", "tinyfood", "asmrcooking", "satisfyingfood", "miniatureworld", "unboxingmini"]
};

// Simulated SVG Mockups for Miniature Cooking Frames so that users see beautiful visuals instantly
const MOCK_IMAGES: Record<string, string> = {
  "part1-1": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><circle cx='180' cy='320' r='120' fill='%231e293b' stroke='%23d946ef' stroke-width='1'/><path d='M100 320 H260' stroke='%23334155' stroke-width='4'/><rect x='130' y='280' width='100' height='80' rx='8' fill='%2378350f'/><rect x='160' y='300' width='40' height='40' rx='4' fill='%23ef4444'/><circle cx='180' cy='180' r='10' fill='%23f472b6'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 1: Siapkan Daging Mikro]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Tangan menuang bahan seukuran kancing</text></svg>",
  "part1-2": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='110' y='250' width='140' height='100' rx='8' fill='%2378350f'/><rect x='150' y='275' width='50' height='50' rx='4' fill='%23ef4444'/><path d='M130 220 L190 310' stroke='%23cbd5e1' stroke-width='3' stroke-linecap='round'/><path d='M120 210 L140 230' stroke='%23475569' stroke-width='6'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 2: Irisan Pisau Mikro]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Pisau 2cm mengiris halus serat daging</text></svg>",
  "part1-3": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='110' y='250' width='140' height='100' rx='8' fill='%2378350f'/><circle cx='180' cy='300' r='12' fill='%23f59e0b'/><path d='M130 230 L230 230' stroke='%2394a3b8' stroke-width='2'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 3: Cincang Jamur]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Pinset perak meletakkan jamur mini</text></svg>",
  "part1-4": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><circle cx='180' cy='300' r='45' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='2'/><circle cx='180' cy='300' r='30' fill='%23b45309'/><circle cx='175' cy='295' r='2' fill='%23ffffff'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 4: Saus Bumbu]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Spatula kayu mengaduk pasta jamur</text></svg>",
  
  "part2-1": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='130' y='320' width='100' height='120' rx='10' fill='%23334155'/><circle cx='180' cy='350' r='20' fill='%23f59e0b'/><path d='M180 340 Q170 320 180 300 Q190 320 180 340 Z' fill='%23ef4444'/><text x='180' y='500' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 5: Kompor Lilin]</text><text x='180' y='530' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Kompor gas mikro dinyalakan lilin</text></svg>",
  "part2-2": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='130' y='320' width='100' height='80' rx='10' fill='%23334155'/><path d='M100 290 Q180 270 260 290' stroke='%23b45309' stroke-width='12' fill='none' stroke-linecap='round'/><rect x='160' y='265' width='40' height='30' rx='4' fill='%23ef4444'/><path d='M155 255 C165 245, 175 245, 185 255' stroke='%23ffffff' stroke-width='2' fill='none'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 6: Desis Wajan]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Searing daging di wajan seukuran koin</text></svg>",
  "part2-3": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='100' y='270' width='160' height='100' rx='4' fill='%23fef08a'/><rect x='140' y='300' width='80' height='40' rx='6' fill='%239a3412'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 7: Lipat Pastry]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Membungkus daging seared dengan adonan</text></svg>",
  "part2-4": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='100' y='270' width='160' height='100' rx='10' fill='%23fef08a' stroke='%23ea580c' stroke-width='3'/><path d='M120 260 L240 380' stroke='%23ca8a04' stroke-width='2'/><path d='M240 260 L120 380' stroke='%23ca8a04' stroke-width='2'/><text x='180' y='480' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 8: Olesan Telur]</text><text x='180' y='510' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Kuas mini mengoles kuning telur</text></svg>",
  
  "part3-1": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='80' y='220' width='200' height='200' rx='12' fill='%231e293b' stroke='%23cbd5e1' stroke-width='4'/><rect x='110' y='290' width='140' height='80' rx='8' fill='%23ca8a04'/><text x='180' y='480' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 9: Panggang Oven]</text><text x='180' y='510' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Menaruh loyang mikro ke oven lilin</text></svg>",
  "part3-2": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='90' y='280' width='180' height='100' rx='6' fill='%231e293b'/><rect x='120' y='295' width='120' height='70' rx='8' fill='%23854d0e' stroke='%23fef08a' stroke-width='2'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 10: Hasil Panggang]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Pastry mekar renyah keemasan</text></svg>",
  "part3-3": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='110' y='250' width='140' height='140' rx='70' fill='%23e2e8f0'/><rect x='135' y='295' width='45' height='50' rx='4' fill='%23f43f5e'/><rect x='180' y='295' width='45' height='50' rx='4' fill='%23f43f5e'/><path d='M130 320 H230' stroke='%23ca8a04' stroke-width='8'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 11: Belah Renyah]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Irisan memperlihatkan daging pink juicy</text></svg>",
  "part3-4": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640' fill='%23111827'><rect width='360' height='640' fill='%230f172a'/><rect x='60' y='260' width='240' height='20' rx='4' fill='%2364748b'/><circle cx='180' cy='320' r='60' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='3'/><rect x='160' y='300' width='40' height='40' rx='4' fill='%23f43f5e'/><circle cx='180' cy='280' r='5' fill='%2322c55e'/><text x='180' y='460' fill='%23e2e8f0' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle'>[Langkah 12: Plating Mewah]</text><text x='180' y='490' fill='%23a1a1aa' font-size='10' font-family='sans-serif' text-anchor='middle'>Siap disajikan di piring keramik mini</text></svg>"
};

// Web Audio synthesizer class to synthesize cooking sounds on demand
class WebAudioAsmrSynth {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmOscs: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private bgmTimeout: any = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesizes custom procedural cooking sound effects
  playAsmr(type: string) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (type === 'chop' || type === 'cut') {
      // 1. CHOPPING: Sharp transient click + woody thud
      for (let i = 0; i < 3; i++) {
        const time = now + i * 0.25;
        // High frequency transient
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.08);

        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);

        // Click noise
        const bufferSize = this.ctx.sampleRate * 0.02;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);

        // Filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, time);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(time);
        noise.stop(time + 0.03);
      }
    } else if (type === 'sizzle' || type === 'fry') {
      // 2. SIZZLING: Highpassed noise modulated by low frequency oscillator
      const duration = 2.5;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.Q.setValueAtTime(1.5, now);

      // Modulate frequency slightly to simulate boiling bubbles
      const mod = this.ctx.createOscillator();
      mod.frequency.setValueAtTime(8, now); // 8 Hz bubbles
      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.setValueAtTime(0.3, now + duration - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      mod.connect(modGain);
      modGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      mod.start(now);
      noise.start(now);
      mod.stop(now + duration);
      noise.stop(now + duration);
    } else if (type === 'oven' || type === 'chime' || type === 'click') {
      // 3. OVEN BELL/CLICK: Dual high pitched sine wave ring
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.frequency.setValueAtTime(1500, now);
      osc2.frequency.setValueAtTime(1800, now);

      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
    } else {
      // 4. GENERALsatisfying tap: organic wood block sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  // Synthesizes a cozy procedural Lo-Fi chord sequence for background music
  playBgMusic(active: boolean) {
    this.init();
    if (!this.ctx) return;

    if (!active) {
      this.isBgmPlaying = false;
      if (this.bgmGain) {
        this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      }
      if (this.bgmTimeout) clearTimeout(this.bgmTimeout);
      return;
    }

    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // Create a shared gain node for lo-fi music
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [293.66, 349.23, 440.00, 587.33], // Dm7
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Add vintage lo-fi filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05); // staggered note trigger

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.2, now + 0.2 + idx * 0.05);
        noteGain.gain.setValueAtTime(0.2, now + 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 3.2);
      });

      // Schedule next chord in 3 seconds
      this.bgmTimeout = setTimeout(playNextChord, 3000);
    };

    playNextChord();
  }
}

export default function MiniCookingVideo({ onBack }: MiniCookingVideoProps) {
  // Input settings
  const [menuName, setMenuName] = useState('Beef Wellington (Tiny version)');
  const [duration, setDuration] = useState('10');
  const [theme, setTheme] = useState('6. Luxury Glamour');
  const [handType, setHandType] = useState('Wanita');
  const [customHand, setCustomHand] = useState('');
  const [bahanSiap, setBahanSiap] = useState(true);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<StoryboardData | null>(BEEF_WELLINGTON_PRESET);
  const [activeTab, setActiveTab] = useState<'visual' | 'prompt' | 'metadata' | 'sound'>('visual');
  const [activeVideoPart, setActiveVideoPart] = useState<'1' | '2' | '3'>('1');
  const [selectedFrameNumber, setSelectedFrameNumber] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>(MOCK_IMAGES);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);

  // Sound Engine
  const soundEngineRef = useRef<WebAudioAsmrSynth | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [bgMusicActive, setBgMusicActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<3 | 10>(3); // seconds per frame simulator speed

  // Copy states
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // List of kitchen themes matching user video
  const kitchenThemes = [
    '1. Japandi Modern',
    '2. Rustic Tradisional',
    '3. Ultra-Minimalist Commercial',
    '4. Loft Industrial',
    '5. Vintage Retro 80s/90s',
    '6. Luxury Glamour',
    '7. Scandinavian Cozy',
    '8. Traditional Japanese Zen',
    '9. Pastel Dream / Aesthetic Cafe',
    '10. Dark Moody Charcoal'
  ];

  useEffect(() => {
    soundEngineRef.current = new WebAudioAsmrSynth();
    return () => {
      soundEngineRef.current?.playBgMusic(false);
    };
  }, []);

  // Frame Auto player logic
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && result) {
      const activeFrames = getActiveFrames();
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            // Next frame
            setSelectedFrameNumber((currFrame) => {
              const nextF = currFrame + 1;
              if (nextF > activeFrames.length) {
                // Return to first frame
                triggerFrameSound(1);
                return 1;
              } else {
                triggerFrameSound(nextF);
                return nextF;
              }
            });
            return 0;
          }
          return prev + (100 / (playbackSpeed * 10)); // Increment depending on playback speed
        });
      }, 100);
    } else {
      setPlayProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedFrameNumber, activeVideoPart, playbackSpeed, result]);

  // Trigger ASMR sound based on frame actions
  const triggerFrameSound = (frameNum: number) => {
    const frames = getActiveFrames();
    const frame = frames.find(f => f.frame_number === frameNum);
    if (!frame || !soundEngineRef.current) return;

    const title = frame.action_title.toLowerCase();
    if (title.includes('iris') || title.includes('cincang') || title.includes('belah') || title.includes('potong')) {
      soundEngineRef.current.playAsmr('chop');
    } else if (title.includes('desis') || title.includes('tumis') || title.includes('goreng') || title.includes('panas')) {
      soundEngineRef.current.playAsmr('sizzle');
    } else if (title.includes('oven') || title.includes('klik') || title.includes('kompor') || title.includes('matang')) {
      soundEngineRef.current.playAsmr('oven');
    } else {
      soundEngineRef.current.playAsmr('tap');
    }
  };

  const getActiveFrames = () => {
    if (!result) return [];
    if (activeVideoPart === '1') return result.part_1_frames;
    if (activeVideoPart === '2') return result.part_2_frames;
    return result.part_3_frames;
  };

  const getActiveFlowPrompt = () => {
    if (!result) return '';
    if (activeVideoPart === '1') return result.prompt_part_1;
    if (activeVideoPart === '2') return result.prompt_part_2;
    return result.prompt_part_3;
  };

  const loadMiniCraftTemplate = () => {
    setMenuName('Beef Wellington (Tiny version)');
    setDuration('10');
    setTheme('6. Luxury Glamour');
    setHandType('Wanita');
    setBahanSiap(true);
    setResult(BEEF_WELLINGTON_PRESET);
    setGeneratedImages(MOCK_IMAGES);
    setSelectedFrameNumber(1);
    setActiveVideoPart('1');
  };

  const handleGenerate = async () => {
    if (!menuName.trim()) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressText('Menganalisis resep masakan miniatur...');

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 400);

    try {
      const activeHand = handType === 'Kustom' ? customHand : handType;
      
      setProgressText('Menyusun skenario video dan transisi ASMR...');
      const response = await fetch('/api/gemini-mini-cooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuName,
          duration,
          theme,
          handType: activeHand
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal generate storyboard');
      }

      const data: StoryboardData = await response.json();
      clearInterval(interval);
      setProgressPercent(100);
      setProgressText('Penyusunan Storyboard Selesai!');
      
      // Delay slightly to show 100% completion
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
        setSelectedFrameNumber(1);
        setActiveVideoPart('1');
        // Clear old images for the new generation
        setGeneratedImages({});
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      alert(err.message || 'Terjadi kesalahan sistem saat membuat storyboard memasak.');
    }
  };

  // Generate Image for a specific frame using Gemini 2.5 Image model
  const generateFrameImage = async (partKey: string, frameNumber: number, promptText: string) => {
    const key = `${partKey}-${frameNumber}`;
    setIsGeneratingImage(key);

    try {
      const response = await fetch('/api/gemini-generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio: '9:16'
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memproses gambar');
      }

      const data = await response.json();
      if (data.image) {
        setGeneratedImages(prev => ({
          ...prev,
          [key]: data.image
        }));
      }
    } catch (err) {
      console.error(err);
      // Fallback with an elegant SVG color matching theme
      const colors = ['%23db2777', '%237c3aed', '%23059669', '%23ea580c'];
      const chosenColor = colors[frameNumber % colors.length];
      const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 640'><rect width='360' height='640' fill='%230f172a'/><circle cx='180' cy='320' r='80' fill='${chosenColor}' opacity='0.3' filter='blur(10px)'/><text x='180' y='320' fill='white' font-size='14' font-family='sans-serif' text-anchor='middle'>Visual Langkah ${frameNumber}</text></svg>`;
      setGeneratedImages(prev => ({
        ...prev,
        [key]: fallbackSvg
      }));
    } finally {
      setIsGeneratingImage(null);
    }
  };

  // Generate all images for the current active part in sequence
  const generateAllPartImages = async () => {
    const frames = getActiveFrames();
    const partKey = `part${activeVideoPart}`;
    
    for (const frame of frames) {
      const key = `${partKey}-${frame.frame_number}`;
      if (!generatedImages[key]) {
        await generateFrameImage(partKey, frame.frame_number, frame.visual_prompt);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const activeFramesList = getActiveFrames();
  const selectedFrameDetail = activeFramesList.find(f => f.frame_number === (selectedFrameNumber || 1));

  const getFlowAiJson = () => {
    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Decorative Glow Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                PRO LEVEL
              </span>
              <span className="text-[10px] font-mono text-slate-500">v3.5</span>
            </div>
            <h1 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
              🍳 Mini Cooking Video
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMiniCraftTemplate}
            className="px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Template</span>
          </button>
          <button 
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 mt-8 flex-1">
        
        {/* Input parameters panel (Matches user video) */}
        <div className="bg-[#0b0f19]/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-500" />
              Rancang Resep Masakan Miniatur
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY TO COOK</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            {/* Input Menu */}
            <div className="md:col-span-8 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Masukkan Menu Masakan Miniatur
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Contoh: Beef Wellington (Tiny version), Miniature Fried Rice, dll."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-2xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none transition-all pr-24 font-bold placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setBahanSiap(!bahanSiap)}
                  className={`absolute right-3 top-2.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 border ${
                    bahanSiap 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{bahanSiap ? 'Bahan Siap' : 'Siapkan'}</span>
                </button>
              </div>
            </div>

            {/* Total Duration */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                <span>DURASI TOTAL VIDEO</span>
                <span className="text-pink-400 font-mono font-black">{duration} DETIK</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10', '20', '30'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-3 rounded-xl border text-xs font-black transition-all uppercase tracking-widest ${
                      duration === d 
                        ? 'bg-pink-600/15 border-pink-500 text-pink-400 shadow-md shadow-pink-900/10' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d} Detik
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Kitchen Theme select */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Tema Dapur & Visual
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-2xl p-3.5 text-sm font-bold text-slate-100 focus:outline-none transition-all cursor-pointer"
              >
                {kitchenThemes.map((t) => (
                  <option key={t} value={t} className="bg-slate-950 text-slate-200">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Hand POV select */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Tangan Terlihat (POV 9:16)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Wanita', 'Pria', 'Kustom'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHandType(h)}
                    className={`py-3.5 rounded-xl border text-xs font-black transition-all uppercase tracking-widest ${
                      handType === h 
                        ? 'bg-pink-600/15 border-pink-500 text-pink-400 shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {handType === 'Kustom' && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Kustom Tangan (Spesifikasi Cat Kuku, Perhiasan, dll)
              </label>
              <input
                type="text"
                value={customHand}
                onChange={(e) => setCustomHand(e.target.value)}
                placeholder="Misal: Tangan wanita dengan cat kuku merah muda berkilau mewah..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none font-medium"
              />
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sedang Merancang Storyboard...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-current animate-pulse" />
                  <span>Generate Storyboards & Script ASMR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress State */}
        {isProcessing && (
          <div className="mt-8 bg-slate-900/40 border border-pink-500/20 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto animate-pulse">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-black text-pink-400">
                {progressPercent}%
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Menyusun Resep Miniatur</h3>
              <p className="text-slate-400 text-xs font-medium">{progressText}</p>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Storyboard Output & Visual Simulator Area */}
        {result && !isProcessing && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* LEFT COLUMN: Storyboards, Script, Copy Panel */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* Part Toggles */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="flex gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80">
                  <button
                    onClick={() => {
                      setActiveVideoPart('1');
                      setSelectedFrameNumber(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeVideoPart === '1'
                        ? 'bg-pink-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Part 1 (Detik 0 - 10)
                  </button>

                  {duration !== '10' && (
                    <button
                      onClick={() => {
                        setActiveVideoPart('2');
                        setSelectedFrameNumber(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeVideoPart === '2'
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Part 2 (Detik 10 - 20)
                    </button>
                  )}

                  {duration === '30' && (
                    <button
                      onClick={() => {
                        setActiveVideoPart('3');
                        setSelectedFrameNumber(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeVideoPart === '3'
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Part 3 (Detik 20 - 30)
                    </button>
                  )}
                </div>

                <button
                  onClick={generateAllPartImages}
                  className="px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate All Visuals</span>
                </button>
              </div>

              {/* Segment Prompt Copy Box */}
              <div className="bg-[#0b0c16] border border-purple-950 rounded-3xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-950/50 px-2 py-0.5 rounded border border-purple-900/30 font-mono">
                    PROMPT MASTER VIDEO GENERATOR (PART {activeVideoPart})
                  </span>
                  <button
                    onClick={() => copyToClipboard(getActiveFlowPrompt(), `part-${activeVideoPart}`)}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-800"
                  >
                    {copiedPrompt === `part-${activeVideoPart}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-900/60 break-words select-all">
                  {getActiveFlowPrompt()}
                </p>
                <p className="text-[9px] text-slate-500 italic">
                  💡 Salin prompt di atas ke platform generator video (seperti Dola, Luma, Kling, atau Runway) untuk menghasilkan video vertical masakan mini yang memukau.
                </p>
              </div>

              {/* 2x2 Collage Storyboard Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    GRID STORYBOARD (4 SCENE KOLLASE)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    PART {activeVideoPart} SELESAI
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getActiveFrames().map((frame) => {
                    const imgKey = `part${activeVideoPart}-${frame.frame_number}`;
                    const hasImage = !!generatedImages[imgKey];
                    const isSelected = selectedFrameNumber === frame.frame_number;

                    return (
                      <div 
                        key={frame.frame_number}
                        onClick={() => {
                          setSelectedFrameNumber(frame.frame_number);
                          triggerFrameSound(frame.frame_number);
                        }}
                        className={`group bg-slate-900 border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-pink-500 shadow-lg shadow-pink-500/10 scale-102' 
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Frame image box */}
                        <div className="aspect-[9/16] bg-slate-950 relative flex items-center justify-center">
                          {hasImage ? (
                            <img 
                              src={generatedImages[imgKey]}
                              alt={`Visual step ${frame.frame_number}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="p-4 text-center space-y-2">
                              {isGeneratingImage === imgKey ? (
                                <Loader2 className="w-5 h-5 text-pink-400 animate-spin mx-auto" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-600 mx-auto group-hover:text-pink-400 transition-colors" />
                              )}
                              <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold">
                                {isGeneratingImage === imgKey ? 'Menggambar...' : 'Belum Ada Visual'}
                              </span>
                            </div>
                          )}

                          {/* Quick trigger button to draw */}
                          {!hasImage && isGeneratingImage !== imgKey && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generateFrameImage(`part${activeVideoPart}`, frame.frame_number, frame.visual_prompt);
                              }}
                              className="absolute bottom-2 inset-x-2 bg-slate-900/90 hover:bg-pink-600 border border-slate-800 rounded-lg py-1 text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Buat Visual</span>
                            </button>
                          )}

                          {/* Top badge */}
                          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur border border-slate-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-slate-400 font-bold">
                            {frame.time_range}
                          </div>
                        </div>

                        {/* Title details */}
                        <div className="p-3 bg-slate-900 space-y-1">
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Scene {frame.frame_number}
                          </div>
                          <div className="text-[10px] text-slate-200 font-bold line-clamp-1">
                            {frame.action_title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Selected Frame Detail Script Card */}
              {selectedFrameDetail && (
                <div className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-black uppercase tracking-wider rounded-xl">
                        Scene {selectedFrameDetail.frame_number}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">{selectedFrameDetail.time_range}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                      DETIL ARSITEKTUR KONTEN
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visual Prompt Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          Visual Image Prompt (English)
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedFrameDetail.visual_prompt, `vis-${selectedFrameDetail.frame_number}`)}
                          className="text-[8px] font-bold text-pink-400 hover:text-pink-300 transition-colors uppercase flex items-center gap-1"
                        >
                          {copiedPrompt === `vis-${selectedFrameDetail.frame_number}` ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-900/60">
                        {selectedFrameDetail.visual_prompt}
                      </p>
                    </div>

                    {/* Sound and ASMR Script */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          Rencana Sound ASMR & Musik
                        </span>
                        <div className="p-4 bg-purple-950/10 border border-purple-500/10 rounded-2xl flex items-start gap-2.5">
                          <Volume2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                            {selectedFrameDetail.voiceover_or_audio}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          Poin Penting Scene (Keypoint)
                        </span>
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{selectedFrameDetail.key_point}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs at Bottom for Auxiliary Content */}
              <div className="border-t border-slate-900 pt-6">
                <div className="flex border-b border-slate-900 gap-1 mb-4">
                  {['visual', 'prompt', 'metadata'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTab === tab 
                          ? 'border-pink-500 text-pink-400' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'visual' && '4 Keunggulan Masakan'}
                      {tab === 'prompt' && 'Caption Copy Viral'}
                      {tab === 'metadata' && 'Blueprint JSON'}
                    </button>
                  ))}
                </div>

                {activeTab === 'visual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.benefits.map((b, i) => (
                      <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                        <div className="bg-pink-500/10 text-pink-400 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">
                          {i+1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white uppercase tracking-tight">{b.title}</h4>
                          <p className="text-slate-400 text-[10px] leading-normal">{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'prompt' && (
                  <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        COPYWRITING CAPTION VERTICAL
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.caption);
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800 flex items-center gap-1.5 text-slate-300 hover:text-white"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Caption</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={result.caption}
                      className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-4 text-xs font-sans text-slate-300 leading-relaxed resize-none h-40 focus:outline-none focus:ring-0"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-pink-500/10 text-pink-400 px-2.5 py-1 rounded-lg border border-pink-500/10 font-mono font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        RAW STORYBOARD JSON PAYLOAD
                      </span>
                      <button
                        onClick={() => copyToClipboard(getFlowAiJson(), 'raw-json')}
                        className="text-[9px] text-pink-400 hover:text-pink-300 font-bold uppercase flex items-center gap-1"
                      >
                        {copiedPrompt === 'raw-json' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Salin JSON</span>
                      </button>
                    </div>
                    <pre className="text-slate-300 text-xs leading-relaxed font-mono overflow-x-auto max-h-[400px] bg-slate-950 p-4 rounded-2xl border border-slate-900">
                      <code>{getFlowAiJson()}</code>
                    </pre>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive 9:16 UGC Player & Sound Simulator */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-[#0b0416] border-2 border-pink-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center">
                {/* Rainbow accent top bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                {/* Simulator Title */}
                <div className="w-full flex items-center justify-between mb-4 border-b border-purple-950/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest font-mono">UGC ASMR PLAYER</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-900/30">SIMULATOR ACTIVE</span>
                </div>

                {/* Simulated 9:16 Phone Frame */}
                <div className="relative w-full max-w-[280px] aspect-[9/16] bg-black rounded-[36px] border-[6px] border-slate-800/80 shadow-2xl overflow-hidden group">
                  {/* Progress segment bars */}
                  <div className="absolute top-4 left-3 right-3 z-30 flex gap-1">
                    {activeFramesList.map((f) => {
                      const isPast = f.frame_number < (selectedFrameNumber || 1);
                      const isCurrent = f.frame_number === (selectedFrameNumber || 1);
                      return (
                        <div key={f.frame_number} className="h-1 flex-1 bg-slate-800/80 rounded overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 transition-all duration-75"
                            style={{ 
                              width: isPast ? '100%' : isCurrent ? `${playProgress}%` : '0%' 
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Frame Visual Image */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {generatedImages[`part${activeVideoPart}-${selectedFrameNumber || 1}`] ? (
                      <img 
                        src={generatedImages[`part${activeVideoPart}-${selectedFrameNumber || 1}`]}
                        alt="Simulated cooking step"
                        className={`w-full h-full object-cover transition-transform duration-[4000ms] ${
                          isPlaying ? 'scale-110 ease-out' : 'scale-100'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-purple-400/40 mx-auto animate-pulse" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-snug">Rancang Gambar Terlebih Dahulu</p>
                        <p className="text-[8px] text-slate-600">Tekan "Buat Visual" di grid sebelah kiri.</p>
                      </div>
                    )}

                    {/* Ambient Glow Particles overlay */}
                    <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-b from-transparent via-transparent to-purple-950/20">
                      <div className="absolute bottom-16 right-6 text-pink-400/50 animate-bounce duration-[2000ms]">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="absolute top-24 left-8 text-fuchsia-400/30 animate-pulse">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Overlay TikTok-style User info and Subtitles */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-12 text-left z-20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-white">@minicraft_asmr</span>
                        <span className="text-[8px] bg-pink-600/30 text-pink-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">AESTHETIC</span>
                      </div>
                      <p className="text-[10px] text-slate-200 font-sans font-medium leading-relaxed">
                        {selectedFrameDetail ? selectedFrameDetail.action_title : ''} — {selectedFrameDetail ? selectedFrameDetail.key_point : ''}
                      </p>
                      <div className="flex items-start gap-1.5 text-[8px] text-pink-400 font-bold bg-pink-500/10 py-1.5 px-2 rounded-lg border border-pink-500/20">
                        <Volume2 className="w-3 h-3 text-pink-400 shrink-0 mt-0.5" />
                        <span className="leading-normal">{selectedFrameDetail ? selectedFrameDetail.voiceover_or_audio : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Audio Equalizer Bars when playing */}
                <div className="flex items-end gap-1.5 h-6 mt-4 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <div 
                      key={bar} 
                      className="w-1 bg-pink-500 rounded-t transition-all duration-150"
                      style={{ 
                        height: isPlaying ? `${Math.floor(Math.random() * 20) + 4}px` : '4px' 
                      }}
                    />
                  ))}
                </div>

                {/* Playback Controls */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedFrameNumber(prev => {
                          const current = prev || 1;
                          return current > 1 ? current - 1 : activeFramesList.length;
                        });
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 active:scale-95 transition-all"
                      title="Frame Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30 active:scale-95 transition-all w-40"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause Video</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mainkan Video</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFrameNumber(prev => {
                          const current = prev || 1;
                          return current < activeFramesList.length ? current + 1 : 1;
                        });
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 active:scale-95 transition-all"
                      title="Frame Berikutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sound Mixer configuration */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900/80 space-y-3">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block text-center">SOUND MIXER & ASMR PANEL</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const nextState = !bgMusicActive;
                          setBgMusicActive(nextState);
                          soundEngineRef.current?.playBgMusic(nextState);
                        }}
                        className={`p-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          bgMusicActive
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>{bgMusicActive ? 'Musik: On' : 'Musik: Off'}</span>
                      </button>

                      <button
                        onClick={() => triggerFrameSound(selectedFrameNumber || 1)}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Uji Suara ASMR</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-[10px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Kecepatan Simulasi:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setPlaybackSpeed(3)}
                          className={`px-2 py-0.5 rounded font-mono ${
                            playbackSpeed === 3 
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold' 
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          Cepat (3s)
                        </button>
                        <button
                          onClick={() => setPlaybackSpeed(10)}
                          className={`px-2 py-0.5 rounded font-mono ${
                            playbackSpeed === 10 
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold' 
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          Nyata (10s)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Help tip */}
                  <p className="text-[9px] text-slate-500 leading-relaxed text-center italic">
                    💡 Klik "Mainkan Video" untuk menyaksikan simulasi visual & audio ASMR memasak mikro. Gunakan headset/earphone untuk efek ASMR terbaik!
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
