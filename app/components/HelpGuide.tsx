'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, ShoppingCart, Settings, Users, Award, Clock, CheckCircle, Home, Star, FileText, Download, Sparkles } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
  courseType?: 'basics' | 'flow' | 'energy' | 'hormone' | 'prova-pa-vecka';
}

export default function HelpGuide({ isOpen, onClose, courseType }: HelpGuideProps) {
  if (!isOpen) return null;

  const isProvaPaVecka = courseType === 'prova-pa-vecka';

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
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#014421] to-[#116530] text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">?</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {isProvaPaVecka ? 'Prova på-veckan Guide' : 'Dashboard Guide'}
                  </h2>
                  <p className="text-white/90">
                    {isProvaPaVecka 
                      ? 'Din introduktion till Functional Foods' 
                      : 'Lär dig navigera din kurs effektivt'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isProvaPaVecka ? (
                // PROVA PÅ VECKA - Custom content
                <>
                  {/* Welcome message */}
                  <div className="mb-6 p-5 bg-gradient-to-r from-[#93C560]/20 to-[#014421]/10 rounded-2xl border border-[#014421]/10">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-[#014421] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-[#014421] text-lg mb-1">Välkommen till din prova på-vecka!</h3>
                        <p className="text-sm text-gray-700">
                          Under den här veckan får du smaka på Functional Foods med utvalda recept och kunskapsdokument. 
                          Målet är att du ska uppleva hur mervärdesmat kan påverka din energi och ditt välmående.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Navigation Section - Prova på vecka */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#014421]" />
                        Navigation
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-[#F7F1E8] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#014421] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Home className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Översikt</div>
                            <div className="text-sm text-gray-600">Se välkomstvideo och en introduktion till veckan</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-[#F3EFE3] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#116530] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Prova på-veckan</div>
                            <div className="text-sm text-gray-600">7 dagar med måltidsplan, recept och kunskapsdokument</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-[#F7F1E8] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#014421] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Avslutning</div>
                            <div className="text-sm text-gray-600">Summering och nästa steg i din hälsoresa</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features Section - Prova på vecka */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#014421]" />
                        Vad ingår
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <Calendar className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Måltidsplan (7 dagar)</div>
                            <div className="text-sm text-gray-600">Frukost, lunch, middag och mellanmål varje dag</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <ShoppingCart className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Inköpslista</div>
                            <div className="text-sm text-gray-600">Komplett lista för hela veckan</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <FileText className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Kunskapsdokument</div>
                            <div className="text-sm text-gray-600">Lär dig grunderna i Functional Foods</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <Users className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Facebook-community</div>
                            <div className="text-sm text-gray-600">Ställ frågor och få stöd från Team Ulrika</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips - Prova på vecka */}
                  <div className="mt-6 p-6 bg-white border-2 border-[#014421]/20 rounded-2xl">
                    <h3 className="text-lg font-bold text-[#014421] mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#014421]" />
                      Tips för att lyckas
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Handla i förväg</strong> – använd inköpslistan för att ha allt hemma innan veckan startar</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Klicka på måltider</strong> för att se fullständiga recept med ingredienser och instruktioner</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Ladda ner PDF</strong> av recept du gillar för att spara till senare</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Läs kunskapsdokumenten</strong> för att förstå varför maten gör skillnad</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Gå med i Facebook-gruppen</strong> för daglig coachning och stöttning</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Njut av resan!</strong> Detta är en introduktion – känn ingen press</span>
                      </p>
                    </div>
                  </div>

                  {/* What's next */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-[#FF7E70]/10 to-[#FF7E70]/5 rounded-2xl border border-[#FF7E70]/20">
                    <h3 className="text-lg font-bold text-[#014421] mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#FF7E70]" />
                      Efter prova på-veckan
                    </h3>
                    <p className="text-sm text-gray-700">
                      Gillade du upplevelsen? Våra kompletta kurser (6 veckor) ger dig ännu fler recept, 
                      djupare kunskap och personlig coachning för att verkligen förändra din hälsa.
                    </p>
                  </div>
                </>
              ) : (
                // STANDARD COURSES - Original content
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Navigation Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#014421]" />
                        Navigation
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-[#F7F1E8] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#014421] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Home className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Översikt</div>
                            <div className="text-sm text-gray-600">Se din framsteg, kursöversikt och välkomstvideo</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-[#F3EFE3] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#116530] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">1-6</span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Vecka 1-6</div>
                            <div className="text-sm text-gray-600">Varje vecka innehåller måltidsplan, recept och läsning</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-[#F7F1E8] rounded-xl border border-[#014421]/10">
                          <div className="w-8 h-8 bg-[#014421] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#014421]">Avslutning</div>
                            <div className="text-sm text-gray-600">Slutför kursen och få ditt certifikat</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#014421]" />
                        Funktioner
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <Calendar className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Veckans måltider</div>
                            <div className="text-sm text-gray-600">Klicka på en måltid för att se receptet</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <ShoppingCart className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Inköpslistor</div>
                            <div className="text-sm text-gray-600">Ladda ner smarta listor för varje vecka</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <FileText className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Veckans läsning</div>
                            <div className="text-sm text-gray-600">Fördjupa din kunskap med dokument</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#014421]/10">
                          <Users className="w-5 h-5 text-[#014421]" />
                          <div>
                            <div className="font-semibold text-[#014421]">Community</div>
                            <div className="text-sm text-gray-600">Diskutera och dela erfarenheter</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Week Status Indicators */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-[#F7F1E8] to-[#F3EFE3] rounded-2xl border border-[#014421]/10">
                    <h3 className="text-lg font-bold text-[#014421] mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#014421]" />
                      Veckostatus
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-[#014421] rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm text-[#014421]">Mörkgrön</div>
                          <div className="text-xs text-gray-600">Aktiv vecka</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-[#116530]" />
                        <div>
                          <div className="font-medium text-sm text-[#014421]">Grön bock</div>
                          <div className="text-xs text-gray-600">Avklarad vecka</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm text-[#014421]">Grå</div>
                          <div className="text-xs text-gray-600">Kommande vecka</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="mt-6 p-6 bg-white border-2 border-[#014421]/20 rounded-2xl">
                    <h3 className="text-lg font-bold text-[#014421] mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#014421]" />
                      Snabbtips
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Navigera enkelt</strong> med menyn som alltid ligger överst på sidan</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Klicka på måltider</strong> för att se recept och näringsvärden</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Ladda ner PDF</strong> av dina favoritrecept från dag-vyn</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Läs veckans dokument</strong> som finns direkt under välkomstmeddelandet</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Delta i Community</strong> för att ställa frågor och dela tips</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-[#014421] font-bold">•</span>
                        <span><strong>Uppdatera profilen</strong> under Inställningar</span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="p-6 bg-[#F7F1E8] border-t border-[#014421]/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Behöver du mer hjälp? Kontakta oss på <a href="mailto:info@functionalfoods.se" className="text-[#014421] font-semibold hover:text-[#116530] transition-colors">info@functionalfoods.se</a>
              </div>
              <button
                onClick={onClose}
                className="bg-[#014421] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#116530] transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0"
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