"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect parameter
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Något gick fel');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Handle redirect logic
        if (redirect) {
          router.push(redirect);
        } else {
          // Check if user has specific course access and redirect accordingly
          if (email === 'basics@test.se') {
            router.push('/dashboard/courses/functional-basics');
          } else if (email === 'flow@test.se') {
            router.push('/dashboard/courses/functional-flow');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        // Register logic
        if (password !== confirmPassword) {
          throw new Error('Lösenorden matchar inte');
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Något gick fel vid registrering');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Handle redirect logic for registration
        if (redirect) {
          router.push(redirect);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Reset form
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main container */}
      <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Back to home */}
        <Link 
          href="/" 
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>

        {/* Logo/Header */}
        <div className="pt-12 pb-6 px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">FF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Välkommen tillbaka' : 'Skapa konto'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Logga in för att fortsätta' : 'Börja din hälsoresa idag'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {!isLogin && (
            <div className="animate-slideIn">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Namn
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Ditt namn"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-postadress
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="din@email.se"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lösenord
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="animate-slideIn">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bekräfta lösenord
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Glömt lösenordet?
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:scale-[1.02] shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Loggar in...' : 'Skapar konto...'}
              </span>
            ) : (
              <span>{isLogin ? 'Logga in' : 'Skapa konto'}</span>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="px-8 pb-8 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Har du inget konto?' : 'Har du redan ett konto?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              {isLogin ? 'Registrera dig' : 'Logga in'}
            </button>
          </p>
        </div>

        {/* Demo credentials for login only */}
        {isLogin && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Demo-inloggning:</p>
            <p className="text-xs text-gray-500">Email: test@example.com | Lösenord: test123</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @media (max-width: 640px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
} 