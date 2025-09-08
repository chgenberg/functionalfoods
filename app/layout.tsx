import './globals.css';
import { Inter } from 'next/font/google';
import { LanguageProvider } from './lib/i18n/LanguageProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import ChatBot from './components/ChatBot';
import CookieConsentBanner from './components/CookieConsentBanner';
import AutoTranslate from './lib/i18n/useAutoTranslate';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { generateMetadata as generateSEOMetadata } from './lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata = generateSEOMetadata({
  title: 'Functional Foods - Hälsa genom mat med Ulrika Davidsson',
  description: 'Upptäck kraften i functional foods med Ulrika Davidsson. Personliga hälsoplaner, evidensbaserade kurser och recept för optimal hälsa. Starta din hälsoresa idag!',
  keywords: [
    'functional foods',
    'hälsa',
    'näring',
    'Ulrika Davidsson',
    'kost',
    'hälsokost',
    'näringsoptimering',
    'antiinflammatorisk mat',
    'personlig hälsa',
    'evidensbaserad näring'
  ],
  url: '/',
  type: 'website'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        {/* Split JSON-LD into separate script tags to avoid client-side parsing issues */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ulrika Functional Foods',
              url: 'https://functionalfoods.se',
              logo: 'https://functionalfoods.se/FF_logo.svg',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Swedish', 'English', 'Spanish', 'German', 'French']
              },
              sameAs: [
                'https://instagram.com/functionalfoods_se'
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Ulrika Functional Foods',
              url: 'https://functionalfoods.se',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://functionalfoods.se/kunskapsbank/sok?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased min-h-screen flex flex-col`}>
        <ErrorBoundary>
          <ToastProvider>
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
                <CookieConsentBanner />
              </CartProvider>
            </LanguageProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}