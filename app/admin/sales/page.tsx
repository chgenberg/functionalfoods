'use client';

import { useState } from 'react';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, Calendar, Filter, ArrowUp, ArrowDown } from 'lucide-react';

const salesData = [
  { name: 'Jan', Intäkter: 40000, Kurser: 24, Kunder: 120 },
  { name: 'Feb', Intäkter: 30000, Kurser: 13, Kunder: 98 },
  { name: 'Mar', Intäkter: 50000, Kurser: 45, Kunder: 167 },
  { name: 'Apr', Intäkter: 47800, Kurser: 39, Kunder: 145 },
  { name: 'Maj', Intäkter: 58900, Kurser: 48, Kunder: 189 },
  { name: 'Jun', Intäkter: 43900, Kurser: 38, Kunder: 156 },
];

const categoryData = [
  { name: 'Functional Basics', value: 45, color: '#F97316' },
  { name: 'Functional Flow', value: 30, color: '#FB923C' },
  { name: 'Recept & Kost', value: 15, color: '#FCD34D' },
  { name: 'Övrigt', value: 10, color: '#FDE68A' },
];

const stats = [
    { 
      title: "Totala intäkter", 
      value: "1,2M kr", 
      icon: DollarSign, 
      change: 15.2, 
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-primary"
    },
    { 
      title: "Antal ordrar", 
      value: "4,352", 
      icon: ShoppingCart, 
      change: 21, 
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      changeColor: "text-primary"
    },
    { 
      title: "Nya kunder", 
      value: "857", 
      icon: Users, 
      change: 8.5, 
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      changeColor: "text-primary"
    },
    { 
      title: "Snittordervärde", 
      value: "275 kr", 
      icon: TrendingUp, 
      change: -1.2, 
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-red-600"
    },
];

export default function AdminSalesPage() {
  const [timeRange, setTimeRange] = useState('30');

  return (
    <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Försäljningsöversikt</h1>
                <p className="text-gray-600">Analysera intäkter, ordrar och kundtrender</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="7">Senaste 7 dagarna</option>
                  <option value="30">Senaste 30 dagarna</option>
                  <option value="90">Senaste 90 dagarna</option>
                  <option value="365">Senaste året</option>
                </select>
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Exportera rapport</span>
                </button>
            </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 ${stat.bgColor} rounded-lg ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${stat.changeColor}`}>
                            {stat.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            <span>{Math.abs(stat.change)}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Intäktsutveckling</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value/1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                                formatter={(value: number) => [`${value.toLocaleString('sv-SE')} kr`, 'Intäkter']}
                            />
                            <Area type="monotone" dataKey="Intäkter" stroke="#F97316" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Försäljning per kategori</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => `${value}%`}
                                contentStyle={{
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {categoryData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Kundtillväxt</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Line type="monotone" dataKey="Kunder" stroke="#FCD34D" strokeWidth={3} dot={{ fill: '#FCD34D', r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Course Sales */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Kurser sålda</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Bar dataKey="Kurser" fill="#FB923C" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
} 