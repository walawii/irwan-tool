
import React, { useState, useRef } from 'react';
import { ArrowLeft, Facebook, Upload, Calendar, Clock, Video, Loader2, CheckCircle, AlertCircle, Plus, Trash2, Settings, User, ChevronDown, ChevronUp } from 'lucide-react';

interface FacebookSchedulerProps {
  onBack: () => void;
}

interface FBPage {
  id: string;
  name: string;
  access_token: string;
  picture: string;
}

interface ScheduledPost {
  id: string;
  videoFile: File;
  videoUrl: string;
  caption: string;
  scheduledTime: string; // ISO String
  status: 'pending' | 'uploading' | 'scheduled' | 'error';
  pageId: string;
  pageName: string;
}

const FacebookScheduler: React.FC<FacebookSchedulerProps> = ({ onBack }) => {
  // State
  const [tokenInput, setTokenInput] = useState('');
  const [pages, setPages] = useState<FBPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FBPage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Queue State
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic ---

  const handleConnect = async () => {
    // In a real app, this would use FB.login or fetch user pages via Graph API
    // For this standalone tool, we simulate fetching pages or use the provided token
    
    if (!tokenInput.trim()) {
        // Simulation Mode
        const mockPages: FBPage[] = [
            { id: '123', name: 'Berita Viral Indonesia', access_token: 'mock_token_1', picture: 'https://ui-avatars.com/api/?name=Berita+Viral&background=1877F2&color=fff' },
            { id: '456', name: 'Info Gadget Terkini', access_token: 'mock_token_2', picture: 'https://ui-avatars.com/api/?name=Info+Gadget&background=random&color=fff' }
        ];
        setPages(mockPages);
        setSelectedPage(mockPages[0]);
        setIsConnected(true);
    } else {
        // Real API Logic (Structure)
        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenInput}`);
            const data = await res.json();
            if (data.data) {
                const fetchedPages = data.data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    access_token: p.access_token,
                    picture: `https://graph.facebook.com/${p.id}/picture`
                }));
                setPages(fetchedPages);
                if(fetchedPages.length > 0) setSelectedPage(fetchedPages[0]);
                setIsConnected(true);
            } else {
                alert("Token tidak valid atau tidak memiliki Halaman.");
            }
        } catch (e) {
            alert("Gagal menghubungkan ke Facebook API.");
        }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setVideoFile(file);
          setVideoPreview(URL.createObjectURL(file));
      }
  };

  const handleSchedule = async () => {
      if (!selectedPage || !videoFile) return;

      const scheduledDateTime = scheduleDate && scheduleTime 
        ? new Date(`${scheduleDate}T${scheduleTime}`) 
        : new Date(); // Default to now if empty

      // Validate time (FB requires scheduling between 20 mins and 75 days in future)
      const now = new Date();
      const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / 60000;
      
      if (scheduleDate && diffMinutes < 10) {
          alert("Jadwal posting minimal 10 menit dari sekarang.");
          return;
      }

      setIsUploading(true);

      // --- SIMULATED UPLOAD PROCESS ---
      // In Real Graph API:
      // 1. Initialize Upload Session: POST /{page_id}/video_reels
      // 2. Upload Bytes: POST to upload_url
      // 3. Publish/Schedule: POST /{page_id}/video_reels with video_state="SCHEDULED"
      
      await new Promise(r => setTimeout(r, 2000)); // Fake network delay

      const newPost: ScheduledPost = {
          id: Math.random().toString(36).substr(2, 9),
          videoFile: videoFile,
          videoUrl: videoPreview!,
          caption: caption,
          scheduledTime: scheduledDateTime.toISOString(),
          status: 'scheduled',
          pageId: selectedPage.id,
          pageName: selectedPage.name
      };

      setScheduledPosts(prev => [newPost, ...prev]);
      
      // Reset Form
      setVideoFile(null);
      setVideoPreview(null);
      setCaption('');
      setScheduleDate('');
      setScheduleTime('');
      setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-inter">
      {/* Header */}
      <div className="bg-[#1877F2] border-b border-blue-600 p-4 sticky top-0 z-20 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-blue-700 rounded-full transition-colors text-white">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Facebook className="w-6 h-6 fill-white text-[#1877F2]" />
                Reels Scheduler
            </h1>
        </div>
        <div className="text-xs font-medium text-blue-100 bg-blue-800/50 px-3 py-1 rounded-full">
            Meta Business Integration
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full flex-1">
        
        {/* Mobile Toggle */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden w-full bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-center gap-2 text-sm font-bold text-blue-400"
        >
            {isSidebarOpen ? 'Hide Accounts' : 'Show Accounts'} {isSidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Left Sidebar: Account & Page Selection */}
        <div className={`w-full lg:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 transition-all duration-300 ${isSidebarOpen ? 'h-auto max-h-[50vh] overflow-y-auto lg:h-full lg:max-h-full' : 'h-0 overflow-hidden lg:h-full lg:max-h-full p-0'}`}>
            {!isConnected ? (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Connect Account</h2>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                        <label className="text-xs text-slate-400">Page Access Token (Optional for Demo)</label>
                        <input 
                            type="password" 
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="EAAG..." 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                        <button 
                            onClick={handleConnect}
                            className="w-full py-2 bg-[#1877F2] hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-all"
                        >
                            Connect Facebook
                        </button>
                        <p className="text-[10px] text-slate-500 text-center">Biarkan kosong untuk Mode Simulasi</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                     <div className="flex items-center gap-3 bg-blue-900/20 p-3 rounded-xl border border-blue-500/30">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Connected</p>
                            <p className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setIsConnected(false)}>Disconnect</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Page</label>
                        <div className="space-y-2">
                            {pages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setSelectedPage(page)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedPage?.id === page.id ? 'bg-[#1877F2]/20 border-[#1877F2] shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
                                >
                                    <img src={page.picture} alt="" className="w-8 h-8 rounded-full bg-slate-700 object-cover" />
                                    <span className="text-sm font-medium truncate">{page.name}</span>
                                    {selectedPage?.id === page.id && <CheckCircle className="w-4 h-4 text-[#1877F2] ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Main Content: Scheduler Form */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto min-h-0">
             <div className="max-w-4xl mx-auto space-y-8 pb-20 lg:pb-0">
                
                {/* Form Area */}
                <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-blue-500" />
                        Buat Reel Baru
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Column 1: Media */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">Video Source (9:16 Recommended)</label>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-[9/16] max-h-[400px] w-full bg-slate-950 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${videoFile ? 'border-blue-500' : 'border-slate-700 hover:border-slate-500'}`}
                            >
                                <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleVideoSelect} />
                                {videoPreview ? (
                                    <video src={videoPreview} className="w-full h-full object-cover" controls />
                                ) : (
                                    <div className="text-center p-6 text-slate-500">
                                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">Klik untuk upload video</p>
                                        <p className="text-xs mt-1 opacity-60">MP4, MOV (Max 60s)</p>
                                    </div>
                                )}
                                {videoFile && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null); }}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-400">Caption & Hashtags</label>
                                <textarea 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Tulis caption menarik... #reels #viral"
                                    rows={5}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
                                <label className="block text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Jadwal Posting
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Tanggal</span>
                                        <input 
                                            type="date" 
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Jam</span>
                                        <input 
                                            type="time" 
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">
                                    *Kosongkan tanggal & jam untuk "Publish Now"
                                </p>
                            </div>

                            <button 
                                onClick={handleSchedule}
                                disabled={!selectedPage || !videoFile || isUploading}
                                className="w-full py-4 bg-[#1877F2] hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                {scheduleDate ? 'Jadwalkan Reel' : 'Posting Sekarang'}
                            </button>

                            {!selectedPage && (
                                <p className="text-center text-xs text-red-400 font-medium">
                                    Pilih Halaman Facebook terlebih dahulu.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Queue List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Antrean Jadwal ({scheduledPosts.length})
                    </h2>

                    {scheduledPosts.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
                            <p className="text-slate-600 text-sm">Belum ada postingan terjadwal.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scheduledPosts.map((post) => (
                                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
                                    <div className="w-16 h-28 bg-black rounded-lg overflow-hidden shrink-0">
                                        <video src={post.videoUrl} className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                                                {post.pageName}
                                            </span>
                                            <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-500/20">
                                                SCHEDULED
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 line-clamp-2 mb-2">{post.caption || 'No caption'}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-medium">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.scheduledTime).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

             </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookScheduler;
