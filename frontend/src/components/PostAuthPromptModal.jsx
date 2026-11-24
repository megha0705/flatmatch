import React from 'react';
import { Home, Search, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PostAuthPromptModal({ isOpen, onClose, userName, onCreateListing, onBrowseListings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Welcome Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF1EC] text-[#DE5737] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Welcome to roomie
          </div>
          <h2 className="text-2xl font-black text-[#211B17] tracking-tight">
            Hi {userName || 'there'}, what brings you here today?
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Choose what you'd like to do first. You can always do both anytime!
          </p>
        </div>

        {/* Two Choice Cards */}
        <div className="space-y-4 mb-6">
          
          {/* Choice 1: Create a Listing */}
          <div 
            onClick={() => {
              onClose();
              onCreateListing();
            }}
            className="p-5 rounded-2xl border-2 border-[#ECE4DB] hover:border-[#DE5737] hover:bg-[#FAF7F2] transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 group-hover:text-[#DE5737] transition-colors">
                  I have a room or flat to share
                </h3>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#DE5737] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Post your room or apartment, upload photos, and connect with verified, respectful flatmates.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-[#DE5737]">
                Create a Listing →
              </span>
            </div>
          </div>

          {/* Choice 2: Search & Browse Listings */}
          <div 
            onClick={() => {
              onClose();
              onBrowseListings();
            }}
            className="p-5 rounded-2xl border-2 border-[#ECE4DB] hover:border-[#DE5737] hover:bg-[#FAF7F2] transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 group-hover:text-[#DE5737] transition-colors">
                  I'm looking for a room or flatmate
                </h3>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#DE5737] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Browse verified rooms, filter by budget and amenities, or match by lifestyle routines.
              </p>
              <span className="inline-block mt-2 text-[11px] font-bold text-stone-700">
                Explore Listings →
              </span>
            </div>
          </div>

        </div>

        {/* Skip button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors"
          >
            I'll decide later, take me to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
