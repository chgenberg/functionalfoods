'use client';

import { useState } from 'react';
import { FiUserPlus, FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import AddUserModal from './AddUserModal';

const users = [
  {
    id: 1,
    name: 'Anna Andersson',
    email: 'anna@email.com',
    role: 'Kund',
    joinDate: '2024-03-15',
    status: 'Aktiv',
    avatar: 'A',
    color: 'bg-primary',
  },
  {
    id: 2,
    name: 'Erik Johansson',
    email: 'erik.j@email.com',
    role: 'Kund',
    joinDate: '2024-02-28',
    status: 'Inaktiv',
    avatar: 'E',
    color: 'bg-secondary',
  },
  {
    id: 3,
    name: 'Maria Nilsson',
    email: 'maria.n@email.com',
    role: 'Kund',
    joinDate: '2024-01-10',
    status: 'Aktiv',
    avatar: 'M',
    color: 'bg-accent',
  },
  {
    id: 4,
    name: 'Lars Persson',
    email: 'lars.p@email.com',
    role: 'Kund',
    joinDate: '2023-12-05',
    status: 'Aktiv',
    avatar: 'L',
    color: 'bg-primary',
  },
    {
    id: 5,
    name: 'Admin Ulrika',
    email: 'admin@functionalfoods.com',
    role: 'Admin',
    joinDate: '2023-01-01',
    status: 'Aktiv',
    avatar: 'A',
    color: 'bg-secondary',
  },
];

export default function AdminUsersPage() {
  const [userList, setUserList] = useState(users);
  const [showModal, setShowModal] = useState(false);

  const handleAddUser = (newUser: any) => {
    setUserList(prev => [newUser, ...prev]);
    setShowModal(false);
    alert(`Användaren "${newUser.name}" har lagts till!`);
  };

  return (
    <>
      {showModal && <AddUserModal onClose={() => setShowModal(false)} onAdd={handleAddUser} />}
      <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">ANVÄNDARE</h1>
          <p className="text-lg text-text-secondary mt-1">Hantera alla användare i systemet.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 mt-4 sm:mt-0 uppercase text-sm tracking-wider group">
          <FiUserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Lägg till användare</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="text"
              placeholder="Sök användare..."
              className="w-full sm:w-80 pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-primary font-medium uppercase text-sm tracking-wider">
              <option>Alla roller</option>
              <option>Admin</option>
              <option>Kund</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-primary/10">
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Namn</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Roll</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider hidden lg:table-cell">Gick med</th>
                <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(user => (
                <tr key={user.id} className="border-b border-primary/5 hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full ${user.color} text-white flex-shrink-0 flex items-center justify-center text-lg font-medium shadow-sm`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{user.name}</p>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <FiMail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      user.status === 'Aktiv' ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FiShield className={`w-4 h-4 ${user.role === 'Admin' ? 'text-primary' : 'text-text-secondary'}`} />
                      <span className={`font-medium ${user.role === 'Admin' ? 'text-primary' : 'text-text-secondary'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <FiCalendar className="w-4 h-4" />
                      <span className="text-sm">{user.joinDate}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-primary/10">
            <p className="text-sm text-text-secondary mb-4 sm:mb-0">
                VISAR <span className="font-bold text-primary">1</span>-<span className="font-bold text-primary">5</span> AV <span className="font-bold text-primary">1257</span> ANVÄNDARE
            </p>
            <div className="flex items-center gap-2">
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" disabled>
                    <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg uppercase tracking-wider">1</span>
                <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">2</button>
                <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">3</button>
                <span className="text-text-secondary">...</span>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                    <FiChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
    </>
  );
} 