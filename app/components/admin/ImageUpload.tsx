"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  uploadType?: 'general' | 'recipe' | 'blog' | 'course';
}

export default function ImageUpload({ value, onChange, label = "Bild", className = "", uploadType = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Uppladdningen misslyckades');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Ett fel uppstod vid uppladdning');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

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

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {value ? (
        <div className="relative group">
          <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={`${value.startsWith('/api/images') ? value : `/api/images${value.startsWith('/') ? '' : '/'}${value}`}?cb=${Date.now()}`}
              alt="Uploaded image"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 text-xs text-gray-500 truncate">{value}</div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? 'Laddar upp...' : isDragActive ? 'Släpp bilden här' : 'Dra och släpp en bild här'}
          </p>
          <p className="text-xs text-gray-500">
            eller klicka för att välja fil
          </p>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
