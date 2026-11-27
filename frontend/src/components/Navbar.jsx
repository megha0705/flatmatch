import React, { useState } from 'react';
import { Heart, ArrowRight, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { capitalizeWords } from '../utils/formatters';

export default function Navbar({ 
  user, 
  userProfile, 
  onOpenAuth, 
  onLogout, 
  onOpenProfile,
  currentView, 
  setCurrentView
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = userProfile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#ECE4DB]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#DE5737] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#211B17] flex items-baseline">
            roomie
            <span className="text-[#DE5737] font-extrabold text-3xl ml-0.5 leading-none">.</span>
          </span>
        </div>

        {/* Center navigation links without duplicates or confusing toggles */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-stone-700">
          <button 
            onClick={() => {
              if (currentView !== 'landing') setCurrentView('landing');
              setTimeout(() => {
                document.getElementById('find-flatmate-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-[#DE5737] transition-colors"
          >
            Find a flatmate
          </button>

          <button 
            onClick={() => {
              if (user) {
                setCurrentView('dashboard');
              } else {
                onOpenAuth('login');
              }
            }} 
            className={`hover:text-[#DE5737] transition-colors ${
              currentView === 'dashboard' ? 'text-[#DE5737] font-semibold' : ''
            }`}
          >
            Explore Listings
          </button>
          
          <button 
            onClick={() => {
              if (currentView !== 'landing') setCurrentView('landing');
              setTimeout(() => {
                document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-[#DE5737] transition-colors"
          >
            How it works
          </button>
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white border border-[#ECE4DB] shadow-sm hover:border-[#DE5737] transition-all"
              >
                {userProfile?.photoUrl ? (
                  <img 
                    src={userProfile.photoUrl} 
                    alt={displayName} 
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#DE5737] text-white font-bold text-xs flex items-center justify-center uppercase">
                    {initialLetter}
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-800 max-w-[110px] truncate hidden sm:inline">
                  {displayName}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <div className="flex items-center gap-2">
                      {userProfile?.photoUrl ? (
                        <img 
                          src={userProfile.photoUrl} 
                          alt={displayName} 
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#DE5737] text-white font-bold text-xs flex items-center justify-center uppercase">
                          {initialLetter}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {userProfile?.city && (
                      <p className="text-[10px] text-stone-400 mt-1.5">
                        📍 {capitalizeWords(userProfile.city)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] hover:text-[#DE5737] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard & Listings
                  </button>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF7F2] hover:text-[#DE5737] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#DE5737]" />
                    My Profile & Avatar
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="text-stone-800 hover:text-[#DE5737] font-semibold text-sm sm:text-[15px] px-3 py-2 transition-colors"
              >
                Log in
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-semibold text-sm sm:text-[15px] px-5 sm:px-6 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-all group"
              >
                <span>Join roomie</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
