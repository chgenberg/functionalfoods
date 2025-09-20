export const generateRecipePrintHTML = (
  recipe: any,
  servings: number,
  nutrition: any,
  smartIngredients: string[],
  imageError: boolean
) => {
  const nutritionPerServing = nutrition?.perServing ? {
    kcal: Math.round(nutrition.perServing.energy || nutrition.perServing.calories || 0),
    protein: Math.round((nutrition.perServing.protein || 0) * 10) / 10,
    carbs: Math.round((nutrition.perServing.carbohydrates || nutrition.perServing.carbs || 0) * 10) / 10,
    fat: Math.round((nutrition.perServing.fat || 0) * 10) / 10,
    fiber: Math.round((nutrition.perServing.fiber || 0) * 10) / 10
  } : null;

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recipe.title} - Functional Foods</title>
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
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #014421;
        }
        
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #014421;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .recipe-title {
            font-size: 32px;
            font-weight: 700;
            color: #014421;
            margin: 20px 0 10px 0;
            line-height: 1.2;
        }
        
        .recipe-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            font-size: 14px;
            color: #6b7280;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .meta-icon {
            width: 16px;
            height: 16px;
            fill: #93C560;
        }
        
        .main-image {
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 16px;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #F7F1E8;
        }
        
        .ingredients-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .ingredient-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .ingredient-name {
            font-weight: 500;
            color: #374151;
            flex-grow: 1;
        }
        
        .instructions-list {
            counter-reset: step-counter;
        }
        
        .instruction-item {
            position: relative;
            padding-left: 50px;
            margin-bottom: 24px;
            counter-increment: step-counter;
        }
        
        .instruction-item::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            width: 36px;
            height: 36px;
            background: #014421;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
        }
        
        .instruction-text {
            line-height: 1.8;
            color: #374151;
        }
        
        .nutrition-box {
            background: linear-gradient(135deg, #f3efe3 0%, #e8e0d4 100%);
            border-radius: 16px;
            padding: 24px;
            margin-top: 30px;
        }
        
        .nutrition-title {
            font-size: 18px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 16px;
        }
        
        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
        }
        
        .nutrition-item {
            text-align: center;
            background: white;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .nutrition-value {
            font-size: 24px;
            font-weight: 700;
            color: #014421;
        }
        
        .nutrition-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
        }
        
        .tips-box {
            background: #f0fdf4;
            border-left: 4px solid #93C560;
            padding: 20px;
            border-radius: 12px;
            margin-top: 30px;
        }
        
        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .tips-content {
            color: #374151;
            line-height: 1.8;
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
        
        @media print {
            body {
                padding: 20px;
            }
            
            .main-image {
                max-height: 300px;
            }
            
            .section {
                break-inside: avoid;
            }
            
            .instruction-item {
                break-inside: avoid;
            }
        }
        
        @media (max-width: 600px) {
            .ingredients-grid {
                grid-template-columns: 1fr;
            }
            
            .recipe-meta {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Functional Foods</div>
        <h1 class="recipe-title">${recipe.title}</h1>
        ${recipe.excerpt ? `<p style="color: #6b7280; margin-top: 10px; font-size: 16px;">${recipe.excerpt}</p>` : ''}
        <div class="recipe-meta">
            ${recipe.prepTime ? `
                <div class="meta-item">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${recipe.prepTime}</span>
                </div>
            ` : ''}
            <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>${servings} ${servings === 1 ? 'portion' : 'portioner'}</span>
            </div>
            ${recipe.difficulty ? `
                <div class="meta-item">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>${recipe.difficulty}</span>
                </div>
            ` : ''}
        </div>
    </div>
    
    ${recipe.imageUrl && !imageError ? `
        <img src="${recipe.imageUrl}" alt="${recipe.imageAlt || recipe.title}" class="main-image" onerror="this.style.display='none'">
    ` : ''}
    
    <div class="section">
        <h2 class="section-title">Ingredienser</h2>
        <div class="ingredients-grid">
            ${smartIngredients.map((ingredient) => `
                <div class="ingredient-item">
                    <div class="checkbox"></div>
                    <div class="ingredient-name">${ingredient}</div>
                </div>
            `).join('')}
        </div>
    </div>
    
    ${recipe.instructions ? `
        <div class="section">
            <h2 class="section-title">Instruktioner</h2>
            <div class="instructions-list">
                ${Array.isArray(recipe.instructions) 
                    ? recipe.instructions.map((step: string) => `
                        <div class="instruction-item">
                            <div class="instruction-text">${step}</div>
                        </div>
                    `).join('')
                    : recipe.instructions.split('\\n').filter((s: string) => s.trim()).map((step: string) => `
                        <div class="instruction-item">
                            <div class="instruction-text">${step}</div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    ` : ''}
    
    ${nutritionPerServing ? `
        <div class="nutrition-box">
            <h3 class="nutrition-title">Näringsvärde per portion</h3>
            <div class="nutrition-grid">
                <div class="nutrition-item">
                    <div class="nutrition-value">${nutritionPerServing.kcal}</div>
                    <div class="nutrition-label">kcal</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${nutritionPerServing.protein}g</div>
                    <div class="nutrition-label">Protein</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${nutritionPerServing.carbs}g</div>
                    <div class="nutrition-label">Kolhydrater</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${nutritionPerServing.fat}g</div>
                    <div class="nutrition-label">Fett</div>
                </div>
                ${nutritionPerServing.fiber > 0 ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${nutritionPerServing.fiber}g</div>
                        <div class="nutrition-label">Fiber</div>
                    </div>
                ` : ''}
            </div>
        </div>
    ` : ''}
    
    ${recipe.tips ? `
        <div class="tips-box">
            <h3 class="tips-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C560" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
                Tips
            </h3>
            <div class="tips-content">${recipe.tips}</div>
        </div>
    ` : ''}
    
    <div class="footer">
        <div class="footer-text">
            Utskrivet från Functional Foods med Ulrika Davidsson<br>
            © ${new Date().getFullYear()} Functional Foods • functionalfoods.se
        </div>
    </div>
</body>
</html>`;
};
