// utils/getUserById.js
// SecureStore functionality moved to jwtUtils

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Removed getSecureToken - use processToken from jwtUtils instead

export const getUserById = async (refreshToken) => {
  try {
    console.log("🔵 getUserById: Fetching user data");
    console.log("   Exchanging refreshToken for accessToken");
    
    const response = await fetch(
      `${API_BASE_URL}/getAccessToken?t=${Date.now()}`,
      {
        method: 'POST',
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          "Authorization": `Bearer`,  // ⚠️ Web app uses empty Bearer (no token value)
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Response is the accessToken as a plain string (JWT) - strip quotes if present
    const rawAccessToken = await response.text();
    const accessToken = rawAccessToken.replace(/^"+|"+$/g, "");
    console.log("✅ getUserById success - got accessToken");
    console.log("   Token:", accessToken.substring(0, 50) + "...");
    return accessToken;
  } catch (error) {
    console.error("❌ getUserById Error:", error.message);
    throw error;
  }
};

// ... copy similar logic for getUserByIdInvite and getUserByIdSSO
// utilizing getSecureToken("refresh_token") instead of cookie splitting