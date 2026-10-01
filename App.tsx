
import React, { useState } from 'react';
import Home from './components/Home';
import VideoEditor from './components/VideoEditor';
import Scraper from './components/Scraper';
import VideoSplitter from './components/VideoSplitter';
import PromptCreator from './components/PromptCreator';
import ImageToVideo from './components/ImageToVideo';
import CaptionGenerator from './components/CaptionGenerator';
import MiniCookingVideo from './components/MiniCookingVideo';
import MiniToyStudio from './components/MiniToyStudio';
import MiniLapseStudio from './components/MiniLapseStudio';
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

      {currentView === 'video-splitter' && (
        <VideoSplitter onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'prompt-creator' && (
        <PromptCreator onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'image-to-video' && (
        <ImageToVideo onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'caption-generator' && (
        <CaptionGenerator onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'mini-cooking' && (
        <MiniCookingVideo onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'mini-toy' && (
        <MiniToyStudio onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'minilapse-studio' && (
        <MiniLapseStudio onBack={() => setCurrentView('home')} />
      )}
    </>
  );
};

export default App;
