import React, { useState, useEffect } from 'react';
import { 
  X, User, Camera, Sparkles, MapPin, Briefcase, Building, 
  Calendar, Check, AlertCircle, RefreshCw, Trash2, ShieldCheck, Heart
} from 'lucide-react';
import { saveProfile, uploadProfilePhoto, deleteProfilePhoto } from '../api/profile';

const POPULAR_CITIES = ['Kolkata', 'Bangalore', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad', 'Chennai'];

const GENDERS = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const OCCUPATIONS = [
  { value: 'WORKING', label: 'Working Professional' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'OTHER', label: 'Other' },
];

const BIO_SUGGESTIONS = [
  'Early riser 🌅',
  'Night owl 🌙',
  'Quiet & clean 🧘',
  'Weekend foodie 🍕',
  'Fitness enthusiast 🏋️‍♂️',
  'Pet lover 🐾',
  'Non-smoker 🚭',
  'Work from home 💻'
];

export default function ProfileModal({
  isOpen,
  mode = 'initial', // 'initial' (mandatory setup) | 'edit'
  initialProfile = null,
  userEmail = '',
  onClose,
  onProfileSaved,
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [city, setCity] = useState('Bangalore');
  const [customCity, setCustomCity] = useState('');
  const [occupation, setOccupation] = useState('WORKING');
  const [organization, setOrganization] = useState('');
  const [workLabel, setWorkLabel] = useState('');
  const [workLat, setWorkLat] = useState('');
  const [workLng, setWorkLng] = useState('');
  const [bio, setBio] = useState('');

  // Photo handling
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: Personal Info, 2: Occupation & City, 3: About & Photo

  // Initialize or reset form values
  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setAge(initialProfile.age ? String(initialProfile.age) : '');
      setGender(initialProfile.gender || 'FEMALE');
      
      const cityVal = initialProfile.city || 'Bangalore';
      if (POPULAR_CITIES.includes(cityVal)) {
        setCity(cityVal);
        setCustomCity('');
      } else {
        setCity('Other');
        setCustomCity(cityVal);
      }

      setOccupation(initialProfile.occupation || 'WORKING');
      setOrganization(initialProfile.organization || '');
      setWorkLabel(initialProfile.workLabel || '');
      setWorkLat(initialProfile.workLat != null ? String(initialProfile.workLat) : '');
      setWorkLng(initialProfile.workLng != null ? String(initialProfile.workLng) : '');
      setBio(initialProfile.bio || '');

      if (initialProfile.photoUrl) {
        setPhotoPreview(initialProfile.photoUrl);
        setHasExistingPhoto(true);
      } else {
        setPhotoPreview(null);
        setHasExistingPhoto(false);
      }
    } else {
      // Default initial setup
      const defaultName = userEmail ? userEmail.split('@')[0] : '';
      setName(defaultName);
      setAge('');
      setGender('FEMALE');
      setCity('Bangalore');
      setCustomCity('');
      setOccupation('WORKING');
      setOrganization('');
      setWorkLabel('');
      setWorkLat('');
      setWorkLng('');
      setBio('');
      setPhotoPreview(null);
      setPhotoFile(null);
      setHasExistingPhoto(false);
    }
    setActiveStep(1);
    setError('');
  }, [initialProfile, isOpen, userEmail]);

  if (!isOpen) return null;

  const isMandatory = mode === 'initial';

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size should be less than 5MB.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = async () => {
    if (hasExistingPhoto && initialProfile) {
      setLoading(true);
      try {
        await deleteProfilePhoto();
        setPhotoPreview(null);
        setPhotoFile(null);
        setHasExistingPhoto(false);
      } catch (err) {
        setError('Failed to remove photo.');
      } finally {
        setLoading(false);
      }
    } else {
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  };

  const addBioTag = (tag) => {
    if (bio.includes(tag)) return;
    const nextBio = bio ? `${bio} • ${tag}` : tag;
    if (nextBio.length <= 1000) {
      setBio(nextBio);
    }
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      setError('Please enter a valid age between 18 and 100.');
      return false;
    }
    if (!gender) {
      setError('Please select your gender.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    const effectiveCity = city === 'Other' ? customCity.trim() : city;
    if (!effectiveCity) {
      setError('Please enter or select your city.');
      return false;
    }
    if (!occupation) {
      setError('Please select your occupation.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Full validation
    if (!validateStep1()) {
      setActiveStep(1);
      return;
    }
    if (!validateStep2()) {
      setActiveStep(2);
      return;
    }

    const effectiveCity = city === 'Other' ? customCity.trim() : city;
    const ageNum = parseInt(age, 10);

    const payload = {
      name: name.trim(),
      age: ageNum,
      gender,
      city: effectiveCity,
      occupation,
      organization: organization.trim() || null,
      workLabel: workLabel.trim() || null,
      workLat: workLat ? parseFloat(workLat) : null,
      workLng: workLng ? parseFloat(workLng) : null,
      bio: bio.trim() || null,
    };

    setLoading(true);
    try {
      // 1. Save profile details
      const result = await saveProfile(payload);
      let updatedProfile = result.profile;

      // 2. If photo was picked, upload it
      if (photoFile) {
        try {
          const photoResult = await uploadProfilePhoto(photoFile);
          updatedProfile = photoResult.profile;
        } catch (photoErr) {
          console.warn('Photo upload warning:', photoErr.message);
        }
      }

      onProfileSaved(updatedProfile);
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE4DB] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DE5737] text-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#211B17] tracking-tight">
                  {isMandatory ? 'Set Up Your Profile' : 'Edit Your Profile'}
                </h2>
                {isMandatory && (
                  <span className="text-[11px] font-bold bg-[#FDF1EC] text-[#DE5737] px-2.5 py-0.5 rounded-full border border-[#F5C4B5]">
                    Required Step
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isMandatory 
                  ? 'Please complete your profile details before posting listings or matching with flatmates.' 
                  : 'Keep your information updated for better roommate matching.'}
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors border border-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-step progress tabs */}
        <div className="px-6 pt-3 pb-2 bg-white border-b border-stone-100 flex items-center justify-between text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${
              activeStep === 1
                ? 'border-[#DE5737] text-[#DE5737]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeStep === 1 ? 'bg-[#DE5737] text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              1
            </span>
            <span>Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setActiveStep(2);
            }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${
              activeStep === 2
                ? 'border-[#DE5737] text-[#DE5737]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeStep === 2 ? 'bg-[#DE5737] text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              2
            </span>
            <span>City & Career</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setActiveStep(3);
            }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${
              activeStep === 3
                ? 'border-[#DE5737] text-[#DE5737]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              activeStep === 3 ? 'bg-[#DE5737] text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              3
            </span>
            <span>Bio & Avatar</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: PERSONAL INFO ================= */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#DE5737]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                />
                <p className="text-[11px] text-stone-400 mt-1">This will be shown on your profile and listings.</p>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Age <span className="text-[#DE5737]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">
                    years old (18+)
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Gender <span className="text-[#DE5737]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GENDERS.map((g) => (
                    <button
                      type="button"
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        gender === g.value
                          ? 'border-[#DE5737] bg-[#FDF1EC] text-[#DE5737] shadow-sm'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span>{g.label}</span>
                      {gender === g.value && <Check className="w-3.5 h-3.5 text-[#DE5737]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CITY & OCCUPATION ================= */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Current City <span className="text-[#DE5737]">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => {
                        setCity(c);
                        setCustomCity('');
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        city === c
                          ? 'bg-[#DE5737] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCity('Other')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      city === 'Other'
                        ? 'bg-[#DE5737] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Other City...
                  </button>
                </div>

                {city === 'Other' && (
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter your city name"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                  />
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Occupation <span className="text-[#DE5737]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OCCUPATIONS.map((occ) => (
                    <button
                      type="button"
                      key={occ.value}
                      onClick={() => setOccupation(occ.value)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        occupation === occ.value
                          ? 'border-[#DE5737] bg-[#FDF1EC] text-[#DE5737] shadow-sm'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <span>{occ.label}</span>
                      {occupation === occ.value && <Check className="w-3.5 h-3.5 text-[#DE5737]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company / College / Organization */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Company / College Name <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={120}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Google, Microsoft, IIT Bombay, St. Xavier's"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                  />
                </div>
              </div>

              {/* Work / Commute Location */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Office / Campus Area <span className="text-stone-400 font-normal">(Optional, for commute matching)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={120}
                    value={workLabel}
                    onChange={(e) => setWorkLabel(e.target.value)}
                    placeholder="e.g. Embassy GolfLinks, Whitefield, BKC"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PHOTO & BIO ================= */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Photo Upload Section */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Profile Photo <span className="text-stone-400 font-normal">(Recommended)</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 border-2 border-white shadow-md flex items-center justify-center">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-stone-400" />
                      )}
                    </div>

                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#DE5737] text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform">
                      <Camera className="w-3.5 h-3.5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoSelect} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-stone-800">
                      Upload your picture
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Profiles with photos receive 3x more flatmate responses. Supported: JPG, PNG, WebP up to 5MB.
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <label className="text-xs font-bold text-[#DE5737] bg-white border border-[#F5C4B5] hover:bg-[#FDF1EC] px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs">
                        Browse Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoSelect} 
                          className="hidden" 
                        />
                      </label>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Habits */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Bio & Lifestyle Notes <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <span className={`text-[11px] font-semibold ${bio.length > 900 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {bio.length}/1000
                  </span>
                </div>

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell future flatmates about yourself: what are your work hours, weekends like, pet preferences, music tastes, or cooking habits?"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#DE5737] text-sm text-stone-800 bg-[#FAF7F2]/40"
                />

                {/* Quick Bio Chips */}
                <div className="mt-2.5">
                  <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
                    Click to add lifestyle badges to bio:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {BIO_SUGGESTIONS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => addBioTag(tag)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                          bio.includes(tag)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {tag} {bio.includes(tag) && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1 && validateStep1()) {
                    setActiveStep(2);
                  } else if (activeStep === 2 && validateStep2()) {
                    setActiveStep(3);
                  }
                }}
                className="bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-sm"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="bg-[#DE5737] hover:bg-[#CA4929] disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isMandatory ? 'Complete & Proceed' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
