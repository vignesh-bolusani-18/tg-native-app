// utils/validateUser.js
import { getItem } from './storage';
import { apiProxyFetch } from './apiProxy';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib";

// Helper to get token from storage (platform-agnostic)
const getStoredToken = async (name) => {
  try {
    return await getItem(name);
  } catch (e) {
    console.error("Storage Error:", e);
    return null;
  }
};

export const validateUser = async (authToken) => {
  try {
    console.log("🔵 validateUser: Validating token with backend");
    console.log("   Endpoint: GET /validateUser/validate");
    
    // Use passed token or fetch from storage if null
    const tokenToUse = authToken || await getStoredToken("token");

    if (!tokenToUse) {
      throw new Error("No token available for validation");
    }
    
    console.log("   Token found:", tokenToUse.substring(0, 30) + "...");
    
    const endpoint = `/validateUser/validate?t=${Date.now()}`;
    console.log("   Endpoint path:", endpoint);

    const response = await apiProxyFetch(endpoint, {
      method: 'GET',
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenToUse}`,
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
    console.log("✅ validateUser success:", data.isValidUser);
    return data;
  } catch (error) {
    console.error("❌ validateUser Error:", error.message);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};