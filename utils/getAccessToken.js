// utils/getAccessToken.js
// ⭐ CRITICAL - Exchange refreshToken for accessToken
// This is required BEFORE making any API calls to /companies, /company, etc.

import { apiProxyFetch } from './apiProxy';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const getAccessToken = async (refreshToken) => {
  try {
    console.log("🔵 getAccessToken: Exchanging refreshToken for accessToken");
    console.log("   Endpoint: POST /getAccessToken");
    
    if (!refreshToken) {
      throw new Error("No refreshToken provided");
    }
    
    console.log("   refreshToken:", refreshToken.substring(0, 30) + "...");
    
    const endpoint = `/getAccessToken?t=${Date.now()}`;
    console.log("   Endpoint path:", endpoint);

    const response = await apiProxyFetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log("   Response status:", response.status);
    console.log("   Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Response body:", errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Response is the accessToken as a plain string (may come quoted) - strip quotes
    const rawAccessToken = await response.text();
    const accessToken = rawAccessToken.replace(/^"+|"+$/g, "");
    console.log("✅ accessToken obtained!");
    console.log("   accessToken:", accessToken.substring(0, 50) + "...");
    
    return accessToken;
  } catch (error) {
    console.error("❌ getAccessToken Error:", error.message);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};
