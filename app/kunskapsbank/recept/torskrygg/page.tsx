"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Clock, Users, ChefHat, Heart, Zap, CheckCircle, Star, Share2, Bookmark, Timer, ChevronDown, ChevronUp } from 'lucide-react';

export default function TorskryggRecipe() {
  const [servings, setServings] = useState(2);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['ingredients', 'instructions']);
  const [cookingTimer, setCookingTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const baseIngredients = [
    { name: "torskrygg", amount: 300, unit: "g" },
    { name: "salt och svartpeppar", amount: 1, unit: "st" },
    { name: "kokta ägg", amount: 2, unit: "st" },
    { name: "majonäs", amount: 1, unit: "msk" },
    { name: "grön sparris", amount: 250, unit: "g" },
    { name: "granatäppelkärnor", amount: 1, unit: "dl" }
  ];

  const decorationIngredients = [
    { name: "kokt ägg", amount: 1, unit: "st" },
    { name: "färska dillkvistar", amount: 2, unit: "st" }
  ];

  const steps = [
    "Sätt ugnen på 175 grader.",
    "Dela torskryggen i två bitar.",
    "Strö på salt och svartpeppar.",
    "Lägg i en ugnsform och ugnsbaka i 15 minuter.",
    "Skala och finhacka äggen och lägg i en skål tillsammans med majonnäs.",
    "Strö på salt och peppar.",
    "Koka sparris i lättsaltat vatten i 2 minuter.",
    "Häll av vattnet och lägg sparris på tallrikar.",
    "Lägg på torsk och ägghack.",
    "Strö över granatäpplekärnor.",
    "Skär äggen i klyftor och lägg vid sidan om.",
    "Dekorera med dillkvistar."
  ];

  const nutritionPer100g = {
    calories: 190,
    carbs: 6,
    fat: 8.5,
    protein: 21.5,
    fiber: 0
  };

  const scaledIngredients = baseIngredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round((ingredient.amount * servings) / 2 * 10) / 10
  }));

  const scaledDecorationIngredients = decorationIngredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round((ingredient.amount * servings) / 2 * 10) / 10
  }));

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const startTimer = (minutes: number) => {
    setCookingTimer(minutes * 60);
    setIsTimerRunning(true);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src="/torskrygg.jpg"
          alt="Torskrygg med ägghack och sparris"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-8 left-8">
          <Link href="/kunskapsbank/recept" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka till recept</span>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="absolute top-8 right-8 flex gap-3">
          <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container-custom">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                  HUVUDRÄTT
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-white/80 ml-2 text-sm">(4.9)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 uppercase">
                TORSKRYGG MED ÄGGHACK OCH SPARRIS
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                Proteinrik fisk, antioxidantrika granatäpplekärnor och fibrer från sparris. En balanserad och hälsosam måltid!
              </p>
              <div className="flex items-center gap-6 text-white/80">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  20 min
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {servings} portioner
                </span>
                <span className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Lätt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{nutritionPer100g.calories * servings}</p>
              <p className="text-sm text-text-secondary">Kalorier totalt</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{nutritionPer100g.protein * servings}g</p>
              <p className="text-sm text-text-secondary">Protein</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">20</p>
              <p className="text-sm text-text-secondary">Minuter</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-text-secondary">Steg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary uppercase">Ingredienser</h2>
                  <button 
                    onClick={() => toggleSection('ingredients')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedSections.includes('ingredients') ? 
                      <ChevronUp className="w-5 h-5" /> : 
                      <ChevronDown className="w-5 h-5" />
                    }
                  </button>
                </div>

                {/* Portion Selector */}
                <div className="mb-6 p-4 bg-background rounded-xl">
                  <p className="text-sm font-medium text-primary mb-3">Antal portioner:</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-10 h-10 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-primary w-8 text-center">{servings}</span>
                    <button 
                      onClick={() => setServings(servings + 1)}
                      className="w-10 h-10 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {expandedSections.includes('ingredients') && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="font-bold text-primary mb-3 uppercase">Huvudingredienser</h3>
                      <div className="space-y-3">
                        {scaledIngredients.map((ingredient, index) => (
                          <div 
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
                              checkedIngredients.includes(index) ? 'bg-green-50 line-through text-gray-500' : ''
                            }`}
                            onClick={() => toggleIngredient(index)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              checkedIngredients.includes(index) 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-accent'
                            }`}>
                              {checkedIngredients.includes(index) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="flex-1">
                              <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-primary mb-3 uppercase">Dekoration</h3>
                      <div className="space-y-3">
                        {scaledDecorationIngredients.map((ingredient, index) => (
                          <div 
                            key={`decoration-${index}`}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
                              checkedIngredients.includes(index + 10) ? 'bg-green-50 line-through text-gray-500' : ''
                            }`}
                            onClick={() => toggleIngredient(index + 10)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              checkedIngredients.includes(index + 10) 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-accent'
                            }`}>
                              {checkedIngredients.includes(index + 10) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="flex-1">
                              <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nutrition Facts */}
                <div className="mt-8 p-4 bg-accent/5 rounded-xl">
                  <h3 className="font-bold text-primary mb-3 uppercase">Näringsvärden (per portion)</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Kalorier:</span>
                      <span className="font-medium">{Math.round(nutritionPer100g.calories * servings / servings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium">{Math.round(nutritionPer100g.protein * servings / servings)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kolhydrater:</span>
                      <span className="font-medium">{Math.round(nutritionPer100g.carbs * servings / servings)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fett:</span>
                      <span className="font-medium">{Math.round(nutritionPer100g.fat * servings / servings)}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary uppercase">Instruktioner</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => startTimer(15)}
                      className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      <Timer className="w-4 h-4" />
                      Timer (15 min)
                    </button>
                    <button 
                      onClick={() => toggleSection('instructions')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedSections.includes('instructions') ? 
                        <ChevronUp className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>

                {expandedSections.includes('instructions') && (
                  <div className="space-y-4 animate-fade-in">
                    {steps.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex gap-4 p-4 rounded-xl transition-all cursor-pointer hover:bg-gray-50 ${
                          checkedSteps.includes(index) ? 'bg-green-50' : ''
                        }`}
                        onClick={() => toggleStep(index)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          checkedSteps.includes(index) 
                            ? 'bg-green-500 text-white' 
                            : 'bg-accent text-white'
                        }`}>
                          {checkedSteps.includes(index) ? 
                            <CheckCircle className="w-4 h-4" /> : 
                            index + 1
                          }
                        </div>
                        <p className={`flex-1 ${checkedSteps.includes(index) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips Section */}
                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <h3 className="font-bold text-primary mb-3 uppercase flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Tips från kocken
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Välj färsk torsk för bästa smak - köttet ska vara fast och vitt</li>
                    <li>• Koka inte sparrisen för länge, den ska behålla sin knapriga konsistens</li>
                    <li>• Granatäppelkärnorna ger en frisk syrlighet som balanserar rätten perfekt</li>
                    <li>• Servera direkt medan fisken är varm för bästa upplevelse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 