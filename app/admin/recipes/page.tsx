'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiStar, FiClock, FiX, FiImage, FiZap, FiCheck, FiLoader, FiBookOpen, FiList } from 'react-icons/fi';

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
  { id: 1, title: 'Grön super-smoothie', category: 'Frukost', difficulty: 'Lätt', prepTime: '5 min', status: 'Publicerad', image: '/smoothie.jpg'},
  { id: 2, title: 'Anti-inflammatorisk laxsallad', category: 'Lunch', difficulty: 'Medel', prepTime: '20 min', status: 'Publicerad', image: '/salmon_salad.jpg'},
  { id: 3, title: 'Chiapudding med bär', category: 'Mellanmål', difficulty: 'Lätt', prepTime: '10 min + kyltid', status: 'Utkast', image: '/chia_pudding.jpg'},
  { id: 4, title: 'Värmande linssoppa', category: 'Middag', difficulty: 'Medel', prepTime: '45 min', status: 'Publicerad', image: '/lentil_soup.jpg'},
];

const RecipeGeneratorModal = ({ onClose, onPublish }: { onClose: () => void, onPublish: (recipe: any) => void }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[90vh]">
              <div className="sticky top-0 bg-white border-b border-primary/10 p-6 flex justify-between items-center z-10">
                  <div>
                      <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">RECEPTGENERATOR</h2>
                      <p className="text-text-secondary">Skapa ett nytt recept med hjälp av AI eller fyll i manuellt.</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 group">
                      <FiX className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </button>
              </div>

              <div className="px-6 pt-4 border-b border-primary/10 bg-background/70">
                <div className="flex gap-1">
                  {[
                    { id: 'basic', label: 'Grundläggande', icon: FiBookOpen },
                    { id: 'ingredients', label: 'Ingredienser', icon: FiList },
                    { id: 'instructions', label: 'Instruktioner', icon: FiCheck },
                    { id: 'nutrition', label: 'Näring & Info', icon: FiZap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-semibold transition-all duration-200 text-sm uppercase tracking-wider ${
                        activeTab === tab.id 
                          ? 'bg-white text-primary' 
                          : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
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
                         <div className="aspect-video bg-background rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                            <Image src={recipe.image} alt="Receptbild" width={200} height={120} className="object-cover rounded-lg"/>
                         </div>
                         <button className="text-sm text-primary hover:text-secondary font-semibold mt-2 uppercase tracking-wider">Ladda upp ny bild</button>
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

              <div className="p-6 border-t border-primary/10 bg-background rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-primary/20 text-primary font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-50 uppercase text-sm tracking-wider group">
                          {isGenerating ? <><FiLoader className="animate-spin w-4 h-4"/> Genererar...</> : <><FiZap className="w-4 h-4 group-hover:scale-110 transition-transform"/> Autogenerera</>}
                      </button>
                      <button onClick={handlePublish} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 uppercase text-sm tracking-wider group">
                          <FiCheck className="w-4 h-4 group-hover:scale-110 transition-transform"/> Publicera recept
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};


export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [showModal, setShowModal] = useState(false);

  const handlePublishRecipe = (newRecipe: any) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setShowModal(false);
    alert(`Receptet "${newRecipe.title}" har publicerats! Detta kommer nu att synas på den publika receptsidan (dummy).`);
  };

  return (
    <>
      {showModal && <RecipeGeneratorModal onClose={() => setShowModal(false)} onPublish={handlePublishRecipe} />}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">RECEPT</h1>
            <p className="text-lg text-text-secondary mt-1">Lägg till och hantera alla recept.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 mt-4 sm:mt-0 uppercase text-sm tracking-wider group">
            <FiPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Lägg till recept</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input type="text" placeholder="Sök recept..." className="w-full sm:w-80 pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-primary/10">
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Recept</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Kategori</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden lg:table-cell">Svårighetsgrad</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(recipe => (
                  <tr key={recipe.id} className="border-b border-primary/5 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Image src={recipe.image} alt={recipe.title} width={64} height={64} className="w-16 h-16 object-cover rounded-lg hidden sm:block" />
                        <div>
                          <p className="font-semibold text-primary">{recipe.title}</p>
                          <p className="flex items-center gap-1 text-sm text-text-secondary"><FiClock className="w-4 h-4" /> {recipe.prepTime}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary hidden md:table-cell">{recipe.category}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => ( <FiStar key={i} className={`w-4 h-4 ${recipe.difficulty === 'Lätt' && i < 1 ? 'text-warning fill-current' : recipe.difficulty === 'Medel' && i < 2 ? 'text-warning fill-current' : recipe.difficulty === 'Svår' && i < 3 ? 'text-warning fill-current' : 'text-gray-300'}`} />))}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${ recipe.status === 'Publicerad' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning' }`}>{recipe.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"><FiEdit className="w-4 h-4" /></button>
                        <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200"><FiTrash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 