import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, Edit3, Plus, Sparkles, RefreshCw, AlertCircle, 
  Check, Calendar, DollarSign, Heart, ShieldAlert, Clock, 
  Home, Briefcase, Wine, Cigarette, Utensils, Users, Info, Lock, LogIn
} from 'lucide-react';
import { getPreferences } from '../api/preferences';
import HabitsPreferencesForm from './HabitsPreferencesForm';
import { 
  formatPreferenceLabel, 
  formatBudgetRange,
  CLEANLINESS_SCALE,
  NOISE_LEVEL_SCALE,
  ELIGIBLE_DEAL_BREAKERS
} from '../utils/preferencesConstants';
import { formatDate } from '../utils/formatters';

export default function HabitsTab({ onPreferencesUpdated, onRequireLogin }) {
  const [preferences, setPreferences] = useState(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchPreferencesData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPreferences();
      if (res.success && res.exists && res.preferences) {
        setPreferences(res.preferences);
        setExists(true);
      } else {
        // 404: Not filled yet
        setPreferences(null);
        setExists(false);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err.message || 'Could not load your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferencesData();
  }, []);

  const handleSaveSuccess = (savedData) => {
    setPreferences(savedData);
    setExists(true);
    setIsEditing(false);
    if (onPreferencesUpdated) {
      onPreferencesUpdated(savedData);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#FDF1EC] border-t-[#DE5737] animate-spin" />
        <p className="text-sm font-semibold text-stone-600">Loading your habits & budget...</p>
      </div>
    );
  }

  // 2. Authentication Error (401 / 403 / unauthenticated)
  const isAuthError = Boolean(
    error && (
      error.includes('401') ||
      error.includes('403') ||
      error.toLowerCase().includes('authentication') ||
      error.toLowerCase().includes('log in') ||
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('forbidden')
    )
  );

  if (error && isAuthError) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 text-center shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-stone-900">
              Authentication Required
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your login session has expired or your email is not verified yet. In compliance with security standards, only authenticated users can access habits and budget preferences.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 max-w-md mx-auto">
            {error}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onRequireLogin) {
                  onRequireLogin();
                } else {
                  window.location.reload();
                }
              }}
              className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-7 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In Again</span>
            </button>
            <button
              type="button"
              onClick={fetchPreferencesData}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 transition-all min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. General Error State with Retry
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Unable to load preferences</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchPreferencesData}
            className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Edit / Form View
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <HabitsPreferencesForm
          initialPreferences={preferences}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // 5. Empty State (404 Not Filled Yet)
  if (!exists || !preferences) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ECE4DB] text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center mx-auto shadow-sm">
            <SlidersHorizontal className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#211B17]">
              Set your habits & budget
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Tell us about your routine, cleanliness habits, dietary preferences, and monthly budget.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB] text-xs text-stone-600 max-w-md mx-auto flex items-start gap-3 text-left">
            <Sparkles className="w-4 h-4 text-[#DE5737] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800">Matching is coming soon!</span>
              <p className="mt-0.5 text-stone-500">
                Filling out your preferences now will ensure your profile is ready as soon as lifestyle-based flatmate matching launches.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-8 py-3 rounded-full text-sm inline-flex items-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Fill in my habits</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Existing Preferences Summary View
  const dealBreakersList = preferences.dealBreakers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Main Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE4DB] shadow-sm">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-[#211B17]">
                My Habits & Living Preferences
              </h2>
              <span className="text-[11px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2.5 py-0.5 rounded-full border border-[#F5C4B5]">
                Saved
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Your living style and expectations. Used for future lifestyle-based matching.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Habits & Budget</span>
          </button>
        </div>

        {/* Feature Coming Soon Notice (Honesty Rule) */}
        <div className="my-6 p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB] flex items-center gap-3 text-xs text-stone-600">
          <Info className="w-4 h-4 text-stone-400 shrink-0" />
          <span>
            <strong>Note:</strong> Automated flatmate matching based on habits and scores is coming soon. No mock scores or fake counts are shown.
          </span>
        </div>

        {/* Highlight Banner: Budget & Looking For */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Monthly Budget
            </span>
            <span className="text-base sm:text-lg font-black text-[#DE5737]">
              {formatBudgetRange(preferences.budgetMin, preferences.budgetMax)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Looking For
            </span>
            <span className="text-sm font-extrabold text-stone-800">
              {formatPreferenceLabel('lookingFor', preferences.lookingFor)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Ideal Move-in Date
            </span>
            <span className="text-sm font-extrabold text-stone-800">
              {preferences.moveInDate ? formatDate(preferences.moveInDate) : 'Flexible'}
            </span>
          </div>
        </div>

        {/* Routine & Scale Grid */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
            Routine & Living Standards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Sleep Schedule */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white relative">
              {dealBreakersList.includes('sleepSchedule') && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2 py-0.5 rounded-full border border-[#F5C4B5] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Must-have</span>
                </span>
              )}
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Sleep Schedule
              </div>
              <div className="text-sm font-extrabold text-stone-800">
                {formatPreferenceLabel('sleepSchedule', preferences.sleepSchedule)}
              </div>
            </div>

            {/* Cleanliness */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white relative">
              {dealBreakersList.includes('cleanliness') && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2 py-0.5 rounded-full border border-[#F5C4B5] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Must-have</span>
                </span>
              )}
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Cleanliness (1-5)
              </div>
              <div className="text-sm font-extrabold text-stone-800">
                {formatPreferenceLabel('cleanliness', preferences.cleanliness)}
              </div>
            </div>

            {/* Noise Level */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white relative">
              {dealBreakersList.includes('noiseLevel') && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2 py-0.5 rounded-full border border-[#F5C4B5] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Must-have</span>
                </span>
              )}
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                Noise Tolerance (1-5)
              </div>
              <div className="text-sm font-extrabold text-stone-800">
                {formatPreferenceLabel('noiseLevel', preferences.noiseLevel)}
              </div>
            </div>

          </div>
        </div>

        {/* Lifestyle Grid */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
            Lifestyle Habits
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            
            {/* Diet */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2]/40 relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Diet</span>
              <span className="text-xs font-bold text-stone-800 block">
                {formatPreferenceLabel('diet', preferences.diet)}
              </span>
              {dealBreakersList.includes('diet') && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#DE5737] bg-[#FDF1EC] px-1.5 py-0.2 rounded border border-[#F5C4B5]">
                  Must-have
                </span>
              )}
            </div>

            {/* Smoking */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2]/40 relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Smoking</span>
              <span className="text-xs font-bold text-stone-800 block">
                {formatPreferenceLabel('smoking', preferences.smoking)}
              </span>
              {dealBreakersList.includes('smoking') && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#DE5737] bg-[#FDF1EC] px-1.5 py-0.2 rounded border border-[#F5C4B5]">
                  Must-have
                </span>
              )}
            </div>

            {/* Drinking */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2]/40 relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Drinking</span>
              <span className="text-xs font-bold text-stone-800 block">
                {formatPreferenceLabel('drinking', preferences.drinking)}
              </span>
              {dealBreakersList.includes('drinking') && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#DE5737] bg-[#FDF1EC] px-1.5 py-0.2 rounded border border-[#F5C4B5]">
                  Must-have
                </span>
              )}
            </div>

            {/* Guests */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2]/40 relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Guests</span>
              <span className="text-xs font-bold text-stone-800 block">
                {formatPreferenceLabel('guests', preferences.guests)}
              </span>
              {dealBreakersList.includes('guests') && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#DE5737] bg-[#FDF1EC] px-1.5 py-0.2 rounded border border-[#F5C4B5]">
                  Must-have
                </span>
              )}
            </div>

            {/* Work Mode */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2]/40 relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Work Mode</span>
              <span className="text-xs font-bold text-stone-800 block">
                {formatPreferenceLabel('workMode', preferences.workMode)}
              </span>
              {dealBreakersList.includes('workMode') && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#DE5737] bg-[#FDF1EC] px-1.5 py-0.2 rounded border border-[#F5C4B5]">
                  Must-have
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Roommate Gender Preference */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>
            Preferred Flatmate Gender: <strong className="text-stone-800">{formatPreferenceLabel('genderPreference', preferences.genderPreference || 'ANY')}</strong>
          </span>
          <span className="text-stone-400 text-[11px]">
            {dealBreakersList.length} deal-breaker{dealBreakersList.length === 1 ? '' : 's'} configured
          </span>
        </div>

      </div>

    </div>
  );
}
