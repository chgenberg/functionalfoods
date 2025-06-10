import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark } from 'lucide-react';

export default function FunctionalFoodsBlogPost() {
  return (
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image
          src="/functional.png"
          alt="Functional Foods"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-8 left-8">
          <Link href="/kunskapsbank/blogg" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka till bloggen</span>
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container-custom">
            <div className="max-w-4xl">
              <span className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                Functional Foods
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4">
                5 Functional Food-stjärnor för långsiktigt välmående
              </h1>
              <div className="flex items-center gap-6 text-white/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  15 januari 2024
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  5 min läsning
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
              <Share2 className="w-5 h-5 text-text-secondary" />
            </button>
            <button className="p-3 rounded-full bg-background-secondary hover:bg-gray-200 transition-colors">
              <Bookmark className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Functional Foods är livsmedel som innehåller naturliga bioaktiva ämnen som gör mer än att bara mätta – de aktivt främjar hälsa. 
              Här är fem stjärnor som ger mest "bang for the bite" när du satsar på hållbart välmående.
            </p>

            {/* Table */}
            <div className="overflow-x-auto mb-12">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-accent">
                    <th className="text-left py-4 px-4 text-lg font-medium">⭐ Stjärna</th>
                    <th className="text-left py-4 px-4 text-lg font-medium">Varför den är guld värd</th>
                    <th className="text-left py-4 px-4 text-lg font-medium">Så får du in den varje dag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Blåbär</td>
                    <td className="py-4 px-4 text-text-secondary">Antocyaniner skyddar kärl & hjärna, stabiliserar blodsocker.</td>
                    <td className="py-4 px-4 text-text-secondary">1 dl i frukost-skål eller frys in som "is" till smoothies.</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Surkål</td>
                    <td className="py-4 px-4 text-text-secondary">Naturlig probiotika → stärker tarmfloran & immunförsvaret.</td>
                    <td className="py-4 px-4 text-text-secondary">En matsked som syrlig "topping" på varma rätter eller i sallad.</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Gurkmeja</td>
                    <td className="py-4 px-4 text-text-secondary">Curcumin dämpar låggradig inflammation & stödjer levern.</td>
                    <td className="py-4 px-4 text-text-secondary">Vispa ned ½ tsk i soppa, gryta eller "golden milk". Tillsätt svartpeppar för bättre upptag.</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Spenat</td>
                    <td className="py-4 px-4 text-text-secondary">Rik på folat, K-vitamin & nitrater som gynnar blodkärl & ork.</td>
                    <td className="py-4 px-4 text-text-secondary">Häll en näve i smoothie, omelett eller som bas i sallad.</td>
                  </tr>
                  <tr className="hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-4 font-medium">Valnötter</td>
                    <td className="py-4 px-4 text-text-secondary">Bästa vegetabiliska källan till omega-3 (ALA) + polyfenoler.</td>
                    <td className="py-4 px-4 text-text-secondary">30 g som mellis, hackade i gröt eller rostade över soppa.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-light mb-6 text-primary">Så här bygger du en vana</h2>
            
            <div className="bg-background-secondary rounded-2xl p-8 mb-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-accent font-bold mr-3">•</span>
                  <div>
                    <strong className="text-primary">Mikro-mål</strong> – välj ett livsmedel/vecka att "beta in" tills det går på autopilot.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-accent font-bold mr-3">•</span>
                  <div>
                    <strong className="text-primary">Synlighet</strong> – ha blåbär längst fram i frysen, ställ surkålen i ögonhöjd i kylen.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-accent font-bold mr-3">•</span>
                  <div>
                    <strong className="text-primary">Parning</strong> – kombinera med befintliga rutiner (ex: valnötter när du brygger kaffe).
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
              <p className="text-lg font-medium text-primary mb-2">Bottom line:</p>
              <p className="text-text-secondary">
                Med fem enkla staples får du antioxidanter, fibrer och anti-inflammatorisk power som gör skillnad år efter år.
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
            <Link href="/kunskapsbank/blogg" className="btn-secondary">
              ← Tillbaka till bloggen
            </Link>
            <Link href="/kunskapsbank/blogg/longevity" className="btn-primary">
              Nästa artikel →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
} 