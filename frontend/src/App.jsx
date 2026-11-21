import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturedFlatmates from './components/FeaturedFlatmates';
import UserHomePage from './components/UserHomePage';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { getCurrentUser, removeCurrentUser, removeToken, checkBackendHealth } from './api/auth';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedCity, setSelectedCity] = useState('All');
  const [backendOnline, setBackendOnline] = useState(false);

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

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    removeToken();
    removeCurrentUser();
    setUser(null);
    setCurrentView('landing');
  };

  const handleSearchCity = (city) => {
    setSelectedCity(city);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#211B17]">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' && user ? (
          <UserHomePage user={user} onLogout={handleLogout} />
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
    </div>
  );
}
