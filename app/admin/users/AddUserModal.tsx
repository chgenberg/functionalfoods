'use client';

import { useState } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (user: any) => void;
}

export default function AddUserModal({ onClose, onAdd }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Kund'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktiv',
      avatar: formData.name.charAt(0).toUpperCase(),
      color: formData.role === 'Admin' ? 'bg-secondary' : 'bg-primary'
    };
    
    onAdd(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-primary/10 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Lägg till användare</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 group"
          >
            <FiX className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Namn
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Ange användarens namn"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              E-postadress
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="exempel@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Lösenord
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Minst 8 tecken"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Roll
            </label>
            <div className="relative">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="Kund">Kund</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-background hover:bg-gray-200 text-primary font-semibold rounded-xl transition-all duration-200 uppercase text-sm tracking-wider"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-xl transition-all duration-200 uppercase text-sm tracking-wider group"
            >
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 