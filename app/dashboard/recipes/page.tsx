"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FiSearch, FiFilter, FiHeart, FiClock, FiUsers, FiStar,
  FiChevronLeft, FiBookOpen, FiDownload, FiShare2, FiTag
} from "react-icons/fi";

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedRecipes, setSavedRecipes] = useState<number[]>([1, 3, 7]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "all", name: "Alla", count: 127 },
    { id: "frukost", name: "Frukost", count: 24 },
    { id: "lunch", name: "Lunch", count: 32 },
    { id: "middag", name: "Middag", count: 28 },
    { id: "mellanmal", name: "Mellanmål", count: 18 },
    { id: "drycker", name: "Drycker", count: 15 },
    { id: "desserter", name: "Desserter", count: 10 }
  ];

  const recipes = [
    {
      id: 1,
      title: "Gyllene mjölk med gurkmeja",
      category: "drycker",
      image: "/placeholder-recipe.jpg",
      prepTime: "5 min",
      servings: 2,
      difficulty: "Lätt",
      rating: 4.8,
      reviews: 24,
      tags: ["Anti-inflammatorisk", "Adaptogen", "Glutenfri"],
      description: "En värmande och helande dryck med gurkmeja, ingefära och kokosgrädde.",
      course: "Functional Flow"
    },
    {
      id: 2,
      title: "Quinoasallad med kimchi",
      category: "lunch",
      image: "/placeholder-recipe.jpg",
      prepTime: "20 min",
      servings: 4,
      difficulty: "Medel",
      rating: 4.6,
      reviews: 31,
      tags: ["Probiotisk", "Vegetarisk", "Proteinrik"],
      description: "Näringsrik sallad med fermenterade grönsaker för optimal tarmhälsa.",
      course: "Functional Basics"
    },
    {
      id: 3,
      title: "Adaptogent smoothie",
      category: "frukost",
      image: "/placeholder-recipe.jpg",
      prepTime: "5 min",
      servings: 1,
      difficulty: "Lätt",
      rating: 4.9,
      reviews: 18,
      tags: ["Adaptogen", "Superfood", "Vegansk"],
      description: "Kraftfull smoothie med ashwagandha och maca för stressbalans.",
      course: "Functional Flow"
    },
    {
      id: 4,
      title: "Fermenterad rotfruktsoppa",
      category: "middag",
      image: "/placeholder-recipe.jpg",
      prepTime: "45 min",
      servings: 6,
      difficulty: "Medel",
      rating: 4.7,
      reviews: 27,
      tags: ["Prebiotisk", "Uppvärmande", "Säsongsbetonad"],
      description: "Näringsrik soppa med fermenterade grönsaker och rotfrukter.",
      course: "Functional Basics"
    },
    {
      id: 5,
      title: "Omega-3 laxbowl",
      category: "middag",
      image: "/placeholder-recipe.jpg",
      prepTime: "25 min",
      servings: 2,
      difficulty: "Medel",
      rating: 4.5,
      reviews: 42,
      tags: ["Omega-3", "Anti-inflammatorisk", "Proteinrik"],
      description: "Balanserad bowl med wild-caught lax och anti-inflammatoriska ingredienser.",
      course: "Functional Flow"
    },
    {
      id: 6,
      title: "Matcha energibollar",
      category: "mellanmal",
      image: "/placeholder-recipe.jpg",
      prepTime: "15 min",
      servings: 12,
      difficulty: "Lätt",
      rating: 4.4,
      reviews: 35,
      tags: ["Superfood", "Rå", "Energigivande"],
      description: "Naturligt söta energibollar med matcha och mandlar.",
      course: "Functional Basics"
    }
  ];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "all" || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSaveRecipe = (recipeId: number) => {
    if (savedRecipes.includes(recipeId)) {
      setSavedRecipes(savedRecipes.filter(id => id !== recipeId));
    } else {
      setSavedRecipes([...savedRecipes, recipeId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Lätt": return "text-green-600 bg-green-100";
      case "Medel": return "text-orange-600 bg-orange-100";
      case "Svår": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Receptsamling</h1>
              <p className="text-sm text-gray-600">Upptäck funktionella recept från dina kurser</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök recept, ingredienser eller taggar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiFilter className="w-5 h-5 text-gray-600" />
              Filter
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Svårighetsgrad</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg">
                    <option>Alla nivåer</option>
                    <option>Lätt</option>
                    <option>Medel</option>
                    <option>Svår</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tillagningstid</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg">
                    <option>Alla tider</option>
                    <option>Under 15 min</option>
                    <option>15-30 min</option>
                    <option>30-60 min</option>
                    <option>Över 60 min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kurs</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg">
                    <option>Alla kurser</option>
                    <option>Functional Flow</option>
                    <option>Functional Basics</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Visar {filteredRecipes.length} av {recipes.length} recept
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Recipe Image */}
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <button
                  onClick={() => toggleSaveRecipe(recipe.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                >
                  <FiHeart 
                    className={`w-5 h-5 ${
                      savedRecipes.includes(recipe.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>
                
                {/* Course Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {recipe.course}
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

                {/* Recipe Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {recipe.servings} port
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    {recipe.rating}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {recipe.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{recipe.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-accent transition-colors">
                    Visa recept
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiDownload className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiShare2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <FiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inga recept hittades</h3>
            <p className="text-gray-600 mb-4">Prova att ändra dina sökkriterier eller filter</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Rensa filter
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredRecipes.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Ladda fler recept
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 