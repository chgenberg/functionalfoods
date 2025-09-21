'use client';

import { useState, useEffect } from 'react';
import { Save, Info, Lock, CreditCard, User, Eye, EyeOff, Bell } from 'lucide-react';

const SettingsCard = ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) => (
    <div className="admin-card">
        <div className="pb-6 border-b border-[var(--border-light)]">
            <h3 className="text-xl font-medium text-[var(--primary-green)]">{title}</h3>
            {subtitle && <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
        <div className="pt-6 space-y-6">
            {children}
        </div>
        <div className="pt-6 mt-6 border-t border-[var(--border-light)] flex justify-end">
            <button className="admin-btn admin-btn-primary">
                <Save className="w-4 h-4"/>
                <span>Spara ändringar</span>
            </button>
        </div>
    </div>
);

const FormRow = ({ label, description, children }: { label: string, description?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start">
        <div className="md:col-span-1">
            <h4 className="font-medium text-[var(--text-primary)]">{label}</h4>
            {description && <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Inställningar sparade: ' + data.message);
      } else {
        const error = await response.json();
        alert('Fel: ' + error.error);
      }
    } catch (error) {
      alert('Tekniskt fel vid sparande');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any, type: string = 'text', description: string = '') => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: { value, type, description }
    }));
  };

  const tabs = [
    { id: 'general', label: 'Allmänt', icon: Info },
    { id: 'security', label: 'Säkerhet', icon: Lock },
    { id: 'notifications', label: 'Notiser', icon: Bell },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <SettingsCard title="Allmänna inställningar" subtitle="Grundläggande information för din webbplats.">
            <FormRow label="Webbplatsens namn">
              <input 
                type="text" 
                value={settings['site.name']?.value || 'Functional Foods'} 
                onChange={(e) => updateSetting('site.name', e.target.value, 'text', 'Webbplatsens namn')}
                className="admin-input" 
              />
            </FormRow>
            <FormRow label="Primär e-post" description="Denna e-postadress används för viktig kommunikation.">
              <input 
                type="email" 
                value={settings['site.email']?.value || 'info@functionalfoods.se'} 
                onChange={(e) => updateSetting('site.email', e.target.value, 'text', 'Primär kontakt-email')}
                className="admin-input" 
              />
            </FormRow>
            <FormRow label="Primär färg" description="Huvudfärg för webbplatsen">
              <input 
                type="color" 
                value={settings['colors.primary']?.value || '#014421'} 
                onChange={(e) => updateSetting('colors.primary', e.target.value, 'text', 'Primär färg')}
                className="w-20 h-10 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-light-green)] transition-all cursor-pointer" 
              />
            </FormRow>
            <FormRow label="Sekundär färg" description="Accentfärg för knappar och highlights">
              <input 
                type="color" 
                value={settings['colors.secondary']?.value || '#93C560'} 
                onChange={(e) => updateSetting('colors.secondary', e.target.value, 'text', 'Sekundär färg')}
                className="w-20 h-10 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-light-green)] transition-all cursor-pointer" 
              />
            </FormRow>
            <FormRow label="Underhållsläge" description="Visar en underhållssida för alla icke-inloggade besökare.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[var(--border-light)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--primary-light-green)]/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
                </label>
            </FormRow>
          </SettingsCard>
        );
      case 'security':
        return (
          <SettingsCard title="Säkerhet och inloggning" subtitle="Hantera ditt lösenord och kontosäkerhet.">
              <FormRow label="Lösenord">
                  {!showPasswordForm ? (
                    <button 
                      onClick={() => setShowPasswordForm(true)}
                      className="font-semibold text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
                    >
                      Ändra lösenord
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nuvarande lösenord"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nytt lösenord"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="admin-input"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Bekräfta nytt lösenord"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="admin-input"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Här skulle du hantera lösenordsändringen
                            alert('Lösenordsändring implementeras snart!');
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="admin-btn admin-btn-primary"
                        >
                          Spara lösenord
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="admin-btn admin-btn-secondary"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  )}
              </FormRow>
              <FormRow label="Tvåfaktorsautentisering (2FA)" description="Öka säkerheten genom att kräva en andra verifieringsmetod.">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--border-light)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--primary-light-green)]/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
                  </label>
            </FormRow>
          </SettingsCard>
        );
      case 'notifications':
        return (
          <SettingsCard title="E-postnotiser" subtitle="Välj vilka notiser du vill få via e-post.">
            <FormRow label="Ny användare">
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
            </FormRow>
            <FormRow label="Ny order">
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
            </FormRow>
            <FormRow label="Slutförd kurs" description="När en användare slutför en kurs.">
                <input type="checkbox" className="toggle-checkbox" />
            </FormRow>
          </SettingsCard>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Inställningar</h1>
          <p className="text-[var(--text-secondary)] font-light">Hantera inställningar för webbplats och adminpanel</p>
        </div>

        <div className="admin-card p-2 mb-8">
            <nav className="flex flex-wrap items-center gap-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                            ${activeTab === tab.id ? 'bg-[var(--primary-green)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-beige)]'}
                        `}
                    >
                        <tab.icon className="w-4 h-4"/>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
        
        <div>
            {renderContent()}
        </div>

        {/* Global Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className={`admin-btn ${
              saving || loading
                ? 'opacity-50 cursor-not-allowed'
                : 'admin-btn-primary'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Spara alla ändringar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 