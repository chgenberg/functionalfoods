'use client';

import { FiDollarSign, FiShoppingCart, FiUsers, FiTrendingUp, FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';
// Du behöver ett diagram-bibliotek, t.ex. Recharts
// npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const salesData = [
  { name: 'Jan', Intäkter: 40000, Kurser: 24 },
  { name: 'Feb', Intäkter: 30000, Kurser: 13 },
  { name: 'Mar', Intäkter: 50000, Kurser: 45 },
  { name: 'Apr', Intäkter: 47800, Kurser: 39 },
  { name: 'Maj', Intäkter: 58900, Kurser: 48 },
  { name: 'Jun', Intäkter: 43900, Kurser: 38 },
];

const stats = [
    { title: "Totala intäkter", value: "1,2M kr", icon: FiDollarSign, change: "+15.2% i år" },
    { title: "Antal ordrar", value: "4,352", icon: FiShoppingCart, change: "+21% i år" },
    { title: "Nya kunder", value: "857", icon: FiUsers, change: "+8.5% i år" },
    { title: "Snittordervärde", value: "275 kr", icon: FiTrendingUp, change: "-1.2% i år" },
];

export default function AdminSalesPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">FÖRSÄLJNING</h1>
                <p className="text-lg text-text-secondary mt-1">Detaljerad översikt av intäkter och ordrar.</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
                <button className="flex items-center gap-2 bg-white border-2 border-primary/20 text-primary font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 uppercase text-sm tracking-wider group">
                    <FiCalendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Senaste 30 dagarna</span>
                </button>
                <button className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 uppercase text-sm tracking-wider group">
                    <FiDownload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Exportera</span>
                </button>
            </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(stat => (
                <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10">
                    <div className="flex items-center gap-4">
                         <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">{stat.title}</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
                            <p className="text-xs text-text-secondary mt-1">{stat.change}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-6">
            <h3 className="text-xl font-bold text-primary uppercase tracking-wider mb-6">INTÄKTER PER MÅNAD</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#112A12" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fill: '#112A12', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#112A12', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value/1000}k`} />
                        <Tooltip
                            contentStyle={{
                                background: 'white',
                                border: '2px solid #112A12',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            labelStyle={{ color: '#112A12', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Intäkter" fill="#112A12" name="Intäkter (kr)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Kurser" fill="#014421" name="Sålda kurser" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
} 