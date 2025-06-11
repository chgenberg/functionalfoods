"use client";
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiArrowLeft, FiSearch, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const faqSections = [
    {
      title: "Övergripande",
      questions: [
        {
          q: "Vad menas egentligen med functional foods?",
          a: "Functional foods (mervärdesmat) är naturliga livsmedel som – utöver basnäring – tillför hälsofrämjande ämnen som antioxidanter, probiotika eller omega-3."
        },
        {
          q: "Vem står bakom sajten?",
          a: "Functional Foods drivs av Ulrika Davidsson och hennes team på Ulrikas Kickstart AB."
        },
        {
          q: "Hur skiljer sig era program från vanliga kost- och receptsajter?",
          a: "Du får strukturerade onlinekurser med måltidsplaner, inköpslistor, videolektioner och coachning – inte bara fristående recept."
        }
      ]
    },
    {
      title: "Kurser & innehåll",
      questions: [
        {
          q: "Vilka kurser erbjuder ni?",
          a: "– Functional Basics – ger grunderna i functional foods.\n– Functional Flow – fokuserar på maghälsa och antiinflammatorisk kost."
        },
        {
          q: "Vad ingår i Functional Basics?",
          a: "Recept, måltidsplaner, inköpslistor samt videolektioner som lär dig laga näringsrik mat och bygga hållbara vanor."
        },
        {
          q: "Vad ingår i Functional Flow?",
          a: "Verktyg för att stötta tarmfloran, minska inflammation och ge jämn energi – inklusive recept, inköpslistor och måltidsplaner."
        },
        {
          q: "Är kurserna helt online?",
          a: "Ja, allt material (videor, pdf:er och recept) finns digitalt så att du kan gå i egen takt."
        },
        {
          q: "Hur länge har jag tillgång till kursmaterialet?",
          a: "Du behåller åtkomst i minst 12 månader från köpet (förlängs ibland vid kampanjer)."
        },
        {
          q: "Behöver jag några förkunskaper?",
          a: "Nej – kurserna börjar på grundnivå men innehåller fördjupning för den som vill."
        },
        {
          q: "Ingår personlig coachning?",
          a: "Ja, varje kurs innehåller schemalagda Q&A-träffar eller ett modererat forum där Ulrika svarar."
        },
        {
          q: "Får jag ett intyg efter avslutad kurs?",
          a: "Du kan ladda ned ett digitalt diplom när du fullföljt alla moduler."
        }
      ]
    },
    {
      title: "Recept & specialkost",
      questions: [
        {
          q: "Var hittar jag gratis recept?",
          a: "Under huvudmenyn Recept ligger ett bibliotek fritt att söka i."
        },
        {
          q: "Är recepten gluten- eller laktosfria?",
          a: "Många är helt naturligt fria från gluten och laktos; filtrera efter allergen i receptbanken."
        },
        {
          q: "Kan jag följa programmen som vegetarian eller vegan?",
          a: "Ja, båda kurserna har växtbaserade alternativ – men vissa kapitel innehåller animaliskt protein som kan bytas ut."
        },
        {
          q: "Jag är gravid/ammar – är kurserna lämpliga?",
          a: "Rådgör alltid med barnmorska, men konceptet bygger på näringsrik, naturlig mat utan extrema kalorirestriktioner."
        },
        {
          q: "Kan jag kombinera programmet med periodisk fasta?",
          a: "Ja – sexveckorsschemat inkluderar periodisk fasta som en valfri komponent."
        }
      ]
    },
    {
      title: "Beställningar & betalning",
      questions: [
        {
          q: "Hur anmäler jag mig till en kurs?",
          a: "Klicka på 'Se kursutbudet' på startsidan, välj kurs och följ checkout-flödet. Följ instruktionerna på skärmen för att slutföra din anmälan."
        },
        {
          q: "Vilka betalningssätt accepterar ni?",
          a: "Kort (Visa/Mastercard), Swish och Klarna. Vid faktura – kontakta support."
        },
        {
          q: "Har ni öppet köp?",
          a: "Ja, 14 dagar enligt distanshandelslagen – om du inte laddat ned mer än 20 % av materialet."
        },
        {
          q: "Kan jag köpa kursen som present?",
          a: "Absolut – välj 'Ge bort som gåva' i kassan så får du ett presentkort via mejl."
        },
        {
          q: "Hur beställer jag boken Functional Foods?",
          a: "Klicka på 'Beställ boken här' på hemsidan; du skickas då vidare till återförsäljaren The Book Affair som hanterar betalning och frakt."
        },
        {
          q: "Skickar ni internationellt?",
          a: "Ja, kurserna är digitala. Boken skickas inom EU; övriga länder enligt återförsäljarens villkor."
        }
      ]
    },
    {
      title: "Tekniskt & support",
      questions: [
        {
          q: "Videon spelas inte upp – vad gör jag?",
          a: "Kontrollera webbläsarens inställningar för cookies och tredjepartsskript; sajten kräver tillåtna funktionscookies för video."
        },
        {
          q: "Hur kontaktar jag er?",
          a: "Fyll i formuläret under Kontakt eller mejla support@functionalfoods.se."
        }
      ]
    }
  ];

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSections = searchQuery
    ? faqSections.map(section => ({
        ...section,
        questions: section.questions.filter(
          q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.questions.length > 0)
    : faqSections;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Back Link */}
        <Link href="/kontakt" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors">
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kontakt
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
            Vanliga <span className="text-gradient">frågor</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Hitta svar på de vanligaste frågorna om våra kurser och functional foods
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök bland frågor..."
              className="w-full px-6 py-3 pl-12 rounded-2xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-xl transition-all duration-200"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredSections.map((section, sectionIndex) => (
            <div 
              key={sectionIndex} 
              className="animate-fade-in"
              style={{ animationDelay: `${0.3 + sectionIndex * 0.1}s` }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6 flex items-center tracking-wide uppercase letter-spacing-wider">
                <FiMessageCircle className="w-6 h-6 text-accent mr-3" />
                {section.title}
              </h2>
              
              <div className="space-y-4">
                {section.questions.map((item, index) => {
                  const key = `${sectionIndex}-${index}`;
                  const isOpen = openItems[key];
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between group"
                      >
                        <h3 className="text-lg font-medium text-primary group-hover:text-accent transition-colors pr-4">
                          {item.q}
                        </h3>
                        {isOpen ? (
                          <FiChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400 group-hover:text-accent flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-text-secondary whitespace-pre-line">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredSections.length === 0 && (
          <div className="text-center py-12">
            <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-text-secondary">Inga frågor hittades för "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-accent hover:underline mt-2"
            >
              Rensa sökning
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-3">Hittade du inte svaret?</h2>
            <p className="text-text-secondary mb-6">
              Kontakta oss så hjälper vi dig med dina frågor om functional foods och våra kurser.
            </p>
            <Link href="/kontakt/formular" className="btn-primary inline-flex items-center">
              Kontakta oss
              <FiArrowLeft className="ml-2 w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 