'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function RecipePage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Convert slug to readable name
  const recipeName = slug
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/dashboard/courses/functional-basics"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Tillbaka till kursen
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipeName}</h1>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-blue-800">
              <strong>Obs!</strong> Receptdatabasen är under uppbyggnad. 
              Detta recept kommer snart att vara tillgängligt med fullständiga 
              ingredienser, instruktioner och näringsinnehåll.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">
              Receptet "{recipeName}" är en del av Functional Foods-programmet 
              och kommer att innehålla näringsrika ingredienser som stödjer din hälsa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 