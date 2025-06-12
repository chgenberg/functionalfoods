'use client';

import { useState } from 'react';
import { FiSave, FiInfo, FiBell, FiLock, FiCreditCard, FiUser, FiGlobe, FiKey } from 'react-icons/fi';

const SettingsCard = ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10">
        <div className="p-6 border-b border-primary/10">
            <h3 className="text-xl font-bold text-primary uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
        <div className="p-6 bg-background rounded-b-2xl border-t border-primary/10 flex justify-end">
            <button className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 uppercase text-sm tracking-wider group">
                <FiSave className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                <span>Spara ändringar</span>
            </button>
        </div>
    </div>
);

const FormRow = ({ label, description, children }: { label: string, description?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-center">
        <div className="md:col-span-1">
            <h4 className="font-bold text-primary text-sm uppercase tracking-wider">{label}</h4>
            {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Allmänt', icon: FiInfo },
    { id: 'security', label: 'Säkerhet', icon: FiLock },
    { id: 'notifications', label: 'Notiser', icon: FiBell },
    { id: 'billing', label: 'Betalning', icon: FiCreditCard },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <SettingsCard title="Allmänna inställningar" subtitle="Grundläggande information för din webbplats.">
            <FormRow label="Webbplatsens namn">
              <input type="text" defaultValue="Functional Foods" className="input-style" />
            </FormRow>
             <FormRow label="Primär e-post" description="Denna e-postadress används för viktig kommunikation.">
              <input type="email" defaultValue="admin@functionalfoods.com" className="input-style" />
            </FormRow>
            <FormRow label="Underhållsläge" description="Visar en underhållssida för alla icke-inloggade besökare.">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </FormRow>
          </SettingsCard>
        );
      case 'security':
        return (
          <SettingsCard title="Säkerhet och inloggning" subtitle="Hantera ditt lösenord och kontosäkerhet.">
              <FormRow label="Lösenord">
                  <button className="font-semibold text-primary hover:underline">Ändra lösenord</button>
              </FormRow>
              <FormRow label="Tvåfaktorsautentisering (2FA)" description="Öka säkerheten genom att kräva en andra verifieringsmetod.">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
      case 'billing':
        return (
          <SettingsCard title="Betalning och prenumeration" subtitle="Hantera din prenumeration och se fakturor.">
              <FormRow label="Nuvarande plan">
                  <p className="font-semibold text-gray-800">Pro Plan</p>
              </FormRow>
              <FormRow label="Betalningsmetod">
                  <div className="flex items-center gap-3">
                      <FiCreditCard className="w-6 h-6 text-gray-500"/>
                      <p className="font-medium">Visa **** **** **** 4242</p>
                  </div>
              </FormRow>
               <FormRow label="Fakturor">
                  <button className="font-semibold text-primary hover:underline">Hantera prenumeration & fakturor</button>
              </FormRow>
          </SettingsCard>
        );
      default:
        return null;
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">INSTÄLLNINGAR</h1>
          <p className="text-lg text-text-secondary mt-1">Globala inställningar för webbplats och adminpanel.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-2 mb-8">
            <nav className="flex flex-wrap items-center gap-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-sm uppercase tracking-wider group
                            ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-primary/10'}
                        `}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? '' : 'group-hover:scale-110'} transition-transform`}/>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
        
        <div>
            {renderContent()}
        </div>
      </div>
      <style jsx>{`
        .input-style {
          @apply w-full px-3 py-2 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200;
        }
        .toggle-checkbox {
            @apply appearance-none w-11 h-6 bg-gray-200 rounded-full cursor-pointer relative transition-colors;
        }
        .toggle-checkbox:checked {
            @apply bg-primary;
        }
        .toggle-checkbox:before {
            content: '';
            @apply absolute w-5 h-5 bg-white rounded-full left-0.5 top-0.5 transition-transform;
        }
        .toggle-checkbox:checked:before {
            transform: translateX(20px);
        }
      `}</style>
    </div>
  );
} 