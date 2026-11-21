import React, { useState } from 'react';
import { Sparkles, MapPin, ArrowRight, Users, Heart } from 'lucide-react';

export default function HeroSection({ onSearchCity, onOpenAuth }) {
  const [cityInput, setCityInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onSearchCity(cityInput.trim());
      document.getElementById('find-flatmate-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('find-flatmate-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-stone-200/70 shadow-sm text-xs sm:text-sm font-medium text-stone-700 mb-6 hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4 text-[#DE5737]" />
              <span>Make room for your next chapter</span>
            </div>

            {/* Main Headline matching the design exactly */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight leading-[1.08] text-[#211B17] mb-6">
              Your next place <br />
              starts with <span className="text-[#DE5737]">your</span> <br />
              <span className="text-[#DE5737]">people.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl font-normal leading-relaxed mb-8">
              Find a flatmate who gets your routines, your budget, and what makes a place feel like home.
            </p>

            {/* Search Pill Card */}
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-full p-2 pl-5 shadow-lg shadow-stone-200/70 border border-stone-200/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg mb-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <MapPin className="w-5 h-5 text-[#DE5737] shrink-0" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Which city feels like home?"
                  className="w-full bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 text-sm sm:text-base font-normal py-1"
                />
              </div>
              <button
                type="submit"
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-semibold px-6 py-3 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-95"
              >
                <span>Find my people</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Tagline under search */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 font-medium">
              <Users className="w-4 h-4 text-stone-400" />
              <span>A more human way to share a home</span>
            </div>

          </div>

          {/* Right Hero Visual: Exact Arched Portrait Cards */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative w-[320px] sm:w-[380px] h-[440px] sm:h-[480px]">
              
              {/* Floating Pill: "Your kind of people are here" */}
              <div className="absolute top-8 -left-6 sm:-left-12 bg-white/95 backdrop-blur-md shadow-lg shadow-stone-300/40 px-4 py-2 rounded-full border border-stone-100 text-xs sm:text-sm font-semibold text-stone-800 flex items-center gap-2.5 z-30 animate-in fade-in zoom-in duration-500">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DE5737]" />
                <span>Your kind of people are here</span>
              </div>

              {/* Top Right Main Arch Card */}
              <div className="absolute top-0 right-0 w-[240px] sm:w-[280px] h-[340px] sm:h-[390px] arch-top overflow-hidden shadow-2xl bg-[#EAE3D9] z-10 transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
                  alt="Friendly flatmate"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Bottom Left Overlapping Arch Card */}
              <div className="absolute bottom-6 left-0 sm:-left-4 w-[170px] sm:w-[200px] h-[230px] sm:h-[260px] arch-top-sm overflow-hidden shadow-2xl border-4 border-[#FAF7F2] bg-[#E8DFD5] z-20 transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=85"
                  alt="Housemate enjoying cozy home"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Decorative warm pastel circle accent */}
              <div className="absolute bottom-4 right-10 w-28 h-28 rounded-full bg-[#F9DEC9] -z-0 opacity-90 blur-[1px]" />

              {/* Floating Bottom-Right Feature Card: "Room for real life" */}
              <div className="absolute -bottom-2 right-2 sm:-right-2 bg-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-stone-100 flex items-center gap-3.5 z-30 max-w-[240px] sm:max-w-[260px] hover:shadow-2xl transition-shadow">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FDF1EC] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-[#DE5737] fill-[#DE5737]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 leading-tight">Room for real life</h4>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">Good people. Better housemates.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
