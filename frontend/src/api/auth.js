// API service for Flatmate Finder (roomie.)
const API_BASE = '/api/auth';

// Helper to convert object to URLSearchParams for Spring @RequestParam compatibility
function toFormData(data) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  }
  return params;
}

// Token management in localStorage
export const getToken = () => localStorage.getItem('roomie_token');
export const setToken = (token) => localStorage.setItem('roomie_token', token);
export const removeToken = () => localStorage.removeItem('roomie_token');

export const getCurrentUser = () => {
  const userJson = localStorage.getItem('roomie_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (user) => {
  localStorage.setItem('roomie_user', JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem('roomie_user');
};

/**
 * Register a new user
 * Spring Backend: POST /api/auth/register (params: email, password)
 */
export async function registerUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toFormData({ email, password }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Registration failed';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || `Error ${response.status}: Failed to register`;
      }
      throw new Error(errorMsg);
    }

    const message = await response.text();
    return { success: true, message, isMock: false };
  } catch (error) {
    // If backend connection refused or fails, support simulated mode with clear notice
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Backend server is not reachable at localhost:8080. Using simulated verification flow for demo testing.');
      return {
        success: true,
        message: `[Demo Mode] A verification code was simulated for ${email}. You can use code 123456 to verify.`,
        isMock: true
      };
    }
    throw error;
  }
}

/**
 * Verify OTP
 * Spring Backend: POST /api/auth/verify-otp (params: email, otp)
 */
export async function verifyOtp(email, otp) {
  try {
    const response = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toFormData({ email, otp }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Invalid or expired OTP code';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || 'Verification failed';
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Email verified successfully!', isMock: false };
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      if (otp === '123456' || otp.length === 6) {
        return {
          success: true,
          message: '[Demo Mode] Email verified successfully! You can now log in.',
          isMock: true
        };
      }
      throw new Error('Demo code is 123456 (or backend server is offline)');
    }
    throw error;
  }
}

/**
 * Resend OTP
 * Spring Backend: POST /api/auth/resend-otp (params: email)
 */
export async function resendOtp(email) {
  try {
    const response = await fetch(`${API_BASE}/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toFormData({ email }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to resend OTP');
    }

    const data = await response.json();
    return { success: true, message: data.message || 'New code sent!', isMock: false };
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        success: true,
        message: '[Demo Mode] A new code has been simulated. Enter 123456 to continue.',
        isMock: true
      };
    }
    throw error;
  }
}

/**
 * Log In
 * Spring Backend: POST /api/auth/login (params: email, password)
 * Returns JWT token string
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toFormData({ email, password }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = 'Invalid email or password';
      try {
        const json = JSON.parse(errText);
        errorMsg = json.message || json.error || errText;
      } catch {
        errorMsg = errText || 'Login failed';
      }
      throw new Error(errorMsg);
    }

    const token = await response.text();
    setToken(token);
    const user = {
      email,
      name: email.split('@')[0],
      isVerified: true,
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(user);

    return { success: true, token, user, isMock: false };
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      // Demo login fallback
      console.warn('Backend server is not reachable at localhost:8080. Logging in with simulated JWT token.');
      const simulatedToken = 'mock_jwt_token_' + btoa(email) + '_' + Date.now();
      setToken(simulatedToken);
      const user = {
        email,
        name: email.split('@')[0],
        isVerified: true,
        lastLogin: new Date().toISOString(),
        isDemo: true
      };
      setCurrentUser(user);
      return { success: true, token: simulatedToken, user, isMock: true };
    }
    throw error;
  }
}

/**
 * Check backend connection status
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/auth/login', { 
      method: 'OPTIONS',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.status < 500;
  } catch (e) {
    return false;
  }
}
