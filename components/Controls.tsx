import React, { useRef, useState } from 'react';
import { NewsItem, GlobalState, ThemeColor } from '../types';
import { Video, Type, Palette, Upload, Image as ImageIcon, Download, Loader2, Music, Link as LinkIcon, CheckCircle, Play, Plus, Trash2, Layers, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ControlsProps {
  items: NewsItem[];
  activeItemId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<NewsItem>) => void;
  onImport: (newItems: NewsItem[]) => void;
  
  globalState: GlobalState;
  setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
  onGenerateAll: () => void;
  onDownload: (item: NewsItem) => void;
  onDownloadAll: () => void;
  onBack?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  items,
  activeItemId,
  onSelect,
  onAdd,
  onRemove,
  onUpdate,
  onImport,
  globalState,
  setGlobalState,
  onGenerateAll,
  onDownload,
  onDownloadAll,
  onBack
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  
  const activeItem = items.find(i => i.id === activeItemId) || items[0];
  const generatedCount = items.filter(i => i.generatedVideoUrl).length;

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(activeItemId, { videoFile: file, videoUrl: url });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(activeItemId, { overlayImage: url });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGlobalState(prev => ({ ...prev, audioFile: file, audioUrl: url }));
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        const newItems: NewsItem[] = [];

        jsonData.forEach((row, index) => {
            if (row.length === 0) return;

            const headline = row[0] ? String(row[0]).trim() : '';
            const subheadline = row[1] ? String(row[1]).trim() : '';
            const imgUrl = row[2] ? String(row[2]).trim() : '';

            if (!headline && !subheadline && !imgUrl) return;

            newItems.push({
                id: Date.now().toString() + Math.random().toString().slice(2, 5),
                headline: headline || 'NEWS UPDATE',
                subheadline: subheadline,
                theme: ThemeColor.RED,
                overlayImage: imgUrl || null,
                videoUrl: null,
                videoFile: null,
                generatedVideoUrl: null
            });
        });

        if (newItems.length > 0) {
            onImport(newItems);
        } else {
            alert("No valid data found in Excel.");
        }

    } catch (error) {
        console.error("Error parsing Excel:", error);
        alert("Failed to import Excel file.");
    }

    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  return (
    <div className="w-full lg:w-96 bg-slate-800 flex flex-col h-auto lg:h-full border-r border-slate-700 shadow-xl z-20">
      
      <div className="p-6 pb-4 border-b border-slate-700 flex items-center gap-3">
        {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
        )}
        <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
            Irwan Kurnia
            </h1>
            <p className="text-slate-400 text-xs">Video Editor</p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/30">
          <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                  <Layers className="w-4 h-4" />
                  <h2>Story Board</h2>
              </div>
              <div className="flex items-center gap-1.5">
                  <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      ref={excelInputRef} 
                      className="hidden"
                      onChange={handleExcelImport}
                  />
                  <button 
                      onClick={() => excelInputRef.current?.click()}
                      className="p-1.5 bg-green-600 hover:bg-green-500 rounded text-white transition-colors flex items-center gap-1 text-xs px-2"
                      title="Import from Excel"
                  >
                      <FileSpreadsheet className="w-3 h-3" />
                  </button>
                  <button 
                      onClick={onAdd}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors"
                      title="Add Clip"
                  >
                      <Plus className="w-4 h-4" />
                  </button>
              </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {items.map((item, index) => (
                  <div 
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`
                          flex-shrink-0 w-20 h-24 rounded-lg border-2 cursor-pointer relative group overflow-hidden transition-all
                          ${item.id === activeItemId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700 hover:border-slate-500'}
                      `}
                  >
                      {item.videoUrl ? (
                          <video src={item.videoUrl} className="w-full h-full object-cover opacity-60" />
                      ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <span className="text-slate-600 font-bold text-lg">{index + 1}</span>
                          </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                          {item.generatedVideoUrl && <div className="h-full bg-green-500 w-full"></div>}
                          {globalState.processingItemId === item.id && <div className="h-full bg-blue-500 w-full animate-pulse"></div>}
                      </div>

                      {items.length > 1 && (
                          <button 
                              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                              className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <Trash2 className="w-3 h-3" />
                          </button>
                      )}
                  </div>
              ))}
          </div>

          {generatedCount > 0 && (
              <button 
                  onClick={onDownloadAll}
                  className="w-full mt-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                  <Download className="w-3 h-3" />
                  Download All Generated ({generatedCount})
              </button>
          )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-300 font-semibold border-b border-slate-700 pb-2">
            <Video className="w-5 h-5" />
            <h2>Clip Media</h2>
            </div>
            
            <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Background Video</label>
            <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" />
            <button
                onClick={() => { if(videoInputRef.current) videoInputRef.current.value = ''; videoInputRef.current?.click(); }}
                className="w-full py-3 px-4 rounded-lg border border-slate-600 bg-slate-900/50 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all text-sm group"
            >
                <Upload className="w-4 h-4 group-hover:scale-110" />
                {activeItem.videoFile ? 'Replace Video' : 'Upload Video'}
            </button>
            </div>

            <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">News Image</label>
            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
            <button
                onClick={() => { if(imageInputRef.current) imageInputRef.current.value = ''; imageInputRef.current?.click(); }}
                className="w-full py-3 px-4 rounded-lg border border-slate-600 bg-slate-900/50 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all text-sm group"
            >
                <ImageIcon className="w-4 h-4 group-hover:scale-110" />
                {activeItem.overlayImage && activeItem.overlayImage.startsWith('blob:') ? 'Replace Image' : 'Upload Image'}
            </button>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <input 
                    type="text" 
                    placeholder="Or paste image URL..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                    value={activeItem.overlayImage?.startsWith('blob:') ? '' : activeItem.overlayImage || ''}
                    onChange={(e) => onUpdate(activeItemId, { overlayImage: e.target.value })}
                />
            </div>
            </div>
        </div>

        <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-700 pb-2">
                 <Music className="w-5 h-5" />
                 <h2>Background Music</h2>
             </div>
             <div className="space-y-2">
                <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioUpload} className="hidden" />
                <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full py-2 px-4 rounded-lg border border-slate-600 bg-slate-900/30 hover:bg-slate-700 text-slate-400 flex items-center justify-center gap-2 transition-all text-xs"
                >
                    <Music className="w-3 h-3" />
                    {globalState.audioFile ? 'Change Music' : 'Upload Music'}
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-300 font-semibold border-b border-slate-700 pb-2">
            <Type className="w-5 h-5" />
            <h2>Clip Content</h2>
            </div>
            <div className="space-y-3">
                <input
                    type="text"
                    value={activeItem.headline}
                    onChange={(e) => onUpdate(activeItemId, { headline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="HEADLINE"
                />
                <textarea
                    value={activeItem.subheadline}
                    onChange={(e) => onUpdate(activeItemId, { subheadline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px]"
                    placeholder="Details..."
                />
            </div>
        </div>

        {activeItem.generatedVideoUrl && (
            <div className="space-y-4 animate-slide-up">
                 <div className="flex items-center gap-2 text-green-400 font-semibold border-b border-slate-700 pb-2">
                    <CheckCircle className="w-5 h-5" />
                    <h2>Generated Result</h2>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-green-500/30">
                    <video src={activeItem.generatedVideoUrl} controls className="w-full rounded-lg mb-3 shadow-lg border border-slate-800 bg-black aspect-[9/16]" />
                    <button 
                        onClick={() => onDownload(activeItem)}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                    >
                        <Download className="w-4 h-4" /> Download Clip
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="p-6 pt-4 border-t border-slate-700 bg-slate-800">
         <button
          onClick={onGenerateAll}
          disabled={globalState.isProcessing}
          className={`w-full py-4 px-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2
            ${globalState.isProcessing ? 'bg-slate-600 cursor-not-allowed opacity-75' : 'bg-indigo-600 hover:bg-indigo-500'}
          `}
        >
          {globalState.isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
          ) : (
            <><Play className="w-5 h-5 fill-current" />Export All Videos ({items.length})</>
          )}
        </button>
        {globalState.isProcessing && <p className="text-[10px] text-center text-indigo-300 animate-pulse mt-2">{globalState.progress}</p>}
      </div>
    </div>
  );
};

export default Controls;