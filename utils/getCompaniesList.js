// utils/getCompaniesList.js
// Fetch list of companies for authenticated user

import { apiProxyFetch } from './apiProxy';
import { getUserById } from './getUserById';
import { getItem } from './storage';

// Get token from storage (platform-agnostic)
const getStoredToken = async (key) => {
  try {
    return await getItem(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

// Get fresh access token using refresh token (matches web app flow)
const getFreshAccessToken = async () => {
  try {
    // Try refresh_auth_token first, then refresh_token
    const refreshToken = await getStoredToken("refresh_auth_token") || await getStoredToken("refresh_token");
    
    if (!refreshToken) {
      console.warn("⚠️ No refresh token found, falling back to stored access token");
      return await getStoredToken("token");
    }
    
    console.log("🔄 Exchanging refresh token for fresh access token...");
    const freshToken = await getUserById(refreshToken);
    return freshToken;
  } catch (error) {
    console.error("❌ Failed to get fresh token:", error.message);
    // Fallback to stored token
    return await getStoredToken("token");
  }
};

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const getCompaniesList = async (authToken = null) => {
  try {
    console.log("🔵 getCompaniesList: Fetching companies");
    console.log("   Endpoint: /companies");
    
    // Use passed token or fetch a FRESH token (prevents replay detection)
    const token = authToken || await getFreshAccessToken();

    if (!token) {
      throw new Error("No authentication token found");
    }
    
    // Strip any accidental wrapping quotes
    const cleanToken = token.replace(/^"+|"+$/g, "");
    console.log("   Token found:", cleanToken.substring(0, 30) + "...");
    
    // Decode token to verify it has email (CRITICAL for backend)
    try {
      const tokenParts = cleanToken.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        
        if (header.kid) {
          console.log("   ❌ Token type: Cognito JWT (has kid) - WRONG!");
        } else {
          console.log("   ✅ Token type: Backend JWT (accessToken) - CORRECT!");
        }
        
        // CRITICAL: Backend needs email in token payload
        console.log("   Token email:", payload.email || payload.userEmail || "❌ MISSING!");
        console.log("   Token userID:", payload.userID || payload.sub || "unknown");
        
        if (!payload.email && !payload.userEmail) {
          console.error("   ⚠️⚠️⚠️ WARNING: Token missing email field! Backend will fail!");
        }
      }
    } catch (_decodeError) {
      console.log("   Could not decode token (might be opaque token)");
    }
    
    // Backend reads email from token payload, NOT from query params
    const endpoint = `/companies?t=${Date.now()}&sendHash=true`;
    console.log("   Endpoint path:", endpoint);

    const response = await apiProxyFetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    console.log("   Response status:", response.status);
    console.log("   Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Response body:", errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Companies fetched successfully:", data.companies?.length || 0, "companies");
    return data;
  } catch (error) {
    console.error("❌ getCompaniesList Error:", error.message);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};
