// app/types.ts

// Grundläggande typer för näringsanalys
export interface NutrientInfo {
    status: 'deficient' | 'low' | 'normal';
    description: string;
    amount?: number;
    unit?: string;
    rdi?: number;
  }
  
  // Användarsvar och interaktion
  export interface UserResponse {
    bodyPart: string;
    description: string;
    previousAnswers?: Answer[];
  }
  
  export interface Answer {
    question: string;
    answer: string;
    type: 'symptom' | 'lifestyle' | 'medical';
    value: string;
  }
  
  // Frågeformat
  export interface Question {
    question: string;
    options: string[];
    type: 'choice' | 'text';
    category: 'symptom' | 'lifestyle' | 'medical';
  }
  
  // Rapportformat
  export interface Report {
    riskProfile: Record<string, 'low' | 'medium' | 'high'>;
    redFlags: string[];
    scenarios: string[];
    timeline: string[];
    checklist: ChecklistItem[];
    mealPlan: string[];
    micronutrients: Record<string, NutrientInfo>;
    symptomTracker: SymptomTrackerItem[];
    aiChatIntro: string;
    faq: FAQItem[];
    references: Reference[];
    costBenefit: CostBenefit;
    localExperts: Expert[];
    reminder: ReminderInfo;
    pdfLink: string;
  }
  
  // Hjälptyper för rapporten
  export interface ChecklistItem {
    label: string;
    done: boolean;
  }
  
  export interface SymptomTrackerItem {
    symptom: string;
    severity: number;
    frequency: string;
    notes?: string;
  }
  
  export interface FAQItem {
    question: string;
    answer: string;
    category: string;
  }
  
  export interface Reference {
    title: string;
    authors: string[];
    year: number;
    url?: string;
  }
  
  export interface CostBenefit {
    estimatedCost: number;
    currency: string;
    benefits: string[];
    timeline: string;
  }
  
  export interface Expert {
    name: string;
    specialty: string;
    location: string;
    contact?: string;
  }
  
  export interface ReminderInfo {
    frequency: 'daily' | 'weekly' | 'monthly';
    type: string;
    description: string;
  }
  
  // API Response typer
  export interface APIResponse {
    questions?: Question[];
    report?: Report;
    error?: string;
    metadata?: {
      hasNutrientQuestions: boolean;
      symptomCount: number;
    };
  }