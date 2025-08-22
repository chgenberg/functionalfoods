"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiLogOut, FiSearch } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useT } from '../lib/i18n/LanguageProvider';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const t = useT();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'all'|'recipe'|'article'|'raw-material'>('all');
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
    if (email === 'basics@test.se' || email === 'basiconly@test.se') return '/dashboard/courses/functional-basics';
    else if (email === 'flow@test.se' || email === 'flowonly@test.se') return '/dashboard/courses/functional-flow';
    else return '/dashboard';
  };

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 10); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(()=>{
    const fetchResults = async () => {
      if (q.trim().length < 2) { setResults([]); return; }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${searchType}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    };
    const t = setTimeout(fetchResults, 250);
    return () => clearTimeout(t);
  }, [q, searchType]);

  const menuItems = [
    { label: t('nav.home','HEM'), href: "/" },
    { label: t('nav.book','BOKEN'), href: "/boken" },
    { label: t('nav.education','UTBILDNING'), href: "/utbildning", submenu: [
      { label: t('nav.allCourses','Alla kurser'), href: "/utbildning/alla-kurser" },
      { label: "Functional Basics", href: "/utbildning/functional-basics" },
      { label: "Functional Flow", href: "/utbildning/functional-flow" },
    ] },
    { label: t('nav.recipes','RECEPT'), href: "/kunskapsbank/recept" },
    { label: t('nav.knowledge','KUNSKAPSBANK'), href: "/kunskapsbank", submenu: [
      { label: t('kb.sections.blog.title','Artiklar'), href: "/kunskapsbank/blogg" },
      { label: t('nav.sources','Källor'), href: "/kunskapsbank/kallor" },
      { label: t('nav.ingredients','Råvaror'), href: "/kunskapsbank/ingredienser" },
      { label: t('nav.qa','Q&A'), href: "/kunskapsbank/qa" },
      { label: t('nav.search','Sök'), href: "/kunskapsbank/sok" },
      { label: t('nav.podcasts','Poddar'), href: "/kunskapsbank/poddar" },
    ] },
    { label: t('nav.contact','KONTAKT'), href: "/kontakt/adress" },
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
        setLoginError(data.error || t('auth.loginError','Fel vid inloggning'));
      } else {
        localStorage.setItem('token', data.token);
        setShowLogin(false);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === 'admin') window.location.href = '/admin';
        else if (loginEmail === 'basics@test.se' || loginEmail === 'basiconly@test.se') window.location.href = '/dashboard/courses/functional-basics';
        else if (loginEmail === 'flow@test.se' || loginEmail === 'flowonly@test.se') window.location.href = '/dashboard/courses/functional-flow';
        else window.location.href = '/mina-kurser';
      }
    } catch (err) {
      setLoginError(t('auth.technical','Tekniskt fel, försök igen.'));
    }
    setFormLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || t('auth.signupError','Fel vid registrering'));
      } else {
        const loginRes = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: signupEmail, password: signupPassword }) });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.token);
          setShowLogin(false);
          window.location.href = '/mina-kurser';
        } else {
          setTab('login');
          setLoginError(t('auth.createdPleaseLogin','Konto skapat! Logga in med dina uppgifter.'));
        }
      }
    } catch (err) {
      setLoginError(t('auth.technical','Tekniskt fel, försök igen.'));
    }
    setFormLoading(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
      {/* Top announcement bar */}
      <div className="w-full text-white text-xs sm:text-sm" style={{ backgroundColor: '#112A12' }}>
        <div className="container-custom">
          <div className="relative overflow-hidden h-8 sm:h-10 flex items-center">
            <div className="animate-marquee whitespace-nowrap">
              <Link href="/utbildning" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🌿 {t('topbar.functionalFoods','Upptäck kraften i Functional Foods – personligt anpassat för din hälsa')} </span>
              </Link>
              <Link href="/kunskapsbank/recept" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🍽️ {t('topbar.recipes','Utforska våra gratis, hälsosamma recept')}</span>
              </Link>
              <Link href="/kunskapsbank/kallor" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🔎 {t('topbar.science','Vetenskapligt grundat – läs våra källor')}</span>
              </Link>
            </div>
            <div className="animate-marquee2 whitespace-nowrap absolute left-full">
              <Link href="/utbildning" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🌿 {t('topbar.functionalFoods','Upptäck kraften i Functional Foods – personligt anpassat för din hälsa')} </span>
              </Link>
              <Link href="/kunskapsbank/recept" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🍽️ {t('topbar.recipes','Utforska våra gratis, hälsosamma recept')}</span>
              </Link>
              <Link href="/kunskapsbank/kallor" className="mx-4 sm:mx-8 inline-flex items-center gap-1 sm:gap-2 hover:underline">
                <span className="text-xs sm:text-sm">🔎 {t('topbar.science','Vetenskapligt grundat – läs våra källor')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container-custom">
        <div className="relative flex items-center h-24 md:h-28">
          {/* Mobile hamburger menu - LEFT SIDE */}
          <div className="lg:hidden">
            <button type="button" className="relative w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="w-5 h-5 relative">
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-2' : 'top-1'}`}></span>
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'top-2'}`}></span>
                <span className={`absolute block h-0.5 w-5 bg-primary transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-2' : 'top-3'}`}></span>
              </div>
            </button>
          </div>

          {/* Logo - CENTER ON MOBILE, LEFT ON DESKTOP */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Link href="/" className="pointer-events-auto">
              <Image src="/FF_logo.svg" alt="Functional Foods" width={200} height={80} className="h-12 md:h-16 w-auto" priority />
            </Link>
          </div>

          {/* Desktop navbar */}
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group" onMouseEnter={() => setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
                <Link href={item.href} className="flex items-center space-x-1 text-primary hover:text-accent px-2 py-2 text-sm font-semibold tracking-wide transition-colors duration-200">
                  <span>{item.label}</span>
                  {item.submenu && (<FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />)}
                </Link>
                {item.submenu && (
                  <div className={`absolute left-0 mt-2 min-w-[14rem] rounded-xl shadow-xl bg-white ring-1 ring-black/5 transition-all duration-200 ${activeDropdown === item.label ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                    <div className="py-2" role="menu">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.label} href={subItem.href} className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-background-secondary hover:text-accent transition-colors duration-200" role="menuitem">
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-[60]">
            <button className="rounded-full p-2 hover:bg-primary/10 transition" aria-label={t('nav.search','Sök')} onClick={()=>setShowSearch(true)}>
              <FiSearch className="w-5 h-5 text-primary" />
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/mina-kurser" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors text-sm font-medium">{t('nav.myCourses','Mina kurser')}</Link>
                <button onClick={logout} className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium">{t('nav.logout','Logga ut')}</button>
              </div>
            ) : (
              <button className="rounded-full p-2 hover:bg-primary/10 transition relative hidden md:block" onClick={() => setShowLogin(true)} aria-label={t('auth.login','Logga in')}>
                <FiUser className="w-6 h-6 text-primary" />
              </button>
            )}
            {user ? (
              <button className="rounded-full p-2 hover:bg-primary/10 transition relative md:hidden" onClick={() => setMobileMenuOpen(true)} aria-label={t('nav.openMenu','Meny')}>
                <FiUser className="w-5 h-5 text-primary" />
              </button>
            ) : (
              <button className="rounded-full p-2 hover:bg-primary/10 transition relative md:hidden" onClick={() => setShowLogin(true)} aria-label={t('auth.login','Logga in')}>
                <FiUser className="w-5 h-5 text-primary" />
              </button>
            )}
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <Link href="/cart" className="rounded-full p-2 hover:bg-primary/10 transition relative" aria-label={t('cart.label','Varukorg')}>
              <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {isLoaded && items.length > 0 && (<span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{items.length}</span>)}
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setMobileMenuOpen(false)} />)}

        <div className={`fixed top-36 md:top-40 left-0 bottom-0 w-80 md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="py-6 px-4 space-y-2 h-full overflow-y-auto">
            <div className="block lg:hidden mb-4">
              <LanguageSwitcher />
            </div>
            {menuItems.map((item, index) => (
              <div key={item.label} className={`animate-fade-in-up`} style={{ animationDelay: `${index * 50}ms` }}>
                <Link href={item.href} className="flex items-center justify-between px-4 py-3 text-base font-medium text-primary hover:text-accent bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  <span>{item.label}</span>
                  {item.submenu && <FiChevronDown className="w-5 h-5" />}
                </Link>
                {item.submenu && (
                  <div className="mt-1 space-y-1 pl-3">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.label} href={subItem.href} className="block px-4 py-2 text-sm text-text-secondary hover:text-accent bg-white hover:bg-gray-50 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <Link href="/mina-kurser" className="flex items-center justify-between px-4 py-3 text-base font-medium text-white bg-primary hover:bg-secondary rounded-xl transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                    <span>{t('nav.myCourses','Mina kurser')}</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-200">
                    <span>{t('nav.logout','Logga ut')}</span>
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white bg-primary hover:bg-accent rounded-xl transition-all duration-200">
                  <span>{t('nav.login','Logga in')}</span>
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
            <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors" onClick={() => setShowLogin(false)} aria-label={t('common.close','Stäng')}>
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="pt-10 pb-4 px-8 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <Image src="/logo2.png" alt="Functional Foods Logo" width={80} height={80} className="rounded-xl shadow-lg" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{tab === 'login' ? t('auth.welcomeBack','Välkommen tillbaka') : t('auth.createAccount','Skapa konto')}</h1>
              <p className="text-sm text-gray-600">{tab === 'login' ? t('auth.loginToContinue','Logga in för att fortsätta') : t('auth.startJourney','Börja din hälsoresa idag')}</p>
            </div>
            <div className="px-6 pb-6">
              <div className="flex mb-4 bg-gray-100/50 rounded-full p-0.5">
                <button onClick={() => { setTab('login'); setLoginError(''); setShowPassword(false); }} className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-300 text-sm ${tab==='login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{t('auth.login','Logga in')}</button>
                <button onClick={() => { setTab('signup'); setLoginError(''); setShowPassword(false); }} className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-300 text-sm ${tab==='signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{t('auth.signup','Skapa konto')}</button>
              </div>
              {tab==='login' ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" placeholder={t('auth.email','E-postadress')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPassword ? "text" : "password"} placeholder={t('auth.password','Lösenord')} className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">{showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}</button>
                  </div>
                  {loginError && (<div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{loginError}</div>)}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center"><input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20" /><span className="ml-2 text-gray-600">{t('auth.remember','Kom ihåg mig')}</span></label>
                    <button type="button" className="text-primary hover:text-accent font-medium">{t('auth.forgot','Glömt lösenord?')}</button>
                  </div>
                  <button type="submit" disabled={formLoading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    {formLoading ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{t('auth.loggingIn','Loggar in...')}</div>) : t('auth.login','Logga in')}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder={t('auth.fullname','Förnamn och efternamn')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupName} onChange={e => setSignupName(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" placeholder={t('auth.email','E-postadress')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPassword ? "text" : "password"} placeholder={t('auth.passwordMin','Lösenord (minst 8 tecken)')} className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">{showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}</button>
                  </div>
                  {loginError && (<div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{loginError}</div>)}
                  <div className="flex items-start">
                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 mt-1" required />
                    <label className="ml-2 text-sm text-gray-600">{t('auth.acceptTerms','Jag accepterar användarvillkoren och integritetspolicyn')}</label>
                  </div>
                  <button type="submit" disabled={formLoading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    {formLoading ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{t('auth.creating','Skapar konto...')}</div>) : t('auth.signup','Skapa konto')}
                  </button>
                </form>
              )}
              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500">{t('auth.byContinuing','Genom att fortsätta accepterar du våra villkor')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-6">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b">
              <FiSearch className="w-5 h-5 text-gray-500" />
              <input autoFocus value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t('recipes.list.search.placeholder','Sök recept eller ingredienser...')} className="flex-1 outline-none py-2" />
              <select value={searchType} onChange={e=>setSearchType(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                <option value="all">{t('search.all','Alla')}</option>
                <option value="recipe">{t('search.recipes','Recept')}</option>
                <option value="article">{t('search.articles','Artiklar')}</option>
                <option value="raw-material">{t('search.raw','Råvaror')}</option>
              </select>
              <button onClick={()=>setShowSearch(false)} className="p-2 text-gray-500 hover:text-gray-700"><FiX className="w-5 h-5"/></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y">
              {results.map((r:any)=> (
                <Link key={r.id} href={r.href} onClick={()=>setShowSearch(false)} className="block p-3 hover:bg-gray-50">
                  <div className="text-sm text-gray-500">{r.type}</div>
                  <div className="font-medium text-gray-900">{r.title}</div>
                  {r.excerpt && <div className="text-sm text-gray-600 line-clamp-2">{r.excerpt}</div>}
                </Link>
              ))}
              {q && results.length===0 && (
                <div className="p-4 text-sm text-gray-500">{t('search.noResults','Inga träffar')}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1); }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1); }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-marquee2 { animation: marquee2 35s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        @keyframes marquee2 { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
      `}</style>
    </header>
  );
} 