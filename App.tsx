import React, { useState } from 'react';
import Home from './components/Home';
import VideoEditor from './components/VideoEditor';
import Scraper from './components/Scraper';
import ShortDownloader from './components/ShortDownloader';
import FrameEditor from './components/FrameEditor';

type ViewState = 'home' | 'editor' | 'scraper' | 'shorts' | 'frames';

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
    </>
  );
};

export default App;