import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Prova På Vecka - Functional Foods',
  description:
    'Prova På Vecka ger en introduktion till functional foods med recept, struktur och verktyg för att komma igång direkt.',
  keywords: [
    'prova på vecka',
    'functional foods',
    'kurs',
    'recept',
    'kom igång',
  ],
  url: '/utbildning/prova-pa-vecka',
  type: 'website',
});

export default function ProvaPaVeckaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
