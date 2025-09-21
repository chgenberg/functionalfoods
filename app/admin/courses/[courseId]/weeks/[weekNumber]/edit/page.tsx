'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, FileText, Video, Image } from 'lucide-react';

interface WeekContent {
  weekNumber: number;
  title: string;
  subtitle: string;
  welcomeMessage: string;
  heroImage: string;
  videoUrl: string;
  // Additional content sections
  mainContent?: string;
  keyTakeaways?: string[];
  weeklyChallenge?: string;
  reflectionQuestions?: string[];
}

export default function EditWeekPage({ 
  params 
}: { 
  params: { courseId: string; weekNumber: string } 
}) {
  const [weekContent, setWeekContent] = useState<WeekContent>({
    weekNumber: parseInt(params.weekNumber),
    title: '',
    subtitle: '',
    welcomeMessage: '',
    heroImage: '',
    videoUrl: '',
    mainContent: '',
    keyTakeaways: ['', '', ''],
    weeklyChallenge: '',
    reflectionQuestions: ['', '', '']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchWeekContent();
  }, [params.courseId, params.weekNumber]);

  const fetchWeekContent = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: WeekContent = {
        weekNumber: parseInt(params.weekNumber),
        title: `Vecka ${params.weekNumber}: Introduktion till Functional Foods`,
        subtitle: 'Grunderna för en hälsosam livsstil',
        welcomeMessage: 'Välkommen till vecka ' + params.weekNumber + '! Den här veckan kommer vi att utforska grunderna i functional foods och hur du kan börja din resa mot bättre hälsa.',
        heroImage: '/images/week' + params.weekNumber + '-hero.jpg',
        videoUrl: 'https://player.vimeo.com/video/123456789',
        mainContent: 'Detta är huvudinnehållet för veckan. Här kan du lägga till detaljerad information om veckans tema, viktiga koncept och praktiska tips.',
        keyTakeaways: [
          'Förstå grunderna i functional foods',
          'Lär dig identifiera näringsrika livsmedel',
          'Börja planera din hälsosamma kost'
        ],
        weeklyChallenge: 'Denna vecka utmanar vi dig att prova minst tre nya functional foods-recept och dokumentera hur du känner dig efteråt.',
        reflectionQuestions: [
          'Vad har du lärt dig om functional foods denna vecka?',
          'Vilka förändringar har du märkt i din energinivå?',
          'Hur kan du integrera dessa lärdomar i din vardag?'
        ]
      };

      setWeekContent(mockData);
    } catch (error) {
      console.error('Error fetching week content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWeekContent = async () => {
    setSaving(true);
    setSuccessMessage('');
    
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Veckoinnehåll sparat!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving week content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyTakeawayChange = (index: number, value: string) => {
    const newTakeaways = [...(weekContent.keyTakeaways || [])];
    newTakeaways[index] = value;
    setWeekContent({ ...weekContent, keyTakeaways: newTakeaways });
  };

  const handleReflectionQuestionChange = (index: number, value: string) => {
    const newQuestions = [...(weekContent.reflectionQuestions || [])];
    newQuestions[index] = value;
    setWeekContent({ ...weekContent, reflectionQuestions: newQuestions });
  };

  const addKeyTakeaway = () => {
    setWeekContent({ 
      ...weekContent, 
      keyTakeaways: [...(weekContent.keyTakeaways || []), ''] 
    });
  };

  const addReflectionQuestion = () => {
    setWeekContent({ 
      ...weekContent, 
      reflectionQuestions: [...(weekContent.reflectionQuestions || []), ''] 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Laddar veckoinnehåll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/admin/courses/${params.courseId}/weeks`}
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till veckor
          </Link>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
            Redigera Vecka {params.weekNumber}
          </h1>
          <p className="text-[var(--text-secondary)]">
            Uppdatera allt innehåll för denna kursvecka
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href={`/dashboard/courses/${params.courseId}/week/${params.weekNumber}`}
            target="_blank"
            className="admin-btn admin-btn-secondary"
          >
            <Eye className="w-4 h-4" />
            Förhandsgranska
          </Link>
          
          <button
            onClick={saveWeekContent}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="admin-alert admin-alert-success">
          {successMessage}
        </div>
      )}

      {/* Main Content Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Grundinformation
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="admin-label">Veckotitel</label>
              <input
                type="text"
                value={weekContent.title}
                onChange={(e) => setWeekContent({ ...weekContent, title: e.target.value })}
                className="admin-input"
                placeholder="T.ex. Vecka 1: Introduktion till Functional Foods"
              />
            </div>
            
            <div>
              <label className="admin-label">Underrubrik</label>
              <input
                type="text"
                value={weekContent.subtitle}
                onChange={(e) => setWeekContent({ ...weekContent, subtitle: e.target.value })}
                className="admin-input"
                placeholder="T.ex. Grunderna för en hälsosam livsstil"
              />
            </div>
            
            <div>
              <label className="admin-label">Välkomstmeddelande</label>
              <textarea
                value={weekContent.welcomeMessage}
                onChange={(e) => setWeekContent({ ...weekContent, welcomeMessage: e.target.value })}
                className="admin-textarea"
                rows={4}
                placeholder="Skriv ett inspirerande välkomstmeddelande för veckan..."
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Media
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="admin-label">Hero-bild URL</label>
              <input
                type="text"
                value={weekContent.heroImage}
                onChange={(e) => setWeekContent({ ...weekContent, heroImage: e.target.value })}
                className="admin-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="admin-label">Video URL (Vimeo)</label>
              <input
                type="text"
                value={weekContent.videoUrl}
                onChange={(e) => setWeekContent({ ...weekContent, videoUrl: e.target.value })}
                className="admin-input"
                placeholder="https://player.vimeo.com/video/123456789"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">
            Huvudinnehåll
          </h2>
          
          <div>
            <label className="admin-label">Veckoinnehåll</label>
            <textarea
              value={weekContent.mainContent}
              onChange={(e) => setWeekContent({ ...weekContent, mainContent: e.target.value })}
              className="admin-textarea"
              rows={10}
              placeholder="Skriv huvudinnehållet för veckan här..."
            />
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">
            Veckans nyckelpunkter
          </h2>
          
          <div className="space-y-3">
            {weekContent.keyTakeaways?.map((takeaway, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-[var(--text-secondary)] mt-2">{index + 1}.</span>
                <input
                  type="text"
                  value={takeaway}
                  onChange={(e) => handleKeyTakeawayChange(index, e.target.value)}
                  className="admin-input flex-1"
                  placeholder="Skriv en nyckelpunkt..."
                />
              </div>
            ))}
            
            <button
              onClick={addKeyTakeaway}
              className="admin-btn admin-btn-secondary text-sm"
            >
              + Lägg till nyckelpunkt
            </button>
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">
            Veckans utmaning
          </h2>
          
          <div>
            <label className="admin-label">Utmaning</label>
            <textarea
              value={weekContent.weeklyChallenge}
              onChange={(e) => setWeekContent({ ...weekContent, weeklyChallenge: e.target.value })}
              className="admin-textarea"
              rows={4}
              placeholder="Beskriv veckans utmaning för kursdeltagarna..."
            />
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="admin-card">
          <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">
            Reflektionsfrågor
          </h2>
          
          <div className="space-y-3">
            {weekContent.reflectionQuestions?.map((question, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-[var(--text-secondary)] mt-2">{index + 1}.</span>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleReflectionQuestionChange(index, e.target.value)}
                  className="admin-input flex-1"
                  placeholder="Skriv en reflektionsfråga..."
                />
              </div>
            ))}
            
            <button
              onClick={addReflectionQuestion}
              className="admin-btn admin-btn-secondary text-sm"
            >
              + Lägg till reflektionsfråga
            </button>
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-[var(--border-light)] p-4 -mx-4">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          <Link
            href={`/admin/courses/${params.courseId}/weeks`}
            className="admin-btn admin-btn-secondary"
          >
            Avbryt
          </Link>
          
          <button
            onClick={saveWeekContent}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>
    </div>
  );
}
