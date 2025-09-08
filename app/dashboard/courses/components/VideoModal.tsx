'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, RotateCcw, Loader, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  weekTitle: string;
  videoUrl?: string;
}

interface VideoStatus {
  loading: boolean;
  error: boolean;
  errorMessage: string;
  retryCount: number;
}

export default function VideoModal({ 
  isOpen, 
  onClose, 
  weekNumber, 
  weekTitle,
  videoUrl = '' 
}: VideoModalProps) {
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({
    loading: true,
    error: false,
    errorMessage: '',
    retryCount: 0
  });

  // Reset video status when modal opens/closes or URL changes
  useEffect(() => {
    if (isOpen && videoUrl) {
      setVideoStatus({
        loading: true,
        error: false,
        errorMessage: '',
        retryCount: 0
      });
    }
  }, [isOpen, videoUrl]);

  // Test video accessibility
  useEffect(() => {
    if (!isOpen || !videoUrl) return;

    const testVideo = async () => {
      try {
        setVideoStatus(prev => ({ ...prev, loading: true, error: false }));
        
        // Extract video ID for testing
        let videoId = '';
        if (videoUrl.includes('vimeo.com')) {
          const match = videoUrl.match(/vimeo\.com\/video\/(\d+)|vimeo\.com\/(\d+)/);
          videoId = match?.[1] || match?.[2] || '';
        }
        
        if (videoId) {
          // Test Vimeo oEmbed API
          const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
          if (!response.ok) {
            throw new Error(`Video ${videoId} är inte tillgänglig (${response.status})`);
          }
        }
        
        setVideoStatus(prev => ({ ...prev, loading: false, error: false }));
        
      } catch (error) {
        console.error('Video test failed:', error);
        setVideoStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Video kunde inte laddas'
        }));
      }
    };

    testVideo();
  }, [isOpen, videoUrl, videoStatus.retryCount]);

  const handleRetry = () => {
    setVideoStatus(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1,
      loading: true,
      error: false 
    }));
  };

  const getDirectVimeoUrl = (embedUrl: string): string => {
    const videoId = embedUrl.match(/video\/(\d+)/)?.[1];
    return videoId ? `https://vimeo.com/${videoId}` : embedUrl;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 className="text-lg sm:text-xl font-semibold text-[#112A12] truncate">
                Vecka {weekNumber}: {weekTitle}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {videoStatus.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p className="text-sm opacity-80">Laddar video...</p>
                    {videoStatus.retryCount > 0 && (
                      <p className="text-xs opacity-60 mt-1">Försök {videoStatus.retryCount + 1}</p>
                    )}
                  </div>
                </div>
              )}

              {videoStatus.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
                  <div className="text-center text-white max-w-md">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold mb-2">Video kunde inte laddas</h3>
                    <p className="text-sm opacity-80 mb-6">{videoStatus.errorMessage}</p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={handleRetry}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        disabled={videoStatus.retryCount >= 3}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {videoStatus.retryCount >= 3 ? 'Max försök nådd' : 'Försök igen'}
                      </button>
                      
                      {videoUrl && (
                        <a
                          href={getDirectVimeoUrl(videoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ml-3"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Öppna i Vimeo
                        </a>
                      )}
                    </div>
                    
                    <p className="text-xs opacity-60 mt-4">
                      Problem kvarstår? Kontakta support på info@functionalfoods.se
                    </p>
                  </div>
                </div>
              )}

              {!videoStatus.loading && !videoStatus.error && videoUrl && (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title={`Vecka ${weekNumber} video: ${weekTitle}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => {
                    console.log(`✅ Video iframe loaded: Week ${weekNumber}`);
                    setVideoStatus(prev => ({ ...prev, loading: false }));
                  }}
                  onError={() => {
                    console.error(`❌ Video iframe failed: Week ${weekNumber}`);
                    setVideoStatus(prev => ({ 
                      ...prev, 
                      loading: false,
                      error: true,
                      errorMessage: 'Video-spelaren kunde inte laddas'
                    }));
                  }}
                />
              )}
            </div>

            {/* Mobile-friendly close button */}
            <div className="sm:hidden p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-medium"
              >
                Stäng video
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 