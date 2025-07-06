"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      // Spara token i localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect till kurssidan
      router.push('/mina-kurser');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffdf3' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Välkommen tillbaka</h1>
          <p className="text-gray-600">Logga in för att komma åt dina kurser</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-postadress
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="din@email.se"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lösenord
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Har du inget konto?{' '}
            <Link href="/register" className="text-accent hover:underline">
              Registrera dig här
            </Link>
          </p>
        </div>

        {/* Test credentials info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Test-inloggning:</p>
          <p className="text-sm text-blue-700">Email: test@example.com</p>
          <p className="text-sm text-blue-700">Lösenord: test123</p>
        </div>
      </div>
    </div>
  );
} 