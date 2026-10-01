import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Copy, Check, Info, FileText, Music, Hash, Radio, 
  Heart, HelpCircle, Eye, FileJson, Download, ImageIcon, RefreshCw, LayoutGrid, 
  CheckCircle2, Sliders, User, MapPin, Zap, Shield, Activity, ChevronRight, Play,
  ChevronLeft, Pause, Volume2, Bike, Wrench, Scissors, Share2, Upload, X
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

interface MiniToyStudioProps {
  onBack: () => void;
}

// Preset High-Fidelity Data for "Kawasaki Ninja H2R (Mini version)" exactly matching user video
const NINJA_H2R_PRESET: StoryboardData = {
  prompt_part_1: "Aesthetic 9:16 vertical portrait fast-paced 10-second video of miniature toy assembly and exhaust fire demo. Clean dark carbon fiber background table with professional neon-green LED strip lighting. Male hand in black textured rubber glove unboxes 1:18 Kawasaki Ninja H2R scale box, lays out green frame, slick tires, micro engine, and titanium exhaust with tweezers, rapidly assembles the model, mounts on paddock stand, starts front LED lights, and revs the miniature throttle—causing the titanium exhaust pipe to roar aggressively and spit vibrant blue and orange fire flames backfire with sparks! Dense macro lens focus, photorealistic 60fps, high mechanical ASMR detail.",
  prompt_part_2: "Satisfying 9:16 vertical video of micro toy assembly. Male hand in black glove using a microscopic syringe pipet to squeeze a drop of clear premium synthetic oil onto a miniature metallic transmission gear on a tiny silver stand. Then, using a micro screwdriver to tighten a 1mm gold-finished screw on the neon-green chassis frame. Clean futuristic dark workshop vibes, glowing accent lights.",
  prompt_part_3: "Macro 9:16 vertical portrait shot. The fully assembled 1:18 scale Kawasaki Ninja H2R motorcycle placed on an aluminum rear-wheel paddock stand. Male hand gently spinning the rear slick wheel, making the chain and tires spin rapidly with a high-pitched aerodynamic mechanical sound. Smoke machine emitting soft white haze in the background with bright green neon glow, highly futuristic and high-tech toy showcase.",
  metadata: {
    model_gender: "Pria",
    model_age_group: "Gen Z / Young Adult",
    location: "Studio Miniatur Futuristik LED, Jakarta"
  },
  part_1_frames: [
    {
      frame_number: 1,
      time_range: "0.0s - 2.5s",
      action_title: "Membuka Kotak Scale Model",
      visual_prompt: "Extreme close up vertical 9:16 portrait. Hand in textured black glove carefully using a sharp precision scalpel to slide open the transparent protective seal on the miniature Kawasaki Ninja H2R scale box, opening the sleek black box lid. Futuristic neon studio backdrop.",
      voiceover_or_audio: "[ASMR: Sreett! Bunyi robekan tajam segel plastik box + ketukan ringan jari pada karton tebal] [Musik: Synthwave synth, ketukan cepat futuristik]",
      key_point: "Unboxing eksklusif segel box"
    },
    {
      frame_number: 2,
      time_range: "2.5s - 5.0s",
      action_title: "Keluarkan Semua Part Miniatur",
      visual_prompt: "Macro close-up portrait 9:16. Unpacking and laying out all micro components—neon green trellis chassis, slick rubber tires, miniature supercharged engine block, 1mm hex bolts, and burnt titanium exhaust pipe—neatly on glossy dark carbon fiber workspace with precision steel tweezers.",
      voiceover_or_audio: "[ASMR: Bunyi 'pop' busa pelindung + denting garing logam pinset menata partikel mesin dan knalpot di meja] [Musik: Fast-paced synth rhythm]",
      key_point: "Layouting semua part miniatur di meja"
    },
    {
      frame_number: 3,
      time_range: "5.0s - 7.5s",
      action_title: "Merakit Sasis & Mesin Presisi",
      visual_prompt: "Fast-paced macro vertical 9:16. Rapid assembly of the green trellis frame, mounting rear shock absorber, tightening 1mm metallic hex bolts using micro screwdriver, and depressing syringe pipet to drop oil onto gear mechanism.",
      voiceover_or_audio: "[ASMR: Bunyi klik presisi sasis terpasang + gesekan garing obeng hex & desis oli] [Musik: High-energy electronic beats]",
      key_point: "Perakitan presisi cepat (time-lapse)"
    },
    {
      frame_number: 4,
      time_range: "7.5s - 10.0s",
      action_title: "Menyalakan & Demo Gas Knalpot Berapi",
      visual_prompt: "Macro vertical 9:16 portrait shot. The fully assembled 1:18 Kawasaki Ninja H2R mounted on a silver rear paddock stand with front LED lights glowing blue. Male glove hand twists the miniature handlebar throttle, revving the engine—the burnt titanium exhaust pipe roars loudly and shoots vibrant blue and orange fire flames backfire with bright sparks! Dramatic smoke and motion blur.",
      voiceover_or_audio: "[ASMR: Deru mesin garing gahar 'BRAAAP! VROOOOOM!' + letupan api knalpot 'POP! POP! POP!' + desing rantai] [Musik: Heavy future bass drop & engine roar]",
      key_point: "Demo gas knalpot bersuara gahar & berapi"
    }
  ],
  part_2_frames: [
    {
      frame_number: 1,
      time_range: "10.0s - 12.5s",
      action_title: "Meneteskan Oli Presisi",
      visual_prompt: "Macro portrait 9:16 vertical. Hand in black glove gently depressing a micro syringe, depositing a tiny glowing amber drop of synthetic mineral oil directly onto the miniature gear mechanism.",
      voiceover_or_audio: "[ASMR: Desis hisapan cairan pada pipa jarum + kecipak halus tetesan minyak] [Musik: Chill techno rhythm]",
      key_point: "Lubrikasi roda gigi transmisi"
    },
    {
      frame_number: 2,
      time_range: "12.5s - 15.0s",
      action_title: "Merakit Shock Breaker",
      visual_prompt: "Macro 9:16 vertical. Slipping a tiny real metal spring shock absorber into the rear swingarm assembly of the motorcycle. The spring compresses realistically under the finger.",
      voiceover_or_audio: "[ASMR: Bunyi pegas membal halus + decitan karet bergesekan dengan pasak logam] [Musik: Electronic beats tempo medium]",
      key_point: "Pemasangan shock absorber realistik"
    },
    {
      frame_number: 3,
      time_range: "15.0s - 17.5s",
      action_title: "Mengencangkan Baut 1mm",
      visual_prompt: "Extreme close up 9:16 vertical. Tightening a microscopic 1mm metallic silver bolt on the engine bracket using a gold-accented professional micro hex screwdriver.",
      voiceover_or_audio: "[ASMR: Bunyi garing gesekan obeng hex logam + ulir sekrup berputar renyah] [Musik: Futuristic tech beats]",
      key_point: "Pengencangan sasis utama"
    },
    {
      frame_number: 4,
      time_range: "17.5s - 20.0s",
      action_title: "Menempelkan Stiker Ninja H2R",
      visual_prompt: "Close up portrait 9:16. Using precision tweezers to lift a microscopic reflective chrome 'Ninja H2R' decal sticker and aligning it perfectly onto the fuel tank flank.",
      voiceover_or_audio: "[ASMR: Gesekan pelan kertas stiker + tarikan rekat perekat berbunyi 'Zzzt'] [Musik: Uplifting electronic ambient]",
      key_point: "Pemasangan stiker detail premium"
    }
  ],
  part_3_frames: [
    {
      frame_number: 1,
      time_range: "20.0s - 22.5s",
      action_title: "Memasang di Paddock Stand",
      visual_prompt: "Macro 9:16 vertical shot. Lifting the completed 1:18 Ninja H2R scale model and mounting its rear metal swingarm axle pegs onto a custom silver aluminum miniature rear paddock stand.",
      voiceover_or_audio: "[ASMR: Bunyi dentang logam paddock menopang as roda 'klak' presisi] [Musik: Energetic future bass synth]",
      key_point: "Pemasangan di paddock stand kustom"
    },
    {
      frame_number: 2,
      time_range: "22.5s - 25.0s",
      action_title: "Uji Putaran Roda & Rantai",
      visual_prompt: "Macro 9:16. Male glove finger aggressively flicking the rear slick tire, causing it and the drive chain to spin at lightning speed. Real-time motion blur, beautiful neon reflections.",
      voiceover_or_audio: "[ASMR: Desing tajam 'Wzzzzzzt' putaran gir rantai roda belakang berputar super kencang] [Musik: Energetic future bass drop]",
      key_point: "Uji performa mekanis gir"
    },
    {
      frame_number: 3,
      time_range: "25.0s - 27.5s",
      action_title: "Menyalakan Lampu Mikro LED",
      visual_prompt: "Extreme vertical close up 9:16. Pressing a tiny invisible button on the underside, causing the headlight and digital dashboard to glow with cool blue and white LED lights.",
      voiceover_or_audio: "[ASMR: Bunyi klik tajam tombol mini + dengung elektronik super halus] [Musik: Sci-fi tech crescendo]",
      key_point: "Aktivasi lampu depan LED mikro"
    },
    {
      frame_number: 4,
      time_range: "27.5s - 30.0s",
      action_title: "Showcase Sinematik Berasap",
      visual_prompt: "Macro 9:16 vertical. Cinematic showcase of the miniature motorcycle on the paddock. Smoke machine fills the neon-green glowing atmosphere, creating a stunning dramatic look.",
      voiceover_or_audio: "[ASMR: Desis halus mesin asap + deru kipas pendingin studio] [Musik: Epic retro synthwave outro fade]",
      key_point: "Dynamic cinematic smoke display"
    }
  ],
  benefits: [
    { title: "Visual Karbon & Neon Mematikan", description: "Warna hijau neon dan tekstur karbon fiber di bawah sorot LED futuristik menciptakan efek candu visual (eyecandy) yang memikat." },
    { title: "Desing ASMR Mekanis", description: "Suara garing silet unboxing, putaran roda paddock stand yang mendesing cepat, dan obeng hex menghasilkan stimulasi ASMR kepuasan teknik murni." },
    { title: "Retensi Tinggi (Dwell Time)", description: "Proses merakit barang rumit berukuran kecil di atas meja menjaga mata penonton tetap terpaku lama untuk Reels/Shorts." },
    { title: "Niche Premium Hobi Kolektor", description: "Menarik pasar kolektor hobi berpenghasilan tinggi dan penggila otomotif, meningkatkan rate sponsor mainan." }
  ],
  caption: "The ultimate hyper-naked beast in 1:18 micro scale! 🏍️ Assembling the legendary Kawasaki Ninja H2R with absolute precision. Lubricating miniature gears, tightening microscopic hex bolts, and listening to that satisfying rear wheel spin on the paddock stand. That high-pitched mechanical chain ASMR is pure gold! Double tap if you need this toy! 🟢⚡\n\n#ninjah2r #kawasaki #miniaturetoy #toyassembly #asmrunboxing #diecastcollector #toycar #motorcycleminiature #satisfyingtoy #scalemodel",
  hashtags: ["ninjah2r", "kawasaki", "miniaturetoy", "toyassembly", "asmrunboxing", "diecastcollector", "toycar", "motorcycleminiature", "satisfyingtoy", "scalemodel"]
};

const MiniToyStudio: React.FC<MiniToyStudioProps> = ({ onBack }) => {
  const [toyName, setToyName] = useState('Kawasaki Ninja H2R');
  const [duration, setDuration] = useState('10');
  const [backgroundStyle, setBackgroundStyle] = useState('Modern Studio dengan Lampu Neon LED');
  const [handType, setHandType] = useState('Pria (Sarung Tangan Hitam)');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(NINJA_H2R_PRESET);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy helpers
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [currentPart, setCurrentPart] = useState<'part_1' | 'part_2' | 'part_3'>('part_1');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file gambar maksimal 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toyName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini-mini-toy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toyName,
          duration,
          backgroundStyle,
          handType,
          referenceImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem membuat storyboard mainan');
      }

      setStoryboard(data);
      setCurrentPart('part_1');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Koneksi terputus. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getFlowAiJson = () => {
    if (!storyboard) return '';
    const activePr = currentPart === 'part_1' ? storyboard.prompt_part_1 : (currentPart === 'part_2' ? storyboard.prompt_part_2 : storyboard.prompt_part_3);
    const flowObj = {
      model: "Google Veo / Flow AI",
      aspect_ratio: "9:16",
      duration_seconds: 10,
      toy_name: toyName || "Miniature Toy",
      studio_style: backgroundStyle,
      hand_pov: handType,
      master_visual_prompt: activePr,
      asmr_audio_tracks: activeFrames.map(f => `[${f.time_range}] ${f.voiceover_or_audio}`).join(' '),
      frame_sequence: activeFrames.map(f => ({
        frame: f.frame_number,
        timestamp: f.time_range,
        action: f.action_title,
        prompt: f.visual_prompt,
        asmr_sound: f.voiceover_or_audio,
        key_point: f.key_point
      })),
      social_metadata: {
        caption: storyboard.caption,
        hashtags: storyboard.hashtags
      }
    };
    return JSON.stringify(flowObj, null, 2);
  };

  const getActiveFrames = () => {
    if (!storyboard) return [];
    if (currentPart === 'part_1') return storyboard.part_1_frames;
    if (currentPart === 'part_2') return storyboard.part_2_frames;
    return storyboard.part_3_frames;
  };

  const activeFrames = getActiveFrames();

  return (
    <div id="mini-toy-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Glass Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h1 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Mini Toy Studio
              </h1>
            </div>
            <p className="text-[10px] text-slate-500">Unboxing, assembly, mechanical testing and high-fidelity toy ASMR</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-cyan-400/20 tracking-wider">
            VEOCREATOR 9:16
          </span>
        </div>
      </header>

      {/* Main Container Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Board (Input Form) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Setelan Produksi</h2>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" title="Posisikan miniatur di atas meja gelap bermotif karbon dengan pencahayaan neon terpusat" />
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {/* Toy Model Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-cyan-400" />
                  Nama Model / Mainan Miniatur
                </label>
                <input 
                  type="text" 
                  value={toyName}
                  onChange={(e) => setToyName(e.target.value)}
                  placeholder="Contoh: Kawasaki Ninja H2R, Gundam RG, Tamiya Avante"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Upload Foto Referensi Motor / Mainan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Upload className="w-3.5 h-3.5" />
                    Foto Referensi Motor / Mainan
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">(Opsional)</span>
                </label>

                {referenceImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 flex items-center gap-3">
                    <img 
                      src={referenceImage} 
                      alt="Foto Referensi Motor" 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-slate-200 truncate">Foto Referensi Terpasang</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Siap dianalisis AI</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferenceImage(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Hapus foto referensi"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition-all group text-center">
                    <Upload className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Upload Foto Motor</span>
                    <span className="text-[9px] text-slate-500 font-mono">PNG, JPG, WEBP (Max 10MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Total Duration Slider */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex justify-between">
                  <span>DURASI GENERATION</span>
                  <span className="text-cyan-400 font-bold">{duration} Detik</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '10', label: '10s (Short)' },
                    { value: '20', label: '20s (Fast)' },
                    { value: '30', label: '30s (Full)' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDuration(opt.value)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                        duration === opt.value 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Style */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Latar Belakang / Studio View
                </label>
                <select
                  value={backgroundStyle}
                  onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium"
                >
                  <option value="Modern Studio dengan Lampu Neon LED">Modern Studio Carbon, Neon Green/Blue LED</option>
                  <option value="Industrial Wood Workshop Table with Warm Edison Bulbs">Industrial Wood Workshop, Warm Edison Bulbs</option>
                  <option value="Cyberpunk Tech-Lab Desk with Holographic Glare">Cyberpunk Tech-Lab Desk, Purple Hologram Glow</option>
                  <option value="Minimalist Snowy White Diorama with Soft Diffused Sun">Minimalist White Diorama, Soft Daylight</option>
                </select>
              </div>

              {/* Glove & Hand Style */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Tampilan Model Tangan (POV)
                </label>
                <select
                  value={handType}
                  onChange={(e) => setHandType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium"
                >
                  <option value="Pria (Sarung Tangan Hitam)">Pria (Sarung Tangan Hitam Mekanik)</option>
                  <option value="Wanita (Sarung Tangan Putih Elegan)">Wanita (Sarung Tangan Putih Estetik)</option>
                  <option value="Pria (Tangan Polos Bersih - Clean Hands)">Pria (Tangan Polos Tanpa Sarung Tangan)</option>
                  <option value="Wanita (Kuku Seni Terawat - Clean Nails)">Wanita (Kuku Terawat Tanpa Sarung Tangan)</option>
                </select>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-black font-black text-xs uppercase py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(34,211,238,0.25)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    Menganalisis Mainan & Merancang ASMR...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    Rancang Storyboard Perakitan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Checklist Box */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase text-indigo-400 mb-3 flex items-center gap-1.5 tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Formula ASMR Otomotif / Toy
            </h3>
            <ul className="flex flex-col gap-2.5 text-[10px] text-slate-400">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Unboxing Segel</strong>: Memperlihatkan robekan cutter, stiker segel koyak, dan instruksi lipat miniatur yang berbunyi tajam.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Pipet & Oli</strong>: Menggunakan tetesan pelumas visual bergelembung pada gir kecil logam untuk memicu kepuasan mekanis.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Uji paddock & Rantai</strong>: Menggunakan putaran kencang roda belakang hingga menghasilkan decitan angin cepat dan desing gir.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Preview Panel (Aesthetic Output) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 shrink-0" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {storyboard ? (
            <div className="flex flex-col gap-6">
              
              {/* Output Prompt JSON (Flow AI / Veo Format) - Featured Header Card */}
              <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-extrabold uppercase text-indigo-300 tracking-wider">
                      Output Prompt JSON (Siap Copy untuk Flow AI / Veo Generator)
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getFlowAiJson(), 'flow-ai-json')}
                    className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {copiedText === 'flow-ai-json' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Disalin ke Clipboard ✓
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-indigo-400" />
                        Salin Output JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-56 scrollbar-thin">
                  {getFlowAiJson()}
                </pre>
              </div>

              {/* Viral social copy board (Caption & Hashtags) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Caption box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">Caption Media Sosial</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(storyboard.caption, 'caption')}
                      className="text-[10px] font-bold uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 border border-cyan-400/20 px-2 py-1 rounded"
                    >
                      {copiedText === 'caption' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Disalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Caption
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {storyboard.caption}
                  </div>
                </div>

                {/* Dynamic Tags */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">Hashtags Viral</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(storyboard.hashtags.map(t => `#${t}`).join(' '), 'tags')}
                      className="text-[10px] font-bold uppercase text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 border border-indigo-400/20 px-2 py-1 rounded"
                    >
                      {copiedText === 'tags' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Disalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Tagar
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {storyboard.hashtags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[9px] font-mono px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                        onClick={() => copyToClipboard(`#${tag}`, `tag-${idx}`)}
                      >
                        #{tag} {copiedText === `tag-${idx}` ? '✓' : ''}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sequential Parts navigation */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-6">
                
                {/* Horizontal Navigation tabs */}
                <div className="flex border-b border-slate-800 pb-1.5 gap-4 overflow-x-auto">
                  {[
                    { key: 'part_1', label: 'Part 1: Unboxing & Sorting (0-10s)' },
                    { key: 'part_2', label: 'Part 2: Precision Assembly (10-20s)' },
                    { key: 'part_3', label: 'Part 3: Testing & Showcase (20-30s)' }
                  ].filter((tab) => {
                    if (duration === '10') return tab.key === 'part_1';
                    if (duration === '20') return tab.key !== 'part_3';
                    return true;
                  }).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setCurrentPart(tab.key as any);
                      }}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                        currentPart === tab.key 
                        ? 'border-cyan-400 text-cyan-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Prompt generator blocks for this part */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Visual prompt untuk Part Ini (Veo / Luma Generator Prompt)
                    </span>
                    <button
                      onClick={() => {
                        const pr = currentPart === 'part_1' ? storyboard.prompt_part_1 : (currentPart === 'part_2' ? storyboard.prompt_part_2 : storyboard.prompt_part_3);
                        copyToClipboard(pr, 'active-part-prompt');
                      }}
                      className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 px-2.5 py-1 rounded transition-all"
                    >
                      {copiedText === 'active-part-prompt' ? 'Disalin ✓' : 'Salin Visual Prompt'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800">
                    {currentPart === 'part_1' ? storyboard.prompt_part_1 : (currentPart === 'part_2' ? storyboard.prompt_part_2 : storyboard.prompt_part_3)}
                  </p>
                </div>

                {/* Detailed 4 Sequential Frames */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeFrames.map((frame) => (
                    <div 
                      key={frame.frame_number}
                      className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all text-left flex flex-col gap-3 relative overflow-hidden group"
                    >
                      {/* Frame Time tag */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">FRAME {frame.frame_number} • {frame.time_range}</span>
                        <span className="text-[8px] bg-cyan-400/10 text-cyan-400 font-black px-1.5 py-0.5 rounded font-mono">2.5s</span>
                      </div>

                      {/* Frame title */}
                      <h4 className="text-xs font-black uppercase text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {frame.action_title}
                      </h4>

                      {/* Visual instructions */}
                      <div className="flex flex-col gap-1 bg-slate-900/40 p-2.5 rounded border border-slate-800">
                        <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Visual Prompt (English):
                        </span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                          {frame.visual_prompt}
                        </p>
                      </div>

                      {/* ASMR detail */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Bunyi ASMR & Musik:
                        </span>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          {frame.voiceover_or_audio}
                        </p>
                      </div>

                      {/* Key point */}
                      <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-2 mt-1 flex justify-between items-center font-mono">
                        <span>Poin Kunci: <strong>{frame.key_point}</strong></span>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* 4 Core Selling points / benefits */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">Keunggulan Konten Rakitan Miniatur Ini</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storyboard.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                      <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">0{bIdx + 1}. {benefit.title}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[30rem]">
              <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 mb-4 text-cyan-400 animate-pulse">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200 uppercase tracking-widest mb-2">Belum Ada Storyboard Toy</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                Masukkan nama miniatur mainan impian Anda di panel kiri lalu klik tombol generator untuk merancang storyboard, prompt visual, asmr, serta copywriting digital berbahasa Inggris.
              </p>
            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default MiniToyStudio;
