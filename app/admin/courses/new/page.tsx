"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { GiMeal, GiFruitBowl } from 'react-icons/gi';
import { ArrowLeft, ArrowRight, Check, Book, Clock, Users, Target, Image, Save, Calendar, Download, Plus, X, FileText } from 'lucide-react';

interface WeekData {
  weekNumber: number;
  title: string;
  description: string;
  goals: string[];
  knowledgeMaterials: {
    title: string;
    description: string;
    readTime: string;
    content: string;
  }[];
  mealPlan: {
    [day: string]: {
      breakfast: { recipeId?: string; name?: string; note?: string };
      lunch: { recipeId?: string; name?: string; note?: string };
      dinner: { recipeId?: string; name?: string; note?: string };
      snack?: { recipeId?: string; name?: string; note?: string };
      dessert?: { recipeId?: string; name?: string; note?: string };
    };
  };
  shoppingList: string[];
}

interface Recipe {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
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

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
    }
  }, [isOpen, search]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Välj recept</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Sök recept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid gap-3">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    onSelect(recipe);
                    onClose();
                  }}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <div className="font-medium text-gray-900">{recipe.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {recipe.category} • {recipe.difficulty} • {recipe.prepTime} + {recipe.cookTime}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function NewCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false);
  const [selectedMealInfo, setSelectedMealInfo] = useState<{
    weekIndex: number;
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  } | null>(null);
  
  const [courseData, setCourseData] = useState({
    // Grundinformation
    title: '',
    description: '',
    level: 'Beginner',
    duration: '6 veckor',
    price: 0,
    objectives: [''],
    targetAudience: '',
    coverImage: '',
    
    // Kursstruktur
    welcomeMessage: '',
    introVideoUrl: '',
    weeks: [] as WeekData[],
    
    // Kursmaterial
    materials: [] as {
      title: string;
      description: string;
      category: string;
      readTime: string;
      content: string;
    }[],
    
    // Nedladdningar
    downloads: [] as {
      title: string;
      description: string;
      category: string;
      fileUrl: string;
      fileSize: string;
    }[],
    
    // Community
    enableCommunity: true,
    communityDescription: '',
  });

  const steps = [
    { number: 1, title: 'Grundinfo', icon: Book },
    { number: 2, title: 'Struktur', icon: Calendar },
    { number: 3, title: 'Veckor', icon: GiMeal },
    { number: 4, title: 'Material', icon: FileText },
    { number: 5, title: 'Nedladdningar', icon: Download },
    { number: 6, title: 'Community', icon: Users },
    { number: 7, title: 'Granska', icon: Check },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        alert(error.error || 'Ett fel uppstod');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Ett fel uppstod vid skapande av kurs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addObjective = () => {
    setCourseData({
      ...courseData,
      objectives: [...courseData.objectives, ''],
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...courseData.objectives];
    newObjectives[index] = value;
    setCourseData({ ...courseData, objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    setCourseData({
      ...courseData,
      objectives: courseData.objectives.filter((_, i) => i !== index),
    });
  };

  const addWeek = () => {
    const newWeek: WeekData = {
      weekNumber: courseData.weeks.length + 1,
      title: '',
      description: '',
      goals: [''],
      knowledgeMaterials: [],
      mealPlan: {
        1: { breakfast: {}, lunch: {}, dinner: {} },
        2: { breakfast: {}, lunch: {}, dinner: {} },
        3: { breakfast: {}, lunch: {}, dinner: {} },
        4: { breakfast: {}, lunch: {}, dinner: {} },
        5: { breakfast: {}, lunch: {}, dinner: {} },
        6: { breakfast: {}, lunch: {}, dinner: {} },
        7: { breakfast: {}, lunch: {}, dinner: {} },
      },
      shoppingList: []
    };
    setCourseData({
      ...courseData,
      weeks: [...courseData.weeks, newWeek]
    });
  };

  const updateWeek = (index: number, field: keyof WeekData, value: any) => {
    const newWeeks = [...courseData.weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setCourseData({ ...courseData, weeks: newWeeks });
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (!selectedMealInfo) return;
    
    const { weekIndex, day, mealType } = selectedMealInfo;
    const newWeeks = [...courseData.weeks];
    const week = newWeeks[weekIndex];
    
    if (!week.mealPlan[day]) {
      week.mealPlan[day] = { breakfast: {}, lunch: {}, dinner: {} };
    }
    
    week.mealPlan[day][mealType] = {
      recipeId: recipe.id,
      name: recipe.title
    };
    
    setCourseData({ ...courseData, weeks: newWeeks });
    setSelectedMealInfo(null);
  };

  const removeMeal = (weekIndex: number, day: number, mealType: string) => {
    const newWeeks = [...courseData.weeks];
    const week = newWeeks[weekIndex];
    
    if (week.mealPlan[day] && week.mealPlan[day][mealType as keyof typeof week.mealPlan[typeof day]]) {
      delete week.mealPlan[day][mealType as keyof typeof week.mealPlan[typeof day]];
    }
    
    setCourseData({ ...courseData, weeks: newWeeks });
  };

  const addMaterial = () => {
    setCourseData({
      ...courseData,
      materials: [...courseData.materials, {
        title: '',
        description: '',
        category: 'Grundläggande',
        readTime: '5 min',
        content: ''
      }]
    });
  };

  const addDownload = () => {
    setCourseData({
      ...courseData,
      downloads: [...courseData.downloads, {
        title: '',
        description: '',
        category: 'guide',
        fileUrl: '',
        fileSize: ''
      }]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft />
            Tillbaka
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skapa ny kurs</h1>
          <p className="text-gray-600 mt-2">Fyll i informationen steg för steg</p>
        </div>

        {/* Progress Steps - Improved layout */}
        <div className="mb-8">
          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center relative">
                  {/* Connecting line before circle (except first) */}
                  {index > 0 && (
                    <div className="absolute top-5 sm:top-6 -left-1/2 w-full">
                      <div
                        className={`h-1 transition-all ${
                          currentStep > step.number ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                  
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all mb-2 relative z-10 ${
                      currentStep >= step.number
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  {/* Step text under the circle */}
                  <div className={`text-center ${
                    currentStep >= step.number ? 'text-orange-600 font-medium' : 'text-gray-500'
                  }`}>
                    <div className="text-xs font-medium leading-tight">{step.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Grundläggande information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kursnamn *
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="T.ex. Functional Foods Masterclass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Beskriv vad deltagarna kommer lära sig..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivå
                  </label>
                  <div className="relative">
                    <select
                      value={courseData.level}
                      onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                    >
                      <option value="Beginner">Nybörjare</option>
                      <option value="Intermediate">Medel</option>
                      <option value="Advanced">Avancerad</option>
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
                    Längd
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={courseData.duration}
                      onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="T.ex. 6 veckor"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pris (SEK)
                </label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kursmål
                </label>
                <p className="text-sm text-gray-500 mb-3">Vad kommer deltagarna kunna efter kursen?</p>
                {courseData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                      placeholder="T.ex. Förstå grunderna i functional foods"
                    />
                    {courseData.objectives.length > 1 && (
                      <button
                        onClick={() => removeObjective(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addObjective}
                  className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Lägg till mål
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Kursstruktur</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Välkomstmeddelande
                </label>
                <textarea
                  value={courseData.welcomeMessage}
                  onChange={(e) => setCourseData({ ...courseData, welcomeMessage: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Skriv ett inspirerande välkomstmeddelande till kursdeltagarna..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introduktionsvideo URL (valfritt)
                </label>
                <input
                  type="url"
                  value={courseData.introVideoUrl}
                  onChange={(e) => setCourseData({ ...courseData, introVideoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="https://example.com/intro-video.mp4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Målgrupp
                </label>
                <textarea
                  value={courseData.targetAudience}
                  onChange={(e) => setCourseData({ ...courseData, targetAudience: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Beskriv vem kursen är för..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Omslagsbild URL
                </label>
                <input
                  type="url"
                  value={courseData.coverImage}
                  onChange={(e) => setCourseData({ ...courseData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="https://example.com/course-image.jpg"
                />
              </div>

              {courseData.coverImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Förhandsvisning:</p>
                  <img
                    src={courseData.coverImage}
                    alt="Course preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/400/200';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Veckoplanering</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Tips!</strong> Varje vecka bör innehålla målsättningar, kunskapsmaterial och en komplett kostplan med recept.
                </p>
              </div>

              {courseData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vecka {week.weekNumber}</h3>
                    {courseData.weeks.length > 1 && (
                      <button
                        onClick={() => {
                          setCourseData({
                            ...courseData,
                            weeks: courseData.weeks.filter((_, i) => i !== weekIndex)
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Veckotitel
                      </label>
                      <input
                        type="text"
                        value={week.title}
                        onChange={(e) => updateWeek(weekIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Vad fokuserar veckan på?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veckans mål
                    </label>
                    {week.goals.map((goal, goalIndex) => (
                      <div key={goalIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...week.goals];
                            newGoals[goalIndex] = e.target.value;
                            updateWeek(weekIndex, 'goals', newGoals);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="T.ex. Förstå grunderna i functional foods"
                        />
                        <button
                          onClick={() => {
                            const newGoals = week.goals.filter((_, i) => i !== goalIndex);
                            updateWeek(weekIndex, 'goals', newGoals);
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newGoals = [...week.goals, ''];
                        updateWeek(weekIndex, 'goals', newGoals);
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      + Lägg till mål
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Måltidsplanering</h4>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Dag {day + (weekIndex * 7)}</span>
                            <span className="text-xs text-gray-500">
                              {['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'][day - 1]}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {/* Frukost */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">Frukost</label>
                              {week.mealPlan[day]?.breakfast?.name ? (
                                <div className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                                  <span className="text-gray-700 truncate">{week.mealPlan[day].breakfast.name}</span>
                                  <button
                                    onClick={() => removeMeal(weekIndex, day, 'breakfast')}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedMealInfo({ weekIndex, day, mealType: 'breakfast' });
                                    setRecipeSelectorOpen(true);
                                  }}
                                  className="w-full p-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-orange-500 hover:text-orange-600"
                                >
                                  + Välj recept
                                </button>
                              )}
                            </div>

                            {/* Lunch */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">Lunch</label>
                              {week.mealPlan[day]?.lunch?.name ? (
                                <div className="flex items-center justify-between p-2 bg-background rounded text-sm">
                                  <span className="text-gray-700 truncate">{week.mealPlan[day].lunch.name}</span>
                                  <button
                                    onClick={() => removeMeal(weekIndex, day, 'lunch')}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedMealInfo({ weekIndex, day, mealType: 'lunch' });
                                    setRecipeSelectorOpen(true);
                                  }}
                                  className="w-full p-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-orange-500 hover:text-orange-600"
                                >
                                  + Välj recept
                                </button>
                              )}
                            </div>

                            {/* Middag */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">Middag</label>
                              {week.mealPlan[day]?.dinner?.name ? (
                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                  <span className="text-gray-700 truncate">{week.mealPlan[day].dinner.name}</span>
                                  <button
                                    onClick={() => removeMeal(weekIndex, day, 'dinner')}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedMealInfo({ weekIndex, day, mealType: 'dinner' });
                                    setRecipeSelectorOpen(true);
                                  }}
                                  className="w-full p-2 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-orange-500 hover:text-orange-600"
                                >
                                  + Välj recept
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      <strong>Tips:</strong> Mellanmål och efterrätter kan läggas till senare vid behov.
                    </p>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addWeek}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 font-medium"
              >
                + Lägg till vecka
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Kursmaterial</h2>
              
              {courseData.materials.map((material, materialIndex) => (
                <div key={materialIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Material {materialIndex + 1}</h3>
                  
                  <input
                    type="text"
                    value={material.title}
                    onChange={(e) => {
                      const newMaterials = [...courseData.materials];
                      newMaterials[materialIndex] = { ...newMaterials[materialIndex], title: e.target.value };
                      setCourseData({ ...courseData, materials: newMaterials });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
                    placeholder="Materialtitel"
                  />
                  
                  <textarea
                    value={material.description}
                    onChange={(e) => {
                      const newMaterials = [...courseData.materials];
                      newMaterials[materialIndex] = { ...newMaterials[materialIndex], description: e.target.value };
                      setCourseData({ ...courseData, materials: newMaterials });
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-3"
                    placeholder="Materialbeskrivning"
                  />
                  
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Kategori:</p>
                    <div className="relative">
                      <select
                        value={material.category}
                        onChange={(e) => {
                          const newMaterials = [...courseData.materials];
                          newMaterials[materialIndex] = { ...newMaterials[materialIndex], category: e.target.value };
                          setCourseData({ ...courseData, materials: newMaterials });
                        }}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                      >
                        <option value="Grundläggande">Grundläggande</option>
                        <option value="Förberedelse">Förberedelse</option>
                        <option value="Övningar">Övningar</option>
                        <option value="Lektioner">Lektioner</option>
                        <option value="Övrigt">Övrigt</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Läsningstid:</p>
                    <input
                      type="text"
                      value={material.readTime}
                      onChange={(e) => {
                        const newMaterials = [...courseData.materials];
                        newMaterials[materialIndex] = { ...newMaterials[materialIndex], readTime: e.target.value };
                        setCourseData({ ...courseData, materials: newMaterials });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="T.ex. 15 min"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Innehåll:</p>
                    <textarea
                      value={material.content}
                      onChange={(e) => {
                        const newMaterials = [...courseData.materials];
                        newMaterials[materialIndex] = { ...newMaterials[materialIndex], content: e.target.value };
                        setCourseData({ ...courseData, materials: newMaterials });
                      }}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Materialinnehåll"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addMaterial}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600"
              >
                + Lägg till material
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Nedladdningar</h2>
              
              {courseData.downloads.map((download, downloadIndex) => (
                <div key={downloadIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Nedladdning {downloadIndex + 1}</h3>
                  
                  <input
                    type="text"
                    value={download.title}
                    onChange={(e) => {
                      const newDownloads = [...courseData.downloads];
                      newDownloads[downloadIndex] = { ...newDownloads[downloadIndex], title: e.target.value };
                      setCourseData({ ...courseData, downloads: newDownloads });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
                    placeholder="Nedladdningstitel"
                  />
                  
                  <textarea
                    value={download.description}
                    onChange={(e) => {
                      const newDownloads = [...courseData.downloads];
                      newDownloads[downloadIndex] = { ...newDownloads[downloadIndex], description: e.target.value };
                      setCourseData({ ...courseData, downloads: newDownloads });
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-3"
                    placeholder="Nedladdningsbeskrivning"
                  />
                  
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Kategori:</p>
                    <div className="relative">
                      <select
                        value={download.category}
                        onChange={(e) => {
                          const newDownloads = [...courseData.downloads];
                          newDownloads[downloadIndex] = { ...newDownloads[downloadIndex], category: e.target.value };
                          setCourseData({ ...courseData, downloads: newDownloads });
                        }}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                      >
                        <option value="guide">Guide</option>
                        <option value="video">Video</option>
                        <option value="document">Dokument</option>
                        <option value="resource">Resurs</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Länk:</p>
                    <input
                      type="url"
                      value={download.fileUrl}
                      onChange={(e) => {
                        const newDownloads = [...courseData.downloads];
                        newDownloads[downloadIndex] = { ...newDownloads[downloadIndex], fileUrl: e.target.value };
                        setCourseData({ ...courseData, downloads: newDownloads });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com/download.pdf"
                    />
                  </div>

                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Filstorlek:</p>
                    <input
                      type="text"
                      value={download.fileSize}
                      onChange={(e) => {
                        const newDownloads = [...courseData.downloads];
                        newDownloads[downloadIndex] = { ...newDownloads[downloadIndex], fileSize: e.target.value };
                        setCourseData({ ...courseData, downloads: newDownloads });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="T.ex. 1.2 MB"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addDownload}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600"
              >
                + Lägg till nedladdning
              </button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Community</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktivera community (valfritt)
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={courseData.enableCommunity}
                    onChange={(e) => setCourseData({ ...courseData, enableCommunity: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aktivera en community för kursdeltagarna för att dela erfarenheter och frågor.
                  </span>
                </div>
              </div>

              {courseData.enableCommunity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community beskrivning
                  </label>
                  <textarea
                    value={courseData.communityDescription}
                    onChange={(e) => setCourseData({ ...courseData, communityDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 resize-none"
                    placeholder="Beskriv hur communityn fungerar och vad deltagarna kan förvänta sig."
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Granska och publicera</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-lg mb-4">{courseData.title || 'Ingen titel'}</h3>
                <p className="text-gray-600 mb-4">{courseData.description || 'Ingen beskrivning'}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nivå:</span> {courseData.level}
                  </div>
                  <div>
                    <span className="font-medium">Längd:</span> {courseData.duration}
                  </div>
                  <div>
                    <span className="font-medium">Pris:</span> {courseData.price} SEK
                  </div>
                                      <div className="sm:col-span-2">
                      <span className="font-medium">Antal veckor:</span> {courseData.weeks.length}
                    </div>
                </div>

                {courseData.objectives.filter(o => o).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Kursmål:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {courseData.objectives.filter(o => o).map((objective, index) => (
                        <li key={index} className="text-gray-600">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>OBS!</strong> Efter publicering kommer kursen vara synlig för alla användare.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons - Improved */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            onClick={handlePrevious}
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
              onClick={handleNext}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Nästa
              <ArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Skapar...
                </>
              ) : (
                <>
                  <Save />
                  Skapa kurs
                </>
              )}
            </button>
          )}
        </div>
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