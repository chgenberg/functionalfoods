"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { GiMeal } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Book, CheckCircle, Clock, DollarSign, Download, Eye, FileText, Image, Leaf, MessageSquare, Moon, Plus, Save, Sprout, Sun, Target, Users, X } from "lucide-react";;

interface Recipe {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
}

interface WeekData {
  weekNumber: number;
  title: string;
  description: string;
  goals: string[];
  mealPlan: {
    [day: string]: {
      breakfast: { recipeId?: string; name?: string; note?: string };
      lunch: { recipeId?: string; name?: string; note?: string };
      dinner: { recipeId?: string; name?: string; note?: string };
      snack?: { recipeId?: string; name?: string; note?: string };
      dessert?: { recipeId?: string; name?: string; note?: string };
    };
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  progress: number;
  createdAt: string;
  weeks?: WeekData[];
}

// Recipe Selector Modal Component
const RecipeSelector = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  category 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (recipe: Recipe) => void;
  category?: string;
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
    }
  }, [isOpen, search, selectedCategory]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/recipes?${params}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-pink-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Välj recept</h3>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Sök recept..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Alla kategorier</option>
                  <option value="breakfast">Frukost</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Middag</option>
                  <option value="snack">Mellanmål</option>
                  <option value="dessert">Efterrätt</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] p-6 bg-gray-50">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Laddar recept...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GiMeal className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Inga recept hittades</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {recipes.map((recipe, index) => (
                    <motion.button
                      key={recipe.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onSelect(recipe);
                        onClose();
                      }}
                      className="text-left p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <GiMeal className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {recipe.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                              {recipe.category}
                            </span>
                            <span>{recipe.difficulty}</span>
                            <span>{recipe.prepTime} + {recipe.cookTime}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'weeks'>('basic');
  const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false);
  const [selectedMealInfo, setSelectedMealInfo] = useState<{
    weekIndex: number;
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '4 weeks',
    weeks: [] as WeekData[],
    price: 0,
    coverImage: '',
    enableCommunity: false
  });

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
        setFormData({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          duration: courseData.duration,
          weeks: courseData.weeks || [],
          price: courseData.price || 0,
          coverImage: courseData.coverImage || '',
          enableCommunity: courseData.enableCommunity || false
        });
      } else {
        alert('Kunde inte hämta kurs');
        router.push('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Ett fel uppstod');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        alert(error.error || 'Kunde inte uppdatera kurs');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Ett fel uppstod');
    } finally {
      setSaving(false);
    }
  };

  const addWeek = () => {
    const newWeek: WeekData = {
      weekNumber: formData.weeks.length + 1,
      title: '',
      description: '',
      goals: [''],
      mealPlan: {
        1: { breakfast: {}, lunch: {}, dinner: {} },
        2: { breakfast: {}, lunch: {}, dinner: {} },
        3: { breakfast: {}, lunch: {}, dinner: {} },
        4: { breakfast: {}, lunch: {}, dinner: {} },
        5: { breakfast: {}, lunch: {}, dinner: {} },
        6: { breakfast: {}, lunch: {}, dinner: {} },
        7: { breakfast: {}, lunch: {}, dinner: {} },
      }
    };
    setFormData({
      ...formData,
      weeks: [...formData.weeks, newWeek]
    });
  };

  const updateWeek = (index: number, field: keyof WeekData, value: any) => {
    const newWeeks = [...formData.weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setFormData({ ...formData, weeks: newWeeks });
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (!selectedMealInfo) return;
    
    const { weekIndex, day, mealType } = selectedMealInfo;
    const newWeeks = [...formData.weeks];
    const week = newWeeks[weekIndex];
    
    if (!week.mealPlan[day]) {
      week.mealPlan[day] = { breakfast: {}, lunch: {}, dinner: {} };
    }
    
    week.mealPlan[day][mealType] = {
      recipeId: recipe.id,
      name: recipe.title
    };
    
    setFormData({ ...formData, weeks: newWeeks });
    setSelectedMealInfo(null);
  };

  const removeMeal = (weekIndex: number, day: number, mealType: string) => {
    const newWeeks = [...formData.weeks];
    const week = newWeeks[weekIndex];
    
    if (week.mealPlan[day] && week.mealPlan[day][mealType as keyof typeof week.mealPlan[typeof day]]) {
      delete week.mealPlan[day][mealType as keyof typeof week.mealPlan[typeof day]];
    }
    
    setFormData({ ...formData, weeks: newWeeks });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Laddar kurs...</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <p className="text-xl text-gray-600">Kursen hittades inte</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Tillbaka</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Redigera kurs
            </h1>
            <p className="text-gray-600 text-lg">Uppdatera kursinformation och innehåll</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/utbildning/functional-basics`)}
              className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-md flex items-center gap-2"
            >
              <Eye />
              Förhandsgranska
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-2 mb-6"
          >
            <nav className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'basic'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Book />
                Grundinformation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('weeks')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'weeks'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <GiMeal />
                Veckoplanering & Måltider
              </button>
            </nav>
          </motion.div>

          {activeTab === 'basic' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6"
            >
              {/* Course Header Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <Book className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{course.title}</h2>
                      <p className="text-white/80 text-sm mt-1">Kurs-ID: {course.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{course.progress}%</div>
                    <div className="text-sm text-gray-500">Slutförd</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500">Deltagare</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-500">Betyg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">6v</div>
                    <div className="text-sm text-gray-500">Längd</div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="text-orange-500" />
                  Grundläggande information
                </h3>

                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kursnamn *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                      required
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beskrivning *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100 resize-none"
                      required
                    />
                  </div>

                  {/* Level and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivå
                      </label>
                      <div className="relative">
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100 appearance-none pr-10"
                        >
                          <option value="Beginner"><Sprout className="w-5 h-5 inline" /> Nybörjare</option>
                          <option value="Intermediate"><Leaf className="w-5 h-5 inline" /> Medel</option>
                          <option value="Advanced">🌳 Avancerad</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Längd
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                          placeholder="T.ex. 6 veckor"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="text-primary" />
                  Pris & Inställningar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pris (SEK)
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                      placeholder="1497"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Omslagsbild URL
                    </label>
                    <div className="relative">
                      <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.coverImage || ''}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableCommunity || false}
                      onChange={(e) => setFormData({ ...formData, enableCommunity: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700">
                      <MessageSquare className="inline mr-2 text-blue-500" />
                      Aktivera community-funktioner
                    </span>
                  </label>
                </div>
              </div>

              {/* Meta Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Skapad</div>
                    <div className="font-semibold text-gray-900">{new Date(course.createdAt).toLocaleDateString('sv-SE')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Senast uppdaterad</div>
                    <div className="font-semibold text-gray-900">{new Date().toLocaleDateString('sv-SE')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="font-semibold text-primary">Publicerad</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Version</div>
                    <div className="font-semibold text-gray-900">2.0</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'weeks' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Week Planning Header */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <GiMeal className="text-orange-500" />
                  Veckoplanering & Måltider
                </h2>
                <p className="text-gray-600">Skapa en engagerande veckostruktur med måltidsplaner för varje dag</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{formData.weeks.length}</div>
                    <div className="text-sm text-gray-600">Veckor</div>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formData.weeks.reduce((total, week) => {
                        return total + Object.keys(week.mealPlan).reduce((dayTotal, day) => {
                          const meals = week.mealPlan[day];
                          return dayTotal + (meals?.breakfast?.name ? 1 : 0) + 
                                           (meals?.lunch?.name ? 1 : 0) + 
                                           (meals?.dinner?.name ? 1 : 0);
                        }, 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Måltider planerade</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formData.weeks.length * 7}</div>
                    <div className="text-sm text-gray-600">Dagar totalt</div>
                  </div>
                </div>
              </div>

              {/* Weeks */}
              <AnimatePresence>
                {formData.weeks.map((week, weekIndex) => (
                  <motion.div
                    key={weekIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Week Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {week.weekNumber}
                          </div>
                          <h3 className="text-2xl font-bold text-white">Vecka {week.weekNumber}</h3>
                        </div>
                        {formData.weeks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                weeks: formData.weeks.filter((_, i) => i !== weekIndex)
                              });
                            }}
                            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {/* Week Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Veckotitel
                          </label>
                          <input
                            type="text"
                            value={week.title}
                            onChange={(e) => updateWeek(weekIndex, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                            placeholder="T.ex. Introduktion till Functional Foods"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kort beskrivning
                          </label>
                          <input
                            type="text"
                            value={week.description}
                            onChange={(e) => updateWeek(weekIndex, 'description', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-100"
                            placeholder="Vad fokuserar veckan på?"
                          />
                        </div>
                      </div>

                      {/* Meal Planning */}
                      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <GiMeal className="text-orange-500" />
                          Måltidsplanering
                        </h4>
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <motion.div 
                              key={day} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: day * 0.05 }}
                              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                                    {day}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-800">
                                      {['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'][day - 1]}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Frukost */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 mb-1 block"><Sun className="w-5 h-5 inline" /> Frukost</label>
                                  {week.mealPlan[day]?.breakfast?.name ? (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg group">
                                      <span className="text-sm font-medium text-gray-700 truncate">{week.mealPlan[day].breakfast.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeMeal(weekIndex, day, 'breakfast')}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 ml-2"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMealInfo({ weekIndex, day, mealType: 'breakfast' });
                                        setRecipeSelectorOpen(true);
                                      }}
                                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                                    >
                                      + Välj recept
                                    </button>
                                  )}
                                </div>

                                {/* Lunch */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 mb-1 block"><Sun className="w-5 h-5 inline" /> Lunch</label>
                                  {week.mealPlan[day]?.lunch?.name ? (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg group">
                                      <span className="text-sm font-medium text-gray-700 truncate">{week.mealPlan[day].lunch.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeMeal(weekIndex, day, 'lunch')}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 ml-2"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMealInfo({ weekIndex, day, mealType: 'lunch' });
                                        setRecipeSelectorOpen(true);
                                      }}
                                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary hover:bg-background transition-all"
                                    >
                                      + Välj recept
                                    </button>
                                  )}
                                </div>

                                {/* Middag */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 mb-1 block"><Moon className="w-5 h-5 inline" /> Middag</label>
                                  {week.mealPlan[day]?.dinner?.name ? (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg group">
                                      <span className="text-sm font-medium text-gray-700 truncate">{week.mealPlan[day].dinner.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeMeal(weekIndex, day, 'dinner')}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 ml-2"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMealInfo({ weekIndex, day, mealType: 'dinner' });
                                        setRecipeSelectorOpen(true);
                                      }}
                                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    >
                                      + Välj recept
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Add Week Button */}
              <motion.button
                type="button"
                onClick={addWeek}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="text-xl" />
                Lägg till vecka
              </motion.button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-8"
          >
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl font-medium"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sparar ändringar...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="text-xl" />
                  <span>Spara ändringar</span>
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.push('/admin/courses')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Avbryt
            </motion.button>
          </motion.div>
        </form>
      </div>
      
      {/* Recipe Selector Modal */}
      <RecipeSelector
        isOpen={recipeSelectorOpen}
        onClose={() => {
          setRecipeSelectorOpen(false);
          setSelectedMealInfo(null);
        }}
        onSelect={handleRecipeSelect}
        category={selectedMealInfo?.mealType === 'breakfast' ? 'Frukost' : 
                 selectedMealInfo?.mealType === 'lunch' ? 'Lunch' : 
                 selectedMealInfo?.mealType === 'dinner' ? 'Middag' : undefined}
      />
    </div>
  );
} 