'use client';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Heart, Trophy, Target, Star } from 'lucide-react';
import Link from 'next/link';

// Week Info Section Component
export function WeekInfoSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vecka 6 - Grattis, du har klarat kursen!</h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Du har lärt dig så mycket!</h3>
          <p className="leading-relaxed">
            Nu har du nått sista veckan av kursen, och du har lärt dig att laga mat som stödjer både din maghälsa och blodsockerkontroll. Du har fått massor av nya recept och kunskap som du kan använda för att fortsätta ta hand om din hälsa i framtiden.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">Reflektera över din resa</h3>
          <p className="leading-relaxed">
            Förhoppningsvis märker du positiva förändringar – jämför gärna hur du upplevde din kropp och blodsockernivå när du startade kursen och reflektera över de framsteg du har gjort.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#014421] mb-3">En livsstil för framtiden</h3>
          <p className="leading-relaxed">
            Nu är det dags att fortsätta ditt intresse för en hälsosam kost och göra det till en långsiktig livsstil. Genom att göra kostval som stödjer stabilt blodsocker och en balanserad kropp kommer du att må bra både nu och i framtiden.
          </p>
        </div>
      </div>
    </div>
  );
}

// Celebration Section
export function CelebrationSection() {
  return (
    <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-3xl p-6 md:p-8 text-center">
      <Trophy className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Fantastiskt jobbat!</h3>
      <p className="text-gray-700 mb-6">
        Du har genomfört 6 veckor av hälsosam kost och livsstilsförändringar. 
        Det är en stor prestation som kommer att gynna din hälsa långt framöver!
      </p>
      <Link href="/dashboard/courses/functional-energy/avslutning">
        <button className="bg-[#014421] text-white px-8 py-3 rounded-full font-bold hover:bg-[#116530] transition-colors">
          Gå till kursavslutning
        </button>
      </Link>
    </div>
  );
}

// Future Goals Section
export function FutureGoalsSection() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-6 h-6 text-[#014421]" />
        Mål för framtiden
      </h3>
      <p className="text-gray-700 mb-4">
        Sätt upp långsiktiga mål för att bibehålla dina nya vanor:
      </p>
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-start gap-2">
          <Star className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <span>Fortsätt med måltidsplanering varje vecka</span>
        </li>
        <li className="flex items-start gap-2">
          <Star className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <span>Experimentera med nya recept baserat på kursens principer</span>
        </li>
        <li className="flex items-start gap-2">
          <Star className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <span>Håll koll på ditt blodsocker och energinivåer</span>
        </li>
        <li className="flex items-start gap-2">
          <Star className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <span>Dela din kunskap med familj och vänner</span>
        </li>
      </ul>
    </div>
  );
}
