"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  uploadType?: 'general' | 'recipe' | 'blog' | 'course' | 'knowledge';
}

// Map upload types to Cloudinary folders
const folderMap: Record<string, string> = {
  general: 'uploads',
  recipe: 'recipes',
  blog: 'blog',
  course: 'courses',
  knowledge: 'knowledge'
};

export default function ImageUpload({ value, onChange, label = "Bild", className = "", uploadType = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Bilden får max vara 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);
    setUploadSuccess(false);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folderMap[uploadType] || 'uploads');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 85));
    }, 200);

    try {
      // Use Cloudinary upload endpoint
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (res.ok) {
        const data = await res.json();
        setProgress(100);
        setUploadSuccess(true);
        
        // Short delay to show success state
        setTimeout(() => {
          onChange(data.url);
          setUploading(false);
          setProgress(0);
          setUploadSuccess(false);
        }, 500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Uppladdningen misslyckades');
        setUploading(false);
        setProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload failed:', error);
      setError('Ett fel uppstod vid uppladdning');
      setUploading(false);
      setProgress(0);
    }
  }, [onChange, uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    disabled: uploading
  });

  const removeImage = () => {
    onChange('');
    setError('');
  };

  // Check if image is from Cloudinary (external URL) or local
  const getImageSrc = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Legacy local image support
    return url.startsWith('/api/images') ? url : `/api/images${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {value ? (
        <div className="relative group">
          <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={getImageSrc(value)}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {/* Cloudinary badge */}
            {value.includes('cloudinary') && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Cloudinary
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="mt-2 text-xs text-gray-500 truncate">
            {value.includes('cloudinary') ? '✓ Uppladdad till Cloudinary' : value}
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-[var(--primary-green)] bg-[var(--primary-green)]/5' : 'border-gray-300 hover:border-[var(--primary-green)] hover:bg-gray-50'}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[var(--primary-green)]/10 flex items-center justify-center mb-4">
                  {uploadSuccess ? (
                    <CheckCircle className="w-8 h-8 text-[var(--primary-green)]" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-[var(--primary-green)] animate-spin" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {uploadSuccess ? 'Klart!' : 'Laddar upp till Cloudinary...'}
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--primary-green)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{progress}%</span>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
                  ${isDragActive ? 'bg-[var(--primary-green)]' : 'bg-gray-100'}
                `}>
                  <ImageIcon className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {isDragActive ? 'Släpp bilden här' : 'Dra och släpp en bild här'}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  eller klicka för att välja fil
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WEBP upp till 10MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
