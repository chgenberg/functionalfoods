"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Shield, Check, Users, AlertTriangle, Merge, BookOpen, Plus, Trash2, GraduationCap } from 'lucide-react';

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
  purchaseId?: string;
}

interface AvailableCourse {
  id: string;
  name: string;
  price: number;
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
  
  // Course management state
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState<string>('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [removingCourse, setRemovingCourse] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchAvailableCourses();
  }, [params.id]);
  
  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch('/api/admin/functional-courses');
      if (response.ok) {
        const data = await response.json();
        // Map course products to our format
        const courses = (data.courses || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          price: c.price || c.salePrice || c.basePrice || 0
        }));
        setAvailableCourses(courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

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

  const handleAddCourse = async () => {
    if (!selectedCourseToAdd || !user) return;
    
    setAddingCourse(true);
    try {
      const response = await fetch('/api/admin/users/add-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: selectedCourseToAdd
        })
      });
      
      if (response.ok) {
        await fetchUser(); // Refresh user data
        setSelectedCourseToAdd('');
        alert('Kurstillgång tillagd!');
      } else {
        const error = await response.json();
        alert(error.error || 'Kunde inte lägga till kurs');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Ett fel uppstod');
    } finally {
      setAddingCourse(false);
    }
  };
  
  const handleRemoveCourse = async (purchaseId: string, courseName: string) => {
    if (!confirm(`Är du säker på att du vill ta bort tillgång till "${courseName}"?`)) {
      return;
    }
    
    setRemovingCourse(purchaseId);
    try {
      const response = await fetch(`/api/admin/users/remove-course?purchaseId=${purchaseId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchUser(); // Refresh user data
        alert('Kurstillgång borttagen');
      } else {
        const error = await response.json();
        alert(error.error || 'Kunde inte ta bort kurs');
      }
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Ett fel uppstod');
    } finally {
      setRemovingCourse(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4">Laddar användare...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">Användare hittades inte</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka</span>
        </button>
        <h1 className="text-3xl font-light text-[var(--primary-green)]">Redigera användare</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="admin-card space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-light)]">
            <div className="w-16 h-16 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[var(--primary-green)]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[var(--text-primary)]">{user.name || user.email}</h2>
              <p className="text-[var(--text-secondary)]">ID: {user.id}</p>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="admin-label">
              Namn
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input"
              placeholder="Användarens namn"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="admin-label">
              E-postadress
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[var(--text-secondary)] w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="admin-input pl-10"
                required
              />
            </div>
          </div>

          {/* Role Field */}
          <div>
            <label className="admin-label">
              Roll
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-[var(--text-secondary)] w-5 h-5" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="admin-select pl-10"
              >
                <option value="customer">Kund</option>
                <option value="admin">Administratör</option>
              </select>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="admin-label">
              Nytt lösenord (lämna tomt för att behålla nuvarande)
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="admin-input"
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
              className="w-5 h-5 text-[var(--primary-green)] rounded focus:ring-[var(--primary-light-green)]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[var(--text-primary)]">
              Aktiv användare
            </label>
          </div>

          {/* Meta Information */}
          <div className="bg-[var(--primary-beige)] rounded-lg p-4 space-y-2 text-sm text-[var(--text-secondary)]">
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

          {/* Course Access Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5" />
              Kurstillgångar
            </h3>
            
            {/* Current courses */}
            <div className="space-y-3 mb-4">
              {user.courses && user.courses.length > 0 ? (
                user.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between bg-white border border-[var(--border-light)] rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary-beige)] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{course.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Köpt: {new Date(course.purchaseDate).toLocaleDateString('sv-SE')}
                          {course.amount > 0 && ` • ${course.amount} kr`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course.purchaseId || course.id, course.name)}
                      disabled={removingCourse === (course.purchaseId || course.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Ta bort kurstillgång"
                    >
                      {removingCourse === (course.purchaseId || course.id) ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-[var(--text-secondary)] bg-[var(--primary-beige)] rounded-lg">
                  Inga kurser tilldelade
                </div>
              )}
            </div>
            
            {/* Add course */}
            <div className="flex gap-2">
              <select
                value={selectedCourseToAdd}
                onChange={(e) => setSelectedCourseToAdd(e.target.value)}
                className="admin-select flex-1"
              >
                <option value="">Välj kurs att lägga till...</option>
                {availableCourses
                  .filter(course => !user.courses?.some(uc => uc.id === course.id || uc.name === course.name))
                  .map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.price} kr)
                    </option>
                  ))
                }
              </select>
              <button
                type="button"
                onClick={handleAddCourse}
                disabled={!selectedCourseToAdd || addingCourse}
                className="admin-btn admin-btn-primary"
              >
                {addingCourse ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Lägg till
              </button>
            </div>
          </div>

          {/* Course Merge Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
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
                className="text-sm text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
              >
                {showMergeSection ? 'Dölj' : 'Visa alternativ'}
              </button>
            </div>

            {showMergeSection && (
              <div className="admin-alert admin-alert-success mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--primary-green)] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Slå ihop kurser från andra användare</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Hitta användare med samma e-postadress och slå ihop deras kurser till denna användare. 
                      Detta är användbart när kunder har skapat flera konton.
                    </p>
                  </div>
                </div>

                {loadingDuplicates ? (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <div className="w-4 h-4 border-2 border-[var(--primary-light-green)] border-t-transparent rounded-full animate-spin" />
                    Söker efter dubbletter...
                  </div>
                ) : duplicates.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="font-medium text-[var(--text-primary)]">
                      Hittade {duplicates.length} användare med samma e-post:
                    </h5>
                    {duplicates.map((duplicate) => (
                      <div key={duplicate.id} className="bg-white border border-[var(--border-light)] rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">
                              {duplicate.name || 'Inget namn'} ({duplicate.email})
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Registrerad: {new Date(duplicate.createdAt).toLocaleDateString('sv-SE')}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Kurser ({duplicate.coursesCount}): {duplicate.courses.join(', ') || 'Inga kurser'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMergeCourses(duplicate.id)}
                            disabled={merging || duplicate.coursesCount === 0}
                            className="admin-btn admin-btn-primary"
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
                  <div className="text-center py-4 text-[var(--text-secondary)]">
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
              className="flex-1 admin-btn admin-btn-primary justify-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Spara ändringar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="admin-btn admin-btn-secondary"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 