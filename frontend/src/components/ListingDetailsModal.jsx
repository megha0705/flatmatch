import React, { useState } from 'react';
import { 
  X, MapPin, IndianRupee, Shield, Users, Bed, Calendar, 
  Check, MessageSquare, Sparkles, ChevronLeft, ChevronRight, Phone
} from 'lucide-react';

export default function ListingDetailsModal({ listing, isOpen, onClose, onContact }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !listing) return null;

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos.map(p => p.url)
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"];

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl border border-stone-100 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Media Banner */}
        <div className="relative h-72 sm:h-80 bg-stone-900 shrink-0">
          <img
            src={photos[activePhotoIdx]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Carousel Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center shadow-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-900 flex items-center justify-center shadow-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
            {activePhotoIdx + 1} / {photos.length} Photos
          </div>

          {/* Title & Location Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="inline-block bg-[#DE5737] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-2">
              {listing.roomType?.replace('_', ' ')}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
              {listing.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-200 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#DE5737]" />
              <span>{listing.locality}, {listing.city} {listing.addressHint && `(${listing.addressHint})`}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Key Facts Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE4DB]">
            <div>
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">Rent</span>
              <span className="text-lg font-black text-[#DE5737]">
                ₹{listing.rentPerPerson?.toLocaleString()}
                <span className="text-xs text-stone-500 font-normal">/mo</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">Deposit</span>
              <span className="text-base font-bold text-stone-900">
                ₹{listing.deposit ? listing.deposit.toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">Furnishing</span>
              <span className="text-sm font-bold text-stone-900 capitalize">
                {listing.furnishing?.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">Available From</span>
              <span className="text-sm font-bold text-stone-900">
                {listing.availableFrom || 'Immediately'}
              </span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-2">About this Home</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Additional Info Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
              👥 {listing.currentFlatmates || 0} Current flatmate(s)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              ✨ {listing.spotsAvailable || 1} Spot(s) open
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
              🏷️ Gender allowed: {listing.genderAllowed?.replace('_', ' ')}
            </span>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-3">Amenities & Perks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {listing.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host Card */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE4DB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#DE5737] text-white font-extrabold text-lg flex items-center justify-center uppercase">
                {listing.owner?.name ? listing.owner.name[0] : 'H'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-stone-900">{listing.owner?.name || 'Flatmate Host'}</h4>
                  {listing.owner?.verified && (
                    <Shield className="w-4 h-4 text-emerald-500 fill-emerald-500/20" title="Verified Member" />
                  )}
                </div>
                <p className="text-xs text-stone-500">Verified Housemate on Roomie</p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onContact) onContact(listing);
              }}
              className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Host</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
