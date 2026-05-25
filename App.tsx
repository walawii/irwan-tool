
import React, { useState } from 'react';
import Home from './components/Home';
import VideoEditor from './components/VideoEditor';
import Scraper from './components/Scraper';
import ShortDownloader from './components/ShortDownloader';
import FrameEditor from './components/FrameEditor';
import VideoOverlayMaker from './components/VideoOverlayMaker';
import ImageStudio from './components/ImageStudio';
import VideoSplitter from './components/VideoSplitter';
import PromptCreator from './components/PromptCreator';
import ImageToVideo from './components/ImageToVideo';
import PromptGenerator from './components/PromptGenerator';
import CaptionGenerator from './components/CaptionGenerator';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  return (
    <>
      {currentView === 'home' && (
        <Home onNavigate={setCurrentView} />
      )}
      
      {currentView === 'editor' && (
        <VideoEditor onBack={() => setCurrentView('home')} />
      )}
      
      {currentView === 'scraper' && (
        <Scraper onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'shorts' && (
        <ShortDownloader onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'frames' && (
        <FrameEditor onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'overlay' && (
        <VideoOverlayMaker onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'image-studio' && (
        <ImageStudio onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'video-splitter' && (
        <VideoSplitter onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'prompt-creator' && (
        <PromptCreator onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'image-to-video' && (
        <ImageToVideo onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'prompt-generator' && (
        <PromptGenerator onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'caption-generator' && (
        <CaptionGenerator onBack={() => setCurrentView('home')} />
      )}
    </>
  );
};

export default App;
