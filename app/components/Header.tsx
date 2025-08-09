"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiLogOut } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items, isLoaded } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const { user, logout } = useAuth();

  const getDirectDashboardLink = (email: string) => {
    if (email === 'basics@test.se' || email === 'basiconly@test.se') {
      return '/dashboard/courses/functional-basics';
    } else if (email === 'flow@test.se' || email === 'flowonly@test.se') {
      return '/dashboard/courses/functional-flow';
    } else {
      return '/dashboard';
    }
  };

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
        { label: "Artiklar", href: "/kunskapsbank/blogg" },
        { label: "Recept", href: "/kunskapsbank/recept" },
        { label: "Källor", href: "/kunskapsbank/kallor" },
        { label: "Råvaror", href: "/kunskapsbank/ingredienser" },
        { label: "Q&A", href: "/kunskapsbank/qa" },
        { label: "Sök", href: "/kunskapsbank/sok" },
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
        // Redirect based on role and email
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === 'admin') {
          window.location.href = '/admin';
        } else if (loginEmail === 'basics@test.se' || loginEmail === 'basiconly@test.se') {
          window.location.href = '/dashboard/courses/functional-basics';
        } else if (loginEmail === 'flow@test.se' || loginEmail === 'flowonly@test.se') {
          window.location.href = '/dashboard/courses/functional-flow';
        } else {
          window.location.href = '/mina-kurser';
        }
      }
    } catch (err) {
      setLoginError('Tekniskt fel, försök igen.');
    }
    setFormLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName, 
          email: signupEmail, 
          password: signupPassword 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Fel vid registrering');
      } else {
        // Auto login after successful registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signupEmail, password: signupPassword }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.token);
          setShowLogin(false);
          window.location.href = '/mina-kurser';
        } else {
          setTab('login');
          setLoginError('Konto skapat! Logga in med dina uppgifter.');
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
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-10">
            <Image
              src="/FF_logo.svg"
              alt="Functional Foods"
              width={180}
              height={72}
              className="h-14 md:h-20 w-auto"
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

          {/* Mobile menu button - visible only on mobile */}
          <div className="lg:hidden">
            <button
              type="button"
              className="relative w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-5 h-5 relative">
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-2' : 'top-1'}`}></span>
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'top-2'}`}></span>
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-2' : 'top-3'}`}></span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/mina-kurser"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Mina kurser
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
                className="rounded-full p-2 hover:bg-primary/10 transition relative hidden md:block"
                onClick={() => setShowLogin(true)}
                aria-label="Logga in"
              >
                <FiUser className="w-6 h-6 text-primary" />
              </button>
            )}
            
            {/* Mobile user icon */}
            {user ? (
              <button
                className="rounded-full p-2 hover:bg-primary/10 transition relative md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Meny"
              >
                <FiUser className="w-5 h-5 text-primary" />
              </button>
            ) : (
              <button
                className="rounded-full p-2 hover:bg-primary/10 transition relative md:hidden"
                onClick={() => setShowLogin(true)}
                aria-label="Logga in"
              >
                <FiUser className="w-5 h-5 text-primary" />
              </button>
            )}
            
            <Link href="/cart" className="rounded-full p-2 hover:bg-primary/10 transition relative" aria-label="Varukorg">
              <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {isLoaded && items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{items.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile menu */}
        <div className={`lg:hidden fixed left-0 right-0 top-16 bg-white shadow-lg transition-all duration-500 z-50 ${
          mobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="py-6 px-4 space-y-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {menuItems.map((item, index) => (
              <div key={item.label} className={`animate-fade-in-up`} style={{ animationDelay: `${index * 50}ms` }}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-5 py-4 text-lg font-medium text-primary hover:text-accent bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  {item.submenu && <FiChevronDown className="w-5 h-5" />}
                </Link>
                {item.submenu && (
                  <div className="mt-2 space-y-1 pl-4">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block px-5 py-3 text-base text-text-secondary hover:text-accent bg-white hover:bg-gray-50 rounded-xl transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Login/User section in mobile menu */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/mina-kurser"
                    className="flex items-center justify-between px-5 py-4 text-lg font-medium text-white bg-primary hover:bg-secondary rounded-2xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Mina kurser</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-4 text-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-2xl transition-all duration-200"
                  >
                    <span>Logga ut</span>
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 text-lg font-medium text-white bg-primary hover:bg-accent rounded-2xl transition-all duration-200"
                >
                  <span>Logga in</span>
                  <FiUser className="w-5 h-5" />
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <button 
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
              onClick={() => setShowLogin(false)}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="pt-10 pb-4 px-8 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <Image 
                  src="/logo2.png" 
                  alt="Functional Foods Logo" 
                  width={80} 
                  height={80}
                  className="rounded-xl shadow-lg"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {tab === 'login' ? 'Välkommen tillbaka' : 'Skapa konto'}
              </h1>
              <p className="text-sm text-gray-600">
                {tab === 'login' ? 'Logga in för att fortsätta' : 'Börja din hälsoresa idag'}
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="flex mb-4 bg-gray-100/50 rounded-full p-0.5">
                <button 
                  onClick={() => {
                    setTab('login');
                    setLoginError('');
                    setShowPassword(false);
                  }} 
                  className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-300 text-sm ${
                    tab==='login' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Logga in
                </button>
                <button 
                  onClick={() => {
                    setTab('signup');
                    setLoginError('');
                    setShowPassword(false);
                  }} 
                  className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-300 text-sm ${
                    tab==='signup' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Skapa konto
                </button>
              </div>

              {tab==='login' ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="email" 
                      placeholder="E-postadress" 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Lösenord" 
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
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
                    className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Loggar in...
                      </div>
                    ) : 'Logga in'}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Förnamn och efternamn" 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="email" 
                      placeholder="E-postadress" 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Lösenord (minst 8 tecken)" 
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                      {loginError}
                    </div>
                  )}
                  <div className="flex items-start">
                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 mt-1" required />
                    <label className="ml-2 text-sm text-gray-600">
                      Jag accepterar <button type="button" className="text-primary hover:text-secondary font-medium">användarvillkoren</button> och <button type="button" className="text-primary hover:text-secondary font-medium">integritetspolicyn</button>
                    </label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
} 