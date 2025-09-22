'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, BookOpen, Eye, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cookingTime?: number;
  difficulty?: string;
}

export default function CourseRecipesPage({ params }: { params: { courseId: string } }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const getCourseName = (courseId: string) => {
    const names = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };
    return names[courseId as keyof typeof names] || 'Kurs';
  };

  useEffect(() => {
    // Mock data för nu
    setTimeout(() => {
      setRecipes([
        {
          id: '1',
          title: 'Quinoasallad med grönsaker',
          description: 'Näringsrik sallad perfekt för kursen',
          cookingTime: 25,
          difficulty: 'Lätt'
        },
        {
          id: '2',
          title: 'Linsgryta med gurkmeja',
          description: 'Antiinflammatorisk gryta',
          cookingTime: 40,
          difficulty: 'Medel'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Laddar recept...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till kurser
          </Link>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
            {getCourseName(params.courseId)} - Recept
          </h1>
          <p className="text-[var(--text-secondary)]">
            Hantera recept kopplade till denna kurs
          </p>
        </div>
        
        <Link
          href={`/admin/recipes/new?course=${params.courseId}`}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Lägg till recept
        </Link>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="admin-card hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[var(--primary-green)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {recipe.cookingTime} min • {recipe.difficulty}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {recipe.description}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/admin/recipes/${recipe.id}/edit`}
                className="admin-btn admin-btn-primary justify-center text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Redigera
              </Link>
              
              <Link
                href={`/recipes/${recipe.id}`}
                target="_blank"
                className="admin-btn admin-btn-secondary justify-center text-sm"
              >
                <Eye className="w-4 h-4" />
                Visa
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Inga recept ännu
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Börja med att lägga till recept för denna kurs
          </p>
          <Link
            href={`/admin/recipes/new?course=${params.courseId}`}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Lägg till första receptet
          </Link>
        </div>
      )}
    </div>
  );
}
