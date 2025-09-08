"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, RotateCcw, Loader } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: any) => void;
  onEnded?: () => void;
}

interface VideoState {
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  hasError: boolean;
  errorMessage: string;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
  canPlay: boolean;
}

export default function VideoPlayer({
  src,
  title,
  poster,
  autoplay = false,
  muted = false,
  controls = true,
  className = '',
  onLoadStart,
  onLoadedData,
  onError,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<VideoState>({
    isLoading: true,
    isPlaying: false,
    isMuted: muted,
    hasError: false,
    errorMessage: '',
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false,
    canPlay: false
  });

  // Detect if this is a Vimeo URL and convert to proper embed format
  const getEmbedUrl = (url: string): string => {
    try {
      // Handle Vimeo player URLs
      if (url.includes('player.vimeo.com/video/')) {
        return url;
      }
      
      // Handle regular Vimeo URLs
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        return `https://player.vimeo.com/video/${videoId}?h=0c219534c4&autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}`;
      }
      
      // Handle YouTube URLs
      const youtubeMatch = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return url;
    }
  };

  const embedUrl = getEmbedUrl(src);

  // Test if video URL is accessible
  useEffect(() => {
    const testVideoAccess = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, hasError: false }));
        
        // For Vimeo videos, test the oEmbed API
        if (embedUrl.includes('player.vimeo.com')) {
          const videoId = embedUrl.match(/video\/(\d+)/)?.[1];
          if (videoId) {
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
            if (!response.ok) {
              throw new Error('Video inte tillgänglig');
            }
          }
        }
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          canPlay: true,
          hasError: false 
        }));
        
        onLoadedData?.();
      } catch (error) {
        console.error('Video access test failed:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasError: true,
          errorMessage: 'Video kunde inte laddas. Kontrollera din internetanslutning.',
          canPlay: false
        }));
        onError?.(error);
      }
    };

    if (src) {
      onLoadStart?.();
      testVideoAccess();
    }
  }, [src]);

  const handleRetry = () => {
    setState(prev => ({ ...prev, hasError: false, isLoading: true }));
    // Re-trigger the effect by updating a dependency
    window.location.reload();
  };

  if (state.isLoading) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm opacity-80">Laddar video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.hasError) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center text-white max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Video kunde inte laddas</h3>
            <p className="text-sm opacity-80 mb-4">{state.errorMessage}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.canPlay) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
            <p className="text-sm opacity-80">Video inte tillgänglig</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} 
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        className="absolute inset-0 w-full h-full"
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        onLoad={() => {
          console.log(`✅ Video loaded successfully: ${title}`);
          setState(prev => ({ ...prev, isLoading: false }));
        }}
        onError={(e) => {
          console.error(`❌ Video failed to load: ${title}`, e);
          setState(prev => ({ 
            ...prev, 
            hasError: true, 
            errorMessage: 'Video kunde inte laddas',
            isLoading: false 
          }));
        }}
      />
      
      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Laddar...</p>
          </div>
        </div>
      )}
    </div>
  );
} 