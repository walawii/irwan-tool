
import React, { useState } from 'react';
import Controls from './Controls';
import PreviewArea from './PreviewArea';
import { NewsItem, GlobalState, ThemeColor } from '../types';
import { exportCompositedVideo } from '../services/gemini';
import { ArrowLeft } from 'lucide-react';

interface VideoEditorProps {
    onBack: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ onBack }) => {
  const [items, setItems] = useState<NewsItem[]>([{
    id: '1',
    headline: 'NEWS UPDATE',
    subheadline: 'Upload your video to begin',
    theme: ThemeColor.RED,
    overlayImage: null,
    videoUrl: null,
    videoFile: null,
    generatedVideoUrl: null
  }]);

  const [activeItemId, setActiveItemId] = useState<string>('1');

  const [globalState, setGlobalState] = useState<GlobalState>({
    audioUrl: null,
    audioFile: null,
    isProcessing: false,
    processingItemId: null,
    progress: ''
  });

  const activeItem = items.find(i => i.id === activeItemId) || items[0];

  const handleUpdateItem = (id: string, updates: Partial<NewsItem>) => {
    const isSystemUpdate = 'generatedVideoUrl' in updates;
    setItems(prevItems => prevItems.map(item => {
        if (item.id !== id) return item;
        return {
            ...item,
            ...updates,
            generatedVideoUrl: isSystemUpdate ? updates.generatedVideoUrl! : (updates.headline || updates.subheadline || updates.overlayImage ? null : item.generatedVideoUrl)
        };
    }));
  };

  const handleAddItem = () => {
      const newItem: NewsItem = {
          id: Date.now().toString(),
          headline: 'NEW CLIP',
          subheadline: '',
          theme: ThemeColor.RED,
          overlayImage: null,
          videoUrl: null,
          videoFile: null,
          generatedVideoUrl: null
      };
      setItems(prev => [...prev, newItem]);
      setActiveItemId(newItem.id);
  };

  const handleImportItems = (newItems: NewsItem[]) => {
      setItems(prev => [...prev, ...newItems]);
      if (newItems.length > 0) setActiveItemId(newItems[0].id);
  };

  const handleRemoveItem = (id: string) => {
      if (items.length <= 1) return;
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      if (activeItemId === id) setActiveItemId(newItems[0].id);
  };

  const triggerDownload = (url: string, headline: string) => {
    const a = document.createElement('a');
    a.href = url;
    // Sanitize headline to remove invalid filename characters
    const safeHeadline = headline.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'video-result';
    a.download = `${safeHeadline}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleProcessAll = async () => {
    const validItems = items.filter(item => item.videoUrl);
    if (validItems.length === 0) {
      alert("Please upload videos for your clips to export.");
      return;
    }

    setGlobalState(prev => ({ ...prev, isProcessing: true }));

    for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        
        // Skip generation if already generated
        if (item.generatedVideoUrl) {
            triggerDownload(item.generatedVideoUrl, item.headline);
            continue;
        }

        setGlobalState(prev => ({ 
            ...prev, 
            processingItemId: item.id,
            progress: `Processing clip ${i + 1} of ${validItems.length}...` 
        }));

        try {
            const downloadUrl = await exportCompositedVideo(
                item, 
                globalState.audioUrl,
                (msg) => setGlobalState(prev => ({ ...prev, progress: `Clip ${i + 1}/${validItems.length}: ${msg}` }))
            );
            handleUpdateItem(item.id, { generatedVideoUrl: downloadUrl });
            triggerDownload(downloadUrl, item.headline);
        } catch (err: any) {
            console.error(err);
        }
    }

    setGlobalState(prev => ({ ...prev, isProcessing: false, processingItemId: null, progress: '' }));
  };

  const handleDownloadAll = () => {
      items.forEach((item, index) => {
          if (item.generatedVideoUrl) {
              setTimeout(() => triggerDownload(item.generatedVideoUrl!, item.headline), index * 500);
          }
      });
  };

  const handleDownload = (item: NewsItem) => {
    if (!item.generatedVideoUrl) return;
    triggerDownload(item.generatedVideoUrl, item.headline);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-950 text-white relative">
      <div className="absolute top-4 right-4 z-50 lg:hidden">
         <button onClick={onBack} className="bg-slate-800 p-2 rounded-full text-slate-300"><ArrowLeft /></button>
      </div>
      <div className="relative z-20 flex-shrink-0">
          <Controls 
            items={items}
            activeItemId={activeItemId}
            onSelect={setActiveItemId}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            onUpdate={handleUpdateItem}
            onImport={handleImportItems}
            globalState={globalState}
            setGlobalState={setGlobalState}
            onGenerateAll={handleProcessAll}
            onDownload={handleDownload}
            onDownloadAll={handleDownloadAll}
            onBack={onBack}
          />
      </div>
      <PreviewArea activeItem={activeItem} globalState={globalState} />
    </div>
  );
};

export default VideoEditor;
