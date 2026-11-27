/**
 * Formatting and Enum helpers for roomie.
 * Adheres strictly to AGENTS.md formatting rules:
 * - Indian number grouping for money (e.g., ₹1,50,000)
 * - Dates formatted like "1 Dec 2026"
 * - Correct pluralisation ("1 spot open", "2 spots open", "1 current flatmate")
 * - Friendly human-readable enum mapping everywhere
 */

export const ROOM_TYPE_LABELS = {
  PRIVATE_ROOM: 'Private room',
  SHARED_ROOM: 'Shared room',
  ENTIRE_FLAT: 'Entire flat',
  // legacy/fallback mappings
  SINGLE: 'Private room',
  SHARED: 'Shared room',
};

export const FURNISHING_LABELS = {
  UNFURNISHED: 'Unfurnished',
  SEMI_FURNISHED: 'Semi-furnished',
  FURNISHED: 'Furnished',
  // legacy fallback
  FULLY_FURNISHED: 'Furnished',
};

export const GENDER_ALLOWED_LABELS = {
  ANY: 'Anyone',
  MALE: 'Men only',
  FEMALE: 'Women only',
  // legacy fallback
  MALE_ONLY: 'Men only',
  FEMALE_ONLY: 'Women only',
};

export const OCCUPATION_LABELS = {
  STUDENT: 'Student',
  WORKING: 'Working Professional',
  INTERN: 'Intern',
  OTHER: 'Other',
};

export const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  NON_BINARY: 'Non-binary',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

export function formatRoomType(val) {
  if (!val) return '';
  return ROOM_TYPE_LABELS[val] || val.replace(/_/g, ' ');
}

export function formatFurnishing(val) {
  if (!val) return '';
  return FURNISHING_LABELS[val] || val.replace(/_/g, ' ');
}

export function formatGenderAllowed(val) {
  if (!val) return '';
  return GENDER_ALLOWED_LABELS[val] || val.replace(/_/g, ' ');
}

export function formatOccupation(val) {
  if (!val) return '';
  return OCCUPATION_LABELS[val] || capitalizeWords(val);
}

/**
 * Format currency with Indian number grouping (en-IN)
 * e.g., 25000 -> "₹25,000", 150000 -> "₹1,50,000"
 */
export function formatIndianPrice(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Format dates like "1 Dec 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    // If it's YYYY-MM-DD, parse parts directly to avoid timezone shift
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[month - 1]} ${year}`;
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Pluralisation helpers
 */
export function formatSpots(count) {
  const n = Number(count) || 0;
  return n === 1 ? '1 spot open' : `${n} spots open`;
}

export function formatFlatmates(count) {
  const n = Number(count) || 0;
  return n === 1 ? '1 current flatmate' : `${n} current flatmates`;
}

/**
 * Capitalize string (e.g. "kolkata" -> "Kolkata", "NEW DELHI" -> "New Delhi")
 */
export function capitalizeWords(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export { formatBudgetRange, formatPreferenceLabel } from './preferencesConstants';

