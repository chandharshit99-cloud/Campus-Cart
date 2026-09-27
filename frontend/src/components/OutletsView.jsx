import React, { useState, useEffect } from 'react';
import { Store, Package, BookOpen, ChevronRight, Flame, Star, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OutletsView() {
  const { setCurrentView, setSelectedOutlet, apiCall, currentUser } = useApp();
  const [counts, setCounts] = useState({ food: 0, grocery: 0, stationary: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const ids = ['food', 'grocery', 'stationary'];
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const data = await apiCall(`/restaurants/outlet/${id}`);
              return [id, (data.restaurants || []).length];
            } catch {
              return [id, 0];
            }
          })
        );
        setCounts(Object.fromEntries(results));
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const outlets = [
    {
      id: 'food',
      name: 'Food',
      icon: Store,
      gradient: 'from-red-500 to-orange-500',
      lightBg: 'from-red-50 to-orange-50',
      border: 'border-red-100',
      storeCount: counts.food,
      description: 'Restaurants & Cafes',
      emoji: '🍽️',
      tag: 'Most Popular',
      tagColor: 'bg-red-100 text-red-700',
      tagIcon: Flame,
    },
    {
      id: 'grocery',
      name: 'Grocery',
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      lightBg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      storeCount: counts.grocery,
      description: 'Daily Essentials',
      emoji: '🛒',
      tag: 'Fresh & Fast',
      tagColor: 'bg-green-100 text-green-700',
      tagIcon: Star,
    },
    {
      id: 'stationary',
      name: 'Stationery',
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-500',
      lightBg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      storeCount: counts.stationary,
      description: 'Study Materials',
      emoji: '📚',
      tag: 'Quick Delivery',
      tagColor: 'bg-blue-100 text-blue-700',
      tagIcon: Clock,
    },
  ];

  const handleOutletClick = (outlet) => {
    setSelectedOutlet(outlet);
    setCurrentView('stores');
  };

  const firstName = currentUser?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff1f2 0%, #f9fafb 200px)' }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Hero greeting */}
        <div className="text-center mb-12">
          <p className="text-red-500 font-semibold text-sm uppercase tracking-widest mb-2">
            Welcome back, {firstName}! 👋
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
            What are you craving
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent"> today?</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Browse from campus food, groceries, or stationery — all delivered right to you.
          </p>
        </div>

        {/* Outlet cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {outlets.map((outlet) => {
            const Icon = outlet.icon;
            const TagIcon = outlet.tagIcon;
            return (
              <button
                key={outlet.id}
                onClick={() => handleOutletClick(outlet)}
                className={`group relative bg-white rounded-3xl border ${outlet.border} shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden text-left hover:-translate-y-2`}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${outlet.gradient}`} />

                {/* Tag */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${outlet.tagColor}`}>
                    <TagIcon size={10} />
                    {outlet.tag}
                  </span>
                </div>

                <div className="p-6">
                  {/* Emoji */}
                  <div className="text-5xl mb-4">{outlet.emoji}</div>

                  {/* Icon circle */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${outlet.gradient} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{outlet.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{outlet.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      {loading ? '...' : `${outlet.storeCount} store${outlet.storeCount !== 1 ? 's' : ''}`}
                    </span>
                    <span className={`flex items-center gap-1 font-bold text-sm bg-gradient-to-r ${outlet.gradient} bg-clip-text text-transparent`}>
                      Browse
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-orange-500" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info banner */}
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="text-5xl shrink-0">🎉</div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Everything your campus needs, in one place</h3>
            <p className="text-gray-500 text-sm">
              Order meals from your favourite restaurant, grab groceries for your hostel room, or get study supplies — all on CampusCart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}