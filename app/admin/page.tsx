"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiBook, FiFileText, FiUsers, FiSettings, FiTrendingUp, FiPlus, FiEdit3, FiTrash2, FiEye, FiBarChart, FiCalendar, FiCoffee } from 'react-icons/fi';
import Link from 'next/link';

interface AdminStats {
  totalCourses: number;
  totalBlogs: number;
  totalRecipes: number;
  totalUsers: number;
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
    // Kontrollera admin-autentisering
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    // Simulera laddning av data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const dashboardCards = [
    {
      title: 'Kurser',
      count: stats.totalCourses,
      icon: FiBook,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/admin/courses'
    },
    {
      title: 'Blogginlägg',
      count: stats.totalBlogs,
      icon: FiFileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      href: '/admin/blog'
    },
    {
      title: 'Recept',
      count: stats.totalRecipes,
      icon: FiCoffee,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      href: '/admin/recipes'
    },
    {
      title: 'Användare',
      count: stats.totalUsers,
      icon: FiUsers,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/admin/users'
    }
  ];

  const quickActions = [
    { title: 'Ny kurs', icon: FiBook, href: '/admin/courses/new', color: 'bg-blue-600' },
    { title: 'Nytt blogginlägg', icon: FiFileText, href: '/admin/blog/new', color: 'bg-green-600' },
    { title: 'Nytt recept', icon: FiCoffee, href: '/admin/recipes/new', color: 'bg-orange-600' },
    { title: 'Inställningar', icon: FiSettings, href: '/admin/settings', color: 'bg-gray-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar admin-panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Aktiv
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Visa webbplats
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-2">
            Välkommen tillbaka!
          </h2>
          <p className="text-gray-600">
            Hantera kurser, blogginlägg och recept från din admin-panel.
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
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              <Link href={card.href} className="block">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                    <p className="text-sm text-gray-500">{card.title}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  <span>Hantera {card.title.toLowerCase()}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                      className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900">
                        {action.title}
                      </span>
                      <FiPlus className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" />
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Senaste aktivitet
                </h3>
                                 <FiBarChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg mr-3 ${
                      activity.type === 'course' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'blog' ? 'bg-green-100 text-green-600' :
                      activity.type === 'recipe' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'course' && <FiBook className="w-4 h-4" />}
                      {activity.type === 'blog' && <FiFileText className="w-4 h-4" />}
                                             {activity.type === 'recipe' && <FiCoffee className="w-4 h-4" />}
                      {activity.type === 'user' && <FiUsers className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                    <FiCalendar className="w-4 h-4 text-gray-400" />
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Webbplats</p>
                <p className="text-xs text-gray-500">Fungerande</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Databas</p>
                <p className="text-xs text-gray-500">Ansluten</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API</p>
                <p className="text-xs text-gray-500">Aktiv</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
