import React, { useState } from 'react';
import { 
  X, Home, Upload, Plus, Trash2, MapPin, IndianRupee, 
  Calendar, Check, Sparkles, AlertCircle, RefreshCw, Image as ImageIcon 
} from 'lucide-react';
import { createListing } from '../api/listings';

const COMMON_AMENITIES = [
  "High-Speed Wi-Fi",
  "Air Conditioning",
  "Attached Washroom",
  "Washing Machine",
  "Power Backup",
  "Cook & Maid Available",
  "Modular Kitchen",
  "Balcony",
  "Gated Security",
  "Gym & Fitness",
  "Car Parking",
  "Bike Parking",
  "Elevator / Lift",
  "Pet Friendly"
];

const CITIES = [
  "Bangalore",
  "Mumbai",
  "Pune",
  "Delhi NCR",
  "Hyderabad"
];

export default function CreateListingModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [locality, setLocality] = useState('');
  const [addressHint, setAddressHint] = useState('');
  const [rentPerPerson, setRentPerPerson] = useState('');
  const [deposit, setDeposit] = useState('');
  const [roomType, setRoomType] = useState('SINGLE');
  const [furnishing, setFurnishing] = useState('FULLY_FURNISHED');
  const [genderAllowed, setGenderAllowed] = useState('ANY');
  const [currentFlatmates, setCurrentFlatmates] = useState(1);
  const [spotsAvailable, setSpotsAvailable] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState([
    "High-Speed Wi-Fi", "Washing Machine", "Power Backup", "Gated Security"
  ]);
  const [availableFrom, setAvailableFrom] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  
  // Photos state
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (photoFiles.length + files.length > 10) {
      setError('You can upload a maximum of 10 photos.');
      return;
    }

    const newFiles = [...photoFiles, ...files];
    setPhotoFiles(newFiles);

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a listing title.');
      return;
    }
    if (!locality.trim()) {
      setError('Please specify the locality/area.');
      return;
    }
    if (!rentPerPerson || Number(rentPerPerson) <= 0) {
      setError('Please specify a valid rent per person.');
      return;
    }

    // Default coordinates based on city for convenience
    const cityCoords = {
      Bangalore: { lat: 12.9716, lng: 77.5946 },
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Pune: { lat: 18.5204, lng: 73.8567 },
      "Delhi NCR": { lat: 28.6139, lng: 77.2090 },
      Hyderabad: { lat: 17.3850, lng: 78.4867 },
    };
    const coords = cityCoords[city] || { lat: 12.9716, lng: 77.5946 };

    const listingPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      city: city.trim(),
      locality: locality.trim(),
      addressHint: addressHint.trim() || undefined,
      lat: coords.lat,
      lng: coords.lng,
      rentPerPerson: Number(rentPerPerson),
      deposit: deposit ? Number(deposit) : 0,
      roomType,
      furnishing,
      genderAllowed,
      currentFlatmates: Number(currentFlatmates),
      spotsAvailable: Number(spotsAvailable),
      amenities: selectedAmenities,
      availableFrom
    };

    setLoading(true);
    try {
      const result = await createListing(listingPayload, photoFiles);
      if (onCreated) {
        onCreated(result.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl my-8 p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#211B17]">Post a Room or Flat Listing</h2>
              <p className="text-xs text-stone-500">Share your space with verified, respectful flatmates.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-6 pt-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunny Private Bedroom in Indiranagar 3BHK"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none"
            />
          </div>

          {/* City & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none bg-white"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Locality / Area *
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Indiranagar 12th Main"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none"
              />
            </div>
          </div>

          {/* Address Hint */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Address Hint / Landmark (Optional)
            </label>
            <input
              type="text"
              value={addressHint}
              onChange={(e) => setAddressHint(e.target.value)}
              placeholder="e.g. 2 mins from Metro Station / Near Sony World signal"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
            />
          </div>

          {/* Rent & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Monthly Rent Per Person (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={rentPerPerson}
                  onChange={(e) => setRentPerPerson(e.target.value)}
                  placeholder="20000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Security Deposit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="40000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Room Type, Furnishing, Gender Allowed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:border-[#DE5737] outline-none bg-white"
              >
                <option value="SINGLE">Private Bedroom</option>
                <option value="SHARED">Shared Room</option>
                <option value="ENTIRE_FLAT">Entire Flat / House</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Furnishing
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:border-[#DE5737] outline-none bg-white"
              >
                <option value="FULLY_FURNISHED">Fully Furnished</option>
                <option value="SEMI_FURNISHED">Semi Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Gender Allowed
              </label>
              <select
                value={genderAllowed}
                onChange={(e) => setGenderAllowed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:border-[#DE5737] outline-none bg-white"
              >
                <option value="ANY">Any / Co-ed</option>
                <option value="FEMALE_ONLY">Female Only</option>
                <option value="MALE_ONLY">Male Only</option>
              </select>
            </div>
          </div>

          {/* Current Flatmates, Spots Available, Available From */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Current Flatmates
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={currentFlatmates}
                onChange={(e) => setCurrentFlatmates(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Spots Open
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={spotsAvailable}
                onChange={(e) => setSpotsAvailable(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Available From
              </label>
              <input
                type="date"
                required
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none"
              />
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Select Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#DE5737] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Upload Photos (Max 10)
            </label>
            <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:border-[#DE5737]/50 transition-colors">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label 
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#FDF1EC] text-[#DE5737] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-stone-700">Click to upload room photos</span>
                <span className="text-[11px] text-stone-400">PNG, JPG, or WebP up to 5MB each</span>
              </label>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100">
                  {photoPreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-video bg-stone-100 group">
                      <img src={previewUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Description & House Vibes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell prospective flatmates about the apartment, the vibes, daily habits, cleaning schedule, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] outline-none resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Listing to Roomie</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
