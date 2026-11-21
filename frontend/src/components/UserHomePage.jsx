import React, { useState } from 'react';
import { MOCK_FLATMATES } from '../data/mockData';
import { 
  Sparkles, MapPin, Briefcase, Moon, Sun, Heart, Send, Check, 
  Settings, Users, MessageSquare, Shield, SlidersHorizontal, FileText,
  Clock, Coffee, Home, UserCheck, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function UserHomePage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'preferences' | 'chats' | 'agreement'
  const [searchCity, setSearchCity] = useState('All');
  const [maxBudget, setMaxBudget] = useState(35000);
  const [dietFilter, setDietFilter] = useState('ALL');
  const [savedIds, setSavedIds] = useState(['f1']);
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

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: newMessage.trim() }]);
    setNewMessage('');
    // Auto simulated reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'other', text: "Sounds good to me! Let's schedule a call tomorrow evening to plan the visit." }
      ]);
    }, 1200);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaveStatus('Preferences saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const filteredMatches = MOCK_FLATMATES.filter((f) => {
    if (searchCity !== 'All' && f.city.toLowerCase() !== searchCity.toLowerCase()) return false;
    if (dietFilter !== 'ALL' && f.diet !== dietFilter) return false;
    if (f.budgetMin > maxBudget) return false;
    return true;
  });

  const toggleConnect = (flatmate) => {
    if (!connections.some((c) => c.id === flatmate.id)) {
      setConnections((prev) => [
        ...prev,
        {
          ...flatmate,
          lastMessage: "You waved to each other! Start the conversation.",
          time: "Just now"
        }
      ]);
      setActiveChat(flatmate);
      setActiveTab('chats');
    } else {
      setActiveChat(flatmate);
      setActiveTab('chats');
    }
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

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
              <div className="bg-[#FAF7F2] border border-[#ECE4DB] rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
                <span className="block text-lg font-black text-[#DE5737]">98%</span>
                <span className="text-[11px] font-medium text-stone-500">Top Match</span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#ECE4DB] rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
                <span className="block text-lg font-black text-stone-900">{filteredMatches.length}</span>
                <span className="text-[11px] font-medium text-stone-500">Active Fits</span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#ECE4DB] rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
                <span className="block text-lg font-black text-emerald-600">{connections.length}</span>
                <span className="text-[11px] font-medium text-stone-500">Connected</span>
              </div>
            </div>

          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-8 border-t border-stone-100 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Recommended Matches</span>
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
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'chats'
                  ? 'bg-[#DE5737] text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chats & Connections</span>
              {connections.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-extrabold text-[10px] flex items-center justify-center">
                  {connections.length}
                </span>
              )}
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
              <span>Roommate Pact Generator</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* TAB 1: MATCHES */}
        {activeTab === 'matches' && (
          <div>
            {/* Filter Controls Bar */}
            <div className="bg-white rounded-3xl p-5 mb-8 border border-[#ECE4DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">City:</span>
                {['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSearchCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      searchCity === city
                        ? 'bg-stone-900 text-white'
                        : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Diet:</span>
                  <select
                    value={dietFilter}
                    onChange={(e) => setDietFilter(e.target.value)}
                    className="text-xs bg-[#FAF7F2] border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-[#DE5737]"
                  >
                    <option value="ALL">All Diets</option>
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="NON_VEGETARIAN">Non-Veg</option>
                    <option value="EGGETARIAN">Eggetarian</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matches Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMatches.map((flatmate) => {
                const isConnected = connections.some((c) => c.id === flatmate.id);

                return (
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
                        onClick={() => toggleConnect(flatmate)}
                        className={`w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isConnected
                            ? 'bg-[#FDF1EC] text-[#DE5737] border border-[#DE5737]/30'
                            : 'bg-[#DE5737] hover:bg-[#CA4929] text-white shadow-sm'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Open Conversation</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Wave & Match 👋</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MY HABITS & PREFERENCES */}
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

              {/* Budget Sliders */}
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

              {/* Sleep Routine & Cleanliness */}
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

              {/* Diet & Work Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Diet Preference
                  </label>
                  <select
                    value={userPrefs.diet}
                    onChange={(e) => setUserPrefs({ ...userPrefs, diet: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  >
                    <option value="VEGETARIAN">Vegetarian only</option>
                    <option value="EGGETARIAN">Eggetarian</option>
                    <option value="NON_VEGETARIAN">Non-Vegetarian friendly</option>
                    <option value="VEGAN">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={userPrefs.workMode}
                    onChange={(e) => setUserPrefs({ ...userPrefs, workMode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                  >
                    <option value="HYBRID">Hybrid (Mix of office & home)</option>
                    <option value="REMOTE">Fully Remote / WFH</option>
                    <option value="IN_OFFICE">In-Office Daily</option>
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

        {/* TAB 3: CHATS & CONNECTIONS */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-3xl border border-[#ECE4DB] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
            {/* Left Connections List */}
            <div className="md:col-span-4 border-r border-[#ECE4DB] p-4 flex flex-col">
              <h3 className="text-sm font-black text-stone-900 mb-3 px-2">Connected Flatmates</h3>
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
                      src={c.photoUrl}
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
              {/* Chat Header */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-3">
                  <img
                    src={activeChat.photoUrl}
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{activeChat.name}</h4>
                    <p className="text-[11px] text-stone-500">
                      {activeChat.occupation} • {activeChat.city} ({activeChat.matchScore}% Match)
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Now
                </span>
              </div>

              {/* Chat Message List */}
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

              {/* Chat Input Bar */}
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

        {/* TAB 4: ROOMMATE AGREEMENT PACT */}
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
                <p>Rent is due on the 1st of each month. Wi-Fi, electricity, LPG, and drinking water water-can costs are split equally (50/50) via UPI.</p>
              </div>

              <div className="pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">2. Quiet Hours & Work From Home</h4>
                <p>Quiet hours strictly observed between 11:00 PM and 7:00 AM on weekdays. Work calls in common areas use headphones.</p>
              </div>

              <div className="pb-3 border-b border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">3. Kitchen & Cleaning Standards</h4>
                <p>Dishes must never remain in the sink overnight. Cookware and counters are wiped down immediately after cooking.</p>
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
    </div>
  );
}
