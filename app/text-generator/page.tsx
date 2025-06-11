'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TextGenerator() {
  const [bookTitle, setBookTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [numChapters, setNumChapters] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle,
          topic,
          numChapters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate book');
      }

      const data = await response.json();
      router.push(`/text-generator/result?bookId=${data.bookId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Ett fel uppstod vid generering av boken. Försök igen senare.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Text Generator
        </h1>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Bokens titel
              </label>
              <input
                type="text"
                id="bookTitle"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Ämne
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                required
              />
            </div>

            <div>
              <label htmlFor="numChapters" className="block text-sm font-medium text-gray-700 mb-2">
                Antal kapitel
              </label>
              <input
                type="number"
                id="numChapters"
                value={numChapters}
                onChange={(e) => setNumChapters(parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Genererar...' : 'Generera text'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 