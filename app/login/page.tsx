"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'sv'|'en'|'es'|'de'|'fr'>('sv');
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
          // Check user's actual course purchases for smart redirect
          try {
            const purchasesRes = await fetch('/api/user/purchases', {
              headers: {
                'Authorization': `Bearer ${data.token}`
              }
            });
            
            if (purchasesRes.ok) {
              const purchasesData = await purchasesRes.json();
              const purchases = purchasesData.purchases || purchasesData;
              
              if (purchases.length > 0) {
                // Find which courses the user owns
                const ownedCourses = purchases.map((p: any) => p.course.name);
                
                if (ownedCourses.includes('Functional Flow') && !ownedCourses.includes('Functional Basics')) {
                  // Only Flow course
                  router.push('/dashboard/courses/functional-flow');
                } else if (ownedCourses.includes('Functional Basics') && !ownedCourses.includes('Functional Flow')) {
                  // Only Basic course
                  router.push('/dashboard/courses/functional-basics');
                } else if (ownedCourses.includes('Functional Flow')) {
                  // If they have both, prioritize Flow (advanced course)
                  router.push('/dashboard/courses/functional-flow');
                } else if (ownedCourses.includes('Functional Basics')) {
                  // Fallback to Basic
                  router.push('/dashboard/courses/functional-basics');
                } else {
                  // Has purchases but not these specific courses
                  router.push('/mina-kurser');
                }
              } else {
                // No courses purchased
                router.push('/mina-kurser');
              }
            } else {
              // Fallback if API call fails
              router.push('/mina-kurser');
            }
          } catch (error) {
            console.error('Error checking purchases for redirect:', error);
            router.push('/mina-kurser');
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
          body: JSON.stringify({ email, password, name, nationality, preferredLanguage }),
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
          router.push('/mina-kurser');
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-background-secondary rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          {/* Header with Logo */}
          <div className="pt-10 pb-4 px-8 text-center bg-background-secondary">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">FF</span>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              {isLogin ? 'Välkommen tillbaka!' : 'Skapa ditt konto'}
            </h2>
            <p className="text-text-secondary">
              {isLogin 
                ? 'Logga in för att fortsätta din hälsoresa' 
                : 'Börja din resa mot bättre hälsa idag'}
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ditt namn"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
 
            {!isLogin && (
              <div className="animate-slideIn grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationalitet</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Sverige"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Språk</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as any)}
                    className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="sv">Svenska</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-slideIn">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bekräfta lösenord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-background-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-light">
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
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#FF7e70] text-white hover:bg-[#e56b5e] hover:scale-[1.02] shadow-lg'
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

          {/* Footer */}
          <div className="bg-background-secondary px-8 py-4 border-t border-border">
            <p className="text-center text-sm text-text-secondary">
              {isLogin ? (
                <>
                  Har du inget konto?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary font-semibold hover:text-primary-light transition-colors"
                  >
                    Registrera dig
                  </button>
                </>
              ) : (
                <>
                  Har du redan ett konto?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary font-semibold hover:text-primary-light transition-colors"
                  >
                    Logga in
                  </button>
                </>
              )}
            </p>
          </div>


        </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="mb-8">
            <div className="w-24 h-24 bg-accent rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Inloggning lyckades!</h1>
            <p className="text-text-secondary">Du omdirigeras till din dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 