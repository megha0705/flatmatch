import React, { useState, useEffect } from 'react';
import { MOCK_FLATMATES, MOCK_LISTINGS } from '../data/mockData';
import { 
  Sparkles, MapPin, Briefcase, Moon, Sun, Heart, Send, Check, 
  Settings, Users, MessageSquare, Shield, SlidersHorizontal, FileText,
  Clock, Coffee, Home, UserCheck, CheckCircle2, ChevronRight, Plus,
  Search, Eye, Trash2, Filter, Image as ImageIcon, AlertCircle, RefreshCw
} from 'lucide-react';
import { searchListings, getMyListings, updateListingStatus, deleteListing, getLocalListings } from '../api/listings';
import CreateListingModal from './CreateListingModal';
import ListingDetailsModal from './ListingDetailsModal';

export default function UserHomePage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'my_listings' | 'matches' | 'preferences' | 'chats' | 'agreement'
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Listings state
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Listings filter criteria
  const [searchCity, setSearchCity] = useState('All');
  const [searchLocality, setSearchLocality] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('ALL');
  const [filterFurnishing, setFilterFurnishing] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [maxRent, setMaxRent] = useState(40000);

  // Flatmates filter
  const [dietFilter, setDietFilter] = useState('ALL');
  const [connections, setConnections] = useState([
    {
      ...MOCK_FLATMATES[0],
      lastMessage: "Hey! Loved your profile. Are you free to visit the flat this Saturday?",
      time: "2h ago"
    }
  ]);
  const [activeChat, setActiveChat] = useState(MOCK_FLATMATES[0]);
  const [messages, setMessages] = useState([
    { sender: 'other', text: "Hey there! I saw you're also looking for a place in Indiranagar. Would love to connect!" },
    { sender: 'user', text: "Hi Ananya! Yes, exactly. I saw your bio and our routines align so well (early riser here too)." },
    { sender: 'other', text: "That's awesome! Are you free to visit the flat this Saturday?" }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // User preferences state (editable)
  const [userPrefs, setUserPrefs] = useState({
    name: user?.name || 'Alex Morgan',
    city: 'Bangalore',
    lookingFor: 'FLATMATES',
    budgetMin: 18000,
    budgetMax: 28000,
    sleepSchedule: 'EARLY_BIRD',
    cleanliness: 5,
    diet: 'VEGETARIAN',
    smoking: 'NEVER',
    drinking: 'OCCASIONALLY',
    workMode: 'HYBRID',
    bio: 'Software engineer who loves a calm, clean aesthetic, weekend farmers markets, and great coffee.'
  });
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch listings on mount or criteria change
  const fetchAllListings = async () => {
    setListingsLoading(true);
    try {
      const criteria = {
        city: searchCity,
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

  const handleContactHost = (listing) => {
    const hostUser = {
      id: listing.owner?.id || 'host_' + listing.id,
      name: listing.owner?.name || 'Listing Host',
      photoUrl: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : MOCK_FLATMATES[0].photoUrl,
      occupation: 'Host',
      city: listing.city,
      matchScore: 95
    };
    if (!connections.some(c => c.id === hostUser.id)) {
      setConnections(prev => [
        {
          ...hostUser,
          lastMessage: `Inquired about "${listing.title}"`,
          time: 'Just now'
        },
        ...prev
      ]);
    }
    setActiveChat(hostUser);
    setActiveTab('chats');
  };

  // Filter listings client-side for ultra-responsive feel
  const displayedListings = listings.filter(l => {
    if (searchCity !== 'All' && l.city?.toLowerCase() !== searchCity.toLowerCase()) return false;
    if (searchLocality && !l.locality?.toLowerCase().includes(searchLocality.toLowerCase()) && !l.title?.toLowerCase().includes(searchLocality.toLowerCase())) return false;
    if (filterRoomType !== 'ALL' && l.roomType !== filterRoomType) return false;
    if (filterFurnishing !== 'ALL' && l.furnishing !== filterFurnishing) return false;
    if (filterGender !== 'ALL' && l.genderAllowed !== filterGender) return false;
    if (l.rentPerPerson && l.rentPerPerson > maxRent) return false;
    return true;
  });

  const filteredMatches = MOCK_FLATMATES.filter((f) => {
    if (searchCity !== 'All' && f.city.toLowerCase() !== searchCity.toLowerCase()) return false;
    if (dietFilter !== 'ALL' && f.diet !== dietFilter) return false;
    return true;
  });

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: newMessage.trim() }]);
    setNewMessage('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'other', text: "Thanks for reaching out! When would you like to schedule a visit or quick call?" }
      ]);
    }, 1200);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaveStatus('Preferences saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      
      {/* User Home Top Hero Banner */}
      <div className="bg-white border-b border-[#ECE4DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#DE5737] text-white font-extrabold text-2xl flex items-center justify-center shadow-md uppercase">
                {userPrefs.name ? userPrefs.name[0] : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B17]">
                    Welcome home, {userPrefs.name}! 👋
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Searching in <span className="font-semibold text-stone-800">{userPrefs.city}</span> • Budget ₹{userPrefs.budgetMin.toLocaleString()} - ₹{userPrefs.budgetMax.toLocaleString()}/mo
                </p>
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create a Listing</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 bg-[#FAF7F2] border border-[#ECE4DB] rounded-2xl px-4 py-2 text-center">
                <span className="text-lg font-black text-[#DE5737]">{myListings.length}</span>
                <span className="text-xs font-medium text-stone-600">My Listings</span>
              </div>
            </div>

          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-8 border-t border-stone-100 pt-4 overflow-x-auto scrollbar-none">
            
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Explore Listings ({displayedListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my_listings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
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

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Flatmate Matches</span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'chats'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chats & Inquiries</span>
              {connections.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-extrabold text-[10px] flex items-center justify-center">
                  {connections.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>My Habits & Budget</span>
            </button>

            <button
              onClick={() => setActiveTab('agreement')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'agreement'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Roommate Pact</span>
            </button>

          </div>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ==================== TAB 1: EXPLORE & SEARCH LISTINGS ==================== */}
        {activeTab === 'listings' && (
          <div>
            {/* Filter Bar */}
            <div className="bg-white rounded-3xl p-5 mb-8 border border-[#ECE4DB] shadow-sm space-y-4">
              
              {/* Row 1: City Pills & Keyword search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">City:</span>
                  {['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSearchCity(city)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        searchCity === city
                          ? 'bg-[#DE5737] text-white shadow-sm'
                          : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
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

              {/* Row 2: Secondary Filters (Room type, Furnishing, Gender, Rent) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Type:</span>
                    <select
                      value={filterRoomType}
                      onChange={(e) => setFilterRoomType(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">All Types</option>
                      <option value="SINGLE">Private Room</option>
                      <option value="SHARED">Shared Room</option>
                      <option value="ENTIRE_FLAT">Entire Flat</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Furnishing:</span>
                    <select
                      value={filterFurnishing}
                      onChange={(e) => setFilterFurnishing(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">All Furnishings</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-semibold">Gender:</span>
                    <select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1 font-medium outline-none"
                    >
                      <option value="ALL">Any Gender</option>
                      <option value="FEMALE_ONLY">Female Only</option>
                      <option value="MALE_ONLY">Male Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-semibold">Max Rent:</span>
                  <span className="font-bold text-stone-900">₹{maxRent.toLocaleString()}/mo</span>
                  <input
                    type="range"
                    min={10000}
                    max={60000}
                    step={2000}
                    value={maxRent}
                    onChange={(e) => setMaxRent(Number(e.target.value))}
                    className="w-24 accent-[#DE5737] cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Listings Grid */}
            {displayedListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#ECE4DB] p-8">
                <Home className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No listings match your search</h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">Try relaxing the rent slider or search another city.</p>
                <button
                  onClick={() => {
                    setSearchCity('All');
                    setSearchLocality('');
                    setFilterRoomType('ALL');
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
                      className="bg-white rounded-3xl overflow-hidden border border-[#ECE4DB] shadow-sm hover:shadow-xl transition-all flex flex-col group"
                    >
                      {/* Photo Banner */}
                      <div className="relative h-56 bg-stone-100 overflow-hidden">
                        <img
                          src={primaryPhoto}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Room Type Pill */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-md text-[11px] font-bold text-stone-900 border border-white uppercase">
                          {listing.roomType?.replace('_', ' ')}
                        </div>

                        {/* Price Tag Overlay */}
                        <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between">
                          <div>
                            <span className="text-xl font-extrabold tracking-tight">
                              ₹{listing.rentPerPerson?.toLocaleString()}
                            </span>
                            <span className="text-xs text-stone-200"> /month</span>
                          </div>
                          {listing.spotsAvailable && (
                            <span className="text-[11px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                              {listing.spotsAvailable} spot(s) open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Locality & Landmark */}
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#DE5737] shrink-0" />
                            <span className="truncate">{listing.locality}, {listing.city}</span>
                          </div>

                          <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2 mb-3">
                            {listing.title}
                          </h3>

                          {/* Amenities previews */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {listing.amenities && listing.amenities.slice(0, 3).map((a, i) => (
                              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                                {a}
                              </span>
                            ))}
                            {listing.amenities && listing.amenities.length > 3 && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">
                                +{listing.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setDetailsModalOpen(true);
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-xs font-bold text-stone-800 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleContactHost(listing)}
                            className="flex-1 py-2.5 rounded-xl bg-[#DE5737] hover:bg-[#CA4929] text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Contact</span>
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
                          <span className="text-xs text-stone-400">• {listing.city}</span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900">{listing.title}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          ₹{listing.rentPerPerson?.toLocaleString()}/mo • {listing.spotsAvailable || 1} spot(s) left
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

        {/* ==================== TAB 3: FLATMATES MATCHES ==================== */}
        {activeTab === 'matches' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMatches.map((flatmate) => (
                <div
                  key={flatmate.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#ECE4DB] shadow-sm hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="relative h-60 bg-stone-100">
                    <img
                      src={flatmate.photoUrl}
                      alt={flatmate.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{flatmate.matchScore}% Compatibility</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold tracking-tight">
                        {flatmate.name}, {flatmate.age}
                      </h3>
                      <p className="text-xs text-stone-200">
                        {flatmate.occupation} @ {flatmate.organization}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs">
                        <span className="flex items-center gap-1 text-stone-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#DE5737]" />
                          {flatmate.area}, {flatmate.city}
                        </span>
                        <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
                          ₹{flatmate.budgetMin.toLocaleString()} - ₹{flatmate.budgetMax.toLocaleString()}/mo
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                        "{flatmate.bio}"
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {flatmate.tags.map((tag) => (
                          <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-stone-700 border border-[#ECE4DB]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleContactHost({
                        id: flatmate.id,
                        title: `${flatmate.name}'s Search`,
                        city: flatmate.city,
                        owner: { id: flatmate.id, name: flatmate.name, verified: true }
                      })}
                      className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Wave & Message 👋</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CHATS & MESSAGES ==================== */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-3xl border border-[#ECE4DB] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
            {/* Left Connections List */}
            <div className="md:col-span-4 border-r border-[#ECE4DB] p-4 flex flex-col">
              <h3 className="text-sm font-black text-stone-900 mb-3 px-2">Conversations</h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {connections.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                      activeChat?.id === c.id ? 'bg-[#FAF7F2] border border-[#DE5737]/30' : 'hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={c.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">{c.name}</span>
                        <span className="text-[10px] text-stone-400">{c.time || 'now'}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Active Chat Box */}
            <div className="md:col-span-8 flex flex-col h-[550px]">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-3">
                  <img
                    src={activeChat.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{activeChat.name}</h4>
                    <p className="text-[11px] text-stone-500">
                      {activeChat.city || 'Bangalore'} • Verified Member
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Now
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                        m.sender === 'user'
                          ? 'bg-[#DE5737] text-white rounded-br-none'
                          : 'bg-white text-stone-800 border border-stone-200/70 shadow-sm rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeChat.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-full border border-stone-200 text-xs sm:text-sm focus:border-[#DE5737] outline-none"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-[#DE5737] hover:bg-[#CA4929] text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: HABITS & PREFERENCES ==================== */}
        {activeTab === 'preferences' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE4DB] shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#211B17]">Your Lifestyle & Living Preferences</h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Our algorithm matches you based on these exact values to prevent roommate conflicts.
              </p>
            </div>

            {saveStatus && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveStatus}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userPrefs.name}
                    onChange={(e) => setUserPrefs({ ...userPrefs, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Target City
                  </label>
                  <select
                    value={userPrefs.city}
                    onChange={(e) => setUserPrefs({ ...userPrefs, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Min Monthly Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={userPrefs.budgetMin}
                    onChange={(e) => setUserPrefs({ ...userPrefs, budgetMin: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Max Monthly Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={userPrefs.budgetMax}
                    onChange={(e) => setUserPrefs({ ...userPrefs, budgetMax: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Sleep Schedule
                  </label>
                  <select
                    value={userPrefs.sleepSchedule}
                    onChange={(e) => setUserPrefs({ ...userPrefs, sleepSchedule: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  >
                    <option value="EARLY_BIRD">🌅 Early Bird (Sleep before 11 PM)</option>
                    <option value="NIGHT_OWL">🦉 Night Owl (Active past midnight)</option>
                    <option value="FLEXIBLE">⚖️ Flexible / Varies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Cleanliness Standard (1 to 5)
                  </label>
                  <select
                    value={userPrefs.cleanliness}
                    onChange={(e) => setUserPrefs({ ...userPrefs, cleanliness: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  >
                    <option value={5}>5 - Spotless & tidy every single day</option>
                    <option value={4}>4 - Neat, cleaned dishes every night</option>
                    <option value={3}>3 - Balanced, weekend cleanup</option>
                    <option value={2}>2 - Relaxed about clutter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  About You & What You're Looking For
                </label>
                <textarea
                  rows={3}
                  value={userPrefs.bio}
                  onChange={(e) => setUserPrefs({ ...userPrefs, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition-all"
              >
                Save Living Preferences
              </button>
            </form>
          </div>
        )}

        {/* ==================== TAB 6: ROOMMATE PACT ==================== */}
        {activeTab === 'agreement' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE4DB] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#211B17]">Roomie Housemate Agreement</h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Prevent misunderstandings before move-in with our standard fair-share housemate pact.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-700 bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200">
              <div className="pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">1. Rent & Utility Splitting</h4>
                <p>Rent is due on the 1st of each month. Wi-Fi, electricity, LPG, and drinking water are split equally via UPI.</p>
              </div>
              <div className="pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">2. Quiet Hours & Work From Home</h4>
                <p>Quiet hours observed between 11:00 PM and 7:00 AM on weekdays. Work calls in common areas require headphones.</p>
              </div>
              <div className="pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">3. Kitchen & Cleaning Standards</h4>
                <p>Dishes must never remain in the sink overnight. Cookware wiped down immediately after cooking.</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-1">4. Overnight Guests Policy</h4>
                <p>Overnight guests require 24-hour advance notification in the group chat and are limited to weekend visits.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500">
                Generated for <strong className="text-stone-800">{userPrefs.name}</strong> • Valid in India
              </span>
              <button
                onClick={() => alert('Agreement downloaded as PDF!')}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-all"
              >
                Download Signed Agreement PDF
              </button>
            </div>
          </div>
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
        onContact={handleContactHost}
      />

    </div>
  );
}
