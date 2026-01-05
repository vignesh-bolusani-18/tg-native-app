/**
 * Experiment Management Utilities
 */

import { apiConfig } from './apiConfig';

export const getExperimentById = async (experimentId) => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/get-experiment/${experimentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${apiConfig.baseURL}/get-experiments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyID }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error getting experiments:', error);
    return [];
  }
};
