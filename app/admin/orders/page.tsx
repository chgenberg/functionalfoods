'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, Package, User, Calendar, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

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
    name: string;
    email: string;
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
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'PENDING' | 'FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    });

  const stats = {
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

          {/* Status filter */}
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
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
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
