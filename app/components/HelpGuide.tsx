'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, ShoppingCart, Settings, Users, Award, Clock, CheckCircle } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#014421] to-[#116530] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">?</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Dashboard Guide</h2>
                  <p className="text-white/80">Lär dig navigera din kurs effektivt</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Navigation Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#014421]" />
                  Navigation
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Översikt</div>
                      <div className="text-sm text-gray-600">Se din framsteg och kursöversikt</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Vecka 1-6</div>
                      <div className="text-sm text-gray-600">Klicka för att öppna specifik vecka</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Avslutning</div>
                      <div className="text-sm text-gray-600">Slutför kursen och få certifikat</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#014421]" />
                  Funktioner
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-[#014421]" />
                    <div>
                      <div className="font-medium text-gray-900">Daglig meny</div>
                      <div className="text-sm text-gray-600">Klicka på en dag för recept och näringsvärden</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-[#014421]" />
                    <div>
                      <div className="font-medium text-gray-900">Inköpslistor</div>
                      <div className="text-sm text-gray-600">Smarta listor för varje vecka</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-[#014421]" />
                    <div>
                      <div className="font-medium text-gray-900">Favoritrecept</div>
                      <div className="text-sm text-gray-600">Stjärnmärk och ladda ner som PDF</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Users className="w-5 h-5 text-[#014421]" />
                    <div>
                      <div className="font-medium text-gray-900">Community</div>
                      <div className="text-sm text-gray-600">Diskutera med andra deltagare</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#F7F1E8] to-[#F3EFE3] rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#014421]" />
                Statusfärger
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Grön</div>
                    <div className="text-xs text-gray-600">Nuvarande vecka</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Blå</div>
                    <div className="text-xs text-gray-600">Klar vecka</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Grå</div>
                    <div className="text-xs text-gray-600">Låst vecka</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-6 bg-white border-2 border-[#014421]/10 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#014421]" />
                Snabbtips
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <strong>Börja alltid med Översikt</strong> för att se din framsteg</p>
                <p>• <strong>Klicka på dagar</strong> för att se dagens måltider och recept</p>
                <p>• <strong>Stjärnmärk favoritrecept</strong> genom att klicka på ⭐ i dag-popupen</p>
                <p>• <strong>Ladda ner inköpslistor</strong> för varje vecka</p>
                <p>• <strong>Använd Community</strong> för att ställa frågor och dela tips</p>
                <p>• <strong>Inställningar</strong> för att uppdatera din profil och preferenser</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Behöver du mer hjälp? Kontakta oss på <a href="mailto:info@functionalfoods.se" className="text-[#014421] font-medium hover:underline">info@functionalfoods.se</a>
              </div>
              <button
                onClick={onClose}
                className="bg-[#014421] text-white px-6 py-2 rounded-full font-medium hover:bg-[#116530] transition-colors"
              >
                Förstått!
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 