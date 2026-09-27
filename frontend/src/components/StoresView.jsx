import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Star, MapPin, Clock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Deterministic image mapping for known store names
const IMAGE_MAP = {
  'Spicy Hut':                 '/images/spicyhut.jpg',
  'Dev D Restro':              '/images/spicyhutt.jpg',
  'Campus Cafe':               '/images/cannteen.jpg',
  'Nescafe Corner':            '/images/nescafe.jpg',
  'Let Me Bake':               '/images/bakery.jpg',
  'Daily Essentials Store':    '/images/grocery.jpg',
  'Fresh Mart':                '/images/essential.jpg',
  'Campus Books & Supplies':   '/images/stat.jpg',
  'Study Corner':              '/images/stat1.jpg',
};

const getRestaurantImage = (name) => IMAGE_MAP[name] || '/images/fast-food-restaurants.png';

const STATUS_BADGE = {
  open:   'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-red-100  text-red-700  border-red-200',
};

export default function StoresView() {
  const {
    selectedOutlet, setCurrentView, setSelectedStore,
    apiCall, setLoading, showNotification,
  } = useApp();

  const [stores, setStores]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imgErrors, setImgErrors]  = useState({});

  useEffect(() => {
    loadStores();
  }, [selectedOutlet]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/restaurants/outlet/${selectedOutlet.id}`);
      setStores(data.restaurants || []);
    } catch {
      showNotification('Failed to load stores', 'error');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.restaurant_name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  });

  const handleStoreClick = (store) => {
    if (!store.is_open) {
      showNotification('This store is currently closed', 'warning');
      return;
    }
    setSelectedStore({
      id:          store.restaurant_id,
      name:        store.restaurant_name,
      description: store.description,
      location:    store.location,
      rating:      store.rating,
      isOpen:      store.is_open,
      type:        selectedOutlet.id,
    });
    setCurrentView('store-menu');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentView('outlets')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ChevronRight size={18} className="rotate-180" />
          Outlets
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold text-sm">{selectedOutlet.name}</span>
      </div>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
          <span>{selectedOutlet.emoji}</span>
          {selectedOutlet.name} Stores
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {filteredStores.length} {selectedOutlet.name.toLowerCase()} store{filteredStores.length !== 1 ? 's' : ''} on campus
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${selectedOutlet.name.toLowerCase()} stores…`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm bg-white text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Store grid */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-500 text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((store) => (
            <div
              key={store.restaurant_id}
              onClick={() => handleStoreClick(store)}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${
                store.is_open
                  ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-red-100'
                  : 'opacity-60 cursor-not-allowed grayscale-[40%]'
              }`}
            >
              {/* Store image */}
              <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {!imgErrors[store.restaurant_id] ? (
                  <img
                    src={getRestaurantImage(store.restaurant_name)}
                    alt={store.restaurant_name}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [store.restaurant_id]: true }))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                    {selectedOutlet.emoji}
                  </div>
                )}
                {/* Open/closed overlay badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${store.is_open ? STATUS_BADGE.open : STATUS_BADGE.closed}`}>
                    {store.is_open ? '● Open' : '● Closed'}
                  </span>
                </div>
                {/* Rating badge */}
                {store.rating && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-800">{store.rating}</span>
                  </div>
                )}
              </div>

              {/* Store info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{store.restaurant_name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{store.description}</p>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="shrink-0 text-gray-400" />
                    <span className="truncate">{store.location}</span>
                  </div>
                  {store.opening_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="shrink-0 text-gray-400" />
                      <span>{store.opening_time.slice(0, 5)} – {store.closing_time?.slice(0, 5)}</span>
                    </div>
                  )}
                </div>

                {store.is_open && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <span className="text-red-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      View Menu <ChevronRight size={14} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}