import React, { useState, useEffect } from 'react';
import { Package, Store, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import VendorOrders from './VendorOrders';
import VendorRestaurants from './VendorRestaurants';
import VendorInventory from './VendorInventory';
import RestaurantComplaints from './RestaurantComplaints';

const TABS = [
  { id: 'orders',      label: 'Orders',     emoji: '📦', Icon: Package       },
  { id: 'restaurants', label: 'My Store',   emoji: '🏪', Icon: Store         },
  { id: 'inventory',   label: 'Inventory',  emoji: '📊', Icon: BarChart3     },
  { id: 'complaints',  label: 'Complaints', emoji: '⚠️', Icon: AlertTriangle },
];

export default function VendorDashboard() {
  const { apiCall, setLoading, showNotification, currentUser } = useApp();
  const [activeTab,    setActiveTab]    = useState('orders');
  const [orders,       setOrders]       = useState([]);
  const [restaurants,  setRestaurants]  = useState([]);
  const [inventory,    setInventory]    = useState([]);
  const [localLoading, setLocalLoading] = useState({
    orders: false, restaurants: false, inventory: false,
  });

  useEffect(() => {
    if (!currentUser || currentUser.user_type !== 'vendor') return;
    loadAll();
  }, [currentUser]);

  const loadAll = () => {
    Promise.all([loadOrders(), loadRestaurants(), loadInventory()]);
  };

  const loadOrders = async () => {
    setLocalLoading((p) => ({ ...p, orders: true }));
    try {
      const data = await apiCall('/orders/vendor/orders');
      setOrders(data.orders || []);
    } catch (err) {
      showNotification('Failed to load orders: ' + err.message, 'error');
      setOrders([]);
    } finally {
      setLocalLoading((p) => ({ ...p, orders: false }));
    }
  };

  const loadRestaurants = async () => {
    setLocalLoading((p) => ({ ...p, restaurants: true }));
    try {
      const data = await apiCall('/restaurants/vendor/my-restaurants');
      setRestaurants(data.restaurants || []);
    } catch (err) {
      showNotification('Failed to load restaurants: ' + err.message, 'error');
      setRestaurants([]);
    } finally {
      setLocalLoading((p) => ({ ...p, restaurants: false }));
    }
  };

  const loadInventory = async () => {
    setLocalLoading((p) => ({ ...p, inventory: true }));
    try {
      const data = await apiCall('/inventory/vendor');
      setInventory(data.inventory || []);
    } catch (err) {
      showNotification('Failed to load inventory: ' + err.message, 'error');
      setInventory([]);
    } finally {
      setLocalLoading((p) => ({ ...p, inventory: false }));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      await apiCall(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ order_status: status }),
      });
      showNotification('Order status updated', 'success');
      await loadOrders();
    } catch {
      showNotification('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const restockItem = async (itemId, quantity, reason) => {
    setLoading(true);
    try {
      await apiCall('/inventory/restock', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, quantity, reason: reason || 'Manual restock' }),
      });
      showNotification('Item restocked successfully', 'success');
      await loadInventory();
    } catch {
      showNotification('Failed to restock item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const counts = { orders: orders.length, restaurants: restaurants.length, inventory: inventory.length, complaints: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your store, orders, and inventory</p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={14} />
          Refresh All
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="flex border-b overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-5 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {counts[tab.id] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {activeTab === 'orders' && (
          <VendorOrders
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            loading={localLoading.orders}
            onRefresh={loadOrders}
          />
        )}
        {activeTab === 'restaurants' && (
          <VendorRestaurants
            restaurants={restaurants}
            loading={localLoading.restaurants}
            onRefresh={loadRestaurants}
          />
        )}
        {activeTab === 'inventory' && (
          <VendorInventory
            inventory={inventory}
            restaurants={restaurants}
            restockItem={restockItem}
            loading={localLoading.inventory}
            onRefresh={loadInventory}
          />
        )}
        {activeTab === 'complaints' && <RestaurantComplaints />}
      </div>
    </div>
  );
}