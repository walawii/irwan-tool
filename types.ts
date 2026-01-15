
export enum ThemeColor {
  RED = 'red',
  BLUE = 'blue',
  PURPLE = 'purple'
}

export enum WatermarkPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right'
}

export interface NewsOverlayState {
  headline: string;
  subheadline: string;
  theme: ThemeColor;
  overlayImage: string | null;
  headlineSize: number;
  subheadlineSize: number;
  imageHeight: number;
}

export interface NewsItem extends NewsOverlayState {
  id: string;
  // Media
  videoUrl: string | null;
  videoFile: File | null;
  // Result
  generatedVideoUrl: string | null;
}

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export interface FrameVideoItem {
  id: string;
  url: string;
  name: string;
  file: File;
  status: 'idle' | 'processing' | 'done' | 'error';
  generatedUrl: string | null;
  error?: string;
  trimRange: { start: number; end: number };
  duration: number;
  captions: Caption[];
}

export interface FrameSettings {
  frameImageUrl: string | null;
  watermarkUrl: string | null;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  watermarkSize: number;
  videos: FrameVideoItem[];
}

export interface OverlayItem {
  id: string;
  bgVideo: { url: string; file: File } | null;
  overlayVideo: { url: string; file: File } | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  generatedUrl: string | null;
  config: {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    rotation: number;
  };
}

export interface GlobalState {
  audioUrl: string | null;
  audioFile: File | null;
  isProcessing: boolean;
  processingItemId: string | null;
  progress: string;
}

export interface ScrapedArticle {
  id: string;
  url: string;
  title: string;
  firstParagraph: string;
  imageUrl: string;
}

export type ViewState = 'home' | 'editor' | 'scraper' | 'shorts' | 'frames' | 'overlay' | 'image-studio';
