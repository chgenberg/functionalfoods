"use client";
import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  FiHome, FiUsers, FiBookOpen, FiDollarSign, FiSettings, FiLogOut,
  FiMenu, FiX, FiFileText, FiVideo
} from "react-icons/fi";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/hooks/useAuth";

const menuItems = [
  { icon: FiHome, label: "Översikt", href: "/admin" },
  { icon: FiUsers, label: "Användare", href: "/admin/users" },
  { icon: FiBookOpen, label: "Kurser", href: "/admin/courses" },
  { icon: FiFileText, label: "Blogg", href: "/admin/blog" },
  { icon: FiVideo, label: "Recept", href: "/admin/recipes" },
  { icon: FiDollarSign, label: "Försäljning", href: "/admin/sales" },
  { icon: FiSettings, label: "Inställningar", href: "/admin/settings" },
];

function SidebarContent() {
    const pathname = usePathname();
    const { logout } = useAuth();
    
    return (
         <div className="flex flex-col h-full">
            <nav className="flex-grow px-4 space-y-2 pt-8 pb-4 overflow-y-auto">
              {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                     <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-primary hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary group-hover:scale-110 transition-transform'}`} />
                        <span className="font-medium text-sm uppercase tracking-wider">{item.label}</span>
                      </Link>
                  )
              })}
            </nav>
            <div className="p-4 border-t border-primary/10 mt-auto">
              <button 
                onClick={logout} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white bg-primary hover:bg-secondary rounded-xl transition-all duration-200 group"
              >
                <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm uppercase tracking-wider">Logga ut</span>
              </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <div className="flex pt-20">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="fixed inset-0 bg-black/60" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-background-secondary transition-transform shadow-2xl ${sidebarOpen ? 'transform-none' : '-translate-x-full'}`}>
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button 
                            type="button" 
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white focus:outline-none focus:ring-2 focus:ring-white" 
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>
                    <SidebarContent />
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 bg-background-secondary shadow-sm h-[calc(100vh-5rem)] sticky top-20">
                    <SidebarContent />
                </div>
            </div>
            
            <div className="flex flex-col flex-1">
                 <div className="lg:hidden p-4 bg-white shadow-sm flex items-center justify-between sticky top-20 z-10">
                    <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    >
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <span className="text-primary font-bold uppercase tracking-wider">Admin Panel</span>
                </div>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    </div>
  );
} 