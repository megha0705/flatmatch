import React, { useState, useEffect, useRef } from 'react';
import { MOCK_LISTINGS } from '../data/mockData';
import { 
  MapPin, Briefcase, Users, MessageSquare, SlidersHorizontal, FileText,
  Home, Plus, Search, Trash2, User, Building, Edit3, ArrowRight, X
} from 'lucide-react';
import HabitsTab from './HabitsTab';
import { getPreferences } from '../api/preferences';
import { searchListings, getMyListings, updateListingStatus, deleteListing, getLocalListings } from '../api/listings';
import CreateListingModal from './CreateListingModal';
import ListingDetailsModal from './ListingDetailsModal';
import EmailVerifiedBadge from './EmailVerifiedBadge';
import { 
  formatRoomType, 
  formatFurnishing, 
  formatGenderAllowed, 
  formatOccupation, 
  formatIndianPrice, 
  formatDate, 
  formatSpots, 
  formatFlatmates,
  capitalizeWords 
} from '../utils/formatters';

const DEFAULT_POPULAR_CITIES = [
  'All',
  'Kolkata',
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Chennai'
];

export default function UserHomePage({ 
  user, 
  userProfile, 
  onOpenProfile, 
  onOpenAuth,
  onRequestCreateListing,
  onLogout,
  initialTab = 'listings' 
}) {
  const [activeTab, setActiveTab] = useState(
    ['listings', 'my_listings', 'profile', 'habits'].includes(initialTab) ? initialTab : 'listings'
  );
  const [hasPreferences, setHasPreferences] = useState(true);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('roomie_habits_nudge_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let isMounted = true;
    const checkPreferencesStatus = async () => {
      try {
        const res = await getPreferences();
        if (!isMounted) return;
        setHasPreferences(Boolean(res.success && res.exists));
      } catch (e) {
        // Fallback: avoid annoying user if network issue
      }
    };
    checkPreferencesStatus();
    return () => {
      isMounted = false;
    };
  }, []);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Tab bar scrolling refs
  const tabBarRef = useRef(null);
  const activeTabRef = useRef(null);

  // Listings state
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Listings filter criteria
  const [searchCity, setSearchCity] = useState('All');
  const [cityInput, setCityInput] = useState('');
  const [searchLocality, setSearchLocality] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('ALL');
  const [filterFurnishing, setFilterFurnishing] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [maxRent, setMaxRent] = useState(40000);

  // Scroll active tab into view whenever it changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeTab]);

  // Fetch listings on mount or criteria change
  const fetchAllListings = async () => {
    setListingsLoading(true);
    try {
      const criteria = {
        city: searchCity !== 'All' ? searchCity : undefined,
        locality: searchLocality || undefined,
        maxRent,
        roomType: filterRoomType,
        furnishing: filterFurnishing,
        genderAllowed: filterGender,
      };
      const res = await searchListings(criteria);
      const apiContent = res.content || [];
      const localListings = getLocalListings();

      // Combine local, api, and mock data without duplicate IDs
      const combined = [...localListings, ...apiContent, ...MOCK_LISTINGS];
      const seen = new Set();
      const uniqueListings = combined.filter(l => {
        if (!l || !l.id || seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
      setListings(uniqueListings);
    } catch (e) {
      console.error('Error fetching listings:', e);
      setListings(MOCK_LISTINGS);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchMyOwnListings = async () => {
    try {
      const res = await getMyListings();
      const apiMine = res.content || [];
      const localMine = getLocalListings().filter(l => l.ownedByMe);
      const combined = [...localMine, ...apiMine];
      const seen = new Set();
      const uniqueMine = combined.filter(l => {
        if (!l || !l.id || seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
      setMyListings(uniqueMine);
    } catch (e) {
      console.warn('Could not load user listings:', e);
    }
  };

  useEffect(() => {
    fetchAllListings();
    fetchMyOwnListings();
  }, [searchCity, searchLocality, filterRoomType, filterFurnishing, filterGender, maxRent]);

  const handleListingCreated = (newListing) => {
    setMyListings(prev => [newListing, ...prev]);
    setListings(prev => [newListing, ...prev]);
    setActiveTab('my_listings');
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'RENTED' : 'ACTIVE';
    await updateListingStatus(listingId, nextStatus);
    setMyListings(prev => prev.map(l => l.id === listingId ? { ...l, status: nextStatus } : l));
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: nextStatus } : l));
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    await deleteListing(listingId);
    setMyListings(prev => prev.filter(l => l.id !== listingId));
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  // Filter listings client-side
  const displayedListings = listings.filter(l => {
    if (searchCity !== 'All' && l.city?.toLowerCase() !== searchCity.toLowerCase()) return false;
    if (searchLocality && !l.locality?.toLowerCase().includes(searchLocality.toLowerCase()) && !l.title?.toLowerCase().includes(searchLocality.toLowerCase())) return false;
    if (filterRoomType !== 'ALL' && l.roomType !== filterRoomType) return false;
    if (filterFurnishing !== 'ALL' && l.furnishing !== filterFurnishing) return false;
    if (filterGender !== 'ALL' && l.genderAllowed !== filterGender) return false;
    if (l.rentPerPerson && l.rentPerPerson > maxRent) return false;
    return true;
  });

  // Dynamic city list: default popular cities + logged-in user's city + listing cities (deduplicated)
  const availableCityChips = React.useMemo(() => {
    const set = new Map();
    // Default cities
    DEFAULT_POPULAR_CITIES.forEach(c => {
      set.set(c.toLowerCase(), c);
    });
    // Logged in user's city
    if (userProfile?.city) {
      const formatted = capitalizeWords(userProfile.city.trim());
      if (formatted) set.set(formatted.toLowerCase(), formatted);
    }
    // Listing cities
    listings.forEach(l => {
      if (l.city) {
        const formatted = capitalizeWords(l.city.trim());
        if (formatted) set.set(formatted.toLowerCase(), formatted);
      }
    });
    return Array.from(set.values());
  }, [userProfile?.city, listings]);

  // Derived user details for Welcome Header
  const fullName = userProfile?.name || user?.name || user?.email?.split('@')[0] || 'Friend';
  const firstName = fullName.trim().split(/\s+/)[0];
  const friendlyOccupation = formatOccupation(userProfile?.occupation || 'STUDENT');
  const org = userProfile?.organization?.trim();
  const formattedUserCity = capitalizeWords(userProfile?.city || 'Kolkata');

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      
      {/* ================= USER HOME HERO BANNER ================= */}
      <div className="bg-white border-b border-[#ECE4DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div 
                onClick={() => onOpenProfile && onOpenProfile('edit')}
                className="relative group cursor-pointer"
                title="Click to view or edit profile"
              >
                {userProfile?.photoUrl ? (
                  <img 
                    src={userProfile.photoUrl} 
                    alt={fullName} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shadow-md group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#DE5737] text-white font-extrabold text-2xl flex items-center justify-center shadow-md uppercase group-hover:scale-105 transition-transform">
                    {firstName[0] || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600 group-hover:text-[#DE5737] transition-colors">
                  <Edit3 className="w-3 h-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B17] flex items-center gap-2">
                    <span>Welcome home, {firstName}!</span>
                    <span className="inline-block whitespace-nowrap select-none">👋</span>
                  </h1>
                  <EmailVerifiedBadge />
                </div>

                {/* Subtitle with proper capitalization: "Student at FIEM · Kolkata" */}
                <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                  {friendlyOccupation}{org ? ` at ${org}` : ''} · {formattedUserCity}
                  {userProfile?.workLabel && (
                    <span className="text-stone-400 font-normal"> (Near {userProfile.workLabel})</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!userProfile && onOpenProfile) {
                    onOpenProfile('initial');
                  } else if (onRequestCreateListing) {
                    onRequestCreateListing();
                  } else {
                    setCreateModalOpen(true);
                  }
                }}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create a Listing</span>
              </button>

              <button
                onClick={() => onOpenProfile && onOpenProfile('edit')}
                className="bg-[#FAF7F2] hover:bg-stone-200 text-stone-800 font-semibold px-4 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-[#ECE4DB] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 bg-[#FAF7F2] border border-[#ECE4DB] rounded-2xl px-4 py-2 text-center">
                <span className="text-lg font-black text-[#DE5737]">{myListings.length}</span>
                <span className="text-xs font-medium text-stone-600">My Listings</span>
              </div>
            </div>

          </div>

          {/* ================= TAB BAR WITH HORIZONTAL SCROLL & EDGE FADE ================= */}
          <div className="relative mt-8 border-t border-stone-100 pt-4">
            {/* Left Edge Fade */}
            <div className="pointer-events-none absolute left-0 top-4 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 sm:hidden" />
            {/* Right Edge Fade */}
            <div className="pointer-events-none absolute right-0 top-4 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10" />

            <div 
              ref={tabBarRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-1 px-1"
            >
              {/* TAB 1: Explore Listings (API-backed) */}
              <button
                ref={activeTab === 'listings' ? activeTabRef : null}
                onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'listings'
                    ? 'bg-[#DE5737] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Explore Listings ({displayedListings.length})</span>
              </button>

              {/* TAB 2: My Listings (API-backed) */}
              <button
                ref={activeTab === 'my_listings' ? activeTabRef : null}
                onClick={() => setActiveTab('my_listings')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 relative ${
                  activeTab === 'my_listings'
                    ? 'bg-[#DE5737] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Listings</span>
                {myListings.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center">
                    {myListings.length}
                  </span>
                )}
              </button>

              {/* TAB 3: My Profile (API-backed) */}
              <button
                ref={activeTab === 'profile' ? activeTabRef : null}
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#DE5737] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>

              {/* TAB 4: My Habits & Budget (API-backed) */}
              <button
                ref={activeTab === 'habits' ? activeTabRef : null}
                onClick={() => setActiveTab('habits')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'habits'
                    ? 'bg-[#DE5737] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>My Habits & Budget</span>
              </button>

              {/* Divider between Active and Coming-Soon features */}
              <div className="h-6 w-px bg-stone-200 mx-1 shrink-0" />

              {/* Disabled Coming Soon Features (Honesty Rules: never look functional) */}
              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-stone-400 bg-stone-50 border border-dashed border-stone-200 cursor-not-allowed opacity-75 whitespace-nowrap shrink-0 select-none"
                title="Lifestyle-based flatmate matching will arrive in a future update"
              >
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>Flatmate Matches</span>
                <span className="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded font-bold">Coming soon</span>
              </button>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-stone-400 bg-stone-50 border border-dashed border-stone-200 cursor-not-allowed opacity-75 whitespace-nowrap shrink-0 select-none"
                title="Direct messaging is currently under development"
              >
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                <span>Chats & Inquiries</span>
                <span className="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded font-bold">Coming soon</span>
              </button>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-stone-400 bg-stone-50 border border-dashed border-stone-200 cursor-not-allowed opacity-75 whitespace-nowrap shrink-0 select-none"
                title="Standard housemate agreement download is coming soon"
              >
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Roommate Pact</span>
                <span className="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded font-bold">Coming soon</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* ================= MAIN TAB CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Profile Prompt (if user has no profile) */}
        {!userProfile && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Complete your profile setup
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-700">
                  Fill in your basic information and photo to post listings and connect with flatmates.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenProfile && onOpenProfile('initial')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-full text-xs shadow-sm whitespace-nowrap min-h-[44px]"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Dismissible Habits & Budget Nudge Card (below profile prompt if that shows too) */}
        {!hasPreferences && !nudgeDismissed && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#ECE4DB] shadow-sm flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Complete your habits & budget
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Set your routine, cleanliness standards, and budget to prepare for flatmate matching (coming soon).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('habits')}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-4 py-2 rounded-full text-xs shadow-sm transition-all min-h-[44px]"
              >
                Set Habits
              </button>
              <button
                type="button"
                onClick={() => {
                  setNudgeDismissed(true);
                  try { sessionStorage.setItem('roomie_habits_nudge_dismissed', 'true'); } catch {}
                }}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                title="Dismiss nudge"
                aria-label="Dismiss nudge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 1: EXPLORE & SEARCH LISTINGS ==================== */}
        {activeTab === 'listings' && (
          <div>
            {/* Filter Bar */}
            <div className="bg-white rounded-3xl p-5 mb-8 border border-[#ECE4DB] shadow-sm space-y-4">
              
              {/* Row 1: Dynamic City Pills & Custom City Input & Locality Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">City:</span>
                  {availableCityChips.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSearchCity(city);
                        setCityInput('');
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        searchCity.toLowerCase() === city.toLowerCase()
                          ? 'bg-[#DE5737] text-white shadow-sm'
                          : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}

                  {/* Inline Type-A-City Input */}
                  <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-stone-200 rounded-full px-3 py-1.5 text-xs focus-within:border-[#DE5737]">
                    <MapPin className="w-3.5 h-3.5 text-[#DE5737] shrink-0" />
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCityInput(val);
                        setSearchCity(val.trim() ? val.trim() : 'All');
                      }}
                      placeholder="Type any city..."
                      className="bg-transparent outline-none text-xs w-28 sm:w-36 text-stone-800 placeholder-stone-400"
                    />
                    {cityInput && (
                      <button
                        onClick={() => {
                          setCityInput('');
                          setSearchCity('All');
                        }}
                        className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchLocality}
                    onChange={(e) => setSearchLocality(e.target.value)}
                    placeholder="Search locality or landmark..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-stone-200 rounded-xl outline-none focus:border-[#DE5737]"
                  />
                </div>
              </div>

              {/* Row 2: Secondary Filters (Backend Enums with Friendly Labels) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Room Type */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Type:</span>
                    <select
                      value={filterRoomType}
                      onChange={(e) => setFilterRoomType(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">All types</option>
                      <option value="PRIVATE_ROOM">Private room</option>
                      <option value="SHARED_ROOM">Shared room</option>
                      <option value="ENTIRE_FLAT">Entire flat</option>
                    </select>
                  </div>

                  {/* Furnishing */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Furnishing:</span>
                    <select
                      value={filterFurnishing}
                      onChange={(e) => setFilterFurnishing(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">All furnishings</option>
                      <option value="FURNISHED">Furnished</option>
                      <option value="SEMI_FURNISHED">Semi-furnished</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                    </select>
                  </div>

                  {/* Gender Allowed */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Allowed:</span>
                    <select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">All genders</option>
                      <option value="ANY">Anyone</option>
                      <option value="MALE">Men only</option>
                      <option value="FEMALE">Women only</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-semibold">Max Rent:</span>
                  <span className="font-bold text-stone-900">{formatIndianPrice(maxRent)}/mo</span>
                  <input
                    type="range"
                    min={5000}
                    max={80000}
                    step={2500}
                    value={maxRent}
                    onChange={(e) => setMaxRent(Number(e.target.value))}
                    className="w-24 accent-[#DE5737] cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Listings Grid */}
            {listingsLoading ? (
              <div className="p-16 text-center text-stone-400">Loading listings...</div>
            ) : displayedListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#ECE4DB]">
                <Home className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No rooms or flats found matching your filters</h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Try clearing the locality search, broadening the city, or increasing the max rent budget.
                </p>
                <button
                  onClick={() => {
                    setSearchCity('All');
                    setCityInput('');
                    setSearchLocality('');
                    setFilterRoomType('ALL');
                    setFilterFurnishing('ALL');
                    setFilterGender('ALL');
                    setMaxRent(40000);
                  }}
                  className="text-xs font-bold text-[#DE5737] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedListings.map((listing) => {
                  const primaryPhoto = listing.photos && listing.photos.length > 0
                    ? listing.photos[0].url
                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-3xl overflow-hidden border border-[#ECE4DB] shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                      onClick={() => {
                        setSelectedListing(listing);
                        setDetailsModalOpen(true);
                      }}
                    >
                      {/* Photo Banner */}
                      <div className="relative h-56 bg-stone-100 overflow-hidden">
                        <img
                          src={primaryPhoto}
                          alt={listing.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Room Type Pill with Friendly Label */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-md text-[11px] font-bold text-stone-900 border border-white">
                          {formatRoomType(listing.roomType)}
                        </div>

                        {/* Price Tag Overlay with en-IN formatting and correct pluralisation */}
                        <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between">
                          <div>
                            <span className="text-xl font-extrabold tracking-tight">
                              {formatIndianPrice(listing.rentPerPerson)}
                            </span>
                            <span className="text-xs text-stone-200"> /month</span>
                          </div>
                          {listing.spotsAvailable && (
                            <span className="text-[11px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                              {formatSpots(listing.spotsAvailable)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Locality & Capitalized City */}
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#DE5737] shrink-0" />
                            <span className="truncate">{listing.locality}, {capitalizeWords(listing.city)}</span>
                          </div>

                          <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2 mb-3">
                            {listing.title}
                          </h3>

                          {/* Friendly Enum Badges */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                              {formatFurnishing(listing.furnishing)}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                              {formatGenderAllowed(listing.genderAllowed)}
                            </span>
                          </div>
                        </div>

                        {/* Card Action: View Details button only (Contact removed from card per Item 8) */}
                        <div className="pt-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedListing(listing);
                              setDetailsModalOpen(true);
                            }}
                            className="w-full py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-800 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: MY LISTINGS ==================== */}
        {activeTab === 'my_listings' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#211B17]">My Created Listings</h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Manage the rooms or apartments you have posted on roomie.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Listing</span>
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#ECE4DB]">
                <Home className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-800">You haven't posted any listings yet</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto mb-6">
                  Have a spare bedroom, 2BHK, or flatmate opening? Post it here and let verified flatmates reach out to you.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-3 rounded-full text-sm shadow-sm"
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE4DB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={listing.photos && listing.photos.length > 0 ? listing.photos[0].url : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            listing.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {listing.status || 'ACTIVE'}
                          </span>
                          <span className="text-xs text-stone-400">• {capitalizeWords(listing.city)}</span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900">{listing.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {formatIndianPrice(listing.rentPerPerson)}/mo • {formatSpots(listing.spotsAvailable)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleToggleStatus(listing.id, listing.status || 'ACTIVE')}
                        className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                      >
                        {listing.status === 'ACTIVE' ? 'Mark Rented' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setDetailsModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: MY PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE4DB] shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-stone-100">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {userProfile?.photoUrl ? (
                      <img 
                        src={userProfile.photoUrl} 
                        alt={fullName} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-stone-100 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#DE5737] text-white font-black text-4xl flex items-center justify-center shadow-lg uppercase">
                        {firstName[0] || 'U'}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#211B17]">
                        {fullName}
                      </h2>
                      <EmailVerifiedBadge />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-stone-500 flex-wrap">
                      {userProfile?.age && (
                        <span>{userProfile.age} years old</span>
                      )}
                      {userProfile?.gender && (
                        <span>• {userProfile.gender.replace('_', ' ')}</span>
                      )}
                      <span>• <strong className="text-stone-700">{formattedUserCity}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenProfile && onOpenProfile('edit')}
                  className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Photo</span>
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8 border-b border-stone-100">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#DE5737]" />
                    <span>Occupation</span>
                  </div>
                  <p className="text-sm font-extrabold text-stone-800">
                    {friendlyOccupation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                    <Building className="w-3.5 h-3.5 text-[#DE5737]" />
                    <span>Company / College</span>
                  </div>
                  <p className="text-sm font-extrabold text-stone-800 truncate">
                    {userProfile?.organization || 'Not specified'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#DE5737]" />
                    <span>Workplace / Campus Area</span>
                  </div>
                  <p className="text-sm font-extrabold text-stone-800 truncate">
                    {userProfile?.workLabel || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Bio & Lifestyle */}
              <div className="pt-8">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-3">
                  About Me & Lifestyle
                </h3>
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB] text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {userProfile?.bio ? (
                    <p className="whitespace-pre-line">{userProfile.bio}</p>
                  ) : (
                    <p className="text-stone-400 italic">No bio added yet. Click 'Edit Profile' to share your routine and habits with prospective flatmates!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: MY HABITS & BUDGET ==================== */}
        {activeTab === 'habits' && (
          <HabitsTab 
            onPreferencesUpdated={() => setHasPreferences(true)} 
            onRequireLogin={() => {
              if (onLogout) onLogout();
              if (onOpenAuth) onOpenAuth('login');
            }}
          />
        )}

      </div>

      {/* Modals */}
      <CreateListingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleListingCreated}
      />

      <ListingDetailsModal
        listing={selectedListing}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

    </div>
  );
}
