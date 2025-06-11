"use client";
import dynamic from 'next/dynamic';
import { FiMapPin, FiClock, FiPhone, FiMail, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';

// Dynamically import the map component with no SSR
const Map = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
      <FiMapPin className="w-12 h-12 text-gray-300" />
    </div>
  ),
});

export default function AdressPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const contactInfo = [
    {
      icon: FiMapPin,
      title: "Postadress",
      content: ["Functional Foods", "Box 6211", "102 34 Stockholm"]
    },
    {
      icon: FiPhone,
      title: "Telefon",
      content: ["+46 XX XXX XX XX"]
    },
    {
      icon: FiMail,
      title: "E-post",
      content: ["info@functionalfoods.se"]
    },
    {
      icon: FiClock,
      title: "Öppettider",
      content: ["Måndag - Fredag: 09:00 - 17:00", "Lördag - Söndag: Stängt"]
    }
  ];

  const position: LatLngExpression = [59.3293, 18.0686]; // Stockholm coordinates

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
            Hitta oss
          </h1>
          <p className="text-lg text-text-secondary">
            Besök oss i Stockholm eller kontakta oss via telefon eller e-post
          </p>
        </div>

        {/* Map and Contact Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
            {mapLoaded && (
              <Map
                key={mapKey}
                position={position}
                zoom={13}
                className="h-full w-full"
              />
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-light text-primary mb-6 flex items-center">
              <FiMapPin className="w-5 h-5 text-accent mr-3" />
              Kontaktinformation
            </h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {info.icon && <info.icon className="w-5 h-5 text-accent" />}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-primary mb-1">{info.title}</h3>
                    {info.content.map((line, i) => (
                      <p key={i} className="text-text-secondary">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 