import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturedFlatmates from './components/FeaturedFlatmates';
import UserHomePage from './components/UserHomePage';
import AuthModal from './components/AuthModal';
import PostAuthPromptModal from './components/PostAuthPromptModal';
import CreateListingModal from './components/CreateListingModal';
import ProfileModal from './components/ProfileModal';
import Footer from './components/Footer';
import { getCurrentUser, removeCurrentUser, removeToken, checkBackendHealth } from './api/auth';
import { getProfile, getCachedProfile, clearCachedProfile } from './api/profile';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [userProfile, setUserProfile] = useState(getCachedProfile());
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedCity, setSelectedCity] = useState('All');
  const [backendOnline, setBackendOnline] = useState(false);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState('initial'); // 'initial' | 'edit'

  // Post-auth / post-profile prompt modal state
  const [showPostAuthPrompt, setShowPostAuthPrompt] = useState(false);
  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);

  // Check backend connectivity on mount
  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // When user is authenticated, verify if their profile exists on the backend
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    let isMounted = true;
    const verifyProfile = async () => {
      try {
        const res = await getProfile();
        if (!isMounted) return;

        if (res.success && res.exists && res.profile) {
          setUserProfile(res.profile);
        } else if (res.success && !res.exists) {
          // User is logged in but has not created a profile yet!
          // Force mandatory profile creation
          setUserProfile(null);
          setProfileModalMode('initial');
          setProfileModalOpen(true);
        }
      } catch (err) {
        console.warn('Could not verify profile on load:', err);
      }
    };

    verifyProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (authenticatedUser) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);

    // Check if the authenticated user already has a profile
    try {
      const res = await getProfile();
      if (res.success && res.exists && res.profile) {
        setUserProfile(res.profile);
        setCurrentView('dashboard');
        // If profile exists, show the choice whether to create a listing or browse
        setShowPostAuthPrompt(true);
      } else {
        // User has NOT created a profile yet -> MUST create profile first
        setUserProfile(null);
        setCurrentView('dashboard');
        setProfileModalMode('initial');
        setProfileModalOpen(true);
      }
    } catch (e) {
      // In case of error/uncreated profile, open profile setup modal
      setUserProfile(null);
      setCurrentView('dashboard');
      setProfileModalMode('initial');
      setProfileModalOpen(true);
    }
  };

  const handleProfileSaved = (savedProfile) => {
    setUserProfile(savedProfile);
    setProfileModalOpen(false);
    setCurrentView('dashboard');

    // "when user logs in if they have not created their profile they must create a profile with all the details and everything. after that they can do the listing or not."
    if (profileModalMode === 'initial') {
      setShowPostAuthPrompt(true);
    }
  };

  const handleRequestCreateListing = () => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    if (!userProfile) {
      // Must create profile first
      setProfileModalMode('initial');
      setProfileModalOpen(true);
      return;
    }
    setCreateListingModalOpen(true);
  };

  const handleLogout = () => {
    removeToken();
    removeCurrentUser();
    clearCachedProfile();
    setUser(null);
    setUserProfile(null);
    setProfileModalOpen(false);
    setShowPostAuthPrompt(false);
    setCurrentView('landing');
  };

  const handleSearchCity = (city) => {
    setSelectedCity(city);
    if (user) {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#211B17]">
      {/* Top Navigation */}
      <Navbar
        user={user}
        userProfile={userProfile}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={(mode = 'edit') => {
          setProfileModalMode(mode);
          setProfileModalOpen(true);
        }}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' && user ? (
          <UserHomePage 
            user={user} 
            userProfile={userProfile}
            onOpenProfile={(mode = 'edit') => {
              setProfileModalMode(mode);
              setProfileModalOpen(true);
            }}
            onOpenAuth={handleOpenAuth}
            onRequestCreateListing={handleRequestCreateListing}
            onLogout={handleLogout} 
          />
        ) : (
          <>
            {/* Hero Section matching the user's reference picture */}
            <HeroSection
              onSearchCity={handleSearchCity}
              onOpenAuth={handleOpenAuth}
            />

            {/* How It Works Section */}
            <HowItWorksSection
              onStartQuiz={() => {
                if (!user) {
                  handleOpenAuth('signup');
                } else if (!userProfile) {
                  setProfileModalMode('initial');
                  setProfileModalOpen(true);
                } else {
                  setCurrentView('dashboard');
                }
              }}
            />

            {/* Featured & Filterable Flatmates */}
            <FeaturedFlatmates
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              onConnect={(flatmate) => {
                if (!user) {
                  handleOpenAuth('signup');
                } else if (!userProfile) {
                  setProfileModalMode('initial');
                  setProfileModalOpen(true);
                } else {
                  setCurrentView('dashboard');
                }
              }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Auth Modal (Login / Signup / OTP) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Profile Modal (Initial Setup or Edit Profile) */}
      <ProfileModal
        isOpen={profileModalOpen}
        mode={profileModalMode}
        initialProfile={userProfile}
        userEmail={user?.email || ''}
        onClose={() => setProfileModalOpen(false)}
        onProfileSaved={handleProfileSaved}
      />

      {/* Post-Auth / Post-Profile Choice Modal (Can do listing or browse) */}
      <PostAuthPromptModal
        isOpen={showPostAuthPrompt}
        userName={userProfile?.name || user?.name || user?.email?.split('@')[0]}
        badge={profileModalMode === 'initial' ? 'Profile Setup Complete 🎉' : 'Welcome to roomie'}
        title={profileModalMode === 'initial' ? `Profile Ready, ${userProfile?.name || 'Friend'}!` : undefined}
        subtitle={
          profileModalMode === 'initial'
            ? 'Your profile is now live. Would you like to list a room/flat or start exploring flatmates?'
            : undefined
        }
        onClose={() => setShowPostAuthPrompt(false)}
        onCreateListing={() => {
          setShowPostAuthPrompt(false);
          if (!userProfile) {
            setProfileModalMode('initial');
            setProfileModalOpen(true);
          } else {
            setCreateListingModalOpen(true);
          }
        }}
        onBrowseListings={() => {
          setShowPostAuthPrompt(false);
          setCurrentView('dashboard');
        }}
      />

      {/* Standalone Create Listing Modal */}
      <CreateListingModal
        isOpen={createListingModalOpen}
        onClose={() => setCreateListingModalOpen(false)}
        onCreated={(newListing) => {
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}
