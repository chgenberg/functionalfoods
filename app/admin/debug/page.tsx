"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, Key, User, Database, Server } from 'lucide-react';

export default function AdminDebugPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch system info
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(console.error);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const adminCredentials = {
    email: 'admin@functionalfoods.se',
    password: 'admin123',
    loginUrl: '/admin/login'
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Admin Debug Info</h1>
          <p className="text-gray-600">Systeminfo och inloggningsuppgifter för administratörer</p>
        </div>

        <div className="grid gap-6">
          {/* Admin Credentials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🔐 Admin-inloggning</h2>
                <p className="text-gray-600">Inloggningsuppgifter för admin-panelen</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">📧 Email</p>
                  <p className="font-mono text-gray-900">{adminCredentials.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(adminCredentials.email, 'email')}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {copied === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">🔑 Lösenord</p>
                  <p className="font-mono text-gray-900">{adminCredentials.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(adminCredentials.password, 'password')}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {copied === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm text-green-600">🌐 Login URL</p>
                  <p className="font-mono text-green-800">
                    <a 
                      href={adminCredentials.loginUrl}
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {window.location.origin}{adminCredentials.loginUrl}
                    </a>
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}${adminCredentials.loginUrl}`, 'url')}
                  className="p-2 text-green-500 hover:text-green-700 transition-colors"
                >
                  {copied === 'url' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Säkerhetsvarning:</strong> Ändra lösenordet direkt efter första inloggningen via 
                Admin → Inställningar → Säkerhet
              </p>
            </div>
          </div>

          {/* Admin Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🎨 Design-funktioner</h2>
                <p className="text-gray-600">Vad du kan göra i admin-panelen</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📄 Sidbyggare</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Drag & drop-editor för att anpassa sidor som startsidan, kurssidor och landningssidor.
                </p>
                <a 
                  href="/admin/page-builder" 
                  className="text-[#014421] hover:underline text-sm font-medium"
                >
                  → Öppna sidbyggare
                </a>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">⚙️ Inställningar</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ändra webbplatsens namn, färger, kontaktinfo och andra grundinställningar.
                </p>
                <a 
                  href="/admin/settings" 
                  className="text-[#014421] hover:underline text-sm font-medium"
                >
                  → Öppna inställningar
                </a>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📝 Innehåll</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Skapa och redigera blogginlägg, recept och kursmaterial.
                </p>
                <a 
                  href="/admin/blog" 
                  className="text-[#014421] hover:underline text-sm font-medium"
                >
                  → Hantera innehåll
                </a>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">👥 Kunder & Ordrar</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Se kundinfo, hantera beställningar och följ upp kursframsteg.
                </p>
                <a 
                  href="/admin/users" 
                  className="text-[#014421] hover:underline text-sm font-medium"
                >
                  → Hantera kunder
                </a>
              </div>
            </div>
          </div>

          {/* System Status */}
          {systemInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Server className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">📊 Systemstatus</h2>
                  <p className="text-gray-600">Aktuell status för plattformen</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">🏥 Systemhälsa</p>
                  <p className={`font-semibold ${systemInfo.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemInfo.status === 'healthy' ? '✅ Frisk' : '❌ Problem'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">🗄️ Databas</p>
                  <p className={`font-semibold ${systemInfo.checks?.database?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemInfo.checks?.database?.status === 'healthy' ? '✅ Ansluten' : '❌ Problem'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">💳 Stripe</p>
                  <p className={`font-semibold ${systemInfo.checks?.stripe?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemInfo.checks?.stripe?.status === 'healthy' ? '✅ Fungerar' : '❌ Problem'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Snabbåtgärder</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="/admin"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#014421] hover:bg-[#014421]/5 transition-colors"
              >
                <div className="w-8 h-8 bg-[#014421] rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gå till Admin</h3>
                  <p className="text-sm text-gray-600">Huvuddashboard</p>
                </div>
              </a>

              <a
                href="/admin/page-builder"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#014421] hover:bg-[#014421]/5 transition-colors"
              >
                <div className="w-8 h-8 bg-[#93C560] rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Designa sidor</h3>
                  <p className="text-sm text-gray-600">Sidbyggare</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 