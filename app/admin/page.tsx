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
  Package
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
    { icon: Plus, label: 'Nytt blogginlägg', href: '/admin/blog/new', color: 'bg-blue-500' },
    { icon: Plus, label: 'Nytt recept', href: '/admin/recipes/new', color: 'bg-green-500' },
    { icon: Users, label: 'Hantera kunder', href: '/admin/users', color: 'bg-purple-500' },
    { icon: ShoppingCart, label: 'Se ordrar', href: '/admin/orders', color: 'bg-orange-500' },
  ];

  const statCards = [
    { 
      icon: Users, 
      label: 'Totalt antal kunder', 
      value: stats.totalUsers,
      change: '+12%',
      color: 'bg-blue-500'
    },
    { 
      icon: ShoppingCart, 
      label: 'Totalt antal ordrar', 
      value: stats.totalOrders,
      change: '+8%',
      color: 'bg-green-500'
    },
    { 
      icon: DollarSign, 
      label: 'Total försäljning', 
      value: `${stats.totalRevenue.toLocaleString('sv-SE')} kr`,
      change: '+15%',
      color: 'bg-purple-500'
    },
    { 
      icon: Package, 
      label: 'Aktiva kurser', 
      value: '3',
      change: '0%',
      color: 'bg-orange-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Välkommen tillbaka!</h1>
        <p className="text-gray-600 mt-2">Här är en översikt av din verksamhet</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{action.label}</h3>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Senaste ordrar</h2>
            <Link href="/admin/orders" className="text-sm text-[#014421] hover:underline">
              Visa alla
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.productName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.amount} kr</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('sv-SE')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Inga ordrar ännu</p>
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Nya kunder</h2>
            <Link href="/admin/users" className="text-sm text-[#014421] hover:underline">
              Visa alla
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#014421] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name || 'Anonym'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Inga nya kunder</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Försäljningsöversikt</h2>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
            <option>Senaste 7 dagarna</option>
            <option>Senaste 30 dagarna</option>
            <option>Senaste 3 månaderna</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Försäljningsdata kommer snart</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
