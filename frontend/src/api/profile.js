import { getToken } from './auth';

const API_BASE = '/api/profile';

/**
 * Get authorization headers for JSON or Multipart requests
 */
function getAuthHeaders(isMultipart = false) {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

const CACHED_PROFILE_KEY = 'roomie_user_profile';

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(CACHED_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCachedProfile(profile) {
  if (!profile) {
    localStorage.removeItem(CACHED_PROFILE_KEY);
    return;
  }
  localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
}

export function clearCachedProfile() {
  localStorage.removeItem(CACHED_PROFILE_KEY);
}

/**
 * Fetch current user's profile
 * Backend: GET /api/profile/me
 * Returns: ProfileResponse if exists, or 404 if not created yet
 */
export async function getProfile() {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, exists: false, profile: null };
    }

    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      // Profile has not been created yet
      return { success: true, exists: false, profile: null, isMock: false };
    }

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Failed to load profile';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedProfile(data);
    return { success: true, exists: true, profile: data, isMock: false };
  } catch (error) {
    console.warn('Backend getProfile error, checking local/demo cache:', error.message);
    // If backend is offline or unreachable, fall back to cached local profile
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('401')
    ) {
      const cached = getCachedProfile();
      if (cached) {
        return { success: true, exists: true, profile: cached, isMock: true };
      }
      return { success: true, exists: false, profile: null, isMock: true };
    }
    throw error;
  }
}

/**
 * Create or update user profile
 * Backend: PUT /api/profile/me
 * Payload: ProfileRequest
 */
export async function saveProfile(profileData) {
  try {
    const payload = {
      name: profileData.name ? profileData.name.trim() : '',
      age: Number(profileData.age),
      gender: profileData.gender,
      city: profileData.city ? profileData.city.trim() : '',
      occupation: profileData.occupation,
      organization: profileData.organization ? profileData.organization.trim() : null,
      bio: profileData.bio ? profileData.bio.trim() : null,
      workLabel: profileData.workLabel ? profileData.workLabel.trim() : null,
      workLat: profileData.workLat !== undefined && profileData.workLat !== null && profileData.workLat !== '' 
        ? Number(profileData.workLat) 
        : null,
      workLng: profileData.workLng !== undefined && profileData.workLng !== null && profileData.workLng !== '' 
        ? Number(profileData.workLng) 
        : null,
    };

    // Note: Backend requires both workLat & workLng or neither
    if ((payload.workLat == null) !== (payload.workLng == null)) {
      payload.workLat = null;
      payload.workLng = null;
    }

    const response = await fetch(`${API_BASE}/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Failed to save profile';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedProfile(data);
    return { success: true, profile: data, isMock: false };
  } catch (error) {
    console.warn('Backend saveProfile failed or offline:', error.message);
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('401')
    ) {
      // Local/demo fallback
      const cached = getCachedProfile() || {};
      const mockProfile = {
        userId: 'local_user_' + Date.now(),
        ...cached,
        ...profileData,
        age: Number(profileData.age),
        emailVerified: true,
        createdAt: cached.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCachedProfile(mockProfile);
      return { success: true, profile: mockProfile, isMock: true };
    }
    throw error;
  }
}

/**
 * Upload profile photo
 * Backend: POST /api/profile/me/photo (multipart/form-data: part "photo")
 */
export async function uploadProfilePhoto(file) {
  try {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/me/photo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Failed to upload photo';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    setCachedProfile(data);
    return { success: true, profile: data, isMock: false };
  } catch (error) {
    console.warn('Backend uploadProfilePhoto failed, fallback to local URL preview:', error.message);
    const cached = getCachedProfile() || {};
    const localUrl = URL.createObjectURL(file);
    const updated = {
      ...cached,
      photoUrl: localUrl,
    };
    setCachedProfile(updated);
    return { success: true, profile: updated, isMock: true };
  }
}

/**
 * Delete profile photo
 * Backend: DELETE /api/profile/me/photo
 */
export async function deleteProfilePhoto() {
  try {
    const response = await fetch(`${API_BASE}/me/photo`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to delete photo');
    }

    const data = await response.json();
    setCachedProfile(data);
    return { success: true, profile: data, isMock: false };
  } catch (error) {
    console.warn('Backend deleteProfilePhoto failed or offline:', error.message);
    const cached = getCachedProfile() || {};
    const updated = {
      ...cached,
      photoUrl: null,
    };
    setCachedProfile(updated);
    return { success: true, profile: updated, isMock: true };
  }
}
