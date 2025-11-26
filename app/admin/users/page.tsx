'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddUserModal from './AddUserModal';

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
  const usersPerPage = 15;

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
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar användare...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && <AddUserModal onClose={() => setShowModal(false)} onAdd={handleAddUser} />}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[var(--text-primary)]">Användare</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera alla användare</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors text-sm"
          >
            Lägg till användare
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Totalt</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{users.length}</p>
          </div>
          <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Administratörer</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
          <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Aktiva</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {users.filter(u => u.isActive).length}
            </p>
          </div>
          <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Nya (30d)</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
              {users.filter(u => {
                const created = new Date(u.createdAt);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return created > thirtyDaysAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Sök användare..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
            >
              <option value="all">Alla roller</option>
              <option value="USER">Användare</option>
              <option value="ADMIN">Administratör</option>
            </select>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white border border-[var(--border-light)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-light)]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Användare</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Roll</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Registrerad</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    {searchTerm ? 'Inga användare hittades' : 'Inga användare'}
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-beige)] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-[var(--primary-green)]">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{user.name || 'Ingen namn'}</p>
                          <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs ${user.role === 'ADMIN' ? 'text-orange-600' : 'text-[var(--text-secondary)]'}`}>
                        {user.role === 'ADMIN' ? 'Administratör' : 'Användare'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link 
                          href={`/admin/users/${user.id}/edit`}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 transition-colors"
                        >
                          Redigera
                        </Link>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Ta bort
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-[var(--border-light)] gap-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Visar {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} av {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Föregående
                </button>
                <span className="text-xs text-[var(--text-secondary)]">
                  Sida {currentPage} av {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Nästa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
