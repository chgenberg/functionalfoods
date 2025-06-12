"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiTag, FiUser, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  author: { name: string | null; email: string };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">BLOGGINLÄGG</h1>
          <p className="text-lg text-text-secondary mt-1">Hantera, redigera och publicera artiklar.</p>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 mt-4 sm:mt-0 uppercase text-sm tracking-wider group"
        >
          <FiPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Skriv nytt inlägg</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="text"
              placeholder="Sök inlägg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-primary font-medium uppercase text-sm tracking-wider">
              <option>Alla status</option>
              <option>Publicerad</option>
              <option>Utkast</option>
              <option>Schemalagd</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-primary/10">
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Titel</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Författare</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden lg:table-cell">Datum</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Laddar inlägg...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Inga inlägg hittades.
                  </td>
                </tr>
              ) : (
                filteredPosts.map(post => (
                  <tr key={post.id} className="border-b border-primary/5 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-primary">{post.title}</p>
                      <p className="text-sm text-text-secondary">{post.slug}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-primary/50" />
                        <span className="text-sm text-text-secondary">
                          {post.author?.name || post.author?.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-primary/50" />
                        <span className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        post.status === 'published' ? 'bg-success/10 text-success' : 
                        post.status === 'scheduled' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {post.status === 'published' ? 'Publicerad' : 
                         post.status === 'scheduled' ? 'Schemalagd' : 'Utkast'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 