// utils/getAccessToken.js
// ⭐ CRITICAL - Exchange refreshToken for accessToken (matches tg-application exactly)
// This is required BEFORE making any API calls to /companies, /company, etc.

import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const getAccessToken = async (refreshToken) => {
  try {
    console.log("🔵 getAccessToken: Exchanging refreshToken for accessToken");
    console.log("   Endpoint: POST /getAccessToken");
    
    if (!refreshToken) {
      throw new Error("No refreshToken provided");
    }
    
    console.log("   refreshToken:", refreshToken.substring(0, 30) + "...");

    const response = await axios.post(
      `${API_BASE_URL}/getAccessToken?t=${Date.now()}`,
      {
        refreshToken
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          "Authorization": "Bearer",
        },
      }
    );

    console.log("   Response status:", response.status);
    console.log("   Response data type:", typeof response.data);
    console.log("   Response data raw:", JSON.stringify(response.data));

    // axios returns response.data directly (already parsed JSON)
    let accessToken = response.data;
    
    // Handle case where response might be JSON object with token inside
    if (typeof accessToken === 'object' && accessToken !== null) {
      console.log("   Response is object, checking for token property...");
      console.log("   Object keys:", Object.keys(accessToken));
      // Try common token property names
      accessToken = accessToken.token || accessToken.accessToken || accessToken.data || JSON.stringify(accessToken);
    }
    
    // Handle case where token is wrapped in quotes
    if (typeof accessToken === 'string') {
      accessToken = accessToken.trim();
      if ((accessToken.startsWith('"') && accessToken.endsWith('"')) || 
          (accessToken.startsWith("'") && accessToken.endsWith("'"))) {
        accessToken = accessToken.slice(1, -1);
        console.log("   Stripped surrounding quotes from token");
      }
    }
    
    console.log("✅ accessToken obtained!");
    console.log("   accessToken type:", typeof accessToken);
    console.log("   accessToken length:", accessToken?.length);
    console.log("   accessToken:", accessToken?.substring(0, 50) + "...");
    console.log("   Token starts with 'ey':", accessToken?.startsWith('ey') ? "✅ Valid JWT format" : "❌ Suspicious format");
    
    return accessToken;
  } catch (error) {
    console.error("❌ getAccessToken Error:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
    throw error;
  }
};
