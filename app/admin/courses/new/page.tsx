"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiCheck, FiBook, FiClock, FiUsers, FiTarget, FiImage, FiSave } from 'react-icons/fi';

export default function NewCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '4 weeks',
    objectives: [''],
    targetAudience: '',
    coverImage: '',
    modules: [{ title: '', description: '', lessons: [''] }],
  });

  const steps = [
    { number: 1, title: 'Grundinfo', icon: FiBook },
    { number: 2, title: 'Detaljer', icon: FiTarget },
    { number: 3, title: 'Moduler', icon: FiUsers },
    { number: 4, title: 'Media', icon: FiImage },
    { number: 5, title: 'Granska', icon: FiCheck },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        alert(error.error || 'Ett fel uppstod');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Ett fel uppstod vid skapande av kurs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addObjective = () => {
    setCourseData({
      ...courseData,
      objectives: [...courseData.objectives, ''],
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...courseData.objectives];
    newObjectives[index] = value;
    setCourseData({ ...courseData, objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    setCourseData({
      ...courseData,
      objectives: courseData.objectives.filter((_, i) => i !== index),
    });
  };

  const addModule = () => {
    setCourseData({
      ...courseData,
      modules: [...courseData.modules, { title: '', description: '', lessons: [''] }],
    });
  };

  const updateModule = (index: number, field: string, value: string) => {
    const newModules = [...courseData.modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setCourseData({ ...courseData, modules: newModules });
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...courseData.modules];
    newModules[moduleIndex].lessons.push('');
    setCourseData({ ...courseData, modules: newModules });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, value: string) => {
    const newModules = [...courseData.modules];
    newModules[moduleIndex].lessons[lessonIndex] = value;
    setCourseData({ ...courseData, modules: newModules });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft />
            Tillbaka
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Skapa ny kurs</h1>
          <p className="text-gray-600 mt-2">Fyll i informationen steg för steg</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      currentStep >= step.number
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-full mx-2 transition-all ${
                        currentStep > step.number ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step.number}
                className={`text-sm ${
                  currentStep >= step.number ? 'text-orange-600 font-medium' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Grundläggande information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kursnamn *
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="T.ex. Functional Foods Masterclass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Beskriv vad deltagarna kommer lära sig..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivå
                  </label>
                  <select
                    value={courseData.level}
                    onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Beginner">Nybörjare</option>
                    <option value="Intermediate">Medel</option>
                    <option value="Advanced">Avancerad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Längd
                  </label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={courseData.duration}
                      onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="T.ex. 6 veckor"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Kursmål och målgrupp</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kursmål
                </label>
                <p className="text-sm text-gray-500 mb-3">Vad kommer deltagarna kunna efter kursen?</p>
                {courseData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="T.ex. Förstå grunderna i functional foods"
                    />
                    {courseData.objectives.length > 1 && (
                      <button
                        onClick={() => removeObjective(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addObjective}
                  className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Lägg till mål
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Målgrupp
                </label>
                <textarea
                  value={courseData.targetAudience}
                  onChange={(e) => setCourseData({ ...courseData, targetAudience: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Beskriv vem kursen är för..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Kursmoduler</h2>
              
              {courseData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Modul {moduleIndex + 1}</h3>
                  
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
                    placeholder="Modultitel"
                  />
                  
                  <textarea
                    value={module.description}
                    onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-3"
                    placeholder="Modulbeskrivning"
                  />
                  
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Lektioner:</p>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <input
                        key={lessonIndex}
                        type="text"
                        value={lesson}
                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-1 text-sm"
                        placeholder={`Lektion ${lessonIndex + 1}`}
                      />
                    ))}
                    <button
                      onClick={() => addLesson(moduleIndex)}
                      className="mt-1 text-sm text-orange-600 hover:text-orange-700"
                    >
                      + Lägg till lektion
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addModule}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600"
              >
                + Lägg till modul
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Media och bilder</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Omslagsbild URL
                </label>
                <input
                  type="url"
                  value={courseData.coverImage}
                  onChange={(e) => setCourseData({ ...courseData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {courseData.coverImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Förhandsvisning:</p>
                  <img
                    src={courseData.coverImage}
                    alt="Course preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/400/200';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Granska och publicera</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">{courseData.title || 'Ingen titel'}</h3>
                <p className="text-gray-600 mb-4">{courseData.description || 'Ingen beskrivning'}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nivå:</span> {courseData.level}
                  </div>
                  <div>
                    <span className="font-medium">Längd:</span> {courseData.duration}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Antal moduler:</span> {courseData.modules.length}
                  </div>
                </div>

                {courseData.objectives.filter(o => o).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Kursmål:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {courseData.objectives.filter(o => o).map((objective, index) => (
                        <li key={index} className="text-gray-600">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>OBS!</strong> Efter publicering kommer kursen vara synlig för alla användare.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft />
            Föregående
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              Nästa
              <FiArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Skapar...
                </>
              ) : (
                <>
                  <FiSave />
                  Skapa kurs
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 