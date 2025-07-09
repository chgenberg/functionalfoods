"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiSave, FiUpload, FiX, FiPlus, FiCheck, FiBook, FiVideo, FiFileText, FiDownload } from 'react-icons/fi';
import Link from 'next/link';

interface CourseData {
  title: string;
  description: string;
  shortDescription: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: number;
  category: string;
  image: string;
  features: string[];
  modules: Array<{
    title: string;
    description: string;
    lessons: Array<{
      title: string;
      type: 'video' | 'text' | 'quiz' | 'download';
      content: string;
      duration?: string;
    }>;
  }>;
  requirements: string[];
  learningOutcomes: string[];
}

const steps = [
  { id: 1, title: 'Grundläggande info', description: 'Titel, beskrivning och kategori' },
  { id: 2, title: 'Kursdetaljer', description: 'Nivå, pris och funktioner' },
  { id: 3, title: 'Kursinnehåll', description: 'Moduler och lektioner' },
  { id: 4, title: 'Krav & Mål', description: 'Förutsättningar och lärandemål' },
  { id: 5, title: 'Granska & Spara', description: 'Kontrollera och publicera' }
];

export default function NewCoursePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    shortDescription: '',
    level: 'beginner',
    duration: '',
    price: 0,
    category: '',
    image: '',
    features: [],
    modules: [],
    requirements: [],
    learningOutcomes: []
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateCourseData = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    setCourseData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', description: '', lessons: [] }]
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const addLesson = (moduleIndex: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex 
          ? { ...module, lessons: [...module.lessons, { title: '', type: 'video', content: '' }] }
          : module
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Här skulle vi skicka data till API
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurstitel *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => updateCourseData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="t.ex. Functional Foods Grundkurs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kort beskrivning *
              </label>
              <textarea
                value={courseData.shortDescription}
                onChange={(e) => updateCourseData('shortDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="En kort beskrivning som visas i kursöversikten..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaljerad beskrivning *
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => updateCourseData('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detaljerad beskrivning av kursen, vad deltagarna kommer att lära sig..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={courseData.category}
                onChange={(e) => updateCourseData('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Välj kategori</option>
                <option value="functional-foods">Functional Foods</option>
                <option value="nutrition">Näringslära</option>
                <option value="health">Hälsa & Välmående</option>
                <option value="lifestyle">Livsstil</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivå *
                </label>
                <select
                  value={courseData.level}
                  onChange={(e) => updateCourseData('level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Nybörjare</option>
                  <option value="intermediate">Medel</option>
                  <option value="advanced">Avancerad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varaktighet *
                </label>
                <input
                  type="text"
                  value={courseData.duration}
                  onChange={(e) => updateCourseData('duration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="t.ex. 6 veckor"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pris (SEK) *
              </label>
              <input
                type="number"
                value={courseData.price}
                onChange={(e) => updateCourseData('price', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kursbild URL
              </label>
              <input
                type="url"
                value={courseData.image}
                onChange={(e) => updateCourseData('image', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kursfunktioner
              </label>
              <div className="space-y-3">
                {courseData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="t.ex. Livstidsåtkomst"
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Lägg till funktion
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Kursmoduler</h3>
              <button
                onClick={addModule}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Ny modul
              </button>
            </div>

            {courseData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modultitel
                    </label>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="t.ex. Vecka 1: Introduktion"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modulbeskrivning
                    </label>
                    <textarea
                      value={module.description}
                      onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Beskrivning av vad som täcks i denna modul..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Lektioner
                      </label>
                      <button
                        onClick={() => addLesson(moduleIndex)}
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        Ny lektion
                      </button>
                    </div>

                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="border border-gray-100 rounded-lg p-4 mb-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Lektionstitel
                            </label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => {
                                const newLessons = [...module.lessons];
                                newLessons[lessonIndex] = { ...lesson, title: e.target.value };
                                updateModule(moduleIndex, 'lessons', newLessons);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Lektionstitel"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Typ
                            </label>
                            <select
                              value={lesson.type}
                              onChange={(e) => {
                                const newLessons = [...module.lessons];
                                newLessons[lessonIndex] = { ...lesson, type: e.target.value as any };
                                updateModule(moduleIndex, 'lessons', newLessons);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="video">Video</option>
                              <option value="text">Text</option>
                              <option value="quiz">Quiz</option>
                              <option value="download">Nedladdning</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Innehåll/URL
                          </label>
                          <input
                            type="text"
                            value={lesson.content}
                            onChange={(e) => {
                              const newLessons = [...module.lessons];
                              newLessons[lessonIndex] = { ...lesson, content: e.target.value };
                              updateModule(moduleIndex, 'lessons', newLessons);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Video URL, text innehåll eller fil URL"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Krav & Förutsättningar
              </label>
              <div className="space-y-3">
                {courseData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const newReqs = [...courseData.requirements];
                        newReqs[index] = e.target.value;
                        updateCourseData('requirements', newReqs);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="t.ex. Grundläggande kunskaper om näring"
                    />
                    <button
                      onClick={() => {
                        const newReqs = courseData.requirements.filter((_, i) => i !== index);
                        updateCourseData('requirements', newReqs);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateCourseData('requirements', [...courseData.requirements, ''])}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Lägg till krav
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lärandemål
              </label>
              <div className="space-y-3">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => {
                        const newOutcomes = [...courseData.learningOutcomes];
                        newOutcomes[index] = e.target.value;
                        updateCourseData('learningOutcomes', newOutcomes);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="t.ex. Förstå grunderna i functional foods"
                    />
                    <button
                      onClick={() => {
                        const newOutcomes = courseData.learningOutcomes.filter((_, i) => i !== index);
                        updateCourseData('learningOutcomes', newOutcomes);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateCourseData('learningOutcomes', [...courseData.learningOutcomes, ''])}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Lägg till lärandemål
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kursöversikt</h3>
              <div className="space-y-3">
                <div><strong>Titel:</strong> {courseData.title}</div>
                <div><strong>Kategori:</strong> {courseData.category}</div>
                <div><strong>Nivå:</strong> {courseData.level}</div>
                <div><strong>Varaktighet:</strong> {courseData.duration}</div>
                <div><strong>Pris:</strong> {courseData.price} SEK</div>
                <div><strong>Moduler:</strong> {courseData.modules.length} st</div>
                <div><strong>Funktioner:</strong> {courseData.features.length} st</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <FiCheck className="w-5 h-5" />
                <span className="font-medium">Redo att publicera</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Kursen kommer att vara synlig för användare direkt efter publicering.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/courses"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Tillbaka till kurser
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Skapa ny kurs</h1>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step.id < currentStep 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <FiCheck className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Föregående
          </button>

          {currentStep === steps.length ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sparar...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Publicera kurs
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nästa
              <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 