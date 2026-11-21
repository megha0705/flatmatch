import React from 'react';
import { Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer className="bg-white border-t border-[#ECE4DB] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-stone-100">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#DE5737] flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#211B17] flex items-baseline">
                roomie
                <span className="text-[#DE5737] font-extrabold text-2xl ml-0.5 leading-none">.</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm leading-relaxed mb-6">
              Your next place starts with your people. Finding respectful, compatible flatmates by habits, routines, and budget across India's top cities.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#ECE4DB] text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Government ID & Workplace Verified Community</span>
            </div>
          </div>

          {/* Quick Cities */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-4">
              Top Metro Cities
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
              <li><a href="#find-flatmate-section" className="hover:text-[#DE5737] transition-colors">Bangalore Flatmates</a></li>
              <li><a href="#find-flatmate-section" className="hover:text-[#DE5737] transition-colors">Mumbai Rooms & Flats</a></li>
              <li><a href="#find-flatmate-section" className="hover:text-[#DE5737] transition-colors">Pune Tech Corridors</a></li>
              <li><a href="#find-flatmate-section" className="hover:text-[#DE5737] transition-colors">Delhi NCR & Gurgaon</a></li>
              <li><a href="#find-flatmate-section" className="hover:text-[#DE5737] transition-colors">Hyderabad Hitec City</a></li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
              <li><span className="hover:text-[#DE5737] cursor-pointer">Verification Process</span></li>
              <li><span className="hover:text-[#DE5737] cursor-pointer">Roommate Agreement</span></li>
              <li><span className="hover:text-[#DE5737] cursor-pointer">Community Standards</span></li>
              <li><span className="hover:text-[#DE5737] cursor-pointer">Safety Guidelines</span></li>
              <li><span className="hover:text-[#DE5737] cursor-pointer">Scam Prevention</span></li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 mb-4">
              Join Roomie
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
              <li>
                <button onClick={() => onOpenAuth('signup')} className="hover:text-[#DE5737] font-semibold text-[#DE5737]">
                  Sign up free →
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('login')} className="hover:text-[#DE5737]">
                  Log into your account
                </button>
              </li>
              <li><a href="#how-it-works-section" className="hover:text-[#DE5737]">How matching works</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 roomie. Built with care for better living.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-800 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-800 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-800 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
