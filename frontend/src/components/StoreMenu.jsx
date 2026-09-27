import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Minus, ShoppingCart, X, Trash2, MapPin, FileText, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Category-based emoji + gradient for menu item thumbnails
const CATEGORY_STYLE = [
  { keywords: ['bakery', 'bread', 'pastry', 'croissant', 'bake'],    emoji: '🥐', gradient: 'from-amber-400 to-orange-400' },
  { keywords: ['cake', 'dessert', 'sweet', 'mithai', 'ice cream'],   emoji: '🍰', gradient: 'from-pink-400 to-rose-400'   },
  { keywords: ['beverage', 'drink', 'juice', 'coffee', 'tea', 'chai', 'cola'], emoji: '🥤', gradient: 'from-sky-400 to-blue-400' },
  { keywords: ['snack', 'fries', 'chips', 'fry', 'pakora', 'vada'], emoji: '🍿', gradient: 'from-yellow-400 to-amber-400' },
  { keywords: ['pizza'],                                              emoji: '🍕', gradient: 'from-red-400 to-orange-400'  },
  { keywords: ['burger', 'sandwich', 'wrap'],                        emoji: '🍔', gradient: 'from-orange-400 to-red-400'  },
  { keywords: ['main', 'meal', 'thali', 'rice', 'curry', 'dal', 'sabzi'], emoji: '🍛', gradient: 'from-red-400 to-orange-500' },
  { keywords: ['breakfast', 'egg', 'paratha', 'poha', 'upma'],      emoji: '🍳', gradient: 'from-yellow-400 to-orange-400' },
  { keywords: ['dairy', 'milk', 'butter', 'cheese', 'paneer'],      emoji: '🥛', gradient: 'from-blue-300 to-sky-400'    },
  { keywords: ['fruit', 'salad'],                                    emoji: '🍎', gradient: 'from-red-400 to-pink-400'    },
  { keywords: ['vegetable', 'produce'],                              emoji: '🥦', gradient: 'from-green-400 to-emerald-500' },
  { keywords: ['book', 'notebook'],                                  emoji: '📚', gradient: 'from-blue-500 to-indigo-500' },
  { keywords: ['pen', 'pencil', 'stationery', 'supply', 'supplies', 'marker'], emoji: '✏️', gradient: 'from-indigo-400 to-purple-500' },
];

const OUTLET_FALLBACK = {
  food:       { emoji: '🍽️', gradient: 'from-red-500 to-orange-500'    },
  grocery:    { emoji: '🛒', gradient: 'from-green-500 to-emerald-500'  },
  stationary: { emoji: '📚', gradient: 'from-blue-500 to-indigo-500'    },
};

const getItemStyle = (category, storeType) => {
  const lower = (category || '').toLowerCase();
  const match = CATEGORY_STYLE.find((c) => c.keywords.some((k) => lower.includes(k)));
  return match || OUTLET_FALLBACK[storeType] || { emoji: '🛍️', gradient: 'from-gray-400 to-gray-500' };
};

export default function StoreMenu() {
  const {
    currentUser, selectedStore, setCurrentView,
    cart, setCart, apiCall, setLoading, showNotification,
  } = useApp();

  const [menuItems,           setMenuItems]           = useState([]);
  const [cartOpen,            setCartOpen]            = useState(false);
  const [checkoutOpen,        setCheckoutOpen]        = useState(false);
  const [deliveryLocation,    setDeliveryLocation]    = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod,       setPaymentMethod]       = useState('razorpay');

  useEffect(() => {
    if (selectedStore) loadMenu();
  }, [selectedStore]);

  // Close cart/checkout with Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setCheckoutOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const storeIsOpen = selectedStore?.isOpen !== false;

  const loadMenu = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/menu/restaurant/${selectedStore.id}`);
      setMenuItems(data.menu || []);
    } catch {
      showNotification('Failed to load menu', 'error');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, change) => {
    if (!storeIsOpen) {
      showNotification('This store is currently closed', 'warning');
      return;
    }
    const item = menuItems.find((i) => i.item_id === itemId);
    if (!item) return;

    const isAvailable = item.is_available == 1 || item.is_available === true;
    if (!isAvailable && change > 0) {
      showNotification('This item is currently unavailable', 'warning');
      return;
    }

    const cartItem   = cart.find((i) => i.item_id === itemId);
    const currentQty = cartItem ? cartItem.quantity : 0;
    const newQty     = currentQty + change;

    if (newQty < 0 || newQty > item.current_stock) return;

    if (newQty === 0) {
      setCart(cart.filter((i) => i.item_id !== itemId));
    } else if (cartItem) {
      setCart(cart.map((i) => (i.item_id === itemId ? { ...i, quantity: newQty } : i)));
    } else {
      setCart([
        ...cart,
        {
          item_id:    item.item_id,
          name:       item.item_name,
          price:      item.price,
          quantity:   1,
          store_id:   selectedStore.id,
          store_name: selectedStore.name,
          store_type: selectedStore.type,
        },
      ]);
    }
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find((i) => i.item_id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const openCheckout = () => {
    if (!storeIsOpen) {
      showNotification('Cannot place order — store is currently closed', 'warning');
      return;
    }
    if (cart.length === 0) {
      showNotification('Your cart is empty!', 'warning');
      return;
    }
    setDeliveryLocation('Campus Hostel');
    setSpecialInstructions('');
    setPaymentMethod('razorpay');
    setCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    if (!deliveryLocation.trim()) {
      showNotification('Delivery location is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        restaurant_id:        selectedStore.id,
        items:                cart.map((item) => ({ item_id: item.item_id, quantity: item.quantity })),
        delivery_location:    deliveryLocation.trim(),
        special_instructions: specialInstructions.trim(),
        payment_method:       paymentMethod === 'cash' ? 'cash' : 'card',
      };

      const data = await apiCall('/orders', {
        method: 'POST',
        body:   JSON.stringify(orderData),
      });

      if (paymentMethod === 'cash') {
        setCart([]);
        setCheckoutOpen(false);
        setCartOpen(false);
        showNotification(`✅ Order #${data.order_id} placed! Pay on delivery.`, 'success');
        setTimeout(() => setCurrentView('my-orders'), 1500);
        return;
      }

      // Razorpay
      const amountInPaise = Math.round(cartTotal * 100);
      if (amountInPaise < 100) {
        showNotification('Minimum order amount for online payment is ₹1', 'warning');
        setLoading(false);
        return;
      }

      const razorpayOrder = await apiCall('/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount:   amountInPaise,
          currency: 'INR',
          receipt:  `rcpt_order_${data.order_id}`,
        }),
      });

      if (!window.Razorpay) {
        showNotification('Razorpay SDK failed to load. Check your internet connection.', 'error');
        setLoading(false);
        return;
      }

      const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_TVbOC34BmBwl5F';

      const options = {
        key:         keyId,
        amount:      razorpayOrder.amount,
        currency:    razorpayOrder.currency,
        name:        'CampusCart',
        description: `Order #${data.order_id}`,
        image:       '/images/fast-food-restaurants.png',
        order_id:    razorpayOrder.order_id,
        handler: async (response) => {
          setLoading(true);
          try {
            const verifyRes = await apiCall('/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                order_id:            data.order_id,
              }),
            });

            if (verifyRes.success) {
              setCart([]);
              setCheckoutOpen(false);
              setCartOpen(false);
              showNotification(`💳 Payment successful! Order #${data.order_id} confirmed.`, 'success');
              setTimeout(() => setCurrentView('my-orders'), 1500);
            } else {
              showNotification(verifyRes.error || 'Payment signature verification failed', 'error');
            }
          } catch (err) {
            showNotification(err.message || 'Payment verification failed', 'error');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            showNotification('Payment cancelled. Order saved with pending status.', 'warning');
            setCheckoutOpen(false);
            setCartOpen(false);
            setCurrentView('my-orders');
          },
        },
        prefill: {
          name:    currentUser?.full_name || '',
          email:   currentUser?.email     || '',
          contact: currentUser?.phone     || '',
        },
        theme: { color: '#e11d48' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        showNotification(`Payment failed: ${response.error.description || 'Transaction declined'}`, 'error');
      });
      rzp.open();
    } catch (error) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <button onClick={() => setCurrentView('outlets')} className="hover:text-gray-900 transition-colors">Outlets</button>
        <span>/</span>
        <button onClick={() => setCurrentView('stores')} className="hover:text-gray-900 transition-colors">{selectedStore.type}</button>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate">{selectedStore.name}</span>
      </div>

      {/* Store header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{selectedStore.name}</h1>
            {selectedStore.description && (
              <p className="text-gray-500 text-sm mb-3">{selectedStore.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                {selectedStore.location}
              </span>
              {selectedStore.rating && (
                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-semibold border border-yellow-100">
                  <Star size={12} fill="currentColor" />
                  {selectedStore.rating}
                </span>
              )}
            </div>
          </div>
          <span className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold border ${
            storeIsOpen
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {storeIsOpen ? '● Open Now' : '● Closed'}
          </span>
        </div>
      </div>

      {/* Menu content */}
      {!storeIsOpen ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Store is closed</h3>
          <p className="text-gray-500 text-sm">The vendor has temporarily closed this store. Check back later.</p>
        </div>
      ) : Object.keys(groupedMenu).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No items available</h3>
          <p className="text-gray-500 text-sm">This store has no items in stock right now</p>
        </div>
      ) : (
        Object.keys(groupedMenu).map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 pb-2 border-b-2 border-gray-100 flex items-center gap-2 sticky top-16 bg-gray-50 z-10 py-2">
              {category}
            </h2>
            <div className="grid gap-3">
              {groupedMenu[category].map((item) => {
                const qty         = getItemQuantity(item.item_id);
                const style       = getItemStyle(item.category, selectedStore.type);
                const isAvailable = item.is_available == 1 || item.is_available === true;
                const isOutOfStock = item.current_stock === 0;
                const isLowStock   = !isOutOfStock && item.current_stock <= item.low_stock_threshold;

                return (
                  <div
                    key={item.item_id}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-4 ${
                      (!isAvailable || isOutOfStock) ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center text-3xl shadow-sm border border-gray-100`}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerText = style.emoji;
                          }}
                        />
                      ) : (
                        <span>{style.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{item.item_name}</h3>
                        {isLowStock && (
                          <span className="shrink-0 text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full border border-orange-100">
                            Only {item.current_stock} left!
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      <p className="text-lg font-extrabold text-red-600 mt-1">₹{item.price}</p>
                      {!isAvailable && (
                        <p className="text-xs text-red-500 font-semibold mt-0.5">🔴 Unavailable</p>
                      )}
                      {isAvailable && isOutOfStock && (
                        <p className="text-xs text-red-500 font-semibold mt-0.5">Out of Stock</p>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div className="shrink-0 flex items-center gap-2">
                      {qty === 0 ? (
                        <button
                          onClick={() => updateQuantity(item.item_id, 1)}
                          disabled={!isAvailable || isOutOfStock}
                          className="px-5 py-2 rounded-xl border-2 border-red-600 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-all disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-600 text-white rounded-xl px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.item_id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-red-700 rounded-lg transition-colors font-bold"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{qty}</span>
                          <button
                            onClick={() => updateQuantity(item.item_id, 1)}
                            disabled={qty >= item.current_stock}
                            className="w-7 h-7 flex items-center justify-center hover:bg-red-700 rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Floating cart button */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-orange-500 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-red-200 hover:shadow-red-300 transition-all flex items-center gap-3 z-30 hover:scale-105"
        >
          <ShoppingCart size={22} />
          <div className="text-left">
            <div className="font-bold text-sm">View Cart</div>
            <div className="text-xs opacity-90">{cartCount} items • ₹{cartTotal}</div>
          </div>
          <span className="bg-white text-red-600 text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-red-600 to-orange-500 text-white">
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm opacity-80">{cartCount} item{cartCount !== 1 ? 's' : ''} • {selectedStore.name}</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart size={56} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="font-bold text-gray-900 mb-1">Cart is empty</h3>
                  <p className="text-gray-500 text-sm">Add items from the menu!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.item_id} className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">₹{item.price} × {item.quantity} = <span className="font-bold text-red-600">₹{item.price * item.quantity}</span></p>
                    </div>
                    <button
                      onClick={() => setCart(cart.filter((i) => i.item_id !== item.item_id))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t p-5 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700">Subtotal</span>
                  <span className="font-extrabold text-2xl text-red-600">₹{cartTotal}</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3.5 rounded-2xl font-bold hover:from-red-700 hover:to-orange-600 transition-all shadow-lg shadow-red-100"
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] backdrop-blur-sm" onClick={() => setCheckoutOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-3xl shadow-2xl z-[70] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-5 border-b bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-t-3xl">
              <h2 className="text-xl font-bold">Delivery Details</h2>
              <button onClick={() => setCheckoutOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Delivery location */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g., Hostel Block A, Room 101"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Special Instructions <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g., No onions, extra spicy, leave at door…"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'razorpay', icon: '💳', title: 'Pay Online', sub: 'UPI, Cards, Net Banking', badge: 'Razorpay' },
                    { id: 'cash',     icon: '💵', title: 'Cash',       sub: 'Pay on delivery',       badge: null },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        paymentMethod === opt.id
                          ? 'border-red-500 bg-red-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm flex items-center gap-1">{opt.icon} {opt.title}</span>
                        {opt.badge && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">{opt.badge}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total Amount</span>
                <span className="font-extrabold text-2xl text-red-600">₹{cartTotal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setCheckoutOpen(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-2xl font-bold hover:from-red-700 hover:to-orange-600 transition-all shadow-lg shadow-red-100 text-sm"
              >
                Confirm Order 🎉
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}