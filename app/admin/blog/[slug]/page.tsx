'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiEdit, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  author: { name: string | null; email: string };
}

// En enkel Markdown-parser
const MarkdownRenderer = ({ content }: { content: string }) => {
    const htmlContent = content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-primary mt-8 mb-4">{line.substring(3)}</h2>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-4 text-text-secondary leading-relaxed">{line}</p>;
      });
  
    return <div>{htmlContent}</div>;
};

export default function ViewBlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    if (slug) {
      fetch(`/api/blog/${slug}`)
        .then(res => res.ok ? res.json() : Promise.reject('Kunde inte hämta inlägget.'))
        .then(setPost)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [slug]);
  
  if (loading) return <div className="p-8 text-center">Laddar...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;
  if (!post) return <div className="p-8 text-center">Inlägget hittades inte.</div>;

  const displayDate = post.status === 'published' ? post.publishedAt : post.scheduledAt;
  const dateLabel = post.status === 'published' ? 'Publicerad' : 'Schemalagd';

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/admin/blog" className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-medium uppercase text-sm tracking-wider">
              <FiChevronLeft className="w-5 h-5" />
              <span>Tillbaka till blogginlägg</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
            <div className="relative w-full h-64 md:h-96">
                <Image src={post.imageUrl} alt={post.imageAlt} layout="fill" objectFit="cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{post.title}</h1>
                </div>
            </div>
            
            <div className="p-8 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-primary/10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <FiUser className="w-5 h-5"/>
                        <span>{post.author.name || post.author.email}</span>
                    </div>
                    {displayDate && (
                      <div className="flex items-center gap-2 text-text-secondary">
                          <FiCalendar className="w-5 h-5"/>
                          <span>{dateLabel}: {format(new Date(displayDate), "d MMMM yyyy", { locale: sv })}</span>
                      </div>
                    )}
                </div>
                <Link href={`/admin/blog/${post.slug}/edit`} className="flex items-center gap-2 text-primary hover:text-secondary font-semibold transition-colors">
                    <FiEdit className="w-4 h-4" />
                    <span>Redigera inlägg</span>
                </Link>
            </div>

            <article className="p-8 prose max-w-none">
                <MarkdownRenderer content={post.content} />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
} 