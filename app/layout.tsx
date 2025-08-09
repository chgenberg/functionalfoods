import './globals.css';
import { Inter } from 'next/font/google';
import { LanguageProvider } from './lib/i18n/LanguageProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import ChatBot from './components/ChatBot';
import AutoTranslate from './lib/i18n/useAutoTranslate';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ulrika Functional Foods',
  description: 'Functional Foods with Ulrika Davidsson',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} font-sans antialiased min-h-screen flex flex-col`}>
        <LanguageProvider>
          <CartProvider>
            <AutoTranslate />
            <div className="flex flex-col min-h-screen">
              <header role="banner" aria-label="Huvud">
                <Header />
              </header>
              <main role="main" aria-label="Innehåll" className="flex-grow pt-16 md:pt-20">
                {children}
              </main>
              <footer role="contentinfo" aria-label="Sidfot">
                <Footer />
              </footer>
            </div>
            <ChatBot />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}