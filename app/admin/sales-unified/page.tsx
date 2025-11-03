"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Download, 
  Eye, RefreshCw, TrendingUp, XCircle, Search, Filter, Calendar, 
  BarChart3, Users, Package, ArrowUpDown, ChevronDown, ChevronUp,
  FileSpreadsheet, Mail, Phone, Globe, Hash, UserPlus, Upload,
  Info, ShoppingBag, CreditCard as CardIcon, FileText, Import
} from "lucide-react";
import * as XLSX from 'xlsx';
import { formatPrice } from '@/app/lib/utils';

interface UnifiedCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  country?: string;
  courses: string[];
  totalSpent: number;
  lastPurchase: Date | null;
  source: 'stripe' | 'manual' | 'import';
  status: 'active' | 'pending' | 'inactive';
  orderCount: number;
  createdAt: Date;
  orders: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    date: Date;
    items: string[];
    paymentMethod?: string;
  }[];
}

interface Summary {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  courseBreakdown: Record<string, { count: number; revenue: number }>;
  sourceBreakdown: {
    stripe: number;
    manual: number;
    import: number;
  };
}

interface FilterOptions {
  source: string;
  course: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function UnifiedSalesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'analytics'>('overview');
  const [customers, setCustomers] = useState<UnifiedCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<UnifiedCustomer[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    courseBreakdown: {},
    sourceBreakdown: { stripe: 0, manual: 0, import: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<UnifiedCustomer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    source: 'all',
    course: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'lastPurchase',
    sortOrder: 'desc'
  });

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    name: '',
    phone: '',
    country: 'SE',
    courses: [] as string[]
  });

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        source: filters.source,
        course: filters.course,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search
      });

      const response = await fetch(`/api/admin/unified-sales?${queryParams}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Client-side sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'totalSpent':
          compareValue = a.totalSpent - b.totalSpent;
          break;
        case 'orderCount':
          compareValue = a.orderCount - b.orderCount;
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'lastPurchase':
        default:
          if (!a.lastPurchase && !b.lastPurchase) return 0;
          if (!a.lastPurchase) return 1;
          if (!b.lastPurchase) return -1;
          compareValue = new Date(a.lastPurchase).getTime() - new Date(b.lastPurchase).getTime();
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredCustomers(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Kund ID': customer.id,
      'Namn': customer.name,
      'E-post': customer.email,
      'Telefon': customer.phone || '-',
      'Land': customer.country || '-',
      'Kurser': customer.courses.join(', ') || '-',
      'Antal ordrar': customer.orderCount,
      'Total spenderat': `${formatPrice(customer.totalSpent)} kr`,
      'Senaste köp': customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('sv-SE') : '-',
      'Källa': getSourceText(customer.source),
      'Status': getStatusText(customer.status),
      'Registrerad': new Date(customer.createdAt).toLocaleDateString('sv-SE')
    }));

    const summaryData = [{
      'Sammanfattning': 'Totalt antal kunder',
      'Värde': summary.totalCustomers
    }, {
      'Sammanfattning': 'Total försäljning',
      'Värde': `${formatPrice(summary.totalRevenue)} kr`
    }, {
      'Sammanfattning': 'Genomsnittligt ordervärde',
      'Värde': `${formatPrice(summary.averageOrderValue)} kr`
    }, {
      'Sammanfattning': 'Kunder från Stripe',
      'Värde': summary.sourceBreakdown.stripe
    }, {
      'Sammanfattning': 'Manuellt tillagda kunder',
      'Värde': summary.sourceBreakdown.manual
    }, {
      'Sammanfattning': 'Importerade kunder',
      'Värde': summary.sourceBreakdown.import
    }];

    const wb = XLSX.utils.book_new();
    
    // Add customers sheet
    const wsCustomers = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, 'Kunder');
    
    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Sammanfattning');

    // Add course breakdown sheet
    const courseData = Object.entries(summary.courseBreakdown).map(([course, data]) => ({
      'Kurs': course,
      'Antal kunder': data.count,
      'Total försäljning': `${formatPrice(data.revenue)} kr`
    }));
    const wsCourses = XLSX.utils.json_to_sheet(courseData);
    XLSX.utils.book_append_sheet(wb, wsCourses, 'Kurser');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `kunder_${date}.xlsx`;
    
    // Write file
    XLSX.writeFile(wb, filename);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'manual':
        return <UserPlus className="w-5 h-5 text-green-600" />;
      case 'import':
        return <Upload className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSourceText = (source: string) => {
    const sourceMap: { [key: string]: string } = {
      'stripe': 'Stripe',
      'manual': 'Manuell',
      'import': 'Importerad'
    };
    return sourceMap[source] || source;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Aktiv',
      'pending': 'Väntande',
      'inactive': 'Inaktiv'
    };
    return statusMap[status] || status;
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.email || newCustomer.courses.length === 0) {
      alert('E-post och minst en kurs krävs');
      return;
    }

    try {
      const response = await fetch('/api/admin/unified-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newCustomer)
      });

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      await fetchCustomers();
      setShowAddCustomer(false);
      setNewCustomer({
        email: '',
        name: '',
        phone: '',
        country: 'SE',
        courses: []
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetFilters = () => {
    setFilters({
      source: 'all',
      course: 'all',
      dateFrom: '',
      dateTo: '',
      search: '',
      sortBy: 'lastPurchase',
      sortOrder: 'desc'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">Laddar kunddata...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-[var(--coral-accent)] mx-auto mb-4" />
        <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">Ett fel uppstod</h2>
        <p className="text-[var(--text-secondary)] mb-4">{error}</p>
        <button
          onClick={fetchCustomers}
          className="admin-btn admin-btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Kunder & Försäljning</h1>
          <p className="text-[var(--text-secondary)] font-light">Hantera alla kunder från ett ställe</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span><strong>Tips:</strong> Visar kunder från Stripe, manuella tillägg och importer. Exportera för rapporter.</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddCustomer(true)}
            className="admin-btn admin-btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Lägg till kund
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`admin-btn ${
              showFilters ? 'admin-btn-primary' : 'admin-btn-secondary'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={exportToExcel}
            className="admin-btn admin-btn-secondary"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportera Excel
          </button>
          <button
            onClick={fetchCustomers}
            className="admin-btn admin-btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Uppdatera
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--primary-green)]">Filter</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
                >
                  Återställ filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source */}
                <div>
                  <label className="admin-label">Källa</label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="all">Alla källor</option>
                    <option value="stripe">Stripe</option>
                    <option value="manual">Manuell</option>
                    <option value="import">Importerad</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="admin-label">Kurs</label>
                  <select
                    value={filters.course}
                    onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="all">Alla kurser</option>
                    <option value="functional-basics">Functional Basics</option>
                    <option value="functional-flow">Functional Flow</option>
                    <option value="functional-energy">Functional Insulin balance/Energy</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="admin-label">Från datum</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Till datum</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="admin-input"
                  />
                </div>

                {/* Search */}
                <div className="md:col-span-2">
                  <label className="admin-label">Sök kund</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Namn, e-post eller telefon..."
                      className="admin-input pl-10"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="md:col-span-2">
                  <label className="admin-label">Sortera efter</label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                    >
                      <option value="lastPurchase">Senaste köp</option>
                      <option value="totalSpent">Total spenderat</option>
                      <option value="orderCount">Antal ordrar</option>
                      <option value="name">Namn</option>
                      <option value="email">E-post</option>
                    </select>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Visar {filteredCustomers.length} av {customers.length} kunder
                  {filters.source !== 'all' && ` • ${getSourceText(filters.source)}`}
                  {filters.course !== 'all' && ` • ${filters.course}`}
                  {filters.search && ` • Sökning: ${filters.search}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Översikt
            </div>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'customers'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kunder ({filteredCustomers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analys
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Totalt antal kunder</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {summary.totalCustomers}
          </p>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <p>Stripe: {summary.sourceBreakdown.stripe}</p>
            <p>Manuell: {summary.sourceBreakdown.manual}</p>
            <p>Import: {summary.sourceBreakdown.import}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total försäljning</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPrice(summary.totalRevenue)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Från alla källor
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Snitt ordervärde</span>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPrice(summary.averageOrderValue)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per kund med ordrar
          </p>
            </motion.div>
          </div>

            {/* Course Breakdown Summary */}
            <div className="mt-8 admin-card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kursfördelning</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(summary.courseBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 3)
                  .map(([course, data]) => (
                    <div key={course} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">{course}</p>
                      <p className="text-xl font-bold text-gray-900">{data.count}</p>
                      <p className="text-xs text-gray-500">{formatPrice(data.revenue)} kr</p>
                    </div>
                  ))}
                {Object.keys(summary.courseBreakdown).length === 0 && (
                  <p className="text-sm text-gray-500 col-span-3 text-center py-4">Ingen kursdata tillgänglig</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Customers Table */}
            <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Källa</th>
                <th className="text-left">Kund</th>
                <th className="text-left">Kontakt</th>
                <th className="text-left">Kurser</th>
                <th className="text-left">Ordrar</th>
                <th className="text-left">Total spenderat</th>
                <th className="text-left">Senaste köp</th>
                <th className="text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    Inga kunder hittades med valda filter
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(customer.source)}
                        <span className="text-sm text-gray-900">
                          {getSourceText(customer.source)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Globe className="w-3 h-3" />
                          {customer.country || 'SE'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {customer.courses.map((course, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {course}
                          </span>
                        ))}
                        {customer.courses.length === 0 && (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.orderCount} st
                      </p>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(customer.totalSpent)} kr
                      </p>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {customer.lastPurchase ? 
                          new Date(customer.lastPurchase).toLocaleDateString('sv-SE') : 
                          '-'
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-[#014421] hover:text-[#012A14]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="admin-card"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-[#014421]" />
                  Total försäljning per kurs
                </h3>
                <div className="space-y-4">
                  {Object.entries(summary.courseBreakdown)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([course, data], idx) => {
                      const maxRevenue = Math.max(...Object.values(summary.courseBreakdown).map(d => d.revenue));
                      const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                      const colors = ['bg-gradient-to-r from-blue-500 to-blue-600', 'bg-gradient-to-r from-purple-500 to-purple-600', 'bg-gradient-to-r from-green-500 to-green-600', 'bg-gradient-to-r from-orange-500 to-orange-600'];
                      
                      return (
                        <div key={course}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{course}</span>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{formatPrice(data.revenue)} kr</p>
                              <p className="text-xs text-gray-500">{data.count} kunder</p>
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: idx * 0.1, duration: 0.6 }}
                              className={`h-full ${colors[idx % colors.length]}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(summary.courseBreakdown).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">Ingen kursdata tillgänglig</p>
                  )}
                </div>
              </motion.div>

              {/* Source Breakdown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="admin-card"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#014421]" />
                  Kunder per källa
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Stripe', value: summary.sourceBreakdown.stripe, color: 'from-blue-500 to-blue-600', icon: CreditCard },
                    { label: 'Manuell', value: summary.sourceBreakdown.manual, color: 'from-green-500 to-green-600', icon: UserPlus },
                    { label: 'Import', value: summary.sourceBreakdown.import, color: 'from-purple-500 to-purple-600', icon: Upload }
                  ].map((source, idx) => {
                    const total = summary.sourceBreakdown.stripe + summary.sourceBreakdown.manual + summary.sourceBreakdown.import;
                    const percentage = total > 0 ? (source.value / total) * 100 : 0;
                    const Icon = source.icon;
                    
                    return (
                      <div key={source.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{source.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{source.value}</p>
                            <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className={`h-full bg-gradient-to-r ${source.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm font-medium">Totalt antal kunder</span>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{summary.totalCustomers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="admin-stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm font-medium">Total försäljning</span>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">{formatPrice(summary.totalRevenue)} kr</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="admin-stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm font-medium">Snitt ordervärde</span>
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{formatPrice(summary.averageOrderValue)} kr</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Kunddetaljer</h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Kundinformation
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCustomer.name}</span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedCustomer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedCustomer.country || 'SE'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(selectedCustomer.source)}
                        <span className="text-sm text-gray-900">
                          Källa: {getSourceText(selectedCustomer.source)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Statistik
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total spenderat</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(selectedCustomer.totalSpent)} kr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Antal ordrar</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.orderCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Genomsnitt per order</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.orderCount > 0 
                            ? formatPrice(selectedCustomer.totalSpent / selectedCustomer.orderCount)
                            : '0'
                          } kr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Registrerad</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedCustomer.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Kurser
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.courses.map((course, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                    {selectedCustomer.courses.length === 0 && (
                      <p className="text-sm text-gray-500">Inga kurser registrerade</p>
                    )}
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Orderhistorik
                  </h3>
                  {selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {new Date(order.date).toLocaleString('sv-SE')}
                              </p>
                              <div className="mt-2">
                                {order.items.map((item, idx) => (
                                  <p key={idx} className="text-sm text-gray-700">
                                    • {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatPrice(order.amount)} kr
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.paymentMethod || 'Okänd metod'}
                              </p>
                              <p className={`text-xs mt-1 ${
                                order.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Inga ordrar registrerade</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddCustomer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Lägg till kund</h2>
                  <button
                    onClick={() => setShowAddCustomer(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="admin-label">E-postadress *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="admin-input"
                    placeholder="kund@example.com"
                  />
                </div>

                <div>
                  <label className="admin-label">Namn</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="admin-input"
                    placeholder="Förnamn Efternamn"
                  />
                </div>

                <div>
                  <label className="admin-label">Telefon</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="admin-input"
                    placeholder="+46701234567"
                  />
                </div>

                <div>
                  <label className="admin-label">Land</label>
                  <input
                    type="text"
                    value={newCustomer.country}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, country: e.target.value }))}
                    className="admin-input"
                    placeholder="SE"
                  />
                </div>

                <div>
                  <label className="admin-label">Kurser *</label>
                  <div className="space-y-2">
                    {['Functional Basics', 'Functional Flow', 'Functional Insulin balance/Energy'].map(course => (
                      <label key={course} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCustomer.courses.includes(course)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCustomer(prev => ({ 
                                ...prev, 
                                courses: [...prev.courses, course] 
                              }));
                            } else {
                              setNewCustomer(prev => ({ 
                                ...prev, 
                                courses: prev.courses.filter(c => c !== course) 
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-[#014421] focus:ring-[#014421]"
                        />
                        <span className="text-sm text-gray-700">{course}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddCustomer(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleAddCustomer}
                    disabled={!newCustomer.email || newCustomer.courses.length === 0}
                    className="flex-1 px-4 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#012A14] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Lägg till kund
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
