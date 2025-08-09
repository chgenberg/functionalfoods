"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ContactFormCompact from './ContactFormCompact';
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
    ],
  };

  return (
    <footer className="bg-primary text-white relative">
      <div className="container-custom py-16">
        <div className="mb-12 max-w-md mx-auto lg:mx-0">
          <ContactFormCompact />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image src="/FunctionalLogo.png" alt="Functional Foods" width={160} height={64} className="h-16 w-auto brightness-0 invert" style={{ height: "auto" }} />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t('footer.about','Vi hjälper dig att förbättra din hälsa genom funktionell kost och livsstil. Upptäck kraften i mervärdesmat för långsiktigt välmående.')}
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">{t('footer.heading.education','Utbildning')}</h3>
            <ul className="space-y-3">
              {footerLinks.utbildning.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>{link.label}</span>
                    <FiArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">{t('footer.heading.knowledge','Kunskapsbank')}</h3>
            <ul className="space-y-3">
              {footerLinks.kunskapsbank.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                    <span>{link.label}</span>
                    <FiArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">{t('footer.heading.contact','Kontakt')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@functionalfoods.se" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                  <FiMail className="w-5 h-5 mr-2" />
                  <span className="text-sm">info@functionalfoods.se</span>
                </a>
              </li>
              <li>
                <a href="tel:+46XXXXXXXX" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                  <FiPhone className="w-5 h-5 mr-2" />
                  <span className="text-sm">+46 XX XXX XX XX</span>
                </a>
              </li>
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{t('footer.city','Stockholm, Sverige')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Functional Foods. {t('footer.rights','Alla rättigheter förbehållna.')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {footerLinks.juridisk.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
              <Link href="/admin/login" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 focus:outline-none ml-4">
                {t('footer.admin','Admin')}
              </Link>
              {user ? (
                <>
                  <span className="text-white text-xs ml-4">{t('footer.welcome','Välkommen')}{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</span>
                  <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-700 transition text-xs">{t('footer.logout','Logga ut')}</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 