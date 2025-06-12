'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiSave, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';

export default function NewUserPage() {
  const router = useRouter();

  const handleSave = () => {
    alert('Användare skapad! (Dummy)');
    router.push('/admin/users');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/users" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <FiChevronLeft className="w-5 h-5" />
            <span>Tillbaka till användare</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Skapa ny användare</h1>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Fullständigt namn</label>
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" id="name" placeholder="Anna Andersson" className="input-style pl-12" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-postadress</label>
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" id="email" placeholder="anna@email.com" className="input-style pl-12" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Lösenord</label>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="password" id="password" placeholder="••••••••" className="input-style pl-12" required />
                    </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Roll</label>
                   <div className="relative">
                        <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select id="role" className="input-style pl-12 appearance-none">
                            <option>Kund</option>
                            <option>Admin</option>
                        </select>
                    </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-5 py-3 rounded-lg transition-colors">
                      <FiSave className="w-5 h-5"/>
                      <span>Spara användare</span>
                    </button>
                </div>
            </form>
        </div>
      </div>
      <style jsx>{`
        .input-style {
          @apply w-full px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
        }
      `}</style>
    </div>
  );
} 