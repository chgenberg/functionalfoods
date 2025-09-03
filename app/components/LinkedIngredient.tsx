'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
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
  
  if (rawMaterial) {
    const slug = rawMaterial.name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    return (
      <Link 
        href={`/kunskapsbank/ingredienser#${slug}`}
        className={`text-[#93C560] hover:text-[#014421] transition-colors underline decoration-[#93C560]/30 hover:decoration-[#014421] underline-offset-2 font-medium inline-flex items-center gap-1 ${className}`}
        title={`Läs mer om ${rawMaterial.name}`}
      >
        {ingredient}
        {showIcon && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }
  
  // No raw material match - display as regular text
  return (
    <span className={className}>
      {ingredient}
    </span>
  );
} 