import { generateMetadata as generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Recept - Kunskapsbank',
  description:
    'Utforska recept inom functional foods med näringsrika måltider för vardag, energi, mage och långsiktig hälsa.',
  keywords: [
    'recept',
    'kunskapsbank',
    'functional foods',
    'hälsosamma recept',
    'näring',
  ],
  type: 'website',
});

export default function ReceptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
