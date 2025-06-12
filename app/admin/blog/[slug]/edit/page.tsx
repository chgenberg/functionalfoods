'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiSave, FiLoader, FiAlertTriangle } from 'react-icons/fi';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  status: string;
}

export default function EditBlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    if (slug) {
      fetch(`/api/blog/${slug}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Kunde inte hämta inlägget.');
          }
          return res.json();
        })
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [slug]);

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          status: post.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel när inlägget skulle sparas.');
      }
      
      setSuccess('Inlägget har sparats!');
      setPost(data); // Uppdatera med eventuell ny data från servern
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
        <FiLoader className="animate-spin text-primary w-8 h-8" />
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
          <Link href="/admin/blog" className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-medium uppercase text-sm tracking-wider">
            <FiChevronLeft className="w-5 h-5" />
            <span>Tillbaka till blogginlägg</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-primary/10">
          <div className="p-6 border-b border-primary/10">
            <h1 className="text-2xl font-bold text-primary">Redigera inlägg</h1>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2" htmlFor="post-title">
                Titel
              </label>
              <input
                id="post-title"
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2" htmlFor="post-content">
                Innehåll (Markdown)
              </label>
              <textarea
                id="post-content"
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2" htmlFor="post-status">
                Status
              </label>
              <select
                id="post-status"
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value })}
                className="w-full sm:w-64 px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none"
              >
                <option value="draft">Utkast</option>
                <option value="scheduled">Schemalagd</option>
                <option value="published">Publicerad</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Bild
              </label>
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image src={post.imageUrl} alt={post.imageAlt} layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-primary/10 flex justify-between items-center bg-background/50 rounded-b-2xl">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:bg-gray-400 uppercase text-sm tracking-wider group"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin w-5 h-5" />
                  <span>Sparar...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Spara ändringar</span>
                </>
              )}
            </button>
            
            <div className="h-6">
              {error && <p className="text-sm text-error flex items-center gap-2"><FiAlertTriangle /> {error}</p>}
              {success && <p className="text-sm text-success">{success}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 