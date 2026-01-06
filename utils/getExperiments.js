/**
 * Experiment Management Utilities - Matches tg-application exactly
 * Uses axios for HTTP requests (same as working implementation)
 */

import axios from 'axios';
import { getAccessToken } from './getAccessToken';
import { getItem } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Debug: Log env vars at module load
console.log('🔧 [getExperiments] Module loaded with config:');
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'MISSING');

/**
 * ⭐ CRITICAL: Flatten DynamoDB AttributeValue format to simple values
 * Matches tg-application's flattenAttributes in jwtUtils.js
 * DynamoDB returns: { experimentID: { S: "uuid" }, count: { N: "5" } }
 * We need:          { experimentID: "uuid", count: 5 }
 */
const flattenAttributes = (item) => {
  // If item is an array, process each element
  if (Array.isArray(item)) {
    return item.map((singleItem) => flattenAttributes(singleItem));
  }

  // If item is not an object, return as is
  if (typeof item !== 'object' || item === null) {
    return item;
  }

  // Check if the item is already flattened (doesn't have DynamoDB AttributeValue structure)
  const hasDynamoDBStructure = Object.values(item).some(
    (value) =>
      value &&
      typeof value === 'object' &&
      (value.S !== undefined ||
        value.N !== undefined ||
        value.BOOL !== undefined ||
        value.NULL !== undefined)
  );

  // If already flattened, return as is
  if (!hasDynamoDBStructure) {
    return item;
  }

  const flattened = {};
  for (const key in item) {
    if (item[key]?.S !== undefined) {
      flattened[key] = item[key].S; // String
    } else if (item[key]?.N !== undefined) {
      flattened[key] = parseFloat(item[key].N); // Number
    } else if (item[key]?.BOOL !== undefined) {
      flattened[key] = item[key].BOOL; // Boolean
    } else if (item[key]?.NULL !== undefined) {
      flattened[key] = null; // Null
    } else {
      flattened[key] = item[key]; // Other (unchanged)
    }
  }
  return flattened;
};

// Helper to get auth token - matches tg-application flow exactly
const getAuthToken = async () => {
  try {
    // Priority order matches tg-application: refresh_token_company -> refresh_token -> refresh_auth_token
    const refreshTokenCompany = await getItem('refresh_token_company');
    console.log('🔍 [getAuthToken] refresh_token_company:', refreshTokenCompany ? `${refreshTokenCompany.substring(0, 20)}...` : 'null');
    
    const refreshToken = await getItem('refresh_token');
    console.log('🔍 [getAuthToken] refresh_token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
    
    const refreshAuthToken = await getItem('refresh_auth_token');
    console.log('🔍 [getAuthToken] refresh_auth_token:', refreshAuthToken ? `${refreshAuthToken.substring(0, 20)}...` : 'null');
    
    // Use priority order: company token first, then user token, then auth token
    const token = refreshTokenCompany || refreshToken || refreshAuthToken;
    
    if (token) {
      console.log('🔍 [getAuthToken] Using token:', token.substring(0, 30) + '...');
      const accessToken = await getAccessToken(token);
      return accessToken;
    }
    console.warn('[getAuthToken] No refresh token found in storage');
    return null;
  } catch (err) {
    console.warn('[getExperiments] Could not get access token:', err.message);
    return null;
  }
};

/**
 * Get all experiments for current company
 * Matches tg-application: getExperiments function
 * Uses POST endpoint with JWT token in request body
 */
export const getAllExperiments = async (companyID) => {
  try {
    console.log("🔵 getAllExperiments: Fetching experiments for company");
    
    if (!companyID) {
      console.warn('[getAllExperiments] No companyID provided');
      return { experiments: [] };
    }

    const accessToken = await getAuthToken();
    
    // ⭐ CRITICAL: API_KEY validation
    if (!API_KEY) {
      console.error('❌ [getAllExperiments] CRITICAL: x-api-key is not set!');
      console.error('   Check your .env file for EXPO_PUBLIC_API_KEY');
      return { experiments: [] };
    }

    // ⭐ CRITICAL: accessToken validation
    if (!accessToken) {
      console.error('❌ [getAllExperiments] CRITICAL: accessToken is null/undefined!');
      console.error('   Token exchange may have failed');
      return { experiments: [] };
    }

    // Debug: Log full token info
    console.log('🔍 [getAllExperiments] Token debug:');
    console.log('   accessToken length:', accessToken?.length);
    console.log('   accessToken type:', typeof accessToken);
    console.log('   accessToken starts with ey:', accessToken?.startsWith('ey'));
    console.log('   accessToken first 100 chars:', accessToken?.substring(0, 100));
    
    const requestUrl = `${API_BASE_URL}/experimentByCompany?t=${Date.now()}&sendHash=true`;
    const requestHeaders = {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };

    console.log('🔍 [getAllExperiments] Making API request:');
    console.log('   URL:', requestUrl);
    console.log('   Method: GET');
    console.log('   Full headers object:', JSON.stringify(requestHeaders, null, 2));

    // ⭐ MATCHES tg-application exactly:
    // axios.get with all three required headers: x-api-key, Content-Type, Authorization
    const response = await axios.get(requestUrl, {
      headers: requestHeaders,
    });

    console.log('✅ [getAllExperiments] Response received');
    console.log('   Status:', response.status);
    console.log('   Data type:', typeof response.data);
    console.log('   Is array:', Array.isArray(response.data));
    
    // ⭐ CRITICAL: Flatten DynamoDB AttributeValue format
    // tg-application does this in jwtUtils.js verifyResponseSecurity
    const rawData = response.data;
    
    if (rawData && rawData.data && rawData.data.experiments) {
      // Response structure: { data: { experiments: [...] } }
      const flattenedExperiments = flattenAttributes(rawData.data.experiments);
      console.log('✅ [getAllExperiments] Flattened experiments from data.experiments');
      console.log('   Count:', flattenedExperiments.length);
      if (flattenedExperiments.length > 0) {
        console.log('   First experiment ID:', flattenedExperiments[0]?.experimentID);
      }
      return { experiments: flattenedExperiments };
    } else if (rawData && rawData.experiments) {
      // Response structure: { experiments: [...] }
      const flattenedExperiments = flattenAttributes(rawData.experiments);
      console.log('✅ [getAllExperiments] Flattened experiments from experiments');
      console.log('   Count:', flattenedExperiments.length);
      if (flattenedExperiments.length > 0) {
        console.log('   First experiment ID:', flattenedExperiments[0]?.experimentID);
      }
      return { experiments: flattenedExperiments };
    } else if (Array.isArray(rawData)) {
      // Response is direct array
      const flattenedExperiments = flattenAttributes(rawData);
      console.log('✅ [getAllExperiments] Flattened direct array');
      console.log('   Count:', flattenedExperiments.length);
      return { experiments: flattenedExperiments };
    }
    
    // Return as-is if structure unknown
    console.warn('⚠️ [getAllExperiments] Unknown response structure, returning raw');
    return rawData;
  } catch (error) {
    console.error('❌ getAllExperiments Error:', error.message);
    
    if (error.response) {
      // The request was made and server responded with error status
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
      console.error('   Response headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // Request made but no response received
      console.error('   No response received');
      console.error('   Request details:', error.request);
    } else {
      // Error setting up request
      console.error('   Error setting up request:', error.message);
    }
    
    throw error;
  }
};

/**
 * Get specific experiment by ID
 * Matches tg-application: getExperimentById function
 * Uses POST endpoint with JWT token in request body
 * 
 * Can be called with either:
 * - getExperimentById(tokenPayload, currentCompany) - Full signature
 * - getExperimentById(experimentId) - Simplified for backward compatibility
 */
export const getExperimentById = async (tokenPayloadOrId, currentCompany) => {
  try {
    console.log("🔵 getExperimentById: Fetching experiment by ID");
    
    const accessToken = await getAuthToken();
    
    if (!accessToken) {
      console.warn('[getExperimentById] No access token available');
      return null;
    }

    // Handle both call signatures:
    // 1. getExperimentById(tokenPayload, currentCompany) - Full tg-app signature
    // 2. getExperimentById(experimentId) - Simplified signature
    let tokenPayload = tokenPayloadOrId;
    
    // If called with just experimentId, create a simple payload
    if (typeof tokenPayloadOrId === 'string') {
      tokenPayload = { experimentID: tokenPayloadOrId };
    }

    console.log('   Token Payload:', tokenPayload);
    
    // Check permissions only if currentCompany is provided
    if (currentCompany && !currentCompany.access_experiments_by_company && !currentCompany.access_experiments_by_user) {
      console.warn('[getExperimentById] User does not have permission to access experiments');
      return null;
    }

    // Note: In tg-application, getExperimentById uses generateToken(tokenPayload, Token)
    // For now, we'll pass the tokenPayload as-is
    // If this fails, we need to implement generateToken from jwtUtils

    console.log('🔍 [getExperimentById] Making API request:');
    console.log('   URL:', `${API_BASE_URL}/experiment/get?t=${Date.now()}`);
    console.log('   Method: POST');
    
    // ⭐ MATCHES tg-application exactly:
    // axios.post with experimentByIdToken in body and all three required headers
    const response = await axios.post(
      `${API_BASE_URL}/experiment/get?t=${Date.now()}`,
      {
        experimentByIdToken: tokenPayload,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    console.log('✅ [getExperimentById] Response received');
    console.log('   Status:', response.status);
    
    // axios automatically returns response.data
    return response.data;
  } catch (error) {
    console.error('❌ getExperimentById Error:', error.message);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received');
    } else {
      console.error('   Error setting up request:', error.message);
    }
    
    throw error;
  }
};