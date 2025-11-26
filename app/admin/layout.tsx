"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './admin-ulrika-design.css';

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

  const menuItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Blogg', href: '/admin/blog' },
    { label: 'Recept', href: '/admin/recipes' },
    { label: 'Kurser', href: '/admin/courses' },
    { label: 'Användare', href: '/admin/users' },
    { label: 'Inköpslistor', href: '/admin/shopping-lists' },
    { label: 'Recensioner', href: '/admin/reviews' },
    { label: 'Community', href: '/admin/community' },
    { label: 'Kuponger', href: '/admin/coupons' },
    { label: 'Försäljning', href: '/admin/sales-complete' },
    { label: 'Kunskapsdokument', href: '/admin/knowledge' },
    { label: 'Inställningar', href: '/admin/settings' },
  ];

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
          className="p-3 bg-white border border-[var(--border-light)] rounded-lg text-sm font-medium text-[var(--primary-green)]"
        >
          {isSidebarOpen ? 'Stäng' : 'Meny'}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[var(--border-light)] transform transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--border-light)]">
            <h1 className="text-lg font-medium text-[var(--primary-green)]">
              Admin
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Ulrika Functional Foods</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded transition-colors ${
                        isActive 
                          ? 'bg-[var(--primary-beige)] text-[var(--primary-green)] font-medium' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)]'
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[var(--border-light)]">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:text-red-600 transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
