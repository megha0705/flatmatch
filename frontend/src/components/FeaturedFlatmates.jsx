import React, { useState } from 'react';
import { MOCK_FLATMATES } from '../data/mockData';
import { MapPin, Briefcase, Moon, Sun, Sparkles, Heart, Filter, Coffee, Check, Shield } from 'lucide-react';

export default function FeaturedFlatmates({ onConnect, selectedCity, onSelectCity }) {
  const [activeCity, setActiveCity] = useState(selectedCity || 'All');
  const [filterDiet, setFilterDiet] = useState('ALL');
  const [savedIds, setSavedIds] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);

  const cities = ['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad'];

  const filteredFlatmates = MOCK_FLATMATES.filter((f) => {
    if (activeCity !== 'All' && f.city.toLowerCase() !== activeCity.toLowerCase()) {
      return false;
    }
    if (filterDiet !== 'ALL' && f.diet !== filterDiet) {
      return false;
    }
    return true;
  });

  const toggleSave = (id, e) => {
    e.stopPropagation();
    setSavedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConnect = (flatmate) => {
    if (!connectedIds.includes(flatmate.id)) {
      setConnectedIds((prev) => [...prev, flatmate.id]);
    }
    if (onConnect) {
      onConnect(flatmate);
    }
  };

  return (
    <section id="find-flatmate-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF1EC] text-[#DE5737] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Vetted Profiles
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211B17] tracking-tight">
            Explore verified flatmates
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Browse people searching for a roommate or flat right now. Filter by city and habits.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setActiveCity(city);
                if (onSelectCity) onSelectCity(city);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeCity === city
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-[#ECE4DB] hover:border-[#DE5737]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Flatmate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFlatmates.map((flatmate) => {
          const isSaved = savedIds.includes(flatmate.id);
          const isConnected = connectedIds.includes(flatmate.id);

          return (
            <div
              key={flatmate.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#ECE4DB] shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Photo & Match Badge */}
              <div className="relative h-64 overflow-hidden bg-stone-100">
                <img
                  src={flatmate.photoUrl}
                  alt={flatmate.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Match Score Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold text-stone-900 border border-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{flatmate.matchScore}% Compatibility</span>
                </div>

                {/* Save Heart Button */}
                <button
                  onClick={(e) => toggleSave(flatmate.id, e)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isSaved ? 'text-[#DE5737] fill-[#DE5737]' : 'text-stone-600'
                    }`}
                  />
                </button>

                {/* Name & Basic Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">
                      {flatmate.name}, {flatmate.age}
                    </h3>
                    <Shield className="w-4 h-4 text-emerald-400 fill-emerald-400/20" title="ID & Workplace Verified" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-200 mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-stone-300" />
                      {flatmate.occupation} @ {flatmate.organization}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Location & Budget */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs">
                    <span className="flex items-center gap-1 text-stone-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#DE5737]" />
                      {flatmate.area}, {flatmate.city}
                    </span>
                    <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
                      ₹{flatmate.budgetMin.toLocaleString()} - ₹{flatmate.budgetMax.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    "{flatmate.bio}"
                  </p>

                  {/* Routine & Lifestyle tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                      {flatmate.sleepSchedule === 'EARLY_BIRD' ? (
                        <Sun className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Moon className="w-3 h-3 text-indigo-500" />
                      )}
                      {flatmate.sleepSchedule === 'EARLY_BIRD' ? 'Early Riser' : 'Night Owl'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                      ✨ Cleanliness: {flatmate.cleanliness}/5
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                      🥗 {flatmate.diet}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                      💼 {flatmate.workMode}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => handleConnect(flatmate)}
                  className={`w-full py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#DE5737] hover:bg-[#CA4929] text-white shadow-sm'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Wave Sent! Connected</span>
                    </>
                  ) : (
                    <span>Say Hello / Wave 👋</span>
                  )}
                </button>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
