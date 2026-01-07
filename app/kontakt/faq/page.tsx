"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FaqAccordion from '@/app/components/FaqAccordion';

export default function FAQ() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        <Link
          href="/kontakt"
          className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kontakt
        </Link>

        <FaqAccordion
          variant="page"
          title="Vanliga frågor & svar"
          subtitle="Hitta snabbt svar på dina frågor om Functional Foods"
          showSearch
        />
      </div>
    </main>
  );
}


