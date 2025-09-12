"use client";
import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  BookOpen,
  TrendingUp,
  Eye,
  Plus,
  Edit,
  BarChart3,
  Activity,
  DollarSign,
  Package,
  GraduationCap
} from 'lucide-react';
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
  popularContent: any[];
  stripeStats?: {
    totalAmount: number;
    successful: number;
    pending: number;
    failed: number;
  };
  recentPayments?: any[];
  newUsersThisWeek?: number;
  activeCourses?: number;
  totalCourseEnrollments?: number;
  favoriteRecipes?: number;
  revenueThisMonth?: number;
  ordersThisMonth?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalRecipes: 0,
    totalBlogPosts: 0,
    recentOrders: [],
    recentUsers: [],
    popularContent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch both database stats and Stripe data
      const [dbStatsRes, stripeRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/stripe-payments?limit=10')
      ]);

      let dbData = {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalRecipes: 0,
        totalBlogPosts: 0,
        recentOrders: [],
        recentUsers: [],
        popularContent: []
      };

      let stripeData = {
        summary: { totalAmount: 0, successful: 0, pending: 0, failed: 0 },
        payments: []
      };

      if (dbStatsRes.ok) {
        dbData = await dbStatsRes.json();
      }

      if (stripeRes.ok) {
        stripeData = await stripeRes.json();
      }

      // Combine data with Stripe as primary source for revenue
      setStats({
        ...dbData,
        totalRevenue: stripeData.summary.totalAmount, // Use real Stripe revenue
        stripeStats: stripeData.summary,
        recentPayments: stripeData.payments.slice(0, 5) // Show 5 most recent
      });

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Plus, label: 'Nytt blogginlägg', href: '/admin/blog/new', color: 'bg-primary' },
    { icon: Plus, label: 'Nytt recept', href: '/admin/recipes/new', color: 'bg-[#93C560]' },
    { icon: Users, label: 'Hantera kunder', href: '/admin/users', color: 'bg-[#FF7E70]' },
    { icon: ShoppingCart, label: 'Se ordrar', href: '/admin/orders', color: 'bg-[#014421]' },
  ];

  // Update loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]">
        <h1 className="text-3xl font-bold text-[#014421]">
          Välkommen tillbaka!
        </h1>
        <p className="text-gray-600 mt-2">Här är en översikt av din verksamhet</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block p-6 bg-white rounded-2xl shadow-sm border border-[#F3EFE3] hover:shadow-lg hover:border-[#93C560]/30 transition-all transform hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-[#014421]">{action.label}</h3>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#93C560]" />
            </div>

          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Totalt antal användare</h3>
          <p className="text-2xl font-bold text-[#014421]">{stats.totalUsers.toLocaleString('sv-SE')}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.newUsersThisWeek} nya denna vecka
          </p>
        </motion.div>

        {/* Active Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#FF7E70]/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#FF7E70]" />
            </div>

          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Aktiva kurser</h3>
          <p className="text-2xl font-bold text-[#014421]">{stats.activeCourses}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalCourseEnrollments} inskrivningar totalt
          </p>
        </motion.div>

        {/* Total Recipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#93C560]" />
            </div>

          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Totalt antal recept</h3>
          <p className="text-2xl font-bold text-[#014421]">{stats.totalRecipes}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.favoriteRecipes} favoriter
          </p>
        </motion.div>

        {/* Revenue This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#FF7E70]/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#FF7E70]" />
            </div>
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Intäkter denna månad</h3>
          <p className="text-2xl font-bold text-[#014421]">
            {stats.revenueThisMonth?.toLocaleString('sv-SE', { 
              style: 'currency', 
              currency: 'SEK',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.ordersThisMonth} ordrar
          </p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <h2 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
            Senaste ordrar
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-[#014421]">Order #{1000 + i}</p>
                  <p className="text-sm text-gray-600">Functional Energy</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#014421]">2295 kr</p>
                  <p className="text-sm text-gray-500">För 2 timmar sedan</p>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/admin/orders" 
            className="mt-4 inline-flex items-center text-[#93C560] hover:text-[#84b351] font-medium transition-colors"
          >
            Visa alla ordrar →
          </Link>
        </motion.div>

        {/* Popular Recipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
        >
          <h2 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
            Populära recept
          </h2>
          <div className="space-y-4">
            {[
              { name: "Grönkålssallad med citron", views: 1234 },
              { name: "Energiboost smoothie", views: 987 },
              { name: "Quinoasallad med avokado", views: 876 }
            ].map((recipe, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-[#014421]">{recipe.name}</p>
                  <p className="text-sm text-gray-600">{recipe.views} visningar</p>
                </div>
                                  <BookOpen className="w-6 h-6 text-[#93C560]" />
              </div>
            ))}
          </div>
          <Link 
            href="/admin/recipes" 
            className="mt-4 inline-flex items-center text-[#93C560] hover:text-[#84b351] font-medium transition-colors"
          >
            Visa alla recept →
          </Link>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-[#F3EFE3]"
      >
        <h2 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
          <span className="text-xl">💚</span> Systemstatus
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#93C560] rounded-full animate-pulse"></div>
            <span className="text-gray-700">Databas: Aktiv</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#93C560] rounded-full animate-pulse"></div>
            <span className="text-gray-700">API: Aktiv</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#93C560] rounded-full animate-pulse"></div>
            <span className="text-gray-700">Email: Aktiv</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
