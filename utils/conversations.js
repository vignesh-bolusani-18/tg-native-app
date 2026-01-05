/**
 * Conversation Management Utilities
 */

import { apiConfig } from './apiConfig';

const getHeaders = (token) => {
  if (!apiConfig.apiKey) {
    console.warn("⚠️ Warning: API Key is missing in apiConfig. Check your .env file.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-api-key': apiConfig.apiKey,
  };
};

export const createConversation = async ({ token, userID, companyID }) => {
  try {
    const response = await fetch(`${apiConfig.apiBaseURL}/create-conversation`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ userID, companyID }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const getConversations = async ({ token }) => {
  try {
    // Updated to match the pattern of getConversationsByCompany
    // userID is extracted from token by backend
    const url = `${apiConfig.apiBaseURL}/conversationByUser?t=${Date.now()}&sendHash=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch conversations: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

export const getConversationsByCompany = async ({ token }) => {
  try {
    // Removed companyID from URL params as it's extracted from the token
    // Added timestamp and sendHash as per working web app
    const url = `${apiConfig.apiBaseURL}/conversationByCompany?t=${Date.now()}&sendHash=true`;
    
    // Debug logging disabled for production
    // console.log('Fetching conversations from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch conversations by company: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Only log warning instead of error to reduce console spam
    console.warn('getConversationsByCompany:', error.message);
    throw error;
  }
};

export const deleteConversation = async ({ token, conversationID }) => {
  try {
    const response = await fetch(`${apiConfig.apiBaseURL}/delete-conversation`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversationID }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const updateConversationTitle = async ({ token, conversationID, title }) => {
  try {
    const response = await fetch(`${apiConfig.apiBaseURL}/update-conversation-title`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversationID, title }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};

export const renameConversation = updateConversationTitle;
