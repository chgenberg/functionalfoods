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
      case 'COMPLETED': return 'bg-background-secondary text-secondary';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-primary';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar beställningar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Beställningar</h1>
          <p className="mt-2 text-gray-600">Hantera alla beställningar och betalningar</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beställning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Belopp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betalning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user.name || 'Ingen namn'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.map((item, index) => (
                          <div key={item.id} className={index > 0 ? 'mt-1' : ''}>
                            {item.name} ({item.quantity}x)
                          </div>
                        ))}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {order.totalAmount.toFixed(2)} {order.currency}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.payment ? (
                        <div>
                          <div className={`text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                            {order.payment.status}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {order.payment.paymentMethod}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Ingen betalning</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary hover:text-primary-dark flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Visa
                      </button>
                    </td>
                  </tr>
                ))}
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
      </div>

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