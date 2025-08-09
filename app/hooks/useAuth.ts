import { useEffect, useState } from 'react';

type User = {
  id?: string;
  email: string;
  role: string;
  name?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ id: payload.id || payload.userId, email: payload.email, role: payload.role, name: payload.name });
        setToken(storedToken);
      } catch (e) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
  }, []);

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ id: payload.id || payload.userId, email: payload.email, role: payload.role, name: payload.name });
      setToken(newToken);
    } catch (e) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    window.location.href = '/';
  }

  return { user, token, login, logout };
} 