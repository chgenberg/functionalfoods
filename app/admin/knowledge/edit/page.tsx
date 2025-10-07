'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, FileText, Clock, BookOpen, Upload, Image as ImageIcon, X, Plus } from 'lucide-react';
import ImageUpload from '@/app/components/admin/ImageUpload';
import dynamic from 'next/dynamic';

// Dynamisk import av rich text editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface KnowledgeDocument {
  id?: string;
  title: string;
  slug: string;
  content: string;
  headerImage?: string;
  relatedImages?: string[];
  keyTakeaways?: string[];
  readTime: number;
  course: 'basic' | 'flow' | 'energy';
  order: number;
}

export default function EditKnowledgeDocumentPage() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course') || 'basic';
  const slugParam = searchParams.get('slug');
  
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<'basic' | 'flow' | 'energy'>(courseParam as any);
  const [documents, setDocuments] = useState<Record<'basic' | 'flow' | 'energy', KnowledgeDocument[]>>({
    basic: [],
    flow: [],
    energy: []
  });

  const courses = [
    { id: 'basic', name: 'Functional Basics', color: 'bg-blue-100 text-blue-800', icon: 'Sprout' },
    { id: 'flow', name: 'Functional Flow', color: 'bg-green-100 text-green-800', icon: 'Waves' },
    { id: 'energy', name: 'Functional Energy', color: 'bg-orange-100 text-orange-800', icon: 'Zap' }
  ];

  useEffect(() => {
    if (slugParam) {
      fetchDocument();
    }
  }, [slugParam, courseParam]);

  useEffect(() => {
    // Load document list for sidebar
    const loadList = async () => {
      try {
        const res = await fetch(`/api/admin/knowledge?course=${selectedCourse}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setDocuments(prev => ({ ...prev, [selectedCourse]: (data.documents || []) }));
      } catch {}
    };
    loadList();
  }, [selectedCourse]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/knowledge?course=${courseParam}&slug=${slugParam}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta dokument');
      }
      
      const data = await response.json();
      const doc = data.documents?.[0];
      
      if (doc) {
        setSelectedDoc({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          content: doc.content,
          headerImage: doc.headerImage || '',
          relatedImages: doc.relatedImages || [],
          keyTakeaways: doc.keyTakeaways || [],
          readTime: doc.readTime || 5,
          course: doc.course,
          order: doc.order || 0
        });
      } else {
        throw new Error('Dokument hittades inte');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!selectedDoc) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/admin/knowledge', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDoc)
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte spara dokument');
      }
      
      alert('Dokument sparat framgångsrikt!');
    } catch (error) {
      console.error('Error saving document:', error);
      setError(error instanceof Error ? error.message : 'Fel vid sparning');
      alert('Fel vid sparning av dokument');
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = (field: keyof KnowledgeDocument, value: any) => {
    if (!selectedDoc) return;

    setSelectedDoc(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const addKeyTakeaway = () => {
    if (!selectedDoc) return;
    updateDocument('keyTakeaways', [...(selectedDoc.keyTakeaways || []), '']);
  };

  const updateKeyTakeaway = (index: number, value: string) => {
    if (!selectedDoc) return;
    const newTakeaways = [...(selectedDoc.keyTakeaways || [])];
    newTakeaways[index] = value;
    updateDocument('keyTakeaways', newTakeaways);
  };

  const removeKeyTakeaway = (index: number) => {
    if (!selectedDoc) return;
    const newTakeaways = (selectedDoc.keyTakeaways || []).filter((_, i) => i !== index);
    updateDocument('keyTakeaways', newTakeaways);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar kunskapsdokument...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin/knowledge" 
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Tillbaka till kunskapsdokument</span>
          </Link>
          
          <h1 className="text-3xl font-light text-[var(--primary-green)]">
            Redigera kunskapsdokument
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Hantera innehåll för alla kurser
          </p>
        </div>

        {selectedDoc && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="admin-btn admin-btn-secondary"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Redigera' : 'Förhandsvisning'}
            </button>
            
            <button
              onClick={saveDocument}
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Course & Document Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Course Selection */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Välj kurs</h2>
            <div className="space-y-2">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course.id as any);
                    setSelectedDoc(null);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedCourse === course.id
                      ? 'bg-[var(--primary-green)] text-white'
                      : 'bg-[var(--primary-beige)] hover:bg-[var(--primary-light-green)] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{course.icon}</span>
                    <span className="font-medium">{course.name}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    {documents[course.id]?.length || 0} dokument
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Document List */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Dokument</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto admin-scrollbar">
              {documents[selectedCourse]?.map((doc, index) => (
                <button
                  key={doc.slug}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedDoc?.slug === doc.slug
                      ? 'bg-[var(--primary-light-green)] text-white'
                      : 'hover:bg-[var(--primary-beige)]'
                  }`}
                >
                  <h3 className="font-medium text-sm line-clamp-2">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs opacity-80">{doc.readTime} min</span>
                  </div>
                </button>
              )) || (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  Inga dokument för denna kurs
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedDoc ? (
            <div className="space-y-6">
              {/* Document Meta */}
              <div className="admin-card">
                <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Dokumentinformation</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Titel</label>
                    <input
                      type="text"
                      value={selectedDoc.title}
                      onChange={(e) => updateDocument('title', e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Lästid (minuter)</label>
                    <input
                      type="number"
                      value={selectedDoc.readTime}
                      onChange={(e) => updateDocument('readTime', parseInt(e.target.value) || 0)}
                      className="admin-input"
                      min="1"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      value={selectedDoc.headerImage || ''}
                      onChange={(url) => updateDocument('headerImage', url)}
                      label="Header-bild"
                    />
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      📸 Ladda upp en header-bild för dokumentet. Rekommenderad storlek: 1200x400px
                    </p>
                  </div>

                  <div>
                    <label className="admin-label">Sorteringsordning</label>
                    <input
                      type="number"
                      value={selectedDoc.order}
                      onChange={(e) => updateDocument('order', parseInt(e.target.value) || 0)}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-[var(--primary-green)]">Innehåll</h2>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="admin-btn admin-btn-secondary"
                  >
                    <Eye className="w-4 h-4" />
                    {previewMode ? 'Redigera' : 'Förhandsvisning'}
                  </button>
                </div>

                {previewMode ? (
                  <div 
                    className="prose max-w-none p-4 bg-[var(--cream-white)] rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                  />
                ) : (
                  <ReactQuill
                    value={selectedDoc.content}
                    onChange={(content) => updateDocument('content', content)}
                    theme="snow"
                    style={{ height: '400px', marginBottom: '50px' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                )}
              </div>

              {/* Key Takeaways */}
              <div className="admin-card">
                <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Viktiga punkter</h2>
                
                <div className="space-y-2">
                  {selectedDoc.keyTakeaways?.map((takeaway, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={takeaway}
                        onChange={(e) => updateKeyTakeaway(index, e.target.value)}
                        className="admin-input"
                        placeholder="Viktig punkt..."
                      />
                      <button
                        onClick={() => removeKeyTakeaway(index)}
                        className="admin-btn admin-btn-danger"
                      >
                        ×
                      </button>
                    </div>
                  )) || []}
                  
                  <button
                    onClick={addKeyTakeaway}
                    className="admin-btn admin-btn-secondary"
                  >
                    Lägg till punkt
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card text-center py-12">
              <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Välj ett dokument att redigera
              </h3>
              <p className="text-[var(--text-secondary)]">
                Välj en kurs och sedan ett dokument från sidopanelen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
