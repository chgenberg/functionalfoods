"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiArrowRight, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setAdminLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || 'Fel vid inloggning');
      } else {
        localStorage.setItem('token', data.token);
        setShowAdminLogin(false);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setAdminLoginError('Tekniskt fel, försök igen.');
    }
    setFormLoading(false);
  };

  return (
    <footer className="bg-primary text-white relative">
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
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {footerLinks.juridisk.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200 focus:outline-none ml-4"
              >
                Admin Inlogg
              </button>
              {user ? (
                <>
                  <span className="text-white text-xs ml-4">Välkommen{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</span>
                  <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-700 transition text-xs">Logga ut</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-scale-in border border-primary/20">
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors duration-200 hover:scale-110 transform"
              onClick={() => setShowAdminLogin(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
              <p className="text-gray-600">Säker inloggning för medarbetare</p>
            </div>

            <form className="space-y-6" onSubmit={handleAdminLogin}>
              <div className="space-y-4">
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="Admin e-postadress" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Lösenord" 
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {adminLoginError && (
                <div className="text-red-600 text-sm">{adminLoginError}</div>
              )}
              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifierar...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <FiShield className="w-5 h-5" />
                    Säker inloggning
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Endast auktoriserad personal. Alla inloggningar loggas.
              </p>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .input {
          @apply px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition w-full bg-white/80 shadow-sm;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </footer>
  );
} 