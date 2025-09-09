"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../lib/i18n/LanguageProvider';

export default function Footer() {
  const t = useT();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { user, logout } = useAuth();

  useEffect(() => { setCurrentYear(new Date().getFullYear()); }, []);

  const footerLinks = {
    utbildning: [
      { label: t('footer.links.allCourses','Alla kurser'), href: '/utbildning/alla-kurser' },
      { label: t('footer.links.functionalBasics','Functional Basics'), href: '/utbildning/functional-basics' },
      { label: t('footer.links.functionalFlow','Functional Flow'), href: '/utbildning/functional-flow' },
      { label: t('footer.links.catalog','Kurskatalog'), href: '/utbildning/kurskatalog' },
    ],
    kunskapsbank: [
      { label: t('kb.sections.blog.title','Artiklar'), href: '/kunskapsbank/blogg' },
      { label: t('nav.recipes','Recept'), href: '/kunskapsbank/recept' },
      { label: t('nav.sources','Källor'), href: '/kunskapsbank/kallor' },
      { label: t('nav.search','Sök'), href: '/kunskapsbank/sok' },
      { label: 'FAQ', href: '/kontakt/faq' },
    ],
    juridisk: [
      { label: t('footer.links.terms','Användarvillkor'), href: '/anvandarvillkor' },
      { label: t('footer.links.personal','Personuppgifter'), href: '/personuppgifter' },
      { label: t('footer.links.privacy','Integritetspolicy'), href: '/integritetspolicy' },
      { label: t('footer.links.cookie','Cookie-policy'), href: '/cookie-policy' },
      { label: t('footer.links.aiPolicy','AI Policy'), href: '/ai-policy' },
      // Add admin link if user is admin
      ...(user?.role === 'admin' ? [{ label: '🔐 Admin', href: '/admin/login' }] : []),
    ],
  };

  return (
    <footer className="text-white relative"
      style={{ background: 'linear-gradient(135deg, #014421 0%, #116530 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Image 
                src="/FF_logo.svg" 
                alt="Functional Foods" 
                width={200} 
                height={80} 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              {t('footer.description','Din personliga guide till hälsosam mat och välmående genom vetenskapligt grundade functional foods.')}
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/functionalfoods" className="text-white/60 hover:text-white transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="https://facebook.com/functionalfoods" className="text-white/60 hover:text-white transition-colors">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/company/functionalfoods" className="text-white/60 hover:text-white transition-colors">
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Utbildning */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.sections.education','Utbildning')}</h3>
            <ul className="space-y-2">
              {footerLinks.utbildning.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kunskapsbank */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.sections.knowledge','Kunskapsbank')}</h3>
            <ul className="space-y-2">
              {footerLinks.kunskapsbank.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Juridisk */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.sections.legal','Juridiskt')}</h3>
            <ul className="space-y-2">
              {footerLinks.juridisk.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            © {currentYear} {t('footer.copyright','Functional Foods. Alla rättigheter förbehållna.')}
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/om-oss/kontakta-oss" className="text-white/70 hover:text-white text-sm transition-colors">
              {t('footer.contact','Kontakta oss')}
            </Link>
            <Link href="/kontakt/faq" className="text-white/70 hover:text-white text-sm transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 