"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function ReceptPage() {
  const recipes = [
    {
      title: "Lax med fetaost och rostade rotfrukter",
      image: "/lax_feta.jpg",
      href: "/kunskapsbank/recept/lax-feta",
      description: "En balanserad middag rik på omega-3, antioxidanter och fibrer",
      time: "30 min",
      portions: "4"
    },
    {
      title: "Torskrygg med ägghack och sparris",
      image: "/torskrygg.jpg",
      href: "/kunskapsbank/recept/torskrygg",
      description: "Proteinrik fisk med antioxidantrika granatäpplekärnor och fibrer",
      time: "20 min",
      portions: "2"
    }
  ];

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#4B2E19] mb-12 text-center">Recept</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recipes.map((recipe) => (
            <Link
              key={recipe.title}
              href={recipe.href}
              className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-[#4B2E19] mb-2">{recipe.title}</h2>
                <p className="text-gray-600 mb-4">{recipe.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>⏱️ {recipe.time}</span>
                  <span>👥 {recipe.portions} portioner</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 