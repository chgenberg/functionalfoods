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
  GraduationCap,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
    { 
      icon: FileText, 
      label: 'Nytt blogginlägg', 
      href: '/admin/blog/new', 
      gradient: 'from-emerald-400 to-teal-500',
      hoverGradient: 'hover:from-emerald-500 hover:to-teal-600'
    },
    { 
      icon: BookOpen, 
      label: 'Nytt recept', 
      href: '/admin/recipes/new', 
      gradient: 'from-lime-400 to-green-500',
      hoverGradient: 'hover:from-lime-500 hover:to-green-600'
    },
    { 
      icon: Users, 
      label: 'Hantera kunder', 
      href: '/admin/users', 
      gradient: 'from-orange-400 to-red-500',
      hoverGradient: 'hover:from-orange-500 hover:to-red-600'
    },
    { 
      icon: ShoppingCart, 
      label: 'Se ordrar', 
      href: '/admin/orders', 
      gradient: 'from-blue-400 to-indigo-500',
      hoverGradient: 'hover:from-blue-500 hover:to-indigo-600'
    },
  ];

  // Update loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#93C560] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 mt-4 font-light">Laddar statistik...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-white via-[#F3EFE3]/50 to-[#93C560]/10 rounded-3xl p-8 shadow-sm border border-white/50 backdrop-blur-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#93C560]/20 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-light text-[#014421] mb-2">
            God morgon! <span className="text-2xl">☀️</span>
          </h1>
          <p className="text-gray-600 font-light">Här är din verksamhetsöversikt</p>
        </div>
      </motion.div>

      {/* Quick Actions with Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onHoverStart={() => setHoveredCard(action.label)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Link
                href={action.href}
                className={`block relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-medium text-xs sm:text-sm whitespace-nowrap tracking-tight text-[#014421] group-hover:text-white transition-colors duration-300">{action.label}</h3>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#93C560]/20 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#93C560]" />
              <span className="text-xs font-medium text-[#93C560] bg-[#93C560]/10 px-2 py-1 rounded-full">
                +{stats.newUsersThisWeek || 0} denna vecka
              </span>
            </div>
            <p className="text-3xl font-light text-[#014421]">{stats.totalUsers.toLocaleString('sv-SE')}</p>
            <p className="text-sm text-gray-500 mt-1 font-light">Totalt antal användare</p>
          </div>
        </motion.div>

        {/* Active Courses */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF7E70]/20 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <GraduationCap className="w-8 h-8 text-[#FF7E70]" />
              <span className="text-xs font-medium text-[#FF7E70] bg-[#FF7E70]/10 px-2 py-1 rounded-full">
                {stats.totalCourseEnrollments || 0} inskrivningar
              </span>
            </div>
            <p className="text-3xl font-light text-[#014421]">{stats.activeCourses || 0}</p>
            <p className="text-sm text-gray-500 mt-1 font-light">Aktiva kurser</p>
          </div>
        </motion.div>

        {/* Total Recipes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#93C560]/20 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-[#93C560]" />
              <span className="text-xs font-medium text-[#93C560] bg-[#93C560]/10 px-2 py-1 rounded-full">
                {stats.favoriteRecipes || 0} favoriter
              </span>
            </div>
            <p className="text-3xl font-light text-[#014421]">{stats.totalRecipes}</p>
            <p className="text-sm text-gray-500 mt-1 font-light">Totalt antal recept</p>
          </div>
        </motion.div>

        {/* Revenue This Month */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF7E70]/20 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-[#FF7E70]" />
              <span className="text-xs font-medium text-[#FF7E70] bg-[#FF7E70]/10 px-2 py-1 rounded-full">
                {stats.ordersThisMonth || 0} ordrar
              </span>
            </div>
            <p className="text-3xl font-light text-[#014421]">
              {stats.revenueThisMonth?.toLocaleString('sv-SE', { 
                style: 'currency', 
                currency: 'SEK',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
            <p className="text-sm text-gray-500 mt-1 font-light">Intäkter denna månad</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity with Modern Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-[#014421] flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              Senaste ordrar
            </h2>
            <Link 
              href="/admin/orders" 
              className="text-sm text-gray-500 hover:text-[#93C560] transition-colors flex items-center gap-1 group"
            >
              Visa alla 
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#014421] group-hover:text-[#93C560] transition-colors">Order #{1000 + i}</p>
                    <p className="text-sm text-gray-500">Functional Energy</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#014421]">2295 kr</p>
                  <p className="text-xs text-gray-400">2h sedan</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Recipes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-[#014421] flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Populära recept
            </h2>
            <Link 
              href="/admin/recipes" 
              className="text-sm text-gray-500 hover:text-[#93C560] transition-colors flex items-center gap-1 group"
            >
              Visa alla 
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Grönkålssallad med citron", views: 1234, trend: '+12%' },
              { name: "Energiboost smoothie", views: 987, trend: '+8%' },
              { name: "Quinoasallad med avokado", views: 876, trend: '+5%' }
            ].map((recipe, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#93C560]/20 to-[#93C560]/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#93C560]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#014421] group-hover:text-[#93C560] transition-colors">{recipe.name}</p>
                    <p className="text-sm text-gray-500">{recipe.views} visningar</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {recipe.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health with Minimalistic Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-[#93C560]/10 via-transparent to-[#FF7E70]/10 rounded-3xl p-6 border border-gray-100"
      >
        <h2 className="text-lg font-light text-[#014421] mb-4">Systemstatus</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Databas', status: 'Aktiv', color: 'bg-green-400' },
            { name: 'API', status: 'Aktiv', color: 'bg-green-400' },
            { name: 'Email', status: 'Aktiv', color: 'bg-green-400' }
          ].map((system, i) => (
            <motion.div 
              key={system.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="relative">
                <div className={`w-3 h-3 ${system.color} rounded-full`}></div>
                <div className={`absolute inset-0 w-3 h-3 ${system.color} rounded-full animate-ping`}></div>
              </div>
              <span className="text-gray-700 font-light">{system.name}: <span className="font-medium">{system.status}</span></span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
