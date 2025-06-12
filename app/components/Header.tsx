"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    {
      label: "HEM",
      href: "/",
    },
    {
      label: "BOKEN",
      href: "/boken",
    },
    {
      label: "UTBILDNING",
      href: "/utbildning",
    },
    {
      label: "KUNSKAPSBANK",
      href: "/kunskapsbank",
      submenu: [
        { label: "Blogginlägg", href: "/kunskapsbank/blogg" },
        { label: "Recept", href: "/kunskapsbank/recept" },
        { label: "Sök", href: "/kunskapsbank/sok" },
        { label: "FAQ", href: "/kontakt/faq" },
        { label: "Generera bok", href: "/genererabok" },
      ],
    },
    {
      label: "KONTAKT",
      href: "/kontakt/adress",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Fel vid inloggning');
      } else {
        localStorage.setItem('token', data.token);
        setShowLogin(false);
        // Redirect based on role
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setLoginError('Tekniskt fel, försök igen.');
    }
    setFormLoading(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-10">
            <Image
              src="/logo2.png"
              alt="Functional Foods"
              width={180}
              height={72}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-primary hover:text-accent px-1 py-2 text-sm font-medium tracking-wider transition-colors duration-200"
                >
                  <span>{item.label}</span>
                  {item.submenu && (
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === item.label ? 'rotate-180' : ''
                    }`} />
                  )}
                </Link>
                {/* Dropdown Menu */}
                {item.submenu && (
                  <div className={`absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black/5 transition-all duration-200 ${
                    activeDropdown === item.label 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}>
                    <div className="py-2" role="menu">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block px-4 py-3 text-sm text-text-secondary hover:bg-background-secondary hover:text-accent transition-colors duration-200"
                          role="menuitem"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="p-2 rounded-lg text-primary hover:bg-background-secondary transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-accent transition-colors text-sm font-medium"
                >
                  Min sida
                </Link>
                <button 
                  onClick={logout} 
                  className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Logga ut
                </button>
              </div>
            ) : (
              <button
                className="rounded-full p-2 hover:bg-primary/10 transition relative"
                onClick={() => setShowLogin(true)}
                aria-label="Logga in"
              >
                <FiUser className="w-6 h-6 text-primary" />
              </button>
            )}
            <Link href="/cart" className="rounded-full p-2 hover:bg-primary/10 transition relative" aria-label="Varukorg">
              <FiShoppingCart className="w-6 h-6 text-primary" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full px-1.5 py-0.5 shadow">{items.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="py-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-primary hover:text-accent hover:bg-background-secondary rounded-lg transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.submenu && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-background-secondary rounded-lg transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative animate-scale-in border border-primary/10 max-h-[95vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-primary transition-colors duration-200 hover:scale-110 transform p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowLogin(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Välkommen tillbaka!</h2>
                <p className="text-gray-600 text-sm sm:text-base">Logga in eller skapa ditt konto för att fortsätta</p>
              </div>

              <div className="flex mb-6 bg-gray-100 rounded-full p-1">
                <button 
                  onClick={() => setTab('login')} 
                  className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                    tab==='login' 
                      ? 'bg-white text-primary shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Logga in
                </button>
                <button 
                  onClick={() => setTab('signup')} 
                  className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                    tab==='signup' 
                      ? 'bg-white text-primary shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Skapa konto
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <span className="text-sm sm:text-base">BankID</span>
                </button>
                
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3">
                  <FaGoogle className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Google</span>
                </button>
                
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3">
                  <FaFacebook className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Facebook</span>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">eller</span>
                </div>
              </div>

              {tab==='login' ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" 
                      placeholder="E-postadress" 
                      className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Lösenord" 
                      className="w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                      {loginError}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20" />
                      <span className="ml-2 text-gray-600">Kom ihåg mig</span>
                    </label>
                    <button type="button" className="text-primary hover:text-accent font-medium">
                      Glömt lösenord?
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Loggar in...
                      </div>
                    ) : 'Logga in'}
                  </button>
                </form>
              ) : (
                <form className="space-y-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Förnamn och efternamn" 
                      className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" 
                      placeholder="E-postadress" 
                      className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Lösenord (minst 8 tecken)" 
                      className="w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-start">
                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 mt-1" required />
                    <label className="ml-2 text-sm text-gray-600">
                      Jag accepterar <button type="button" className="text-primary hover:text-accent font-medium">användarvillkoren</button> och <button type="button" className="text-primary hover:text-accent font-medium">integritetspolicyn</button>
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Skapar konto...
                      </div>
                    ) : 'Skapa konto'}
                  </button>
                </form>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  Genom att {tab === 'login' ? 'logga in' : 'skapa konto'} accepterar du våra villkor för användning
                </p>
              </div>
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
    </header>
  );
} 