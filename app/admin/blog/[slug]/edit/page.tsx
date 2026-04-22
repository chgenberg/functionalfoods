'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader, AlertTriangle } from 'lucide-react';
import WysiwygEditor from '@/app/components/WysiwygEditor';
import ImageUpload from '@/app/components/admin/ImageUpload';

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
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const postId = searchParams.get('id');

  const normalizeSlug = (value: string) => {
    const decoded = decodeURIComponent(value || '').trim();
    const withoutDomain = decoded.replace(/^https?:\/\/[^/]+/i, '');
    const withoutKnownPrefix = withoutDomain
      .replace(/^\/?kunskapsbank\/blogg\//i, '')
      .replace(/^\/?blogg\//i, '');
    return withoutKnownPrefix.replace(/^\/+|\/+$/g, '');
  };

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError('');

        const normalizedSlug = normalizeSlug(String(slug));
        const endpoint = postId
          ? `/api/admin/blog/${encodeURIComponent(postId)}`
          : `/api/admin/blog/slug/${encodeURIComponent(normalizedSlug)}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Kunde inte hämta inlägget.');
        const data = await res.json();

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
  }, [slug, postId]);

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const normalizedSlug = normalizeSlug(String(slug));
      const endpoint = postId
        ? `/api/admin/blog/${encodeURIComponent(postId)}`
        : `/api/admin/blog/slug/${encodeURIComponent(normalizedSlug)}`;
      const response = await fetch(endpoint, {
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
              <ImageUpload
                value={post.coverImage || ''}
                onChange={(url) => setPost({ ...post!, coverImage: url })}
                label="Omslagsbild"
              />
              <p className="mt-2 text-sm text-gray-500">
                Rekommenderad storlek: 1200x630px för bästa visning
              </p>
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
