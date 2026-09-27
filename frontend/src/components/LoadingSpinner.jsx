import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[80]">
      <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center shadow-2xl">
        {/* Spinner ring */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UtensilsCrossed size={20} className="text-red-500" />
          </div>
        </div>
        <p className="text-gray-800 font-bold text-sm">Loading…</p>
        <p className="text-gray-400 text-xs mt-0.5">Please wait a moment</p>
      </div>
    </div>
  );
}