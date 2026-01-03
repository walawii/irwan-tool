
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
}

export interface NewsItem extends NewsOverlayState {
  id: string;
  // Media
  videoUrl: string | null;
  videoFile: File | null;
  // Result
  generatedVideoUrl: string | null;
}

export interface FrameVideoItem {
  id: string;
  url: string;
  name: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  generatedUrl: string | null;
  error?: string;
}

export interface FrameSettings {
  frameImageUrl: string | null;
  watermarkUrl: string | null;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  watermarkSize: number;
  videos: FrameVideoItem[];
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

export type ViewState = 'home' | 'editor' | 'scraper' | 'shorts' | 'frames';
