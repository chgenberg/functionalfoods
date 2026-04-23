import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Hormonell Balans - Kurs i Functional Foods',
  description:
    'Kursen Hormonell Balans ger strategier för kost, återhämtning och livsstil för att stödja hormonell hälsa.',
  keywords: [
    'hormonell balans',
    'functional foods',
    'kvinnors hälsa',
    'hormoner',
    'kurs',
  ],
  url: '/utbildning/hormonell-balans',
  image: '/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif',
  type: 'website',
});

export default function HormonellBalansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
