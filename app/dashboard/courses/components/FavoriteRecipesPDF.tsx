'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiDownload, FiHeart, FiClock, FiCalendar } from 'react-icons/fi';
import { useFavoriteRecipes, FavoriteRecipe } from '@/app/hooks/useFavoriteRecipes';

interface FavoriteRecipesPDFProps {
  courseType: 'basics' | 'flow';
}

export default function FavoriteRecipesPDF({ courseType }: FavoriteRecipesPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const today = new Date().toLocaleDateString('sv-SE');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Cover Page
      // Background gradient effect (simulated with rectangles)
      doc.setFillColor(1, 68, 33); // #014421
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add subtle pattern overlay
      doc.setFillColor(255, 255, 255, 0.05);
      for (let i = 0; i < pageWidth; i += 10) {
        for (let j = 0; j < pageHeight; j += 10) {
          if ((i + j) % 20 === 0) {
            doc.circle(i, j, 1, 'F');
          }
        }
      }

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      const title = 'Mina Favoritrecept';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 80);

      // Subtitle
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      const subtitle = `${courseName} - Personlig samling`;
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 100);

      // Stats boxes
      const statsY = 130;
      const boxWidth = 50;
      const boxHeight = 30;
      const statsData = [
        { label: 'Recept', value: favorites.length.toString() },
        { label: 'Veckor', value: Object.keys(favoritesByWeek).length.toString() },
        { label: 'Måltidstyper', value: new Set(favorites.map(f => f.mealType)).size.toString() }
      ];

      statsData.forEach((stat, index) => {
        const x = (pageWidth - (statsData.length * boxWidth + (statsData.length - 1) * 10)) / 2 + index * (boxWidth + 10);
        
        // Box background
        doc.setFillColor(255, 255, 255, 0.1);
        doc.roundedRect(x, statsY, boxWidth, boxHeight, 5, 5, 'F');
        
        // Value
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const valueWidth = doc.getTextWidth(stat.value);
        doc.text(stat.value, x + (boxWidth - valueWidth) / 2, statsY + 15);
        
        // Label
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(stat.label);
        doc.text(stat.label, x + (boxWidth - labelWidth) / 2, statsY + 25);
      });

      // Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const dateText = `Genererad: ${today}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, pageHeight - 30);

      // New page for content
      doc.addPage();
      yPosition = margin;

      // Reset text color for content pages
      doc.setTextColor(26, 26, 26); // #1a1a1a

      // Header
      doc.setFillColor(1, 68, 33);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const headerText = 'Mina Favoritrecept';
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, (pageWidth - headerWidth) / 2, 25);

      yPosition = 60;
      doc.setTextColor(26, 26, 26);

      if (favorites.length === 0) {
        // No favorites message
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        const noFavText = 'Inga favoritrecept ännu. Stjärnmarkera recept i dina måltidsplaner för att samla dem här!';
        const textWidth = doc.getTextWidth(noFavText);
        doc.text(noFavText, (pageWidth - Math.min(textWidth, pageWidth - 2 * margin)) / 2, yPosition + 40);
      } else {
        // Group and display favorites by week
        const sortedWeeks = Object.entries(favoritesByWeek).sort(([a], [b]) => {
          const weekA = parseInt(a.split(' ')[1]);
          const weekB = parseInt(b.split(' ')[1]);
          return weekA - weekB;
        });

        for (const [weekName, weekRecipes] of sortedWeeks) {
          checkNewPage(30);

          // Week header
          doc.setFillColor(248, 249, 250); // Light gray background
          doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(1, 68, 33);
          doc.text(weekName, margin + 5, yPosition + 8);
          
          yPosition += 25;
          doc.setTextColor(26, 26, 26);

          // Recipes in this week
          for (const recipe of weekRecipes) {
            checkNewPage(25);

            // Recipe card background
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 20, 2, 2, 'F');

            // Star icon (simulated with text)
            doc.setFontSize(12);
            doc.setTextColor(255, 193, 7); // Gold color
            doc.text('★', margin + 5, yPosition + 8);

            // Recipe name
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 26, 26);
            yPosition = addText(recipe.name, margin + 15, yPosition + 8, pageWidth - 2 * margin - 60, 12, true);

            // Meta information
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(108, 117, 125);
            const metaText = `${recipe.dayName} • ${getMealTypeSwedish(recipe.mealType)}`;
            doc.text(metaText, margin + 15, yPosition + 2);

            // Recipe link (if available)
            if (recipe.recipeLink) {
              doc.setFontSize(9);
              doc.setTextColor(0, 102, 204);
              const linkText = `functionalfoods.se${recipe.recipeLink}`;
              doc.text(linkText, margin + 15, yPosition + 8);
            }

            yPosition += 15;
          }

          yPosition += 10; // Space between weeks
        }
      }

      // Footer on last page
      const footerY = pageHeight - 40;
      doc.setFillColor(1, 68, 33);
      doc.rect(0, footerY, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const footerTitle = 'Ulrika Functional Foods';
      const footerTitleWidth = doc.getTextWidth(footerTitle);
      doc.text(footerTitle, (pageWidth - footerTitleWidth) / 2, footerY + 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const footerSubtext = 'Din personliga guide till hälsosam mat och välmående';
      const footerSubtextWidth = doc.getTextWidth(footerSubtext);
      doc.text(footerSubtext, (pageWidth - footerSubtextWidth) / 2, footerY + 25);

      const footerInfo = `© ${new Date().getFullYear()} Ulrika Functional Foods • functionalfoods.se`;
      const footerInfoWidth = doc.getTextWidth(footerInfo);
      doc.text(footerInfo, (pageWidth - footerInfoWidth) / 2, footerY + 32);

      // Save the PDF
      const fileName = `Mina-Favoritrecept-${courseName.replace(' ', '-')}-${today.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to the old HTML method if PDF generation fails
      generateHTMLFallback();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHTMLFallback = () => {
    // Keep the old HTML method as fallback
    const today = new Date().toLocaleDateString('sv-SE');
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mina Favoritrecept - ${courseName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            border-radius: 15px;
        }
        
        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .week-section {
            margin-bottom: 40px;
        }
        
        .week-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #014421;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .recipe-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #014421;
        }
        
        .recipe-name {
            font-weight: 600;
            font-size: 1.1rem;
            color: #014421;
            margin-bottom: 8px;
        }
        
        .recipe-meta {
            font-size: 0.9rem;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .recipe-link {
            font-size: 0.85rem;
            color: #0066cc;
            font-family: monospace;
        }
        
        .no-favorites {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .footer {
            margin-top: 60px;
            padding: 30px;
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            text-align: center;
            border-radius: 15px;
        }
        
        @media print {
            body { margin: 0; padding: 10px; }
            .header, .footer { background: #014421 !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Mina Favoritrecept</h1>
        <div class="subtitle">${courseName} - Personlig samling</div>
        <div style="font-size: 0.9rem; opacity: 0.7;">Genererad: ${today}</div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${favorites.length}</div>
                <div class="stat-label">Recept</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(favoritesByWeek).length}</div>
                <div class="stat-label">Veckor</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${new Set(favorites.map(f => f.mealType)).size}</div>
                <div class="stat-label">Måltidstyper</div>
            </div>
        </div>
    </div>
    
    <div class="content">
        ${favorites.length === 0 ? `
            <div class="no-favorites">
                <h2>Inga favoritrecept ännu</h2>
                <p>Stjärnmarkera recept i dina måltidsplaner för att samla dem här!</p>
            </div>
        ` : `
            ${Object.entries(favoritesByWeek)
              .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
              .map(([week, recipes]) => `
                <div class="week-section">
                    <h2 class="week-title">${week}</h2>
                    ${recipes.map(recipe => `
                        <div class="recipe-item">
                            <div class="recipe-name">★ ${recipe.name}</div>
                            <div class="recipe-meta">${recipe.dayName} • ${getMealTypeSwedish(recipe.mealType)}</div>
                            ${recipe.recipeLink ? `<div class="recipe-link">functionalfoods.se${recipe.recipeLink}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
              `).join('')}
        `}
    </div>
    
    <div class="footer">
        <h3>Ulrika Functional Foods</h3>
        <p>Din personliga guide till hälsosam mat och välmående</p>
        <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.8;">
            © ${new Date().getFullYear()} Ulrika Functional Foods • functionalfoods.se
        </p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const getMealTypeSwedish = (mealType: string): string => {
    const translations: Record<string, string> = {
      'breakfast': 'Frukost',
      'lunch': 'Lunch', 
      'dinner': 'Middag',
      'snack': 'Mellanmål'
    };
    return translations[mealType] || mealType;
  };

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200"
      >
        <div className="text-center">
          <FiHeart className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Inga favoritrecept ännu</h3>
          <p className="text-gray-600 mb-4">
            Stjärnmarkera recept i dina måltidsplaner för att samla dem här!
          </p>
          <div className="text-sm text-gray-500">
            Klicka på ⭐ bredvid måltider för att lägga till dem som favoriter
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <FiHeart className="text-red-500" />
            Mina Favoritrecept
          </h3>
          <p className="text-gray-600 text-sm">
            {favorites.length} recept från {courseName}
          </p>
        </div>
        
        <motion.button
          onClick={generatePDF}
          disabled={isGenerating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="hidden sm:inline">Genererar PDF...</span>
            </>
          ) : (
            <>
              <FiDownload className="text-lg" />
              <span className="hidden sm:inline">Ladda ner PDF</span>
              <span className="sm:hidden">PDF</span>
            </>
          )}
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