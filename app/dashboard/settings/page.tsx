'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useRouter } from 'next/navigation';

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
import HelpGuide from '@/app/components/HelpGuide';
import { AlertCircle, Check, Download, FileText, Lightbulb, Lock, Mail, Save, User } from "lucide-react";;
interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  purchases: any[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Settings!');
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Settings!');
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/user/update-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await res.json();
      const normalized = { ...data.user, purchases: data.user?.purchases || [] };
      setUserData(normalized as any);
      setName(data.user.name || '');
      setEmail(data.user.email);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Kunde inte hämta användardata' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate passwords if changing
    if (newPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Ange ditt nuvarande lösenord' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Lösenorden matchar inte' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Lösenordet måste vara minst 6 tecken' });
        return;
      }
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const body: any = { name, email };
      
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      setMessage({ type: 'success', text: 'Dina uppgifter har uppdaterats!' });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Update local user data
      if (data.user) {
        setUserData({ ...data.user, purchases: userData?.purchases || [] } as any);
        // Re-fetch to include purchases from server
        fetchUserData();
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Kunde inte uppdatera profilen' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />
      
      {/* Course Navigation - At the very top like overview page */}
      <CourseNavigation courseType="basics" currentWeek={1} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#014421] mb-8">Kontoinställningar</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-primary" />
              Profilinformation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Namn
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ditt namn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-postadress
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="text-primary" />
              Byt lösenord
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuvarande lösenord
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nytt lösenord
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Bekräfta nytt lösenord
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Save Password Button */}
              {(newPassword || currentPassword) && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sparar lösenord...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Spara nytt lösenord
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Receipts Section */}
          {userData?.purchases?.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-primary" />
                Kvitton
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                Ladda ner kvitton för dina kursköp. Dessa kan användas för friskvårdsbidrag.
              </p>

              <div className="space-y-3">
                {userData?.purchases?.map((purchase: any) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{purchase.course.name}</h3>
                      <p className="text-sm text-gray-600">
                        Köpt: {new Date(purchase.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        if (!token) return;

                        // Open receipt in new window
                        const receiptWindow = window.open('', '_blank');
                        if (!receiptWindow) return;

                        // Fetch and display receipt
                        fetch(`/api/user/purchases/${purchase.id}/receipt`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
                        .then(res => res.text())
                        .then(html => {
                          receiptWindow.document.write(html);
                          receiptWindow.document.close();
                          
                          // Auto-print after a short delay
                          setTimeout(() => {
                            receiptWindow.print();
                          }, 500);
                        })
                        .catch(err => {
                          console.error('Error fetching receipt:', err);
                          receiptWindow.close();
                          setMessage({ type: 'error', text: 'Kunde inte hämta kvittot' });
                        });
                      }}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Ladda ner kvitto</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-background rounded-lg">
                <p className="text-sm text-secondary">
                  <Lightbulb className="w-5 h-5 inline" /> <strong>Tips:</strong> För att spara som PDF, klicka på "Ladda ner kvitto" och välj sedan "Skriv ut" → "Spara som PDF" i utskriftsdialogrutan.
                </p>
              </div>
            </div>
          )}

          {/* Account Info */}
          {userData && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Kontoinformation</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Medlem sedan: {new Date(userData.createdAt).toLocaleDateString('sv-SE')}</p>
                <p>Antal kurser: {userData.purchases?.length ?? 0}</p>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-background text-secondary' 
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Spara ändringar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={false}
        onClose={() => {}}
        weekNumber={0}
        weekTitle="Inställningar"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </div>
  );
} 