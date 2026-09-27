import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [authToken,    setAuthToken]    = useState(() => sessionStorage.getItem('authToken'));
  const [currentUser,  setCurrentUser]  = useState(() => {
    try {
      const u = sessionStorage.getItem('currentUser');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [cart, setCart] = useState(() => {
    try {
      const c = sessionStorage.getItem('cart');
      return c ? JSON.parse(c) : [];
    } catch { return []; }
  });

  const [currentView,    setCurrentViewState] = useState('login');
  const [selectedOutlet, setSelectedOutlet]   = useState(null);
  const [selectedStore,  setSelectedStore]    = useState(null);
  const [loading,        setLoading]          = useState(false);
  const [notification,   setNotification]     = useState(null);

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const setCurrentView = useCallback((view) => {
    setCurrentViewState(view);
    window.history.pushState({ view }, '', window.location.pathname);
  }, []);

  useEffect(() => {
    window.history.replaceState({ view: currentView }, '', window.location.pathname);
    const handlePop = (e) => {
      if (e.state?.view) setCurrentViewState(e.state.view);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // ─── Auto-redirect after login ───────────────────────────────────────────────
  useEffect(() => {
    if (authToken && currentUser) {
      if (currentUser.user_type === 'student') {
        setCurrentView('outlets');
      } else if (currentUser.user_type === 'vendor') {
        setCurrentView('vendor-dashboard');
      } else if (['support_agent', 'senior_support', 'admin', 'support', 'agent'].includes(currentUser.user_type)) {
        setCurrentView('support');
      } else {
        setCurrentView('outlets');
      }
    }
  }, [authToken, currentUser]);

  // ─── Persist cart to sessionStorage ─────────────────────────────────────────
  useEffect(() => {
    try {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to sessionStorage', e);
    }
  }, [cart]);

  // ─── Notification (single timeout source of truth) ───────────────────────────
  const showNotification = useCallback((message, type = 'info') => {
    if (!message) {
      setNotification(null);
      return;
    }
    setNotification({ message, type });
  }, []);

  // ─── API helper ──────────────────────────────────────────────────────────────
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const API_BASE_URL =
      process.env.REACT_APP_API_URL ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://campus-cart-backend-23np.onrender.com/api');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }

    return data;
  }, [authToken]);

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
      });

      setAuthToken(data.token);
      setCurrentUser(data.user);
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));

      showNotification(`Welcome back, ${data.user.full_name.split(' ')[0]}! 👋`, 'success');

      if (data.user.user_type === 'student') {
        setCurrentView('outlets');
      } else if (data.user.user_type === 'vendor') {
        setCurrentView('vendor-dashboard');
      } else if (['support_agent', 'senior_support', 'admin', 'support', 'agent'].includes(data.user.user_type)) {
        setCurrentView('support');
      } else {
        setCurrentView('outlets');
      }
    } catch (error) {
      showNotification(error.message || 'Login failed. Check your credentials.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body:   JSON.stringify(userData),
      });

      setAuthToken(data.token);
      setCurrentUser(data.user);
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));

      showNotification(`Account created! Welcome, ${data.user.full_name.split(' ')[0]}! 🎉`, 'success');

      if (data.user.user_type === 'student') {
        setCurrentView('outlets');
      } else if (data.user.user_type === 'vendor') {
        setCurrentView('vendor-dashboard');
      } else {
        setCurrentView('outlets');
      }
    } catch (error) {
      showNotification(error.message || 'Sign up failed. Please try again.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Best-effort server-side logout
    if (authToken) {
      apiCall('/auth/logout', { method: 'POST' }).catch(() => {});
    }

    setAuthToken(null);
    setCurrentUser(null);
    setCart([]);
    setSelectedOutlet(null);
    setSelectedStore(null);

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('cart');

    setCurrentView('login');
    showNotification('Signed out successfully', 'info');
  };

  // ─── Session management ───────────────────────────────────────────────────────
  const listSessions = async () => {
    const data = await apiCall('/auth/sessions');
    return data.sessions;
  };

  const revokeSession = async (sessionId) => {
    await apiCall(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
    return true;
  };

  // ─── Cart helpers ─────────────────────────────────────────────────────────────
  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem('cart'); // was incorrectly using localStorage before
  };

  // ─── Context value ────────────────────────────────────────────────────────────
  const value = {
    authToken,
    currentUser,
    cart,
    setCart,
    clearCart,
    currentView,
    setCurrentView,
    selectedOutlet,
    setSelectedOutlet,
    selectedStore,
    setSelectedStore,
    loading,
    setLoading,
    notification,
    showNotification,
    apiCall,
    login,
    signup,
    logout,
    listSessions,
    revokeSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;