'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBookOpen, FiActivity, FiUsers, FiCalendar, FiDownload, FiSettings, FiMenu, FiX, FiLogOut, FiHeart } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import Header from '@/app/components/Header';

const menuItems = [
  { href: '/dashboard', icon: FiHome, label: 'Översikt' },
  { href: '/dashboard/courses', icon: FiBookOpen, label: 'Mina kurser' },
  { href: '/dashboard/health', icon: FiActivity, label: 'Hälsospårning' },
  { href: '/dashboard/my-health', icon: FiHeart, label: 'Min Hälsa' },
  { href: '/dashboard/community', icon: FiUsers, label: 'Community' },
  { href: '/dashboard/coaching', icon: FiCalendar, label: 'Coaching' },
  { href: '/dashboard/downloads', icon: FiDownload, label: 'Nerladdningar' },
  { href: '/dashboard/settings', icon: FiSettings, label: 'Inställningar' },
];

function SidebarContent() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-full">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo2.png" alt="Logo" className="h-12 w-auto" />
                </Link>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            pathname === item.href
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
                {user && (
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">{user.name || 'Användare'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                )}
                 <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 mt-4 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logga ut</span>
                </button>
            </div>
        </div>
    );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <div className="flex">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 flex z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="fixed inset-0 bg-black/60" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
            <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition-transform ${sidebarOpen ? 'transform-none' : '-translate-x-full'}`}>
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Stäng sidomeny</span>
                        <FiX className="h-6 w-6 text-white" />
                    </button>
                </div>
                <SidebarContent />
            </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-60 border-r border-gray-200 bg-white">
            <SidebarContent />
          </div>
        </div>
        
        {/* Main content med Header-hantering */}
        <div className="flex flex-col flex-1">
          <div className="lg:hidden p-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
              <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
                  <span className="sr-only">Öppna sidomeny</span>
                  <FiMenu className="h-6 w-6" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                  <img src="/logo2.png" alt="Logo" className="h-10 w-auto" />
              </Link>
          </div>
          <main className="flex-1 pt-20">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 