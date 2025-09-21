"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import './admin-ulrika-design.css';
import { 
  Home, 
  FileText, 
  Users, 
  ShoppingCart, 
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  BookOpen,
  Tag,
  MessageSquare,
  Image,
  Star,
  Leaf
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
    { icon: ShoppingCart, label: 'Inköpslistor', href: '/admin/shopping-lists' },
    { icon: Star, label: 'Recensioner', href: '/admin/reviews' },
    { icon: MessageSquare, label: 'Community', href: '/admin/community' },
    { icon: Tag, label: 'Kuponger', href: '/admin/coupons' },
    { icon: BarChart3, label: 'Försäljning', href: '/admin/sales' },
    { icon: FileText, label: 'Kunskapsdokument', href: '/admin/knowledge' },
    { icon: Settings, label: 'Inställningar', href: '/admin/settings' }
  ];

  if (pathname === '/admin/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen admin-container flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar...</p>
        </motion.div>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 admin-card"
        >
          {isSidebarOpen ? 
            <X className="w-5 h-5 text-[var(--primary-green)]" /> : 
            <Menu className="w-5 h-5 text-[var(--primary-green)]" />
          }
        </motion.button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 left-0 z-40 w-72 admin-sidebar"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="admin-sidebar-logo">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3"
              >
                <Leaf className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-white/80">Ulrika Functional Foods</p>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 admin-scrollbar">
              <ul className="space-y-1">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  
                  return (
                    <motion.li 
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* User section & Logout */}
            <div className="p-4 border-t border-[var(--border-light)]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 rounded-lg bg-[var(--primary-beige)]"
              >
                <p className="text-xs text-[var(--text-secondary)] mb-1">Inloggad som</p>
                <p className="text-sm font-medium text-[var(--primary-green)]">admin@functionalfoods.se</p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logga ut</span>
              </motion.button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <main className={`
        lg:ml-72 min-h-screen transition-all duration-300
        ${isSidebarOpen ? 'opacity-50 lg:opacity-100 pointer-events-none lg:pointer-events-auto' : ''}
      `}>
        <div className="p-4 lg:p-8">
          {/* Top bar for mobile */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mb-6 ml-14 admin-card"
          >
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-[var(--primary-green)]" />
              <h2 className="text-lg font-medium text-[var(--primary-green)]">Admin Panel</h2>
            </div>
          </motion.div>
          
          {/* Page content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
