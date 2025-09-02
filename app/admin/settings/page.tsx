'use client';

import { useState } from 'react';
import { Save, Info, Lock, CreditCard, User, Eye, EyeOff } from 'lucide-react';

const SettingsCard = ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-end">
            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                <Save className="w-4 h-4"/>
                <span>Spara ändringar</span>
            </button>
        </div>
    </div>
);

const FormRow = ({ label, description, children }: { label: string, description?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start">
        <div className="md:col-span-1">
            <h4 className="font-medium text-gray-900">{label}</h4>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
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

  const tabs = [
    { id: 'general', label: 'Allmänt', icon: Info },
    { id: 'security', label: 'Säkerhet', icon: Lock },
    { id: 'notifications', label: 'Notiser', icon: FiBell },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <SettingsCard title="Allmänna inställningar" subtitle="Grundläggande information för din webbplats.">
            <FormRow label="Webbplatsens namn">
              <input type="text" defaultValue="Functional Foods" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </FormRow>
             <FormRow label="Primär e-post" description="Denna e-postadress används för viktig kommunikation.">
              <input type="email" defaultValue="admin@functionalfoods.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </FormRow>
            <FormRow label="Underhållsläge" description="Visar en underhållssida för alla icke-inloggade besökare.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
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
                      className="font-semibold text-orange-600 hover:text-orange-700"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Bekräfta nytt lösenord"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Här skulle du hantera lösenordsändringen
                            alert('Lösenordsändring implementeras snart!');
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Spara lösenord
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
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
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inställningar</h1>
          <p className="text-gray-600">Hantera inställningar för webbplats och adminpanel</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
            <nav className="flex flex-wrap items-center gap-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                            ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
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
      </div>
    </div>
  );
} 