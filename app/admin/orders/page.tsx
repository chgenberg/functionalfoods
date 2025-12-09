'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, Package, User, Calendar, CheckCircle, XCircle, Clock, Filter, Search, RefreshCw, Download, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paymentMethod?: string;
  customerEmail?: string;
  customerName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    lastLogin?: string | null;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    type: string;
  }>;
  payment?: {
    paymentMethod: string;
    status: string;
  };
  metadata?: {
    confirmationEmailSent?: boolean;
    sveaOrderId?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'PENDING' | 'FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [manualProcessing, setManualProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (order: Order) => {
    const method = order.payment?.paymentMethod || order.paymentMethod;
    if (method?.toLowerCase().includes('svea')) return 'Svea';
    if (method?.toLowerCase().includes('stripe')) return 'Stripe';
    if (method?.toLowerCase().includes('swish')) return 'Swish';
    return method || 'N/A';
  };

  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .filter(order => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerEmail?.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.user?.email.toLowerCase().includes(search)
      );
    })
    .filter(order => {
      if (!dateFrom && !dateTo) return true;
      const orderDate = new Date(order.createdAt);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }
      return true;
    });

  // Calculate stats for filtered date range
  const filteredStats = {
    total: filteredOrders.length,
    completed: filteredOrders.filter(o => o.status === 'COMPLETED').length,
    pending: filteredOrders.filter(o => o.status === 'PENDING').length,
    failed: filteredOrders.filter(o => o.status === 'FAILED' || o.status === 'CANCELLED').length,
    revenue: filteredOrders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  };

  // Quick date presets
  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const today = new Date();
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    
    setDateTo(today.toISOString().split('T')[0]);
    
    if (preset === 'today') {
      setDateFrom(today.toISOString().split('T')[0]);
    } else if (preset === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setDateFrom(weekAgo.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setDateFrom(monthAgo.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      setDateFrom(yearAgo.toISOString().split('T')[0]);
    }
  };

  // Manual sync function for pending Svea orders
  const syncPendingOrders = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/orders/sync-svea', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        alert(`Synkade ${result.synced || 0} ordrar`);
        fetchOrders();
      } else {
        alert('Kunde inte synkronisera ordrar');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Ett fel uppstod vid synkronisering');
    } finally {
      setSyncing(false);
    }
  };

  // Manually complete Svea order and send emails
  const manualCompleteOrder = async (orderId: string) => {
    if (manualProcessing) return;
    setManualProcessing(orderId);
    try {
      const confirmed = window.confirm('Godkänn och skicka mejl? Detta markerar ordern som COMPLETED.');
      if (!confirmed) return;
      const res = await fetch('/api/admin/orders/manual-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Order uppdaterad. Status: ${data.status}. Mejl: ${data.emails?.join(', ') || 'ingen'}`);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Kunde inte uppdatera ordern');
      }
    } catch (error) {
      console.error('Manual complete failed:', error);
      alert('Ett fel uppstod vid manuell godkännande');
    } finally {
      setManualProcessing(null);
    }
  };

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = ['Ordernummer', 'Datum', 'Kund', 'E-post', 'Status', 'Belopp', 'Betalmetod', 'Produkter'];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString('sv-SE'),
      order.customerName || order.user?.name || 'N/A',
      order.customerEmail || order.user?.email || 'N/A',
      order.status,
      order.totalAmount,
      getPaymentMethodLabel(order),
      order.items.map(i => `${i.quantity}x ${i.name}`).join('; ')
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ordrar-${dateFrom || 'all'}-${dateTo || 'all'}.csv`;
    link.click();
  };

  // Use filtered stats when date filter is active
  const stats = (dateFrom || dateTo) ? filteredStats : {
    total: orders.length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    failed: orders.filter(o => o.status === 'FAILED' || o.status === 'CANCELLED').length,
    revenue: orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-green)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Ordrar</h1>
        <p className="text-[var(--text-secondary)]">Alla beställningar från Svea, Stripe och övriga betalningsmetoder</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-[var(--primary-green)]">{stats.total}</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Totalt</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Slutförda</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Väntande</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Misslyckade</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-[var(--primary-green)]">{Math.round(stats.revenue)} kr</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Intäkter</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col gap-4">
          {/* Row 1: Search and Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök efter ordernummer, email eller namn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={syncPendingOrders}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Synka Svea
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Exportera
              </button>
            </div>
          </div>

          {/* Row 2: Date filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Period:</span>
            </div>
            
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'today', label: 'Idag' },
                { id: 'week', label: '7 dagar' },
                { id: 'month', label: '30 dagar' },
                { id: 'year', label: 'År' },
                { id: 'all', label: 'Alla' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id as any)}
                  className={`px-3 py-1.5 rounded text-xs transition-all ${
                    (!dateFrom && !dateTo && preset.id === 'all') ||
                    (dateFrom && dateTo && preset.id !== 'all')
                      ? 'bg-[var(--primary-green)]/10 text-[var(--primary-green)] border border-[var(--primary-green)]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              />
            </div>
          </div>

          {/* Row 3: Status filter */}
          <div className="flex gap-2">
            {['all', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === status
                    ? 'bg-[var(--primary-green)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Alla' : status === 'COMPLETED' ? 'Slutförda' : status === 'PENDING' ? 'Väntande' : 'Misslyckade'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Warning for pending orders */}
      {stats.pending > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {stats.pending} ordrar väntar på bekräftelse
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Dessa kan vara betalda i Svea men ej synkade. Klicka på &quot;Synka Svea&quot; för att uppdatera.
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--primary-beige)] border-b-2 border-[var(--border-light)]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[var(--primary-green)]">Order</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--primary-green)]">Kund</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--primary-green)]">Produkter</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--primary-green)]">Betalning</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--primary-green)]">Status</th>
                <th className="text-right p-4 text-sm font-medium text-[var(--primary-green)]">Belopp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">
                    {searchTerm ? 'Inga ordrar matchar sökningen' : 'Inga ordrar hittades'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[var(--primary-beige)]/30 transition-colors"
                  >
                    {/* Order info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm text-[var(--text-primary)]">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {new Date(order.createdAt).toLocaleString('sv-SE')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-[var(--text-primary)]">
                            {order.customerName || order.user?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {order.customerEmail || order.user?.email || 'N/A'}
                          </div>
                          {order.user?.lastLogin && (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle className="w-3 h-3" />
                              Inloggad {new Date(order.user.lastLogin).toLocaleDateString('sv-SE')}
                            </div>
                          )}
                          {order.user && !order.user.lastLogin && (
                            <div className="text-xs text-orange-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              Aldrig inloggad
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Products */}
                    <td className="p-4">
                      <div className="text-sm">
                        {order.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-[var(--text-primary)]">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-[var(--text-secondary)] mt-1">
                            +{order.items.length - 2} till...
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Payment method */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-[var(--text-primary)]">
                          {getPaymentMethodLabel(order)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        {order.status === 'COMPLETED' && (
                          <div className={`text-xs flex items-center gap-1 ${order.metadata?.confirmationEmailSent ? 'text-green-600' : 'text-red-500'}`}>
                            {order.metadata?.confirmationEmailSent ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Mejl skickat
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Mejl ej skickat
                              </>
                            )}
                          </div>
                        )}
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => manualCompleteOrder(order.id)}
                            disabled={manualProcessing === order.id}
                            className="text-xs text-white bg-[var(--primary-green)] px-3 py-1 rounded hover:opacity-90 transition disabled:opacity-50"
                          >
                            {manualProcessing === order.id ? 'Bearbetar...' : 'Godkänn manuellt'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {Math.round(order.totalAmount)} {order.currency}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="text-sm text-[var(--text-secondary)] text-center">
          Visar {filteredOrders.length} av {orders.length} ordrar
        </div>
      )}
    </div>
  );
}
