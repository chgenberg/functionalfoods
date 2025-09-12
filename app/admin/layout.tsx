"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Image, 
  Users, 
  ShoppingCart, 
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  Palette,
  BookOpen,
  Tag,
  MessageSquare,
  Mail,
  Eye
} from 'lucide-react';

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
    // Skip auth check on login page
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
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: FileText, label: 'Blogg', href: '/admin/blog' },
    { icon: BookOpen, label: 'Recept', href: '/admin/recipes' },
    { icon: BookOpen, label: 'Kurser', href: '/admin/courses' },
    { icon: Users, label: 'Användare', href: '/admin/users' },
    { icon: ShoppingCart, label: 'Ordrar', href: '/admin/orders' },
    { icon: MessageSquare, label: 'Recensioner', href: '/admin/reviews' },
    { icon: Tag, label: 'Kuponger', href: '/admin/coupons' },
    { icon: BarChart3, label: 'Försäljning', href: '/admin/sales' },
    { icon: Image, label: 'Media', href: '/admin/media' },
    { icon: Settings, label: 'Inställningar', href: '/admin/settings' },
    { icon: Eye, label: 'Debug', href: '/admin/debug' },
  ];

  // Don't render layout on login page
  if (pathname === '/admin/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-white rounded-xl shadow-lg border border-[#F3EFE3] hover:shadow-xl transition-all"
        >
          {isSidebarOpen ? 
            <X className="w-5 h-5 text-[#014421]" /> : 
            <Menu className="w-5 h-5 text-[#014421]" />
          }
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 border-r border-[#F3EFE3]
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#F3EFE3] bg-gradient-to-b from-white to-[#F3EFE3]/20">
            <h1 className="text-2xl font-bold text-[#014421]">
              Admin Panel
            </h1>
            <p className="text-sm text-[#014421]/70 mt-1">Functional Foods</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary/20 text-primary shadow-sm border border-primary/30' 
                          : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#F3EFE3]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logga ut</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`
        lg:ml-64 min-h-screen
        ${isSidebarOpen ? 'opacity-50 lg:opacity-100' : ''}
      `}>
        <div className="p-4 lg:p-8">
          {/* Mobile header */}
          <div className="lg:hidden mb-6 ml-14">
            <h2 className="text-xl font-bold text-[#014421] flex items-center gap-2">
              <span>🌱</span> Admin Panel
            </h2>
          </div>
          
          {/* Page content with responsive padding */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 