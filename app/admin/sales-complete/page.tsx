"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Download, 
  Eye, RefreshCw, TrendingUp, XCircle, Search, Filter, Calendar, 
  BarChart3, Users, Package, ArrowUpDown, ChevronDown, ChevronUp,
  FileSpreadsheet, Mail, Phone, Globe, Hash, UserPlus, Upload,
  Info, ShoppingBag, CreditCard as CardIcon, FileText, ShoppingCart,
  Building2, RotateCcw
} from "lucide-react";
import * as XLSX from 'xlsx';
import { formatPrice } from '@/app/lib/utils';

interface UnifiedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCountry?: string;
  amount: number;
  currency: string;
  status: string;
  orderStatus?: string;
  paymentMethod: string;
  paymentProvider: 'stripe' | 'svea' | 'manual';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    type: string;
  }>;
  courses: string[];
  createdAt: string;
  refunded: boolean;
  refundAmount?: number;
  receiptUrl?: string;
  metadata?: any;
  source?: string;
}

interface Attribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  mc_cid?: string;
  mc_eid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  ts?: number;
}

interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  successfulOrders: number;
  pendingOrders: number;
  failedOrders: number;
  refundedAmount: number;
  abandonedCartRevenue: number;
  abandonedCartOrders: number;
  providerBreakdown: {
    stripe: { count: number; revenue: number };
    svea: { count: number; revenue: number };
    manual: { count: number; revenue: number };
  };
  courseBreakdown: Record<string, { count: number; revenue: number }>;
  monthlyRevenue: Array<{ date: string; amount: number }>;
}

interface FilterOptions {
  provider: string;
  status: string;
  dateRange: string;
  dateFrom: string;
  dateTo: string;
  course: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  customer: string;
  coupon: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function UnifiedSalesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'stripe' | 'svea' | 'manual'>('all');
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<UnifiedOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    successfulOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    refundedAmount: 0,
    abandonedCartRevenue: 0,
    abandonedCartOrders: 0,
    providerBreakdown: {
      stripe: { count: 0, revenue: 0 },
      svea: { count: 0, revenue: 0 },
      manual: { count: 0, revenue: 0 }
    },
    courseBreakdown: {},
    monthlyRevenue: []
  });
  const [filteredSummary, setFilteredSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    successfulOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    refundedAmount: 0,
    abandonedCartRevenue: 0,
    abandonedCartOrders: 0,
    providerBreakdown: {
      stripe: { count: 0, revenue: 0 },
      svea: { count: 0, revenue: 0 },
      manual: { count: 0, revenue: 0 }
    },
    courseBreakdown: {},
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    provider: 'all',
    status: 'all',
    dateRange: 'all',
    dateFrom: '',
    dateTo: '',
    course: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: '',
    customer: '',
    coupon: '',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const dateRangePresets = {
    today: { label: 'Idag', days: 0 },
    yesterday: { label: 'Igår', days: 1 },
    week: { label: 'Senaste 7 dagarna', days: 7 },
    month: { label: 'Senaste 30 dagarna', days: 30 },
    quarter: { label: 'Senaste 90 dagarna', days: 90 },
    year: { label: 'Senaste året', days: 365 },
    custom: { label: 'Välj datum', days: null },
    all: { label: 'Alla transaktioner', days: null }
  };

  const [manualProcessing, setManualProcessing] = useState<string | null>(null);

  // Helper function to normalize course names
  const normalizeCourseNames = (courses: string[]): string[] => {
    return courses.map(course => {
      const normalized = (course || '').trim();
      const lower = normalized.toLowerCase();
      
      // E-book
      if (lower.includes('e-bok') || lower.includes('ebook') || lower.includes('e bok')) return 'E-bok';
      // Flow variants
      if (lower.includes('flow') || lower.includes('gut health')) {
        return 'Functional Flow';
      }
      // Energy variants
      if (lower.includes('energy') || lower.includes('insulin')) {
        return 'Functional Energy';
      }
      // Basics
      if (lower.includes('basic')) {
        return 'Functional Basics';
      }
      // Hormonell Balans
      if (lower.includes('hormon')) {
        return 'Hormonell Balans';
      }
      
      return normalized;
    });
  };

  const extractCoursesFromDescription = (description: string): string[] => {
    if (!description) return [];
    const lower = description.toLowerCase();
    const courses: string[] = [];
    
    if (lower.includes('e-bok') || lower.includes('ebook') || lower.includes('e bok')) courses.push('E-bok');
    if (lower.includes('functional basics') || lower.includes('basics')) {
      courses.push('Functional Basics');
    }
    if (lower.includes('functional flow') || lower.includes('gut health') || lower.includes('flow')) {
      courses.push('Functional Flow');
    }
    if (lower.includes('functional energy') || lower.includes('insulin') || lower.includes('energy')) {
      courses.push('Functional Energy');
    }
    if (lower.includes('hormon')) {
      courses.push('Hormonell Balans');
    }
    
    return courses;
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch from database - this is the source of truth
      const ordersRes = await fetch('/api/admin/orders', { credentials: 'include' });

      if (!ordersRes.ok) {
        throw new Error('Failed to fetch order data');
      }

      const ordersData = await ordersRes.json();

      // Process orders from database only (no duplicates!)
      const combinedOrders: UnifiedOrder[] = [];
      
      ordersData.forEach((order: any) => {
        // Determine payment provider
        let paymentProvider: 'stripe' | 'svea' | 'manual' = 'manual';
        
        if (order.checkoutOrderId) {
          // If there's a checkoutOrderId, it's from Svea
          paymentProvider = 'svea';
        } else if (order.payment?.paymentMethod) {
          const method = order.payment.paymentMethod.toLowerCase();
          if (method.includes('stripe') || method.includes('card')) {
            paymentProvider = 'stripe';
          } else if (method.includes('svea') || method.includes('swish') || method.includes('faktura')) {
            paymentProvider = 'svea';
          }
        }

        const rawProducts = order.items?.map((i: any) => i?.name || '') || [];
        const normalizedCourses = normalizeCourseNames(rawProducts);
        const metadata = order.metadata as any || {};
        const displayPaymentStatus = order.displayPaymentStatus || order.paymentStatus || order.payment?.status || order.status;

        combinedOrders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName || order.user?.name || 'Okänd',
          customerEmail: order.customerEmail || order.user?.email || '',
          customerPhone: metadata.phone,
          customerCountry: metadata.country || 'SE',
          amount: order.totalAmount,
          currency: order.currency || 'SEK',
          status: displayPaymentStatus,
          orderStatus: order.orderStatus || order.status,
          paymentMethod: order.payment?.paymentMethod || metadata.sveaPaymentType || 'unknown',
          paymentProvider: paymentProvider,
          items: order.items || [],
          courses: normalizedCourses,
          createdAt: order.createdAt,
          refunded: metadata.refunded || false,
          refundAmount: metadata.refundAmount || 0,
          metadata: order.metadata,
          source: 'db'
        });
      });

      // Calculate summary
      const summary = calculateSummary(combinedOrders);

      setOrders(combinedOrders);
      setSummary(summary);
      setFilteredSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (orders: UnifiedOrder[]): OrderSummary => {
    const summary: OrderSummary = {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      successfulOrders: 0,
      pendingOrders: 0,
      failedOrders: 0,
      refundedAmount: 0,
      abandonedCartRevenue: 0,
      abandonedCartOrders: 0,
      providerBreakdown: {
        stripe: { count: 0, revenue: 0 },
        svea: { count: 0, revenue: 0 },
        manual: { count: 0, revenue: 0 }
      },
      courseBreakdown: {},
      monthlyRevenue: []
    };

    const monthlyMap: Record<string, number> = {};
    const getOrderGrossAmount = (order: UnifiedOrder) => {
      if (order.amount && order.amount > 0) {
        return order.amount;
      }

      return (order.items || []).reduce((sum, item) => {
        const isBook =
          item.type === 'book' ||
          (item.name || '').toLowerCase().includes('bok');
        const vatRate = isBook ? 0.06 : 0.25;
        const unitPriceInclVat =
          Math.round((item.price || 0) * (1 + vatRate) * 100) / 100;
        return sum + unitPriceInclVat * (item.quantity || 1);
      }, 0);
    };

    orders.forEach(order => {
      // Only count actually sold items for completed payments (refunds should NOT count as sold)
      const isCompleted = order.status === 'COMPLETED';
      const isPending = order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'CONFIRMED';
      const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';

      // Count all orders
      summary.totalOrders++;

      // Count by status
      if (isCompleted) {
        summary.successfulOrders++;
        summary.totalRevenue += order.amount - (order.refundAmount || 0);
      } else if (isPending) {
        summary.pendingOrders++;
      } else if (isFailed) {
        summary.failedOrders++;
      }

      if (order.status === 'RECOVERED') {
        summary.abandonedCartOrders++;
        summary.abandonedCartRevenue += getOrderGrossAmount(order) - (order.refundAmount || 0);
      }

      // Provider breakdown - only count completed orders for revenue
      if (summary.providerBreakdown[order.paymentProvider]) {
        if (isCompleted) {
          summary.providerBreakdown[order.paymentProvider].count++;
          summary.providerBreakdown[order.paymentProvider].revenue += order.amount - (order.refundAmount || 0);
        }
      }

      // Course/book breakdown - only completed orders
      if (isCompleted) {
        const hasItems = Array.isArray(order.items) && order.items.length > 0;
        if (hasItems) {
          order.items.forEach((item) => {
            const courseName = normalizeCourseNames([item.name || ''])[0];
            if (!courseName) return;
            if (!summary.courseBreakdown[courseName]) {
              summary.courseBreakdown[courseName] = { count: 0, revenue: 0 };
            }
            // Count each item quantity (e.g., 2x Functional Basics = 2)
            summary.courseBreakdown[courseName].count += item.quantity || 1;
            // Calculate revenue including VAT for display
            const vatRate = (item.type === 'book' || item.name?.toLowerCase().includes('bok')) ? 0.06 : 0.25;
            const priceInclVAT = (item.price || 0) * (1 + vatRate);
            summary.courseBreakdown[courseName].revenue += priceInclVAT * (item.quantity || 1);
          });
        } else if (order.courses.length > 0 && order.amount > 0) {
          // Fallback to legacy course list
          order.courses.forEach(course => {
            if (!summary.courseBreakdown[course]) {
              summary.courseBreakdown[course] = { count: 0, revenue: 0 };
            }
            summary.courseBreakdown[course].count += 1;
            const perItemRevenue = (order.amount - (order.refundAmount || 0)) / Math.max(1, order.courses.length);
            summary.courseBreakdown[course].revenue += perItemRevenue;
          });
        }

        // Monthly revenue
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        monthlyMap[month] = (monthlyMap[month] || 0) + order.amount - (order.refundAmount || 0);
      }

      // Refunds
      if (order.refunded && order.refundAmount) {
        summary.refundedAmount += order.refundAmount;
      }
    });

    // Calculate average (based on completed orders only)
    summary.averageOrderValue = summary.successfulOrders > 0 ? 
      summary.totalRevenue / summary.successfulOrders : 0;

    // Convert monthly map to array
    summary.monthlyRevenue = Object.entries(monthlyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12);

    return summary;
  };

  const manualCompleteOrder = async (orderId: string) => {
    if (manualProcessing) return;
    setManualProcessing(orderId);
    try {
      const confirmAction = window.confirm('Sätt ordern till COMPLETED och skicka mejl?');
      if (!confirmAction) return;
      const res = await fetch('/api/admin/orders/manual-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Kunde inte uppdatera ordern');
      }
      alert(`Order uppdaterad: ${data.status}. Mejl: ${data.emails?.join(', ') || 'ingen'}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err?.message || 'Ett fel uppstod vid manuell godkännande');
    } finally {
      setManualProcessing(null);
    }
  };

  const applyFilters = () => {
    // Visa alla ordrar (inkl. pending) i listan, men statistiken beräknas ändå bara på DB-ordrar
    let filtered = [...orders];

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(o => o.paymentProvider === activeTab);
    }

    // Provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(o => o.paymentProvider === filters.provider);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    // Date range filter
    const parseDateInput = (dateStr: string, endOfDay: boolean) => {
      // Parse YYYY-MM-DD as local date to avoid timezone shifting
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
      if (!m) return null;
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      return endOfDay
        ? new Date(year, month, day, 23, 59, 59, 999)
        : new Date(year, month, day, 0, 0, 0, 0);
    };

    const hasExactDates = !!filters.dateFrom || !!filters.dateTo;
    if (filters.dateRange === 'custom' || hasExactDates) {
      const from = filters.dateFrom ? parseDateInput(filters.dateFrom, false) : null;
      const to = filters.dateTo ? parseDateInput(filters.dateTo, true) : null;
      if (from) filtered = filtered.filter(o => new Date(o.createdAt) >= from);
      if (to) filtered = filtered.filter(o => new Date(o.createdAt) <= to);
    } else if (filters.dateRange !== 'all') {
      const preset = dateRangePresets[filters.dateRange as keyof typeof dateRangePresets];
      if (preset?.days !== null && typeof preset?.days === 'number') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - preset.days);
        filtered = filtered.filter(o => new Date(o.createdAt) >= cutoffDate);
      }
    }

    // Course filter
    if (filters.course !== 'all') {
      filtered = filtered.filter(o => o.courses.includes(filters.course));
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(o => o.paymentMethod === filters.paymentMethod);
    }

    // Amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      filtered = filtered.filter(o => o.amount >= min);
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      filtered = filtered.filter(o => o.amount <= max);
    }

    // Customer search
    if (filters.customer) {
      const search = filters.customer.toLowerCase();
      filtered = filtered.filter(o => 
        o.customerEmail.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.orderNumber.toLowerCase().includes(search)
      );
    }

    // Coupon code search
    if (filters.coupon) {
      const search = filters.coupon.toLowerCase().trim();
      filtered = filtered.filter(o =>
        String(o.metadata?.couponCode || '').toLowerCase().includes(search)
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
          compareValue = a.customerName.localeCompare(b.customerName);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'created':
        default:
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredOrders(filtered);
    setFilteredSummary(calculateSummary(filtered));
  };

  const exportToExcel = () => {
    // 1) Transaction-level export (easy to filter by status/provider/customer)
    const exportData = filteredOrders.map(order => {
      const refund = order.refundAmount || 0;
      const net = order.amount - refund;
      const couponCode = order.metadata?.couponCode || '';
      const discountAmount = order.metadata?.discountAmount || '';
      const sourceInfo = getAttributionLabel(order.metadata?.attribution as Attribution | undefined);
      return {
        'Order ID': order.id,
        'Ordernummer': order.orderNumber,
        // Keep as ISO-like string for robust Excel sorting/filtering
        'Datum': new Date(order.createdAt).toISOString().replace('T', ' ').slice(0, 19),
        'Kund': order.customerName,
        'E-post': order.customerEmail,
        'Telefon': order.customerPhone || '',
        'Land': order.customerCountry || '',
        // Keep product list human-friendly (use " | " to avoid CSV/Excel delimiter collisions)
        'Produkter': order.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
        'Kurser': (order.courses || []).join(' | ') || '',
        'Rabattkod': couponCode,
        'Rabatt (SEK)': discountAmount ? Number(discountAmount) : '',
        'Källa': sourceInfo.label,
        'Detalj': sourceInfo.detail || '',
        // Export numeric amounts as numbers (Excel-friendly)
        'Belopp (SEK)': Number(order.amount),
        'Återbetalat (SEK)': Number(refund),
        'Netto (SEK)': Number(net),
        'Valuta': order.currency,
        // Provide both a human label and a code for filtering/pivoting
        'Status': getStatusText(order.status),
        'Status (kod)': order.status,
        'Betalningsmetod': order.paymentMethod,
        'Leverantör': getProviderText(order.paymentProvider),
        'Leverantör (kod)': order.paymentProvider,
        'Återbetalad': order.refunded ? 'Ja' : 'Nej',
      };
    });

    // 2) Line-item export (easy to pivot by product, quantity, VAT buckets)
    const lineItemsData = filteredOrders.flatMap(order => {
      const createdAtIso = new Date(order.createdAt).toISOString().replace('T', ' ').slice(0, 19);
      return (order.items || []).map((item) => {
        const isBook = item.type === 'book' || (item.name || '').toLowerCase().includes('bok');
        const vatRate = isBook ? 0.06 : 0.25;
        const unitPriceExVat = Number(item.price || 0);
        const unitPriceInclVat = Math.round(unitPriceExVat * (1 + vatRate) * 100) / 100;
        const qty = Number(item.quantity || 1);
        const lineExVat = Math.round(unitPriceExVat * qty * 100) / 100;
        const lineInclVat = Math.round(unitPriceInclVat * qty * 100) / 100;

        return {
          'Ordernummer': order.orderNumber,
          'Datum': createdAtIso,
          'E-post': order.customerEmail,
          'Kund': order.customerName,
          'Källa': getAttributionLabel(order.metadata?.attribution as Attribution | undefined).label,
          'Detalj': getAttributionLabel(order.metadata?.attribution as Attribution | undefined).detail || '',
          'Leverantör (kod)': order.paymentProvider,
          'Status (kod)': order.status,
          'Produkt': item.name,
          'Typ': item.type,
          'Antal': qty,
          'Pris exkl moms (SEK)': unitPriceExVat,
          'Moms %': vatRate * 100,
          'Pris inkl moms (SEK)': unitPriceInclVat,
          'Rad exkl moms (SEK)': lineExVat,
          'Rad inkl moms (SEK)': lineInclVat,
        };
      });
    });

    const summaryData = [
      { 'Sammanfattning': 'Total försäljning', 'Värde': `${formatPrice(filteredSummary.totalRevenue)} kr` },
      { 'Sammanfattning': 'Antal transaktioner', 'Värde': filteredSummary.totalOrders },
      { 'Sammanfattning': 'Genomsnittligt ordervärde', 'Värde': `${formatPrice(filteredSummary.averageOrderValue)} kr` },
      { 'Sammanfattning': 'Lyckade transaktioner', 'Värde': filteredSummary.successfulOrders },
      { 'Sammanfattning': 'Väntande transaktioner', 'Värde': filteredSummary.pendingOrders },
      { 'Sammanfattning': 'Misslyckade transaktioner', 'Värde': filteredSummary.failedOrders },
      { 'Sammanfattning': 'Återbetalat totalt', 'Värde': `${formatPrice(filteredSummary.refundedAmount)} kr` },
      { 'Sammanfattning': 'Abandoned carts försäljning', 'Värde': `${formatPrice(filteredSummary.abandonedCartRevenue)} kr` },
      { 'Sammanfattning': 'Abandoned carts ordrar', 'Värde': filteredSummary.abandonedCartOrders },
      '',
      { 'Sammanfattning': 'Stripe-transaktioner', 'Värde': filteredSummary.providerBreakdown.stripe.count },
      { 'Sammanfattning': 'Stripe-intäkter', 'Värde': `${formatPrice(filteredSummary.providerBreakdown.stripe.revenue)} kr` },
      { 'Sammanfattning': 'Svea-transaktioner', 'Värde': filteredSummary.providerBreakdown.svea.count },
      { 'Sammanfattning': 'Svea-intäkter', 'Värde': `${formatPrice(filteredSummary.providerBreakdown.svea.revenue)} kr` },
      { 'Sammanfattning': 'Manuella ordrar', 'Värde': filteredSummary.providerBreakdown.manual.count },
      { 'Sammanfattning': 'Manuella intäkter', 'Värde': `${formatPrice(filteredSummary.providerBreakdown.manual.revenue)} kr` }
    ];

    const wb = XLSX.utils.book_new();
    
    const wsTransactions = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaktioner');

    const wsLineItems = XLSX.utils.json_to_sheet(lineItemsData);
    XLSX.utils.book_append_sheet(wb, wsLineItems, 'Orderrader');
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Sammanfattning');

    const date = new Date().toISOString().split('T')[0];
    const tabLabel = activeTab === 'all' ? 'alla' : activeTab;
    const filename = `forsaljning_${tabLabel}_${date}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'svea':
        return <Building2 className="w-5 h-5 text-green-600" />;
      case 'manual':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-gray-600" />;
    }
  };

  const getProviderText = (provider: string) => {
    const providerMap: { [key: string]: string } = {
      'stripe': 'Stripe',
      'svea': 'Svea Ekonomi',
      'manual': 'Manuell'
    };
    return providerMap[provider] || provider;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'RECOVERED':
        return <RotateCcw className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'COMPLETED': 'Slutförd',
      'RECOVERED': 'Återhämtad',
      'PENDING': 'Väntar',
      'CANCELLED': 'Avbruten',
      'FAILED': 'Misslyckad',
      'REFUNDED': 'Återbetalad'
    };
    return statusMap[status] || status;
  };

  const getAttributionLabel = (attr: Attribution | undefined): { label: string; color: string; detail?: string } => {
    if (!attr) return { label: 'Direkt', color: 'gray' };

    // Check for Google Ads click identifiers
    if (attr.gclid || attr.gbraid || attr.wbraid) {
      const campaign = attr.utm_campaign ? `(${attr.utm_campaign})` : '';
      return { label: 'Google Ads', color: 'blue', detail: campaign };
    }

    // Check for Facebook click identifier
    if (attr.fbclid) {
      const campaign = attr.utm_campaign ? `(${attr.utm_campaign})` : '';
      return { label: 'Facebook Ads', color: 'purple', detail: campaign };
    }

    // Check for Mailchimp campaign
    if (attr.mc_cid) {
      return { label: 'Mailchimp', color: 'yellow', detail: attr.mc_cid };
    }

    // Check UTM source
    if (attr.utm_source) {
      const source = attr.utm_source.toLowerCase();
      const campaign = attr.utm_campaign ? `(${attr.utm_campaign})` : '';
      
      if (source === 'google') return { label: 'Google', color: 'green', detail: campaign };
      if (source === 'facebook' || source === 'fb') return { label: 'Facebook', color: 'purple', detail: campaign };
      if (source === 'instagram' || source === 'ig') return { label: 'Instagram', color: 'pink', detail: campaign };
      if (source === 'email' || source === 'newsletter') return { label: 'Email', color: 'teal', detail: campaign };
      
      return { label: attr.utm_source, color: 'indigo', detail: campaign };
    }

    return { label: 'Direkt', color: 'gray' };
  };

  const getOrderSourceLabel = (order: UnifiedOrder): { label: string; color: string; detail?: string } => {
    const sourceAttribution = order.metadata?.attribution as Attribution | undefined;

  if (order.metadata?.campaignId === 'sommar-ebocker-2026') {
      const sourceMap: Record<string, string> = {
        'campaign-link': 'Kampanjlänk',
        'cart-upsell': 'Cart upsell',
        'checkout-upsell': 'Checkout upsell',
        'product-page': 'Produktsida',
        'prova-popup': 'Popup',
      };

      return {
        label: 'Sommarkampanj e-böcker',
        color: 'green',
        detail: sourceMap[order.metadata?.campaignSource] || order.metadata?.campaignSource || '',
      };
    }

    if (isRecoveredCartOrder(order)) {
      return {
        label: 'Mailchimp',
        color: 'yellow',
        detail: sourceAttribution?.mc_cid || 'Abandoned cart',
      };
    }

    return getAttributionLabel(sourceAttribution);
  };

  const resetFilters = () => {
    setFilters({
      provider: 'all',
      status: 'all',
      dateRange: 'all',
      dateFrom: '',
      dateTo: '',
      course: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: '',
      customer: '',
      coupon: '',
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
          onClick={fetchOrders}
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
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Försäljning & Kunder</h1>
          <p className="text-[var(--text-secondary)] font-light">Alla ordrar från Stripe, Svea och manuella registreringar</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span><strong>Tips:</strong> Använd flikarna för att filtrera per betalningsleverantör. Data uppdateras automatiskt var 5:e minut.</span>
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
            onClick={fetchOrders}
            className="admin-btn admin-btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Uppdatera
          </button>
        </div>
      </div>

      {/* Summary Stats */}
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
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPrice(filteredSummary.totalRevenue)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredSummary.totalOrders} ordrar (enligt filter)
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
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPrice(filteredSummary.averageOrderValue)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per order
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Stripe</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {filteredSummary.providerBreakdown.stripe.count}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPrice(filteredSummary.providerBreakdown.stripe.revenue)} kr
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Svea</span>
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {filteredSummary.providerBreakdown.svea.count}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPrice(filteredSummary.providerBreakdown.svea.revenue)} kr
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Abandoned carts</span>
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPrice(filteredSummary.abandonedCartRevenue)} kr
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredSummary.abandonedCartOrders} återhämtade köp
          </p>
        </motion.div>
      </div>

      {/* Advanced Filters - Minimalist Design */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                  <h3 className="text-base font-medium text-gray-800">Filter</h3>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Återställ
                </button>
              </div>

              {/* Quick Date Filters as Pills */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2 block">Tidsperiod</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dateRangePresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        dateRange: key,
                        ...(key !== 'custom' ? { dateFrom: '', dateTo: '' } : {})
                      }))}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                        filters.dateRange === key
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Exact date range (from/to) */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Från</span>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: 'custom', dateFrom: e.target.value }))}
                      className="w-full bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Till</span>
                    <input
                      type="date"
                      value={filters.dateTo}
                      min={filters.dateFrom || undefined}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: 'custom', dateTo: e.target.value }))}
                      className="w-full bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {/* Provider */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Leverantör</span>
                  <div className="relative">
                    <select
                      value={filters.provider}
                      onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full appearance-none bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white cursor-pointer transition-all"
                    >
                      <option value="all">Alla</option>
                      <option value="stripe">Stripe</option>
                      <option value="svea">Svea</option>
                      <option value="manual">Manuell</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Status</span>
                  <div className="relative">
<select
                                      value={filters.status}
                                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                      className="w-full appearance-none bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white cursor-pointer transition-all"
                                    >
                                      <option value="all">Alla</option>
                                      <option value="COMPLETED">Slutförd</option>
                                      <option value="RECOVERED">Återhämtad</option>
                                      <option value="PENDING">Väntar</option>
                                      <option value="CANCELLED">Avbruten</option>
                                      <option value="FAILED">Misslyckad</option>
                                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Course */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Kurs</span>
                  <div className="relative">
                    <select
                      value={filters.course}
                      onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full appearance-none bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white cursor-pointer transition-all"
                    >
                      <option value="all">Alla kurser</option>
                      <option value="Functional Basics">Basics</option>
                      <option value="Functional Flow">Flow</option>
                      <option value="Functional Energy">Energy</option>
                      <option value="Hormonell Balans">Hormon</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Sortera</span>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="w-full appearance-none bg-gray-50/80 border-0 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white cursor-pointer transition-all"
                      >
                        <option value="created">Datum</option>
                        <option value="amount">Belopp</option>
                        <option value="customer">Kund</option>
                        <option value="status">Status</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className={`p-2 rounded-lg transition-all ${
                        filters.sortOrder === 'desc' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-gray-50/80 text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="text"
                      value={filters.customer}
                      onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="Sök på namn, e-post eller ordernummer..."
                      className="w-full bg-gray-50/50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="text"
                      value={filters.coupon}
                      onChange={(e) => setFilters(prev => ({ ...prev, coupon: e.target.value }))}
                      placeholder="Sök på rabattkod..."
                      className="w-full bg-gray-50/50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{filteredOrders.length}</span>
                  <span>av</span>
                  <span>{orders.length}</span>
                  <span>ordrar</span>
                </div>
                
                {/* Active filter badges */}
                <div className="flex items-center gap-2">
                  {filters.provider !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">
                      {getProviderText(filters.provider)}
                      <button onClick={() => setFilters(prev => ({ ...prev, provider: 'all' }))} className="hover:text-blue-800">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-md">
                      {getStatusText(filters.status)}
                      <button onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))} className="hover:text-amber-800">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.course !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-md">
                      {filters.course}
                      <button onClick={() => setFilters(prev => ({ ...prev, course: 'all' }))} className="hover:text-purple-800">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.customer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                      "{filters.customer}"
                      <button onClick={() => setFilters(prev => ({ ...prev, customer: '' }))} className="hover:text-gray-800">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.coupon && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md">
                      Rabattkod: {filters.coupon}
                      <button onClick={() => setFilters(prev => ({ ...prev, coupon: '' }))} className="hover:text-emerald-900">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Alla ({orders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stripe'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Stripe ({filteredSummary.providerBreakdown.stripe.count})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('svea')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'svea'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Svea ({filteredSummary.providerBreakdown.svea.count})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manual'
                ? 'border-[#014421] text-[#014421]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Manuella ({filteredSummary.providerBreakdown.manual.count})
            </div>
          </button>
        </nav>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Månadsvis försäljning</h3>
          <div className="space-y-3">
            {filteredSummary.monthlyRevenue.map((month, idx) => {
              const maxRevenue = Math.max(...filteredSummary.monthlyRevenue.map(m => m.amount));
              const percentage = maxRevenue > 0 ? (month.amount / maxRevenue) * 100 : 0;
              
              return (
                <div key={month.date} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {new Date(month.date + '-01').toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      {formatPrice(month.amount)} kr
                    </span>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: idx * 0.02, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Försäljning per kurs</h3>
          <div className="space-y-4">
            {Object.entries(filteredSummary.courseBreakdown)
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .map(([course, data], idx) => {
                const totalRevenue = Object.values(filteredSummary.courseBreakdown).reduce((sum, c) => sum + c.revenue, 0);
                const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
                const colors = [
                  { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-700' },
                  { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-700' },
                  { gradient: 'from-orange-500 to-orange-600', text: 'text-orange-700' },
                  { gradient: 'from-pink-500 to-pink-600', text: 'text-pink-700' }
                ];
                const colorSet = colors[idx % colors.length];
                
                return (
                  <div key={course} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{course}</span>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${colorSet.text}`}>{formatPrice(data.revenue)} kr</p>
                        <p className="text-xs text-gray-500">{data.count} sålda</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: idx * 0.1, duration: 0.6 }}
                          className={`h-full bg-gradient-to-r ${colorSet.gradient} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* Orders Table */}
      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Leverantör</th>
                <th className="text-left">Status</th>
                <th className="text-left">Order</th>
                <th className="text-left">Kund</th>
                <th className="text-left">Källa</th>
                <th className="text-left">Rabattkod</th>
                <th className="text-left">Produkter</th>
                <th className="text-left">Belopp</th>
                <th className="text-left">Datum</th>
                <th className="text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    Inga transaktioner hittades med valda filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(order.paymentProvider)}
                        <span className="text-sm text-gray-900">
                          {getProviderText(order.paymentProvider)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm text-gray-900">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        {order.status === 'RECOVERED' && order.metadata?.recoveredByOrderId && (
                          <p className="mt-1 text-xs text-gray-500">
                            Blev {order.metadata.recoveredByOrderId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                    </td>
                    <td className="whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      {(() => {
                        const attribution = order.metadata?.attribution as Attribution | undefined;
                        const attrInfo = getAttributionLabel(attribution);
                        const colorMap: Record<string, string> = {
                          blue: 'bg-blue-100 text-blue-800',
                          purple: 'bg-purple-100 text-purple-800',
                          yellow: 'bg-yellow-100 text-yellow-800',
                          green: 'bg-green-100 text-green-800',
                          pink: 'bg-pink-100 text-pink-800',
                          teal: 'bg-teal-100 text-teal-800',
                          indigo: 'bg-indigo-100 text-indigo-800',
                          gray: 'bg-gray-100 text-gray-600'
                        };
                        return (
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[attrInfo.color] || colorMap.gray}`}>
                              {attrInfo.label}
                            </span>
                            {attrInfo.detail && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[120px]" title={attrInfo.detail}>
                                {attrInfo.detail}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap">
                      {(() => {
                        const couponCode = order.metadata?.couponCode;
                        const discountAmount = order.metadata?.discountAmount;
                        if (!couponCode) {
                          return <span className="text-xs text-gray-400">-</span>;
                        }
                        return (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-medium">
                              {couponCode}
                            </span>
                            {discountAmount && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                -{discountAmount} kr
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-gray-900">
                          {order.items.length > 0 ? 
                            order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') :
                            order.courses.join(', ')
                          }
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.amount)} {order.currency}
                      </p>
                      {order.refunded && (
                        <p className="text-xs text-red-600">
                          Återbetalad: {formatPrice(order.refundAmount || 0)} {order.currency}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {order.paymentProvider === 'svea' && order.status === 'PENDING' && (
                          <button
                            onClick={() => manualCompleteOrder(order.id)}
                            disabled={manualProcessing === order.id}
                            className="text-xs px-3 py-1 rounded bg-[var(--primary-green)] text-white hover:opacity-90 disabled:opacity-50"
                          >
                            {manualProcessing === order.id ? 'Bearbetar...' : 'Godkänn'}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-[#014421] hover:text-[#012A14]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
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
                  <h2 className="text-xl font-bold text-gray-900">Orderdetaljer</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Status</h3>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="text-lg font-medium text-gray-900">
                      {getStatusText(selectedOrder.status)}
                    </span>
                    {selectedOrder.refunded && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Återbetalad
                      </span>
                    )}
                  </div>
                  {selectedOrder.paymentProvider === 'svea' && selectedOrder.status === 'PENDING' && (
                    <div className="mt-3">
                      <button
                        onClick={() => manualCompleteOrder(selectedOrder.id)}
                        disabled={manualProcessing === selectedOrder.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {manualProcessing === selectedOrder.id ? 'Bearbetar...' : 'Godkänn manuellt'}
                      </button>
                    </div>
                  )}
                  {selectedOrder.status === 'RECOVERED' && selectedOrder.metadata?.recoveredByOrderId && (
                    <p className="mt-3 text-sm text-gray-600">
                      Denna checkout återhämtades och slutfördes som #{selectedOrder.metadata.recoveredByOrderId}.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Kundinformation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedOrder.customerName}</span>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedOrder.customerCountry || 'SE'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Betalningsdetaljer</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Belopp</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(selectedOrder.amount)} {selectedOrder.currency}
                      </span>
                    </div>
                    {selectedOrder.refundAmount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Återbetalat</span>
                        <span className="text-sm font-medium text-red-600">
                          -{formatPrice(selectedOrder.refundAmount)} {selectedOrder.currency}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Netto</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(selectedOrder.amount - (selectedOrder.refundAmount || 0))} {selectedOrder.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Orderdetaljer</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 mb-2">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600">
                              Antal: {item.quantity} • Pris: {formatPrice(item.price)} kr • Typ: {item.type}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 font-mono">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString('sv-SE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getProviderIcon(selectedOrder.paymentProvider)}
                      <span className="text-sm text-gray-900">
                        {getProviderText(selectedOrder.paymentProvider)}
                      </span>
                    </div>
                  </div>
                </div>

                {(selectedOrder.metadata?.recoveredFromOrderId ||
                  selectedOrder.metadata?.recoveredByOrderId ||
                  selectedOrder.metadata?.mailchimpCartSyncedAt ||
                  selectedOrder.metadata?.mailchimpCartDeletedAt ||
                  selectedOrder.metadata?.mailchimpEcommerceTrackedAt) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tracking & återhämtning</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {selectedOrder.metadata?.recoveredFromOrderId && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Återhämtad från</span>
                          <span className="text-sm font-mono text-gray-900 text-right">
                            {selectedOrder.metadata.recoveredFromOrderId}
                          </span>
                        </div>
                      )}
                      {selectedOrder.metadata?.recoveredByOrderId && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Slutförd som</span>
                          <span className="text-sm font-mono text-gray-900 text-right">
                            {selectedOrder.metadata.recoveredByOrderId}
                          </span>
                        </div>
                      )}
                      {selectedOrder.metadata?.recoveredAt && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Återhämtad</span>
                          <span className="text-sm text-gray-900 text-right">
                            {new Date(selectedOrder.metadata.recoveredAt).toLocaleString('sv-SE')}
                          </span>
                        </div>
                      )}
                      {selectedOrder.metadata?.mailchimpCartSyncedAt && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Mailchimp cart synkad</span>
                          <span className="text-sm text-gray-900 text-right">
                            {new Date(selectedOrder.metadata.mailchimpCartSyncedAt).toLocaleString('sv-SE')}
                          </span>
                        </div>
                      )}
                      {selectedOrder.metadata?.mailchimpCartDeletedAt && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Mailchimp cart borttagen</span>
                          <span className="text-sm text-gray-900 text-right">
                            {new Date(selectedOrder.metadata.mailchimpCartDeletedAt).toLocaleString('sv-SE')}
                          </span>
                        </div>
                      )}
                      {selectedOrder.metadata?.mailchimpEcommerceTrackedAt && (
                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-gray-600">Mailchimp köp trackat</span>
                          <span className="text-sm text-gray-900 text-right">
                            {new Date(selectedOrder.metadata.mailchimpEcommerceTrackedAt).toLocaleString('sv-SE')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.receiptUrl && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <a
                      href={selectedOrder.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Visa kvitto
                    </a>
                  </div>
                )}

                {/* Refund button for SVEA orders */}
                {selectedOrder.paymentProvider === 'svea' && 
                 selectedOrder.status === 'COMPLETED' && 
                 !selectedOrder.refunded && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        if (!confirm(`Är du säker på att du vill återbetala ${formatPrice(selectedOrder.amount)} ${selectedOrder.currency} för denna order?`)) {
                          return;
                        }

                        try {
                          const response = await fetch('/api/admin/svea-refunds', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              orderId: selectedOrder.id,
                              reason: 'requested_by_customer'
                            })
                          });

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to process refund');
                          }

                          alert(data.message || 'Återbetalning har registrerats');
                          setSelectedOrder(null);
                          fetchOrders(); // Refresh orders
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Ett fel uppstod vid återbetalning');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Återbetala order
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Observera: Återbetalningen måste också genomföras i SVEA:s admin-panel
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
