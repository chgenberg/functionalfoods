"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import './admin-ulrika-design.css';
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
  Eye,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Star
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
    { icon: Home, label: 'Dashboard', href: '/admin', gradient: 'from-blue-500 to-blue-600' },
    { icon: FileText, label: 'Blogg', href: '/admin/blog', gradient: 'from-purple-500 to-purple-600' },
    { icon: BookOpen, label: 'Recept', href: '/admin/recipes', gradient: 'from-green-500 to-green-600' },
    { icon: Users, label: 'Användare', href: '/admin/users', gradient: 'from-indigo-500 to-indigo-600' },
    { icon: ShoppingCart, label: 'Ordrar', href: '/admin/orders', gradient: 'from-orange-500 to-orange-600' },
    { icon: Star, label: 'Recensioner', href: '/admin/reviews', gradient: 'from-yellow-500 to-yellow-600' },
    { icon: MessageSquare, label: 'Community', href: '/admin/community', gradient: 'from-pink-500 to-pink-600' },
    { icon: Tag, label: 'Kuponger', href: '/admin/coupons', gradient: 'from-red-500 to-red-600' },
    { icon: BarChart3, label: 'Försäljning', href: '/admin/sales', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Image, label: 'Media', href: '/admin/media', gradient: 'from-cyan-500 to-cyan-600' },
    { icon: FileText, label: 'Kunskapsdokument', href: '/admin/knowledge', gradient: 'from-violet-500 to-violet-600' },
    { icon: Settings, label: 'Inställningar', href: '/admin/settings', gradient: 'from-gray-500 to-gray-600' }
  ];

  // Don't render layout on login page
  if (pathname === '/admin/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#93C560] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 mt-4 font-light">Laddar...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
        >
          {isSidebarOpen ? 
            <X className="w-5 h-5 text-[#014421]" /> : 
            <Menu className="w-5 h-5 text-[#014421]" />
          }
        </motion.button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-xl shadow-2xl
            border-r border-gray-100
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#93C560] to-[#7BA94D] rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-light text-[#014421]">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500">Functional Foods</p>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                        className={`
                          relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                          ${isActive 
                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <div className={`
                          w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
                          ${isActive 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-br ' + item.gradient + ' opacity-0 group-hover:opacity-100'
                          }
                        `}>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'}`} />
                        </div>
                        <span className="font-light text-sm">{item.label}</span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute right-2 w-1 h-6 bg-white/30 rounded-full"
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* User section & Logout */}
            <div className="p-4 border-t border-gray-100">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-gradient-to-r from-[#93C560]/10 to-[#FF7E70]/10 rounded-2xl"
              >
                <p className="text-xs text-gray-600 mb-1">Inloggad som</p>
                <p className="text-sm font-medium text-[#014421]">admin@ulrika.se</p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-light text-sm">Logga ut</span>
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
            className="lg:hidden mb-6 ml-14 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#93C560] to-[#7BA94D] rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-light text-[#014421]">Admin Panel</h2>
            </div>
          </motion.div>
          
          {/* Page content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
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
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 