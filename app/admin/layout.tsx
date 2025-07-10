"use client";
import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome, FiUsers, FiBookOpen, FiDollarSign, FiSettings, FiLogOut,
  FiMenu, FiX, FiFileText, FiVideo, FiShoppingBag, FiBarChart
} from "react-icons/fi";

const menuItems = [
  { icon: FiHome, label: "Översikt", href: "/admin" },
  { icon: FiUsers, label: "Användare", href: "/admin/users" },
  { icon: FiBookOpen, label: "Kurser", href: "/admin/courses" },
  { icon: FiFileText, label: "Blogg", href: "/admin/blog" },
  { icon: FiVideo, label: "Recept", href: "/admin/recipes" },
  { icon: FiShoppingBag, label: "Beställningar", href: "/admin/orders" },
  { icon: FiBarChart, label: "Försäljning", href: "/admin/sales" },
  { icon: FiSettings, label: "Inställningar", href: "/admin/settings" },
];

function SidebarContent() {
    const pathname = usePathname();
    const router = useRouter();
    
    const handleLogout = () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Rensa admin-cookie
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/admin/login');
    };
    
    return (
         <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">FF</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Admin Portal</h2>
                  <p className="text-xs text-gray-500">Functional Foods</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-grow px-4 space-y-1 pt-6 pb-4 overflow-y-auto">
              {menuItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  
                  return (
                     <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-600'} transition-colors`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                  )
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 group"
              >
                <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Logga ut</span>
              </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if admin is logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <SidebarContent />
            </div>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
                    <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FF</span>
                      </div>
                      <span className="font-bold text-gray-900">Admin</span>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
                
                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    </div>
  );
} 