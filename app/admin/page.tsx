"use client";
import { useState, useEffect } from 'react';
import { Activity, BarChart3, BookOpen, Calendar, ChevronRight, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalRecipes: number;
  totalBlogPosts: number;
  recentOrders: any[];
  recentUsers: any[];
  newUsersThisWeek?: number;
  activeCourses?: number;
  totalCourseEnrollments?: number;
  revenueThisMonth?: number;
  ordersThisMonth?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchStats();
    setDynamicGreeting();
  }, []);

  const setDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('God morgon');
    else if (hour < 18) setGreeting('God eftermiddag');
    else setGreeting('God kväll');
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="admin-card h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 py-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-light-green)] rounded-full flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-light text-[var(--primary-green)] mb-3">
          {greeting}!
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Här är en översikt av din verksamhet
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="admin-stat-label">Användare</p>
              <p className="admin-stat-value">{stats?.totalUsers || 0}</p>
              {stats?.newUsersThisWeek && (
                <p className="text-sm text-green-600 mt-1">
                  +{stats.newUsersThisWeek} denna vecka
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="admin-stat-label">Ordrar</p>
              <p className="admin-stat-value">{stats?.totalOrders || 0}</p>
              {stats?.ordersThisMonth && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {stats.ordersThisMonth} denna månad
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="admin-stat-label">Intäkter</p>
              <p className="admin-stat-value">{formatCurrency(stats?.totalRevenue || 0)}</p>
              {stats?.revenueThisMonth && (
                <p className="text-sm text-green-600 mt-1">
                  {formatCurrency(stats.revenueThisMonth)} denna månad
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="admin-stat-label">Recept</p>
              <p className="admin-stat-value">{stats?.totalRecipes || 0}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Publicerade recept
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-card"
      >
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Snabblänkar</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/recipes/new"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:bg-[var(--primary-beige)] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
              <BookOpen className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)] font-medium">Nytt recept</span>
          </Link>
          
          <Link 
            href="/admin/blog/new"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:bg-[var(--primary-beige)] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
              <Activity className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)] font-medium">Nytt blogginlägg</span>
          </Link>
          
          <Link 
            href="/admin/coupons"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:bg-[var(--primary-beige)] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
              <Package className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)] font-medium">Ny kupong</span>
          </Link>
          
          <Link 
            href="/admin/sales"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:bg-[var(--primary-beige)] transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
              <BarChart3 className="w-6 h-6 text-[var(--primary-green)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)] font-medium">Visa statistik</span>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--primary-green)]">Senaste användare</h2>
            <Link 
              href="/admin/users"
              className="text-sm text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
            >
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recentUsers.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{user.name || 'Ingen namn'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--primary-green)]">Senaste ordrar</h2>
            <Link 
              href="/admin/orders"
              className="text-sm text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
            >
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {order.user?.name || 'Gäst'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {order.items?.[0]?.product?.name || 'Produkt'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--primary-green)]">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Course Management Quick Links */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="admin-card"
      >
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Kurshantering</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin/courses"
            className="p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Kurser</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Hantera kurser</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
          
          <Link 
            href="/admin/course-weeks"
            className="p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Vecko-metadata</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Rubrik, bild, video</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
          
          <Link 
            href="/admin/meal-plans"
            className="p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Kostscheman</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Hantera veckomenyer</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
