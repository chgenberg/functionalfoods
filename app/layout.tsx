import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "Functional Foods - Förbättra din hälsa genom funktionell kost",
  description: "Utbildning och kunskap om funktionell kost och livsstil för bättre hälsa.",
  icons: {
    icon: '/f_favicon.png',
    shortcut: '/f_favicon.png',
    apple: '/f_favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" data-version="2024-fixed">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}