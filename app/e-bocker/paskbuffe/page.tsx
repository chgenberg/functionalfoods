import { generateEbookMetadata } from '@/app/lib/ebook-seo';
import PaskbokenPageClient from './page.client';

export async function generateMetadata() {
  return generateEbookMetadata({
    pageId: 'paskbuffe',
    url: '/e-bocker/paskbuffe',
    fallbackTitle: 'Påskbuffé - E-bok',
    fallbackDescription:
      'Påskbuffé är Ulrika Davidssons e-bok med 50 näringsrika recept för ett godare och hälsosammare påskbord.',
    fallbackImage: '/paskbuffe-square.jpg',
    keywords: ['paskbuffe', 'påskbuffé', 'e-bok', 'functional foods', 'Ulrika Davidsson'],
  });
}

export default function PaskbokenPage() {
  return <PaskbokenPageClient />;
}
