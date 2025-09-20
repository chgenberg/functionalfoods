'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Calendar, Eye, Edit3, User, Package, CreditCard, ChevronDown } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderFilters {
  status: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  search: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      params.append('export', 'excel');

      const response = await fetch(`/api/admin/orders/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Fel vid export av beställningar');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Fel vid export av beställningar');
    } finally {
      setExporting(false);
    }
  };

  const mergeUserCourses = async (userEmail: string) => {
    try {
      const response = await fetch('/api/admin/users/merge-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (response.ok) {
        alert('Kurser sammanslagda framgångsrikt!');
        fetchOrders(); // Refresh
      } else {
        alert('Fel vid sammanslagning av kurser');
      }
    } catch (error) {
      console.error('Error merging courses:', error);
      alert('Tekniskt fel vid sammanslagning');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'admin-badge-success';
      case 'pending': return 'admin-badge-warning';
      case 'failed': return 'admin-badge-error';
      case 'refunded': return 'admin-badge-info';
      default: return 'admin-badge-info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Slutförd';
      case 'pending': return 'Väntande';
      case 'failed': return 'Misslyckad';
      case 'refunded': return 'Återbetald';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar beställningar...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Beställningar</h1>
          <p className="text-[var(--text-secondary)]">Hantera och exportera beställningar</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="admin-btn admin-btn-secondary"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="admin-btn admin-btn-primary"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporterar...' : 'Exportera Excel'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{orders.length}</div>
          <div className="admin-stat-label">Totalt</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{orders.filter(o => o.status === 'completed').length}</div>
          <div className="admin-stat-label">Slutförda</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{orders.filter(o => o.status === 'pending').length}</div>
          <div className="admin-stat-label">Väntande</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('sv-SE')} kr
          </div>
          <div className="admin-stat-label">Total summa</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length) : 0} kr
          </div>
          <div className="admin-stat-label">Snitt/order</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="admin-card"
        >
          <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Filter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="admin-label">Sök</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="admin-input"
                placeholder="E-post, namn, ordernummer..."
              />
            </div>

            <div>
              <label className="admin-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="admin-select"
              >
                <option value="all">Alla statusar</option>
                <option value="completed">Slutförd</option>
                <option value="pending">Väntande</option>
                <option value="failed">Misslyckad</option>
                <option value="refunded">Återbetald</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Betalmetod</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="admin-select"
              >
                <option value="all">Alla metoder</option>
                <option value="stripe">Stripe (Kort)</option>
                <option value="swish">Swish</option>
                <option value="invoice">Faktura</option>
              </select>
            </div>

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

            <div>
              <label className="admin-label">Min belopp (kr)</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="admin-input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="admin-label">Max belopp (kr)</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="admin-input"
                placeholder="10000"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: 'all',
                  paymentMethod: 'all',
                  dateFrom: '',
                  dateTo: '',
                  minAmount: '',
                  maxAmount: '',
                  search: ''
                })}
                className="admin-btn admin-btn-secondary w-full"
              >
                Rensa filter
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders Table */}
      {orders.length > 0 ? (
        <div className="admin-table">
          <table className="w-full">
            <thead>
              <tr>
                <th>Beställning</th>
                <th>Kund</th>
                <th>Produkter</th>
                <th>Belopp</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        #{order.orderNumber || order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </td>
                  
                  <td>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {order.user.name || 'Gäst'}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {order.user.email}
                      </p>
                    </div>
                  </td>
                  
                  <td>
                    <div>
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-[var(--text-primary)]">
                            {item.product.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[var(--text-secondary)]"> x{item.quantity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td>
                    <p className="font-semibold text-[var(--primary-green)]">
                      {order.totalAmount.toLocaleString('sv-SE')} kr
                    </p>
                  </td>
                  
                  <td>
                    <span className={`admin-badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  
                  <td>
                    <div className="text-sm">
                      <p className="text-[var(--text-primary)]">
                        {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        {new Date(order.createdAt).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </td>
                  
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                        className="admin-btn admin-btn-secondary text-xs"
                        title="Visa detaljer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={() => mergeUserCourses(order.user.email)}
                        className="admin-btn admin-btn-primary text-xs"
                        title="Slå ihop kurser"
                      >
                        <User className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card text-center py-12">
          <Package className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {filters.search || filters.status !== 'all' || filters.paymentMethod !== 'all' 
              ? 'Inga beställningar matchar filtren' 
              : 'Inga beställningar ännu'
            }
          </h3>
          <p className="text-[var(--text-secondary)]">
            {filters.search || filters.status !== 'all' || filters.paymentMethod !== 'all'
              ? 'Prova att ändra filtren för att se fler beställningar'
              : 'Beställningar kommer att visas här när kunder gör köp'
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Snabbåtgärder</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[var(--text-primary)]">Väntande beställningar</span>
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
            }))}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[var(--text-primary)]">Senaste veckan</span>
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, paymentMethod: 'stripe' }))}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <CreditCard className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-[var(--text-primary)]">Kortbetalningar</span>
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <Download className="w-5 h-5 text-green-500" />
            <span className="text-sm text-[var(--text-primary)]">
              {exporting ? 'Exporterar...' : 'Exportera alla'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
