/**
 * Dataset Management Utilities - Matches tg-application exactly
 * Uses axios for HTTP requests with /datasetByCompany endpoint
 */

import axios from 'axios';
import { getItem } from './storage';
import { getAccessToken } from './getAccessToken';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

/**
 * ⭐ CRITICAL: Flatten DynamoDB AttributeValue format to simple values
 * Matches tg-application's flattenAttributes in jwtUtils.js
 * DynamoDB returns: { datasetID: { S: "uuid" }, count: { N: "5" } }
 * We need:          { datasetID: "uuid", count: 5 }
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
    // Priority order matches tg-application
    const refreshTokenCompany = await getItem('refresh_token_company');
    const refreshToken = await getItem('refresh_token');
    const refreshAuthToken = await getItem('refresh_auth_token');
    
    // Use priority order: company token first, then user token, then auth token
    const token = refreshTokenCompany || refreshToken || refreshAuthToken;
    
    if (token) {
      const accessToken = await getAccessToken(token);
      return accessToken;
    }
    console.warn('[getDatasets] No refresh token found in storage');
    return null;
  } catch (err) {
    console.warn('[getDatasets] Could not get access token:', err.message);
    return null;
  }
};

/**
 * Get all datasets for current company
 * ⭐ MATCHES tg-application: src/utils/getDatasets.js
 * Uses GET endpoint /datasetByCompany (NOT extracting from experiments!)
 */
export const getDatasets = async (userID) => {
  try {
    console.log('🔵 [getDatasets] Fetching datasets from API');
    
    const accessToken = await getAuthToken();
    
    if (!API_KEY) {
      console.error('❌ [getDatasets] CRITICAL: x-api-key is not set!');
      return { datasets: [] };
    }

    if (!accessToken) {
      console.error('❌ [getDatasets] CRITICAL: accessToken is null/undefined!');
      return { datasets: [] };
    }

    // ⭐ MATCHES tg-application exactly:
    // GET /datasetByCompany with sendHash=true
    const requestUrl = `${API_BASE_URL}/datasetByCompany?t=${Date.now()}&sendHash=true`;
    const requestHeaders = {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };

    console.log('🔍 [getDatasets] Making API request:');
    console.log('   URL:', requestUrl);

    const response = await axios.get(requestUrl, {
      headers: requestHeaders,
    });

    console.log('✅ [getDatasets] Response received');
    console.log('   Status:', response.status);
    console.log('   Data type:', typeof response.data);

    // ⭐ CRITICAL: Flatten DynamoDB AttributeValue format
    const rawData = response.data;
    
    if (rawData && rawData.data && rawData.data.datasets) {
      const flattenedDatasets = flattenAttributes(rawData.data.datasets);
      console.log('✅ [getDatasets] Flattened datasets:', flattenedDatasets.length);
      return { datasets: flattenedDatasets };
    } else if (rawData && rawData.datasets) {
      const flattenedDatasets = flattenAttributes(rawData.datasets);
      console.log('✅ [getDatasets] Flattened datasets:', flattenedDatasets.length);
      return { datasets: flattenedDatasets };
    } else if (Array.isArray(rawData)) {
      const flattenedDatasets = flattenAttributes(rawData);
      console.log('✅ [getDatasets] Flattened direct array:', flattenedDatasets.length);
      return { datasets: flattenedDatasets };
    }
    
    console.warn('⚠️ [getDatasets] Unknown response structure');
    return rawData;
  } catch (error) {
    console.error('❌ [getDatasets] Error:', error.message);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Get all datasets - alias for consistency
 */
export const getAllDatasets = getDatasets;

export default { getDatasets, getAllDatasets };
