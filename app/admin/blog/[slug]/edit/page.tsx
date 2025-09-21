'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Save, Loader, AlertTriangle, Upload } from 'lucide-react';
import WysiwygEditor from '@/app/components/WysiwygEditor';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  coverImage?: string;
  imageAlt?: string;
  status: string;
  published?: boolean;
}

export default function EditBlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError('');

        // Try admin route by ID first
        let res = await fetch(`/api/admin/blog/${slug}`);
        let data: any;

        if (res.ok) {
          data = await res.json();
        } else {
          // Fallback to public slug route
          res = await fetch(`/api/blog/slug/${slug}`);
          if (!res.ok) throw new Error('Kunde inte hämta inlägget.');
          const payload = await res.json();
          data = payload.post || payload;
        }

        // Normalize for UI
        const normalized: any = {
          ...data,
          status: data.status || (data.published ? 'published' : 'draft'),
          // Prefer coverImage in admin model; keep imageUrl for compatibility
          coverImage: data.coverImage || data.imageUrl || '',
        };
        setPost(normalized);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta inlägget.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prefer admin update by ID when available, else fallback to slug update
      const updateAdmin = await fetch(`/api/admin/blog/${(post as any).id || slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          slug: (post as any).slug,
          coverImage: (post as any).coverImage || (post as any).imageUrl || '',
          published: post.status === 'published'
        }),
      });

      const response = updateAdmin.ok ? updateAdmin : await fetch(`/api/blog/slug/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          coverImage: (post as any).coverImage || (post as any).imageUrl || '',
          published: post.status === 'published',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel när inlägget skulle sparas.');
      }
      
      setSuccess('Inlägget har sparats!');
      // Normalize after save
      setPost({ ...data, status: data.status || (data.published ? 'published' : 'draft'), coverImage: data.coverImage || data.imageUrl || '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunde inte ladda upp bild');
      setPost({ ...post!, coverImage: data.url, imageAlt: post?.imageAlt || post?.title || 'Bild' });
    } catch (err: any) {
      alert(err.message || 'Fel vid bilduppladdning');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="p-8 text-center">
        <p className="text-error">{error}</p>
        <Link href="/admin/blog" className="mt-4 inline-block text-primary hover:text-secondary">
          Tillbaka till blogginlägg
        </Link>
      </div>
    );
  }

  if (!post) {
    return null; // Eller en "hittades inte"-sida
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Tillbaka till blogginlägg</span>
          </Link>
        </div>
        
        <div className="admin-card">
          <div className="p-6 border-b border-[var(--border-light)]">
            <h1 className="text-2xl font-light text-[var(--primary-green)]">Redigera inlägg</h1>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="admin-label" htmlFor="post-title">
                Titel
              </label>
              <input
                id="post-title"
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="admin-input"
              />
            </div>
            
            <div>
              <label className="admin-label" htmlFor="post-content">
                Innehåll
              </label>
              <WysiwygEditor
                value={post.content}
                onChange={(value) => setPost({ ...post, content: value })}
                placeholder="Redigera ditt blogginlägg här..."
                height={500}
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="post-status">
                Status
              </label>
              <select
                id="post-status"
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value })}
                className="admin-select sm:w-64"
              >
                <option value="draft">Utkast</option>
                <option value="scheduled">Schemalagd</option>
                <option value="published">Publicerad</option>
              </select>
            </div>
            
            <div>
              <label className="admin-label">
                Bild
              </label>
              <div 
                className="space-y-3"
              >
                <label
                  htmlFor="file-input"
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) await uploadFile(file);
                  }}
                  className={`relative block w-full h-64 rounded-xl overflow-hidden border-2 ${dragging ? 'border-dashed border-[var(--primary-light-green)] bg-[var(--primary-beige)]' : 'border-[var(--border-light)] hover:border-[var(--primary-light-green)]'} transition-all cursor-pointer`}
                >
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.imageAlt || post.title} layout="fill" objectFit="cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm gap-2">
                      {uploading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin text-[var(--primary-green)]" />
                          <span>Laddar upp...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2" />
                          <span>Dra & släpp bild här</span>
                          <span className="text-xs">eller klicka för att välja fil</span>
                        </>
                      )}
                    </div>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await uploadFile(file);
                    }}
                    className="block text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--border-light)] flex justify-between items-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  <span>Sparar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Spara ändringar</span>
                </>
              )}
            </button>
            
            <div className="h-6">
              {error && <p className="text-sm text-[var(--coral-accent)] flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</p>}
              {success && <p className="text-sm text-[var(--primary-light-green)]">{success}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 