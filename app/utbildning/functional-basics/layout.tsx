import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Functional Basics - Kurs i Functional Foods',
  description:
    'Functional Basics är grundkursen i functional foods med recept, måltidsplanering och praktiska verktyg för bättre hälsa.',
  keywords: [
    'functional basics',
    'kurs',
    'functional foods',
    'hälsa',
    'måltidsplanering',
  ],
  url: '/utbildning/functional-basics',
  image: '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
  type: 'website',
});

export default function FunctionalBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
