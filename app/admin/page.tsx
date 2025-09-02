"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { Activity, Book, Calendar, Coffee, Edit3, Eye, FileText, Plus, Settings, ShoppingBag, Trash2, TrendingUp, Users } from 'lucide-react';

interface AdminStats {
  totalCourses: number;
  totalBlogs: number;
  totalRecipes: number;
  totalUsers: number;
  totalOrders: number;
  revenue: string;
  recentActivity: Array<{
    type: string;
    title: string;
    time: string;
    user: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalCourses: 3,
    totalBlogs: 12,
    totalRecipes: 45,
    totalUsers: 1247,
    totalOrders: 89,
    revenue: '124,500 kr',
    recentActivity: [
      { type: 'course', title: 'Functional Flow uppdaterad', time: '2 tim sedan', user: 'Admin' },
      { type: 'blog', title: 'Ny artikel om Omega-3', time: '5 tim sedan', user: 'Admin' },
      { type: 'recipe', title: 'Laxrecept publicerat', time: '1 dag sedan', user: 'Admin' },
      { type: 'user', title: 'Ny användare registrerad', time: '2 dagar sedan', user: 'System' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulera laddning av data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const dashboardCards = [
    {
      title: 'Kurser',
      count: stats.totalCourses,
      icon: Book,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/admin/courses',
      trend: '+12%'
    },
    {
      title: 'Blogginlägg',
      count: stats.totalBlogs,
      icon: FileText,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-background',
      textColor: 'text-primary',
      href: '/admin/blog',
      trend: '+8%'
    },
    {
      title: 'Recept',
      count: stats.totalRecipes,
      icon: Coffee,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      href: '/admin/recipes',
      trend: '+23%'
    },
    {
      title: 'Användare',
      count: stats.totalUsers,
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/admin/users',
      trend: '+15%'
    }
  ];

  const quickActions = [
    { title: 'Ny kurs', icon: Book, href: '/admin/courses/new', color: 'from-blue-400 to-blue-600' },
    { title: 'Nytt blogginlägg', icon: FileText, href: '/admin/blog/new', color: 'from-green-400 to-green-600' },
    { title: 'Nytt recept', icon: Coffee, href: '/admin/recipes/new', color: 'from-orange-400 to-orange-600' },
    { title: 'Hantera beställningar', icon: ShoppingBag, href: '/admin/orders', color: 'from-purple-400 to-purple-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar admin-panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Välkommen tillbaka! 👋
        </h1>
        <p className="text-gray-600">
          Här är en översikt av din verksamhet
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link href={card.href} className="block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-md`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary bg-background px-2 py-1 rounded-full">
                    {card.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{card.count}</h3>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-6 mb-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 mb-1">Total intäkt denna månad</p>
            <h2 className="text-4xl font-bold">{stats.revenue}</h2>
            <p className="text-orange-100 mt-2">+28% jämfört med förra månaden</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Snabbåtgärder
            </h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} mr-3 shadow-sm`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">
                      {action.title}
                    </span>
                    <Plus className="w-5 h-5 ml-auto text-gray-400 group-hover:text-gray-600" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiBarChart className="w-5 h-5 mr-2 text-orange-500" />
                Senaste aktivitet
              </h3>
              <Link href="/admin/activity" className="text-sm text-orange-600 hover:text-orange-700">
                Visa alla
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.type === 'course' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'blog' ? 'bg-background-secondary text-primary' :
                    activity.type === 'recipe' ? 'bg-orange-100 text-orange-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'course' && <Book className="w-5 h-5" />}
                    {activity.type === 'blog' && <FileText className="w-5 h-5" />}
                    {activity.type === 'recipe' && <Coffee className="w-5 h-5" />}
                    {activity.type === 'user' && <Users className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time} • {activity.user}
                    </p>
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Systemstatus
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center p-4 bg-background rounded-xl">
            <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Webbplats</p>
              <p className="text-xs text-gray-500">Fungerande</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-background rounded-xl">
            <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Databas</p>
              <p className="text-xs text-gray-500">Ansluten</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-background rounded-xl">
            <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-gray-500">Aktiv</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-background rounded-xl">
            <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">E-post</p>
              <p className="text-xs text-gray-500">Konfigurerad</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
