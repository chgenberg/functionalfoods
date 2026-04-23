import { generateMetadata as generateSEOMetadata } from '@/app/lib/seo';
import PaskbokenPageClient from './page.client';

export const metadata = generateSEOMetadata({
  title: 'Påskbuffé - E-bok',
  description:
    'Påskbuffé är Ulrika Davidssons e-bok med 50 näringsrika recept för ett godare och hälsosammare påskbord.',
  keywords: [
    'paskbuffe',
    'påskbuffé',
    'e-bok',
    'functional foods',
    'Ulrika Davidsson',
  ],
  url: '/e-bocker/paskbuffe',
  image: '/paskbuffe-square.jpg',
  type: 'website',
});

export default function PaskbokenPage() {
  return <PaskbokenPageClient />;
}
