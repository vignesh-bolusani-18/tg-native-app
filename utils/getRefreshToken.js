// utils/getRefreshToken.js
// ⭐ CRITICAL - Get refresh_token_company from backend for selected company
// Stores company-specific refresh token in storage as "refresh_token_company"

import { getItem, setItem } from './storage';
import { apiProxyFetch } from './apiProxy';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Get token from storage (platform-agnostic)
const getStoredToken = async (key) => {
  try {
    return await getItem(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

// Set token in storage (platform-agnostic)
const setStoredItem = async (key, value) => {
  try {
    await setItem(key, value);
    console.log(`✅ Stored ${key}`);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

export const getRefreshToken = async (companyID) => {
  try {
    console.log("🔵 getRefreshToken: Getting company-specific refresh token");
    console.log("   Company ID:", companyID);
    
    const refreshAuthToken = await getStoredToken("refresh_auth_token");
    const refreshToken = await getStoredToken("refresh_token");
    const token = refreshAuthToken || refreshToken;

    if (!token) {
      throw new Error("No refresh token available");
    }
    
    console.log("   Using token type:", refreshAuthToken ? "refresh_auth_token" : "refresh_token");
    console.log("   Token:", token.substring(0, 30) + "...");

    const endpoint = `/getAuthToken?t=${Date.now()}`;
    console.log("   Endpoint path:", endpoint);
    console.log("   Request body:", JSON.stringify({ companyID }));

    const response = await apiProxyFetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ companyID }),
    });

    console.log("   Response status:", response.status);
    console.log("   Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Response body:", errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Company refresh token received:", JSON.stringify(data, null, 2));
    
    // Store company-specific refresh token
    if (data.refreshToken) {
      await setStoredItem("refresh_token_company", data.refreshToken);
      console.log("   ✅ Stored refresh_token_company");
    }
    
    // Also store companyID for reference
    await setStoredItem("companyID", companyID);
    console.log("   ✅ Stored companyID");

    return data;
  } catch (error) {
    console.error("❌ getRefreshToken Error:", error.message);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};
