"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Download, Eye, RefreshCw, RotateCcw, TrendingDown, TrendingUp, XCircle } from "lucide-react";;

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
}

export default function AdminSalesPage() {
  const [payments, setPayments] = useState<StripePayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    refundedAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<StripePayment | null>(null);

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/stripe-payments?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setSummary(data.summary);
      } else {
        console.error('Failed to load payments:', response.status);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': 
      case 'requires_action': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'canceled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'processing': 
      case 'requires_action': return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'SEK') => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar Stripe-betalningar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Försäljning & Betalningar</h1>
            <p className="mt-2 text-gray-600">Live-data från Stripe betalningssystem</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Uppdaterar...' : 'Uppdatera'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total försäljning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lyckade betalningar</p>
                <p className="text-2xl font-bold text-gray-900">{summary.successful}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Väntande</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Återbetalat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.refundedAmount)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Betalningsstatus:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#014421] focus:border-[#014421]"
            >
              <option value="all">Alla</option>
              <option value="succeeded">Lyckade</option>
              <option value="processing">Behandlas</option>
              <option value="requires_action">Kräver åtgärd</option>
              <option value="failed">Misslyckade</option>
              <option value="canceled">Avbrutna</option>
            </select>
            
            <div className="ml-auto text-sm text-gray-600">
              {payments.length} betalningar visas
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betalning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Belopp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betalmetod
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.id.substring(0, 20)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description || 'Kursköp'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customer.email}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.refunded && payment.refundAmount > 0 && (
                        <div className="text-sm text-red-600">
                          -{formatCurrency(payment.refundAmount, payment.currency)} återbetalt
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {payment.paymentMethod?.type || 'Okänd'}
                        {payment.paymentMethod?.card && (
                          <div className="text-xs text-gray-500">
                            {payment.paymentMethod.card.brand?.toUpperCase() || ''} •••• {payment.paymentMethod.card.last4}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.created).toLocaleDateString('sv-SE')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.created).toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-[#014421] hover:text-[#116530] flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Visa
                        </button>
                        
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Kvitto
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga betalningar</h3>
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'Inga betalningar hittades.' 
                : `Inga betalningar med status "${statusFilter}".`
              }
            </p>
          </div>
        )}

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    <CreditCard className="w-5 h-5 inline" /> Betalningsdetaljer
                  </h2>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Payment Status */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedPayment.status)}
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Kund</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{selectedPayment.customer.name}</p>
                      <p className="text-gray-600">{selectedPayment.customer.email}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Betalningsinfo</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Belopp:</span>
                        <span className="font-semibold">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Betalmetod:</span>
                        <span className="font-medium capitalize">{selectedPayment.paymentMethod?.type || 'Okänd'}</span>
                      </div>
                      
                      {selectedPayment.paymentMethod?.card && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kort:</span>
                          <span className="font-mono">
                            {selectedPayment.paymentMethod.card.brand?.toUpperCase() || ''} •••• {selectedPayment.paymentMethod.card.last4}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stripe ID:</span>
                        <span className="font-mono text-sm">{selectedPayment.id}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Datum:</span>
                        <span>{new Date(selectedPayment.created).toLocaleString('sv-SE')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Error Info */}
                  {(selectedPayment.failureCode || selectedPayment.failureMessage) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Fel-information</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        {selectedPayment.failureCode && (
                          <p className="text-red-800 font-medium">Kod: {selectedPayment.failureCode}</p>
                        )}
                        {selectedPayment.failureMessage && (
                          <p className="text-red-700 text-sm mt-1">{selectedPayment.failureMessage}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedPayment.receiptUrl && (
                      <a
                        href={selectedPayment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        📄 Visa kvitto
                      </a>
                    )}
                    
                    {selectedPayment.status === 'succeeded' && !selectedPayment.refunded && (
                      <button
                        onClick={() => {
                          // TODO: Implement refund functionality
                          alert('Återbetalning kommer snart! Kontakta Stripe direkt för nu.');
                        }}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        💸 Återbetala
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 