"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiSave, FiX, FiPlus, FiCheck, FiEye, FiCalendar, FiTag } from 'react-icons/fi';
import Link from 'next/link';

interface BlogData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  metaDescription: string;
  published: boolean;
  publishedAt: string;
  readTime: number;
  functionalFoodsFocus: string[];
  keyTakeaways: string[];
  references: string[];
}

const steps = [
  { id: 1, title: 'Grundläggande info', description: 'Titel, kategori och publicering' },
  { id: 2, title: 'Innehåll', description: 'Huvudinnehåll och utdrag' },
  { id: 3, title: 'SEO & Metadata', description: 'Slug, meta-beskrivning och bild' },
  { id: 4, title: 'Functional Foods', description: 'Fokusområden och nyckelpoänger' },
  { id: 5, title: 'Referenser & Taggar', description: 'Källor och kategorisering' },
  { id: 6, title: 'Granska & Publicera', description: 'Kontrollera och publicera' }
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
        references: blogData.references.filter(ref => ref.trim() !== '')
      };

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="t.ex. Omega-3: Nyckeln till hjärnhälsa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL-slug (genereras automatiskt)
              </label>
              <input
                type="text"
                value={blogData.slug}
                onChange={(e) => updateBlogData('slug', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                placeholder="omega-3-nyckeln-till-hjarnhalsa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={blogData.category}
                onChange={(e) => updateBlogData('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Välj kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lästid (minuter)
              </label>
              <input
                type="number"
                value={blogData.readTime}
                onChange={(e) => updateBlogData('readTime', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={blogData.published}
                  onChange={(e) => updateBlogData('published', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
                  Publicera direkt
                </label>
              </div>

              {blogData.published && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publiceringsdatum
                  </label>
                  <input
                    type="datetime-local"
                    value={blogData.publishedAt}
                    onChange={(e) => updateBlogData('publishedAt', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kort sammanfattning *
              </label>
              <textarea
                value={blogData.excerpt}
                onChange={(e) => updateBlogData('excerpt', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="En kort sammanfattning som visas i artikelöversikten och i sociala medier..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artikelinnehåll *
              </label>
              <textarea
                value={blogData.content}
                onChange={(e) => updateBlogData('content', e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Skriv artikelinnehållet här. Du kan använda Markdown-formatering..."
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Skrivtips</h3>
              <ul className="text-sm text-green-700 space-y-1">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://example.com/cover-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta-beskrivning (SEO) *
              </label>
              <textarea
                value={blogData.metaDescription}
                onChange={(e) => updateBlogData('metaDescription', e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="En kort beskrivning för sökmotorer (max 160 tecken)"
              />
              <p className="text-sm text-gray-500 mt-1">
                {blogData.metaDescription.length}/160 tecken
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">SEO-förhandsvisning</h3>
              <div className="space-y-2">
                <div className="text-blue-600 text-lg font-medium">
                  {blogData.title || 'Artikeltitel'}
                </div>
                <div className="text-green-600 text-sm">
                  functionalfoods.se/kunskapsbank/blogg/{blogData.slug || 'artikel-slug'}
                </div>
                <div className="text-gray-600 text-sm">
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
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="t.ex. Omega-3 kan förbättra minnesförmågan"
                    />
                    <button
                      onClick={() => {
                        const newTakeaways = blogData.keyTakeaways.filter((_, i) => i !== index);
                        updateBlogData('keyTakeaways', newTakeaways);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addKeyTakeaway}
                  className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="t.ex. Studie: 'Omega-3 and Brain Health', Journal of Nutrition (2023)"
                    />
                    <button
                      onClick={() => {
                        const newReferences = blogData.references.filter((_, i) => i !== index);
                        updateBlogData('references', newReferences);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addReference}
                  className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="t.ex. omega-3, hjärnhälsa, forskning"
                    />
                    <button
                      onClick={() => removeTag(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTag}
                  className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
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

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <FiCheck className="w-5 h-5" />
                <span className="font-medium">Redo att publicera</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Artikeln kommer att vara synlig för användare direkt efter publicering.
              </p>
            </div>

            {blogData.published && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <FiCalendar className="w-5 h-5" />
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/blog"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Tillbaka till blogginlägg
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Skapa nytt blogginlägg</h1>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep 
                      ? 'bg-green-600 text-white' 
                      : step.id < currentStep 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <FiCheck className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Föregående
          </button>

          {currentStep === steps.length ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sparar...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  {blogData.published ? 'Publicera artikel' : 'Spara som utkast'}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Nästa
              <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 