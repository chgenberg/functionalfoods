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
      if (!response.ok) {
        // Fallback to safe defaults so UI still renders
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalRecipes: 0,
          totalBlogPosts: 0,
          recentOrders: [],
          recentUsers: []
        });
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Ensure UI has safe defaults even on network/runtime failures
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalRecipes: 0,
        totalBlogPosts: 0,
        recentOrders: [],
        recentUsers: []
      });
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
        className="mb-10"
      >
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
          {greeting}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-light">
          Översikt av din verksamhet
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-[var(--primary-green)]" />
            {stats?.newUsersThisWeek && (
              <span className="text-xs text-green-600 font-medium">
                +{stats.newUsersThisWeek}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Användare</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats?.totalUsers || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-5 h-5 text-[var(--primary-green)]" />
            {stats?.ordersThisMonth && (
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {stats.ordersThisMonth}/mån
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Ordrar</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats?.totalOrders || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-[var(--primary-green)]" />
            {stats?.revenueThisMonth && (
              <span className="text-xs text-green-600 font-medium">
                {formatCurrency(stats.revenueThisMonth)}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Intäkter</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(stats?.totalRevenue || 0)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Recept</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats?.totalRecipes || 0}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Publicerade
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">Snabbåtgärder</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link 
            href="/admin/recipes/new"
            className="group flex items-center gap-3 p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all"
          >
            <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Nytt recept</span>
          </Link>
          
          <Link 
            href="/admin/blog/new"
            className="group flex items-center gap-3 p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all"
          >
            <Activity className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Nytt inlägg</span>
          </Link>
          
          <Link 
            href="/admin/coupons"
            className="group flex items-center gap-3 p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all"
          >
            <Package className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Ny kupong</span>
          </Link>
          
          <Link 
            href="/admin/sales"
            className="group flex items-center gap-3 p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all"
          >
            <BarChart3 className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Statistik</span>
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
          className="bg-white rounded-xl border border-[var(--border-light)] p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Senaste användare</h2>
            <Link 
              href="/admin/users"
              className="text-xs text-[var(--primary-green)] hover:underline"
            >
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {(stats?.recentUsers ?? []).slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{user.name || 'Ingen namn'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(user.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
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
          className="bg-white rounded-xl border border-[var(--border-light)] p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Senaste ordrar</h2>
            <Link 
              href="/admin/orders"
              className="text-xs text-[var(--primary-green)] hover:underline"
            >
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {(stats?.recentOrders ?? []).slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">
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
                    {new Date(order.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
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
      >
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">Kurshantering</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link 
            href="/admin/courses"
            className="p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-[var(--text-primary)]">Kurser</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hantera kurser</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
          
          <Link 
            href="/admin/course-weeks"
            className="p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-[var(--text-primary)]">Vecko-metadata</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Rubrik, bild, video</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
          
          <Link 
            href="/admin/meal-plans"
            className="p-4 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-[var(--text-primary)]">Kostscheman</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hantera veckomenyer</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary-green)] transition-colors" />
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
