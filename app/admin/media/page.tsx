"use client";
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Search,
  Grid,
  List,
  Filter,
  X,
  Check,
  Copy,
  Eye,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  alt?: string;
  width?: number;
  height?: number;
}

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          const newFile = await res.json();
          setFiles(prev => [newFile, ...prev]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm']
    }
  });

  const handleDelete = async (fileId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna fil?')) return;
    
    try {
      const res = await fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Är du säker på att du vill ta bort ${selectedFiles.length} filer?`)) return;
    
    for (const fileId of selectedFiles) {
      await handleDelete(fileId);
    }
    setSelectedFiles([]);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.alt && file.alt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'images' && file.type.startsWith('image/')) ||
                       (filterType === 'videos' && file.type.startsWith('video/'));
    
    return matchesSearch && matchesType;
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL kopierad till urklipp!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Media bibliotek</h1>
        <p className="text-gray-600">Hantera bilder och videor för din webbplats</p>
      </div>

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#014421] bg-[#014421]/5' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          {isDragActive ? 'Släpp filerna här...' : 'Dra och släpp filer här, eller klicka för att välja'}
        </p>
        <p className="text-sm text-gray-500">
          Stödjer: JPG, PNG, GIF, WebP, MP4, WebM
        </p>
      </div>

      {uploading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">Laddar upp filer...</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sök filer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
            >
              <option value="all">Alla filer</option>
              <option value="images">Bilder</option>
              <option value="videos">Videor</option>
            </select>

            {/* View mode */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#014421] text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#014421] text-white' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedFiles.length} valda
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ta bort valda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Files grid/list */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Inga filer hittades</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <div
                  className={`relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-[#014421]' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  {/* Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.id);
                    }}
                  >
                    <div className={`w-5 h-5 border-2 rounded ${
                      selectedFiles.includes(file.id) 
                        ? 'bg-[#014421] border-[#014421]' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {selectedFiles.includes(file.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.alt || file.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, '_blank');
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {/* File info */}
                  <div className="p-2">
                    <p className="text-xs text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storlek</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.alt || file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{file.name}</p>
                    {file.alt && <p className="text-xs text-gray-500">{file.alt}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File details modal */}
      {selectedFile && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Fildetaljer</h2>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Preview */}
              <div>
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.alt || selectedFile.name}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filnamn</label>
                  <input
                    type="text"
                    value={selectedFile.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt-text</label>
                  <input
                    type="text"
                    placeholder="Beskriv bilden..."
                    defaultValue={selectedFile.alt}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedFile.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedFile.url)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storlek</label>
                    <p className="text-gray-900">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uppladdad</label>
                    <p className="text-gray-900">
                      {new Date(selectedFile.uploadedAt).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>

                {selectedFile.width && selectedFile.height && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensioner</label>
                    <p className="text-gray-900">{selectedFile.width} × {selectedFile.height} px</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-colors">
                    Spara ändringar
                  </button>
                  <button
                    onClick={() => handleDelete(selectedFile.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 