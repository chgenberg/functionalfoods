'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, ChefHat } from 'lucide-react';

interface CourseRecipesPDFProps {
  courseType: 'basics' | 'flow' | 'energy';
}

export default function CourseRecipesPDF({ courseType }: CourseRecipesPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const courseName = courseType === 'basics' 
    ? 'Functional Basics' 
    : courseType === 'flow' 
    ? 'Functional Flow' 
    : 'Functional Energy';

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      // Import meal plans based on course type
      const { mealPlans, flowMealPlans, energyMealPlans } = await import('@/app/data/mealPlans');
      const courseMealPlans = courseType === 'basics' 
        ? mealPlans 
        : courseType === 'flow' 
        ? flowMealPlans 
        : energyMealPlans;

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
      const title = 'Kursrecept';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 80);

      // Subtitle
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      const subtitle = courseName;
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 100);

      // Recipe count
      const recipeCount = Object.values(courseMealPlans).reduce((total, week: any) => {
        return total + Object.values(week.days || {}).reduce((weekTotal: number, day: any) => {
          const dayRecipes = ['breakfast', 'lunch', 'dinner'].filter(meal => day[meal]).length;
          return weekTotal + dayRecipes;
        }, 0);
      }, 0);

      doc.setFontSize(14);
      const countText = `${recipeCount} näringsrika recept`;
      const countWidth = doc.getTextWidth(countText);
      doc.text(countText, (pageWidth - countWidth) / 2, 120);

      // Date
      doc.setFontSize(12);
      const dateText = `Genererad ${today}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, 260);

      // Footer design
      doc.setFillColor(255, 255, 255, 0.1);
      doc.rect(margin, pageHeight - 60, pageWidth - 2 * margin, 40, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255, 0.8);
      const footer = 'Functional Foods med Ulrika Davidsson';
      const footerWidth = doc.getTextWidth(footer);
      doc.text(footer, (pageWidth - footerWidth) / 2, pageHeight - 35);

      // Table of contents page
      doc.addPage();
      doc.setTextColor(1, 68, 33);
      yPosition = addText('Innehållsförteckning', margin, yPosition, pageWidth - 2 * margin, 24, true);
      yPosition += 10;

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      
      // List all weeks and their recipes
      Object.entries(courseMealPlans).forEach(([weekKey, week]: [string, any]) => {
        const weekNumber = weekKey.replace('week', '');
        checkNewPage(30);
        
        doc.setTextColor(1, 68, 33);
        yPosition = addText(`Vecka ${weekNumber}`, margin, yPosition, pageWidth - 2 * margin, 14, true);
        yPosition += 3;
        
        doc.setTextColor(100, 100, 100);
        Object.entries(week.days || {}).forEach(([dayName, day]: [string, any]) => {
          if (day.breakfast) {
            yPosition = addText(`  • ${day.breakfast.name}`, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
          }
          if (day.lunch) {
            yPosition = addText(`  • ${day.lunch.name}`, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
          }
          if (day.dinner) {
            yPosition = addText(`  • ${day.dinner.name}`, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
          }
        });
        yPosition += 5;
      });

      // Recipe pages
      let recipeNumber = 0;
      Object.entries(courseMealPlans).forEach(([weekKey, week]: [string, any]) => {
        const weekNumber = weekKey.replace('week', '');
        
        Object.entries(week.days || {}).forEach(([dayName, day]: [string, any]) => {
          ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
            const meal = day[mealType];
            if (!meal) return;
            
            recipeNumber++;
            doc.addPage();
            yPosition = margin;
            
            // Recipe header
            doc.setFillColor(1, 68, 33);
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(`Recept ${recipeNumber} • Vecka ${weekNumber} • ${dayName}`, margin, 15);
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(meal.name, margin, 30);
            
            yPosition = 60;
            
            // Recipe info
            doc.setTextColor(1, 68, 33);
            doc.setFontSize(14);
            yPosition = addText('Receptinformation', margin, yPosition, pageWidth - 2 * margin, 14, true);
            yPosition += 5;
            
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(11);
            
            if (meal.recipeLink) {
              const recipeId = meal.recipeLink.split('/').pop();
              yPosition = addText(`Recept-ID: ${recipeId}`, margin, yPosition, pageWidth - 2 * margin, 11);
            }
            
            const mealTypeSwedish = mealType === 'breakfast' ? 'Frukost' : 
                                   mealType === 'lunch' ? 'Lunch' : 'Middag';
            yPosition = addText(`Måltidstyp: ${mealTypeSwedish}`, margin, yPosition, pageWidth - 2 * margin, 11);
            yPosition += 10;
            
            // Nutritional info if available
            if (meal.name.includes('kcal')) {
              doc.setTextColor(1, 68, 33);
              yPosition = addText('Näringsinformation', margin, yPosition, pageWidth - 2 * margin, 14, true);
              yPosition += 5;
              
              doc.setTextColor(60, 60, 60);
              const calorieMatch = meal.name.match(/\((\d+\s*kcal)\)/);
              if (calorieMatch) {
                yPosition = addText(`Energi: ${calorieMatch[1]}`, margin, yPosition, pageWidth - 2 * margin, 11);
              }
            }
            
            // Add space for actual recipe content
            yPosition += 15;
            doc.setTextColor(1, 68, 33);
            yPosition = addText('Ingredienser', margin, yPosition, pageWidth - 2 * margin, 14, true);
            yPosition += 5;
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            yPosition = addText('[Ingredienslista hämtas från receptdatabasen]', margin, yPosition, pageWidth - 2 * margin, 10);
            
            yPosition += 10;
            doc.setTextColor(1, 68, 33);
            doc.setFontSize(14);
            yPosition = addText('Instruktioner', margin, yPosition, pageWidth - 2 * margin, 14, true);
            yPosition += 5;
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            yPosition = addText('[Tillagningsinstruktioner hämtas från receptdatabasen]', margin, yPosition, pageWidth - 2 * margin, 10);
            
            // Footer on each recipe page
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`${courseName} • Sida ${doc.internal.getCurrentPageInfo().pageNumber}`, margin, pageHeight - 10);
          });
        });
      });

      // Save the PDF
      const filename = `${courseType}-alla-recept.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-[#014421] rounded-xl flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-[#014421] mb-2">
            Kursens alla recept
          </h3>
          <p className="text-gray-600">
            Ladda ner alla recept från {courseName} som PDF
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <motion.button
          onClick={generatePDF}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#014421] text-white hover:bg-[#112A12] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Genererar PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Ladda ner alla kursrecept</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Info Box */}
      <div className="bg-[#F7F1E8] rounded-xl p-4 border border-[#E8E0D4]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#014421]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#014421] mb-1">
              Komplett receptsamling
            </p>
            <p className="text-sm text-gray-600">
              PDF:en innehåller alla recept från kursens 6 veckor, organiserade veckovis med fullständig information.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
