import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Functional Energy - Kurs i Functional Foods',
  description:
    'Functional Energy fokuserar på blodsockerbalans, energi och hållbara matvanor med stöd av functional foods.',
  keywords: [
    'functional energy',
    'blodsockerbalans',
    'energi',
    'functional foods kurs',
    'kost',
  ],
  url: '/utbildning/functional-energy',
  type: 'website',
});

export default function FunctionalEnergyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
