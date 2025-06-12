'use client';

import {
  FiZap,
  FiMoon,
  FiHeart,
  FiTrendingUp,
  FiWatch,
  FiChevronLeft,
  FiChevronRight,
  FiTarget,
  FiAward,
  FiSunrise,
} from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// --- Reusable Components ---

const ActivityRing = ({ percentage, color, label, value, icon: Icon }: any) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          className="text-gray-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          className={color}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
    <p className="mt-3 font-semibold text-gray-800">{label}</p>
    <p className="text-sm text-gray-600">{value}</p>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, unit, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value} <span className="text-lg font-medium text-gray-500">{unit}</span>
      </p>
    </div>
  </div>
);

const ChartContainer = ({ title, children }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="h-64">
           {children}
        </div>
    </div>
)

// --- Dummy Data ---

const activityData = {
  move: { percentage: 76, value: '620 / 800 kcal', color: 'text-red-500' },
  exercise: { percentage: 85, value: '51 / 60 min', color: 'text-green-500' },
  stand: { percentage: 92, value: '11 / 12 tim', color: 'text-blue-500' },
};

const heartRateData = [
  { time: '00:00', bpm: 65 }, { time: '03:00', bpm: 58 },
  { time: '06:00', bpm: 62 }, { time: '09:00', bpm: 75 },
  { time: '12:00', bpm: 85 }, { time: '15:00', bpm: 92 },
  { time: '18:00', bpm: 88 }, { time: '21:00', bpm: 72 },
];

const sleepData = [
    { name: 'Djupsömn', hours: 1.5, fill: '#0d47a1' },
    { name: 'Kärnsömn', hours: 4.5, fill: '#1976d2' },
    { name: 'REM', hours: 2, fill: '#42a5f5' },
    { name: 'Vaken', hours: 0.25, fill: '#e3f2fd' },
];

// --- Main Page Component ---

export default function MyHealthPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiWatch /> Min Hälsa
          </h1>
          <p className="text-gray-600 mt-1">
            Din dagliga hälsodata från din anslutna enhet.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button className="p-2 rounded-md hover:bg-gray-100"><FiChevronLeft/></button>
            <span className="px-4 font-semibold text-gray-700">Idag, 13 juni</span>
            <button className="p-2 rounded-md hover:bg-gray-100"><FiChevronRight/></button>
        </div>
      </div>

      {/* Activity Rings */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Dagens Aktivitet</h2>
        <div className="flex flex-col md:flex-row justify-around items-center gap-8">
          <ActivityRing {...activityData.move} label="Rörelse" icon={FiTrendingUp} />
          <ActivityRing {...activityData.exercise} label="Träning" icon={FiZap} />
          <ActivityRing {...activityData.stand} label="Stå" icon={FiSunrise} />
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard icon={FiTarget} label="Steg" value="10,283" unit="" color="from-green-500 to-green-600"/>
          <MetricCard icon={FiMoon} label="Sömn" value="7h 45m" unit="" color="from-blue-500 to-blue-600"/>
          <MetricCard icon={FiHeart} label="Puls" value="55-120" unit="bpm" color="from-red-500 to-red-600"/>
          <MetricCard icon={FiAward} label="Stressnivå" value="Låg" unit="" color="from-yellow-500 to-yellow-600"/>
      </div>

      {/* Charts */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Puls under dagen">
              <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} name="Puls (slag/min)" />
                    </LineChart>
              </ResponsiveContainer>
          </ChartContainer>

           <ChartContainer title="Sömnfaser">
              <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Timmar" barSize={20} radius={[0, 10, 10, 0]} />
                    </BarChart>
              </ResponsiveContainer>
          </ChartContainer>
      </div>
    </div>
  );
} 