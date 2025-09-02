"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Save, X, Plus, Check, Eye, Calendar, Tag } from 'lucide-react';
const LOCALES = ['sv','en','es','de','fr'] as const;
type Locale = typeof LOCALES[number];

interface BlogData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  // i18n
  title_en?: string; title_es?: string; title_de?: string; title_fr?: string;
  excerpt_en?: string; excerpt_es?: string; excerpt_de?: string; excerpt_fr?: string;
  content_en?: string; content_es?: string; content_de?: string; content_fr?: string;
  category: string;
  tags: string[];
  coverImage: string;
  metaDescription: string;
  metaDescription_en?: string; metaDescription_es?: string; metaDescription_de?: string; metaDescription_fr?: string;
  published: boolean;
  publishedAt: string;
  readTime: number;
  functionalFoodsFocus: string[];
  keyTakeaways: string[];
  references: string[];
}

const steps = [
  { id: 1, title: 'Grundinfo', description: 'Titel, kategori och publicering' },
  { id: 2, title: 'Innehåll', description: 'Huvudinnehåll och utdrag' },
  { id: 3, title: 'SEO & Meta', description: 'Slug, meta-beskrivning och bild' },
  { id: 4, title: 'Functional', description: 'Fokusområden och nyckelpoänger' },
  { id: 5, title: 'Referenser', description: 'Källor och kategorisering' },
  { id: 6, title: 'Granska', description: 'Kontrollera och publicera' }
];

const categories = [
  'Functional Foods',
  'Näringslära',
  'Hälsa & Välmående',
  'Recept & Kost',
  'Forskning',
  'Livsstil',
  'Kosttillskott',
  'Tarmhälsa',
  'Inflammation',
  'Hjärnhälsa'
];

const functionalFoodsOptions = [
  'Omega-3 fettsyror',
  'Probiotika',
  'Prebiotika',
  'Antioxidanter',
  'Polyfenol',
  'Adaptogener',
  'Fiber',
  'Protein',
  'Vitaminer',
  'Mineraler',
  'Fermenterade livsmedel',
  'Superfood'
];

export default function NewBlogPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeLocale, setActiveLocale] = useState<Locale>('sv');
  const [blogData, setBlogData] = useState<BlogData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    coverImage: '',
    metaDescription: '',
    published: false,
    publishedAt: '',
    readTime: 5,
    functionalFoodsFocus: [],
    keyTakeaways: [],
    references: []
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateBlogData = (field: keyof BlogData, value: any) => {
    setBlogData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const addTag = () => {
    setBlogData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setBlogData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setBlogData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addKeyTakeaway = () => {
    setBlogData(prev => ({
      ...prev,
      keyTakeaways: [...prev.keyTakeaways, '']
    }));
  };

  const addReference = () => {
    setBlogData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare blog post data
      const blogPayload = {
        title: blogData.title,
        slug: blogData.slug || generateSlug(blogData.title),
        content: blogData.content,
        excerpt: blogData.excerpt,
        coverImage: blogData.coverImage,
        published: blogData.published,
        publishedAt: blogData.published ? (blogData.publishedAt || new Date().toISOString()) : null,
        category: blogData.category,
        tags: blogData.tags.filter(tag => tag.trim() !== ''),
        metaDescription: blogData.metaDescription,
        readTime: blogData.readTime,
        functionalFoodsFocus: blogData.functionalFoodsFocus,
        keyTakeaways: blogData.keyTakeaways.filter(takeaway => takeaway.trim() !== ''),
        references: blogData.references.filter(ref => ref.trim() !== ''),
        // i18n fields if present
        title_en: blogData.title_en, title_es: blogData.title_es, title_de: blogData.title_de, title_fr: blogData.title_fr,
        excerpt_en: blogData.excerpt_en, excerpt_es: blogData.excerpt_es, excerpt_de: blogData.excerpt_de, excerpt_fr: blogData.excerpt_fr,
        content_en: blogData.content_en, content_es: blogData.content_es, content_de: blogData.content_de, content_fr: blogData.content_fr,
        metaDescription_en: blogData.metaDescription_en, metaDescription_es: blogData.metaDescription_es, metaDescription_de: blogData.metaDescription_de, metaDescription_fr: blogData.metaDescription_fr,
      } as any;

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save blog post');
      }

      const savedPost = await response.json();
      
      // Show success message or redirect
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Ett fel uppstod när artikeln skulle sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Language Tabs */}
            <div className="flex gap-2 flex-wrap">
              {LOCALES.map(l => (
                <button key={l} onClick={()=>setActiveLocale(l)} className={`px-3 py-1 rounded-full text-sm border ${activeLocale===l?'bg-primary text-white border-primary':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artikeltitel *
              </label>
              <input
                type="text"
                value={blogData.title}
                onChange={(e) => {
                  updateBlogData('title', e.target.value);
                  updateBlogData('slug', generateSlug(e.target.value));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="t.ex. Omega-3: Nyckeln till hjärnhälsa"
              />
              {/* Localized title inputs */}
              {activeLocale!=='sv' && (
                <input type="text" value={(blogData as any)[`title_${activeLocale}`]||''} onChange={(e)=>updateBlogData(`title_${activeLocale}` as any, e.target.value)} className="mt-2 w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder={`Titel (${activeLocale.toUpperCase()})`} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL-slug (genereras automatiskt)
              </label>
              <input
                type="text"
                value={blogData.slug}
                onChange={(e) => updateBlogData('slug', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition-all duration-200"
                placeholder="omega-3-nyckeln-till-hjarnhalsa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utdrag
              </label>
              <textarea
                value={blogData.excerpt}
                onChange={(e) => updateBlogData('excerpt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                rows={3}
              />
              {activeLocale!=='sv' && (
                <textarea value={(blogData as any)[`excerpt_${activeLocale}`]||''} onChange={(e)=>updateBlogData(`excerpt_${activeLocale}` as any, e.target.value)} rows={2} className="mt-2 w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder={`Utdrag (${activeLocale.toUpperCase()})`} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <div className="relative">
                <select
                  value={blogData.category}
                  onChange={(e) => updateBlogData('category', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                >
                  <option value="">Välj kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lästid (minuter)
              </label>
              <input
                type="number"
                value={blogData.readTime}
                onChange={(e) => updateBlogData('readTime', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                min="1"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary hover:bg-background transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  id="published"
                  checked={blogData.published}
                  onChange={(e) => updateBlogData('published', e.target.checked)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Publicera direkt</span>
                  <p className="text-xs text-gray-500">Artikeln blir synlig för alla besökare</p>
                </div>
              </label>

              {blogData.published && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publiceringsdatum
                  </label>
                  <input
                    type="datetime-local"
                    value={blogData.publishedAt}
                    onChange={(e) => updateBlogData('publishedAt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </motion.div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Innehåll</label>
              <textarea
                value={blogData.content}
                onChange={(e) => updateBlogData('content', e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {activeLocale!=='sv' && (
                <textarea value={(blogData as any)[`content_${activeLocale}`]||''} onChange={(e)=>updateBlogData(`content_${activeLocale}` as any, e.target.value)} rows={8} className="mt-2 w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder={`Innehåll (${activeLocale.toUpperCase()})`} />
              )}
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="font-medium text-secondary mb-2">Skrivtips</h3>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Använd tydliga rubriker för att strukturera innehållet</li>
                <li>• Inkludera praktiska tips och råd</li>
                <li>• Referera till vetenskapliga studier när det är relevant</li>
                <li>• Fokusera på functional foods och deras hälsofördelar</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Omslagsbild URL
              </label>
              <input
                type="url"
                value={blogData.coverImage}
                onChange={(e) => updateBlogData('coverImage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="https://example.com/cover-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta‑beskrivning</label>
              <textarea value={blogData.metaDescription} onChange={(e)=>updateBlogData('metaDescription', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              {activeLocale!=='sv' && (
                <textarea value={(blogData as any)[`metaDescription_${activeLocale}`]||''} onChange={(e)=>updateBlogData(`metaDescription_${activeLocale}` as any, e.target.value)} rows={2} className="mt-2 w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder={`Meta (${activeLocale.toUpperCase()})`} />
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">SEO-förhandsvisning</h3>
              <div className="space-y-2">
                <div className="text-blue-600 text-base sm:text-lg font-medium line-clamp-1">
                  {blogData.title || 'Artikeltitel'}
                </div>
                <div className="text-primary text-xs sm:text-sm break-all">
                  functionalfoods.se/kunskapsbank/blogg/{blogData.slug || 'artikel-slug'}
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {blogData.metaDescription || 'Meta-beskrivning visas här...'}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Functional Foods-fokus
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {functionalFoodsOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={option}
                      checked={blogData.functionalFoodsFocus.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateBlogData('functionalFoodsFocus', [...blogData.functionalFoodsFocus, option]);
                        } else {
                          updateBlogData('functionalFoodsFocus', blogData.functionalFoodsFocus.filter(f => f !== option));
                        }
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={option} className="ml-2 text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nyckelpoänger
              </label>
              <div className="space-y-3">
                {blogData.keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={takeaway}
                      onChange={(e) => {
                        const newTakeaways = [...blogData.keyTakeaways];
                        newTakeaways[index] = e.target.value;
                        updateBlogData('keyTakeaways', newTakeaways);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="t.ex. Omega-3 kan förbättra minnesförmågan"
                    />
                    <button
                      onClick={() => {
                        const newTakeaways = blogData.keyTakeaways.filter((_, i) => i !== index);
                        updateBlogData('keyTakeaways', newTakeaways);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addKeyTakeaway}
                  className="flex items-center gap-2 text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till nyckelpoäng
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referenser & Källor
              </label>
              <div className="space-y-3">
                {blogData.references.map((reference, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => {
                        const newReferences = [...blogData.references];
                        newReferences[index] = e.target.value;
                        updateBlogData('references', newReferences);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="t.ex. Studie: 'Omega-3 and Brain Health', Journal of Nutrition (2023)"
                    />
                    <button
                      onClick={() => {
                        const newReferences = blogData.references.filter((_, i) => i !== index);
                        updateBlogData('references', newReferences);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addReference}
                  className="flex items-center gap-2 text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till referens
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taggar
              </label>
              <div className="space-y-3">
                {blogData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="t.ex. omega-3, hjärnhälsa, forskning"
                    />
                    <button
                      onClick={() => removeTag(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTag}
                  className="flex items-center gap-2 text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till tagg
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Artikelöversikt</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><strong>Titel:</strong> {blogData.title}</div>
                  <div><strong>Kategori:</strong> {blogData.category}</div>
                  <div><strong>Lästid:</strong> {blogData.readTime} min</div>
                  <div><strong>Status:</strong> {blogData.published ? 'Publicerad' : 'Utkast'}</div>
                </div>
                <div className="space-y-3">
                  <div><strong>Slug:</strong> {blogData.slug}</div>
                  <div><strong>Taggar:</strong> {blogData.tags.length} st</div>
                  <div><strong>Referenser:</strong> {blogData.references.length} st</div>
                  <div><strong>Functional Foods:</strong> {blogData.functionalFoodsFocus.length} st</div>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary">
                <Check className="w-5 h-5" />
                <span className="font-medium">Redo att publicera</span>
              </div>
              <p className="text-secondary text-sm mt-1">
                Artikeln kommer att vara synlig för användare direkt efter publicering.
              </p>
            </div>

            {blogData.published && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Schemalagd publicering</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Artikeln kommer att publiceras: {blogData.publishedAt ? new Date(blogData.publishedAt).toLocaleString('sv-SE') : 'Direkt'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft />
            Tillbaka till blogglistan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skapa ny bloggpost</h1>
          <p className="text-gray-600 mt-2">Följ stegen för att publicera en ny artikel</p>
        </div>

        {/* Progress Steps - Improved layout */}
        <div className="mb-8">
          <div className="grid grid-cols-6 gap-2 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center relative">
                {/* Connecting line before circle (except first) */}
                {index > 0 && (
                  <div className="absolute top-5 sm:top-6 -left-1/2 w-full">
                    <div
                      className={`h-1 transition-all ${
                        currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all mb-2 relative z-10 ${
                    currentStep >= step.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="text-sm sm:text-base font-medium">{step.id}</span>
                  )}
                </motion.div>
                
                {/* Step text under the circle */}
                <div className={`text-center ${
                  currentStep >= step.id ? 'text-primary font-medium' : 'text-gray-500'
                }`}>
                  <div className="text-xs font-medium leading-tight">{step.title}</div>
                  <div className="text-xs mt-1 leading-tight hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Improved */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
            }`}
          >
            <ArrowLeft />
            Föregående
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Nästa steg
              <ArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save />
                  Publicera artikel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 