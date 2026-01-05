// utils/createCompany.js
// Create a new company for authenticated user
// ⚠️ CRITICAL: Must sign payload with JWT using accessToken as secret

import { jws } from 'jsrsasign';
import { apiProxyFetch } from './apiProxy';
import { getItem } from './storage';

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

export const createCompany = async (payload, authToken = null) => {
  try {
    console.log("🔵 createCompany: Creating new company");
    console.log("   Payload:", JSON.stringify(payload, null, 2));
    console.log("   Endpoint: POST /company");
    
    // Validate payload has required fields
    if (!payload.companyName || !payload.userID) {
      throw new Error("Payload must contain companyName and userID");
    }
    
    // Use passed token or fetch from storage
    const token = authToken || await getStoredToken("token");

    if (!token) {
      throw new Error("No authentication token found");
    }
    // Strip accidental wrapping quotes
    const cleanToken = token.replace(/^"+|"+$/g, "");
    console.log("   Token found:", cleanToken.substring(0, 30) + "...");
    if (token !== cleanToken) {
      console.warn("   ⚠️ Token had wrapping quotes; cleaned before use");
    }
    
    // ⭐ CRITICAL: Sign the payload with JWT using accessToken as secret (EXACTLY like web app)
    console.log("   Signing payload with JWT (jsrsasign)...");
    const header = { alg: "HS256", typ: "JWT" };
    
    // ⭐⭐⭐ CRITICAL: Pass payload as OBJECT, not string (jsrsasign handles stringification)
    // Web app does: jws.JWS.sign(null, header, payload, key)
    // NOT: jws.JWS.sign(null, header, JSON.stringify(payload), key)
    const companyDataToken = jws.JWS.sign(null, header, payload, cleanToken);
    console.log("   companyDataToken:", companyDataToken.substring(0, 50) + "...");
    
    const endpoint = `/company?t=${Date.now()}`;
    console.log("   Endpoint path:", endpoint);

    const response = await apiProxyFetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({ companyDataToken }),
    });

    console.log("   Response status:", response.status);
    console.log("   Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Response body:", errorText);
      
      // ⭐ MATCHES WEB APP: Return null on 405 (freemium limit) instead of throwing
      if (response.status === 405) {
        console.warn("⚠️ Company creation blocked: Freemium workspace limit reached");
        return null;
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Company created successfully:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ createCompany Error:", error.message);
    console.error("   Error type:", error.constructor.name);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};
