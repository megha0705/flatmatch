/**
 * Enum-to-label mappings and metadata for Preferences.
 * AGENTS.md rule: Never show raw enum values.
 */

export const LOOKING_FOR_OPTIONS = [
  { value: 'NEED_ROOM', label: 'I need a room', description: 'Looking for an existing flat or room to move into' },
  { value: 'HAVE_ROOM', label: 'I have a room', description: 'Have a vacant room or flat looking for a flatmate' },
];

export const SLEEP_SCHEDULE_OPTIONS = [
  { value: 'EARLY_BIRD', label: 'Early bird', description: 'Up early with the sun, sleeps early' },
  { value: 'NORMAL', label: 'Flexible / Normal', description: 'Standard day schedule' },
  { value: 'NIGHT_OWL', label: 'Night owl', description: 'Thrives late at night, sleeps in' },
];

export const CLEANLINESS_SCALE = {
  min: 1,
  max: 5,
  minLabel: 'Relaxed',
  maxLabel: 'Very tidy',
  labels: {
    1: 'Relaxed (Casual approach to tidiness)',
    2: 'Fairly relaxed (Tidies up when needed)',
    3: 'Moderate (Keeps shared spaces organized)',
    4: 'Clean (Daily upkeep and neatness)',
    5: 'Very tidy (Meticulous cleanliness always)',
  },
};

export const NOISE_LEVEL_SCALE = {
  min: 1,
  max: 5,
  minLabel: 'Very quiet',
  maxLabel: 'Lively',
  labels: {
    1: 'Very quiet (Peaceful sanctuary, no loud noise)',
    2: 'Mostly quiet (Prefers low noise, headphones)',
    3: 'Moderate (Normal daytime conversations & music)',
    4: 'Social (Enjoys music and active atmosphere)',
    5: 'Lively (Vibrant, high energy home)',
  },
};

export const DIET_OPTIONS = [
  { value: 'VEG', label: 'Vegetarian', description: 'Vegetarian food only' },
  { value: 'EGG', label: 'Eggetarian', description: 'Vegetarian plus eggs' },
  { value: 'NON_VEG', label: 'Non-vegetarian', description: 'Enjoys non-veg cuisine' },
  { value: 'NO_PREFERENCE', label: 'No preference', description: 'Open to any diet' },
];

export const SMOKING_OPTIONS = [
  { value: 'NO', label: 'Non-smoker', description: 'Does not smoke' },
  { value: 'OCCASIONAL', label: 'Occasionally', description: 'Smokes socially or outdoors' },
  { value: 'YES', label: 'Regular smoker', description: 'Regular smoker' },
];

export const DRINKING_OPTIONS = [
  { value: 'NO', label: 'Non-drinker', description: 'Does not drink alcohol' },
  { value: 'OCCASIONAL', label: 'Occasionally', description: 'Drinks socially or on weekends' },
  { value: 'YES', label: 'Regular drinker', description: 'Regular drinker' },
];

export const GUESTS_OPTIONS = [
  { value: 'NEVER', label: 'No guests', description: 'Prefers no outside guests' },
  { value: 'SOMETIMES', label: 'Occasionally', description: 'Guests welcome with prior notice' },
  { value: 'OFTEN', label: 'Frequently', description: 'Open door, frequent visitors welcome' },
];

export const WORK_MODE_OPTIONS = [
  { value: 'WFH', label: 'Work from home', description: 'Works remotely full-time' },
  { value: 'OFFICE', label: 'Office', description: 'Works from office/college' },
  { value: 'HYBRID', label: 'Hybrid', description: 'Mix of remote and office days' },
];

export const GENDER_PREFERENCE_OPTIONS = [
  { value: 'ANY', label: 'Any gender', description: 'Comfortable with anyone' },
  { value: 'SAME_GENDER', label: 'Same gender only', description: 'Prefer living with the same gender' },
  { value: 'MALE', label: 'Male only', description: 'Looking for male flatmates' },
  { value: 'FEMALE', label: 'Female only', description: 'Looking for female flatmates' },
];

// Single source of truth lookup map for friendly labels
export const PREFERENCES_ENUM_LABELS = {
  // Looking For
  NEED_ROOM: 'I need a room',
  HAVE_ROOM: 'I have a room',

  // Sleep Schedule
  EARLY_BIRD: 'Early bird',
  NORMAL: 'Flexible / Normal',
  NIGHT_OWL: 'Night owl',

  // Diet
  VEG: 'Vegetarian',
  EGG: 'Eggetarian',
  NON_VEG: 'Non-vegetarian',
  NO_PREFERENCE: 'No preference',

  // Smoking / Drinking
  NO: 'No',
  OCCASIONAL: 'Occasionally',
  YES: 'Regularly',

  // Guests
  NEVER: 'No guests',
  SOMETIMES: 'Occasionally',
  OFTEN: 'Frequently',

  // Work Mode
  WFH: 'Work from home',
  OFFICE: 'Office',
  HYBRID: 'Hybrid',

  // Gender Preference
  ANY: 'Any gender',
  SAME_GENDER: 'Same gender only',
  MALE: 'Male only',
  FEMALE: 'Female only',
};

// Deal-breaker field configurations eligible for "must-have" filter
export const ELIGIBLE_DEAL_BREAKERS = [
  { key: 'sleepSchedule', label: 'Sleep routine', question: 'Routine' },
  { key: 'cleanliness', label: 'Cleanliness scale', question: 'Cleanliness' },
  { key: 'noiseLevel', label: 'Noise tolerance', question: 'Noise level' },
  { key: 'diet', label: 'Diet preference', question: 'Diet' },
  { key: 'smoking', label: 'Smoking policy', question: 'Smoking' },
  { key: 'drinking', label: 'Drinking policy', question: 'Drinking' },
  { key: 'guests', label: 'Guest policy', question: 'Guests' },
  { key: 'workMode', label: 'Work mode', question: 'Work routine' },
];

/**
 * Format any preference enum to a friendly string
 */
export function formatPreferenceLabel(key, value) {
  if (value === null || value === undefined) return '';

  if (key === 'cleanliness') {
    return `${value}/5 (${CLEANLINESS_SCALE.labels[value]?.split('(')[0]?.trim() || ''})`;
  }
  if (key === 'noiseLevel') {
    return `${value}/5 (${NOISE_LEVEL_SCALE.labels[value]?.split('(')[0]?.trim() || ''})`;
  }
  if (key === 'smoking' || key === 'drinking') {
    if (value === 'NO') return key === 'smoking' ? 'Non-smoker' : 'Non-drinker';
    if (value === 'OCCASIONAL') return 'Occasionally';
    if (value === 'YES') return key === 'smoking' ? 'Regular smoker' : 'Regular drinker';
  }

  return PREFERENCES_ENUM_LABELS[value] || String(value).replace(/_/g, ' ');
}

/**
 * Format budget range: e.g. "₹8,000 to ₹15,000 per month"
 */
export function formatBudgetRange(min, max) {
  const minFormatted = min != null ? `₹${Number(min).toLocaleString('en-IN')}` : '₹0';
  const maxFormatted = max != null ? `₹${Number(max).toLocaleString('en-IN')}` : '₹0';
  return `${minFormatted} to ${maxFormatted} per month`;
}
