import './globals.css';
import { Inter } from 'next/font/google';
import { LanguageProvider } from './lib/i18n/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ulrika Functional Foods',
  description: 'Functional Foods with Ulrika Davidsson',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}