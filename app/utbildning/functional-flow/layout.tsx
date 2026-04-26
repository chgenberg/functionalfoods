import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Functional Flow - Kurs i Functional Foods',
  description:
    'Functional Flow hjälper dig stärka tarmhälsa, matsmältning och energi med evidensbaserad kost och praktiska recept.',
  keywords: [
    'functional flow',
    'tarmhälsa',
    'matsmältning',
    'functional foods kurs',
    'hälsa',
  ],
  url: '/utbildning/functional-flow',
  image: '/Kurser_bilder/Functional_Gut Health.jpg',
  type: 'website',
});

export default function FunctionalFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
