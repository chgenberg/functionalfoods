"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, HelpCircle, FileText, ChefHat, 
  GraduationCap, Users, ShoppingCart, Star, MessageSquare, 
  Tag, TrendingUp, BookOpen, Settings, LogOut, Menu, X,
  Leaf, ChevronDown, PlusCircle
} from 'lucide-react';
import './admin-ulrika-design.css';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Översikt', 'Innehåll', 'Handel', 'System']);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/verify');
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Översikt',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Innehåll',
      items: [
        { label: 'Produktsidor', href: '/admin/products', icon: ShoppingBag },
        { label: 'Blogg', href: '/admin/blog', icon: FileText },
        { label: 'Recept', href: '/admin/recipes', icon: ChefHat },
        { label: 'Kurser', href: '/admin/course-builder', icon: GraduationCap },
        { label: 'Kunskapsdokument', href: '/admin/knowledge', icon: BookOpen },
        { label: 'Frågor & Svar', href: '/admin/faq', icon: HelpCircle },
      ]
    },
    {
      title: 'Handel',
      items: [
        { label: 'Försäljning', href: '/admin/sales-complete', icon: TrendingUp },
        { label: 'Kuponger', href: '/admin/coupons', icon: Tag },
        { label: 'Inköpslistor', href: '/admin/shopping-lists', icon: ShoppingCart },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Användare', href: '/admin/users', icon: Users },
        { label: 'Recensioner', href: '/admin/reviews', icon: Star },
        { label: 'Community', href: '/admin/community', icon: MessageSquare },
        { label: 'Inställningar', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  if (pathname === '/admin/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen admin-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen admin-container">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-white border border-[var(--border-light)] rounded-xl shadow-sm text-[var(--primary-green)] hover:bg-[var(--primary-beige)] transition-all"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[var(--border-light)] transform transition-transform duration-300 ease-out shadow-xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 bg-gradient-to-br from-[var(--primary-green)] to-[#016630]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Admin Panel
                </h1>
                <p className="text-xs text-white/70">Functional Foods</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title);
              const hasActiveItem = section.items.some(item => 
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              );
              
              return (
                <div key={section.title} className="mb-2">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`w-full flex items-center justify-between px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      hasActiveItem ? 'text-[var(--primary-green)]' : 'text-[var(--text-secondary)]'
                    } hover:text-[var(--primary-green)]`}
                  >
                    {section.title}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Section Items */}
                  <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className="px-3 space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 group ${
                                isActive 
                                  ? 'bg-gradient-to-r from-[var(--primary-green)] to-[#016630] text-white shadow-md shadow-[var(--primary-green)]/20' 
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--primary-beige)] hover:text-[var(--primary-green)]'
                              }`}
                              onClick={() => setIsSidebarOpen(false)}
                            >
                              <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-200 ${
                                isActive ? '' : 'group-hover:scale-110'
                              }`} />
                              <span className="font-medium">{item.label}</span>
                              {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer/Logout */}
          <div className="p-4 border-t border-[var(--border-light)] bg-[var(--primary-beige)]/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logga ut</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
