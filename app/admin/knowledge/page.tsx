'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, Search, X, Bold, Italic, List, Link2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamisk import av rich text editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Import CSS for ReactQuill
import './quill-editor.css';

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  headerImage?: string | null;
  relatedImages?: any;
  keyTakeaways?: any;
  readTime: number;
  course: string;
  order: number;
  weekNumber?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeAdminPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<KnowledgeDocument> | null>(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [useRichEditor, setUseRichEditor] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = courseFilter === 'all' 
        ? '/api/admin/knowledge' 
        : `/api/admin/knowledge?course=${courseFilter}`;
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (res.status === 401) {
        console.error('Admin authentication failed');
        setDocuments([]);
        return;
      }
      
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [courseFilter]);

  const handleSave = async () => {
    if (!editingDoc) return;
    
    try {
      const method = editingDoc.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/knowledge', {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDoc)
      });
      
      if (res.ok) {
        fetchDocuments();
        setIsEditing(false);
        setEditingDoc(null);
      } else {
        console.error('Failed to save document:', await res.text());
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta dokument?')) return;
    
    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        fetchDocuments();
      } else {
        console.error('Failed to delete document:', await res.text());
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setEditingDoc({
      title: '',
      slug: '',
      content: '',
      headerImage: '',
      readTime: 5,
      course: 'basic',
      order: documents.length,
      weekNumber: null
    });
    setIsEditing(true);
  };

  const handleEditRelatedImages = (doc: KnowledgeDocument) => {
    const images = doc.relatedImages || [];
    const newImages = prompt(
      'Ange relaterade bilder (en per rad, format: bildurl|bildtext):\n' + 
      'Exempel:\n/images/bild1.jpg|Beskrivning 1\n/images/bild2.jpg|Beskrivning 2',
      images.map((img: any) => `${img.src}|${img.alt}`).join('\n')
    );
    
    if (newImages !== null) {
      const parsed = newImages.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [src, alt] = line.split('|');
          return { src: src.trim(), alt: alt?.trim() || '' };
        });
      
      setEditingDoc({ ...doc, relatedImages: parsed });
      setIsEditing(true);
    }
  };

  const handleEditKeyTakeaways = (doc: KnowledgeDocument) => {
    const takeaways = doc.keyTakeaways || [];
    const newTakeaways = prompt(
      'Ange nyckelpunkter (en per rad):',
      takeaways.join('\n')
    );
    
    if (newTakeaways !== null) {
      const parsed = newTakeaways.split('\n')
        .filter(line => line.trim());
      
      setEditingDoc({ ...doc, keyTakeaways: parsed });
      setIsEditing(true);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Kunskapsdokument</h1>
        <p className="text-[var(--text-secondary)] font-light">Hantera kunskapsdokument för Functional Basics, Flow och Energy</p>
      </div>

      {/* Filters and Actions */}
      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">Alla kurser</option>
              <option value="basic">Functional Basics</option>
              <option value="flow">Functional Gut Health/Flow</option>
              <option value="energy">Functional Insulin balance/Energy</option>
            </select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Sök dokument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-10 w-64"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link 
              href="/admin/knowledge/edit"
              className="admin-btn admin-btn-secondary"
            >
              <Edit className="w-4 h-4" />
              Redigera dokument
            </Link>
            
            <button
              onClick={handleCreateNew}
              className="admin-btn admin-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Nytt dokument
            </button>
          </div>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)]">Laddar dokument...</p>
          </div>
        </div>
      ) : (
        <div className="admin-table">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Titel</th>
                <th className="text-left">Kurs</th>
                <th className="text-left">Vecka</th>
                <th className="text-left">Ordning</th>
                <th className="text-left">Läsningstid</th>
                <th className="text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{doc.title}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{doc.slug}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className={`admin-badge ${
                      doc.course === 'basic' 
                        ? 'admin-badge-info' 
                        : doc.course === 'flow'
                        ? 'admin-badge-success'
                        : 'admin-badge-warning'
                    }`}>
                      {doc.course === 'basic' ? 'Basics' : doc.course === 'flow' ? 'Flow' : 'Insulin balance/Energy'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-sm text-[var(--text-primary)]">
                    {doc.weekNumber || '-'}
                  </td>
                  <td className="whitespace-nowrap text-sm text-[var(--text-primary)]">
                    {doc.order}
                  </td>
                  <td className="whitespace-nowrap text-sm text-[var(--text-primary)]">
                    {doc.readTime} min
                  </td>
                  <td className="whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingDoc(doc);
                        setIsEditing(true);
                      }}
                      className="p-2 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-all mr-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-[var(--coral-accent)] hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              Inga dokument hittades
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingDoc && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setIsEditing(false);
            setEditingDoc(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">
                {editingDoc.id ? 'Redigera dokument' : 'Skapa nytt dokument'}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingDoc(null);
                }}
                className="p-2 hover:bg-[var(--primary-beige)] rounded-lg transition-colors"
                title="Stäng"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={editingDoc.title || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editingDoc.slug || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, slug: e.target.value })}
                    className="admin-input"
                    placeholder="t.ex. veckans-lasning-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="admin-label">
                    Kurs
                  </label>
                  <select
                    value={editingDoc.course || 'basic'}
                    onChange={(e) => setEditingDoc({ ...editingDoc, course: e.target.value })}
                    className="admin-input"
                  >
                    <option value="basic">Functional Basics</option>
                    <option value="flow">Functional Gut Health/Flow</option>
                    <option value="energy">Functional Insulin balance/Energy</option>
                  </select>
                </div>
                
                <div>
                  <label className="admin-label">
                    Vecka
                  </label>
                  <input
                    type="number"
                    value={editingDoc.weekNumber || ''}
                    onChange={(e) => setEditingDoc({ 
                      ...editingDoc, 
                      weekNumber: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="admin-input"
                    min="1"
                    max="8"
                  />
                </div>
                
                <div>
                  <label className="admin-label">
                    Ordning
                  </label>
                  <input
                    type="number"
                    value={editingDoc.order || 0}
                    onChange={(e) => setEditingDoc({ 
                      ...editingDoc, 
                      order: parseInt(e.target.value) || 0 
                    })}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">
                    Läsningstid (min)
                  </label>
                  <input
                    type="number"
                    value={editingDoc.readTime || 5}
                    onChange={(e) => setEditingDoc({ 
                      ...editingDoc, 
                      readTime: parseInt(e.target.value) || 5 
                    })}
                    className="admin-input"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">
                  Huvudbild URL
                </label>
                <input
                  type="text"
                  value={editingDoc.headerImage || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, headerImage: e.target.value })}
                  className="admin-input"
                  placeholder="/images/artikel.jpg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Innehåll
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseRichEditor(!useRichEditor)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {useRichEditor ? 'Visa HTML' : 'Visa editor'}
                    </button>
                  </div>
                </div>
                
                {useRichEditor ? (
                  <div className="border rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={editingDoc.content || ''}
                      onChange={(content) => setEditingDoc({ ...editingDoc, content })}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          [{ 'color': [] }, { 'background': [] }],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header', 'bold', 'italic', 'underline', 'strike',
                        'list', 'bullet', 'link', 'image', 'color', 'background'
                      ]}
                      style={{ height: '300px', marginBottom: '50px' }}
                      placeholder="Skriv artikel innehåll här..."
                    />
                  </div>
                ) : (
                  <textarea
                    value={editingDoc.content || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg h-64 font-mono text-sm"
                    placeholder="<p>Artikel innehåll här...</p>"
                  />
                )}
              </div>

              <div className="flex gap-4">
                {editingDoc.id && (
                  <>
                    <button
                      onClick={() => handleEditKeyTakeaways(editingDoc as KnowledgeDocument)}
                      className="text-[var(--primary-light-green)] hover:text-[var(--primary-green)] text-sm transition-colors"
                    >
                      Redigera nyckelpunkter
                    </button>
                    <button
                      onClick={() => handleEditRelatedImages(editingDoc as KnowledgeDocument)}
                      className="text-[var(--primary-light-green)] hover:text-[var(--primary-green)] text-sm transition-colors"
                    >
                      Redigera relaterade bilder
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingDoc(null);
                }}
                className="admin-btn admin-btn-secondary"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                className="admin-btn admin-btn-primary"
              >
                Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 