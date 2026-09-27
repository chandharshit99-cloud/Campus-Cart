import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Clock, MapPin, FileText, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STATUS_CONFIG = {
  pending:   { color: 'bg-amber-100 text-amber-800 border-amber-200',   icon: '⏳', label: 'Pending'   },
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200',     icon: '✅', label: 'Confirmed' },
  preparing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👨‍🍳', label: 'Preparing' },
  ready:     { color: 'bg-green-100 text-green-800 border-green-200',   icon: '🎉', label: 'Ready'     },
  delivered: { color: 'bg-gray-100 text-gray-700 border-gray-200',     icon: '📦', label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200',         icon: '❌', label: 'Cancelled' },
};

const PAYMENT_CONFIG = {
  completed: { color: 'bg-green-100 text-green-700 border-green-200', label: '✓ PAID' },
  failed:    { color: 'bg-red-100 text-red-700 border-red-200',       label: '✗ FAILED' },
  pending:   { color: 'bg-amber-100 text-amber-700 border-amber-200', label: '⏳ PENDING' },
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default function MyOrders() {
  const { setCurrentView, apiCall, setLoading, showNotification } = useApp();
  const [orders,       setOrders]       = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await apiCall('/orders/my-orders');
      setOrders(data.orders || []);
    } catch {
      showNotification('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const confirmCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiCall(`/orders/${cancelTarget.order_id}/cancel`, { method: 'PATCH' });
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === cancelTarget.order_id ? { ...o, order_status: 'cancelled' } : o
        )
      );
      showNotification(`Order #${cancelTarget.order_id} cancelled`, 'success');
      setCancelTarget(null);
    } catch (err) {
      showNotification(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header row */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('outlets')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ChevronRight size={18} className="rotate-180" />
            Home
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        </div>
        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package size={72} className="mx-auto text-gray-200 mb-5" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 mb-7 text-sm">Your order history will appear here</p>
          <button
            onClick={() => setCurrentView('outlets')}
            className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:from-red-700 hover:to-orange-600 transition-all shadow-lg shadow-red-100 text-sm"
          >
            Browse Stores 🍽️
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = STATUS_CONFIG[order.order_status]  || STATUS_CONFIG.pending;
            const pt = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending;
            return (
              <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Status top bar */}
                <div className={`h-1 w-full ${
                  order.order_status === 'delivered' ? 'bg-gray-300' :
                  order.order_status === 'cancelled' ? 'bg-red-400' :
                  order.order_status === 'ready'     ? 'bg-green-400' :
                  'bg-gradient-to-r from-red-500 to-orange-400'
                }`} />

                <div className="p-5">
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <FileText size={15} className="text-gray-400" />
                        <span className="font-extrabold text-gray-900 text-base">Order #{order.order_id}</span>
                      </div>
                      <p className="text-sm text-gray-500">{order.restaurant_name}</p>
                    </div>
                    <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${st.color}`}>
                      <span>{st.icon}</span>
                      {st.label}
                    </span>
                  </div>

                  {/* Order details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Clock size={15} className="text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Order Date</p>
                        <p className="font-semibold">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Package size={15} className="text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                        <p className="font-extrabold text-red-600 text-base">₹{order.total_amount}</p>
                      </div>
                    </div>
                    {order.delivery_location && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <MapPin size={15} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Delivery To</p>
                          <p className="font-semibold">{order.delivery_location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Special instructions */}
                  {order.special_instructions && (
                    <div className="mb-4 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100 text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">Note: </span>
                      {order.special_instructions}
                    </div>
                  )}

                  {/* Footer: payment + cancel */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${pt.color}`}>
                      {pt.label}
                    </span>

                    {order.order_status === 'pending' && (
                      <button
                        onClick={() => setCancelTarget(order)}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold hover:underline transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[60]"
            onClick={() => !cancelling && setCancelTarget(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl z-[70] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cancel this order?</h3>
              </div>
              <button
                onClick={() => !cancelling && setCancelTarget(null)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Order <span className="font-bold">#{cancelTarget.order_id}</span> from{' '}
              <span className="font-bold">{cancelTarget.restaurant_name}</span> will be cancelled.
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}