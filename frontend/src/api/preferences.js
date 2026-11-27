import { getToken } from './auth';

const API_BASE = '/api/preferences';
const CACHED_PREFERENCES_KEY = 'roomie_user_preferences';

export function getCachedPreferences() {
  try {
    const raw = localStorage.getItem(CACHED_PREFERENCES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCachedPreferences(preferences) {
  if (!preferences) {
    localStorage.removeItem(CACHED_PREFERENCES_KEY);
    return;
  }
  try {
    localStorage.setItem(CACHED_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Could not cache preferences to localStorage:', e);
  }
}

export function clearCachedPreferences() {
  try {
    localStorage.removeItem(CACHED_PREFERENCES_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Get authorization headers for JSON requests
 */
function getAuthHeaders() {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch current user's preferences
 * Backend: GET /api/preferences/me
 * Returns: { success: true, exists: true, preferences: data }
 * or { success: true, exists: false, preferences: null } on 404 (not filled yet)
 * or falls back to local cache when offline or encountering auth status (401/403)
 */
export async function getPreferences() {
  const token = getToken();
  if (!token) {
    const cached = getCachedPreferences();
    if (cached) {
      return { success: true, exists: true, preferences: cached, isMock: true };
    }
    return { success: true, exists: false, preferences: null, isMock: true };
  }

  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      // 404 means "not filled yet", not an error
      return { success: true, exists: false, preferences: null, isMock: false };
    }

    if (response.status === 401 || response.status === 403) {
      console.warn(`Preferences API returned ${response.status} (unauthorized/forbidden or demo token). Using local cache/state.`);
      const cached = getCachedPreferences();
      if (cached) {
        return { success: true, exists: true, preferences: cached, isMock: true };
      }
      // If no preferences filled yet, return exists: false so user can set them!
      return { success: true, exists: false, preferences: null, isMock: true };
    }

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Failed to load preferences';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedPreferences(data);
    return { success: true, exists: true, preferences: data, isMock: false };
  } catch (error) {
    console.warn('Backend getPreferences error:', error.message);
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('401') ||
      error.message.includes('403')
    ) {
      const cached = getCachedPreferences();
      if (cached) {
        return { success: true, exists: true, preferences: cached, isMock: true };
      }
      return { success: true, exists: false, preferences: null, isMock: true };
    }
    throw error;
  }
}

/**
 * Create or update current user's preferences
 * Backend: PUT /api/preferences/me
 * @param {Object} preferencesData
 * @returns {Promise<{ success: boolean, preferences: Object, isMock?: boolean }>}
 */
export async function savePreferences(preferencesData) {
  const token = getToken();

  // If no token or demo token, save locally
  if (!token || token.startsWith('mock_jwt_token_')) {
    setCachedPreferences(preferencesData);
    return { success: true, preferences: preferencesData, isMock: true };
  }

  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferencesData),
    });

    if (response.status === 400) {
      // 400 is a validation error from server (e.g. max budget below min)
      const errText = await response.text();
      let errorMsg = 'Invalid preferences data';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || 'Bad Request';
      }
      throw new Error(errorMsg);
    }

    if (response.status === 401 || response.status === 403) {
      console.warn(`Preferences PUT returned ${response.status}. Saving preferences to local cache.`);
      setCachedPreferences(preferencesData);
      return { success: true, preferences: preferencesData, isMock: true };
    }

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Failed to save preferences';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedPreferences(data);
    return { success: true, preferences: data, isMock: false };
  } catch (error) {
    // If it's a 400 validation error, bubble it up so the user sees it
    if (error.message && (
      error.message.includes('budgetMax cannot be less than budgetMin') ||
      error.message.includes('moveInDate cannot be in the past') ||
      error.message.includes('Unknown deal-breaker') ||
      error.message.includes('cannot be null') ||
      error.message.includes('must be')
    )) {
      throw error;
    }

    console.warn('Backend savePreferences error, saving to local cache:', error.message);
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('401') ||
      error.message.includes('403')
    ) {
      setCachedPreferences(preferencesData);
      return { success: true, preferences: preferencesData, isMock: true };
    }
    throw error;
  }
}
