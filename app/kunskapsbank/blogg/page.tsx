"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 Functional Food-stjärnor för långsiktigt välmående',
    excerpt: 'Functional Foods är livsmedel som innehåller naturliga bioaktiva ämnen som gör mer än att bara mätta – de aktivt främjar hälsa. Här är fem stjärnor som ger mest "bang for the bite"...',
    image: '/functional.png',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Functional Foods',
    tags: ['Nutrition', 'Hälsa', 'Superfoods'],
    slug: 'functional-foods'
  },
  {
    id: '2',
    title: 'Timing & kombinerings-hacks som förlänger din hälsa',
    excerpt: 'Det är inte bara vad du äter utan när och tillsammans med vad som avgör hur mycket kroppen faktiskt kan tillgodogöra sig. Här är tre longevity-principer från krononutrition...',
    image: '/longevity.png',
    date: '2024-01-10',
    readTime: '7 min',
    category: 'Longevity',
    tags: ['Longevity', 'Timing', 'Anti-aging'],
    slug: 'longevity'
  }
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-background-secondary py-20">
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight">
            Kunskapsbank <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">Blogg</span>
          </h1>
          <p className="text-xl text-text-secondary text-center max-w-3xl mx-auto">
            Utforska våra artiklar om functional foods, hälsa och välmående. 
            Få vetenskapligt baserade tips för ett längre och friskare liv.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container-custom py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök artiklar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  !selectedCategory 
                    ? 'bg-accent text-white' 
                    : 'bg-background-secondary text-text-secondary hover:bg-gray-200'
                }`}
              >
                Alla
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-accent text-white' 
                      : 'bg-background-secondary text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/kunskapsbank/blogg/${post.slug}`}>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('sv-SE')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl font-medium text-primary mb-3 group-hover:text-accent transition-colors duration-200">
                      {post.title}
                    </h2>

                    <p className="text-text-secondary mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center text-accent font-medium group-hover:gap-2 transition-all duration-200">
                      <span>Läs mer</span>
                      <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              Inga artiklar hittades. Prova att ändra din sökning eller filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
} 