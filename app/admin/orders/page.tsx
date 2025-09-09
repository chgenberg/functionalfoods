"use client";
import { useState, useEffect } from 'react';
import { Package, Check, X, Clock, DollarSign, User, Calendar, Eye } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  course?: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  user: {
    name?: string;
    email: string;
  };
  items: OrderItem[];
  payment?: {
    id: string;
    status: string;
    paymentMethod: string;
    externalId?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-[#93C560]/20 text-[#014421]';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-[#93C560]';
      case 'PENDING': return 'text-yellow-600';
      case 'PROCESSING': return 'text-blue-600';
      case 'FAILED': return 'text-red-600';
      case 'CANCELLED': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'ALL' || order.status === statusFilter
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar beställningar...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#014421] flex items-center gap-3">
          <span className="text-3xl">🛒</span> Beställningar
        </h1>
        <p className="mt-2 text-gray-600">Hantera alla beställningar och betalningar</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F3EFE3] p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
          >
            <option value="ALL">Alla</option>
            <option value="PENDING">Väntande</option>
            <option value="PROCESSING">Behandlas</option>
            <option value="COMPLETED">Slutförd</option>
            <option value="CANCELLED">Avbruten</option>
            <option value="REFUNDED">Återbetald</option>
          </select>
          
          <div className="ml-auto text-sm text-gray-600">
            {filteredOrders.length} beställningar
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F3EFE3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F3EFE3]">
            <thead className="bg-[#F7F1E8]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Beställning
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Kund
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Produkter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Belopp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Betalning
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE3]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <span className="text-5xl mb-4 block">📦</span>
                    Inga beställningar hittades
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F1E8]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-[#014421]">#{order.orderNumber}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <span>📅</span> {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{order.user.name || 'Okänd'}</p>
                        <p className="text-gray-500">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.map((item) => (
                          <div key={item.id} className="mb-1">
                            {item.type === 'COURSE' ? (
                              <span className="flex items-center gap-1">
                                <span>📚</span> {item.course?.name || item.name}
                              </span>
                            ) : (
                              <span>{item.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#014421]">
                        {order.totalAmount.toLocaleString('sv-SE', { 
                          style: 'currency', 
                          currency: order.currency 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status === 'COMPLETED' && '✅'}
                        {order.status === 'PENDING' && '⏰'}
                        {order.status === 'PROCESSING' && '⚡'}
                        {order.status === 'CANCELLED' && '❌'}
                        {order.status === 'REFUNDED' && '💸'}
                        <span className="ml-1">
                          {order.status === 'COMPLETED' && 'Slutförd'}
                          {order.status === 'PENDING' && 'Väntande'}
                          {order.status === 'PROCESSING' && 'Behandlas'}
                          {order.status === 'CANCELLED' && 'Avbruten'}
                          {order.status === 'REFUNDED' && 'Återbetald'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.payment && (
                        <div className="text-sm">
                          <p className={`font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                            {order.payment.status === 'COMPLETED' && '✅ Betald'}
                            {order.payment.status === 'PENDING' && '⏰ Väntar'}
                            {order.payment.status === 'PROCESSING' && '⚡ Behandlas'}
                            {order.payment.status === 'FAILED' && '❌ Misslyckad'}
                            {order.payment.status === 'CANCELLED' && '🚫 Avbruten'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.payment.paymentMethod}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#93C560] hover:text-[#84b351] font-medium transition-colors"
                      >
                        Visa detaljer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga beställningar</h3>
          <p className="text-gray-500">
            {statusFilter === 'ALL' 
              ? 'Inga beställningar ännu.' 
              : `Inga beställningar med status "${statusFilter}".`
            }
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Beställning {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Kund</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedOrder.user.name || 'Ingen namn'}</p>
                    <p className="text-gray-600">{selectedOrder.user.email}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Produkter</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(item.price * item.quantity).toFixed(2)} SEK</p>
                          <p className="text-sm text-gray-600">{item.quantity}x {item.price.toFixed(2)} SEK</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Totalt</span>
                        <span>{selectedOrder.totalAmount.toFixed(2)} {selectedOrder.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.payment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Betalning</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-medium ${getPaymentStatusColor(selectedOrder.payment.status)}`}>
                            {selectedOrder.payment.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Metod</p>
                          <p className="font-medium capitalize">{selectedOrder.payment.paymentMethod}</p>
                        </div>
                        {selectedOrder.payment.externalId && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Transaktions-ID</p>
                            <p className="font-mono text-sm">{selectedOrder.payment.externalId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Date */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Datum</h3>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString('sv-SE')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 