"use client";
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Mail, Clock, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

export default function Adress() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Fix för Leaflet ikoner i Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });

    // Initiera kartan
    const map = L.map('map').setView([59.3293, 18.0686], 15);

    // Lägg till OpenStreetMap-lager med custom styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles'
    }).addTo(map);

    // Custom marker
    const customIcon = L.divIcon({
      html: `<div class="custom-marker">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#D97757"/>
        </svg>
      </div>`,
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Lägg till markör
    L.marker([59.3293, 18.0686], { icon: customIcon })
      .addTo(map)
      .bindPopup('<div class="font-medium">Functional Foods</div><div class="text-sm text-gray-600">Box 6211, Stockholm</div>')
      .openPopup();

    setMapLoaded(true);

    // Städa upp när komponenten unmountas
    return () => {
      map.remove();
    };
  }, []);

  const contactInfo = [
    {
      icon: Building,
      title: "Postadress",
      content: ["Functional Foods", "Box 6211", "102 34 Stockholm"]
    },
    {
      icon: Phone,
      title: "Telefon",
      content: ["+46 XX XXX XX XX"]
    },
    {
      icon: Mail,
      title: "E-post",
      content: ["info@functionalfoods.se"]
    },
    {
      icon: Clock,
      title: "Öppettider",
      content: ["Måndag - Fredag: 09:00 - 17:00", "Lördag - Söndag: Stängt"]
    }
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Back Link */}
        <Link href="/kontakt" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kontakt
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
            Hitta <span className="text-gradient">oss</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Välkommen att besöka oss eller kontakta oss via telefon och e-post
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-light text-primary mb-6 flex items-center">
                <MapPin className="w-6 h-6 text-accent mr-3" />
                Kontaktinformation
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-accent/10 rounded-lg p-3">
                      <info.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary mb-1">{info.title}</h3>
                      {info.content.map((line, i) => (
                        <p key={i} className="text-text-secondary">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact CTA */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-medium text-primary mb-3">Snabbkontakt</h3>
              <p className="text-text-secondary mb-4">
                Har du frågor eller vill du boka ett möte? Kontakta oss direkt.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/kontakt/formular" className="btn-primary flex-1 text-center">
                  Kontaktformulär
                </Link>
                <a href="mailto:info@functionalfoods.se" className="btn-secondary flex-1 text-center">
                  Skicka e-post
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full min-h-[500px] relative">
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div id="map" className="w-full h-full min-h-[500px] z-0"></div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-light text-primary mb-4">Tillgänglighet</h2>
            <p className="text-text-secondary mb-6">
              Våra lokaler är fullt tillgängliga med hiss och anpassade för rullstol. 
              Parkering finns i närområdet och kollektivtrafik stannar inom 5 minuters gångavstånd.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center text-text-secondary">
                <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                Handikappanpassat
              </div>
              <div className="flex items-center text-text-secondary">
                <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                Parkering finns
              </div>
              <div className="flex items-center text-text-secondary">
                <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                Nära kollektivtrafik
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .custom-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .leaflet-popup-content {
          margin: 12px;
          font-family: inherit;
        }
        .map-tiles {
          filter: brightness(1.05) contrast(0.95);
        }
      `}</style>
    </main>
  );
} 