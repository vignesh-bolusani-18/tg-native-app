/**
 * Credit Score Management
 */

import { apiConfig } from './apiConfig';

export const getCreditScore = async (companyID) => {
  try {
    // Use apiBaseURL (Main API) instead of baseURL (Vibe)
    const response = await fetch(`${apiConfig.apiBaseURL}/credits`, {
      method: 'GET', // Changed to GET as per documentation
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiConfig.apiKey,
        // Note: Authorization header should be added if token is available
      },
      // body: JSON.stringify({ companyID }), // GET requests don't have body
    });
    
    if (!response.ok) {
       console.warn(`getCreditScore failed: ${response.status}`);
       return 100; // Return default credits on failure to prevent UI lock
    }

    const data = await response.json();
    return data.credits || 100; // Default to 100
  } catch (error) {
    console.error('Error getting credit score:', error);
    return 100; // Default to 100 on error
  }
};

export const updateCredits = async (companyID, amount) => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/update-credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyID, amount }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating credits:', error);
    throw error;
  }
};
