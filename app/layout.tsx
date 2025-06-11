import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import ChatBot from './components/ChatBot'

export const metadata: Metadata = {
  title: "Ulrika Functional Foods",
  description: "Funktionella livsmedel för hälsa och välmående",
  icons: {
    icon: '/f_favicon.png',
    shortcut: '/f_favicon.png',
    apple: '/f_favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" data-version="2024-fixed">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <ChatBot />
        </CartProvider>
      </body>
    </html>
  );
}