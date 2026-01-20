'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  folder?: string;
  currentImage?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'free';
}

export default function CloudinaryUpload({
  onUploadComplete,
  folder = 'uploads',
  currentImage,
  label = 'Ladda upp bild',
  className = '',
  aspectRatio = 'free'
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    'free': 'min-h-[200px]'
  }[aspectRatio];

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Endast bildfiler är tillåtna');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Bilden får max vara 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simulate progress (since fetch doesn't support progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Uppladdning misslyckades');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Small delay to show 100% before completing
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadComplete(data.url, data.publicId);
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Uppladdning misslyckades');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [folder, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onUploadComplete('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUploadComplete]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </label>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
          ${aspectRatioClass}
          ${isDragging 
            ? 'border-[var(--primary-green)] bg-[var(--primary-green)]/10' 
            : 'border-gray-300 hover:border-[var(--primary-green)] bg-white'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[200px]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Upload overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary-green)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-sm mt-2">{uploadProgress}%</span>
              </div>
            )}

            {/* Success indicator */}
            {!isUploading && uploadProgress === 0 && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Ta bort bild"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit hint */}
            {!isUploading && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm text-center">
                  Klicka för att byta bild
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${isDragging ? 'bg-[var(--primary-green)]' : 'bg-gray-100'}
              transition-colors
            `}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[var(--primary-green)] animate-spin" />
              ) : (
                <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
              )}
            </div>
            
            <p className="text-[var(--text-primary)] font-medium text-center mb-1">
              {isUploading ? 'Laddar upp...' : 'Dra och släpp en bild här'}
            </p>
            <p className="text-[var(--text-secondary)] text-sm text-center">
              eller klicka för att välja fil
            </p>
            <p className="text-gray-400 text-xs mt-2">
              PNG, JPG, WEBP upp till 10MB
            </p>

            {isUploading && (
              <div className="w-full max-w-xs mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary-green)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--text-secondary)] mt-1 block text-center">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
