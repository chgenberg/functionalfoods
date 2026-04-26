import { generateMetadata as generateSEOMetadata } from '../lib/seo';

export const metadata = generateSEOMetadata({
  title: 'E-böcker - Functional Foods',
  description: 'Utforska Functional Foods e-böcker med recept, guider och praktiska verktyg för en hälsosammare vardag.',
  keywords: [
    'e-böcker',
    'functional foods',
    'receptbok',
    'hälsoguide',
    'Ulrika Davidsson'
  ],
  type: 'website'
});

export default function EBockerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
