// Simple rate limiter for OTP requests
// Stores rate limit data in localStorage for persistence across page refreshes

const RATE_LIMIT_KEY = "otp_rate_limit";
const MAX_REQUESTS = 3; // Maximum OTP requests allowed
const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

export const checkRateLimit = (email) => {
  const now = Date.now();
  const key = `${RATE_LIMIT_KEY}_${email.toLowerCase()}`;

  try {
    // Get existing rate limit data from localStorage
    const storedData = localStorage.getItem(key);
    let requests = [];

    if (storedData) {
      try {
        requests = JSON.parse(storedData);
      } catch (e) {
        // If parsing fails, start fresh
        requests = [];
      }
    }

    // Filter out old requests outside the time window
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < TIME_WINDOW
    );

    // Check if limit exceeded
    if (recentRequests.length >= MAX_REQUESTS) {
      const oldestRequest = recentRequests[0];
      const retryAfter = Math.ceil(
        (TIME_WINDOW - (now - oldestRequest)) / 1000
      );

      return {
        allowed: false,
        retryAfter: Math.max(retryAfter, 60), // Minimum 60 seconds
      };
    }

    // Add current request
    recentRequests.push(now);

    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(recentRequests));

    return {
      allowed: true,
      remainingRequests: MAX_REQUESTS - recentRequests.length,
    };
  } catch (error) {
    // If localStorage fails, allow the request (fail open)
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }
};
