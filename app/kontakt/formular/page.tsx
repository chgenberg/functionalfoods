"use client";
import { useState } from 'react';

export default function KontaktFormular() {
  const [formData, setFormData] = useState({
    namn: '',
    email: '',
    amne: '',
    meddelande: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hantera formulärinlämning här
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-light text-gray-900 mb-8">Kontakta oss</h1>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="namn" className="block text-sm font-medium text-gray-700">
              Namn
            </label>
            <input
              type="text"
              id="namn"
              value={formData.namn}
              onChange={(e) => setFormData({...formData, namn: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4B2E19] focus:ring-[#4B2E19]"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-post
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4B2E19] focus:ring-[#4B2E19]"
              required
            />
          </div>
          <div>
            <label htmlFor="amne" className="block text-sm font-medium text-gray-700">
              Ämne
            </label>
            <input
              type="text"
              id="amne"
              value={formData.amne}
              onChange={(e) => setFormData({...formData, amne: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4B2E19] focus:ring-[#4B2E19]"
              required
            />
          </div>
          <div>
            <label htmlFor="meddelande" className="block text-sm font-medium text-gray-700">
              Meddelande
            </label>
            <textarea
              id="meddelande"
              value={formData.meddelande}
              onChange={(e) => setFormData({...formData, meddelande: e.target.value})}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4B2E19] focus:ring-[#4B2E19]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4B2E19] text-white py-2 px-4 rounded-md hover:bg-[#6B3F23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B2E19]"
          >
            Skicka meddelande
          </button>
        </form>
      </div>
    </div>
  );
} 