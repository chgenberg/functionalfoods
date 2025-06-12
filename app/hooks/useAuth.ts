import { useEffect, useState } from 'react';

type User = {
  email: string;
  role: string;
  name?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, role: payload.role, name: payload.name });
      } catch (e) {
        setUser(null);
        localStorage.removeItem('token');
      }
    }
  }, []);

  function login(token: string) {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.email, role: payload.role, name: payload.name });
    } catch (e) {
      setUser(null);
      localStorage.removeItem('token');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/'; // Omdirigera till startsidan
  }

  return { user, login, logout };
} 