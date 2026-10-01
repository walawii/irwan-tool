import React, { useState } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Copy, Check, Info, FileText, Music, Hash, Radio, 
  Heart, HelpCircle, Eye, FileJson, Download, ImageIcon, RefreshCw, LayoutGrid, 
  CheckCircle2, Sliders, User, MapPin, Zap, Shield, Activity, ChevronRight, Play,
  ChevronLeft, Pause, Volume2, Bike, Wrench, Scissors, Share2, Upload, X, Box,
  Camera, Flame, Film, Package, Layers, Sparkle, ShoppingBag
} from 'lucide-react';

interface MiniLapseFrame {
  row_number: number;
  timecode: string;
  visual_description: string;
  action_detail: string;
  transition_detail: string;
  sfx_detail: string;
  camera_detail: string;
  sketch_description: string;
  macro_photo_placeholder?: string;
}

interface ProjectMemory {
  character: string;
  location: string;
  time: string;
  props: string;
  theme: string;
  visualStyle: string;
  cameraStyle: string;
}

interface AudioOverall {
  voice: string;
  music: string;
  sfx: string;
}

interface MiniLapseData {
  title: string;
  totalDuration: string;
  format: string;
  style: string;
  category: string;
  subject: string;
  colorDesign: string;
  backgroundStudio: string;
  storyboardPromptOutput1: string;
  frames: MiniLapseFrame[];
  projectMemory: ProjectMemory;
  audioOverall: AudioOverall;
  caption: string;
  hashtags: string[];
}

interface MiniLapseStudioProps {
  onBack: () => void;
}

// Preset Data matching the user's reference screenshots (Jimny, Gundam, PCX)
const PRESET_JIMNY_SIERRA: MiniLapseData = {
  title: "STORYBOARD ASMR - SUZUKI JIMNY SIERRA",
  totalDuration: "10 DETIK",
  format: "POTRAIT 9:16",
  style: "HYPER REALISTIC, CINEMATIC ASMR",
  category: "Car",
  subject: "Suzuki Jimny Sierra",
  colorDesign: "Executive Matte Grey",
  backgroundStudio: "Dark Industrial Workshop (Warm Tungsten Light)",
  storyboardPromptOutput1: `A highly detailed, professional UI/UX video storyboard document, designed as a tall, continuous vertical infographic layout in a single image, portrait 9:16.

HEADER: "STORYBOARD ASMR - SUZUKI JIMNY SIERRA". "DURASI TOTAL: 10 DETIK | FORMAT: POTRAIT 9:16 | GAYA: HYPER REALISTIC, CINEMATIC ASMR".
NEGATIVE PROMPT: "watermark, text, signature, logo, brand name, overlay text, typography, writing, split-screen, collage, multi-panel, grid, border, frame, low quality, blur, distortion".

LAYOUT: A 4-column vertical table with exactly 10 rows, followed by a 2-column footer section, all on solid black background with white text and thin white borders.

ALUR ADEGAN KONTINU:
1. Unboxing & Potong Segel (0.00-2.00s)
2. Penataan Part (2.00-3.00s)
3. Perakitan Sasis & Mesin Mikro (3.00-5.00s)
4. Pemasangan Roda & Knalpot (5.00-6.00s)
5. Bodi Fairing & Stiker Decal (6.00-8.00s)
6. Engine Start, Paddock Stand, & Knalpot Berapi (8.00-10.00s)

COLUMN 1 (per row): TIMECODE. Rows 1-10: 0.00-1.00, 1.00-2.00, 2.00-3.00, 3.00-4.00, 4.00-5.00, 5.00-6.00, 6.00-7.00, 7.00-8.00, 8.00-9.00, 9.00-10.00.

COLUMN 2 (per row): VISUAL. High-resolution cinematic 9:16 vertical macro photograph of black-gloved hands assembling Suzuki Jimny Sierra 4WD car components in Executive Matte Grey finish.

COLUMN 3 (per row): LABELS. VISUAL, AKSI, TRANSISI, SFX, KAMERA breakdown.

COLUMN 4 (per row): SKETSA STORYBOARD. Clean monochrome line art sketch.

FOOTER SECTION:
Box 1 (PROJECT MEMORY):
- KARAKTER: Suzuki Jimny Sierra (Executive Matte Grey color reference)
- LOKASI: Dark Industrial Workshop (Warm Tungsten Light)
- WAKTU: Studio Lighting
- PROPERTI: Packaging box, micro cutter, model components, display stand
- TEMA: Detail, precision assembly, satisfaction, ASMR
- VISUAL STYLE: Hyper realistic, macro detail, cinematic lighting
- CAMERA STYLE: Macro close-up, tracking shot, focus pull

Box 2 (AUDIO OVERALL):
- VOICE: Tidak ada (ASMR Only)
- MUSIK: Ambient cinematic lembut, hampir tidak terdengar
- SFX: Potong segel, klik, gesekan, putaran roda, roar mesin & knalpot berapi`,
  frames: [
    {
      row_number: 1,
      timecode: "0.00–1.00",
      visual_description: "[Unboxing & Potong Segel] Extreme macro shot of black-gloved hands using a fine cutter blade to slice open the transparent security seal of the Executive Matte Grey Suzuki Jimny Sierra packaging box.",
      action_detail: "Cutter blade glides through plastic seal with smooth precision motion.",
      transition_detail: "Match cut as plastic seal snaps open.",
      sfx_detail: "[ASMR: Sharp slice sound of cutter blade cutting plastic seal]",
      camera_detail: "Extreme macro top-down static shot, shallow depth of field.",
      sketch_description: "Precision cutter slicing plastic seal on Jimny box."
    },
    {
      row_number: 2,
      timecode: "1.00–2.00",
      visual_description: "[Unboxing & Potong Segel] Black-gloved hands lifting the Executive Matte Grey packaging box lid vertically, revealing micro 4WD car components in gray foam inserts.",
      action_detail: "Gloved thumbs lift box cover straight up to show arranged parts.",
      transition_detail: "Smooth tilt down into inner tray.",
      sfx_detail: "[ASMR: Crisp cardboard pop and foam friction sound]",
      camera_detail: "Macro 9:16 portrait view, slow tilt downward.",
      sketch_description: "Lifting lid off Jimny packaging box."
    },
    {
      row_number: 3,
      timecode: "2.00–3.00",
      visual_description: "[Penataan Part] Laying out all disassembled micro parts—1.5L engine block, ladder frame chassis, off-road wheels, Executive Matte Grey body panels, decals—neatly on workshop mat.",
      action_detail: "Gloved hands organize parts into neat grid layout for assembly.",
      transition_detail: "Slow whip pan across organized components.",
      sfx_detail: "[ASMR: Satisfying plastic-on-mat tapping clicks]",
      camera_detail: "Low-angle tracking shot gliding across arranged parts.",
      sketch_description: "Neat arrangement of Jimny 4WD parts on tray."
    },
    {
      row_number: 4,
      timecode: "3.00–4.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Gloved fingers installing the micro 1.5L engine block into the steel ladder frame chassis and locking 4WD transmission.",
      action_detail: "Hands press engine block into chassis cradle until locking clips snap.",
      transition_detail: "Hard cut to tightening chassis bolt.",
      sfx_detail: "[ASMR: Deep mechanical click and metallic bolt snap]",
      camera_detail: "Extreme macro close-up, focus locked on engine mount.",
      sketch_description: "Installing micro 1.5L engine into ladder frame chassis."
    },
    {
      row_number: 5,
      timecode: "4.00–5.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Mounting front and rear heavy-duty suspension coil springs and solid axles onto the chassis.",
      action_detail: "Fine tweezers guide suspension pins into frame sockets with precision push.",
      transition_detail: "Cross dissolve as suspension locks in place.",
      sfx_detail: "[ASMR: Tweezer click and metallic pin lock sound]",
      camera_detail: "Front-angle macro shot, rack focus from tweezers to frame.",
      sketch_description: "Mounting heavy-duty coil springs and solid axles."
    },
    {
      row_number: 6,
      timecode: "5.00–6.00",
      visual_description: "[Pemasangan Roda & Knalpot] Attaching off-road alloy wheels with rubber tread tires onto axles, then snapping side-exit stainless exhaust pipe onto engine manifold.",
      action_detail: "Spinning front off-road wheel to check rotation, then locking stainless exhaust pipe.",
      transition_detail: "Match cut on wheel spin to exhaust mounting.",
      sfx_detail: "[ASMR: Wheel spin whistle and tight metallic exhaust snap]",
      camera_detail: "Side macro tracking shot following wheel and exhaust.",
      sketch_description: "Attaching off-road wheels and stainless side exhaust pipe."
    },
    {
      row_number: 7,
      timecode: "6.00–7.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Lowering the main Executive Matte Grey body shell, roof rack, and interior seating assembly over the chassis.",
      action_detail: "Hands press body shell evenly until perimeter locking tabs click in unison.",
      transition_detail: "Slow push-in as body shell seats flush.",
      sfx_detail: "[ASMR: Resonant double-click of main body shell snap]",
      camera_detail: "Three-quarter orbiting view around Executive Matte Grey body.",
      sketch_description: "Snapping main body shell and roof rack over chassis."
    },
    {
      row_number: 8,
      timecode: "7.00–8.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Applying custom off-road emblem decals and metallic 'JIMNY 4WD' badging precisely onto the side fender using tweezers.",
      action_detail: "Tweezers peel backing and press decal sticker, gloved finger smooths it down.",
      transition_detail: "Match cut on finger smoothing decal.",
      sfx_detail: "[ASMR: Soft decal peel and smooth squeak of gloved finger]",
      camera_detail: "Extreme macro close-up on decal sticker application.",
      sketch_description: "Applying decal stickers and metallic 4WD badges."
    },
    {
      row_number: 9,
      timecode: "8.00–9.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Mounting the complete Suzuki Jimny Sierra onto a heavy-duty display stand, gloved finger pressing engine start button.",
      action_detail: "Display stand lifts model, finger clicks start button, LED headlights & dash illuminate.",
      transition_detail: "Whip pan to exhaust pipe tip.",
      sfx_detail: "[ASMR: Crisp button click, starter motor spin, deep idle rumble]",
      camera_detail: "Low-angle hero shot showing display stand and lit LED headlights.",
      sketch_description: "Suzuki Jimny Sierra on display stand with engine starter pressed."
    },
    {
      row_number: 10,
      timecode: "9.00–10.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Gloved hand revving 4WD engine on display stand as blue-orange flame pops burst from side exhaust pipe, clean hero view.",
      action_detail: "Throttle revs, blue and orange flames spit out of exhaust tip in dramatic finish.",
      transition_detail: "Slow zoom out holding hero pose.",
      sfx_detail: "[ASMR: Powerful 4WD engine revs, exhaust flame pops & crackles]",
      camera_detail: "Cinematic 180-degree slow orbit around revving Jimny Sierra on display stand.",
      sketch_description: "Hero shot of Jimny Sierra revving with exhaust flames."
    }
  ],
  projectMemory: {
    character: "Suzuki Jimny Sierra (Executive Matte Grey color reference)",
    location: "Dark Industrial Workshop (Warm Tungsten Light)",
    time: "Studio Lighting scenario",
    props: "Packaging box, micro cutter, model components, display stand",
    theme: "Detail, precision assembly, satisfaction, ASMR",
    visualStyle: "Hyper realistic, macro detail, cinematic lighting",
    cameraStyle: "Macro close-up, tracking shot, focus pull"
  },
  audioOverall: {
    voice: "Tidak ada (ASMR Only)",
    music: "Ambient cinematic lembut, hampir tidak terdengar",
    sfx: "Potong segel, klik, gesekan, putaran roda, roar mesin & knalpot berapi"
  },
  caption: "Satisfying assembly & engine start of Suzuki Jimny Sierra in Executive Matte Grey! 🚗🔥 Unboxing to exhaust flames on display stand.",
  hashtags: ["suzukijimny", "jimnysierra", "exhaustflames", "diecastasmr", "displaystand", "satisfyingassembly", "suzuki"]
};

const PRESET_GUNDAM: MiniLapseData = {
  title: "STORYBOARD ASMR - STRIKER-CLASS BATTLE GUNDAM",
  totalDuration: "10 DETIK",
  format: "POTRAIT 9:16",
  style: "HYPER REALISTIC, CINEMATIC ASMR",
  category: "Gunpla / Mecha",
  subject: "Striker-Class Battle Gundam",
  colorDesign: "Pearl White & Sapphire Blue",
  backgroundStudio: "Vintage Brass & Wood Collector Desk",
  storyboardPromptOutput1: `A highly detailed, professional UI/UX video storyboard document, designed as a tall, continuous vertical infographic layout in a single image, portrait 9:16.

HEADER: "STORYBOARD ASMR - STRIKER-CLASS BATTLE GUNDAM". "DURASI TOTAL: 10 DETIK | FORMAT: POTRAIT 9:16 | GAYA: HYPER REALISTIC, CINEMATIC ASMR".
NEGATIVE PROMPT: "watermark, text, signature, logo, brand name, overlay text, typography, writing, split-screen, collage, multi-panel, grid, border, frame, low quality, blur, distortion".

LAYOUT: A 4-column vertical table with exactly 10 rows, followed by a 2-column footer section, all on solid black background with white text and thin white borders.

ALUR ADEGAN KONTINU:
1. Unboxing & Potong Segel (0.00-2.00s)
2. Penataan Part (2.00-3.00s)
3. Perakitan Sasis & Mesin Mikro (3.00-5.00s)
4. Pemasangan Roda & Knalpot / Thruster (5.00-6.00s)
5. Bodi Fairing & Stiker Decal (6.00-8.00s)
6. Engine Start, Paddock Stand, & Thrusters (8.00-10.00s)

COLUMN 1 (per row): TIMECODE. Rows 1-10: 0.00-1.00, 1.00-2.00, 2.00-3.00, 3.00-4.00, 4.00-5.00, 5.00-6.00, 6.00-7.00, 7.00-8.00, 8.00-9.00, 9.00-10.00.

COLUMN 2 (per row): VISUAL. High-resolution cinematic 9:16 vertical macro photograph of black-gloved hands assembling Striker-Class Battle Gundam mecha in Pearl White & Sapphire Blue finish.

COLUMN 3 (per row): LABELS. VISUAL, AKSI, TRANSISI, SFX, KAMERA breakdown.

COLUMN 4 (per row): SKETSA STORYBOARD. Clean monochrome line art sketch.

FOOTER SECTION:
Box 1 (PROJECT MEMORY):
- KARAKTER: Striker-Class Battle Gundam (Pearl White & Sapphire Blue color reference)
- LOKASI: Vintage Brass & Wood Collector Desk
- WAKTU: Studio Lighting
- PROPERTI: Packaging box, micro cutter, model components, action base stand
- TEMA: Detail, precision assembly, satisfaction, ASMR
- VISUAL STYLE: Hyper realistic, macro detail, cinematic lighting
- CAMERA STYLE: Macro close-up, tracking shot, focus pull

Box 2 (AUDIO OVERALL):
- VOICE: Tidak ada (ASMR Only)
- MUSIK: Ambient cinematic lembut, hampir tidak terdengar
- SFX: Potong segel, klik, gesekan, roar reactor & thruster plasma flames`,
  frames: [
    {
      row_number: 1,
      timecode: "0.00–1.00",
      visual_description: "[Unboxing & Potong Segel] Extreme macro shot of black-gloved hands using a fine cutter blade to slice open the transparent security seal of the Pearl White & Sapphire Blue Gundam box.",
      action_detail: "Cutter blade glides through plastic seal with smooth precision motion.",
      transition_detail: "Match cut as plastic seal snaps open.",
      sfx_detail: "[ASMR: Sharp slice sound of cutter blade cutting plastic seal]",
      camera_detail: "Extreme macro top-down static shot, shallow depth of field.",
      sketch_description: "Precision cutter slicing plastic seal on Gundam box."
    },
    {
      row_number: 2,
      timecode: "1.00–2.00",
      visual_description: "[Unboxing & Potong Segel] Black-gloved hands lifting the Pearl White packaging box lid vertically, revealing runner sheets and micro mecha components.",
      action_detail: "Gloved thumbs lift box cover straight up to show arranged runner sheets.",
      transition_detail: "Smooth tilt down into inner tray.",
      sfx_detail: "[ASMR: Crisp cardboard pop and plastic friction sound]",
      camera_detail: "Macro 9:16 portrait view, slow tilt downward.",
      sketch_description: "Lifting lid off Gundam packaging box."
    },
    {
      row_number: 3,
      timecode: "2.00–3.00",
      visual_description: "[Penataan Part] Laying out all disassembled micro parts—fusion reactor core, inner frame skeleton, armor plates, rocket thrusters, decals—neatly on collector desk.",
      action_detail: "Gloved hands organize parts into neat grid layout for assembly.",
      transition_detail: "Slow whip pan across organized components.",
      sfx_detail: "[ASMR: Satisfying plastic-on-wood tapping clicks]",
      camera_detail: "Low-angle tracking shot gliding across arranged parts.",
      sketch_description: "Neat arrangement of Gundam runner parts on desk."
    },
    {
      row_number: 4,
      timecode: "3.00–4.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Gloved fingers installing the micro fusion reactor core into the articulated mecha inner frame skeleton and locking chest clips.",
      action_detail: "Hands press fusion reactor core into torso cradle until locking clips snap.",
      transition_detail: "Hard cut to tightening chest latch.",
      sfx_detail: "[ASMR: Deep mechanical click and metallic latch snap]",
      camera_detail: "Extreme macro close-up, focus locked on reactor mount.",
      sketch_description: "Installing micro fusion reactor core into inner frame skeleton."
    },
    {
      row_number: 5,
      timecode: "4.00–5.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Mounting articulated arm and leg limb joints into torso frame sockets with precision push.",
      action_detail: "Fine tweezers guide hydraulic joint pins into frame sockets with precision push.",
      transition_detail: "Cross dissolve as limb joints lock in place.",
      sfx_detail: "[ASMR: Tweezer click and metallic joint lock sound]",
      camera_detail: "Front-angle macro shot, rack focus from tweezers to frame.",
      sketch_description: "Mounting articulated limb joints onto inner frame."
    },
    {
      row_number: 6,
      timecode: "5.00–6.00",
      visual_description: "[Pemasangan Roda & Knalpot] Attaching high-mobility rocket thruster backpack onto rear spine, snapping thruster nozzles into place.",
      action_detail: "Adjusting thruster nozzle angle, then snapping backpack onto spine.",
      transition_detail: "Match cut on nozzle adjustment to backpack mounting.",
      sfx_detail: "[ASMR: Ratchet click and tight metallic backpack snap]",
      camera_detail: "Side macro tracking shot following thruster backpack.",
      sketch_description: "Attaching high-mobility rocket thruster backpack."
    },
    {
      row_number: 7,
      timecode: "6.00–7.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Lowering Sapphire Blue chest armor plates, shoulder pauldrons, and iconic V-fin head crest over inner frame.",
      action_detail: "Hands press armor plates evenly until perimeter locking tabs click in unison.",
      transition_detail: "Slow push-in as armor seats flush.",
      sfx_detail: "[ASMR: Resonant double-click of main armor shell snap]",
      camera_detail: "Three-quarter orbiting view around Sapphire Blue armor.",
      sketch_description: "Snapping main armor plates and V-fin over inner frame."
    },
    {
      row_number: 8,
      timecode: "7.00–8.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Applying metallic caution markings, E.F.S.F. emblem decals, and unit badging precisely onto shoulder armor using tweezers.",
      action_detail: "Tweezers peel backing and press decal sticker, gloved finger smooths it down.",
      transition_detail: "Match cut on finger smoothing decal.",
      sfx_detail: "[ASMR: Soft decal peel and smooth squeak of gloved finger]",
      camera_detail: "Extreme macro close-up on decal sticker application.",
      sketch_description: "Applying decal stickers and metallic mecha badges."
    },
    {
      row_number: 9,
      timecode: "8.00–9.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Mounting the complete Striker Gundam onto an illuminated action base stand, gloved finger pressing power activation switch.",
      action_detail: "Action base lifts Gundam, finger clicks power switch, LED eyes & chest sensor illuminate.",
      transition_detail: "Whip pan to rear thruster nozzles.",
      sfx_detail: "[ASMR: Crisp button click, reactor hum, power-up surge sound]",
      camera_detail: "Low-angle hero shot showing action base stand and glowing LED eyes.",
      sketch_description: "Striker Gundam on action base stand with reactor power switch pressed."
    },
    {
      row_number: 10,
      timecode: "9.00–10.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Fusion reactor engages as intense blue-orange plasma thruster flames burst from rocket backpack, clean hero view.",
      action_detail: "Reactor surges, fiery plasma flames & sparks burst out of thruster nozzles in dramatic finish.",
      transition_detail: "Slow zoom out holding hero pose.",
      sfx_detail: "[ASMR: Powerful reactor roar, plasma thruster flames & crackles]",
      camera_detail: "Cinematic 180-degree slow orbit around powering Striker Gundam on action base stand.",
      sketch_description: "Hero shot of Striker Gundam surging with plasma thruster flames."
    }
  ],
  projectMemory: {
    character: "Striker-Class Battle Gundam (Pearl White & Sapphire Blue color reference)",
    location: "Vintage Brass & Wood Collector Desk",
    time: "Studio Lighting scenario",
    props: "Packaging box, micro cutter, model components, action base stand",
    theme: "Detail, precision assembly, satisfaction, ASMR",
    visualStyle: "Hyper realistic, macro detail, cinematic lighting",
    cameraStyle: "Macro close-up, tracking shot, focus pull"
  },
  audioOverall: {
    voice: "Tidak ada (ASMR Only)",
    music: "Ambient cinematic lembut, hampir tidak terdengar",
    sfx: "Potong segel, klik, gesekan, roar reactor & thruster plasma flames"
  },
  caption: "Satisfying assembly & power-on of Striker-Class Battle Gundam in Pearl White & Sapphire Blue! 🤖🔥 Unboxing to plasma thruster flames.",
  hashtags: ["gunpla", "gundam", "thrusterflames", "diecastasmr", "actionbase", "satisfyingassembly", "mecha"]
};

const PRESET_PCX_160: MiniLapseData = {
  title: "STORYBOARD ASMR - HONDA PCX 160",
  totalDuration: "10 DETIK",
  format: "POTRAIT 9:16",
  style: "HYPER REALISTIC, CINEMATIC ASMR",
  category: "Motorcycle",
  subject: "Honda PCX 160",
  colorDesign: "Burgundy Wine Red",
  backgroundStudio: "Minimalist White Studio (Softbox Lighting)",
  storyboardPromptOutput1: `A highly detailed, professional UI/UX video storyboard document, designed as a tall, continuous vertical infographic layout in a single image, portrait 9:16.

HEADER: "STORYBOARD ASMR - HONDA PCX 160". "DURASI TOTAL: 10 DETIK | FORMAT: POTRAIT 9:16 | GAYA: HYPER REALISTIC, CINEMATIC ASMR".
NEGATIVE PROMPT: "watermark, text, signature, logo, brand name, overlay text, typography, writing, split-screen, collage, multi-panel, grid, border, frame, low quality, blur, distortion".

LAYOUT: A 4-column vertical table with exactly 10 rows, followed by a 2-column footer section, all on solid black background with white text and thin white borders.

ALUR ADEGAN KONTINU:
1. Unboxing & Potong Segel (0.00-2.00s)
2. Penataan Part (2.00-3.00s)
3. Perakitan Sasis & Mesin Mikro (3.00-5.00s)
4. Pemasangan Roda & Knalpot (5.00-6.00s)
5. Bodi Fairing & Stiker Decal (6.00-8.00s)
6. Engine Start, Paddock Stand, & Knalpot Berapi (8.00-10.00s)

COLUMN 1 (per row): TIMECODE. Rows 1-10: 0.00-1.00, 1.00-2.00, 2.00-3.00, 3.00-4.00, 4.00-5.00, 5.00-6.00, 6.00-7.00, 7.00-8.00, 8.00-9.00, 9.00-10.00.

COLUMN 2 (per row): VISUAL. High-resolution cinematic 9:16 vertical macro photograph of black-gloved hands assembling Honda PCX 160 scooter components in Burgundy Wine Red finish.

COLUMN 3 (per row): LABELS. VISUAL, AKSI, TRANSISI, SFX, KAMERA breakdown.

COLUMN 4 (per row): SKETSA STORYBOARD. Clean monochrome line art sketch.

FOOTER SECTION:
Box 1 (PROJECT MEMORY):
- KARAKTER: Honda PCX 160 (Burgundy Wine Red color reference)
- LOKASI: Minimalist White Studio (Softbox Lighting)
- WAKTU: Studio Lighting
- PROPERTI: Packaging box, micro cutter, model components, paddock stand
- TEMA: Detail, precision assembly, satisfaction, ASMR
- VISUAL STYLE: Hyper realistic, macro detail, cinematic lighting
- CAMERA STYLE: Macro close-up, tracking shot, focus pull

Box 2 (AUDIO OVERALL):
- VOICE: Tidak ada (ASMR Only)
- MUSIK: Ambient cinematic lembut, hampir tidak terdengar
- SFX: Potong segel, klik, gesekan, putaran roda, roar mesin & knalpot berapi`,
  frames: [
    {
      row_number: 1,
      timecode: "0.00–1.00",
      visual_description: "[Unboxing & Potong Segel] Extreme macro shot of black-gloved hands using a fine cutter blade to slice open the transparent security seal of the Burgundy Wine Red Honda PCX 160 packaging box.",
      action_detail: "Cutter blade glides through plastic seal with smooth precision motion.",
      transition_detail: "Match cut as plastic seal snaps open.",
      sfx_detail: "[ASMR: Sharp slice sound of cutter blade cutting plastic seal]",
      camera_detail: "Extreme macro top-down static shot, shallow depth of field.",
      sketch_description: "Precision cutter slicing plastic seal on PCX 160 box."
    },
    {
      row_number: 2,
      timecode: "1.00–2.00",
      visual_description: "[Unboxing & Potong Segel] Black-gloved hands lifting the Burgundy Wine Red packaging box lid vertically, revealing micro model components nestled in gray foam inserts.",
      action_detail: "Gloved thumbs lift box cover straight up to show arranged parts.",
      transition_detail: "Smooth tilt down into inner tray.",
      sfx_detail: "[ASMR: Crisp cardboard pop and foam friction sound]",
      camera_detail: "Macro 9:16 portrait view, slow tilt downward.",
      sketch_description: "Lifting lid off PCX 160 packaging box."
    },
    {
      row_number: 3,
      timecode: "2.00–3.00",
      visual_description: "[Penataan Part] Laying out all disassembled micro parts—160cc eSP+ engine block, tubular frame, wheels, Burgundy Wine Red fairings, decals—neatly on white studio mat.",
      action_detail: "Gloved hands organize parts into neat grid layout for assembly.",
      transition_detail: "Slow whip pan across organized components.",
      sfx_detail: "[ASMR: Satisfying plastic-on-mat tapping clicks]",
      camera_detail: "Low-angle tracking shot gliding across arranged parts.",
      sketch_description: "Neat arrangement of PCX 160 parts on studio tray."
    },
    {
      row_number: 4,
      timecode: "3.00–4.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Gloved fingers installing the micro 160cc eSP+ engine block into the tubular steel chassis frame and locking micro bolts.",
      action_detail: "Hands press engine block into chassis cradle until locking clips snap.",
      transition_detail: "Hard cut to tightening chassis bolt.",
      sfx_detail: "[ASMR: Deep mechanical click and metallic bolt snap]",
      camera_detail: "Extreme macro close-up, focus locked on engine mount.",
      sketch_description: "Installing micro eSP+ engine into tubular steel chassis."
    },
    {
      row_number: 5,
      timecode: "4.00–5.00",
      visual_description: "[Perakitan Sasis & Mesin Mikro] Mounting rear dual shock absorbers and front telescopic suspension fork assembly onto the chassis.",
      action_detail: "Fine tweezers guide suspension pins into frame sockets with precision push.",
      transition_detail: "Cross dissolve as suspension locks in place.",
      sfx_detail: "[ASMR: Tweezer click and metallic pin lock sound]",
      camera_detail: "Front-angle macro shot, rack focus from tweezers to frame.",
      sketch_description: "Mounting telescopic front fork and rear shock absorbers."
    },
    {
      row_number: 6,
      timecode: "5.00–6.00",
      visual_description: "[Pemasangan Roda & Knalpot] Attaching alloy wheels with rubber tires onto axles, then snapping the high-performance stainless racing exhaust pipe onto engine manifold.",
      action_detail: "Spinning front wheel to check rotation, then locking racing exhaust pipe.",
      transition_detail: "Match cut on wheel spin to exhaust mounting.",
      sfx_detail: "[ASMR: Wheel spin whistle and tight metallic exhaust snap]",
      camera_detail: "Side macro tracking shot following wheel and exhaust.",
      sketch_description: "Attaching wheels and stainless racing exhaust pipe."
    },
    {
      row_number: 7,
      timecode: "6.00–7.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Lowering the main Burgundy Wine Red body fairing, fuel tank cover, and comfortable seat assembly over the frame.",
      action_detail: "Hands press body fairings evenly until perimeter locking tabs click in unison.",
      transition_detail: "Slow push-in as fairings seat flush.",
      sfx_detail: "[ASMR: Resonant double-click of main body fairing snap]",
      camera_detail: "Three-quarter orbiting view around Burgundy Wine Red body.",
      sketch_description: "Snapping main body fairing and seat over chassis."
    },
    {
      row_number: 8,
      timecode: "7.00–8.00",
      visual_description: "[Bodi Fairing & Stiker Decal] Applying custom emblem decal stickers and metallic 'PCX 160' badging precisely onto the side fairing using tweezers.",
      action_detail: "Tweezers peel backing and press decal sticker, gloved finger smooths it down.",
      transition_detail: "Match cut on finger smoothing decal.",
      sfx_detail: "[ASMR: Soft decal peel and smooth squeak of gloved finger]",
      camera_detail: "Extreme macro close-up on decal sticker application.",
      sketch_description: "Applying decal stickers and metallic badges."
    },
    {
      row_number: 9,
      timecode: "8.00–9.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Mounting the complete Honda PCX 160 onto a red rear paddock stand, gloved finger pressing engine start button.",
      action_detail: "Paddock stand lifts rear wheel, finger clicks start button, digital dash illuminates.",
      transition_detail: "Whip pan to exhaust pipe tip.",
      sfx_detail: "[ASMR: Crisp button click, starter motor spin, deep idle rumble]",
      camera_detail: "Low-angle hero shot showing paddock stand and lit dashboard.",
      sketch_description: "Honda PCX 160 on paddock stand with engine starter pressed."
    },
    {
      row_number: 10,
      timecode: "9.00–10.00",
      visual_description: "[Engine Start, Paddock Stand, Knalpot Berapi] Gloved hand twists throttle on paddock stand as blue-orange flame pops burst from the racing exhaust pipe, clean hero view.",
      action_detail: "Throttle revs, blue and orange flames spit out of exhaust tip in dramatic finish.",
      transition_detail: "Slow zoom out holding hero pose.",
      sfx_detail: "[ASMR: Powerful engine revs, exhaust flame pops & crackles]",
      camera_detail: "Cinematic 180-degree slow orbit around revving PCX 160 on paddock stand.",
      sketch_description: "Hero shot of PCX 160 revving with exhaust flames."
    }
  ],
  projectMemory: {
    character: "Honda PCX 160 (Burgundy Wine Red color reference)",
    location: "Minimalist White Studio (Softbox Lighting)",
    time: "Studio Lighting scenario",
    props: "Packaging box, micro cutter, model components, paddock stand",
    theme: "Detail, precision assembly, satisfaction, ASMR",
    visualStyle: "Hyper realistic, macro detail, cinematic lighting",
    cameraStyle: "Macro close-up, tracking shot, focus pull"
  },
  audioOverall: {
    voice: "Tidak ada (ASMR Only)",
    music: "Ambient cinematic lembut, hampir tidak terdengar",
    sfx: "Potong segel, klik, gesekan, putaran roda, roar mesin & knalpot berapi"
  },
  caption: "Satisfying assembly & engine start of Honda PCX 160 in Burgundy Wine Red! 🛵🔥 Unboxing to exhaust flames on paddock stand.",
  hashtags: ["hondapcx160", "pcx160", "exhaustflames", "diecastasmr", "paddockstand", "satisfyingassembly", "honda"]
};

export const MiniLapseStudio: React.FC<MiniLapseStudioProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'text' | 'photo'>('text');
  const [category, setCategory] = useState<string>('Motorcycle');
  const [subject, setSubject] = useState<string>('Honda PCX 160');
  const [colorDesign, setColorDesign] = useState<string>('Burgundy Wine Red');
  const [backgroundStudio, setBackgroundStudio] = useState<string>('Minimalist White Studio (Softbox Lighting)');
  const [duration, setDuration] = useState<string>('10s');
  const [gloveType, setGloveType] = useState<string>('Black Nitrile Gloved Hands (Sarung Tangan Hitam Matte)');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const [storyboard, setStoryboard] = useState<MiniLapseData | null>(PRESET_PCX_160);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'output1' | 'output2' | 'output3' | 'output4'>('output1');

  // Reset all settings to default initial state
  const handleResetToDefault = () => {
    setMode('text');
    setCategory('Motorcycle');
    setSubject('Honda PCX 160');
    setColorDesign('Burgundy Wine Red');
    setBackgroundStudio('Minimalist White Studio (Softbox Lighting)');
    setDuration('10s');
    setGloveType('Black Nitrile Gloved Hands (Sarung Tangan Hitam Matte)');
    setReferenceImage(null);
    setErrorMsg(null);
    setStoryboard(PRESET_PCX_160);
  };

  // Handle preset loading quickly
  const handleLoadPreset = (presetKey: 'pcx' | 'jimny' | 'gundam') => {
    setErrorMsg(null);
    if (presetKey === 'pcx') {
      setCategory('Motorcycle');
      setSubject('Honda PCX 160');
      setColorDesign('Burgundy Wine Red');
      setBackgroundStudio('Minimalist White Studio (Softbox Lighting)');
      setDuration('10s');
      setStoryboard(PRESET_PCX_160);
    } else if (presetKey === 'jimny') {
      setCategory('Car');
      setSubject('Suzuki Jimny Sierra');
      setColorDesign('Executive Matte Grey');
      setBackgroundStudio('Dark Industrial Workshop (Warm Tungsten Light)');
      setDuration('20s');
      setStoryboard(PRESET_JIMNY_SIERRA);
    } else if (presetKey === 'gundam') {
      setCategory('Gunpla / Mecha');
      setSubject('Striker-Class Battle Gundam');
      setColorDesign('Pearl White & Sapphire Blue');
      setBackgroundStudio('Vintage Brass & Wood Collector Desk');
      setDuration('10s');
      setStoryboard(PRESET_GUNDAM);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran gambar maksimal 10MB');
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('Harap isi nama subjek / model');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Call server backend gemini API
      const res = await fetch('/api/gemini-mini-toy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toyName: `${subject} (${category} - ${colorDesign})`,
          duration: duration.replace('s', ''),
          backgroundStyle: backgroundStudio,
          handType: gloveType,
          referenceImage: mode === 'photo' ? referenceImage : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal memproses AI Master Storyboard');
      }

      const data = await res.json();
      
      // Map API response to MiniLapseData format
      const isTwenty = duration === '20s';
      const isThirty = duration === '30s';
      const frameCount = isThirty ? 12 : (isTwenty ? 10 : 10);

      const combinedFrames: MiniLapseFrame[] = [];
      const rawFramesPart1 = data.part_1_frames || [];
      const rawFramesPart2 = data.part_2_frames || [];
      const rawFramesPart3 = data.part_3_frames || [];

      const allRaw = [...rawFramesPart1, ...rawFramesPart2, ...rawFramesPart3];

      for (let i = 0; i < frameCount; i++) {
        const raw = allRaw[i] || {};
        const stepTime = (10 / frameCount).toFixed(2);
        const startSec = (i * parseFloat(stepTime)).toFixed(2);
        const endSec = ((i + 1) * parseFloat(stepTime)).toFixed(2);
        const singleFrameLockSuffix = ' [SINGLE CONTINUOUS FULL-FRAME SHOT: Unified single 9:16 vertical camera view, strictly no split screen, no multi-panel, no collage, no stacked frames]';
        const refMatchSuffix = (mode === 'photo' || referenceImage) 
          ? ' [EXACT REFERENCE MATCH: Physical shape, color scheme, body contour, and decals are 100% identical to the provided input photo]' 
          : '';

        combinedFrames.push({
          row_number: i + 1,
          timecode: `${startSec}-${endSec}`,
          visual_description: (raw.visual_prompt || `High-resolution macro photo of black-gloved hands assembling ${subject} component part #${i + 1} under ${backgroundStudio}.`) + singleFrameLockSuffix + refMatchSuffix,
          action_detail: raw.action_title || `Precision installation of micro part #${i + 1} into main body with gloved fingers.`,
          transition_detail: `Match cut transition to next assembly step #${i + 1}.`,
          sfx_detail: raw.voiceover_or_audio || `[ASMR: Satisfying click and metallic snap of component #${i + 1}]`,
          camera_detail: `Macro close-up, 9:16 vertical portrait view, rack focus.`,
          sketch_description: `Monochrome line art sketch showing step #${i + 1} of ${subject} assembly.`
        });
      }

      const formattedPrompt1 = `A highly detailed, professional UI/UX video storyboard document, designed as a tall, continuous vertical infographic layout in a single image, portrait 9:16.

HEADER: "STORYBOARD ASMR - ${subject.toUpperCase()}". "DURASI TOTAL: ${duration.toUpperCase()} | FORMAT: POTRAIT 9:16 | GAYA: HYPER REALISTIC, CINEMATIC ASMR".
NEGATIVE PROMPT: "watermark, text, signature, logo, brand name, overlay text, typography, writing, split-screen, collage, multi-panel, grid, border, frame, low quality, blur, distortion".${(mode === 'photo' || referenceImage) ? '\nREFERENCE MATCH MODE: "EXACT PHYSICAL SHAPE & COLOR SCHEME PRESERVATION FROM INPUT PHOTO".' : ''}

LAYOUT: A 4-column vertical table with exactly ${frameCount} rows, followed by a 2-column footer section, all on solid black background with white text and thin white borders.

SURGICAL LOGIC 8 BARIS (ALUR PERAKITAN TERKUNCI 0% - 100%):
1. [0% UNBOXING & POTONG SEGEL]: Potong segel plastik kemasan dengan cutter presisi, buka penutup boks.
2. [15% UNTRAY & PENATAAN PART]: Mengeluarkan micro part & menata di atas tray/mat studio secara sistematis.
3. [30% SASIS & STRUKTUR INTI]: Merakit sasis tubular / ladder frame / rangka utama hingga berdiri kokoh.
4. [45% MESIN MIKRO & SUSPENSI]: Memasang unit mesin mikro & mekanisme suspensi depan/belakang.
5. [60% RODA, REM & KNALPOT]: Memasang roda alloy, ban karet, piringan rem, & knalpot racing stainless.
6. [75% BODI FAIRING & PANEL]: Mengunci bodi fairing luar, tangki bensin, jok, dan panel bodi hingga flush presisi.
7. [90% STIKER DECAL & EMBLEM]: Penempelan stiker decal emblem, badging logo mikro, dan polishing bodi dengan kain mikrofiber.
8. [100% ENGINE START & SPITFIRE]: Unit 100% selesai bertumpu di paddock stand/display base, tombol starter ditekan, mesin idle, gas diputar hingga knalpot berapi/spit fire.

COLUMN 1: Timecode (${combinedFrames.map(f => f.timecode).join(', ')} seconds).
COLUMN 2: MACRO PHOTO. High-resolution cinematic 9:16 macro photograph of ${gloveType} assembling ${subject} in ${colorDesign} finish under ${backgroundStudio}.${(mode === 'photo' || referenceImage) ? ' (Shape and colors 100% matching reference photo input).' : ''}
COLUMN 3: DESCRIPTION. Breakdown listing VISUAL, AKSI, TRANSISI, SFX, KAMERA.
COLUMN 4: SKETSA STORYBOARD. Clean monochrome architectural ink sketch.

FOOTER SECTION:
Box 1 (PROJECT MEMORY):
- KARAKTER: ${subject} (${colorDesign})
- LOKASI: ${backgroundStudio}
- WAKTU: Studio Lighting
- PROPERTI: Packaging box, micro cutter, model components, display stand
- TEMA: Detail, precision assembly, satisfaction, ASMR
- VISUAL STYLE: Hyper realistic, macro detail, cinematic lighting
- CAMERA STYLE: Macro close-up, tracking shot, focus pull${(mode === 'photo' || referenceImage) ? '\n- REFERENCE PHOTO: Exact Shape & Color Match Locked' : ''}

Box 2 (AUDIO OVERALL):
- VOICE: Tidak ada (ASMR Only)
- MUSIK: Ambient cinematic lembut
- SFX: Potong segel, klik, gesekan, putaran roda, roar mesin / power sound & knalpot berapi / thruster flames`;

      const generatedData: MiniLapseData = {
        title: `STORYBOARD ASMR - ${subject.toUpperCase()}`,
        totalDuration: duration.toUpperCase(),
        format: "POTRAIT 9:16",
        style: "HYPER REALISTIC, CINEMATIC ASMR",
        category,
        subject,
        colorDesign,
        backgroundStudio,
        storyboardPromptOutput1: formattedPrompt1,
        frames: combinedFrames,
        projectMemory: {
          character: `${subject} (${colorDesign} color reference)`,
          location: backgroundStudio,
          time: `Lighting scenario matching ${backgroundStudio}`,
          props: "Premium packaging box, model components, microfiber cloth",
          theme: "Detail, precision assembly, satisfaction, ASMR",
          visualStyle: "Hyper realistic, macro detail, cinematic lighting",
          cameraStyle: "Macro close-up, tracking shot, focus pull"
        },
        audioOverall: {
          voice: "Tidak ada (ASMR Only)",
          music: "Ambient cinematic lembut, hampir tidak terdengar",
          sfx: "Klik, gesekan, putaran roda/gigi, gesekan kain, sentuhan komponen"
        },
        caption: data.caption || `Satisfying ASMR assembly of ${subject} in ${colorDesign} finish! 🛠️✨ Pure mechanical satisfaction. What model should we build next?`,
        hashtags: data.hashtags && data.hashtags.length > 0 ? data.hashtags : ["miniature", "asmrsounds", "satisfyingassembly", "unboxingasmr", "modelkit", "diecast"]
      };

      setStoryboard(generatedData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menghasilkan Master Storyboard. Menggunakan sintesis lokal.');
      
      // Local fallback generator if API fails or quota exceeded
      const isTwenty = duration === '20s';
      const isThirty = duration === '30s';
      const frameCount = isThirty ? 12 : (isTwenty ? 10 : 10);
      const fallbackFrames: MiniLapseFrame[] = [];

      for (let i = 0; i < frameCount; i++) {
        const stepTime = (10 / frameCount).toFixed(2);
        const startSec = (i * parseFloat(stepTime)).toFixed(2);
        const endSec = ((i + 1) * parseFloat(stepTime)).toFixed(2);
        fallbackFrames.push({
          row_number: i + 1,
          timecode: `${startSec}-${endSec}`,
          visual_description: `High-resolution macro photo of gloved hands assembling ${subject} part #${i + 1} in ${colorDesign} on ${backgroundStudio}.`,
          action_detail: `Hands carefully align component #${i + 1} with tweezers and press down till locked.`,
          transition_detail: `Whip pan transition to next assembly step.`,
          sfx_detail: `[ASMR: Crisp snap click of micro component #${i + 1}]`,
          camera_detail: `Extreme macro 9:16 portrait view, shallow depth of field.`,
          sketch_description: `Pencil ink sketch showing assembly step #${i + 1} of ${subject}.`
        });
      }

      setStoryboard({
        title: `STORYBOARD ASMR - ${subject.toUpperCase()}`,
        totalDuration: duration.toUpperCase(),
        format: "POTRAIT 9:16",
        style: "HYPER REALISTIC, CINEMATIC ASMR",
        category,
        subject,
        colorDesign,
        backgroundStudio,
        storyboardPromptOutput1: `A highly detailed, professional UI/UX video storyboard document for ${subject} in ${colorDesign}, portrait 9:16 vertical infographic table layout with ${frameCount} rows and Project Memory footer.`,
        frames: fallbackFrames,
        projectMemory: {
          character: `${subject} (${colorDesign})`,
          location: backgroundStudio,
          time: `Lighting scenario matching ${backgroundStudio}`,
          props: "Premium packaging box, model components, microfiber cloth",
          theme: "Detail, precision assembly, satisfaction, ASMR",
          visualStyle: "Hyper realistic, macro detail, cinematic lighting",
          cameraStyle: "Macro close-up, tracking shot, focus pull"
        },
        audioOverall: {
          voice: "Tidak ada (ASMR Only)",
          music: "Ambient cinematic lembut",
          sfx: "Klik, gesekan, putaran roda, gesekan kain"
        },
        caption: `Satisfying ASMR assembly of ${subject} in ${colorDesign} finish! 🛠️✨ Pure mechanical satisfaction. What model should we build next?`,
        hashtags: ["miniature", "asmrsounds", "satisfyingassembly", "unboxingasmr", "modelkit", "diecast"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFlowAiJson = () => {
    if (!storyboard) return '';
    return JSON.stringify({
      generator: "MiniLapse Studio AI v2.2",
      format: "PORTRAIT_9_16",
      style: "HYPER_REALISTIC_CINEMATIC_ASMR",
      workflow_mode: "IMAGE_TO_VIDEO_FLOW_AI_VEO",
      mandatory_image_reference: {
        required: true,
        source: "Master Storyboard Image (Generated from Output 1 Master Prompt)",
        rule: "CRITICAL: Flow AI / Google Veo MUST strictly take the Master Storyboard Image (Output 1) as the primary keyframe image reference anchor. All video scene animations must maintain 100% exact physical shape, color scheme, components, and lighting established in the master image.",
        master_storyboard_image_prompt: storyboard.storyboardPromptOutput1
      },
      subject: storyboard.subject,
      category: storyboard.category,
      color_design: storyboard.colorDesign,
      background_studio: storyboard.backgroundStudio,
      duration: storyboard.totalDuration,
      frames: storyboard.frames.map(f => ({
        frame_number: f.row_number,
        timecode: f.timecode,
        image_reference_anchor: `Row #${f.row_number} of Master Storyboard Image (Output 1)`,
        visual_prompt: f.visual_description,
        action: f.action_detail,
        sfx_asmr: f.sfx_detail,
        camera: f.camera_detail
      })),
      project_memory: storyboard.projectMemory,
      audio_overall: storyboard.audioOverall,
      social_caption: storyboard.caption,
      hashtags: storyboard.hashtags
    }, null, 2);
  };

  return (
    <div id="minilapse-studio-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation Topbar */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Kembali ke Menu Utama"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Film className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight uppercase bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  MiniLapse Studio AI
                </h1>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-widest">
                  PROMPT GENERATOR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Premium AI Prompt Generator for ASMR Miniature Timelapse Storyboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls (lg:col-span-4) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Generator Input Form */}
          <form onSubmit={handleGenerate} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            
            {/* Form Header with Reset to Default Button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                PENGATURAN STORYBOARD
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[10px] font-extrabold uppercase text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Kembalikan settingan ke awal (Honda PCX 160)"
              >
                <RefreshCw className="w-3 h-3" />
                Settingan Awal
              </button>
            </div>

            {/* Mode Switcher: Text Mode vs Reference Photo Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                GENERATION MODE
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'text' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Text Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode('photo')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'photo' 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Reference Photo Mode
                </button>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                CATEGORY (Kategori)
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  if (val === 'Motorcycle') {
                    setSubject('Honda PCX 160');
                    setColorDesign('Burgundy Wine Red');
                    setBackgroundStudio('Minimalist White Studio (Softbox Lighting)');
                  } else if (val === 'Car') {
                    setSubject('Suzuki Jimny Sierra');
                    setColorDesign('Executive Matte Grey');
                    setBackgroundStudio('Dark Industrial Workshop (Warm Tungsten Light)');
                  } else if (val === 'Gunpla / Mecha') {
                    setSubject('Striker-Class Battle Gundam');
                    setColorDesign('Pearl White & Sapphire Blue');
                    setBackgroundStudio('Vintage Brass & Wood Collector Desk');
                  } else if (val === 'Miniature Store') {
                    setSubject('Mini Mart Storefront');
                    setColorDesign('Classic White & Red Accent');
                    setBackgroundStudio('Modern Studio dengan Lampu Neon LED');
                  } else if (val === 'Diecast') {
                    setSubject('Hot Wheels Custom Workshop');
                    setColorDesign('Titanium Silver with Carbon Fiber');
                    setBackgroundStudio('Cyberpunk Laboratory Workshop');
                  } else if (val === 'Custom Object') {
                    setSubject('Custom Miniature Model');
                    setColorDesign('Custom Color / Finis Kustom');
                    setBackgroundStudio('Minimalist White Studio (Softbox Lighting)');
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Motorcycle">Motorcycle (Motor)</option>
                <option value="Car">Car (Mobil)</option>
                <option value="Gunpla / Mecha">Gunpla / Mecha (Robot)</option>
                <option value="Miniature Store">Miniature Supermarket / Store / Cafe</option>
                <option value="Diecast">Diecast / Miniature Action Figure</option>
                <option value="Custom Object">Custom Object (Kustom)</option>
              </select>
            </div>

            {/* Subject Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  SUBJECT (Subjek / Model Name)
                </span>
                <span className="text-[9px] text-cyan-400 font-mono">Bebas diisi</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="misal: Honda PCX 160, Suzuki Jimny, Striker Gundam"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Color Design */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-cyan-400" />
                COLOR DESIGN (Warna & Finis Bodi)
              </label>
              <select
                value={colorDesign}
                onChange={(e) => setColorDesign(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Burgundy Wine Red">Burgundy Wine Red (Sultan Metallic)</option>
                <option value="Executive Matte Grey">Executive Matte Grey (Matte Dark)</option>
                <option value="Midnight Black Metallic">Midnight Black Metallic (Gloss Black)</option>
                <option value="Pearl White & Sapphire Blue">Pearl White & Sapphire Blue</option>
                <option value="Racing Yellow">Racing Yellow (Vibrant Yellow)</option>
                <option value="Titanium Silver with Carbon Fiber">Titanium Silver with Carbon Fiber</option>
                <option value="Custom Color">Custom Color / Finis Kustom</option>
              </select>
            </div>

            {/* Background / Studio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                BACKGROUND / STUDIO
              </label>
              <select
                value={backgroundStudio}
                onChange={(e) => setBackgroundStudio(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Minimalist White Studio (Softbox Lighting)">Minimalist White Studio (Softbox Lighting)</option>
                <option value="Dark Industrial Workshop (Warm Tungsten Light)">Dark Industrial Workshop (Warm Tungsten Light)</option>
                <option value="Vintage Brass & Wood Collector Desk">Vintage Brass & Wood Collector Desk</option>
                <option value="Modern Studio dengan Lampu Neon LED">Modern Studio dengan Lampu Neon LED</option>
                <option value="Cyberpunk Laboratory Workshop">Cyberpunk Laboratory Workshop</option>
              </select>
            </div>

            {/* Reference Photo Uploader (Mandatory in photo mode, optional in text mode) */}
            {(mode === 'photo' || referenceImage) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    FOTO REFERENSI MOTOR / MAINAN
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">PNG / JPG (Max 10MB)</span>
                </label>

                {referenceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 flex items-center gap-3">
                    <img 
                      src={referenceImage} 
                      alt="Reference Model" 
                      className="w-14 h-14 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">Foto Referensi Terpasang</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Di-ekstrak oleh AI Gemini</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferenceImage(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl bg-slate-950/80 cursor-pointer transition-all text-center group">
                    <Upload className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-bold text-slate-200">Upload Foto Referensi</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ekstrak detail bentuk & decal otomatis</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* Surgical Logic 8 Baris Badge */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  SURGICAL LOGIC 8 BARIS (MENGUNCI AI 0% - 100%)
                </span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  LOCKED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Sistem mengunci AI secara surgical agar alur perakitan berjalan konsisten dari 0% hingga 100%:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">1.</span> 0% Unboxing & Segel
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">2.</span> 15% Untray & Part
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">3.</span> 30% Sasis & Rangka
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">4.</span> 45% Mesin & Suspensi
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">5.</span> 60% Roda & Knalpot
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">6.</span> 75% Bodi & Panel
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">7.</span> 90% Decal & Badge
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">8.</span> 100% Start & Flames
                </div>
              </div>

              {/* Single Full-Frame Anti Split Screen Guarantee */}
              <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span className="flex items-center gap-1 font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  SINGLE FULL-FRAME 9:16 LOCK
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  NO SPLIT SCREEN
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex justify-between">
                <span>VIDEO DURATION (Durasi Total)</span>
                <span className="text-cyan-400 font-mono font-bold">{duration}</span>
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['10s', '20s', '30s'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                      duration === d 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message with Retry Action */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs font-medium flex flex-col gap-2.5 shadow-md">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleGenerate(e as any)}
                  className="self-end px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-bold border border-red-500/40 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Coba Buat Storyboard Lagi
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Merancang Storyboard AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>% Generate Magic Prompts</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: Output Showcase & Interactive Storyboard (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {storyboard ? (
            <div className="flex flex-col gap-6">
              
              {/* Output Tab Switcher (OUTPUT 1, OUTPUT 2, OUTPUT 3, OUTPUT 4) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xl">
                <button
                  onClick={() => setActiveOutputTab('output1')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                    activeOutputTab === 'output1' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  OUTPUT 1 (Master Storyboard)
                </button>
                <button
                  onClick={() => setActiveOutputTab('output2')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                    activeOutputTab === 'output2' 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  OUTPUT 2 (Video Prompts)
                </button>
                <button
                  onClick={() => setActiveOutputTab('output3')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                    activeOutputTab === 'output3' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  OUTPUT 3 (JSON Flow AI)
                </button>
                <button
                  onClick={() => setActiveOutputTab('output4')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                    activeOutputTab === 'output4' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  OUTPUT 4 (Caption & Tagar)
                </button>
              </div>

              {/* TAB 1: OUTPUT 1 — Master Storyboard Image Prompt */}
              {activeOutputTab === 'output1' && (
                <div className="flex flex-col gap-5">
                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-cyan-400" />
                          OUTPUT 1 — Master Storyboard Image Prompt (Midjourney / Flux / Gemini)
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Tempel ke Midjourney / Flux untuk menghasilkan 1 FOTO storyboard vertikal 9:16 lengkap dengan tabel & footer.
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(storyboard.storyboardPromptOutput1, 'output1')}
                        className="text-[10px] font-black uppercase text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md shrink-0"
                      >
                        {copiedSection === 'output1' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Disalin! ✓
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-cyan-400" />
                            Salin Master Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative group overflow-hidden">
                      <pre className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-56 whitespace-pre-wrap scrollbar-thin relative z-0">
                        {storyboard.storyboardPromptOutput1}
                      </pre>
                    </div>

                    {/* KOLOM AUTO CAPTION & HASHTAG */}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Auto Caption Column */}
                      <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-20">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300 tracking-wider">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>Kolom Auto Caption</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(storyboard.caption, 'auto-caption')}
                            className="text-[9px] font-bold uppercase text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 px-2 py-1 rounded flex items-center gap-1 transition-all"
                          >
                            {copiedSection === 'auto-caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedSection === 'auto-caption' ? 'Disalin' : 'Salin Caption'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-200 font-mono leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap relative z-20">
                          {storyboard.caption}
                        </p>
                      </div>

                      {/* Auto Hashtag Column */}
                      <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-20">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-300 tracking-wider">
                            <Hash className="w-4 h-4 text-cyan-400" />
                            <span>Kolom Auto Hashtags</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(storyboard.hashtags.map(t => `#${t}`).join(' '), 'auto-tags')}
                            className="text-[9px] font-bold uppercase text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 px-2 py-1 rounded flex items-center gap-1 transition-all"
                          >
                            {copiedSection === 'auto-tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedSection === 'auto-tags' ? 'Disalin' : 'Salin Tagar'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 relative z-20">
                          {storyboard.hashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              onClick={() => copyToClipboard(`#${tag}`, `auto-single-tag-${idx}`)}
                              className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                            >
                              #{tag} {copiedSection === `auto-single-tag-${idx}` ? '✓' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OUTPUT 2 — Video Generation Prompts (Veo3 / Luma / Runway / Kling / Sora) */}
              {activeOutputTab === 'output2' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-2">
                          <Film className="w-4 h-4 text-indigo-400" />
                          OUTPUT 2 — Video Prompts (Veo, Luma, Runway, Kling, Sora, Hailuo)
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Prompt terpisah per adegan untuk dirender satu demi satu di AI Video Generator.
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(storyboard.frames.map(f => `[${f.timecode}] ${f.visual_description}`).join('\n\n'), 'all-video-prompts')}
                        className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                      >
                        {copiedSection === 'all-video-prompts' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Disalin Semua! ✓
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-indigo-400" />
                            Salin Semua Video Prompt
                          </>
                        )}
                      </button>
                    </div>

                    {/* Frame Cards List */}
                    <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-1">
                      {storyboard.frames.map((frame, idx) => (
                        <div key={frame.row_number} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col gap-2 relative overflow-hidden">
                          <div className="flex items-center justify-between relative z-20">
                            <span className="text-[10px] font-black font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Frame #{frame.row_number} • Timecode: {frame.timecode}s
                            </span>
                            <button
                              onClick={() => copyToClipboard(frame.visual_description, `frame-prompt-${idx}`)}
                              className="text-[9px] font-bold uppercase text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded flex items-center gap-1 border border-indigo-500/30"
                            >
                              {copiedSection === `frame-prompt-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedSection === `frame-prompt-${idx}` ? 'Disalin' : 'Salin Frame'}
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-200 font-mono bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed relative z-20">
                            {frame.visual_description}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 relative z-20">
                            <div><span className="text-amber-400 font-bold">AKSI:</span> {frame.action_detail}</div>
                            <div><span className="text-emerald-400 font-bold">SFX:</span> {frame.sfx_detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: OUTPUT 3 — Flow AI / Veo Structured Prompt JSON */}
              {activeOutputTab === 'output3' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-purple-400" />
                          OUTPUT 3 — Flow AI / Veo Format JSON
                        </h3>
                        <p className="text-[10px] text-slate-400">Format JSON terstruktur untuk otomasi Flow AI & Google Veo.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getFlowAiJson(), 'flow-json')}
                        className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                      >
                        {copiedSection === 'flow-json' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Disalin! ✓
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-purple-400" />
                            Salin JSON Flow AI
                          </>
                        )}
                      </button>
                    </div>

                    {/* Master Storyboard Image Reference Banner Notice */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                          <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                          ACUAN WAJIB FLOW AI / VEO (IMAGE-TO-VIDEO ANCHOR)
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                          OUTPUT 1 MASTER IMAGE REFERENCE
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        Saat mengimpor JSON ini ke <strong className="text-purple-300">Flow AI</strong> atau <strong className="text-purple-300">Google Veo</strong>, Anda <span className="text-emerald-300 font-bold">WAJIB</span> mengunggah hasil <strong className="text-cyan-300">Gambar Master Storyboard (yang dibuat dari OUTPUT 1)</strong> sebagai gambar acuan referensi utama (keyframe image). Semua adegan pada JSON ini telah terkunci untuk menganimasikan gambar tersebut dengan konsistensi bentuk &amp; warna 100% presisi.
                      </p>
                    </div>

                    <div className="relative group overflow-hidden">
                      <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96 scrollbar-thin relative z-0">
                        {getFlowAiJson()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OUTPUT 4 — Social Media Viral Kit (Caption & Tagar) */}
              {activeOutputTab === 'output4' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Caption Box */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 z-20">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-black uppercase text-emerald-300 tracking-wider">Kolom Auto Caption</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(storyboard.caption, 'social-caption')}
                        className="text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 px-2.5 py-1 rounded flex items-center gap-1"
                      >
                        {copiedSection === 'social-caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSection === 'social-caption' ? 'Disalin' : 'Salin Caption'}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap z-20">
                      {storyboard.caption}
                    </div>
                  </div>

                  {/* Hashtag Box */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 z-20">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider">Kolom Auto Hashtags</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(storyboard.hashtags.map(t => `#${t}`).join(' '), 'social-tags')}
                        className="text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 px-2.5 py-1 rounded flex items-center gap-1"
                      >
                        {copiedSection === 'social-tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSection === 'social-tags' ? 'Disalin' : 'Salin Tagar'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 z-20">
                      {storyboard.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => copyToClipboard(`#${tag}`, `single-tag-${idx}`)}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        >
                          #{tag} {copiedSection === `single-tag-${idx}` ? '✓' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Film className="w-12 h-12 text-slate-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Belum Ada Storyboard Dibuat</h3>
              <p className="text-xs text-slate-500 max-w-sm">Pilih preset atau masukkan subjek mainan di sebelah kiri, lalu klik tombol <span className="text-cyan-400">% Generate Magic Prompts</span>.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MiniLapseStudio;
