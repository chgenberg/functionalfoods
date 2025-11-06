"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Eye, EyeOff, Leaf, Lock, LogOut, Mail, Menu, Search, ShoppingCart, User, X } from "lucide-react";;
import { useCart } from '../context/CartContext';
import MobileMenu from './MobileMenu';
import { useT } from '../lib/i18n/LanguageProvider';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const t = useT();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Check if we're on a course page
  const isCoursePage = pathname?.startsWith('/dashboard/courses/') || false;

  const fetchResults = async () => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${searchType}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setResults([]);
    }
  };

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(fetchResults, 250);
    return () => clearTimeout(t);
  }, [q, searchType]);

  const menuItems = [
    { label: t('nav.home','HEM'), href: "/" },
    { label: t('nav.book','BOKEN'), href: "/boken" },
    { label: t('nav.education','UTBILDNING'), href: "/utbildning", submenu: [
      { label: t('nav.allCourses','Alla kurser'), href: "/utbildning/alla-kurser" },
      { label: "Functional Basics", href: "/utbildning/functional-basics" },
      { label: "Functional Gut Health/Flow", href: "/utbildning/functional-flow" },
      { label: "Functional Insulin balance/Energy", href: "/utbildning/functional-energy" },
      { label: "Hormonell Balans", href: "/utbildning/hormonell-balans" },
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
    { label: t('nav.about','Om oss'), href: "/om-oss", submenu: [
      { label: t('nav.about','Om oss'), href: "/om-oss" },
      { label: t('nav.contact','Kontakta oss'), href: "/om-oss/kontakta-oss" },
    ] },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setLoginError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Smart redirect based on actual purchases
        try {
          const purchasesRes = await fetch('/api/user/purchases', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          
          if (purchasesRes.ok) {
            const purchasesData = await purchasesRes.json();
            const purchases = purchasesData.purchases || purchasesData;
            
            if (purchases.length > 0) {
              const ownedCourses = purchases.map((p: any) => p.course?.name || '');
              
              const hasFlow = ownedCourses.some((name: string) => name.includes('Flow') || name.includes('Gut Health'));
              const hasBasics = ownedCourses.some((name: string) => name.includes('Basics'));
              const hasEnergy = ownedCourses.some((name: string) => name.includes('Energy') || name.includes('Insulin'));
              const hasHormone = ownedCourses.some((name: string) => name.includes('Hormonell') || name.includes('Balans'));
              
              if (hasHormone && !hasFlow && !hasBasics && !hasEnergy) {
                window.location.href = '/dashboard/courses/functional-hormone';
              } else if (hasEnergy && !hasFlow && !hasBasics && !hasHormone) {
                window.location.href = '/dashboard/courses/functional-energy';
              } else if (hasFlow && !hasBasics && !hasEnergy && !hasHormone) {
                window.location.href = '/dashboard/courses/functional-flow';
              } else if (hasBasics && !hasFlow && !hasEnergy && !hasHormone) {
                window.location.href = '/dashboard/courses/functional-basics';
              } else if (purchases.length > 1) {
                window.location.href = '/mina-kurser';
              } else {
                window.location.href = '/mina-kurser';
              }
            } else {
              window.location.href = '/mina-kurser';
            }
          } else {
            // Fallback if purchases API fails
            window.location.href = '/mina-kurser';
          }
        } catch {
          window.location.href = '/mina-kurser';
        }
      } else {
        setLoginError(data.error || 'Inloggning misslyckades');
      }
    } catch (error) {
      setLoginError('Något gick fel. Försök igen.');
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
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setLoginError(data.error || 'Registrering misslyckades');
      }
    } catch (error) {
      setLoginError('Något gick fel. Försök igen.');
    }
    setFormLoading(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm">
      
        <div className="container-custom">
          <div className="relative flex items-center h-24 md:h-28">
            {/* Mobile hamburger menu - LEFT SIDE */}
            <div className="lg:hidden">
              <button 
                type="button" 
                className="relative w-11 h-11 rounded-lg bg-[#014421] hover:bg-[#116530] transition-all duration-300 flex items-center justify-center group shadow-sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Stäng meny" : "Öppna meny"}
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`block h-0.5 w-full bg-white transform transition-all duration-300 origin-left ${mobileMenuOpen ? 'rotate-45 translate-x-px' : ''}`}></span>
                  <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`}></span>
                  <span className={`block h-0.5 w-full bg-white transform transition-all duration-300 origin-left ${mobileMenuOpen ? '-rotate-45 translate-x-px' : ''}`}></span>
                </div>
              </button>
            </div>

            {/* Logo - CENTER ON MOBILE, LEFT ON DESKTOP */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Link href="/" className="pointer-events-auto">
                <Image src="/FF_logo.svg" alt="Functional Foods" width={240} height={96} className="h-16 md:h-20 w-auto" priority />
              </Link>
            </div>

            {/* Desktop navbar */}
            <nav className="hidden lg:flex items-center gap-6 ml-6">
              {menuItems.map((item) => (
                <div key={item.label} className="relative group" onMouseEnter={() => setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
                  <Link href={item.href} className="flex items-center space-x-1 text-black hover:text-[#014421] px-2 py-2 text-sm font-semibold tracking-wide transition-colors duration-200">
                    <span>{item.label}</span>
                    {item.submenu && (<ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />)}
                  </Link>
                  {item.submenu && (
                    <div className={`absolute left-0 mt-2 min-w-[14rem] rounded-xl shadow-xl bg-white ring-1 ring-black/5 transition-all duration-200 ${activeDropdown === item.label ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                      <div className="py-2" role="menu">
                        {item.submenu.map((subItem) => (
                          <Link key={subItem.label} href={subItem.href} className="block px-4 py-2.5 text-sm text-black hover:bg-background-secondary hover:text-[#014421] transition-colors duration-200" role="menuitem">
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
                <Search className="w-5 h-5 text-primary" />
              </button>
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/mina-kurser" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors text-sm font-medium">{t('nav.myCourses','Mitt konto')}</Link>
                  <button onClick={logout} className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium">{t('nav.logout','Logga ut')}</button>
                </div>
              ) : (
                <button className="rounded-full p-2 hover:bg-primary/10 transition relative hidden md:block" onClick={() => setShowLogin(true)} aria-label={t('auth.login','Logga in')}>
                  <User className="w-6 h-6 text-primary" />
                </button>
              )}
              {!user && (
                <button className="rounded-full p-2 hover:bg-primary/10 transition relative md:hidden" onClick={() => setShowLogin(true)} aria-label={t('auth.login','Logga in')}>
                  <User className="w-5 h-5 text-primary" />
                </button>
              )}
              <Link href="/cart" className="rounded-full p-2 hover:bg-primary/10 transition relative" aria-label={t('cart.label','Varukorg')}>
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                {isLoaded && items.length > 0 && (<span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{items.length}</span>)}
              </Link>
            </div>
          </div>

        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          menuItems={menuItems}
          user={user}
          onLogin={() => setShowLogin(true)}
          onLogout={logout}
          onSearch={() => setShowSearch(true)}
        />

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
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="email" placeholder={t('auth.email','E-postadress')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type={showPassword ? "text" : "password"} placeholder={t('auth.password','Lösenord')} className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="text" placeholder={t('auth.name','Namn')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupName} onChange={e => setSignupName(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="email" placeholder={t('auth.email','E-postadress')} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type={showPassword ? "text" : "password"} placeholder={t('auth.password','Lösenord (minst 6 tecken)')} className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {loginError && (<div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{loginError}</div>)}
                    <button type="submit" disabled={formLoading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                      {formLoading ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{t('auth.creatingAccount','Skapar konto...')}</div>) : t('auth.signup','Skapa konto')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder={t('search.placeholder','Sök recept, artiklar, råvaror...')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={q} onChange={e => setQ(e.target.value)} autoFocus />
                  </div>
                  <button onClick={() => setShowSearch(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {[{id:'all',label:t('search.all','Allt')},{id:'recipe',label:t('search.recipes','Recept')},{id:'article',label:t('search.articles','Artiklar')},{id:'raw-material',label:t('search.ingredients','Råvaror')}].map(type => (
                    <button key={type.id} onClick={() => setSearchType(type.id as any)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${searchType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{type.label}</button>
                  ))}
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {q.trim() ? (
                  results.length > 0 ? (
                    <div className="space-y-3">
                      {results.map(result => (
                        <Link key={result.id} href={result.href} className="block p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100" onClick={() => setShowSearch(false)}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${result.type === 'recipe' ? 'bg-green-500' : result.type === 'article' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                              {result.type === 'recipe' ? '🍽️' : result.type === 'article' ? '📖' : '<Leaf className="w-5 h-5 inline" />'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{result.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{result.excerpt}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.type === 'recipe' ? 'bg-green-100 text-green-800' : result.type === 'article' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                  {result.type === 'recipe' ? t('search.recipe','Recept') : result.type === 'article' ? t('search.article','Artikel') : t('search.ingredient','Råvara')}
                                </span>
                                {result.isPremium && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Premium</span>)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{t('search.noResults','Inga resultat hittades')}</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('search.startTyping','Börja skriv för att söka...')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  } 