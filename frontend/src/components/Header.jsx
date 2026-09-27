import React, { useState } from 'react';
import { ShoppingCart, LogOut, FileText, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { currentUser, logout, setCurrentView, cart } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getRoleBadge = () => {
    switch (currentUser.user_type) {
      case 'student':        return { label: 'Student',       emoji: '🎓', color: 'text-blue-600 bg-blue-50' };
      case 'vendor':         return { label: 'Vendor',        emoji: '🏪', color: 'text-purple-600 bg-purple-50' };
      case 'support_agent':
      case 'senior_support':
      case 'support':
      case 'agent':          return { label: 'Support',       emoji: '🎧', color: 'text-teal-600 bg-teal-50' };
      case 'admin':          return { label: 'Admin',         emoji: '🔧', color: 'text-orange-600 bg-orange-50' };
      default:               return { label: currentUser.user_type, emoji: '👤', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const handleLogoClick = () => {
    if (!currentUser) return;
    if (currentUser.user_type === 'student')   return setCurrentView('outlets');
    if (currentUser.user_type === 'vendor')    return setCurrentView('vendor-dashboard');
    if (['support_agent', 'senior_support', 'admin', 'support', 'agent'].includes(currentUser.user_type))
      return setCurrentView('support');
    setCurrentView('outlets');
  };

  const role = getRoleBadge();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group"
            aria-label="Go to home"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
              Campus<span className="text-gray-900">Cart</span>
            </span>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* My Orders — students only */}
            {currentUser.user_type === 'student' && (
              <button
                onClick={() => setCurrentView('my-orders')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <FileText size={16} />
                My Orders
              </button>
            )}

            {/* Cart pill — students only, only when items in cart */}
            {currentUser.user_type === 'student' && cartCount > 0 && (
              <button
                onClick={() => setCurrentView('store-menu')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md"
                title="View cart"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">₹{cartTotal}</span>
                <span className="bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              </button>
            )}

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                aria-label="Open user menu"
                aria-expanded={showMenu}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-400 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {currentUser.full_name.split(' ')[0]}
                </span>
                {showMenu ? <X size={16} className="text-gray-500" /> : <Menu size={16} className="text-gray-500" />}
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  {/* Dropdown panel */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-400 text-white rounded-full flex items-center justify-center font-bold shadow-sm shrink-0">
                          {currentUser.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">{currentUser.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <span className={`mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.color}`}>
                        {role.emoji} {role.label}
                      </span>
                    </div>

                    {/* Mobile My Orders link */}
                    {currentUser.user_type === 'student' && (
                      <button
                        onClick={() => { setCurrentView('my-orders'); setShowMenu(false); }}
                        className="sm:hidden w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <FileText size={16} className="text-gray-400" />
                        My Orders
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
