'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiStar, FiClock, FiX, FiImage, FiZap, FiCheck, FiLoader, FiBookOpen, FiList, FiFilter, FiGrid, FiMenu, FiEye, FiHeart, FiTrendingUp, FiAward, FiUsers, FiBarChart2, FiChevronRight, FiUpload, FiRefreshCw, FiSave, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

interface Recipe {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: Nutrition;
  tips: string;
  tags: string[];
  image: string;
}

const initialRecipes = [
  { id: 1, title: 'Grön super-smoothie', category: 'Frukost', difficulty: 'Lätt', prepTime: '5 min', status: 'Publicerad', image: '/smoothie.jpg', views: 1234, likes: 89, rating: 4.8},
  { id: 2, title: 'Anti-inflammatorisk laxsallad', category: 'Lunch', difficulty: 'Medel', prepTime: '20 min', status: 'Publicerad', image: '/salmon_salad.jpg', views: 987, likes: 67, rating: 4.9},
  { id: 3, title: 'Chiapudding med bär', category: 'Mellanmål', difficulty: 'Lätt', prepTime: '10 min + kyltid', status: 'Utkast', image: '/chia_pudding.jpg', views: 456, likes: 34, rating: 4.5},
  { id: 4, title: 'Värmande linssoppa', category: 'Middag', difficulty: 'Medel', prepTime: '45 min', status: 'Publicerad', image: '/lentil_soup.jpg', views: 789, likes: 56, rating: 4.7},
];

const RecipeGeneratorModal = ({ onClose, onPublish }: { onClose: () => void, onPublish: (recipe: any) => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [recipe, setRecipe] = useState<Recipe>({
      title: '',
      description: '',
      category: 'Middag',
      difficulty: 'Medel',
      prepTime: '',
      cookTime: '',
      servings: 4,
      ingredients: [],
      instructions: [],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: ''
      },
      tips: '',
      tags: [],
      image: '/recipe_placeholder.png'
  });

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (recipe.title || recipe.description) {
        setAutoSaveStatus('saving');
        setTimeout(() => setAutoSaveStatus('saved'), 1000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [recipe]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 1500));
    setRecipe({
        title: 'AI-genererad Lax & Fetaost',
        description: 'En näringsrik och smakrik rätt med omega-3, antioxidanter och fibrer. Perfekt för en balanserad middag!',
        category: 'Middag',
        difficulty: 'Medel',
        prepTime: '10 min',
        cookTime: '20 min',
        servings: 4,
        ingredients: [
          { name: "laxfilé", amount: "600", unit: "g" },
          { name: "fetaost", amount: "100", unit: "g" },
          { name: "pumpafrön", amount: "3", unit: "msk" },
          { name: "sötpotatis", amount: "1", unit: "st" },
        ],
        instructions: [
          "Sätt ugnen på 200 grader.",
          "Lägg laxfilén på en ugnsplåt med bakplåtspapper.",
          "Smula över osten och strö på pumpafrön.",
          "Skala och skär sötpotatis i mindre bitar och lägg runt laxen.",
          "Gratinera i 20 minuter.",
        ],
        nutrition: {
          calories: '137',
          protein: '9',
          carbs: '7',
          fat: '8',
          fiber: '2'
        },
        tips: 'Servera med en fräsch sallad för en komplett måltid.',
        tags: ['Lax', 'Omega-3', 'Glutenfri'],
        image: '/lax_feta.jpg'
    });
    setIsGenerating(false);
  };
  
  const handlePublish = () => {
    const newRecipe = {
        ...recipe,
        id: Date.now(),
        status: 'Publicerad'
    };
    onPublish(newRecipe);
  };

  return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[90vh] overflow-hidden"
          >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-primary/10 p-6 flex justify-between items-center z-10">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
                          <FiZap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider">RECEPTGENERATOR</h2>
                          <p className="text-text-secondary flex items-center gap-2">
                              Skapa magiska recept med AI-kraft
                              {autoSaveStatus === 'saving' && <span className="text-xs text-primary flex items-center gap-1"><FiLoader className="animate-spin w-3 h-3" /> Sparar...</span>}
                              {autoSaveStatus === 'saved' && <span className="text-xs text-success flex items-center gap-1"><FiCheck className="w-3 h-3" /> Sparat</span>}
                          </p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                          onClick={() => setShowPreview(!showPreview)} 
                          className="p-3 hover:bg-primary/10 rounded-xl transition-all duration-200 group"
                      >
                          <FiEye className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      </button>
                      <button onClick={onClose} className="p-3 hover:bg-primary/10 rounded-xl transition-all duration-200 group">
                          <FiX className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      </button>
                  </div>
              </div>

              <div className="px-6 pt-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'basic', label: 'Grundläggande', icon: FiBookOpen, color: 'from-blue-500 to-blue-600' },
                    { id: 'ingredients', label: 'Ingredienser', icon: FiList, color: 'from-green-500 to-green-600' },
                    { id: 'instructions', label: 'Instruktioner', icon: FiCheck, color: 'from-purple-500 to-purple-600' },
                    { id: 'nutrition', label: 'Näring & Info', icon: FiZap, color: 'from-orange-500 to-orange-600' }
                  ].map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm uppercase tracking-wider whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'bg-white text-primary shadow-lg scale-105' 
                          : 'text-primary/60 hover:text-primary hover:bg-white/50'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-10`}
                        />
                      )}
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-grow bg-white">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Titel</label>
                        <input type="text" value={recipe.title} onChange={e => setRecipe({...recipe, title: e.target.value})} placeholder="Namn på recept" className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Beskrivning</label>
                        <textarea value={recipe.description} onChange={e => setRecipe({...recipe, description: e.target.value})} placeholder="En kort, lockande beskrivning" className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200" rows={3}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Bild</label>
                        <div className="relative group">
                          <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                            {recipe.image ? (
                              <Image src={recipe.image} alt="Receptbild" fill className="object-cover"/>
                            ) : (
                              <div className="text-center p-8">
                                <FiImage className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                                <p className="text-sm text-primary/60">Dra och släpp en bild här</p>
                                <p className="text-xs text-primary/40 mt-1">eller klicka för att välja</p>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                            <button className="bg-white text-primary px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <FiUpload className="inline-block w-4 h-4 mr-2" />
                              Byt bild
                            </button>
                          </div>
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-2">
                            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p className="text-xs text-primary mt-1">{uploadProgress}% uppladdad</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Taggar</label>
                        <input 
                          type="text" 
                          value={recipe.tags.join(', ')} 
                          onChange={e => setRecipe({...recipe, tags: e.target.value.split(',').map(t => t.trim())})} 
                          placeholder="Proteinrik, Lågkolhydrat..." 
                          className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                         <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2 mt-4">Kategori</label>
                         <select value={recipe.category} onChange={e => setRecipe({...recipe, category: e.target.value})} className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none">
                            <option>Frukost</option>
                            <option>Lunch</option>
                            <option>Middag</option>
                            <option>Mellanmål</option>
                            <option>Efterrätt</option>
                         </select>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'ingredients' && (
                  <div className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-10 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Mängd"
                          value={ingredient.amount}
                          onChange={e => {
                            const newIngredients = [...recipe.ingredients];
                            newIngredients[index] = { ...ingredient, amount: e.target.value };
                            setRecipe({...recipe, ingredients: newIngredients});
                          }}
                          className="col-span-2 px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="text"
                          placeholder="Enhet"
                          value={ingredient.unit}
                          onChange={e => {
                            const newIngredients = [...recipe.ingredients];
                            newIngredients[index] = { ...ingredient, unit: e.target.value };
                            setRecipe({...recipe, ingredients: newIngredients});
                          }}
                          className="col-span-3 px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <input
                          type="text"
                          placeholder="Ingrediens"
                          value={ingredient.name}
                          onChange={e => {
                            const newIngredients = [...recipe.ingredients];
                            newIngredients[index] = { ...ingredient, name: e.target.value };
                            setRecipe({...recipe, ingredients: newIngredients});
                          }}
                          className="col-span-4 px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
                            setRecipe({...recipe, ingredients: newIngredients});
                          }}
                          className="col-span-1 text-red-500 hover:bg-red-100 p-2 rounded-xl transition-colors flex items-center justify-center"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRecipe({...recipe, ingredients: [...recipe.ingredients, { name: '', amount: '', unit: '' }]})}
                      className="w-full mt-2 px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-semibold text-sm uppercase tracking-wider"
                    >
                      + Lägg till ingrediens
                    </button>
                  </div>
                )}
                {activeTab === 'instructions' && (
                  <div className="space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                       <div key={index} className="flex items-center gap-2">
                         <span className="font-bold text-primary">{index + 1}.</span>
                         <textarea
                           placeholder={`Steg ${index + 1}`}
                           value={instruction}
                           onChange={e => {
                             const newInstructions = [...recipe.instructions];
                             newInstructions[index] = e.target.value;
                             setRecipe({...recipe, instructions: newInstructions});
                           }}
                           className="w-full px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                           rows={2}
                         />
                         <button
                           type="button"
                           onClick={() => {
                             const newInstructions = recipe.instructions.filter((_, i) => i !== index);
                             setRecipe({...recipe, instructions: newInstructions});
                           }}
                           className="text-red-500 hover:bg-red-100 p-2 rounded-xl transition-colors"
                         >
                           <FiTrash2 />
                         </button>
                       </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRecipe({...recipe, instructions: [...recipe.instructions, '']})}
                      className="w-full mt-2 px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-semibold text-sm uppercase tracking-wider"
                    >
                      + Lägg till steg
                    </button>
                  </div>
                )}
                {activeTab === 'nutrition' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Svårighetsgrad</label>
                        <select value={recipe.difficulty} onChange={e => setRecipe({...recipe, difficulty: e.target.value})} className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none">
                            <option>Lätt</option>
                            <option>Medel</option>
                            <option>Svår</option>
                        </select>
                      </div>
                       <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Förberedelsetid</label>
                        <input type="text" value={recipe.prepTime} onChange={e => setRecipe({...recipe, prepTime: e.target.value})} placeholder="t.ex. 15 min" className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"/>
                      </div>
                       <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Tillagningstid</label>
                        <input type="text" value={recipe.cookTime} onChange={e => setRecipe({...recipe, cookTime: e.target.value})} placeholder="t.ex. 30 min" className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Näringsvärden (per portion)</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.keys(recipe.nutrition).map(key => (
                          <div key={key}>
                            <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-1">{key}</label>
                            <input
                              type="text"
                              value={recipe.nutrition[key as keyof Nutrition]}
                              onChange={e => setRecipe({ ...recipe, nutrition: { ...recipe.nutrition, [key]: e.target.value }})}
                              className="w-full px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                              placeholder={key === 'calories' ? 'kcal' : 'g'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Tips från kocken</label>
                        <textarea 
                          value={recipe.tips} 
                          onChange={e => setRecipe({...recipe, tips: e.target.value})} 
                          placeholder="Extra tips för att lyckas med receptet..." 
                          className="w-full px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200" 
                          rows={3}
                        />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-b-3xl">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                          <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleGenerate} 
                              disabled={isGenerating} 
                              className="flex items-center justify-center gap-2 bg-white border-2 border-primary/20 text-primary font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary/30 disabled:opacity-50 uppercase text-sm tracking-wider group shadow-sm"
                          >
                              {isGenerating ? (
                                  <>
                                      <FiLoader className="animate-spin w-4 h-4"/> 
                                      <span>Genererar magiskt recept...</span>
                                  </>
                              ) : (
                                  <>
                                      <FiZap className="w-4 h-4 group-hover:scale-110 transition-transform"/> 
                                      <span>AI-Generera</span>
                                  </>
                              )}
                          </motion.button>
                          
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-3 bg-white border-2 border-primary/20 text-primary rounded-xl hover:bg-primary/10 transition-all duration-200"
                              title="Förhandsgranska"
                          >
                              <FiEye className="w-4 h-4" />
                          </motion.button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                          <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 text-primary font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:bg-primary/10 uppercase text-sm tracking-wider"
                          >
                              <FiSave className="w-4 h-4" />
                              <span>Spara utkast</span>
                          </motion.button>
                          
                          <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handlePublish} 
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 uppercase text-sm tracking-wider shadow-lg group"
                          >
                              <FiCheck className="w-4 h-4 group-hover:rotate-12 transition-transform"/> 
                              <span>Publicera recept</span>
                          </motion.button>
                      </div>
                  </div>
              </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
};


export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePublishRecipe = (newRecipe: any) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setShowModal(false);
    alert(`Receptet "${newRecipe.title}" har publicerats! Detta kommer nu att synas på den publika receptsidan (dummy).`);
  };

  const categories = ['all', 'Frukost', 'Lunch', 'Middag', 'Mellanmål', 'Efterrätt'];
  
  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: recipes.length,
    published: recipes.filter(r => r.status === 'Publicerad').length,
    drafts: recipes.filter(r => r.status === 'Utkast').length,
    views: recipes.reduce((sum, r) => sum + (r.views || 0), 0)
  };

  return (
    <>
      {showModal && <RecipeGeneratorModal onClose={() => setShowModal(false)} onPublish={handlePublishRecipe} />}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase tracking-wider">RECEPT</h1>
            <p className="text-lg text-text-secondary mt-1">Skapa och hantera dina näringsrika recept</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 mt-4 sm:mt-0 uppercase text-sm tracking-wider shadow-lg group"
          >
            <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Skapa nytt recept</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Totalt antal', value: stats.total, icon: FiBookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Publicerade', value: stats.published, icon: FiCheck, color: 'from-green-500 to-green-600' },
            { label: 'Utkast', value: stats.drafts, icon: FiEdit, color: 'from-orange-500 to-orange-600' },
            { label: 'Totala visningar', value: stats.views, icon: FiEye, color: 'from-purple-500 to-purple-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-primary/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : 'bg-background text-primary hover:bg-primary/10'
                  }`}
                >
                  {category === 'all' ? 'Alla' : category}
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input 
                  type="text" 
                  placeholder="Sök recept..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200" 
                />
              </div>
              
              <div className="flex items-center gap-1 bg-background rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-md text-primary' : 'text-primary/60 hover:text-primary'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-md text-primary' : 'text-primary/60 hover:text-primary'
                  }`}
                >
                  <FiMenu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Grid/List View */}
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBookOpen className="w-12 h-12 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Inga recept hittades</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery 
                  ? `Inga recept matchar sökningen "${searchQuery}"`
                  : selectedCategory !== 'all'
                  ? `Inga recept i kategorin ${selectedCategory}`
                  : 'Börja med att skapa ditt första recept!'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-primary font-semibold hover:text-secondary transition-colors"
              >
                Rensa filter
              </motion.button>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-primary/10 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={recipe.image} 
                    alt={recipe.title} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      recipe.status === 'Publicerad' 
                        ? 'bg-success text-white' 
                        : 'bg-warning text-white'
                    }`}>
                      {recipe.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {recipe.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiHeart className="w-4 h-4" />
                        {recipe.likes}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(recipe.rating) 
                              ? 'text-warning fill-current' 
                              : 'text-white/50'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary/60 uppercase tracking-wider">
                      {recipe.category}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-text-secondary">
                      <FiClock className="w-4 h-4" />
                      {recipe.prepTime}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-4 h-4 ${
                            recipe.difficulty === 'Lätt' && i < 1 
                              ? 'text-success fill-current' 
                              : recipe.difficulty === 'Medel' && i < 2 
                              ? 'text-warning fill-current' 
                              : recipe.difficulty === 'Svår' && i < 3 
                              ? 'text-error fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm text-text-secondary ml-1">{recipe.difficulty}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Recept</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Kategori</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden lg:table-cell">Svårighetsgrad</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden xl:table-cell">Statistik</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe, index) => (
                    <motion.tr 
                      key={recipe.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-primary/5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden hidden sm:block">
                            <Image 
                              src={recipe.image} 
                              alt={recipe.title} 
                              fill
                              className="object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-primary">{recipe.title}</p>
                            <p className="flex items-center gap-1 text-sm text-text-secondary">
                              <FiClock className="w-4 h-4" /> 
                              {recipe.prepTime}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary hidden md:table-cell">{recipe.category}</td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`w-4 h-4 ${
                                recipe.difficulty === 'Lätt' && i < 1 
                                  ? 'text-success fill-current' 
                                  : recipe.difficulty === 'Medel' && i < 2 
                                  ? 'text-warning fill-current' 
                                  : recipe.difficulty === 'Svår' && i < 3 
                                  ? 'text-error fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-sm text-text-secondary ml-1">{recipe.difficulty}</span>
                        </span>
                      </td>
                      <td className="p-4 hidden xl:table-cell">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-text-secondary">
                            <FiEye className="w-4 h-4" />
                            {recipe.views}
                          </span>
                          <span className="flex items-center gap-1 text-text-secondary">
                            <FiHeart className="w-4 h-4" />
                            {recipe.likes}
                          </span>
                          <span className="flex items-center gap-1 text-text-secondary">
                            <FiStar className="w-4 h-4 text-warning fill-current" />
                            {recipe.rating}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          recipe.status === 'Publicerad' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {recipe.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                          >
                            <FiEdit className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 