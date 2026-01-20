'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Target,
  Users,
  Coffee,
  Sun,
  Moon,
  Cookie,
  UtensilsCrossed,
  ShoppingCart,
  X
} from 'lucide-react';

interface CourseDraftData {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  duration: string;
  weeksCount: number;
  level: string;
  targetAudience: string;
  objectives: string[];
  features: string[];
  coverImage: string;
  introVideoUrl: string;
  welcomeMessage: string;
  enableCommunity: boolean;
  communityDescription: string;
  weeks: WeekData[];
  status: 'draft' | 'published';
}

interface WeekData {
  weekNumber: number;
  title: string;
  subtitle?: string;
  videoUrl?: string;
  welcomeMessage?: string;
  keyTakeaways: string[];
  days: DayData[];
}

interface DayData {
  dayName: string;
  meals: {
    breakfast?: { name: string; recipeLink?: string };
    lunch?: { name: string; recipeLink?: string };
    dinner?: { name: string; recipeLink?: string };
    snack?: { name: string; recipeLink?: string };
    dessert?: { name: string; recipeLink?: string };
  };
}

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
  dessert: UtensilsCrossed
};

const MEAL_LABELS = {
  breakfast: 'Frukost',
  lunch: 'Lunch',
  dinner: 'Middag',
  snack: 'Mellanmål',
  dessert: 'Dessert'
};

type PreviewMode = 'product' | 'dashboard' | 'week';

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [draft, setDraft] = useState<CourseDraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('product');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<string | null>('Måndag');

  useEffect(() => {
    fetchDraft();
  }, [courseId]);

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/course-builder/drafts/${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDraft(data);
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">Laddar förhandsvisning...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kunde inte ladda kursen</p>
          <Link href={`/admin/course-builder/${courseId}/step/5`} className="text-[var(--primary-green)] mt-2 inline-block">
            Tillbaka till redigeraren
          </Link>
        </div>
      </div>
    );
  }

  const currentWeek = draft.weeks?.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview header bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#1a1a2e] text-white z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/course-builder/${courseId}/step/5`}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Tillbaka till redigeraren</span>
            </Link>
            <div className="h-6 w-px bg-gray-600" />
            <div>
              <span className="text-sm text-gray-400">Förhandsvisning:</span>
              <span className="ml-2 font-medium">{draft.title}</span>
            </div>
          </div>

          {/* Preview mode selector */}
          <div className="flex items-center gap-2 bg-[#16213e] rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('product')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'product' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Produktsida
            </button>
            <button
              onClick={() => setPreviewMode('dashboard')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'dashboard' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPreviewMode('week')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'week' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Veckovy
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded ${
              draft.status === 'published' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {draft.status === 'published' ? 'Publicerad' : 'Utkast'}
            </span>
          </div>
        </div>
      </div>

      {/* Preview content */}
      <div className="pt-16">
        {/* Product Page Preview */}
        {previewMode === 'product' && (
          <div className="bg-[#f8f5f0] min-h-screen">
            {/* Hero section */}
            <div className="relative">
              {draft.coverImage ? (
                <div className="h-[50vh] relative">
                  <img 
                    src={draft.coverImage} 
                    alt={draft.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
              ) : (
                <div className="h-[50vh] bg-gradient-to-br from-[#014421] to-[#012a14] flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white/30" />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{draft.title}</h1>
                  <p className="text-xl text-white/80 max-w-2xl">{draft.description}</p>
                  
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{draft.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      <span>{draft.level === 'Beginner' ? 'Nybörjare' : draft.level === 'Intermediate' ? 'Medel' : 'Avancerad'}</span>
                    </div>
                    {draft.enableCommunity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>Community ingår</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="md:col-span-2 space-y-8">
                  {/* Video */}
                  {draft.introVideoUrl && (
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                      <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <button className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Objectives */}
                  {draft.objectives?.filter(o => o.trim()).length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h2 className="text-2xl font-bold text-[#014421] mb-6">Vad du kommer lära dig</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {draft.objectives.filter(o => o.trim()).map((objective, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#014421]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 text-[#014421]" />
                            </div>
                            <span className="text-gray-700">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {draft.features?.filter(f => f.trim()).length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h2 className="text-2xl font-bold text-[#014421] mb-6">Vad som ingår</h2>
                      <ul className="space-y-3">
                        {draft.features.filter(f => f.trim()).map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Week structure preview */}
                  {draft.weeks?.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h2 className="text-2xl font-bold text-[#014421] mb-6">Kursinnehåll</h2>
                      <div className="space-y-3">
                        {draft.weeks.map((week) => (
                          <div key={week.weekNumber} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#014421]/10 rounded-full flex items-center justify-center">
                                <span className="font-bold text-[#014421]">{week.weekNumber}</span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{week.title}</h3>
                                {week.subtitle && (
                                  <p className="text-sm text-gray-500">{week.subtitle}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar - Purchase card */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-20">
                    <div className="text-center mb-6">
                      {draft.salePrice ? (
                        <>
                          <div className="text-4xl font-bold text-[#014421]">{draft.salePrice} kr</div>
                          <div className="text-lg text-gray-400 line-through">{draft.price} kr</div>
                        </>
                      ) : (
                        <div className="text-4xl font-bold text-[#014421]">
                          {draft.price === 0 ? 'Gratis' : `${draft.price} kr`}
                        </div>
                      )}
                    </div>

                    <button className="w-full py-4 bg-[#014421] text-white rounded-xl font-semibold text-lg hover:bg-[#012a14] transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {draft.price === 0 ? 'Börja nu - Gratis' : 'Köp kursen'}
                    </button>

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{draft.weeksCount} veckors program</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Kompletta kostscheman</span>
                      </div>
                      {draft.enableCommunity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Tillgång till community</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Preview */}
        {previewMode === 'dashboard' && (
          <div className="bg-[#f8f5f0] min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
              {/* Welcome section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h1 className="text-3xl font-bold text-[#014421] mb-2">
                  Välkommen till {draft.title}
                </h1>
                {draft.welcomeMessage && (
                  <p className="text-gray-600 whitespace-pre-wrap">{draft.welcomeMessage}</p>
                )}
              </div>

              {/* Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Din progress</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#014421] rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-sm text-gray-500">0% klart</span>
                </div>
              </div>

              {/* Weeks grid */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Veckor</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {draft.weeks?.map((week) => {
                  const mealCount = week.days.reduce((sum, day) => sum + Object.keys(day.meals).length, 0);
                  return (
                    <button
                      key={week.weekNumber}
                      onClick={() => {
                        setSelectedWeek(week.weekNumber);
                        setPreviewMode('week');
                      }}
                      className="bg-white rounded-xl p-6 shadow-lg text-left hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#014421]/10 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-[#014421]">{week.weekNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{week.title}</h3>
                          {week.subtitle && (
                            <p className="text-sm text-gray-500">{week.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>{mealCount} måltider</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Week View Preview */}
        {previewMode === 'week' && currentWeek && (
          <div className="bg-[#f8f5f0] min-h-screen">
            {/* Week header */}
            <div className="bg-[#014421] text-white py-12">
              <div className="max-w-6xl mx-auto px-6">
                <button
                  onClick={() => setPreviewMode('dashboard')}
                  className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka till översikt
                </button>
                <h1 className="text-4xl font-bold">{currentWeek.title}</h1>
                {currentWeek.subtitle && (
                  <p className="text-xl text-white/70 mt-2">{currentWeek.subtitle}</p>
                )}
              </div>
            </div>

            {/* Week selector */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex gap-2 py-3 overflow-x-auto">
                  {draft.weeks?.map((week) => (
                    <button
                      key={week.weekNumber}
                      onClick={() => setSelectedWeek(week.weekNumber)}
                      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        selectedWeek === week.weekNumber
                          ? 'bg-[#014421] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Vecka {week.weekNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="space-y-4">
                {currentWeek.days.map((day) => (
                  <div key={day.dayName} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Day header */}
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.dayName ? null : day.dayName)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#014421]/10 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#014421]" />
                        </div>
                        <span className="font-semibold text-gray-900">{day.dayName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {Object.keys(day.meals).length} måltider
                        </span>
                        {expandedDay === day.dayName ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Day meals */}
                    {expandedDay === day.dayName && (
                      <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(day.meals).map(([mealType, meal]) => {
                          if (!meal) return null;
                          const Icon = MEAL_ICONS[mealType as keyof typeof MEAL_ICONS] || UtensilsCrossed;
                          const label = MEAL_LABELS[mealType as keyof typeof MEAL_LABELS] || mealType;
                          
                          return (
                            <div key={mealType} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-[#014421]" />
                                <span className="text-sm font-medium text-gray-500">{label}</span>
                              </div>
                              <p className="font-medium text-gray-900">{meal.name}</p>
                              {meal.recipeLink && (
                                <p className="text-xs text-[#014421] mt-1">Recept tillgängligt →</p>
                              )}
                            </div>
                          );
                        })}
                        
                        {Object.keys(day.meals).length === 0 && (
                          <div className="col-span-full text-center py-8 text-gray-400">
                            Inga måltider inlagda för denna dag
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
