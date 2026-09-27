import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Phone, Store, MapPin, Tag, FileText, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';

export default function Login() {
  const { login, signup, showNotification } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Vendor-only fields
  const [restaurantName, setRestaurantName] = useState('');
  const [outletType, setOutletType] = useState('food');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const switchToSignUp = (val) => {
    setIsSignUp(val);
    // reset fields on tab switch to avoid stale state
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          showNotification('Passwords do not match', 'error');
          return;
        }
        if (password.length < 6) {
          showNotification('Password must be at least 6 characters', 'error');
          return;
        }

        const signupData = {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim(),
          user_type: userType,
          ...(userType === 'vendor' && {
            restaurant_name: restaurantName.trim(),
            outlet_type: outletType,
            location: location.trim(),
            description: description.trim(),
          }),
        };

        await signup(signupData);
      } else {
        await login(email.trim(), password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fff7ed 40%, #fefce8 100%)' }}>

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">

        {/* Top brand strip */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl mb-3 shadow-lg">
            <UtensilsCrossed size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CampusCart</h1>
          <p className="text-sm text-red-100 mt-1 font-medium">🍽️ Food &nbsp;·&nbsp; 🛒 Grocery &nbsp;·&nbsp; 📚 Stationery</p>
        </div>

        <div className="px-8 py-6">
          {/* Sign In / Sign Up tabs */}
          <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 mb-5">
            {['Sign In', 'Sign Up'].map((label, idx) => {
              const active = (idx === 0 && !isSignUp) || (idx === 1 && isSignUp);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => switchToSignUp(idx === 1)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    active
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* User type tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { id: 'student', emoji: '🎓', label: 'Student' },
              { id: 'vendor',  emoji: '🏪', label: 'Vendor'  },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setUserType(t.id)}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  userType === t.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-base">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm"
                    placeholder={userType === 'vendor' ? 'Owner / Manager name' : 'Rahul Singh'}
                    required={isSignUp}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm"
                  placeholder={userType === 'vendor' ? 'vendor@email.com' : 'student@email.com'}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Phone <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm"
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Vendor extra fields */}
            {isSignUp && userType === 'vendor' && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wide">
                  <Store size={14} />
                  Store / Outlet Details
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Store Name *</label>
                  <div className="relative">
                    <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 bg-white"
                      placeholder="e.g. Royal Taste Cafe"
                      required={userType === 'vendor'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Outlet Type *</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={outletType}
                        onChange={(e) => setOutletType(e.target.value)}
                        className="w-full pl-7 pr-2 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400"
                      >
                        <option value="food">🍽️ Food</option>
                        <option value="grocery">🛒 Grocery</option>
                        <option value="stationary">📚 Stationary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-7 pr-2 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400"
                        placeholder="Food Court Gate 2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-2.5 top-3 text-gray-400" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full pl-7 pr-2 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-400 resize-none"
                      placeholder="Short description of your specialties..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-11 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-300 focus:ring-red-300'
                        : 'border-gray-200'
                    }`}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3.5 rounded-2xl font-bold text-sm hover:from-red-700 hover:to-orange-600 transition-all shadow-lg shadow-red-200 hover:shadow-red-300 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isLoading
                ? (isSignUp ? '⏳ Creating Account...' : '⏳ Signing In...')
                : (isSignUp
                    ? `🎉 Create ${userType === 'vendor' ? 'Vendor' : 'Student'} Account`
                    : '🚀 Sign In')}
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-5 text-center text-sm text-gray-500 border-t border-gray-100 pt-4">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchToSignUp(false)}
                  className="text-red-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New to CampusCart?{' '}
                <button
                  type="button"
                  onClick={() => switchToSignUp(true)}
                  className="text-red-600 font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}