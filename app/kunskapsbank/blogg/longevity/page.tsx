import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiCalendar, FiShare2, FiBookmark } from 'react-icons/fi';

export default function LongevityBlogPost() {
  return (
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image
          src="/longevity.png"
          alt="Longevity"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-8 left-8">
          <Link href="/kunskapsbank/blogg" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            <span>Tillbaka till bloggen</span>
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container-custom">
            <div className="max-w-4xl">
              <span className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                Longevity
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4">
                Timing & kombinerings-hacks som förlänger din hälsa
              </h1>
              <div className="flex items-center gap-6 text-white/80">
                <span className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  10 januari 2024
                </span>
                <span className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  7 min läsning
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Share buttons */}
          <div className="flex justify-end gap-4 mb-8">
            <button className="p-3 rounded-full bg-background-secondary hover:bg-gray-200 transition-colors">
              <FiShare2 className="w-5 h-5 text-text-secondary" />
            </button>
            <button className="p-3 rounded-full bg-background-secondary hover:bg-gray-200 transition-colors">
              <FiBookmark className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Det är inte bara vad du äter utan när och tillsammans med vad som avgör hur mycket kroppen faktiskt kan tillgodogöra sig. 
              Här är tre longevity-principer från krononutrition + nutrient synergy.
            </p>

            <h2 className="text-3xl font-light mb-6 text-primary">1. Front-loada färg & fibrer före kl 15</h2>
            
            <div className="bg-background-secondary rounded-2xl p-8 mb-8">
              <p className="text-lg mb-4 text-text-secondary">
                Dagtid är magen och bukspottkörteln mest mottagliga.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-accent font-bold mr-3">•</span>
                  <div>
                    <strong className="text-primary">Varför?</strong> Blodsocker-toppar dämpas, tarmfloran får "frukost" tidigt → jämn energi.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-accent font-bold mr-3">•</span>
                  <div>
                    <strong className="text-primary">Så gör du:</strong> Starta dagen med grön smoothie + valnötter; lunch med minst 3 färger på tallriken.
                  </div>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-light mb-6 text-primary">2. Bygg "anti-inflammatoriska duos"</h2>

            <div className="overflow-x-auto mb-12">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-accent">
                    <th className="text-left py-4 px-4 text-lg font-medium">Duo</th>
                    <th className="text-left py-4 px-4 text-lg font-medium">Synergieffekt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Gurkmeja + Svartpeppar</td>
                    <td className="py-4 px-4 text-text-secondary">Piperin ökar curcumin-upptag ×20.</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Broccoli + Senapsfrön</td>
                    <td className="py-4 px-4 text-text-secondary">Myrosinas i frön aktiverar sulforafan i broccolin.</td>
                  </tr>
                  <tr className="hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Tomat + Olivolja</td>
                    <td className="py-4 px-4 text-text-secondary">Fettet fyrdubblar lycopen-upptag.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-light mb-6 text-primary">3. 12-timmars nattfastan</h2>

            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg mb-8">
              <p className="text-lg font-medium text-primary mb-2">Ge mitokondrierna vilopaus.</p>
              <ul className="space-y-2 text-text-secondary">
                <li><strong>Regel:</strong> Ät sista tuggan kl 19 → frukost tidigast kl 07.</li>
                <li><strong>Bonus:</strong> Förbättrad insulin­känslighet och cell­städning (autofagi).</li>
              </ul>
            </div>

            <div className="bg-primary text-white rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-light mb-4">Avslut</h3>
              <p className="mb-4">
                Små justeringar i tajming och kombination kan ge lika stor effekt som stora kostomläggningar. 
              </p>
              <p>
                Testa en princip i taget; logga sömn, energi och magkänsla i två veckor – låt sedan din kropp rösta på vilka longevity-hacks som blir permanenta.
              </p>
            </div>
          </div>

          {/* Author section */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl font-medium text-accent">UD</span>
              </div>
              <div>
                <h3 className="font-medium text-primary">Ulrika Davidsson</h3>
                <p className="text-text-secondary">Grundare av Functional Foods</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex justify-between items-center">
            <Link href="/kunskapsbank/blogg/functional-foods" className="btn-secondary">
              ← Föregående artikel
            </Link>
            <Link href="/kunskapsbank/blogg" className="btn-primary">
              Tillbaka till bloggen →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
} 