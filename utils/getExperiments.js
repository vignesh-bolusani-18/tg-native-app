/**
 * Experiment Management Utilities
 */

import { apiConfig } from './apiConfig';
import { getItem } from './storage';
import { getAccessToken } from './getAccessToken';

// Helper to get auth token
const getAuthToken = async () => {
  try {
    const refreshTokenCompany = await getItem('refresh_token_company');
    const refreshToken = refreshTokenCompany || await getItem('refresh_token') || await getItem('refresh_auth_token');
    
    if (refreshToken) {
      const accessToken = await getAccessToken(refreshToken);
      return accessToken;
    }
    return null;
  } catch (err) {
    console.warn('[getExperiments] Could not get access token:', err.message);
    return null;
  }
};

export const getExperimentById = async (experimentId) => {
  try {
    const accessToken = await getAuthToken();
    const response = await fetch(`${apiConfig.baseURL}/get-experiment/${experimentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error getting experiment:', error);
    return null;
  }
};

export const getAllExperiments = async (companyID) => {
  try {
    if (!companyID) {
      console.warn('[getAllExperiments] No companyID provided');
      return { experiments: [] };
    }

    const accessToken = await getAuthToken();
    const timestamp = Date.now();
    
    // Use the correct endpoint: /experimentByCompany with companyID parameter
    const response = await fetch(
      `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiConfig.apiKey || '',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      }
    );
    
    if (!response.ok) {
      console.warn('[getAllExperiments] Response not OK:', response.status);
      return { experiments: [] };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting experiments:', error);
    return { experiments: [] };
  }
};