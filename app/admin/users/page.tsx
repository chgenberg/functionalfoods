'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import AddUserModal from './AddUserModal';
import { motion } from 'framer-motion';
import { UserPlus, Search, Edit3, Trash2, ChevronLeft, ChevronRight, Mail, Calendar, Shield, Users } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (newUser: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await fetchUsers();
        setShowModal(false);
        alert(`Användaren "${newUser.name}" har lagts till!`);
      } else {
        alert('Fel vid skapande av användare');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Fel vid skapande av användare');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Är du säker på att du vill ta bort användaren "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchUsers();
        alert('Användaren har tagits bort');
      } else {
        alert('Fel vid borttagning av användare');
      }
    } catch (err) {
      alert('Fel vid borttagning av användare');
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93C560] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar användare...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && <AddUserModal onClose={() => setShowModal(false)} onAdd={handleAddUser} />}
      
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#014421] mb-2 flex items-center gap-3">
                <span className="text-3xl">👥</span> Användarhantering
              </h1>
              <p className="text-gray-600">Hantera alla användare i systemet</p>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7E70] to-[#ff6b5a] text-white px-6 py-3 rounded-xl hover:from-[#ff6b5a] hover:to-[#FF7E70] transition-all shadow-md hover:shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Lägg till användare</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#F3EFE3]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Totalt antal</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#014421]">{users.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF7E70]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#F3EFE3]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Admins</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#014421]">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🛡️</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#F3EFE3]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Aktiva</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#014421]">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">✅</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#F3EFE3]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Senaste 30 dagar</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#014421]">
                    {users.filter(u => {
                      const created = new Date(u.createdAt);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return created > thirtyDaysAgo;
                    }).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🆕</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sök användare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  roleFilter === 'all' 
                    ? 'bg-[#93C560] text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Alla
              </button>
              <button
                onClick={() => setRoleFilter('USER')}
                className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  roleFilter === 'USER' 
                    ? 'bg-[#93C560] text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Användare
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  roleFilter === 'ADMIN' 
                    ? 'bg-[#93C560] text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#F3EFE3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F1E8] border-b border-[#F3EFE3]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Användare
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Roll
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Registrerad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE3]">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <span className="text-5xl mb-4 block">👥</span>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? 'Inga användare hittades för din sökning.' : 'Inga användare hittades.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#F7F1E8]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                            user.role === 'ADMIN' ? 'from-[#93C560] to-[#84b351]' : 'from-[#FF7E70] to-[#ff6b5a]'
                          } text-white flex items-center justify-center font-medium shadow-sm flex-shrink-0`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4 min-w-0">
                            <p className="text-sm font-medium text-[#014421] truncate">
                              {user.name || 'Ingen namn'}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <span className="text-xs">✉️</span>
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-[#93C560]/20 text-[#014421]' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.isActive ? (
                            <><span className="mr-1">✅</span> Aktiv</>
                          ) : (
                            <><span className="mr-1">⏸️</span> Inaktiv</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {user.role === 'ADMIN' ? '🛡️' : '👤'}
                          </span>
                          <span className={`text-sm font-medium ${
                            user.role === 'ADMIN' ? 'text-[#93C560]' : 'text-gray-600'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Användare'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-gray-500">
                          <span className="text-sm">📅</span>
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link 
                            href={`/admin/users/${user.id}/edit`}
                            className="p-2 text-[#93C560] hover:text-[#84b351] hover:bg-[#93C560]/10 rounded-lg transition-all"
                            title="Redigera"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Ta bort"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-[#F3EFE3] gap-4">
              <p className="text-sm text-gray-600">
                Visar {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} av {filteredUsers.length} användare
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-[#014421] hover:bg-[#93C560]/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-[#014421]">
                  Sida {currentPage} av {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-[#014421] hover:bg-[#93C560]/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 