import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertCircle, ArrowLeft, ArrowRight, Sparkles, 
  Clock, Coffee, Utensils, Cigarette, Wine, Users, Briefcase, 
  DollarSign, ShieldAlert, Heart, Calendar, HelpCircle, Loader2
} from 'lucide-react';
import { savePreferences } from '../api/preferences';
import { 
  LOOKING_FOR_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  CLEANLINESS_SCALE,
  NOISE_LEVEL_SCALE,
  DIET_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  GUESTS_OPTIONS,
  WORK_MODE_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  ELIGIBLE_DEAL_BREAKERS,
  formatPreferenceLabel,
  formatBudgetRange
} from '../utils/preferencesConstants';
import { formatIndianPrice, formatDate } from '../utils/formatters';

const STEPS = [
  { id: 1, label: 'Looking For' },
  { id: 2, label: 'Routine' },
  { id: 3, label: 'Lifestyle' },
  { id: 4, label: 'Budget & Gender' },
  { id: 5, label: 'Review' },
];

export default function HabitsPreferencesForm({
  initialPreferences = null,
  onSaveSuccess,
  onCancel,
}) {
  // Form fields
  const [lookingFor, setLookingFor] = useState(initialPreferences?.lookingFor || 'NEED_ROOM');
  const [moveInDate, setMoveInDate] = useState(initialPreferences?.moveInDate || '');
  
  const [sleepSchedule, setSleepSchedule] = useState(initialPreferences?.sleepSchedule || 'NORMAL');
  const [cleanliness, setCleanliness] = useState(initialPreferences?.cleanliness != null ? initialPreferences.cleanliness : 3);
  const [noiseLevel, setNoiseLevel] = useState(initialPreferences?.noiseLevel != null ? initialPreferences.noiseLevel : 3);
  
  const [diet, setDiet] = useState(initialPreferences?.diet || 'NO_PREFERENCE');
  const [smoking, setSmoking] = useState(initialPreferences?.smoking || 'NO');
  const [drinking, setDrinking] = useState(initialPreferences?.drinking || 'NO');
  const [guests, setGuests] = useState(initialPreferences?.guests || 'SOMETIMES');
  const [workMode, setWorkMode] = useState(initialPreferences?.workMode || 'HYBRID');
  
  const [budgetMin, setBudgetMin] = useState(initialPreferences?.budgetMin != null ? initialPreferences.budgetMin : 10000);
  const [budgetMax, setBudgetMax] = useState(initialPreferences?.budgetMax != null ? initialPreferences.budgetMax : 25000);
  const [genderPreference, setGenderPreference] = useState(initialPreferences?.genderPreference || 'ANY');
  
  const [dealBreakers, setDealBreakers] = useState(initialPreferences?.dealBreakers || []);

  // Wizard state
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Today in YYYY-MM-DD format for min move-in date
  const todayStr = new Date().toISOString().split('T')[0];

  // Mark form as dirty when any value changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Toggle deal breaker status for a specific field
  const toggleDealBreaker = (fieldKey) => {
    markDirty();
    setDealBreakers((prev) => 
      prev.includes(fieldKey) 
        ? prev.filter((k) => k !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in your habits & budget. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    if (onCancel) onCancel();
  };

  // Step validations
  const validateStep1 = () => {
    if (!lookingFor) {
      setError('Please select what you are looking for.');
      return false;
    }
    if (moveInDate && moveInDate < todayStr) {
      setError('Move-in date cannot be in the past.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!sleepSchedule) {
      setError('Please select your sleep schedule.');
      return false;
    }
    if (cleanliness < 1 || cleanliness > 5) {
      setError('Cleanliness rating must be between 1 and 5.');
      return false;
    }
    if (noiseLevel < 1 || noiseLevel > 5) {
      setError('Noise level rating must be between 1 and 5.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!diet || !smoking || !drinking || !guests || !workMode) {
      setError('Please answer all lifestyle questions.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep4 = () => {
    const minVal = Number(budgetMin);
    const maxVal = Number(budgetMax);

    if (isNaN(minVal) || minVal < 0 || minVal > 1000000) {
      setError('Minimum budget must be between ₹0 and ₹10,00,000.');
      return false;
    }
    if (isNaN(maxVal) || maxVal < 0 || maxVal > 1000000) {
      setError('Maximum budget must be between ₹0 and ₹10,00,000.');
      return false;
    }
    if (maxVal < minVal) {
      setError('Maximum budget cannot be less than minimum budget.');
      return false;
    }
    if (!genderPreference) {
      setError('Please select a gender preference.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2 && !validateStep2()) return;
    if (activeStep === 3 && !validateStep3()) return;
    if (activeStep === 4 && !validateStep4()) return;
    
    setError('');
    setActiveStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setError('');
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Full validation
    if (!validateStep1()) { setActiveStep(1); return; }
    if (!validateStep2()) { setActiveStep(2); return; }
    if (!validateStep3()) { setActiveStep(3); return; }
    if (!validateStep4()) { setActiveStep(4); return; }

    const payload = {
      lookingFor,
      sleepSchedule,
      cleanliness: Number(cleanliness),
      noiseLevel: Number(noiseLevel),
      diet,
      smoking,
      drinking,
      guests,
      workMode,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      genderPreference: genderPreference || 'ANY',
      moveInDate: moveInDate || null,
      dealBreakers: dealBreakers || [],
    };

    setSaving(true);
    try {
      const result = await savePreferences(payload);
      setIsDirty(false);
      if (onSaveSuccess) {
        onSaveSuccess(result.preferences);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save preferences. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Reusable Must-Have toggle badge
  const renderMustHaveToggle = (fieldKey) => {
    const isMustHave = dealBreakers.includes(fieldKey);
    return (
      <button
        type="button"
        onClick={() => toggleDealBreaker(fieldKey)}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[32px] ${
          isMustHave
            ? 'bg-[#DE5737] text-white border-[#DE5737] shadow-sm'
            : 'bg-white text-stone-600 border-stone-200 hover:border-[#DE5737] hover:text-[#DE5737]'
        }`}
        title="Toggle as a must-have filter for roommate matching"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>{isMustHave ? 'Must-have ✓' : 'Mark as Must-have'}</span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#ECE4DB] shadow-sm overflow-hidden">
      
      {/* Wizard Header */}
      <div className="p-6 bg-[#FAF7F2] border-b border-[#ECE4DB] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#211B17]">
              {initialPreferences ? 'Edit Habits & Budget' : 'My Habits & Budget'}
            </h2>
            <span className="text-[11px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2.5 py-0.5 rounded-full border border-[#F5C4B5]">
              Step {activeStep} of 5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Share your daily routines and living preferences to prepare for lifestyle-based matching.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 shrink-0"
          title="Close / Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Stepper Tabs */}
      <div className="px-6 py-3 bg-white border-b border-stone-100 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id < activeStep) setActiveStep(s.id);
              else if (s.id === 2 && validateStep1()) setActiveStep(2);
              else if (s.id === 3 && validateStep1() && validateStep2()) setActiveStep(3);
              else if (s.id === 4 && validateStep1() && validateStep2() && validateStep3()) setActiveStep(4);
              else if (s.id === 5 && validateStep1() && validateStep2() && validateStep3() && validateStep4()) setActiveStep(5);
            }}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-full transition-all whitespace-nowrap min-h-[44px] ${
              activeStep === s.id
                ? 'bg-[#DE5737] text-white shadow-sm'
                : activeStep > s.id
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeStep === s.id ? 'bg-white text-[#DE5737]' : 'bg-stone-200 text-stone-700'
            }`}>
              {activeStep > s.id ? '✓' : s.id}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Form Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Error message banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* ================= STEP 1: LOOKING FOR & MOVE-IN DATE ================= */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                What are you looking for? <span className="text-[#DE5737]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LOOKING_FOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setLookingFor(opt.value);
                      markDirty();
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                      lookingFor === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] shadow-sm ring-1 ring-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-stone-900 text-base">{opt.label}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        lookingFor === opt.value ? 'bg-[#DE5737] border-[#DE5737] text-white' : 'border-stone-300'
                      }`}>
                        {lookingFor === opt.value && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Move-in Date */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Ideal Move-in Date <span className="text-stone-400 font-normal normal-case">(Optional)</span>
              </label>
              <div className="max-w-xs relative">
                <input
                  type="date"
                  min={todayStr}
                  value={moveInDate}
                  onChange={(e) => {
                    setMoveInDate(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/50 min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Leave empty if you have flexible timing. Date cannot be in the past.
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ROUTINE ================= */}
        {activeStep === 2 && (
          <div className="space-y-8 animate-in fade-in">
            {/* Sleep Schedule */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Sleep Schedule <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('sleepSchedule')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SLEEP_SCHEDULE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSleepSchedule(opt.value);
                      markDirty();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all min-h-[44px] ${
                      sleepSchedule === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] ring-1 ring-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900 text-sm">{opt.label}</span>
                      {sleepSchedule === opt.value && <Check className="w-4 h-4 text-[#DE5737]" />}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness Slider / Scale (1 to 5 with labelled endpoints) */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Cleanliness Standard (1 to 5) <span className="text-[#DE5737]">*</span>
                  </label>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Current: <strong className="text-stone-800">{CLEANLINESS_SCALE.labels[cleanliness]}</strong>
                  </p>
                </div>
                {renderMustHaveToggle('cleanliness')}
              </div>

              {/* Endpoints indicators */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-2">
                <span>1 - {CLEANLINESS_SCALE.minLabel}</span>
                <span>5 - {CLEANLINESS_SCALE.maxLabel}</span>
              </div>

              {/* Tappable buttons 1 to 5 */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setCleanliness(val);
                      markDirty();
                    }}
                    className={`py-3 rounded-xl font-bold text-sm transition-all min-h-[44px] flex flex-col items-center justify-center ${
                      cleanliness === val
                        ? 'bg-[#DE5737] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-[#DE5737]'
                    }`}
                  >
                    <span>{val}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Noise Level Scale (1 to 5 with labelled endpoints) */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Noise Tolerance (1 to 5) <span className="text-[#DE5737]">*</span>
                  </label>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Current: <strong className="text-stone-800">{NOISE_LEVEL_SCALE.labels[noiseLevel]}</strong>
                  </p>
                </div>
                {renderMustHaveToggle('noiseLevel')}
              </div>

              {/* Endpoints indicators */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-2">
                <span>1 - {NOISE_LEVEL_SCALE.minLabel}</span>
                <span>5 - {NOISE_LEVEL_SCALE.maxLabel}</span>
              </div>

              {/* Tappable buttons 1 to 5 */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setNoiseLevel(val);
                      markDirty();
                    }}
                    className={`py-3 rounded-xl font-bold text-sm transition-all min-h-[44px] flex flex-col items-center justify-center ${
                      noiseLevel === val
                        ? 'bg-[#DE5737] text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-[#DE5737]'
                    }`}
                  >
                    <span>{val}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LIFESTYLE ================= */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Diet */}
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Dietary Habits <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('diet')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DIET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setDiet(opt.value);
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                      diet === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] font-bold text-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Smoking Policy <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('smoking')}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {SMOKING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSmoking(opt.value);
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                      smoking === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] font-bold text-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drinking */}
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Drinking Policy <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('drinking')}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {DRINKING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setDrinking(opt.value);
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                      drinking === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] font-bold text-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests Policy */}
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Guest Policy <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('guests')}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {GUESTS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setGuests(opt.value);
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                      guests === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] font-bold text-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Work Mode <span className="text-[#DE5737]">*</span>
                </label>
                {renderMustHaveToggle('workMode')}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {WORK_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setWorkMode(opt.value);
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                      workMode === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] font-bold text-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: BUDGET & GENDER PREFERENCE ================= */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Budget Range Section */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Monthly Budget Range (INR) <span className="text-[#DE5737]">*</span>
              </label>
              
              {/* Formatted live preview */}
              <div className="text-base sm:text-lg font-black text-[#DE5737] mb-4">
                {formatBudgetRange(budgetMin, budgetMax)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Minimum Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    step={1000}
                    value={budgetMin}
                    onChange={(e) => {
                      setBudgetMin(e.target.value === '' ? '' : Number(e.target.value));
                      markDirty();
                    }}
                    placeholder="e.g. 8000"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-white min-h-[44px]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {formatIndianPrice(budgetMin)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Maximum Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    step={1000}
                    value={budgetMax}
                    onChange={(e) => {
                      setBudgetMax(e.target.value === '' ? '' : Number(e.target.value));
                      markDirty();
                    }}
                    placeholder="e.g. 20000"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-white min-h-[44px]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {formatIndianPrice(budgetMax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Roommate Gender Preference <span className="text-[#DE5737]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GENDER_PREFERENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setGenderPreference(opt.value);
                      markDirty();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all min-h-[44px] ${
                      genderPreference === opt.value
                        ? 'border-[#DE5737] bg-[#FDF1EC] ring-1 ring-[#DE5737]'
                        : 'border-[#ECE4DB] hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900 text-sm">{opt.label}</span>
                      {genderPreference === opt.value && <Check className="w-4 h-4 text-[#DE5737]" />}
                    </div>
                    <p className="text-[11px] text-stone-600">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: DEAL-BREAKERS & REVIEW ================= */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Must-have / Deal breakers Section */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Deal-breakers / Must-haves ({dealBreakers.length} selected)
                </h3>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Items marked as "Must-have" will act as strict filters for flatmate compatibility.
              </p>

              {/* Hint when more than 3 must-haves are selected */}
              {dealBreakers.length > 3 && (
                <div className="p-3 mb-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    You have marked {dealBreakers.length} must-haves. Marking more than 3 must-haves may significantly limit your potential flatmate matches.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ELIGIBLE_DEAL_BREAKERS.map((db) => {
                  const isChecked = dealBreakers.includes(db.key);
                  return (
                    <button
                      key={db.key}
                      type="button"
                      onClick={() => toggleDealBreaker(db.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[36px] ${
                        isChecked
                          ? 'bg-[#DE5737] text-white border-[#DE5737]'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{db.label}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Summary Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#ECE4DB] space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Review Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Looking For</span>
                  <span className="font-extrabold text-stone-800 text-sm">{formatPreferenceLabel('lookingFor', lookingFor)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Budget Range</span>
                  <span className="font-extrabold text-[#DE5737] text-sm">{formatBudgetRange(budgetMin, budgetMax)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Move-in Date</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {moveInDate ? formatDate(moveInDate) : 'Flexible'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Sleep Schedule</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('sleepSchedule', sleepSchedule)}
                    {dealBreakers.includes('sleepSchedule') && ' (Must-have)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Cleanliness</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('cleanliness', cleanliness)}
                    {dealBreakers.includes('cleanliness') && ' (Must-have)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Noise Level</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('noiseLevel', noiseLevel)}
                    {dealBreakers.includes('noiseLevel') && ' (Must-have)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Diet</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('diet', diet)}
                    {dealBreakers.includes('diet') && ' (Must-have)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Smoking & Drinking</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('smoking', smoking)} · {formatPreferenceLabel('drinking', drinking)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-100">
                  <span className="text-stone-400 font-bold uppercase block text-[10px]">Work & Guests</span>
                  <span className="font-extrabold text-stone-800 text-sm">
                    {formatPreferenceLabel('workMode', workMode)} · {formatPreferenceLabel('guests', guests)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation Bar */}
      <div className="p-6 bg-[#FAF7F2] border-t border-[#ECE4DB] flex items-center justify-between gap-3">
        <div>
          {activeStep > 1 && (
            <button
              type="button"
              disabled={saving}
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-full text-stone-500 hover:text-stone-800 font-semibold text-xs sm:text-sm transition-all min-h-[44px]"
          >
            Cancel
          </button>

          {activeStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className={`bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold px-7 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all min-h-[44px] ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Habits & Budget</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
