'use client';

import { motion } from 'framer-motion';
import { FiStar, FiDownload, FiHeart, FiClock, FiCalendar } from 'react-icons/fi';
import { useFavoriteRecipes, FavoriteRecipe } from '@/app/hooks/useFavoriteRecipes';

interface FavoriteRecipesPDFProps {
  courseType: 'basics' | 'flow';
}

export default function FavoriteRecipesPDF({ courseType }: FavoriteRecipesPDFProps) {
  const { getFavoritesByCoursetype } = useFavoriteRecipes();
  const favorites = getFavoritesByCoursetype(courseType);
  const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Flow';

  // Group favorites by week - moved to component level
  const favoritesByWeek = favorites.reduce((acc, fav) => {
    const weekKey = `Vecka ${fav.weekNumber}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(fav);
    return acc;
  }, {} as Record<string, FavoriteRecipe[]>);

  const generatePDF = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    
    // favoritesByWeek is now available from component scope

    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mina Favoritrecept - ${courseName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid #014421;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #014421;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .course-info {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .date-info {
            font-size: 14px;
            color: #9ca3af;
            font-weight: 400;
        }
        
        .title {
            font-size: 28px;
            font-weight: 600;
            color: #014421;
            margin: 20px 0 8px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        .star-icon {
            color: #fbbf24;
            font-size: 24px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 40px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #014421;
        }
        
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .week-section {
            margin-bottom: 40px;
            break-inside: avoid;
        }
        
        .week-header {
            background: linear-gradient(135deg, #f3efe3 0%, #e8e0d4 100%);
            padding: 20px;
            border-radius: 12px 12px 0 0;
            border-left: 4px solid #014421;
        }
        
        .week-title {
            font-size: 20px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 4px;
        }
        
        .week-count {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .recipes-list {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 12px 12px;
        }
        
        .recipe-item {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .recipe-item:last-child {
            border-bottom: none;
        }
        
        .recipe-star {
            color: #fbbf24;
            margin-right: 16px;
            font-size: 18px;
        }
        
        .recipe-content {
            flex: 1;
        }
        
        .recipe-name {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 4px;
        }
        
        .recipe-meta {
            font-size: 13px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .meal-badge {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            color: #6b7280;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-text {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.4;
        }
        
        .tips-section {
            margin-top: 40px;
            padding: 20px;
            background: #fef3c7;
            border-radius: 12px;
            border-left: 4px solid #f59e0b;
        }
        
        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }
        
        .tips-list {
            font-size: 14px;
            color: #78350f;
            line-height: 1.5;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .week-section {
                break-inside: avoid;
            }
            
            .tips-section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Functional Foods</div>
        <div class="course-info">${courseName}</div>
        <div class="date-info">Skapad ${today}</div>
        <div class="title">
            <span class="star-icon">⭐</span>
            Mina Favoritrecept
            <span class="star-icon">⭐</span>
        </div>
        <div class="subtitle">Dina utvalda recept från kursen</div>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="stat-number">${favorites.length}</div>
            <div class="stat-label">Favoritrecept</div>
        </div>
        <div class="stat">
            <div class="stat-number">${Object.keys(favoritesByWeek).length}</div>
            <div class="stat-label">Veckor</div>
        </div>
        <div class="stat">
            <div class="stat-number">${new Set(favorites.map(f => f.mealType)).size}</div>
            <div class="stat-label">Måltidstyper</div>
        </div>
    </div>
    
    ${Object.entries(favoritesByWeek)
      .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
      .map(([week, recipes]) => `
        <div class="week-section">
            <div class="week-header">
                <div class="week-title">${week}</div>
                <div class="week-count">${recipes.length} ${recipes.length === 1 ? 'recept' : 'recept'}</div>
            </div>
            <div class="recipes-list">
                ${recipes.map(recipe => `
                    <div class="recipe-item">
                        <div class="recipe-star">⭐</div>
                        <div class="recipe-content">
                            <div class="recipe-name">${recipe.name}</div>
                            <div class="recipe-meta">
                                <span class="meal-badge">${getMealTypeSwedish(recipe.mealType)}</span>
                                <span>${recipe.dayName}</span>
                                <span>Tillagd ${new Date(recipe.addedAt).toLocaleDateString('sv-SE')}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    
    ${favorites.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
            <h3 style="font-size: 20px; margin-bottom: 8px; color: #374151;">Inga favoritrecept ännu</h3>
            <p>Markera dina favoritrecept med stjärnor under kursens gång!</p>
        </div>
    ` : ''}
    
    <div class="tips-section">
        <div class="tips-title">💡 Tips för dina favoritrecept</div>
        <div class="tips-list">
            • Spara denna PDF för framtida matlagning<br>
            • Alla recept finns även på hemsidan under Kunskapsbank > Recept<br>
            • Fortsätt använda dessa recept för att behålla dina hälsovanor<br>
            • Dela gärna med familj och vänner som också vill äta hälsosamt
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-text">
            Dina favoritrecept från ${courseName}<br>
            © ${new Date().getFullYear()} Functional Foods med Ulrika Davidsson
        </div>
    </div>
    
    <script>
        function getMealTypeSwedish(mealType) {
            switch(mealType) {
                case 'breakfast': return 'Frukost';
                case 'lunch': return 'Lunch'; 
                case 'dinner': return 'Middag';
                case 'snack': return 'Mellanmål';
                case 'dessert': return 'Efterrätt';
                default: return mealType;
            }
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mina-favoritrecept-${courseType}-${today}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMealTypeSwedish = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return 'Frukost';
      case 'lunch': return 'Lunch'; 
      case 'dinner': return 'Middag';
      case 'snack': return 'Mellanmål';
      case 'dessert': return 'Efterrätt';
      default: return mealType;
    }
  };

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 text-center border border-yellow-200"
      >
        <div className="text-6xl mb-4">⭐</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Inga favoritrecept ännu
        </h3>
        <p className="text-gray-600 mb-4">
          Markera dina favoritrecept med stjärnor under kursens gång!
        </p>
        <p className="text-sm text-gray-500">
          Klicka på stjärnan ⭐ bredvid måltider i dag-popupen för att spara dem som favoriter
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-yellow-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-3 rounded-full">
            <FiStar className="text-yellow-800 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Mina Favoritrecept
            </h3>
            <p className="text-gray-600 text-sm">
              {favorites.length} recept från {courseName}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={generatePDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-colors font-medium"
        >
          <FiDownload className="text-lg" />
          <span className="hidden sm:inline">Ladda ner PDF</span>
          <span className="sm:hidden">PDF</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#014421]">{favorites.length}</div>
          <div className="text-xs text-gray-600">Recept</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#014421]">{Object.keys(favoritesByWeek).length}</div>
          <div className="text-xs text-gray-600">Veckor</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#014421]">{new Set(favorites.map(f => f.mealType)).size}</div>
          <div className="text-xs text-gray-600">Måltidstyper</div>
        </div>
      </div>

      {/* Favorites Preview */}
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {Object.entries(favoritesByWeek)
          .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
          .map(([week, recipes]) => (
            <div key={week} className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-[#014421] mb-2 flex items-center gap-2">
                <FiCalendar className="text-sm" />
                {week}
              </h4>
              <div className="space-y-2">
                {recipes.slice(0, 3).map((recipe, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <FiStar className="text-yellow-500 text-xs" />
                    <span className="text-gray-700 truncate">{recipe.name}</span>
                    <span className="text-gray-500 text-xs">({getMealTypeSwedish(recipe.mealType)})</span>
                  </div>
                ))}
                {recipes.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{recipes.length - 3} fler recept...
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-white/60 rounded-lg border border-yellow-300">
        <div className="flex items-start gap-3">
          <FiHeart className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Spara dina favoritrecept!
            </p>
            <p className="text-xs text-gray-600">
              Ladda ner som PDF för att ha med dig i köket eller dela med familj och vänner.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 