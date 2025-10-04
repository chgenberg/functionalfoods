"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Download, 
  Eye, RefreshCw, RotateCcw, TrendingDown, TrendingUp, XCircle,
  Search, Filter, Calendar, BarChart3, Users, Package,
  ArrowUpDown, ChevronDown, ChevronUp, FileSpreadsheet,
  Mail, Phone, Globe, Hash, Zap
} from "lucide-react";
import * as XLSX from 'xlsx';

interface StripePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  description: string;
  customer: {
    email: string;
    name: string;
    metadata?: {
      phone?: string;
      country?: string;
      course?: string;
      userId?: string;
    };
  };
  orderInfo?: {
    orderNumber: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  };
  paymentMethod?: {
    type: string;
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  };
  receiptUrl?: string;
  refunded: boolean;
  refundAmount: number;
  failureCode?: string;
  failureMessage?: string;
}

interface PaymentSummary {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  totalAmount: number;
  refundedAmount: number;
  avgOrderValue: number;
  topCourse: string;
  conversionRate: number;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  course: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  customer: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function EnhancedAdminSalesPage() {
  const [payments, setPayments] = useState<StripePayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<StripePayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    refundedAmount: 0,
    avgOrderValue: 0,
    topCourse: '',
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<StripePayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    course: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: '',
    customer: '',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  // Date range presets
  const dateRangePresets = {
    today: { label: 'Idag', days: 0 },
    yesterday: { label: 'Igår', days: 1 },
    week: { label: 'Senaste 7 dagarna', days: 7 },
    month: { label: 'Senaste 30 dagarna', days: 30 },
    quarter: { label: 'Senaste 90 dagarna', days: 90 },
    year: { label: 'Senaste året', days: 365 },
    all: { label: 'Alla transaktioner', days: null }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/stripe-payments', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

        const data = await response.json();
        setPayments(data.payments);
        setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const preset = dateRangePresets[filters.dateRange as keyof typeof dateRangePresets];
      if (preset.days !== null) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - preset.days);
        filtered = filtered.filter(p => new Date(p.created) >= cutoffDate);
      }
    }

    // Course filter
    if (filters.course !== 'all') {
      filtered = filtered.filter(p => 
        p.description?.toLowerCase().includes(filters.course.toLowerCase()) ||
        p.customer.metadata?.course === filters.course
      );
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(p => p.paymentMethod?.type === filters.paymentMethod);
    }

    // Amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount) * 100;
      filtered = filtered.filter(p => p.amount >= min);
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount) * 100;
      filtered = filtered.filter(p => p.amount <= max);
    }

    // Customer search
    if (filters.customer) {
      const search = filters.customer.toLowerCase();
      filtered = filtered.filter(p => 
        p.customer.email.toLowerCase().includes(search) ||
        p.customer.name?.toLowerCase().includes(search)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'customer':
          compareValue = (a.customer.name || a.customer.email).localeCompare(b.customer.name || b.customer.email);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'created':
        default:
          compareValue = new Date(a.created).getTime() - new Date(b.created).getTime();
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredPayments(filtered);
  };

   const exportToExcel = () => {
     const exportData = filteredPayments.map(payment => ({
       'Order ID': payment.id,
       'Order Number': payment.orderInfo?.orderNumber || '-',
       'Datum': new Date(payment.created).toLocaleString('sv-SE'),
       'Kund': payment.customer.name || payment.customer.email,
       'E-post': payment.customer.email,
       'Telefon': payment.customer.metadata?.phone || '-',
       'Land': payment.customer.metadata?.country || '-',
       'Produkt': payment.description,
       'Produktdetaljer': payment.orderInfo?.items.map((item: any) => `${item.quantity}x ${item.name} (${item.price} kr)`).join('; ') || '-',
       'Kurs': payment.customer.metadata?.course || extractCourseFromDescription(payment.description),
       'Belopp': `${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}`,
       'Status': getStatusText(payment.status),
       'Betalningsmetod': payment.paymentMethod?.type || '-',
       'Kortmärke': payment.paymentMethod?.card?.brand || '-',
       'Sista 4': payment.paymentMethod?.card?.last4 || '-',
       'Återbetalad': payment.refunded ? 'Ja' : 'Nej',
       'Återbetalat belopp': payment.refundAmount > 0 ? `${(payment.refundAmount / 100).toFixed(2)} ${payment.currency.toUpperCase()}` : '-',
       'Kvitto URL': payment.receiptUrl || '-'
     }));

    const summaryData = [{
      'Sammanfattning': 'Total försäljning',
      'Värde': `${(summary.totalAmount / 100).toFixed(2)} SEK`
    }, {
      'Sammanfattning': 'Antal transaktioner',
      'Värde': summary.total
    }, {
      'Sammanfattning': 'Genomsnittligt ordervärde',
      'Värde': `${(summary.avgOrderValue / 100).toFixed(2)} SEK`
    }, {
      'Sammanfattning': 'Lyckade transaktioner',
      'Värde': summary.successful
    }, {
      'Sammanfattning': 'Väntande transaktioner',
      'Värde': summary.pending
    }, {
      'Sammanfattning': 'Misslyckade transaktioner',
      'Värde': summary.failed
    }, {
      'Sammanfattning': 'Återbetalat totalt',
      'Värde': `${(summary.refundedAmount / 100).toFixed(2)} SEK`
    }, {
      'Sammanfattning': 'Konverteringsgrad',
      'Värde': `${summary.conversionRate}%`
    }];

    const wb = XLSX.utils.book_new();
    
    // Add transactions sheet
    const wsTransactions = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaktioner');
    
    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Sammanfattning');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `forsaljning_${date}.xlsx`;
    
    // Write file
    XLSX.writeFile(wb, filename);
  };

  const extractCourseFromDescription = (description: string): string => {
    if (!description) return '-';
    if (description.includes('Functional Basics')) return 'Functional Basics';
    if (description.includes('Functional Flow')) return 'Functional Flow';
    if (description.includes('Functional Insulin balance/Energy') || description.includes('Functional Energy')) return 'Functional Insulin balance/Energy';
    return '-';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing': 
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'canceled':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'succeeded': 'Lyckad',
      'processing': 'Behandlas',
      'requires_payment_method': 'Kräver betalningsmetod',
      'requires_confirmation': 'Kräver bekräftelse',
      'requires_action': 'Kräver åtgärd',
      'canceled': 'Avbruten',
      'failed': 'Misslyckad'
    };
    return statusMap[status] || status;
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Är du säker på att du vill återbetala denna betalning?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/stripe-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentIntentId: paymentId,
          reason: 'requested_by_customer'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }

      await fetchPayments();
      setSelectedPayment(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      course: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: '',
      customer: '',
      sortBy: 'created',
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
          <p className="mt-4 text-[var(--text-secondary)]">Laddar försäljningsdata...</p>
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
          onClick={fetchPayments}
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
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Försäljning</h1>
          <p className="text-[var(--text-secondary)] font-light">Hantera och analysera alla transaktioner</p>
          <p className="text-sm text-gray-500 mt-1">
            💳 <strong>Tips:</strong> Data uppdateras automatiskt var 30:e sekund. Exportera till Excel för rapporter.
          </p>
          </div>
        <div className="flex gap-3">
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
            onClick={fetchPayments}
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
                <h3 className="text-lg font-medium text-[var(--primary-green)]">Avancerade filter</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors"
                >
                  Återställ filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="admin-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="all">Alla statusar</option>
                    <option value="succeeded">Lyckad</option>
                    <option value="processing">Behandlas</option>
                    <option value="failed">Misslyckad</option>
                    <option value="canceled">Avbruten</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="admin-label">Tidsperiod</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="admin-select"
                  >
                    {Object.entries(dateRangePresets).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label}</option>
                    ))}
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

                {/* Payment Method */}
                <div>
                  <label className="admin-label">Betalningsmetod</label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="all">Alla metoder</option>
                    <option value="card">Kort</option>
                    <option value="klarna">Klarna</option>
                    <option value="swish">Swish</option>
                  </select>
                </div>

                {/* Amount Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="admin-label">Min belopp</label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                      placeholder="0"
                      className="admin-select"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Max belopp</label>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                      placeholder="10000"
                      className="admin-select"
                    />
                  </div>
                </div>

                {/* Customer Search */}
                <div className="lg:col-span-2">
                  <label className="admin-label">Sök kund</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.customer}
                      onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="Namn eller e-postadress..."
                      className="admin-input pl-10"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="admin-label">Sortera efter</label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                    >
                      <option value="created">Datum</option>
                      <option value="amount">Belopp</option>
                      <option value="customer">Kund</option>
                      <option value="status">Status</option>
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
                  Visar {filteredPayments.length} av {payments.length} transaktioner
                  {filters.dateRange !== 'all' && ` • ${dateRangePresets[filters.dateRange as keyof typeof dateRangePresets].label}`}
                  {filters.status !== 'all' && ` • ${getStatusText(filters.status)}`}
                  {filters.course !== 'all' && ` • ${filters.course}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total försäljning</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(summary.totalAmount / 100).toFixed(0)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.total} transaktioner
          </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Snitt ordervärde</span>
            <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
          <p className="text-2xl font-bold text-gray-900">
            {(summary.avgOrderValue / 100).toFixed(0)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per transaktion
          </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Lyckade</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
          <p className="text-2xl font-bold text-green-600">
            {summary.successful}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.total > 0 ? Math.round((summary.successful / summary.total) * 100) : 0}% av totalt
          </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Väntande</span>
            <Clock className="w-5 h-5 text-yellow-600" />
              </div>
          <p className="text-2xl font-bold text-yellow-600">
            {summary.pending}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Kräver åtgärd
          </p>
          </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Återbetalat</span>
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(summary.refundedAmount / 100).toFixed(0)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Totalt återbetalat
          </p>
        </motion.div>
        </div>

        {/* Payments Table */}
      <div className="admin-table">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
                <tr>
                  <th className="text-left">Status</th>
                  <th className="text-left">Kund</th>
                  <th className="text-left">Produkt</th>
                  <th className="text-left">Belopp</th>
                  <th className="text-left">Betalningsmetod</th>
                  <th className="text-left">Datum</th>
                  <th className="text-right">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    Inga transaktioner hittades med valda filter
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm text-gray-900">
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.customer.name || 'Okänd'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.customer.email}
                        </p>
                      </div>
                    </td>
                     <td >
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {payment.description || 'Ingen beskrivning'}
                         </p>
                         {payment.orderInfo && (
                           <div className="text-xs text-gray-500 mt-1">
                             <p>Order: {payment.orderInfo.orderNumber}</p>
                             {payment.orderInfo.items.map((item: any, idx: number) => (
                               <p key={idx}>{item.quantity}x {item.name}</p>
                             ))}
                           </div>
                         )}
                       </div>
                     </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </p>
                      {payment.refunded && (
                        <p className="text-xs text-red-600">
                          Återbetalad: {(payment.refundAmount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      {payment.paymentMethod ? (
                      <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {payment.paymentMethod.card?.brand || payment.paymentMethod.type}
                          </span>
                          {payment.paymentMethod.card?.last4 && (
                            <span className="text-xs text-gray-500">
                              ****{payment.paymentMethod.card.last4}
                        </span>
                        )}
                      </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(payment.created).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPayment(payment)}
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

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Betalningsdetaljer</h2>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                </div>

              <div className="p-6 space-y-6">
                {/* Status Section */}
                  <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Status</h3>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedPayment.status)}
                    <span className="text-lg font-medium text-gray-900">
                      {getStatusText(selectedPayment.status)}
                    </span>
                    {selectedPayment.refunded && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Återbetalad
                      </span>
                    )}
                  </div>
                  {selectedPayment.failureMessage && (
                    <p className="mt-2 text-sm text-red-600">
                      Fel: {selectedPayment.failureMessage}
                    </p>
                  )}
                  </div>

                {/* Customer Section */}
                  <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Kundinformation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedPayment.customer.email}</span>
                    </div>
                    {selectedPayment.customer.name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedPayment.customer.name}</span>
                  </div>
                    )}
                    {selectedPayment.customer.metadata?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedPayment.customer.metadata.phone}</span>
                      </div>
                    )}
                    {selectedPayment.customer.metadata?.country && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedPayment.customer.metadata.country}</span>
                      </div>
                    )}
                  </div>
                      </div>
                      
                {/* Payment Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Betalningsdetaljer</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Belopp</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(selectedPayment.amount / 100).toFixed(2)} {selectedPayment.currency.toUpperCase()}
                          </span>
                        </div>
                    {selectedPayment.refundAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Återbetalat</span>
                        <span className="text-sm font-medium text-red-600">
                          -{(selectedPayment.refundAmount / 100).toFixed(2)} {selectedPayment.currency.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Netto</span>
                        <span className="text-sm font-bold text-gray-900">
                          {((selectedPayment.amount - selectedPayment.refundAmount) / 100).toFixed(2)} {selectedPayment.currency.toUpperCase()}
                        </span>
                      </div>
                      </div>
                    </div>
                  </div>

                 {/* Order Details */}
                 <div>
                   <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Orderdetaljer</h3>
                   <div className="space-y-3">
                     <div className="flex items-start gap-2">
                       <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                         <p className="text-sm font-medium text-gray-900">{selectedPayment.description || 'Ingen beskrivning'}</p>
                         {selectedPayment.orderInfo && (
                           <div className="mt-2 space-y-1">
                             <p className="text-xs text-gray-600 font-medium">Order: {selectedPayment.orderInfo.orderNumber}</p>
                             {selectedPayment.orderInfo.items.map((item: any, idx: number) => (
                               <div key={idx} className="bg-gray-50 rounded p-2">
                                 <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                 <p className="text-xs text-gray-600">
                                   Antal: {item.quantity} • Pris: {item.price} kr • Typ: {item.type}
                                 </p>
                               </div>
                             ))}
                           </div>
                        )}
                      </div>
                    </div>
                     <div className="flex items-center gap-2">
                       <Hash className="w-4 h-4 text-gray-400" />
                       <span className="text-sm text-gray-900 font-mono">{selectedPayment.id}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-gray-400" />
                       <span className="text-sm text-gray-900">
                         {new Date(selectedPayment.created).toLocaleString('sv-SE')}
                       </span>
                     </div>
                   </div>
                 </div>

                  {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {selectedPayment.receiptUrl && (
                      <a
                        href={selectedPayment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                      <Download className="w-4 h-4" />
                      Visa kvitto
                      </a>
                    )}
                    {selectedPayment.status === 'succeeded' && !selectedPayment.refunded && (
                      <button
                      onClick={() => handleRefund(selectedPayment.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Återbetala
                      </button>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
