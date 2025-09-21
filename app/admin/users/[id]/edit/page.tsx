"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Shield, Check, Users, AlertTriangle, Merge } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  courses?: Course[];
  coursesCount?: number;
}

interface Course {
  id: string;
  name: string;
  purchaseDate: string;
  amount: number;
}

interface DuplicateUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  courses: string[];
  coursesCount: number;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateUser[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [showMergeSection, setShowMergeSection] = useState(false);
  const [merging, setMerging] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    isActive: true,
    newPassword: ''
  });

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          newPassword: ''
        });
      } else {
        alert('Kunde inte hämta användare');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Ett fel uppstod');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDuplicates = async () => {
    if (!user) return;
    
    setLoadingDuplicates(true);
    try {
      const response = await fetch(`/api/admin/users/find-duplicates?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.sameEmailUsers || []);
      } else {
        console.error('Failed to fetch duplicates');
      }
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const handleMergeCourses = async (sourceUserId: string) => {
    if (!user || !confirm('Är du säker på att du vill slå ihop kurserna? Detta kan inte ångras.')) {
      return;
    }

    setMerging(true);
    try {
      const response = await fetch('/api/admin/users/merge-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUserId,
          targetUserId: user.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Kurser har slagits ihop framgångsrikt!\n\n${result.message}\n\nDetaljer:\n- Överförda kurser: ${result.details.transferredPurchases}\n- Totala kurser efter sammanslagning: ${result.details.totalCoursesAfterMerge}\n- Kurser: ${result.details.courses.join(', ')}`);
        
        // Refresh user data and duplicates
        await fetchUser();
        await fetchDuplicates();
      } else {
        const error = await response.json();
        alert(`Fel vid sammanslagning: ${error.error}`);
      }
    } catch (error) {
      console.error('Error merging courses:', error);
      alert('Ett fel uppstod vid sammanslagning av kurser');
    } finally {
      setMerging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        router.push('/admin/users');
      } else {
        const error = await response.json();
        alert(error.error || 'Kunde inte uppdatera användare');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ett fel uppstod');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar användare...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Användare hittades inte</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft />
          Tillbaka
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Redigera användare</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name || user.email}</h2>
              <p className="text-gray-500">ID: {user.id}</p>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Namn
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Användarens namn"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-postadress
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="customer">Kund</option>
                <option value="admin">Administratör</option>
              </select>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nytt lösenord (lämna tomt för att behålla nuvarande)
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Aktiv användare
            </label>
          </div>

          {/* Meta Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Registrerad:</span>
              <span>{new Date(user.createdAt).toLocaleDateString('sv-SE')}</span>
            </div>
            {user.lastLogin && (
              <div className="flex justify-between">
                <span>Senaste inloggning:</span>
                <span>{new Date(user.lastLogin).toLocaleDateString('sv-SE')}</span>
              </div>
            )}
          </div>

          {/* Course Merge Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Slå ihop kurser
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowMergeSection(!showMergeSection);
                  if (!showMergeSection && duplicates.length === 0) {
                    fetchDuplicates();
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showMergeSection ? 'Dölj' : 'Visa alternativ'}
              </button>
            </div>

            {showMergeSection && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Slå ihop kurser från andra användare</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Hitta användare med samma e-postadress och slå ihop deras kurser till denna användare. 
                      Detta är användbart när kunder har skapat flera konton.
                    </p>
                  </div>
                </div>

                {loadingDuplicates ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Söker efter dubbletter...
                  </div>
                ) : duplicates.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">
                      Hittade {duplicates.length} användare med samma e-post:
                    </h5>
                    {duplicates.map((duplicate) => (
                      <div key={duplicate.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {duplicate.name || 'Inget namn'} ({duplicate.email})
                            </div>
                            <div className="text-sm text-gray-600">
                              Registrerad: {new Date(duplicate.createdAt).toLocaleDateString('sv-SE')}
                            </div>
                            <div className="text-sm text-gray-600">
                              Kurser ({duplicate.coursesCount}): {duplicate.courses.join(', ') || 'Inga kurser'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMergeCourses(duplicate.id)}
                            disabled={merging || duplicate.coursesCount === 0}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {merging ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Slår ihop...
                              </>
                            ) : (
                              <>
                                <Merge className="w-4 h-4" />
                                Slå ihop kurser
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600">
                    Inga dubbletter hittades för denna e-postadress.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save />
                  Spara ändringar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 