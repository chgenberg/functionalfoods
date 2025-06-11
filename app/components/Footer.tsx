import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    utbildning: [
      { label: 'Alla kurser', href: '/utbildning/alla-kurser' },
      { label: 'Functional Basics', href: '/utbildning/functional-basics' },
      { label: 'Functional Flow', href: '/utbildning/functional-flow' },
      { label: 'Kurskatalog', href: '/utbildning/kurskatalog' },
    ],
    kunskapsbank: [
      { label: 'Blogginlägg', href: '/kunskapsbank/blogg' },
      { label: 'Recept', href: '/kunskapsbank/recept' },
      { label: 'Sök', href: '/kunskapsbank/sok' },
      { label: 'FAQ', href: '/kontakt/faq' },
    ],
    juridisk: [
      { label: 'Integritetspolicy', href: '/integritetspolicy' },
      { label: 'Cookie-policy', href: '/cookie-policy' },
      { label: 'Användarvillkor', href: '/anvandarvillkor' },
    ],
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo och beskrivning */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/FunctionalLogo.png"
                alt="Functional Foods"
                width={160}
                height={64}
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Vi hjälper dig att förbättra din hälsa genom funktionell kost och livsstil. 
              Upptäck kraften i mervärdesmat för långsiktigt välmående.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Utbildning */}
          <div>
            <h3 className="text-lg font-medium mb-4">Utbildning</h3>
            <ul className="space-y-3">
              {footerLinks.utbildning.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.label}</span>
                    <FiArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kunskapsbank */}
          <div>
            <h3 className="text-lg font-medium mb-4">Kunskapsbank</h3>
            <ul className="space-y-3">
              {footerLinks.kunskapsbank.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.label}</span>
                    <FiArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-medium mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:info@functionalfoods.se" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <FiMail className="w-5 h-5 mr-2" />
                  <span className="text-sm">info@functionalfoods.se</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+46XXXXXXXX" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <FiPhone className="w-5 h-5 mr-2" />
                  <span className="text-sm">+46 XX XXX XX XX</span>
                </a>
              </li>
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">Stockholm, Sverige</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Functional Foods. Alla rättigheter förbehållna.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {footerLinks.juridisk.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 