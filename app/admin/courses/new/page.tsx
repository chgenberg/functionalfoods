'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiSave, FiTag } from 'react-icons/fi';

export default function NewCoursePage() {
  const router = useRouter();

  const handleSave = () => {
    alert('Kurs skapad! (Dummy)');
    router.push('/admin/courses');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/courses" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <FiChevronLeft className="w-5 h-5" />
            <span>Tillbaka till kurser</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Skapa ny kurs</h1>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Kurstitel</label>
              <input type="text" id="title" placeholder="T.ex. Functional Basics" className="input-style" required />
            </div>
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">Undertitel</label>
              <input type="text" id="subtitle" placeholder="T.ex. Grundkurs i funktionell kost" className="input-style" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
              <textarea id="description" rows={5} placeholder="Beskriv kursens innehåll, mål och målgrupp..." className="input-style resize-y"></textarea>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="status" className="input-style appearance-none">
                <option>Utkast</option>
                <option>Publicerad</option>
              </select>
            </div>
            <div className="border-t pt-6 flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-5 py-3 rounded-lg transition-colors">
                <FiSave className="w-5 h-5"/>
                <span>Spara kurs</span>
              </button>
            </div>
          </form>
        </div>
      </div>
       <style jsx>{`
        .input-style {
          @apply w-full px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
        }
      `}</style>
    </div>
  );
} 