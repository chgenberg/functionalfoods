'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiTool } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function RecipePage() {
  const params = useParams();
  const recipeName = params.slug as string;
  
  // Convert slug to readable name
  const readableName = recipeName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 rounded-full p-6">
              <FiTool className="w-16 h-16 text-orange-600" />
          </div>
        </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {readableName}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Detta recept är under konstruktion
          </p>
          
          <p className="text-gray-500 mb-8">
            Vi arbetar på att lägga till alla recept från kursen. 
            Kom tillbaka snart för att se det fullständiga receptet!
          </p>
          
          <Link
            href="/dashboard/courses/functional-basics"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <FiArrowLeft className="w-5 h-5" />
            Tillbaka till kursen
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 