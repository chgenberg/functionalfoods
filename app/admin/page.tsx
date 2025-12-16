"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, TrendingUp, Users, ShoppingBag, BookOpen, AlertCircle } from 'lucide-react';

interface CourseBreakdown {
  count: number;
  revenue: number;
}

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
  courseBreakdown?: Record<string, CourseBreakdown>;
  pendingOrders?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
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
        <div className="h-6 bg-gray-100 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Översikt</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Användare</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats?.totalUsers || 0}</p>
          {stats?.newUsersThisWeek ? (
            <p className="text-xs text-green-600 mt-1">+{stats.newUsersThisWeek} denna vecka</p>
          ) : null}
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Slutförda ordrar</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats?.totalOrders || 0}</p>
          <div className="flex items-center gap-2 mt-1">
            {stats?.ordersThisMonth ? (
              <span className="text-xs text-[var(--text-secondary)]">{stats.ordersThisMonth} denna månad</span>
            ) : null}
            {stats?.pendingOrders && stats.pendingOrders > 0 ? (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats.pendingOrders} väntande
              </span>
            ) : null}
          </div>
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Intäkter (inkl. moms)</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
          {stats?.revenueThisMonth ? (
            <p className="text-xs text-green-600 mt-1">{formatCurrency(stats.revenueThisMonth)} denna månad</p>
          ) : null}
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Recept</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats?.totalRecipes || 0}</p>
        </div>
      </div>

      {/* Course/Product Breakdown */}
      {stats?.courseBreakdown && Object.keys(stats.courseBreakdown).length > 0 && (
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-5">
          <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Försäljning per produkt</h2>
          <div className="space-y-3">
            {Object.entries(stats.courseBreakdown)
              .sort(([, a], [, b]) => b.revenue - a.revenue)
              .map(([name, data]) => {
                const maxRevenue = Math.max(...Object.values(stats.courseBreakdown!).map(d => d.revenue));
                const widthPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={name} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-primary)]">{name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[var(--text-secondary)]">{data.count} st</span>
                        <span className="text-sm font-medium text-[var(--primary-green)]">
                          {formatCurrency(data.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--primary-green)] rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          <Link 
            href="/admin/sales-complete" 
            className="inline-block mt-4 text-xs text-[var(--primary-green)] hover:underline"
          >
            Visa detaljerad försäljningsrapport →
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3">Snabbåtgärder</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/recipes/new" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            Nytt recept
          </Link>
          <Link href="/admin/blog/new" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            Nytt inlägg
          </Link>
          <Link href="/admin/coupons" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            Kuponger
          </Link>
          <Link href="/admin/sales-complete" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            Försäljning
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Senaste användare</h2>
            <Link href="/admin/users" className="text-xs text-[var(--primary-green)] hover:underline">
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {(stats?.recentUsers ?? []).slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{user.name || 'Ingen namn'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(user.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
            {(stats?.recentUsers ?? []).length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">Inga användare ännu</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Senaste ordrar</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--primary-green)] hover:underline">
              Visa alla
            </Link>
          </div>
          
          <div className="space-y-3">
            {(stats?.recentOrders ?? []).slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{order.user?.name || 'Gäst'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {order.items?.[0]?.product?.name || order.items?.[0]?.name || 'Produkt'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--primary-green)]">{formatCurrency(order.totalAmount || 0)}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(order.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
            {(stats?.recentOrders ?? []).length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">Inga ordrar ännu</p>
            )}
          </div>
        </div>
      </div>

      {/* Course management */}
      <div>
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3">Kurshantering</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/courses" className="p-4 bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            <p className="text-sm text-[var(--text-primary)]">Kurser</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hantera kurser</p>
          </Link>
          <Link href="/admin/course-weeks" className="p-4 bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            <p className="text-sm text-[var(--text-primary)]">Vecko-metadata</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Rubrik, bild, video</p>
          </Link>
          <Link href="/admin/meal-plans" className="p-4 bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors">
            <p className="text-sm text-[var(--text-primary)]">Kostscheman</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hantera veckomenyer</p>
          </Link>
        </div>
      </div>

      {/* Export & Rapporter */}
      <div className="bg-gradient-to-r from-[var(--primary-beige)] to-white border border-[var(--border-light)] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="w-5 h-5 text-[var(--primary-green)]" />
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Exportera data</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Ordrar</p>
              <p className="text-[10px] text-[var(--text-secondary)]">CSV/Excel</p>
            </div>
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Användare</p>
              <p className="text-[10px] text-[var(--text-secondary)]">CSV/Excel</p>
            </div>
          </Link>
          <Link 
            href="/admin/sales" 
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Försäljning</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Excel</p>
            </div>
          </Link>
          <Link 
            href="/admin/coupons" 
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[var(--border-light)] hover:border-[var(--primary-green)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <BookOpen className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Rabattkoder</p>
              <p className="text-[10px] text-[var(--text-secondary)]">CSV</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
