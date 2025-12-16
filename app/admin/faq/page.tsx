"use client";
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  GripVertical,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faq');
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data.faqs || []);
      setHasChanges(false);
    } catch (err) {
      setError('Kunde inte hämta frågor och svar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate
      for (const faq of faqs) {
        if (!faq.question.trim() || !faq.answer.trim()) {
          setError('Alla frågor måste ha både fråga och svar');
          setSaving(false);
          return;
        }
      }

      const response = await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSuccess('Ändringar sparade!');
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Kunde inte spara ändringar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Är du säker på att du vill återställa till standardfrågorna? Alla anpassade frågor kommer att tas bort.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/faq', {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to reset');

      await fetchFAQs();
      setSuccess('Frågor återställda till standard');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Kunde inte återställa frågor');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = () => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: ''
    };
    setFaqs([...faqs, newFaq]);
    setHasChanges(true);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
    setHasChanges(true);
  };

  const deleteFAQ = (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna fråga?')) return;
    setFaqs(faqs.filter(faq => faq.id !== id));
    setHasChanges(true);
  };

  const moveFAQ = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
    setFaqs(newFaqs);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary-green)] mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] mt-4">Laddar frågor och svar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Frågor & Svar</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Hantera vanliga frågor på FAQ-sidan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Återställ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              hasChanges
                ? 'bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Spara
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Tips</h3>
            <p className="text-sm text-blue-700 mt-1">
              Frågorna visas i den ordning de listas här. Använd pilarna för att ändra ordningen.
              Ändringar syns direkt på FAQ-sidan (<code className="bg-blue-100 px-1 rounded">/kunskapsbank/qa</code>) efter att du sparat.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={faq.id} 
            className="bg-white border border-[var(--border-light)] rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              {/* Move buttons */}
              <div className="flex flex-col gap-1 pt-2">
                <button
                  onClick={() => moveFAQ(index, 'up')}
                  disabled={index === 0}
                  className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Flytta upp"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveFAQ(index, 'down')}
                  disabled={index === faqs.length - 1}
                  className={`p-1 rounded ${index === faqs.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Flytta ner"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* FAQ content */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Fråga {index + 1}
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                    placeholder="Skriv frågan här..."
                    className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Svar
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                    placeholder="Skriv svaret här..."
                    rows={3}
                    className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)] resize-y"
                  />
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteFAQ(faq.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Ta bort fråga"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Inga frågor och svar ännu</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={addFAQ}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--primary-green)] hover:text-[var(--primary-green)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        Lägg till ny fråga
      </button>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">Du har osparade ändringar</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Spara nu
          </button>
        </div>
      )}
    </div>
  );
}

