'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddUserModal from './AddUserModal';
import { UserPlus, Search, Edit3, Trash2, ChevronLeft, ChevronRight, Mail, Calendar, Shield, Users, UserCheck, TrendingUp } from 'lucide-react';

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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar användare...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && <AddUserModal onClose={() => setShowModal(false)} onAdd={handleAddUser} />}
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Användarhantering</h1>
          <p className="text-gray-600">Hantera alla användare i systemet</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök användare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="all">Alla roller</option>
                <option value="USER">Användare</option>
                <option value="ADMIN">Administratör</option>
              </select>
              
              <button 
                onClick={() => setShowModal(true)} 
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-[#014421] transition-colors flex items-center gap-2 font-medium"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Lägg till användare</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Totalt antal</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Administratörer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Aktiva</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nya (30d)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const created = new Date(u.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return created > thirtyDaysAgo;
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Användare
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Roll
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registrerad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchTerm ? 'Inga användare hittades för din sökning.' : 'Inga användare hittades.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-gray-100'
                          } flex items-center justify-center font-medium`}>
                            <span className={user.role === 'ADMIN' ? 'text-purple-600' : 'text-gray-600'}>
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || 'Ingen namn'}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Users className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            user.role === 'ADMIN' ? 'text-purple-600' : 'text-gray-600'
                          }`}>
                            {user.role === 'ADMIN' ? 'Administratör' : 'Användare'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link 
                            href={`/admin/users/${user.id}/edit`}
                            className="p-2 text-gray-500 hover:text-primary transition-colors"
                            title="Redigera"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Ta bort"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4">
              <p className="text-sm text-gray-600">
                Visar {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} av {filteredUsers.length} användare
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Sida {currentPage} av {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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