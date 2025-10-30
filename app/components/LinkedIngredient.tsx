'use client';

import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import type { RawMaterial } from '../lib/ingredientLinker';

interface LinkedIngredientProps {
  ingredient: string;
  rawMaterial?: RawMaterial | null;
  className?: string;
  showIcon?: boolean;
}

export default function LinkedIngredient({ 
  ingredient, 
  rawMaterial, 
  className = '', 
  showIcon = false 
}: LinkedIngredientProps) {
  const [showPopup, setShowPopup] = useState(false);
  
  // Ensure proper spacing between numbers and text (e.g., "1paprika" -> "1 paprika")
  const formatIngredient = (text: string): string => {
    return text.replace(/(\d)([a-zäöå])/gi, '$1 $2');
  };
  
  const displayText = formatIngredient(ingredient);
  
  if (rawMaterial) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setShowPopup(true)}
          className={`text-[#014421] hover:text-[#116530] transition-colors underline decoration-[#014421]/30 hover:decoration-[#116530] underline-offset-2 font-medium cursor-pointer ${className}`}
          title={`Klicka för mer info om ${rawMaterial.name}`}
        >
          {displayText}
          {showIcon && <Info className="inline w-3 h-3 ml-1" />}
        </button>

        {showPopup && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPopup(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Stäng"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="pr-8">
                <h3 className="text-xl font-bold text-[#014421] mb-3">
                  {rawMaterial.name}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {rawMaterial.description || 'Information om denna råvara kommer snart.'}
                </p>
                
                {rawMaterial.description && rawMaterial.description.includes('•') && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Egenskaper:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {rawMaterial.description.split('•').filter(item => item.trim()).map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#93C560] mt-1">•</span>
                          <span>{benefit.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-center pt-4 border-t border-gray-100">
                  <a
                    href="/kunskapsbank/ingredienser"
                    className="text-[#014421] hover:text-[#116530] text-sm font-medium transition-colors"
                    onClick={() => setShowPopup(false)}
                  >
                    Se alla råvaror →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // No raw material match - display as regular text
  return (
    <span className={className}>
      {displayText}
    </span>
  );
} 