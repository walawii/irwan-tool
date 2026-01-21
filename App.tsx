
import React, { useState } from 'react';
import Home from './components/Home';
import VideoEditor from './components/VideoEditor';
import Scraper from './components/Scraper';
import ShortDownloader from './components/ShortDownloader';
import FrameEditor from './components/FrameEditor';
import VideoOverlayMaker from './components/VideoOverlayMaker';
import ImageStudio from './components/ImageStudio';
import FacebookScheduler from './components/FacebookScheduler';
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

      {currentView === 'fb-scheduler' && (
        <FacebookScheduler onBack={() => setCurrentView('home')} />
      )}
    </>
  );
};

export default App;
