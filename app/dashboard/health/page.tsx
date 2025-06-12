'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiMoon, FiZap, FiPlus, FiChevronDown } from 'react-icons/fi';

const healthData = [
  { date: 'Mån', energy: 7, sleep: 6, stress: 5 },
  { date: 'Tis', energy: 8, sleep: 7, stress: 4 },
  { date: 'Ons', energy: 6, sleep: 8, stress: 6 },
  { date: 'Tor', energy: 7, sleep: 6.5, stress: 5 },
  { date: 'Fre', energy: 9, sleep: 7, stress: 3 },
  { date: 'Lör', energy: 8, sleep: 8.5, stress: 2 },
  { date: 'Sön', energy: 7, sleep: 7, stress: 3 },
];

const MetricCard = ({ icon, title, value, unit, color }: { icon: React.ReactNode, title: string, value: string | number, unit: string, color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value} <span className="text-base font-normal">{unit}</span></p>
        </div>
    </div>
);


export default function HealthTrackingPage() {
    const [isLogging, setIsLogging] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hälsospårning</h1>
        <p className="text-gray-600 mt-1">Visualisera dina framsteg och förstå din kropps signaler.</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard icon={<FiZap className="text-yellow-600"/>} title="Energinivå" value="8/10" unit="" color="bg-yellow-100" />
          <MetricCard icon={<FiMoon className="text-blue-600"/>} title="Sömnkvalitet" value="7.5h" unit="inatt" color="bg-blue-100" />
          <MetricCard icon={<FiTrendingUp className="text-red-600"/>} title="Stressnivå" value="Låg" unit="" color="bg-red-100" />
      </div>

      {/* Log New Data Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => setIsLogging(!isLogging)}>
            <div className="flex items-center gap-3">
                <FiPlus className="text-primary"/>
                <h2 className="text-xl font-bold text-gray-800">Logga dagens mående</h2>
            </div>
            <FiChevronDown className={`transform transition-transform ${isLogging ? 'rotate-180' : ''}`} />
        </div>
        {isLogging && (
            <form className="p-6 border-t border-gray-200 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="energy" className="block text-sm font-medium text-gray-700 mb-1">Energi (1-10)</label>
                        <input type="range" id="energy" min="1" max="10" defaultValue={7} className="w-full" />
                    </div>
                     <div>
                        <label htmlFor="sleep" className="block text-sm font-medium text-gray-700 mb-1">Sömn (timmar)</label>
                        <input type="number" id="sleep" step="0.5" defaultValue={7.5} className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="stress" className="block text-sm font-medium text-gray-700 mb-1">Stress (1-10)</label>
                        <input type="range" id="stress" min="1" max="10" defaultValue={4} className="w-full" />
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Noteringar</label>
                    <textarea id="notes" rows="3" className="input-style" placeholder="Hur har dagen varit? Något speciellt som hänt?"></textarea>
                </div>
                <div className="text-right">
                    <button type="submit" className="btn-primary">Spara logg</button>
                </div>
            </form>
        )}
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Veckans trender</h2>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px', borderColor: '#e5e7eb' }}/>
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energi" />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sömn (h)" />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
            </LineChart>
            </ResponsiveContainer>
      </div>

        <style jsx global>{`
            .input-style {
            @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
            }
            .btn-primary {
            @apply bg-primary hover:bg-accent text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md;
            }
             @keyframes fade-in {
                from { opacity: 0; max-height: 0; }
                to { opacity: 1; max-height: 500px; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
                overflow: hidden;
            }
      `}</style>
    </div>
  );
} 