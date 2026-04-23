import { generateMetadata as generateSEOMetadata } from '@/app/lib/seo';
import BrodbokenPageClient from './page.client';

export const metadata = generateSEOMetadata({
  title: 'Baka Glutenfritt - E-bok',
  description:
    'Brödboken med Ulrika Davidssons glutenfria recept för vardag och fest, med fokus på functional foods.',
  keywords: [
    'brodboken',
    'baka glutenfritt',
    'e-bok',
    'functional foods',
    'Ulrika Davidsson',
  ],
  url: '/brodboken',
  image: '/baka-glutenfritt-square.png',
  type: 'website',
});

export default function BrodbokenPage() {
  return <BrodbokenPageClient />;
}
