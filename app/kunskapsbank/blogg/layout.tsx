import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Artiklar - Kunskapsbank',
  description:
    'Läs artiklar om functional foods, hälsa och longevity med evidensbaserade råd, guider och fördjupning.',
  keywords: [
    'artiklar',
    'blogg',
    'kunskapsbank',
    'functional foods',
    'hälsa',
    'longevity',
  ],
  type: 'website',
});

export default function BloggLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
