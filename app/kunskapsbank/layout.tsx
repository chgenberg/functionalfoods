import { generateMetadata as generateSEOMetadata } from '../lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = generateSEOMetadata({
  title: 'Kunskapsbank - Recept, Artiklar och Poddar',
  description: 'Utforska Functional Foods kunskapsbank med recept, artiklar, poddar och frågor & svar för bättre hälsa.',
  keywords: [
    'kunskapsbank',
    'recept',
    'poddar',
    'functional foods',
    'hälsa',
    'artiklar',
    'näring'
  ],
  type: 'website'
});

export default function KunskapsbankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
