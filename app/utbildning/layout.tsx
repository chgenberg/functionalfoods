import { generateMetadata as generateSEOMetadata } from '../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Utbildning - Kurser i Functional Foods',
  description: 'Upptäck våra evidensbaserade kurser i functional foods. Från grundläggande näringslära till avancerad hälsooptimering med Ulrika Davidsson.',
  keywords: [
    'utbildning',
    'kurser',
    'functional foods',
    'näringslära',
    'hälsokost',
    'Ulrika Davidsson',
    'onlinekurs',
    'hälsa'
  ],
  url: '/utbildning',
  type: 'website'
});

export default function UtbildningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 